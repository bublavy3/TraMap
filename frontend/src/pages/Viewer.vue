<script setup>
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import ViewerMap from "../components/ViewerMap.vue"
import CreatorPanel from "../components/CreatorPanel.vue";
import ViewerPanel from "../components/ViewerPanel.vue";
import {PanelTab} from "../constants/panelTabs.js";

const route = useRoute()
const mode = ref("osm")
const imageUrl = ref(null)
const stations = ref({})
const junctions = ref({})
const routes = ref({})
const lines = ref({})
const loadingPending = ref(true)
const errorMessage = ref("")

async function loadProject() {
  loadingPending.value = true
  errorMessage.value = ""

  try {
    const response = await fetch(`/api/projects/${route.params.id}`)
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || "Something went wrong while loading the project")
    }
    mode.value = result.mode
    imageUrl.value = result.imageUrl
    stations.value = result.stations
    junctions.value = result.junctions
    routes.value = result.routes
    lines.value = result.lines
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loadingPending.value = false
  }
}

onMounted(loadProject)
</script>

<template>
  <div class="creator-container">
    <p v-if="loadingPending">Loading project…</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <ViewerMap
      v-else
      :mode="mode"
      :imageUrl="imageUrl"
      :stations="stations"
      :junctions="junctions"
      :routes="routes"
      :lines="lines"
    />

    <ViewerPanel
        :mode="mode"
        :stations="stations"
        :junctions="junctions"
        :lines="lines"
        :routes="routes"
    />
  </div>
</template>

<style src="../styles/Creator.css" scoped></style>
