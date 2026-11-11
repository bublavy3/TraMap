import puppeteer from "@cloudflare/puppeteer"

function reportResult(data, status = 200) {
  return Response.json(data, { status })
}

function wait(milliseconds) { // asynchronous waiting - function doesn't need to be async since Promise is asynchronous
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function launchHeadlessBrowser(binding) {
  for (let i = 0; ; i++) {
    try {
      return await puppeteer.launch(binding)
    } catch (error) {
      const rateLimited = error?.status === 429 || error?.message?.includes("429") && error?.message?.toLowerCase().includes("rate limit")   // the error.status does not seem to be set so it's also checked in error message
      if (!rateLimited || i > 3) {
        throw error
      }
      console.warn("Rate limit hit as there was another export recently, retrying in 20 seconds")
      await wait(20000) // Cloudflare's free tier allows only one headless browser instance launch per 20 seconds
    }
  }
}

// This is standard "workers" backend compatible with Cloudflare D1 database hosting
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)
      if (url.pathname === "/api/export" && request.method === "POST") {
        return exportMap(request, env, url)
      }
      if (url.pathname === "/api/projects" && request.method === "GET") {
        return searchProjects(url.searchParams.get("search") || "", env)
      }
      const match = url.pathname.match(/^\/api\/projects\/([A-Za-z0-9_-]+)(?:\/(background))?$/)
      // url must start with /api/projects/, afterwards all valid chars for project id are accepted, then optional /background
      if (!match) {
        return reportResult({ error: "URL not found" }, 404)
      }
      const projectId = match[1]; // full url would be aut match[0]
      const background = match[2];

      if (request.method === "GET") {
        if (background) {
          return getBackground(projectId, env)
        } else {
          return getProject(projectId, env)
        }
      } else if (request.method === "PUT") {
        return saveProject(request, projectId, env)
      }
      return reportResult({ error: "Method not implemented" }, 405)

    } catch (error) {
      console.error(error)
      return reportResult({ error: "Error in processing the request" }, 500)
    }
  },
}

async function exportMap(request, env, requestUrl) {
  const { format, project } = await request.json()
  if (!project || !project.stations) {
    return reportResult({ error: "Export request lacks data" }, 400)
  }

  let browser
  try {
    browser = await launchHeadlessBrowser(env.BROWSER)
    const page = await browser.newPage()
    // Puppeteer method to run function in page before setup runs, this function saves project (as projectData)
    // under browser window's global variable so that it can be accessed by the PrintExport.vue rendering page
    await page.evaluateOnNewDocument(projectData => {
      window.export_data = projectData
    }, project)
    await page.goto(new URL("/export", requestUrl).toString(), {
      waitUntil: "networkidle0", // Puppeteer setting to wait until network is idle for at least 500 ms, meaning OSM tiles have finished loading
      timeout: 60000
    })
    await page.waitForFunction(() => window.export_ready === true || window.export_error, { // export_ready signals that Leaflet layers are rendered
      timeout: 60000
    })
    // Node.js worker doesn't see browser's window.export_error variable, and JavaScript evaluates arguments before passing to function,
    // so function that will provide the variable once it can be evaluated is provided, where evaluate is accessing the browser's variable
    const renderError = await page.evaluate(() => window.export_error)
    if (renderError) {
      throw new Error(renderError)
    }

    const dimensions = await page.evaluate(() => {  // worker again cannot see inside headless browser page so has to use evaluate and wait for Puppeteer
      const map = document.querySelector(".print-map")  // the all-encompassing main div
      return {
        width: Math.ceil(map.getBoundingClientRect().width),
        height: Math.ceil(map.getBoundingClientRect().height)
      }
    })
    await page.setViewport({ // viewport just as large is set to display the whole area that should be exported with respect to export zoom level
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 1
    })
    const output = format === "pdf"
      ? await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          margin: { top: 0, right: 0, bottom: 0, left: 0 }
        })
      : await page.screenshot({
          type: "png",
          fullPage: true
      })

    return new Response(output, {
      headers: {
        "Content-Type": format === "pdf" ? "application/pdf" : "image/png",
        "Content-Disposition": `attachment; filename="tramap-export.${format}"`,  // treat response as downloadable file and suggest filename
        "Cache-Control": "no-store" // caching snapshot can result in new export reusing old snapshot
      }
    })
  } catch (error) {
    console.error("Map export failed", error) // I guess debugging this will come handy yet
    return reportResult({ error: "Could not render the map export" }, 500)
  } finally {
    await browser?.close()
  }
}

function validateObject(value) {
  return value !== null && typeof value === "object"
}

function validSnapshot(snapshot) {
  return snapshot !== null
      && typeof snapshot === "object"
      && (snapshot.mode === "osm" || snapshot.mode === "image")
      && validateObject(snapshot.stations)
      && validateObject(snapshot.junctions)
      && validateObject(snapshot.routes)
      && validateObject(snapshot.lines)
}

