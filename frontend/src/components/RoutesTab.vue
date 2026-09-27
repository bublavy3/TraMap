<script setup>
const props = defineProps({
  routes: Object
})
</script>

<template>
  <div>
    <div v-for="route in routes" :key="route.id" class="route-row">
      <p>route</p>
    </div>
  </div>
</template>

<style src="../styles/RoutesTab.css" scoped></style>
