<script setup>
import { computeDirectionTimetable } from "../functions/computeDirectionTimetable.js";

const props = defineProps({
  line: Object,
  directionName: String,
  stations: Object,
  routes: Object
})

const directionTimetable = computeDirectionTimetable(props.line, props.directionName, props.stations, props.routes)
</script>

<template>
  <div class="timetable">
    <table>
      <thead>
        <tr>
          <th v-for="stationId in directionTimetable.stations" :key="stationId">
            {{ props.stations[stationId].name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="([departureTime, stationTimes]) in Object.entries(directionTimetable.timetable)" :key="departureTime">
          <td>{{ departureTime }}</td>
          <td v-for="(stationTime, index) in stationTimes" :key="`${departureTime}-${index}`">
            {{ stationTime }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style src="../styles/LineDirectionView.css" scoped></style>
