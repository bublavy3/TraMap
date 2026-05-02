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
  <div>
    <h2>Select map</h2>

    <div v-for="(countries, continent) in hierarchy" :key="continent">
      <h3>{{ continent }}</h3>

      <div v-for="(cities, country) in countries" :key="country">
        <h4>{{ country }}</h4>

        <ul>
          <li v-for="city in cities" :key="city.city">
            <router-link :to="`/viewer?img=${city.image}`">
              {{ city.city }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>