<script setup>
import { TransportMode } from "../constants/transportModes.js"

const props = defineProps({
  line: Object,
  focused: Boolean,
})

const emit = defineEmits([
  "lineDeleted",
  "lineFocused"
])

function handleRowClick() {
  emit("lineFocused", props.line.id)
}

function handleDeleteClick() {
  emit("lineDeleted", props.line.id)
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

    <button title="Reserved action">⏲</button>

    <button title="Delete line" @click="handleDeleteClick">🗑</button>
  </div>
</template>

<style src="../styles/LinesRow.css" scoped></style>