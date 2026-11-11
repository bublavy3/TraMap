<script setup>
import { computed, ref } from "vue"
import { findQuickestJourney } from "../functions/findQuickestJourney.js";
import TripVisualization from "./TripVisualization.vue";

const props = defineProps({
  stations: Object,
  lines: Object,
  routes: Object
})

const startQuery = ref("")
const endQuery = ref("")
const startStation = ref(null)
const endStation = ref(null)
const activeSearch = ref(null)
const tripList = ref([])

const stationList = computed(() => Object.values(props.stations ?? {})) // computed with fallback empty option is needed because on opening of JourneyTab the stations were not yet loaded and the list remained empty

function minutesToTimestamp(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

function suggestions(query) {
  if (!query) {
    return []
  }
  return stationList.value.filter(station => station.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
}

const startSuggestions = computed(() => suggestions(startQuery.value))
const endSuggestions = computed(() => suggestions(endQuery.value))

function selectStation(field, station) {
  if (field === "start") {
    startStation.value = station
    startQuery.value = station.name
  } else {
    endStation.value = station
    endQuery.value = station.name
  }
  activeSearch.value = null
}

function findJourney() {
  if (!startStation.value || !endStation.value) {
    return
  }
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const tripsPath = findQuickestJourney(startStation.value.id, endStation.value.id, currentMinutes, props.lines, props.routes, props.stations)
  tripList.value = [] // empty the previous trip sequence first
  for (const trip of tripsPath) {
    const tripData = trip.trip.split("|")
    const line = props.lines[tripData[0]]
    tripList.value.push({
      startStationName: props.stations[trip.from].name,
      endStationName: props.stations[trip.to].name,
      lineName: line.name,
      lineColor: line.color,
      transportMode: line.transportMode,
      startTime: minutesToTimestamp(trip.departureTime),
      endTime: minutesToTimestamp(trip.arrivalTime)
    })
  }
}

function updateQuery(field, value) {
  tripList.value = []
  if (field === "start") {
    startQuery.value = value
    startStation.value = null
  } else {
    endQuery.value = value
    endStation.value = null
  }
  activeSearch.value = field
}

function setActiveSearch(field) {
  activeSearch.value = field
}
</script>

<template>
  <div class="journey-tab">
    <div class="station-search">
      <label>
        <span>From</span>
        <input
          :value="startQuery"
          type="search"
          placeholder="Search start station"
          autocomplete="off"
          @focus="setActiveSearch('start')"
          @input="updateQuery('start', $event.target.value)"
        />
      </label>
      <ul v-if="activeSearch === 'start' && startSuggestions.length" class="suggestions">
        <li v-for="station in startSuggestions" :key="station.id">
          <button type="button" @click="selectStation('start', station)">{{ station.name }}</button>
        </li>
      </ul>
    </div>

    <div class="station-search">
      <label>
      <span>To</span>
        <input
          :value="endQuery"
          type="search"
          placeholder="Search destination station"
          autocomplete="off"
          @focus="setActiveSearch('end')"
          @input="updateQuery('end', $event.target.value)"
        />
      </label>
      <ul v-if="activeSearch === 'end' && endSuggestions.length" class="suggestions">
        <li v-for="station in endSuggestions" :key="station.id">
          <button type="button" @click="selectStation('end', station)">{{ station.name }}</button>
        </li>
      </ul>
    </div>
    <button type="button" class="search-button" :disabled="!startStation || !endStation" @click="findJourney">⌕</button>
  </div>
  <div v-for="trip in tripList" :key="`${trip.startTime}-${trip.lineName}-${trip.startStationName}`">
    <TripVisualization
        :startStationName="trip.startStationName"
        :endStationName="trip.endStationName"
        :lineName="trip.lineName"
        :lineColor="trip.lineColor"
        :transportMode="trip.transportMode"
        :startTime="trip.startTime"
        :endTime="trip.endTime"
    />
  </div>
</template>

<style src="../styles/JourneyTab.css" scoped></style>
