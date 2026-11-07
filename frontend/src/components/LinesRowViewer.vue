<script setup>
import { ref } from "vue"
import LineTimetableDialog from "./LineTimetableDialog.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  line: Object,
  routes: Object,
  stations: Object,
  junctions: Object
})

const timetableOpen = ref(false)

function openTimetablePopup() {
  timetableOpen.value = true
}

function closeTimetablePopup() {
  timetableOpen.value = false
}

function capitalize(modeName) {
  return modeName.charAt(0).toUpperCase() + modeName.slice(1)
}
</script>

<template>
  <div class="line-row">
    <span class="line-color" :style="{ backgroundColor: props.line.color }"/>

    <span class="line-name">{{ props.line.name }}</span>

    <span class="line-mode">{{ capitalize(props.line.transportMode) }}
    </span>

    <button :title="t('common.openTimetable')" @click="openTimetablePopup">⏲</button>
  </div>
  <LineTimetableDialog v-if="timetableOpen" :line="line" :routes="routes" :stations="stations" :junctions="junctions" :editing-allowed="false" @close="closeTimetablePopup" />
</template>

<style src="../styles/LinesRowViewer.css" scoped></style>