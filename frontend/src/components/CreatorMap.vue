<script setup>
import BaseMap from "./BaseMap.vue"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array,
  routes: Array,
  lines: Array,
  currentRoute: Object,
  hideLines: Boolean
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

function handleRouteRightClick(routeId) {
  emit("routeRightClick", routeId)
}
</script>

<template>
  <BaseMap
      :mode="mode"
      :imageUrl="imageUrl"
      :stations="stations"
      :routes="routes"
      :lines="lines"
      :currentRoute="currentRoute"
      :hideLines="hideLines"
      @mapRightClick="handleMapRightClick"
      @stationRightClick="handleStationRightClick"
      @routeRightClick="handleRouteRightClick"
  />
</template>