function reportResult(data, status = 200) {
  return Response.json(data, { status })
}

// This is standard "workers" backend compatible with Cloudflare D1 database hosting
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)
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
  const request = `SELECT snapshot, image_key, name FROM projects WHERE id = '${projectId}'`
  const project = await env.DB.prepare(request).first() // .first() is just standard D1 API getter
  if (!project) {
    return reportResult({ error: "Project not found" }, 404)
  }

  return reportResult({
    id: projectId,
    ...JSON.parse(project.snapshot),
    name: project.name,
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

  request = `INSERT INTO projects (id, snapshot, image_key, last_update, name)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
             ON CONFLICT(id) DO UPDATE SET
             snapshot = excluded.snapshot,
             image_key = excluded.image_key,
             last_update = CURRENT_TIMESTAMP,
             name = excluded.name`
  await env.DB.prepare(request).bind(projectId, JSON.stringify(snapshot), imageKey, name).run() // bind allows imageKey to be passed as a string or null

  if (uploadedImageKey && existingProject?.image_key) {
    await env.BACKGROUNDS.delete(existingProject.image_key)
  }

  return reportResult({
    saved: true,
    id: projectId,
    name,
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
  const request = `SELECT id, name FROM projects WHERE name LIKE '%${search}%' ORDER BY name COLLATE NOCASE`  // COLLATE NOCASE ensures everything is compared as if in lowercase
  const projects = await env.DB.prepare(request).all()
  return reportResult({ projects: projects.results })
}
