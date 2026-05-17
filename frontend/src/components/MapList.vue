<script setup>
import { maps } from "../data/maps"

const hierarchy = {}

maps.forEach(m => {
  if (!hierarchy[m.continent]) {
    hierarchy[m.continent] = {}
  }
  if (!hierarchy[m.continent][m.country]) {
    hierarchy[m.continent][m.country] = []
  }
  hierarchy[m.continent][m.country].push(m)
})
</script>

<template>
  <div class="map-list">
    <h2>Select map</h2>
    <details v-for="(countries, continent) in hierarchy" :key="continent">
      <summary>{{ continent }}</summary>
      <details v-for="(cities, country) in countries" :key="country" class="country">
        <summary>{{ country }}</summary>
        <ul class="cities">
          <li v-for="city in cities" :key="city.city">
            <router-link :to="`/viewer?img=${city.image}`">
              {{ city.city }}
            </router-link>
          </li>
        </ul>
      </details>
    </details>
  </div>
</template>

<style src="../styles/MapList.css" scoped></style>
