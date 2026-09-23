<script setup>
import BaseMap from "./BaseMap.vue"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array,
  routes: Array,
  currentRoute: Object,
  currentLine: Object
})

const emit = defineEmits([
    "mapRightClick",
    "stationRightClick",
    "routeRightClick",
])

// for now all we do on right click is add stations to the map, the provided functionality will of course be largely expanded
function handleMapRightClick(coordinates) {
  emit("mapRightClick", coordinates)
}

function handleStationRightClick(stationId) {
  emit("stationRightClick", stationId)
}

function handleRouteRightClick(coordinates) {
  emit("routeRightClick", coordinates)
}
</script>

<template>
  <BaseMap
      :mode="mode"
      :imageUrl="imageUrl"
      :stations="stations"
      :routes="routes"
      :currentRoute="currentRoute"
      :currentLine="currentLine"
      @mapRightClick="handleMapRightClick"
      @stationRightClick="handleStationRightClick"
      @routeRightClick="handleRouteRightClick"
  />
</template>