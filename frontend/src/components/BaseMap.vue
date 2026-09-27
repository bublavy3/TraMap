<script setup>
import { onMounted, onBeforeUnmount, watch, nextTick, ref } from "vue"
import { renderStations } from "../functions/renderStations.js"
import { renderRoutes } from "../functions/renderRoutes.js"
import { renderLines } from "../functions/renderLines.js"
import { renderJunctions } from "../functions/renderJunctions.js"
import L from "leaflet"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array,
  junctions: Array,
  routes: Array,
  lines: Array,
  currentRoute: Object,
  hideLines: Boolean,
  showJunctions: Boolean
})

const emit = defineEmits([
  "mapReady",
  "mapRightClick",
  "stationRightClick",
  "routeRightClick"
])

const mapContainer = ref(null)
let map = null
let currentLayer = null
let stationLayerGroup = null
let junctionLayerGroup = null
let routeLayerGroup = null
let lineLayerGroup = null

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

watch(() => props.junctions, () => {
  renderJunctionsOnMap()
  renderRoutesOnMap()
  if (!props.hideLines) {
    renderLinesOnMap()
  }
}, { deep: true })

watch(() => props.showJunctions, (visible) => {
  if (!junctionLayerGroup) {
    return
  }
  if (visible) {
    renderJunctionsOnMap()
  } else {
    junctionLayerGroup.clearLayers()
  }
})

watch(
    () => props.routes, () => {
      renderRoutesOnMap()
      if (!props.hideLines) {
        renderLinesOnMap()
      }
    },
    { deep: true }
)

watch(
    () => props.lines, () => {
      if (!props.hideLines) {
        renderLinesOnMap()
      }
    },
    { deep: true }
)

watch(() => props.hideLines, (hidden) => {
  if (!lineLayerGroup) {
    return
  }
  if (hidden) {
    lineLayerGroup.clearLayers()
  } else {
    renderLinesOnMap()
  }
})

watch(
    () => props.currentRoute, () => {
      renderRoutesOnMap()
    },
    { deep: true }
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
    emit("mapRightClick", e.latlng)
  })


  stationLayerGroup = L.layerGroup().addTo(map)   // Layer for stations
  junctionLayerGroup = L.layerGroup().addTo(map)
  routeLayerGroup = L.layerGroup().addTo(map)
  lineLayerGroup = L.layerGroup().addTo(map)
  map.createPane("stationPane") // Pane to have stations always on top of lines and routes
  map.getPane("stationPane").style.zIndex = 500
  renderRoutesOnMap()
  if (!props.hideLines) {
    renderLinesOnMap()
  }
  renderStationsOnMap()
  if (props.showJunctions) {
    renderJunctionsOnMap()
  }
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

  renderStations(stationLayerGroup, props.stations, stationId => emit("stationRightClick", stationId))  // we also send a function that will be called after station placement with right click
}

function renderJunctionsOnMap() {
  if (!map || !junctionLayerGroup || !props.showJunctions) return

  renderJunctions(junctionLayerGroup, props.junctions, junctionId => emit("stationRightClick", junctionId))
}

// Render routes
function renderRoutesOnMap() {
  if (!map || !routeLayerGroup) return

  renderRoutes(
      routeLayerGroup,
      props.routes,
      props.currentRoute,
      props.stations,
      props.junctions,
      (routeId, coordinates) => emit("routeRightClick", routeId, coordinates)
  )
}

// Render lines
function renderLinesOnMap() {
  if (!map || !lineLayerGroup || props.hideLines) return

  renderLines(
      lineLayerGroup,
      props.lines,
      props.routes,
      props.stations,
      props.junctions,
      (routeId, coordinates) => emit("routeRightClick", routeId, coordinates)   // clicking is detected for route segments so that other lines and junctions can be added
  )
}
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style src="../styles/BaseMap.css" scoped></style>
