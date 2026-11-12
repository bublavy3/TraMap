<script setup>
import { watch } from "vue"
import BaseMap from "./BaseMap.vue"
import L from "leaflet"
import { renderStations } from "../functions/renderStations.js"
import { renderRoutes } from "../functions/renderRoutes.js"
import { renderLines } from "../functions/renderLines.js"
import { renderJunctions } from "../functions/renderJunctions.js"
import { fitNetwork } from "../functions/fitNetwork.js"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Object,
  junctions: Object,
  routes: Object,
  lines: Object,
  currentRoute: Object,
  hoveredRouteId: Number,
  hideLines: Boolean,
  showJunctions: Boolean
})

const emit = defineEmits([
  "mapRightClick",
  "stationRightClick",
  "routeRightClick"
])

let map = null
let stationLayerGroup = null
let junctionLayerGroup = null
let routeLayerGroup = null
let lineLayerGroup = null

function handleMapReady(readyMap) {
  map = readyMap

  // Stations and junctions use their own pane to stay above routes and lines.
  map.createPane("stationPane")
  map.getPane("stationPane").style.zIndex = 500

  stationLayerGroup = L.layerGroup().addTo(map)
  junctionLayerGroup = L.layerGroup().addTo(map)
  routeLayerGroup = L.layerGroup().addTo(map)
  lineLayerGroup = L.layerGroup().addTo(map)

  map.on("contextmenu", event => {
    event.originalEvent.preventDefault()
    emit("mapRightClick", event.latlng)
  })

  renderStationsLayer()
  renderJunctionsLayer()
  renderRoutesLayer()
  renderLinesLayer()
  if (props.mode === "osm") {
    fitNetwork(map, props.stations)
  }
}

function renderStationsLayer() {
  renderStations(stationLayerGroup, props.stations, stationId => emit("stationRightClick", stationId))
}

function renderJunctionsLayer() {
  if (!props.showJunctions) {
    junctionLayerGroup.clearLayers()
    return
  }
  renderJunctions(junctionLayerGroup, props.junctions, junctionId => emit("stationRightClick", junctionId))
}

function renderRoutesLayer() {
  renderRoutes(
    routeLayerGroup,
    props.routes,
    props.currentRoute,
    props.stations,
    props.junctions,
    (routeId, coordinates, ctrlPressed) => emit("routeRightClick", routeId, coordinates, ctrlPressed),
    props.hoveredRouteId
  )
}

function renderLinesLayer() {
  if (props.hideLines) {
    lineLayerGroup.clearLayers()
    return
  }
  renderLines(
    lineLayerGroup,
    props.lines,
    props.routes,
    props.stations,
    props.junctions,
    (routeId, coordinates, ctrlPressed) => emit("routeRightClick", routeId, coordinates, ctrlPressed)
  )
}

watch(() => props.stations, () => {
  renderStationsLayer()
}, { deep: true })

watch(() => props.stations, () => { // project loading replaces the stations object while editing mutates it in place and without deep:true this is not triggered
  if (props.mode === "osm") {
    fitNetwork(map, props.stations)
  }
})

watch(() => props.junctions, () => {
  renderJunctionsLayer()
  renderRoutesLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.showJunctions, renderJunctionsLayer)

watch(() => props.routes, () => {
  renderRoutesLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.lines, () => {
  renderLinesLayer()
}, { deep: true })

watch(() => props.hideLines, () => {
  renderLinesLayer()
})

watch(() => props.currentRoute, () => {
  renderRoutesLayer()
}, { deep: true })

watch(() => props.hoveredRouteId, () => {
  renderRoutesLayer()
})
</script>

<template>
  <BaseMap :mode="mode" :imageUrl="imageUrl" @mapReady="handleMapReady" />
</template>
