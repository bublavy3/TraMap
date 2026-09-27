<script setup>
import BaseMap from "./BaseMap.vue"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Object,
  junctions: Object,
  routes: Object,
  lines: Object,
  currentRoute: Object,
  hideLines: Boolean,
  showJunctions: Boolean
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

function handleRouteRightClick(routeId, coordinates) {
  emit("routeRightClick", routeId, coordinates)
}
</script>

<template>
  <BaseMap
      :mode="mode"
      :imageUrl="imageUrl"
      :stations="stations"
      :junctions="junctions"
      :routes="routes"
      :lines="lines"
      :currentRoute="currentRoute"
      :hideLines="hideLines"
      :showJunctions="showJunctions"
      @mapRightClick="handleMapRightClick"
      @stationRightClick="handleStationRightClick"
      @routeRightClick="handleRouteRightClick"
  />
</template>
