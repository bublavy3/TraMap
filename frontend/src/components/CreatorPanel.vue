<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import PanelTabs from "./PanelTabs.vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";

const props = defineProps({
  mode: String,
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
  "routeDeleted"
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

  const reader = new FileReader()
  reader.onload = (imageRead) => {
    emit("imageUploaded", imageRead.target.result)    // image.target.result contains the file
  }
  reader.readAsDataURL(file)    // read the file and encode it as string
}

const currentText = computed(() => {    // this text will inform the user how to use the tool he has selected
  switch (props.activeTab) {
    case CreatorPanelTab.STATIONS:
      return t("panel.infotextStationTab")
    case CreatorPanelTab.LINES:
      return t("panel.infotextLinesTab")
    case CreatorPanelTab.ROUTES:
      return t("panel.infotextRoutesTab")
    default:
      return ""
  }
})
</script>

<template>
  <div class="panel">
    <h2>{{ t('panel.title') }}</h2>

    <select :value="mode" @change="changeMode">
      <option value="osm">{{ t('panel.osm') }}</option>
      <option value="image">{{ t('panel.image') }}</option>
    </select>

    <div v-if="mode === 'image'">
      <input type="file" accept="image/*" @change="uploadImage" />
    </div>

<!--    <input type="text" :value="currentText" readonly />-->
    <div class="info-text">{{ currentText }}</div>

    <PanelTabs
      :stations="stations"
      :junctions="junctions"
      :lines="lines"
      :routes="routes"
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
