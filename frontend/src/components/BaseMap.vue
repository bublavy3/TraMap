<script setup>
import { onMounted, onBeforeUnmount, watch, nextTick, ref } from "vue"
import { renderStations } from "../functions/renderStations.js"
import L from "leaflet"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array
})

const emit = defineEmits([
  "mapReady",
  "rightClick"
])

const mapContainer = ref(null)
let map = null
let currentLayer = null
let stationLayerGroup = null

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

// watch for change in stations array and rerender stations on change
watch(() => props.stations, () => {
      renderStationsOnMap()
    },
    { deep: true }  // look inside the list
)

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

  // Prevent default browser action on right click
  map.getContainer().addEventListener("contextmenu", (e) => {
    e.preventDefault()
  })

  // Emit right-click event's coordinates to CreatorMap
  map.on("contextmenu", (e) => {
    emit("rightClick", e.latlng)
  })


  stationLayerGroup = L.layerGroup().addTo(map)   // Layer for stations
  renderStations()
  emit("mapReady", map)     // Tell the CreatorMap that the map is ready
}

// 🧹 Destroy map
function destroyMap() {
  if (map) {
    map.remove()  // DOM cleanup
    map = null    // break the reference to the object and let garbage collector deal with it
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

// Render stations and labels
function renderStationsOnMap() {
  if (!map || !stationLayerGroup) return

  renderStations(stationLayerGroup, props.stations)
}
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style src="../styles/BaseMap.css" scoped></style>