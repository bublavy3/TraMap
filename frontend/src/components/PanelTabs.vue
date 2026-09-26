<script setup>
import { ref } from "vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";
import StationsTab from "./StationsTab.vue";
import LinesTab from "./LinesTab.vue";
import RoutesTab from "./RoutesTab.vue";

const props = defineProps({
  stations: Array,
  lines: Array,
  routes: Array
})

const emit = defineEmits([
  "tabChanged",
  "lineFocused",
  "lineDeleted"
])

const tabs = [CreatorPanelTab.STATIONS, CreatorPanelTab.LINES, CreatorPanelTab.ROUTES] // these will be soon replaced with icons for each respective tab: stations, lines, timetables, fares, export... and somewhere tranfers and other functionality
const activeTab = ref(CreatorPanelTab.STATIONS)  // starter tab - stations - right now really just trying out the tab system

function selectTab(tab) {
  activeTab.value = tab
  emit("tabChanged", tab)
}

function handleLineFocused(lineId) {
  emit("lineFocused", lineId)
}

function handleLineDeleted(lineId) {
  emit("lineDeleted", lineId)
}
</script>

<template>
  <div class="tabs-container">
    <div class="tabs">
      <div v-for="tab in tabs" :key="tab" class="tab" :class="{ active: activeTab === tab }" @click="selectTab(tab)">
        {{ tab }}
      </div>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === CreatorPanelTab.STATIONS"><StationsTab :stations="stations" /></div>
      <div v-if="activeTab === CreatorPanelTab.LINES"><LinesTab :lines="lines" @lineFocused="handleLineFocused" @lineDeleted="handleLineDeleted"/></div>
      <div v-if="activeTab === CreatorPanelTab.ROUTES"><RoutesTab :routes="routes" /></div>
    </div>
  </div>
</template>

<style src="../styles/PanelTabs.css" scoped></style>
