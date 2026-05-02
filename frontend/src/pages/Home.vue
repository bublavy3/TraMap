<script setup>
import MapList from "../components/MapList.vue"
</script>

<template>
  <h1>Home</h1>

  <MapList />

  <router-link to="/creator">
    <button>Create new map</button>
  </router-link>
</template>