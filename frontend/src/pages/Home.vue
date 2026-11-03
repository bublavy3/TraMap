<script setup>
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import MenuBar from "../components/MenuBar.vue"
import { continents } from "../data/continents.js"

const { t, locale } = useI18n()
const router = useRouter()

const search = ref("")
const projects = ref([])
const searchPending = ref(false)
const searchError = ref("")

function getCountryName(code) {
  const displayNames = new Intl.DisplayNames([locale.value], { type: "region" })
  return displayNames.of(code)
}

function openProject(projectId) {
  router.push(`/viewer/${projectId}`)
}

function getSearchResults() {
  const value = search.value.trim().toLowerCase()
  if (!value) {
    return []
  }

  const searchResults = []
  projects.value.forEach(project => {
    const projectCountries = (project.countries || []).map(countryCode => ({
      countryCode,
      name: getCountryName(countryCode)
    }))
    const matchedCountries = projectCountries.filter(country => country.name.toLowerCase().includes(value))
    const nameMatches = project.name.toLowerCase().includes(value)
    if (!nameMatches && matchedCountries.length === 0) {
      return
    }
    searchResults.push({
      ...project,
      matchedCountries: nameMatches ? [] : matchedCountries // if search was matched based on country, we will show matching countries
    })
  })
  return searchResults
}

async function loadProjects() { // TODO almost a duplicity, export function from its own file
  searchPending.value = true
  searchError.value = ""
  try {
    const response = await fetch("/api/projects?search=")
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || t("home.searchFailed"))
    }
    projects.value = result.projects.map(project => ({
      ...project,
      countries: project.countries ? project.countries : []
    }))
  } catch (error) {
    searchError.value = error.message
  } finally {
    searchPending.value = false
  }
}

onMounted(loadProjects)
</script>

<template>
  <div class="home-page">
    <div class="home-content">
      <div class="home-search-field">
        <input id="home-search" v-model="search" type="search" autocomplete="off" :placeholder="t('home.searchPlaceholder')" /> <!-- autocomplete off disables browser suggesting saved location as country -->
        <span>⌕</span>
        <ul v-if="search.trim()" class="home-search-results">
          <li v-if="searchPending" class="result-message">{{ t("home.searching") }}</li>
          <li v-else-if="searchError">{{ searchError }}</li>
          <template v-else>
            <li v-for="project in getSearchResults()" :key="project.id">
              <button type="button" @click="openProject(project.id)">
                <strong>{{ project.name }}</strong>
                <span v-if="project.matchedCountries.length">
                  {{ project.matchedCountries.map(country => country.name).join(", ") }}
                </span>
              </button>
            </li>
          </template>
        </ul>
      </div>
      <div class="home-creator-suggestion">
        <p>{{ t("home.creatorSuggestionText") }}</p>
        <router-link to="/creator" class="create-map-button">{{ t("home.createMap") }}</router-link>
      </div>
    </div>
  </div>
</template>

<style src="../styles/Home.css" scoped></style>
