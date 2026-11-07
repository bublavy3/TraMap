<script setup>
defineProps({
  startStationName: String,
  endStationName: String,
  lineName: String,
  lineColor: String,
  transportMode: String,
  startTime: String,
  endTime: String,
})
</script>

<template>
  <div class="trip">
    <div class="path-visualization">
      <span class="stop"></span>
      <span class="line" :style="{ backgroundColor: lineColor }"></span>
      <span class="stop"></span>
    </div>

    <div class="details">
      <div class="row">
        <span>{{ startStationName }}</span>
        <span>{{ startTime }}</span>
      </div>
      <div class="line-info">
        <span class="badge" :style="{ backgroundColor: lineColor }">{{ lineName }}</span>
        <span class="mode">{{ transportMode }}</span>
      </div>
      <div class="row">
        <span>{{ endStationName }}</span>
        <span>{{ endTime }}</span>
      </div>
    </div>
  </div>
</template>

<style src="../styles/TripVisualization.css" scoped></style>