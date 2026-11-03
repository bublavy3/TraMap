<script setup>
import { useI18n } from "vue-i18n";
import {prepareRoutesByStation} from "../functions/prepareRoutesByStation.js";
import {computeDirectionTimetable} from "../functions/computeDirectionTimetable.js";
import DirectionVisualization from "./DirectionVisualization.vue";

const { t } = useI18n()

const props = defineProps({
  openedStationId: Number,
  stations: Object,
  lines: Object,
  routes: Object,
  junctions: Object
})

const emit = defineEmits([
  "close"
])

function closePopup() {
  emit("close", null)
}

function getMinutes(timestamp) {
  const [hours, minutes] = timestamp.split(":");
  return Number(hours) * 60 + Number(minutes) * 60;
}

function nextArriving(time) {
  const totalMinutes = getMinutes(time)
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  return totalMinutes > currentTotalMinutes;
}

const routesFromStation = Object.fromEntries(Object.entries(props.routes).filter(
    ([_, route]) => route.stationA === props.openedStationId || route.stationB === props.openedStationId
))
const linesFromStation = [...new Set(Object.values(routesFromStation).flatMap(route => route.lines))] // each line id shall be in the list only once

const routesOnLinesFromStation = {} // keyed by station / junction
linesFromStation.forEach(lineId => {
  const routesOnLine = Object.fromEntries(Object.entries(props.routes).filter(
      ([_, route]) => route.lines && route.lines.includes(lineId)
  ))
  routesOnLinesFromStation[lineId] = prepareRoutesByStation(routesOnLine)  // also by junction
})

const stationsOnLines = {}
linesFromStation.forEach(lineId => {
  stationsOnLines[lineId] = Object.fromEntries(Object.entries(props.stations).filter(([id]) => id in routesOnLinesFromStation[lineId])) // no junctions here anymore
})

const directionsTimetables = {}
const linesFiltered = Object.fromEntries(Object.entries(props.lines).filter(([id]) => linesFromStation.includes(Number(id))))
let maxDuration = 0
let minDuration = 1000000 // we really don't expect trips longer than 694 days so this is fine
for (const line of Object.values(linesFiltered)) {
  for (const direction in line.directions) {  // in iterates through keys which are direction names
    const directionTimetable = computeDirectionTimetable(line, direction, routesOnLinesFromStation[line.id], stationsOnLines[line.id])
    const positionOnLine = directionTimetable.stations.indexOf(props.openedStationId)
    directionTimetable.stations = directionTimetable.stations.slice(positionOnLine)
    directionTimetable.stations = directionTimetable.stations.map(id => props.stations[id].name)  // name array instead of id array
    directionTimetable.timetable = Object.entries(directionTimetable.timetable).map(([key, value]) => [key, ...value].slice(positionOnLine)) // change format to array of arrays starting with the departure time
    directionTimetable.timetable = directionTimetable.timetable.find(trip => nextArriving(trip[0]));  // keep only the array with times for next arriving vehicle
    directionTimetable["lineColor"] = line.color
    directionTimetable["lineName"] = line.name
    const tripDuration = getMinutes(directionTimetable.timetable[directionTimetable.timetable.length - 1]) - getMinutes(directionTimetable.timetable[0])
    if (tripDuration > maxDuration) {
      maxDuration = tripDuration
    }
    if (tripDuration < minDuration) {
      minDuration = tripDuration
    }
    directionsTimetables[`${line.name} : ${direction}`] = directionTimetable
  }
}

console.log(maxDuration)
console.log(minDuration)
</script>

<template>
  <div class="popup-back">
    <div class="timetable-popup">
      <button class="timetable-close" type="button" :title="t('common.close')" @click="closePopup">×</button>
      <div v-for="directionTimetable of directionsTimetables" class="visualization-block">
        <template v-if="directionTimetable.stations.length > 1">
          <span class="line-logo" :style="{ backgroundColor: directionTimetable.lineColor }">{{ directionTimetable.lineName }}</span> <!-- TODO conditional line text color or limit line color to not allowed too bright values-->
          <DirectionVisualization
              v-if="directionTimetable.stations.length > 1"
              :stationNames="directionTimetable.stations"
              :times="directionTimetable.timetable"
              :color="directionTimetable.lineColor"
              :maxDuration="maxDuration"
              :minDuration="minDuration"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style src="../styles/StationTimetableDialog.css" scoped></style>
