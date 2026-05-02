<script setup>
import { ref } from "vue"
import StationsTab from "./StationsTab.vue";

const props = defineProps({
  stations: Array
})

const tabs = ["A", "B", "C", "D"] // these will be soon replaced with icons for each respective tab: stations, lines, timetables, fares, export... and somewhere tranfers and other functionality
const activeTab = ref("A")  // starter tab - stations - right now really just trying out the tab system

function selectTab(tab) {
  activeTab.value = tab
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
      <div v-if="activeTab === 'A'"><StationsTab :stations="stations" /></div>
      <div v-if="activeTab === 'B'">Content of window B</div>
      <div v-if="activeTab === 'C'">Content of window C</div>
      <div v-if="activeTab === 'D'">Content of window D</div>
    </div>
  </div>
</template>

<style src="../styles/PanelTabs.css" scoped></style>