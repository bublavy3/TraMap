<script setup>
import { onMounted, onBeforeUnmount, watch, nextTick, ref } from "vue"
import L from "leaflet"

const props = defineProps({
  mode: String,
  imageUrl: String
})

const emit = defineEmits([
    "mapReady"
])

const mapContainer = ref(null)
let map = null
let currentLayer = null

onMounted(() => {
  createMap()
})

onBeforeUnmount(() => {
  destroyMap()
})

// watch for change of the mode and on change recreate the map
watch(() => props.mode, async () => {
  destroyMap()
  await nextTick()  // prevents issues from container size changes
  createMap()
})

// watch for change of the underlay image, update on change
watch(() => props.imageUrl, (newUrl) => {
  if (props.mode === "image" && newUrl) {
    loadImage(newUrl)
  }
})

function createMap() {
  if (!mapContainer.value) return

  if (props.mode === "osm") {
    map = L.map(mapContainer.value, {
      center: [48.15, 17.11],   // center of Bratislava
      zoom: 13                  // default zoom-in
    })
    loadOSM()

  } else {
    map = L.map(mapContainer.value, {
      crs: L.CRS.Simple,    // 2D coordinate system, as the underlay image is flat
      minZoom: -5           // the less the value, the more we can zoom out - by default not enough, -5 means 2^(-5) ratio, therefore on Full HD up to around 60k px wide image can be zoomed out fully
    })
  }

  if (props.mode === "image" && props.imageUrl) {
    loadImage(props.imageUrl)
  }

  emit("mapReady", map)
}

function destroyMap() {
  if (map) {
    map.remove()  // DOM cleanup
    map = null    // break the reference to the object and let garbage collector deal with it
    currentLayer = null
  }
}

// for OSM underlay mode
function loadOSM() {
  currentLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19 }   // the most zoom-in an OSM map can take, enough for one meter to be represented by multiple pixels in most scenarios
  )
  currentLayer.addTo(map)
}

// for image underlay mode
function loadImage(imageUrl) {
  if (!map) return
  if (currentLayer) {
    map.removeLayer(currentLayer)
  }
  map.setMinZoom(undefined)   // reset minimal zoom (will be set later in this function)
  map.setMaxBounds(null)      // reset borders of the map (will be set later in this function)
  const img = new Image()

  img.onload = () => {
    const width = img.width
    const height = img.height
    const bounds = [[0, 0], [height, width]]
    currentLayer = L.imageOverlay(imageUrl, bounds)
    currentLayer.addTo(map)

    // below we ensure that at maximum zoom-out, the more expansive dimension of the image matches the window dimension, and that we cannot scroll out of the map
    const mapSize = map.getSize()
    const scaleX = mapSize.x / width
    const scaleY = mapSize.y / height
    const scale = Math.min(scaleX, scaleY)
    const zoom = Math.log2(scale)
    map.setView([height / 2, width / 2], zoom)
    map.setMinZoom(zoom)
    map.setMaxBounds(bounds)
  }

  img.src = imageUrl
}
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style src="../styles/BaseMap.css" scoped></style>
