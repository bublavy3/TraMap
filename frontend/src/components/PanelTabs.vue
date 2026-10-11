<script setup>
import { ref } from "vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";
import StationsTab from "./StationsTab.vue";
import LinesTab from "./LinesTab.vue";
import RoutesTab from "./RoutesTab.vue";
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  stations: Object,
  junctions: Object,
  lines: Object,
  routes: Object
})

const emit = defineEmits([
  "tabChanged",
  "lineFocused",
  "lineDeleted",
  "routeHovered",
  "stationDeleted",
  "routeDeleted"
])

const tabs = [CreatorPanelTab.STATIONS, CreatorPanelTab.LINES, CreatorPanelTab.ROUTES] // these will be soon replaced with icons for each respective tab: stations, lines, timetables, fares, export... and somewhere tranfers and other functionality
const activeTab = ref(CreatorPanelTab.STATIONS)  // starter tab - stations - right now really just trying out the tab system

function selectTab(tab) {
  activeTab.value = tab
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
</script>

<template>
  <div class="tabs-container">
    <div class="tabs">
      <div v-for="tab in tabs" :key="tab" class="tab" :class="{ active: activeTab === tab }" @click="selectTab(tab)">
        {{ t(`tabs.${tab}`) }}
      </div>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === CreatorPanelTab.STATIONS" class="tab-content-inside"><StationsTab :stations="stations" @stationDeleted="handleStationDeleted"/></div>
      <div v-if="activeTab === CreatorPanelTab.LINES" class="tab-content-inside"><LinesTab :lines="lines" :routes="routes" :stations="stations" :junctions="junctions" @lineFocused="handleLineFocused" @lineDeleted="handleLineDeleted"/></div>
      <div v-if="activeTab === CreatorPanelTab.ROUTES" class="tab-content-inside"><RoutesTab :routes="routes" :stations="{ ...stations, ...junctions }" :lines="lines" @routeDeleted="handleRouteDeleted" @hover="handleRouteHovered" /></div>
    </div>
  </div>
</template>

<style src="../styles/PanelTabs.css" scoped></style>
