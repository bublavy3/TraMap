<script setup>
import { onMounted, watch, nextTick } from "vue"
import L from "leaflet"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array
})

const emit = defineEmits(["addStation"])

let map = null
let currentLayer = null
let stationLayerGroup = null

onMounted(() => {
  createMap()
})

watch(() => props.mode, async () => {
  destroyMap()
  await nextTick()
  createMap()
})

watch(() => props.imageUrl, (newUrl) => {
  if (props.mode === "image" && newUrl) {
    loadImage(newUrl)
  }
})

function createMap() {
  if (props.mode === "osm") {
    map = L.map("map", {
      center: [48.15, 17.11],
      zoom: 13
    })

    loadOSM()
  } else {
    map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -5
    })
  }

  map.on("contextmenu", onRightClick)
  map.getContainer().addEventListener("contextmenu", (e) => {
    e.preventDefault()
  })

  stationLayerGroup = L.layerGroup().addTo(map)
}

function destroyMap() {
  if (map) {
    map.remove()
    map = null
  }
}

function loadOSM() {
  currentLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  })

  currentLayer.addTo(map)
}

function loadImage(imageUrl) {
  if (!map) return

  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  map.setMinZoom(undefined)
  map.setMaxBounds(null)

  const img = new Image()

  img.onload = () => {
    const width = img.width
    const height = img.height

    const bounds = [[0, 0], [height, width]]

    currentLayer = L.imageOverlay(imageUrl, bounds)
    currentLayer.addTo(map)

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

function onRightClick(e) {
  emit("addStation", e.latlng)
}

watch(
    () => props.stations,
    () => {
      renderStations()
    },
    { deep: true }
)

function renderStations() {
  if (!map || !stationLayerGroup) return

  stationLayerGroup.clearLayers()

  props.stations.forEach(station => {
    // circle
    const circle = L.circleMarker([station.lat, station.lng], {
      radius: 6,
      color: "black",
      weight: 2,
      fillColor: "white",
      fillOpacity: 1
    })

    // label
    const label = L.marker([station.lat, station.lng], {
      icon: L.divIcon({
        className: "station-label",
        html: `<span>${station.name}</span>`,
        iconSize: [0, 0],
        iconAnchor: [-10, 10]
      })
    })

    circle.addTo(stationLayerGroup)
    label.addTo(stationLayerGroup)
  })
}
</script>

<template>
  <div id="map"></div>
</template>

<style src="../styles/CreatorMap.css" scoped></style>