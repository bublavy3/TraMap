<script setup>
import { onMounted, ref } from "vue"
import L from "leaflet"
import { renderStations } from "../functions/renderStations.js"
import { renderLines } from "../functions/renderLines.js"
import "leaflet/dist/leaflet.css"
import "../styles/main.css"

const mapElement = ref(null)

onMounted(() => { // mapElement div must be created first, so we wait for mounting to be completed
  try {
    const project = window.export_data
    if (!project) {
      throw new Error("Export data is missing")
    }

    const stations = Object.values(project.stations)
    if (!stations.length) {
      throw new Error("Add at least one station before exporting")
    }
    const symbolScale = project.mode === "image" ? Number(project.symbolScale) : 1
    const bounds = L.latLngBounds(stations.map(station => [station.lat, station.lng])).pad(0.1) // extra space on sides to accommodate for longer station names
    const crs = project.mode === "image" ? L.CRS.Simple : L.CRS.EPSG3857
    // CRS.Simple coordinates are image pixels, so zoom 0 maps one coordinate unit to one CSS pixel,
    // while OSM uses geographic coordinates and stays at 15
    let zoom = project.mode === "image" ? 0 : 15
    let northWest = crs.latLngToPoint(bounds.getNorthWest(), zoom)
    let southEast = crs.latLngToPoint(bounds.getSouthEast(), zoom)
    const minimumDimension = Math.min(southEast.x - northWest.x, southEast.y - northWest.y)
    if (minimumDimension < 800) {
      zoom += minimumDimension < 400 ? 2 : 1
      northWest = crs.latLngToPoint(bounds.getNorthWest(), zoom)
      southEast = crs.latLngToPoint(bounds.getSouthEast(), zoom)
    }
    const width = Math.ceil(southEast.x - northWest.x)
    const height = Math.ceil(southEast.y - northWest.y)
    mapElement.value.style.width = `${width}px`
    mapElement.value.style.height = `${height}px`
    mapElement.value.style.setProperty("--symbol-scale", symbolScale) // 2 dashes are required for CSS custom property

    const map = L.map(mapElement.value, { // Leaflet map with all interaction turned off just to be sure its' static
      crs,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomAnimation: false,
      fadeAnimation: false
    })
    map.setView(bounds.getCenter(), zoom)

    if (project.mode === "osm") {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 17
      }).addTo(map)
      renderLayers(map, project)
      window.export_ready = true
    } else if (project.imageUrl) {
      const image = new Image()
      image.onload = () => {
        L.imageOverlay(project.imageUrl, [[0, 0], [image.height, image.width]]).addTo(map)
        map.setView(bounds.getCenter(), zoom)
        renderLayers(map, project)
        window.export_ready = true
      }
      image.onerror = () => {
        window.export_error = "Loading background image failed"
      }
      image.src = project.imageUrl
    }
  } catch (error) {
    window.export_error = error.message || "Export rendering failed"
  }
})

function renderLayers(map, project) {
  map.createPane("stationPane")
  map.getPane("stationPane").style.zIndex = 500
  const stationLayerGroup = L.layerGroup().addTo(map)
  const lineLayerGroup = L.layerGroup().addTo(map)
  const symbolScale = project.mode === "image" ? Number(project.symbolScale) : 1
  renderStations(stationLayerGroup, project.stations, null, symbolScale)
  renderLines(lineLayerGroup, project.lines || {}, project.routes || {}, project.stations, project.junctions || {}, null, symbolScale)
  map.invalidateSize({ // make Leaflet map fit the dimensions set
    pan: false // do not shift center of map
  })
}
</script>

<template>
  <main class="print-page">
    <div ref="mapElement" class="print-map"></div>
  </main>
</template>

<style> /* style cannot be scoped as station-label span would be out of reach */
html, body, #app {
  margin: 0;
  padding: 0;
}

.print-page {
  width: max-content;
  height: max-content;
}

.station-label span { /* same styling as in BaseMap */
  color: black;
  font-size: calc(14px * var(--symbol-scale, 1));
  font-weight: bold;
  text-shadow:
      -1px -1px 0 white,
      1px -1px 0 white,
      -1px  1px 0 white,
      1px  1px 0 white;
}
</style>
