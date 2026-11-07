<script setup>
import { useI18n } from "vue-i18n";
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

function nextArriving(time) { // return whether the departure time is the closest one upcoming
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return time > currentMinutes
}

const routesFromStation = Object.keys(props.routes).filter(key => {
  const route = props.routes[key]
  return route.stationA === props.openedStationId || route.stationB === props.openedStationId
}).map(Number)
const linesFromStation = Object.values(props.lines).filter(line => line.routes.some(route => routesFromStation.includes(route)))

const directionsTimetables = {}
let maxDuration = 0
let minDuration = 1000000 // we really don't expect trips longer than 694 days so this is fine
for (const line of linesFromStation) {
  for (const direction in line.directions) {  // in iterates through keys which are direction names
    const directionTimetable = computeDirectionTimetable(line, direction, props.stations, props.routes)
    const positionOnLine = directionTimetable.stations.indexOf(props.openedStationId)
    directionTimetable.stations = directionTimetable.stations.slice(positionOnLine)
    directionTimetable.stations = directionTimetable.stations.map(id => props.stations[id].name)  // name array instead of id array
    directionTimetable.timetable = directionTimetable.timetable.map(trip => trip.slice(positionOnLine))
    directionTimetable.timetable = directionTimetable.timetable.find(trip => nextArriving(trip[0]))  // keep only the array with times for next arriving vehicle
    directionTimetable["lineColor"] = line.color
    directionTimetable["lineName"] = line.name
    const tripDuration = directionTimetable.timetable[directionTimetable.timetable.length - 1] - directionTimetable.timetable[0]
    if (tripDuration > maxDuration) {
      maxDuration = tripDuration
    }
    if (tripDuration < minDuration) {
      minDuration = tripDuration
    }
    directionsTimetables[`${line.name} : ${direction}`] = directionTimetable
  }
}
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
