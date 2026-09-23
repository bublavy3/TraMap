<script setup>
import { ref } from "vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";
import CreatorMap from "../components/CreatorMap.vue"
import CreatorPanel from "../components/CreatorPanel.vue"

const mode = ref("osm")
const imageUrl = ref(null)
const activeTab = ref(CreatorPanelTab.STATIONS)
const stations = ref([])
const lines = ref([])
const routes = ref([])
const currentRoute = ref(null)
const currentLine = ref(null)

// in diploma thesis version only 2 underlay modes will be supported - OpenStreetMap and image, but in future there might be desire to add more map providers for example, or raw map data import
function handleModeChange(newMode) {
  mode.value = newMode
}

function handleImageUpload(url) {
  imageUrl.value = url
}

function handleTabChange(tab) {
  activeTab.value = tab
}

function handleMapRightClick(coordinates) {
  switch (activeTab.value) {
    case CreatorPanelTab.STATIONS:
      addStation(coordinates)
      break
    case CreatorPanelTab.LINES:
      break
    case CreatorPanelTab.ROUTES:
      if (currentRoute.value) { // add direction change point
        currentRoute.value.points.push({
          lat: coordinates.lat,
          lng: coordinates.lng
        })
      }
      break
  }
}

function handleStationRightClick(stationId) {
  switch (activeTab.value) {
    case CreatorPanelTab.STATIONS:
      break
    case CreatorPanelTab.LINES:
      break
    case CreatorPanelTab.ROUTES:
      if (currentRoute.value) { // finish route at this station
        currentRoute.value.stationB = stationId
        routes.value.push(currentRoute.value)
        currentRoute.value = null
      } else {
        currentRoute.value = {
          stationA: stationId,
          stationB: null,
          points: []
        }
      }
      break
  }
}

function handleRouteRightClick(coordinates) {
  switch (activeTab.value) {
    case CreatorPanelTab.STATIONS:
      break
    case CreatorPanelTab.LINES:
      break
    case CreatorPanelTab.ROUTES: // TODO BUG, route click gets ignored
      if (currentRoute.value) { // add direction change point
        currentRoute.value.points.push({
          lat: coordinates.lat,
          lng: coordinates.lng
        })
      }
      break
  }
}

function handleLineFocused(lineId) {
  currentLine = props.lines.findIndex((line) => line.id === lineId)
}

function addStation(coordinates) {
  stations.value.push({
    id: Date.now(),       // just a very simple way to give unique id-s, later will be (probably) changed
    lat: coordinates.lat,     // latitude (north-south)
    lng: coordinates.lng,     // longitude (east-west)
    name: "New station"   // default name that can be overwritten in the Stations tab
  })
}
</script>

<template>
  <div class="creator-container">
    <!--    The component with the map and all its rendered layers and listeners   -->
    <CreatorMap
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

    <!--    The component with the control panel and all its functionality  -->
    <CreatorPanel
        :mode="mode"
        :activeTab="activeTab"
        :stations="stations"
        :lines="lines"
        :routes="routes"
        @modeChanged="handleModeChange"
        @imageUploaded="handleImageUpload"
        @tabChanged="handleTabChange"
        @lineFocused="handleLineFocused"
    />
  </div>
</template>

<style src="../styles/Creator.css" scoped></style>
