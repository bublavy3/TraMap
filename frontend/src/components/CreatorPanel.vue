<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import PanelTabs from "./PanelTabs.vue"
import { PanelTab } from "../constants/panelTabs.js";

const props = defineProps({
  mode: String,
  imageUrl: String,
  activeTab: String,
  stations: Object,
  junctions: Object,
  lines: Object,
  routes: Object
})

const emit = defineEmits([
  "modeChanged",
  "imageUploaded",
  "tabChanged",
  "lineFocused",
  "lineDeleted",
  "routeHovered",
  "stationDeleted",
  "routeDeleted",
  "loadProject",
  "saveProject"
])

const { t } = useI18n()   // t will be the translation function used for texts being in user's selected language

// function to let Creator know when mode is changed via the select
function changeMode(selectedOption) {
  emit("modeChanged", selectedOption.target.value)
}

function changeActiveTab(tab) {
  emit("tabChanged", tab)
}

function handleStationDeleted(stationId) {
  emit("stationDeleted", stationId)
}

function handleLineFocused(lineId) {
  emit("lineFocused", lineId)
}

function handleLineDeleted(lineId) {
  emit("lineDeleted", lineId)
}

function handleRouteHovered(routeId) {
  emit("routeHovered", routeId)
}

function handleRouteDeleted(lineId) {
  emit("routeDeleted", lineId)
}

// function to conduct file selection as image underlay utilizing standard browser built-in file explorer
function uploadImage(fileSelection) {
  const file = fileSelection.target.files[0]
  if (!file) return

  emit("imageUploaded", {
    url: URL.createObjectURL(file), // Leaflet takes the image as a string encoded in URL
    file  // used for saving to db
  })
}

function loadProject() {
  emit("loadProject")
}

function saveProject() {
  emit("saveProject")
}

const currentText = computed(() => {    // this text will inform the user how to use the tool he has selected
  switch (props.activeTab) {
    case PanelTab.STATIONS:
      return t("panel.infotextStationTab")
    case PanelTab.LINES:
      return t("panel.infotextLinesTab")
    case PanelTab.ROUTES:
      return t("panel.infotextRoutesTab")
    default:
      return ""
  }
})
</script>

<template>
  <div class="panel">
    <h2>{{ t('panel.title') }}</h2>

    <div class="project-panel">
      <select :value="mode" @change="changeMode">
        <option value="osm">{{ t('panel.osm') }}</option>
        <option value="image">{{ t('panel.image') }}</option>
      </select>
      <button type="button" class="file-button" @click="loadProject">📂</button>
      <button type="button" class="file-button" @click="saveProject">💾</button>
    </div>

    <div v-if="mode === 'image'">
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" @change="uploadImage" />
    </div>

    <div class="info-text">{{ currentText }}</div>

    <PanelTabs
      :stations="stations"
      :junctions="junctions"
      :lines="lines"
      :routes="routes"
      :mode="mode"
      :imageUrl="imageUrl"
      :editingAllowed="true"
      @tabChanged="changeActiveTab"
      @lineFocused="handleLineFocused"
      @lineDeleted="handleLineDeleted"
      @routeHovered="handleRouteHovered"
      @stationDeleted="handleStationDeleted"
      @routeDeleted="handleRouteDeleted"
    />
  </div>
</template>

<style src="../styles/CreatorPanel.css" scoped></style>
