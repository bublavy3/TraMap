<script setup>
import { ref, watch, onMounted } from "vue"
import RoutesRow from "./RoutesRow.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  routes: Object,
  stations: Object,
  lines: Object,
})

const emit = defineEmits([
    "hover",
    "routeDeleted"
])

const stationFilter = ref("")
const lineFilter = ref("")
const displayedRoutes = ref([])
const enableHighTrafficTimes = ref(false)
const enableLowTrafficTimes = ref(false)

function routeMatchesStationFilter(route, inputtedText) {
  return !inputtedText || props.stations[route.stationA].name.includes(inputtedText) || props.stations[route.stationB].name.includes(inputtedText)
}

function routeMatchesLineFilter(route, inputtedText){
  const filteredLineIds = Object.fromEntries(Object.entries(props.lines).filter(([_, value]) => value.name.includes(inputtedText)));

  return !inputtedText || route.lines.some(lineId => lineId in filteredLineIds)
}

function refreshDisplayedRoutes() {
  displayedRoutes.value = Object.values(props.routes).filter(route => {
    return routeMatchesStationFilter(route, stationFilter.value) && routeMatchesLineFilter(route, lineFilter.value)
  })
}

onMounted(() => {
  refreshDisplayedRoutes()
})

watch([stationFilter, lineFilter, () => props.routes], () => {
  refreshDisplayedRoutes()
}, { deep: true })

function getRouteName(route) {
  return `${props.stations[route.stationA].name} - ${props.stations[route.stationB].name}`
}

function handleRouteDeleted(routeId) {
  emit("routeDeleted", routeId)
  refreshDisplayedRoutes()
}

function handleRouteHover(routeId) {
  emit("hover", routeId)
}
</script>

<template>
  <div class="routes-tab">
    <div class="routes-main-controls">
      <div class="routes-filtering">
        <input v-model="stationFilter" type="text" class="routes-filter-field" :placeholder="t('routes.filterByStation')"/>

        <input v-model="lineFilter" type="text" class="routes-filter-field" :placeholder="t('routes.filterByLine')"/>

        <label class="routes-checkbox-label">
          <input type="checkbox" v-model="enableHighTrafficTimes"/>
          {{ t('routes.enableHighTrafficTimes') }}
        </label>

        <label class="routes-checkbox-label">
          <input type="checkbox" v-model="enableLowTrafficTimes"/>
          {{ t('routes.enableLowTrafficTimes') }}
        </label>
      </div>
    </div>

    <div v-if="displayedRoutes.length" class="routes-list">
      <RoutesRow
        v-for="route in displayedRoutes"
        :key="route.id"
        :route="route"
        :name="getRouteName(route)"
        :highTrafficTimesEnabled="enableHighTrafficTimes"
        :lowTrafficTimesEnabled="enableLowTrafficTimes"
        @routeDeleted="handleRouteDeleted"
        @hover="handleRouteHover"
      />
    </div>
  </div>
</template>

<style src="../styles/RoutesTab.css" scoped></style>