async function getProject(projectId, env) {
  const request = `SELECT snapshot, image_key, name, countries FROM projects WHERE id = '${projectId}'`
  const project = await env.DB.prepare(request).first() // .first() is just standard D1 API getter
  if (!project) {
    return reportResult({ error: "Project not found" }, 404)
  }

  return reportResult({
    id: projectId,
    ...JSON.parse(project.snapshot),
    name: project.name,
    countries: project.countries ? JSON.parse(project.countries) : [],
    imageUrl: project.image_key
      ? `/api/projects/${projectId}/background`
      : null,
  })
}

async function saveProject(content, projectId, env) {
  const form = await content.formData() // form enables accessing fields by name
  const name = form.get("name")
  if (!name) {
    return reportResult({ error: "Project name cannot be empty" }, 400)
  }
  let countries
  try {
    countries = JSON.parse(form.get("countries") || "[]")
  } catch {
    return reportResult({ error: "Project countries are not valid in JSON" }, 400)
  }
  const snapshotText = form.get("snapshot")
  let snapshot
  try {
    snapshot = JSON.parse(snapshotText)
  } catch {
    return reportResult({ error: "Provided snapshot is not valid in JSON" }, 400)
  }
  if (!validSnapshot(snapshot)) {
    return reportResult({ error: "The project snapshot has invalid data format" }, 400)
  }

  let request = `SELECT image_key FROM projects WHERE id = '${projectId}'`
  const existingProject = await env.DB.prepare(request).first()

  const image = form.get("backgroundImage")
  let imageKey = null
  let uploadedImageKey = null

  if (image != null && image.size > 0) {
    if (image.size > 25 * 1024 * 1024) {  // Workers KV values can be up to 25 MiB
      return reportResult({ error: "Background images cannot be larger than 25 MiB" }, 413)
    }

    uploadedImageKey = `${crypto.randomUUID()}`
    imageKey = uploadedImageKey
    await env.BACKGROUNDS.put(imageKey, image.stream(), {
      metadata: {
        contentType: image.type
      }
    })
  } else if (form.get("keepBackground") === "true" && existingProject?.image_key) {
    imageKey = existingProject.image_key  // saving with the same image doesn't write it again to KV
  } else if (form.get("copyBackground")) {
    request = `SELECT image_key FROM projects WHERE id = '${form.get("copyBackground")}'`
    const source = await env.DB.prepare(request).first()
    if (source.image_key) {
      const sourceImage = await env.BACKGROUNDS.getWithMetadata(source.image_key, "stream")
      uploadedImageKey = crypto.randomUUID()
      imageKey = uploadedImageKey
      await env.BACKGROUNDS.put(imageKey, sourceImage.value, {
        metadata: sourceImage.metadata,
      })
    }
  }

  request = `INSERT INTO projects (id, snapshot, image_key, last_update, name, countries)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             snapshot = excluded.snapshot,
             image_key = excluded.image_key,
             last_update = CURRENT_TIMESTAMP,
             name = excluded.name,
             countries = excluded.countries`
  await env.DB.prepare(request).bind(projectId, JSON.stringify(snapshot), imageKey, name, JSON.stringify(countries)).run()

  if (uploadedImageKey && existingProject?.image_key) {
    await env.BACKGROUNDS.delete(existingProject.image_key)
  }

  return reportResult({
    saved: true,
    id: projectId,
    name: name,
    countries: countries,
    imageUrl: imageKey ? `/api/projects/${projectId}/background` : null
  })
}

async function getBackground(projectId, env) {
  const request = `SELECT image_key FROM projects WHERE id = '${projectId}'`
  const project = await env.DB.prepare(request).first()
  if (!project?.image_key) {
    return reportResult({ error: "Background image not found" }, 404)
  }
  const image = await env.BACKGROUNDS.getWithMetadata(project.image_key, "stream")
  if (!image.value) {
    return reportResult({ error: "Background image not found" }, 404)
  }

  return new Response(image.value, {
    headers: {
      "Cache-Control": "no-store",  // TODO consider caching later so that the same image is not downloaded multiple times by users viewing the same map simultaneously
      "Content-Type": image.metadata?.contentType || "application/octet-stream"
    },
  })
}

async function searchProjects(search, env) {
  const request = `SELECT id, name, countries FROM projects WHERE name LIKE '%${search}%' ORDER BY name COLLATE NOCASE`  // COLLATE NOCASE ensures everything is compared as if in lowercase
  const result = await env.DB.prepare(request).all()
  const projects = result.results.map(project => ({
    ...project,
    countries: project.countries ? JSON.parse(project.countries) : []
  }))
  return reportResult({ projects })
}
