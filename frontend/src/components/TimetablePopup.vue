<script setup>
import { ref } from "vue"
import LineDirectionEditor from "./LineDirectionEditor.vue"
import LineDirectionView from "./LineDirectionView.vue"
import {prepareRoutesByStation} from "../functions/prepareRoutesByStation.js";

const props = defineProps({
  line: Object,
  routes: Object,
  stations: Object,
  junctions: Object
})

const emit = defineEmits([
    "close"
])

const NEW_DIRECTION = "new_direction"
const directionKeys = Object.keys(props.line.directions)
const direction = ref(directionKeys.length > 0 ? directionKeys[0] : NEW_DIRECTION)

function closePopup() {
  emit("close", null)
}


const routesOnLine = Object.fromEntries(Object.entries(props.routes).filter(
    ([_, route]) => route.lines && route.lines.includes(props.line.id)
))
const routesByStation = prepareRoutesByStation(routesOnLine)  // also by junction
const stationsOnLine = Object.fromEntries(Object.entries(props.stations).filter(([id]) => id in routesByStation)) // no junctions here anymore
</script>

<template>
  <div class="popup-back">
    <div class="timetable-popup">
      <button class="timetable-close" type="button" title="Close timetable" aria-label="Close timetable" @click="closePopup">×</button>
      <h2 id="timetable-title">Timetable</h2>
      <label class="timetable-direction">
        <span>Direction</span>
        <select v-model="direction">
          <option v-for="key in Object.keys(line.directions)" :key="key" :value="key">
            {{ key }}
          </option>
          <option :value="NEW_DIRECTION">Add new direction</option>
        </select>
      </label>

      <LineDirectionEditor
          v-if="direction === NEW_DIRECTION"
          class="timetable-direction-content"
          :line="line"
          :routes="routes"
          :stations="stationsOnLine"
      />
      <LineDirectionView
          v-else
          class="timetable-direction-content"
          :line="line"
          :directionName="direction"
          :routes="routesByStation"
          :stations="stationsOnLine"
      />
    </div>
  </div>
</template>

<style src="../styles/TimetablePopup.css" scoped></style>
