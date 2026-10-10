<script setup>
import { ref, watch, onMounted } from "vue"

const props = defineProps({
  stations: Object
})

const emit = defineEmits([
    "stationDeleted"
])

const nameFilter = ref("")
const displayedStations = ref([])

function stationMatchesNameFilter(station, inputtedText) {
  return !inputtedText || station.name.includes(inputtedText)
}

function refreshDisplayedStations() {
  displayedStations.value = Object.values(props.stations).filter(station => {
    return stationMatchesNameFilter(station, nameFilter.value)
  })
}

onMounted(() => {
  refreshDisplayedStations()
})

watch([nameFilter, () => props.stations], () => {
  refreshDisplayedStations()
}, { deep: true })

function handleDeleteClick(stationId) {
  emit("stationDeleted", stationId);
}
</script>

<template>
  <div class="stations-tab">
    <div class="stations-main-controls">
      <input v-model="nameFilter" type="text" class="name-filter-field" placeholder="Filter by name"/>
    </div>

    <div class="stations-list">
      <div v-for="station in displayedStations" :key="station.id" class="station-row">
        <input v-model="station.name" />
        <button type="button" class="delete-station-button" @click="handleDeleteClick(station.id)">🗑</button>
      </div>
    </div>
  </div>
</template>

<style src="../styles/StationsTab.css" scoped></style>
