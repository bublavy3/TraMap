<script setup>
import { ref } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Object,
  junctions: Object,
  routes: Object,
  lines: Object
})

const exportPending = ref(false)
const errorMessage = ref("")
const symbolScale = ref(2)
const { t } = useI18n()

function loadImageIntoUrl(image) {
  return new Promise((resolve, reject) => { // either resolve returns value in future or reject raises error
    const fileReader = new FileReader()
    fileReader.onload = function() {  // FileReader can have function assigned that is called from onload, which fires on successful loading
      resolve(fileReader.result)
    }
    fileReader.onerror = function() {
      reject(new Error("Preparing background image failed"))
    }
    fileReader.readAsDataURL(image) // start loading the image asynchronously and call onload or onerror based on how it goes
  })
}

async function exportProject(format) {
  if (exportPending.value) {
    return
  }
  exportPending.value = true
  errorMessage.value = ""

  try {
    let imageUrl = props.imageUrl
    if (props.mode === "image" && imageUrl?.startsWith("blob:")) {  // headless browser cannot use the original blob url
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error("Preparing background image failed")
      }
      const image = await response.blob() // load image from temporary url into blob browser object
      imageUrl = await loadImageIntoUrl(image)
    }

    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        format,
        project: {
          mode: props.mode,
          symbolScale: props.mode === "image" ? symbolScale.value : 1,
          imageUrl,
          stations: props.stations,
          junctions: props.junctions,
          routes: props.routes,
          lines: props.lines
        }
      })
    })
    if (!response.ok) {
      const result = await response.json().catch(() => ({}))  // do not fail if response is not JSON
      throw new Error(result.error || "Map export failed")
    }

    const file = await response.blob()  // again use blob to store the generated pdf or image
    const downloadUrl = URL.createObjectURL(file) // assign it temporary url
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `tramap-export.${format === "pdf" ? "pdf" : "png"}`
    link.click()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)  // we discard the temporary url once download process should have started
  } catch (error) {
    errorMessage.value = error.message || "Map export failed"
  } finally {
    exportPending.value = false
  }
}
</script>

<template>
  <div>
    <label v-if="mode === 'image'" class="symbol-scale-control">
      <span>{{ t('export.symbolScale') }}: {{ symbolScale.toFixed(2) }}×</span>
      <input v-model.number="symbolScale" type="range" min="1" max="3" step="0.5"/>
    </label>
    <button type="button" class="export-button" :disabled="exportPending" @click="exportProject('png')">Export image</button>
    <button type="button" class="export-button" :disabled="exportPending" @click="exportProject('pdf')">Export PDF</button>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-if="exportPending" role="status">Preparing export…</p>
  </div>
</template>

<style src="../styles/PresentationTab.css" scoped></style>
