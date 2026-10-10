<script setup>
import {findPathToStation} from "../functions/findPathToStation.js";

const props = defineProps({
  line: Object,
  directionName: String,
  routes: Object,
  stations: Object
})

function fillUnspecifiedTravelTimes(standardTimes, timesToProcess) {
  for (let i = 0; i < standardTimes.length; i++) {
    if (timesToProcess[i] === 0) {
      timesToProcess[i] = standardTimes[i];
    }
  }
  return timesToProcess;
}

function orderStations(routes, startStation) {
  const stationsOrdered = [startStation];
  let current = startStation;
  for (const route of routes) {
    current = route.stationA === current ? route.stationB : route.stationA;
    stationsOrdered.push(current);
  }
  return stationsOrdered;
}

function removeJunctions(nodes, travelTimes, timesHighTraffic, timesLowTraffic) {
  const filteredStations = [nodes[0]];
  const filteredTimes = [];
  const filteredHighTimes = [];
  const filteredLowTimes = [];
  let accumulatedTime = 0;
  let accumulatedHighTime = 0;
  let accumulatedLowTime = 0;

  for (let i = 1; i < nodes.length; i++) {
    accumulatedTime += travelTimes[i - 1];
    accumulatedHighTime += timesHighTraffic[i - 1];
    accumulatedLowTime += timesLowTraffic[i - 1];
    if (nodes[i] in props.stations) { // not a junction
      filteredStations.push(nodes[i]);
      filteredTimes.push(accumulatedTime);
      filteredHighTimes.push(accumulatedHighTime);
      filteredLowTimes.push(accumulatedLowTime);
      accumulatedTime = 0;
      accumulatedHighTime = 0;
      accumulatedLowTime = 0;
    }
  }
  return {
    filteredStations: filteredStations,
    travelTimes: filteredTimes,
    timesHighTraffic: filteredHighTimes,
    timesLowTraffic: filteredLowTimes
  };
}

function timestampToSeconds(timestamp) {
  const [hours, minutes] = timestamp.split(":");
  return (Number(hours) * 3600) + (Number(minutes) * 60);
}

function secondsToTimestamp(seconds) {
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getHalfHourBlock(seconds) {
  return Math.floor(seconds / 1800)
}

function getAllStationTimes(departure, standardTimes, highTimes, lowTimes, traffic) {
  let nextArrivalTime = departure
  let arrivalTimes = []
  for (let i = 0; i < standardTimes.length; i++) {
    switch (traffic[getHalfHourBlock(nextArrivalTime)]) {
      case 0:
        nextArrivalTime += lowTimes[i]
        break;
      case 1:
        nextArrivalTime += standardTimes[i]
        break;
      case 2:
        nextArrivalTime += highTimes[i]
        break;
    }
    arrivalTimes.push(secondsToTimestamp(nextArrivalTime));
  }
  return arrivalTimes;
}

const direction = props.line.directions[props.directionName]
let path = []
if (direction.passthroughStations) {
  const guidingStations = [direction.startStation, ...direction.passthroughStations, direction.endStation]
  for (let i = 0; i < guidingStations.length - 1; i++) {
    path.push(...findPathToStation(guidingStations[i], guidingStations[i + 1], props.routes))
  }
  // TODO shortest path? ensure it doesn't go back if continuation possible
} else {
  path = findPathToStation(direction.startStation, direction.endStation, props.routes)
}

const travelTimes = path.map(route => route.travelTime)
let travelTimesHighTraffic = path.map(route => route.highTrafficTime)
let travelTimesLowTraffic = path.map(route => route.lowTrafficTime)
travelTimesHighTraffic = fillUnspecifiedTravelTimes(travelTimes, travelTimesHighTraffic)
travelTimesLowTraffic = fillUnspecifiedTravelTimes(travelTimes, travelTimesLowTraffic)

const stationsOrdered = orderStations(path, direction.startStation)
const timetableData = removeJunctions(stationsOrdered, travelTimes, travelTimesHighTraffic, travelTimesLowTraffic)

const timetableEntries = {}
for (const sequence of direction.sequences) {
  const startTime = timestampToSeconds(sequence.startTime)
  const endTime = timestampToSeconds(sequence.endTime)
  const interval = sequence.interval * 60

  for (let departureTime = startTime; departureTime <= endTime; departureTime += interval) {
    timetableEntries[secondsToTimestamp(departureTime)] = getAllStationTimes(
        departureTime,
        timetableData.travelTimes,
        timetableData.timesHighTraffic,
        timetableData.timesLowTraffic,
        props.line.trafficLevels
    )
  }
}
const timetable = Object.fromEntries(
  Object.entries(timetableEntries).sort((first, second) => first[0].localeCompare(second[0]))
)
</script>

<template>
  <div class="timetable">
    <table>
      <thead>
        <tr>
          <th v-for="stationId in timetableData.filteredStations" :key="stationId">
            {{ props.stations[stationId].name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="([departureTime, stationTimes]) in Object.entries(timetable)" :key="departureTime">
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
