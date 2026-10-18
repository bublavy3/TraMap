<script setup>
import { ref } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  originalName: String,
  savingPending: Boolean,
  errorMessage: String,
})

const emit = defineEmits([
  "save", 
  "close"
])

const { t } = useI18n()
const name = ref(props.originalName)

function approveSaving() {
  return name.value.trim().length > 0 && !props.savingPending
}

function submit() {
  if (approveSaving()) {
    emit("save", name.value.trim())
  }
}

function closePopup() {
  emit("close")
}
</script>

<template>
  <div class="popup-back">
    <div class="project-dialog">
      <button class="project-dialog-close" type="button" :title="t('common.close')" @click="closePopup">×</button>
      <h2>{{ t("projectDialog.saveTitle") }}</h2>
      <form @submit.prevent="submit">
        <label for="project-name">{{ t("projectDialog.name") }}</label>
        <input id="project-name" v-model="name" type="text" required/>
        <button type="submit" :disabled="!approveSaving()">💾</button>
        <p v-if="props.errorMessage" class="project-dialog-error">{{ props.errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style src="../styles/SaveProjectDialog.css" scoped></style>
