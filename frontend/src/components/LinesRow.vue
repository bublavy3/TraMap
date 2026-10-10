<script setup>
import { TransportMode } from "../constants/transportModes.js"
import { ref } from "vue"
import TimetablePopup from "./TimetablePopup.vue"

const props = defineProps({
  line: Object,
  routes: Object,
  stations: Object,
  junctions: Object,
  focused: Boolean
})

const emit = defineEmits([
  "lineDeleted",
  "lineFocused"
])

const timetableOpen = ref(false)

function handleRowClick() {
  emit("lineFocused", props.line.id)
}

function handleDeleteClick() {
  emit("lineDeleted", props.line.id)
}

function openTimetablePopup() {
  timetableOpen.value = true
}

function closeTimetablePopup() {
  timetableOpen.value = false
}

</script>

<template>
  <div class="line-row" :class="{ 'focused-line-row': focused }" @click="handleRowClick">
    <input
        type="text"
        v-model="line.name"
        placeholder="Line name"
        class="line-name-input"

    />

    <input
        title="Line color"
        type="color"
        class="line-color-input"
        v-model="line.color"
    />

    <select v-model="line.transportMode" class="line-mode-select">
      <option v-for="mode in Object.values(TransportMode)" :key="mode" :value="mode">
        {{ mode }}
      </option>
    </select>

    <button title="Open timetable" @click="openTimetablePopup">⏲</button>

    <button title="Delete line" @click="handleDeleteClick">🗑</button>
  </div>
  <TimetablePopup v-if="timetableOpen" :line="line" :routes="routes" :stations="stations" :junctions="junctions" @close="closeTimetablePopup" />
</template>

<style src="../styles/LinesRow.css" scoped></style>
