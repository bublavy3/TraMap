<script setup>
import { ref } from "vue"
import { PanelTab } from "../constants/panelTabs.js";
import CreatorMap from "../components/CreatorMap.vue"
import CreatorPanel from "../components/CreatorPanel.vue"
import SaveProjectDialog from "../components/SaveProjectDialog.vue"
import LoadProjectDialog from "../components/LoadProjectDialog.vue"

const mode = ref("osm")
const imageUrl = ref(null)
const backgroundImageFile = ref(null)
const backgroundImageIsSaved = ref(false)
const activeTab = ref(PanelTab.STATIONS)
const stations = ref({})
const junctions = ref({})
const lines = ref({})
const routes = ref({})
const currentRoute = ref(null)
const currentLineId = ref(null)
const hoveredRouteId = ref(null)
const hideLines = ref(false)
const showJunctions = ref(false)
const projectId = ref(null)
const projectName = ref("")
const projectCountries = ref([])
const saveDialogOpen = ref(false)
const loadDialogOpen = ref(false)
const savingPending = ref(false)
const loadingPending = ref(false)
const errorMessage = ref("")

// in diploma thesis version only 2 underlay modes will be supported - OpenStreetMap and image, but in future there might be desire to add more map providers for example, or raw map data import
function handleModeChange(newMode) {
  mode.value = newMode
}

function handleImageUpload({ url, file }) {
  if (imageUrl.value?.startsWith("blob:")) {  // blob is a browser storage type for url that contains the stringified image, after it's used it must be removed
    URL.revokeObjectURL(imageUrl.value)
  }
  imageUrl.value = url
  backgroundImageFile.value = file
  backgroundImageIsSaved.value = false
}

function openSaveDialog() {
  saveDialogOpen.value = true
}

function openLoadDialog() {
  loadDialogOpen.value = true
}

function closeDialog() {
  saveDialogOpen.value = false
  loadDialogOpen.value = false
  errorMessage.value = ""
}

async function saveProject({name, countries}) {
  name = name.trim()
  if (!name) {
    return
  }
  const updatingCurrentProject = name === projectName.value
  const newProjectId = updatingCurrentProject ? projectId.value : crypto.randomUUID()
  const snapshot = {
    mode: mode.value,
    stations: stations.value,
    junctions: junctions.value,
    routes: routes.value,
    lines: lines.value,
  }
  const form = new FormData()
  form.set("snapshot", JSON.stringify(snapshot))
  form.set("name", name)
  form.set("countries", JSON.stringify(countries))

  if (mode.value === "image" && backgroundImageFile.value) {  // newly uploaded background image
    form.set("backgroundImage", backgroundImageFile.value)
  } else if (mode.value === "image" && imageUrl.value && backgroundImageIsSaved.value) {
    if (updatingCurrentProject) { // updating this project, no change to background
      form.set("keepBackground", "true")
    } else if (projectId.value) { // saving new project from this one (with the same background)
      form.set("copyBackground", projectId.value)
    }
  }

  savingPending.value = true
  errorMessage.value = ""
  try {
    const response = await fetch(`/api/projects/${newProjectId}`, {
      method: "PUT",
      body: form,
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Something went wrong while saving the project")
    }
    
    backgroundImageFile.value = null
    backgroundImageIsSaved.value = result.imageUrl != null
    projectId.value = newProjectId
    projectName.value = name
    projectCountries.value = countries
    saveDialogOpen.value = false
  } catch (error) {
    errorMessage.value = error.message
  } finally { // in finally it's guaranteed that we don't get locked with saving pending even if there is an error
    savingPending.value = false
  }
}

async function loadProject(newProjectId) {
  loadingPending.value = true
  errorMessage.value = ""
  try {
    const response = await fetch(`/api/projects/${newProjectId}`)
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Something went wrong while loading the project")
    }

    if (imageUrl.value?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl.value)
    }
    mode.value = result.mode
    imageUrl.value = result.imageUrl
    backgroundImageFile.value = null
    backgroundImageIsSaved.value = Boolean(result.imageUrl)
    stations.value = result.stations
    junctions.value = result.junctions
    routes.value = result.routes
    lines.value = result.lines
    currentRoute.value = null
    currentLineId.value = null
    hoveredRouteId.value = null
    projectId.value = result.id
    projectName.value = result.name
    projectCountries.value = result.countries
    loadDialogOpen.value = false
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loadingPending.value = false
  }
}

defineExpose({ saveProject, loadProject })

