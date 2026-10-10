<script setup>
import TrafficTimeBar from "./TrafficTimeBar.vue";
import {ref} from "vue";

const props = defineProps({
  line: Object,
  routes: Object,
  stations: Object,
})

const intervals = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 40, 45, 50, 60, 90, 120]
const startStation = ref(null)
const endStation = ref(null)
const passthroughStations = ref([])
const startTime = ref("")
const endTime = ref("")
const interval = ref(intervals[0])

function addSequence() {
  if (!startStation.value || !endStation.value || !startTime.value || !endTime.value) {
    return  // TODO disable button
  }
  const start = props.stations[startStation.value]
  const end = props.stations[endStation.value]
  const passthroughExists = passthroughStations.value[0] in props.stations
  const directionName = passthroughExists
      ? `${start.name} - ${passthroughStations.value.map(stationId => props.stations[stationId].name).join(" - ")} - ${end.name}`
      : `${start.name} - ${end.name}`
  const newSequence = {
    id: Date.now(),
    startTime: startTime.value,
    endTime: endTime.value,
    interval: interval.value
  }
  if (directionName in props.line.directions) {
    props.line.directions[directionName].sequences.push(newSequence)
  } else {
    props.line.directions[directionName] = {  // TODO is key-ing by directionName so practical that it outweighs the inconsistency with other data structures? Probably not
      id: Date.now() + 1,
      name: directionName,
      startStation: startStation.value,
      endStation: endStation.value,
      passthroughStations: passthroughExists ? passthroughStations.value : null,
      sequences: [newSequence]
    }
  }
}

function deleteSequence(directionName, sequenceId) {
  const direction = props.line.directions[directionName]
  direction.sequences = direction.sequences.filter(sequence => sequence.id !== sequenceId)
  if (direction.sequences.length === 0) {
    delete props.line.directions[directionName]
  }
}
</script>

<template>
  <div class="lineDirectionEditor">
    <TrafficTimeBar :levels="props.line.trafficLevels" />

    <div class="pathRow">
      <label>Start station
        <select v-model="startStation">
          <option disabled value="">Select a station</option>
          <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }}</option>
        </select>
      </label>
      <label>Pass through
        <select v-model="passthroughStations" multiple size="1" aria-label="Pass through stations">
          <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }}</option>
        </select>
      </label>
      <label>Final station
        <select v-model="endStation">
          <option disabled value="">Select a station</option>
          <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }}</option>
        </select>
      </label>
    </div>

    <div class="scheduleRow">
      <label>First departure time
        <input v-model="startTime" type="time">
      </label>
      <label>Interval
        <select v-model.number="interval">
          <option v-for="minutes in intervals" :key="minutes" :value="minutes">{{ minutes }} minutes</option>
        </select>
      </label>
      <label>Last departure time before
        <input v-model="endTime" type="time">
      </label>
    </div>

    <button type="button" @click="addSequence">Add sequence</button>

    <table>
      <thead>
      <tr>
        <th>Name</th>
        <th>Departure time</th>
        <th>Last departure time limit</th>
        <th>Interval</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <!-- template adds no extra element, just hosts the outer loop -->
      <template v-for="direction in props.line.directions" :key="direction.id">
        <tr v-for="sequence in direction.sequences" :key="sequence.id">
          <td>{{ direction.name }}</td>
          <td>{{ sequence.startTime }}</td>
          <td>{{ sequence.endTime }}</td>
          <td>{{ sequence.interval }} min</td>
          <td><button type="button" @click="deleteSequence(direction.name, sequence.id)">Delete</button></td>
        </tr>
      </template>
      </tbody>
    </table>

  </div>
</template>

<style src="../styles/LineDirectionEditor.css" scoped></style>
