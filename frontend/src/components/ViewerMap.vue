<script setup>
import { watch } from "vue"
import BaseMap from "./BaseMap.vue"
import L from "leaflet"
import { renderStations } from "../functions/renderStations.js"
import { renderLines } from "../functions/renderLines.js"
import { fitNetwork } from "../functions/fitNetwork.js"

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

function handleMapReady(readyMap) {
  map = readyMap

  // Stations and junctions use their own pane to stay above routes and lines.
  map.createPane("stationPane")
  map.getPane("stationPane").style.zIndex = 500

  stationLayerGroup = L.layerGroup().addTo(map)
  lineLayerGroup = L.layerGroup().addTo(map)
  renderStationsLayer()
  renderLinesLayer()
  if (props.mode === "osm") {
    fitNetwork(map, props.stations)
  }
}

function renderStationsLayer() {
  renderStations(stationLayerGroup, props.stations )  // TODO give callback for opening timetable
}

function renderLinesLayer() {
  renderLines(lineLayerGroup, props.lines, props.routes, props.stations, props.junctions)
}

watch(() => props.stations, () => {
  renderStationsLayer()
  renderLinesLayer()
}, { deep: true })

watch(() => props.junctions, () => {
  renderLinesLayer()
}, { deep: true })

watch(() => props.routes, () => {
  renderLinesLayer()
}, { deep: true })

watch(() => props.lines, renderLinesLayer, { deep: true })
</script>

<template>
  <BaseMap :mode="mode" :imageUrl="imageUrl" @mapReady="handleMapReady" />
</template>
