<script setup>
import { ref, watch, onMounted } from "vue"
import LinesRow from "./LinesRow.vue"
import { TransportMode } from "../constants/transportModes.js"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  lines: Object,
  routes: Object,
  stations: Object,
  junctions: Object
})

const emit = defineEmits([
  "lineFocused",
  "lineDeleted"
])

const nameFilter = ref("")
const transportModeFilter = ref("all")
const sortingCriteria = ref("name")
const sortingDirection = ref("ascending")
const focusedLineId = ref(null)
const displayedLines = ref([])

function handleLineFocused(lineId) {
  focusedLineId.value = lineId
  emit("lineFocused", lineId)
}

function lineMatchesNameFilter(line, inputtedText) {
  return !inputtedText || line.name.includes(inputtedText)
}

function lineMatchesModeFilter(line, modeFilter) {
  return modeFilter === "all" || line.transportMode === modeFilter
}

function compareLines(left, right, sortingCriteria) {
  if (sortingCriteria === "transportMode") {
    return left.transportMode.localeCompare(right.transportMode)
  }
  return left.name.localeCompare(right.name)
}

function refreshDisplayedLines(firstLine = null) {
  let lines = Object.values(props.lines).filter((line) => {
    return lineMatchesNameFilter(line, nameFilter.value) && lineMatchesModeFilter(line, transportModeFilter.value)
  })

  lines.sort((left, right) => {
    let comparisonResult = compareLines(left, right, sortingCriteria.value)
    if (comparisonResult === 0) { // if same name and mode, use id to decide
      comparisonResult = String(left.id).localeCompare(String(right.id))
    }
    return comparisonResult * (sortingDirection.value === "ascending" ? 1 : -1)
  })

  if (firstLine) { // newly added line goes first
    const index = lines.findIndex(line => line.id === firstLine)
    const newLine = lines.splice(index, 1)[0]
    lines.unshift(newLine)
  }
  displayedLines.value = lines
}

onMounted(() => {
  refreshDisplayedLines()
})

watch( [nameFilter, transportModeFilter, sortingCriteria, sortingDirection], () => {
  refreshDisplayedLines()
})

async function addLine() {
  const newLine = {
    id: Date.now(),
    name: "New line",
    color: "#101010",
    transportMode: TransportMode.BUS,
    directions: {},
    trafficLevels: new Array(48).fill(1)
  }

  props.lines[newLine.id] = newLine
  refreshDisplayedLines(newLine.id)
}

function handleDeleteLine(lineId) {
  if (props.lines[lineId]) {
    delete props.lines[lineId]
    emit("lineDeleted", lineId)
  }

  if (focusedLineId.value === lineId) {
    focusedLineId.value = null
  }

  refreshDisplayedLines()
}
</script>

<template>
  <div class="lines-tab">
    <div class="lines-main-controls">
      <button type="button" class="lines-add-button" :title="t('lines.addLine')" @click="addLine">+</button>

      <div class="lines-filtering-and-sorting">
        <input v-model="nameFilter" type="text" class="lines-filter-or-sort-field" :placeholder="t('common.filterByName')"/>

        <select v-model="transportModeFilter" class="lines-filter-or-sort-field">
          <option value="all">{{ t('lines.allTransportModes') }}</option>
          <option v-for="mode in Object.values(TransportMode)" :key="mode" :value="mode">
            {{ t(`transportModes.${mode}`) }}
          </option>
        </select>

        <select v-model="sortingCriteria" class="lines-filter-or-sort-field">
          <option value="name">{{ t('lines.sortByName') }}</option>
          <option value="transportMode">{{ t('lines.sortByTransportMode') }}</option>
        </select>

        <select v-model="sortingDirection" class="lines-filter-or-sort-field">
          <option value="ascending">{{ t('common.ascending') }}</option>
          <option value="descending">{{ t('common.descending') }}</option>
        </select>
      </div>
    </div>

    <div v-if="displayedLines.length" class="lines-list">
      <LinesRow
          v-for="line in displayedLines"
          :key="line.id"
          :line="line"
          :routes="routes"
          :stations="stations"
          :junctions="junctions"
          :focused="line.id === focusedLineId"
          @lineDeleted="handleDeleteLine"
          @lineFocused="handleLineFocused"
      />
    </div>
  </div>
</template>

<style src="../styles/LinesTab.css" scoped></style>
