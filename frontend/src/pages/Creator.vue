<script setup>
import { ref } from "vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";
import CreatorMap from "../components/CreatorMap.vue"
import CreatorPanel from "../components/CreatorPanel.vue"

const mode = ref("osm")
const imageUrl = ref(null)
const activeTab = ref(CreatorPanelTab.STATIONS)
const stations = ref({})
const junctions = ref({})
const lines = ref({})
const routes = ref({})
const currentRoute = ref(null)
const currentLineId = ref(null)
const hideLines = ref(false)
const showJunctions = ref(false)

// in diploma thesis version only 2 underlay modes will be supported - OpenStreetMap and image, but in future there might be desire to add more map providers for example, or raw map data import
function handleModeChange(newMode) {
  mode.value = newMode
}

function handleImageUpload(url) {
  imageUrl.value = url
}

function handleTabChange(tab) {
  activeTab.value = tab
  hideLines.value = tab === CreatorPanelTab.ROUTES;
  showJunctions.value = tab === CreatorPanelTab.ROUTES;
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
        if (currentRoute.value.stationA === stationId) {  // if end station is the same as start station
          currentRoute.value = null
          break
        }
        currentRoute.value.stationB = stationId
        currentRoute.value.id = Date.now()
        currentRoute.value.lines = []
        routes.value[currentRoute.value.id] = currentRoute.value
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

function handleRouteRightClick(routeId, coordinates) {
  switch (activeTab.value) {
    case CreatorPanelTab.STATIONS:
      break
    case CreatorPanelTab.LINES:
      const currentLine = lines.value[currentLineId.value]
      const route = routes.value[routeId]
      if (currentLine && route && !route.lines.includes(currentLineId.value)) {
        route.lines.push(currentLineId.value)
      }
      break
    case CreatorPanelTab.ROUTES:
      if (!currentRoute.value) {
        splitRoute(routeId, coordinates)
      }
      break
  }
}

function getDistance(p1, p2) { // TODO move to some helper functions file?
  return Math.sqrt((p2.lat - p1.lat) ** 2 + (p2.lng - p1.lng) ** 2);
}

// If distance from X to A + distance from X to B equals (with small tolerance) distance from A to B, then X must lie on line from A to B
function detectPointOnRouteSegment(p1, p2, clickPoint) {
  const distanceClickP1 = getDistance(clickPoint, p1)
  const distanceClickP2 = getDistance(clickPoint, p2)
  const distanceP1P2 = getDistance(p1, p2)
  return Math.abs((distanceClickP1 + distanceClickP2) - distanceP1P2) < distanceClickP2 / 10  // TODO different tolerance than just tenth of the points distance
}

function splitRoute(routeId, coordinates) {
  const route = routes.value[routeId]
  const stationMap = { ...stations.value, ...junctions.value }  // '...' copies the array's elements

  const start = stationMap[route.stationA]  // can be a station or already a junction
  const end = stationMap[route.stationB]    // can be a station or already a junction
  const allPoints = [{ lat: start.lat, lng: start.lng }, ...route.points, { lat: end.lat, lng: end.lng }]
  for (let i = 0; i < allPoints.length - 1; i++) {  // find where the new junction splits the route
    const p1 = allPoints[i]
    const p2 = allPoints[i + 1]
    if (detectPointOnRouteSegment(p1, p2, coordinates)) {
      const firstSubRoutePoints = allPoints.slice(1, i + 1)
      const secondSubRoutePoints = allPoints.slice(i + 1, allPoints.length)
      const junction = {
        id: Date.now(),
        lat: coordinates.lat,
        lng: coordinates.lng
      }
      const firstSubRoute = {
        id: Date.now() + 1,
        stationA: route.stationA,
        stationB: junction.id,
        points: firstSubRoutePoints,
        lines: [...route.lines]
      }
      const secondSubRoute = {
        id: Date.now() + 2,
        stationA: junction.id,
        stationB: route.stationB,
        points: secondSubRoutePoints,
        lines: [...route.lines]
      }
      junctions.value[junction.id] = junction
      delete routes.value[routeId]
      routes.value[firstSubRoute.id] = firstSubRoute
      routes.value[secondSubRoute.id] = secondSubRoute
      return
    }
  }
}

function handleLineFocused(lineId) {
  currentLineId.value = lineId
}

function handleLineDeleted(lineId) {
  if (currentLineId.value === lineId) {
    currentLineId.value = null
  }

  Object.values(routes.value).forEach(route => {
    if (route.lines) {
      route.lines = route.lines.filter(id => id !== lineId)
    }
  })
}

function addStation(coordinates) {
  const station = {
    id: Date.now(),       // just a very simple way to give unique id-s, later will be (probably) changed
    lat: coordinates.lat,     // latitude (north-south)
    lng: coordinates.lng,     // longitude (east-west)
    name: "New station"   // default name that can be overwritten in the Stations tab
  }
  stations.value[station.id] = station
}
</script>

<template>
  <div class="creator-container">
    <!--    The component with the map and all its rendered layers and listeners   -->
    <CreatorMap
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
        @lineDeleted="handleLineDeleted"
    />
  </div>
</template>

<style src="../styles/Creator.css" scoped></style>
