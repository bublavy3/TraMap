<script setup>
const props = defineProps({
  stationNames: Array,
  times: Array,
  color: String,
  maxDuration: Number,
  minDuration: Number
})

function minutesToTimestamp(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`
}

const departure = props.times[0]
const totalDuration = props.times[props.times.length - 1] - departure
const minimumWidth = Math.max(props.minDuration / props.maxDuration * 100, 25)
const width = minimumWidth + (totalDuration - props.minDuration) / (props.maxDuration - props.minDuration) * (100 - minimumWidth) // 25% is minimum width, rest is scaled between shortest and longest line

function getStops() {
  return props.stationNames.map((name, i) => ({
    name,
    time: minutesToTimestamp(props.times[i]),
    position: totalDuration > 0 ? ((props.times[i] - departure) / totalDuration) * 100 : 0  // proportional percentage of full duration traveled
  }))
}

function getArrows() {
  const stops = getStops()
  const arrows = []
  for (let i = 0; i < stops.length - 1; i++) {
    arrows.push((stops[i].position + stops[i + 1].position) / 2)
  }
  return arrows
}
</script>

<template>
  <div class="direction-visualization-container">
    <div class="direction-visualization" :style="{ width: width + '%' }">
      <div class="line" :style="{ backgroundColor: color }"></div>
      <div v-for="position in getArrows()" :key="'arrow-' + position" class="arrow" :style="{ left: position + '%', borderLeftColor: color }"/>
      <div v-for="stop in getStops()" :key="stop.name" class="stop-column" :style="{ left: stop.position + '%' }">
        <span class="name">{{ stop.name }}</span>
        <span class="dot"></span>
        <span class="time">{{ stop.time }}</span>
      </div>
    </div>
  </div>
</template>

<style src="../styles/DirectionVisualization.css" scoped></style>