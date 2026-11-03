<script setup>
import { watch } from "vue"
import BaseMap from "./BaseMap.vue"
import L from "leaflet"
import { renderStations } from "../functions/renderStations.js"
import { renderRoutes } from "../functions/renderRoutes.js"
import { renderLines } from "../functions/renderLines.js"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Object,
  routes: Object,
  lines: Object,
  junctions: Object
})

let map = null
let stationLayerGroup = null
let lineLayerGroup = null
let routeLayerGroup = null

function handleMapReady(readyMap) {
  map = readyMap

  // Stations and junctions use their own pane to stay above routes and lines.
  map.createPane("stationPane")
  map.getPane("stationPane").style.zIndex = 500

  stationLayerGroup = L.layerGroup().addTo(map)
  lineLayerGroup = L.layerGroup().addTo(map)
  routeLayerGroup = L.layerGroup().addTo(map)
  renderStationsLayer()
  renderRoutesLayer()
  renderLinesLayer()
}

function renderRoutesLayer() {
  renderRoutes(routeLayerGroup, props.routes, null, props.stations, props.junctions)
}

function renderStationsLayer() {
  renderStations(stationLayerGroup, props.stations )  // TODO give callback for opening timetable
}

function renderLinesLayer() {
  renderLines(lineLayerGroup, props.lines, props.routes, props.stations, props.junctions)
}

watch(() => props.stations, () => {
  renderStationsLayer()
  renderRoutesLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.junctions, () => {
  renderRoutesLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.routes, () => {
  renderRoutesLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.lines, renderLinesLayer, { deep: true })
</script>

<template>
  <BaseMap :mode="mode" :imageUrl="imageUrl" @mapReady="handleMapReady" />
</template>