function handleTabChange(tab) {
  activeTab.value = tab
  hoveredRouteId.value = null
  hideLines.value = tab === PanelTab.ROUTES;
  showJunctions.value = tab === PanelTab.ROUTES;
}

function handleMapRightClick(coordinates) {
  switch (activeTab.value) {
    case PanelTab.STATIONS:
      addStation(coordinates)
      break
    case PanelTab.LINES:
      break
    case PanelTab.ROUTES:
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
    case PanelTab.STATIONS:
      break
    case PanelTab.LINES:
      break
    case PanelTab.ROUTES:
      if (currentRoute.value) { // finish route at this station
        if (currentRoute.value.stationA === stationId) {  // if end station is the same as start station
          currentRoute.value = null
          break
        }
        currentRoute.value.stationB = stationId
        currentRoute.value.id = Date.now()
        currentRoute.value.lines = []
        currentRoute.value.travelTime = 0
        currentRoute.value.highTrafficTime = 0
        currentRoute.value.lowTrafficTime = 0
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

function handleRouteRightClick(routeId, coordinates, ctrlPressed) {
  switch (activeTab.value) {
    case PanelTab.STATIONS:
      break
    case PanelTab.LINES:
      const currentLine = lines.value[currentLineId.value]
      const route = routes.value[routeId]
      if (currentLine && route) {
        if (ctrlPressed) {
          route.lines = route.lines.filter(lineId => lineId !== currentLineId.value)
        } else if (!route.lines.includes(currentLineId.value)) {
          route.lines.push(currentLineId.value)
        }
      }
      break
    case PanelTab.ROUTES:
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
        lng: coordinates.lng,
        name: `(${coordinates.lat.toFixed(4)} ${coordinates.lng.toFixed(4)})`  // toFixed does rounding (to 4 digits after decimal separator)
      }
      const firstSubRoute = {
        id: Date.now() + 1,
        stationA: route.stationA,
        stationB: junction.id,
        points: firstSubRoutePoints,
        lines: [...route.lines],
        travelTime: 0,
        highTrafficTime: 0,
        lowTrafficTime: 0
      }
      const secondSubRoute = {
        id: Date.now() + 2,
        stationA: junction.id,
        stationB: route.stationB,
        points: secondSubRoutePoints,
        lines: [...route.lines],
        travelTime: 0,
        highTrafficTime: 0,
        lowTrafficTime: 0
      }
      junctions.value[junction.id] = junction
      delete routes.value[routeId]
      routes.value[firstSubRoute.id] = firstSubRoute
      routes.value[secondSubRoute.id] = secondSubRoute
      return
    }
  }
}

function handleStationDeleted(stationId) {
  Object.values(routes.value).forEach(route => {
    if (route.stationA === stationId || route.stationB === stationId) {
      handleRouteDeleted(route.id)
    }
  })
  delete stations.value[stationId];
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

function handleRouteHovered(routeId) {
  hoveredRouteId.value = routeId
}

function handleRouteDeleted(routeId) {
  const route = routes.value[routeId]
  delete routes.value[routeId]; // when no semicolon was present, JS was treating the line bellow as part of the delete statement
  [route.stationA, route.stationB].forEach(stationId => {
    if (!(stationId in junctions.value)) {
      return
    }
    if (!Object.values(routes.value).some(remainingRoute =>
        remainingRoute.stationA === stationId || remainingRoute.stationB === stationId
    )) {
      delete junctions.value[stationId]
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
        :hoveredRouteId="hoveredRouteId"
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
        :junctions="junctions"
        :lines="lines"
        :routes="routes"
        @modeChanged="handleModeChange"
        @imageUploaded="handleImageUpload"
        @tabChanged="handleTabChange"
        @lineFocused="handleLineFocused"
        @lineDeleted="handleLineDeleted"
        @routeHovered="handleRouteHovered"
        @stationDeleted="handleStationDeleted"
        @routeDeleted="handleRouteDeleted"
        @load-project="openLoadDialog"
        @save-project="openSaveDialog"
    />
    <SaveProjectDialog
        v-if="saveDialogOpen"
        :originalName="projectName"
        :originalCountries="projectCountries"
        :savingPending="savingPending"
        :errorMessage="errorMessage"
        @save="saveProject"
        @close="closeDialog"
    />
    <LoadProjectDialog
        v-if="loadDialogOpen"
        :loadingPending="loadingPending"
        :errorMessage="errorMessage"
        @load="loadProject"
        @close="closeDialog"
    />
  </div>
</template>

<style src="../styles/Creator.css" scoped></style>
