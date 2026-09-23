<script setup>
import { TransportMode } from "../constants/transportModes.js"
import {ref} from "vue";

const props = defineProps({
  line: Object,
  focused: Boolean,
})

const emit = defineEmits([
    "deleteLine",
    "lineFocused",
    "lineUnfocused"
])

const nameInput = ref(null) // the whole div cannot be focused in HTML so name input will be used to focus the line
defineExpose({  // we will pass a function to LinesTab that allows for focusing the row manually by it
  focusNameInput() {
    nameInput.value?.focus()
  }
})

function handleFocusing() {
  emit("lineFocused", props.line.id)
}

function handleUnfocusing() {
  emit("lineUnfocused", props.line.id)
}

function handleDeleteClick() {
  emit("deleteLine", props.line.id)
}
</script>

<template>
  <div class="line-row" :class="{ 'focused-line-row': focused }" @focusin="handleFocusing" @focusout="handleUnfocusing">
    <input type="text" v-model="line.name" placeholder="Line name" class="line-name-input" ref="nameInput"/>

    <input title="Line color" type="color" class="line-color-input" v-model="line.color" />

    <select v-model="line.transportMode" class="line-mode-select">
      <option v-for="mode in Object.values(TransportMode)" :key="mode" :value="mode">
        {{ mode }}
      </option>
    </select>

    <button title="Reserved action">⏲</button>  <!-- use something other than emoji later -->
    <!--      type="button"-->
    <!--      class="line-action-button line-action-button&#45;&#45;reserved"-->

    <button title="Delete line" @click="handleDeleteClick">🗑</button> <!-- use something other than emoji later -->
<!--      type="button"-->
<!--      class="line-action-button line-action-button&#45;&#45;delete"-->
  </div>
</template>

<style src="../styles/LinesRow.css" scoped></style>
