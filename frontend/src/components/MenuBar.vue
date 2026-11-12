<script setup>
import { useI18n } from "vue-i18n"
import { ref } from "vue"
import CountryProjectsDialog from "./CountryProjectsDialog.vue"

const props = defineProps({
  countries: Object,
  projects: Array
})

const { t } = useI18n()
const continentNames = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania"]
const selectedCountry = ref(null)

function openCountry(country) {
  selectedCountry.value = country
}

function closeCountryProjects() {
  selectedCountry.value = null
}
</script>

<template>
  <header class="menu-bar">
    <router-link to="/" class="menu-logo">{{ t("home.logo") }}</router-link>
    <nav class="continent-tabs">
      <div v-for="continent in continentNames" :key="continent" class="continent-tab">
        <button type="button" class="continent-button">{{ t(`home.continentNames.${continent}`) }}</button>
        <div class="continent-dropdown">
          <button v-for="country in countries[continent]" :key="country.code" type="button" class="country-option" @click="openCountry(country)">
            {{ country.name }}
          </button>
          <span v-if="!(countries[continent]).length" class="empty-country-list">{{ t("home.noCountries") }}</span>
        </div>
      </div>
    </nav>
    <div class="menu-general">
      <router-link to="/about" class="menu-general-button" :title="t('home.about')">𝒊</router-link>
      <router-link to="/login" class="menu-general-button" :title="t('home.login')">👤</router-link>
    </div>
  </header>
  <CountryProjectsDialog
    v-if="selectedCountry"
    :country="selectedCountry"
    :projects="props.projects"
    @close="closeCountryProjects"
  />
</template>

<style src="../styles/MenuBar.css" scoped></style>
