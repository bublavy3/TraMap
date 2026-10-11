<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  levels: Array
})

const levelNames = ['lowTrafficExpected', 'standardTravelTimes', 'highTrafficExpected']

// when mouse is tugged across multiple blocks the new value of first one is set to all
const tuggingMode = ref(false)
const newLevel = ref(1)

function limitLevel(level) {
  return Math.min(Math.max(level, 0), 2);
}

function setLevel(index, level) {
  props.levels[index] = level
}

function mouseDown(event, index) {
  const currentLevel = props.levels[index]
  if (event.button === 0) { // left click
    newLevel.value = limitLevel(currentLevel + 1)
  } else if (event.button === 2) {  // right click
    newLevel.value = limitLevel(currentLevel - 1)
  } else {
    return
  }

  tuggingMode.value = true
  setLevel(index, newLevel.value)
}

function mouseEnter(index) {
  if (tuggingMode.value) {
    setLevel(index, newLevel.value)
  }
}

function stopPainting() {
  tuggingMode.value = false
}
</script>

<template>
  <div class="traffic-bar">
    <div class="editing-bar" @mouseup="stopPainting" @mouseleave="stopPainting" @contextmenu.prevent> <!-- do not open context menu on right click -->
      <span v-for="hour in 24" :key="hour" class="hour-label">
        {{hour - 1}}
      </span>
      <div
          v-for="(level, index) in levels"
          :key="index"
          :class="'level-' + level"
          @mousedown.prevent="mouseDown($event, index)"
          @mouseenter="mouseEnter(index)"
      ></div>
    </div>
    <div class="legend">
      <span v-for="(name, level) in levelNames" :key="name">
        <span class="legend-sample" :class="'level-' + level"></span>
        {{ t(`traffic.${name}`) }}
      </span>
    </div>
  </div>
</template>

<style src="../styles/TrafficTimeBar.css" scoped></style>