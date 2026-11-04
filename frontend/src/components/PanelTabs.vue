<script setup>
import { ref } from "vue"
import { PanelTab } from "../constants/panelTabs.js";
import StationsTab from "./StationsTab.vue";
import LinesTab from "./LinesTab.vue";
import RoutesTab from "./RoutesTab.vue";
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  stations: Object,
  junctions: Object,
  lines: Object,
  routes: Object,
  editingAllowed: Boolean
})

const emit = defineEmits([
  "tabChanged",
  "lineFocused",
  "lineDeleted",
  "routeHovered",
  "stationDeleted",
  "routeDeleted"
])

const tabs = props.editingAllowed ? [PanelTab.STATIONS, PanelTab.LINES, PanelTab.ROUTES]
                                  : [PanelTab.STATIONS, PanelTab.LINES]// these will be soon replaced with icons for each respective tab: stations, lines, timetables, fares, export... and somewhere tranfers and other functionality
const activeTab = ref(PanelTab.STATIONS)  // starter tab - stations

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
      <div v-if="activeTab === PanelTab.STATIONS" class="tab-content-inside"><StationsTab :stations="stations" :lines="lines" :routes="routes" :junctions="junctions" :editingAllowed="editingAllowed" @stationDeleted="handleStationDeleted"/></div>
      <div v-if="activeTab === PanelTab.LINES" class="tab-content-inside"><LinesTab :lines="lines" :routes="routes" :stations="stations" :junctions="junctions" :editingAllowed="editingAllowed" @lineFocused="handleLineFocused" @lineDeleted="handleLineDeleted"/></div>
      <div v-if="activeTab === PanelTab.ROUTES" class="tab-content-inside"><RoutesTab :routes="routes" :stations="{ ...stations, ...junctions }" :lines="lines" @routeDeleted="handleRouteDeleted" @hover="handleRouteHovered" /></div>
    </div>
  </div>
</template>

<style src="../styles/PanelTabs.css" scoped></style>
