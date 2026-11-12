<script setup>
import { useI18n } from "vue-i18n"

const props = defineProps({
  country: Object,
  projects: Array
})

const emit = defineEmits([
    "close"
])

const { t } = useI18n()

function getCountryProjects() {
  return props.projects.filter(project => (project.countries || []).includes(props.country.code))
}
</script>

<template>
  <div class="popup-back">
    <div class="country-projects-popup">
      <button class="country-projects-close" type="button" :title="t('common.close')" @click="emit('close')">×</button>
      <h2>{{ country.name }}</h2>
      <ul class="country-projects-list">
        <li v-for="project in getCountryProjects()" :key="project.id">
          <router-link :to="`/viewer/${project.id}`" @click="emit('close')">{{ project.name }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<style src="../styles/CountryProjectsDialog.css" scoped></style>
