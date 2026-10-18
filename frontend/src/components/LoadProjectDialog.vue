<script setup>
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  loadingPending: Boolean,
  errorMessage: String,
})

const emit = defineEmits([
  "load",
  "close"
])

const { t } = useI18n()
const search = ref("")
const projects = ref([])
const searchingPending = ref(false)
const searchError = ref("")

async function searchProjects() {
  searchingPending.value = true
  try {
    const params = new URLSearchParams({ search: search.value.trim() })
    const response = await fetch(`/api/projects?${params}`)
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || t("projectDialog.searchFailed"))
    }
    projects.value = result.projects
    searchError.value = ""
  } catch (error) {
    searchError.value = error.message
  } finally {
    searchingPending.value = false
  }
}

function loadProject(projectId) {
  emit("load", projectId)
}

function closePopup() {
  emit("close")
}

onMounted(searchProjects)
</script>

<template>
  <div class="popup-back">
    <div class="project-dialog">
      <button class="project-dialog-close" type="button" :title="t('common.close')" @click="closePopup">×</button>
      <h2>{{ t("projectDialog.loadTitle") }}</h2>
      <form class="project-search" @submit.prevent="searchProjects">
        <label for="project-search">{{ t("projectDialog.search") }}</label>
        <div class="project-search-controls">
          <input id="project-search" v-model="search" type="search"/>
          <button type="submit">🔎︎</button>
        </div>
      </form>

      <p v-if="searchError || props.errorMessage" class="project-dialog-error">{{ t("common.error") }}: {{ searchError || props.errorMessage }}</p>
      <ul v-else class="project-results">
        <li v-for="project in projects" :key="project.id">
          <button type="button" :disabled="loadingPending" @click=loadProject(project.id)>
            <span>{{ project.name }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style src="../styles/LoadProjectDialog.css" scoped></style>
