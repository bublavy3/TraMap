<script setup>
import { useI18n } from "vue-i18n"

defineProps({
  countries: { type: Object, required: true }
})

const { t } = useI18n()
const continentNames = ["Europe", "Asia", "Africa", "North America", "South America", "Oceania"]
</script>

<template>
  <header class="menu-bar">
    <router-link to="/" class="menu-logo">{{ t("home.logo") }}</router-link>
    <nav class="continent-tabs">
      <div v-for="continent in continentNames" :key="continent" class="continent-tab">
        <button type="button" class="continent-button">{{ t(`home.continentNames.${continent}`) }}</button>
        <div class="continent-dropdown">
          <button v-for="country in countries[continent]" :key="country.code" type="button" class="country-option">
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
</template>

<style src="../styles/MenuBar.css" scoped></style>
