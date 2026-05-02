<script setup>
import BaseMap from "./BaseMap.vue"

const props = defineProps({
  mode: String,
  imageUrl: String,
  stations: Array
})

const emit = defineEmits([
    "addStation"
])

// for now all we do on right click is add stations to the map, the provided functionality will of course be largely expanded
function handleRightClick(coordinates) {
  emit("addStation", coordinates)
}
</script>

<template>
  <BaseMap
      :mode="mode"
      :imageUrl="imageUrl"
      :stations="stations"
      @rightClick="handleRightClick"
  />
</template>