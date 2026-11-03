<script setup>
import PanelTabs from "./PanelTabs.vue";
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";
import { PanelTab } from "../constants/panelTabs.js";

const props = defineProps({
  stations: Object,
  junctions: Object,
  lines: Object,
  routes: Object
})

const { t } = useI18n()

const activeTab = ref(PanelTab.STATIONS)

function changeActiveTab(tab) {
  activeTab.value = tab
}

const currentText = computed(() => {    // TODO use viewer specific info texts
  switch (activeTab.value) {
    case PanelTab.STATIONS:
      return t("panel.infotextStationTab")
    case PanelTab.LINES:
      return t("panel.infotextLinesTab")
    case PanelTab.ROUTES:
      return t("panel.infotextRoutesTab")
    default:
      return ""
  }
})
</script>

<template>
  <div class="panel">
    <h2>{{ t('panel.title') }}</h2>
    <div class="info-text">{{ currentText }}</div>

    <PanelTabs
        :stations="stations"
        :junctions="junctions"
        :lines="lines"
        :routes="routes"
        :editingAllowed="false"
        @tabChanged="changeActiveTab"
    />
  </div>
</template>

<style src="../styles/ViewerPanel.css" scoped></style>