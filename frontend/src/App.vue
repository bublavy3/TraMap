<script setup>
import { continents } from "./data/continents.js";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router"
import MenuBar from "./components/MenuBar.vue";

const route = useRoute()

const { locale } = useI18n()

const projects = ref([])

function getCountryName(code) {
  const displayNames = new Intl.DisplayNames([locale.value], { type: "region" })
  return displayNames.of(code)
}

function getAvailableCountries() {
  const usedCodes = new Set()
  projects.value.forEach(project => {
    const projectCodes = project.countries || []
    projectCodes.forEach(code => usedCodes.add(code))
  })

  const countriesByContinent = {}
  Object.entries(continents).forEach(([continentName, continentCodes]) => {
    const usedContinentCodes = continentCodes.filter(code => usedCodes.has(code))
    const countries = usedContinentCodes.map(code => ({
      code,
      name: getCountryName(code)
    }))
    countries.sort((a, b) => a.name.localeCompare(b.name))
    countriesByContinent[continentName] = countries
  })
  return countriesByContinent
}

async function loadProjects() {
    const response = await fetch("/api/projects?search=")
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || t("home.searchFailed"))
    }
    projects.value = result.projects.map(project => ({
      ...project,
      countries: project.countries ? project.countries : []
    }))
}

onMounted(loadProjects)
</script>

<template>
  <MenuBar v-if="route.path !== '/export'" :countries="getAvailableCountries()" :projects="projects" />
  <div>
    <router-view />
  </div>
</template>
