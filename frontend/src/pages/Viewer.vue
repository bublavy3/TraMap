<script setup>
import { useRoute } from "vue-router"

// this page will serve the purpose of viewing real selected maps, right now it's here just as a placeholder

const route = useRoute()
const image = route.query.img
</script>

<template>
  <h1>Map Viewer - THIS IS PLACEHOLDER, DOES NOT WORK YET</h1>
  <img :src="image" style="max-width:100%" />
</template>