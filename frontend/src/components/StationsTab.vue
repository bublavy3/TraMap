<script setup>
const props = defineProps({
  stations: Array
})
</script>

<template>
  <div>
    <div v-for="station in stations" :key="station.id" class="station-row">
      <input v-model="station.name" />
    </div>
  </div>
</template>

<style src="../styles/StationsTab.css" scoped></style>