<script setup>
import { ref, watch, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import StationTimetableDialog from "./StationTimetableDialog.vue";

const { t } = useI18n()

const props = defineProps({
  stations: Object,
  lines: Object,
  routes: Object,
  junctions: Object,
  editingAllowed: Boolean
})

const emit = defineEmits([
    "stationDeleted"
])

const nameFilter = ref("")
const displayedStations = ref([])
const timetableOpen = ref(false)
const openedStationId = ref(null)

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
  emit("stationDeleted", stationId)
}

function openTimetablePopup(stationId) {
  openedStationId.value = stationId
  timetableOpen.value = true
}

function closeTimetablePopup() {
  timetableOpen.value = false
  openedStationId.value = null
}
</script>

<template>
  <div class="stations-tab">
    <div class="stations-main-controls">
      <input v-model="nameFilter" type="text" class="name-filter-field" :placeholder="t('common.filterByName')"/>
    </div>

    <div class="stations-list">
      <div v-for="station in displayedStations" :key="station.id" class="station-row">
        <input v-model="station.name" :readonly="!props.editingAllowed" :class="{ 'readonly-input': !props.editingAllowed }"/>
        <button v-if="props.editingAllowed" type="button" class="delete-station-button" @click="handleDeleteClick(station.id)">🗑</button>
        <button :title="t('common.openTimetable')" @click="openTimetablePopup(station.id)">⏲</button>
      </div>
    </div>
  </div>
  <StationTimetableDialog v-if="timetableOpen" :openedStationId="openedStationId" :stations="stations" :lines="lines" :routes="routes"  :junctions="junctions" @close="closeTimetablePopup" />
</template>

<style src="../styles/StationsTab.css" scoped></style>
