<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import PanelTabs from "./PanelTabs.vue"
import { CreatorPanelTab } from "../constants/creatorPanelTabs.js";

const props = defineProps({
  mode: String,
  activeTab: String,
  stations: Array,
  lines: Array,
  routes: Array
})

const emit = defineEmits([
  "modeChanged",
  "imageUploaded",
  "tabChanged",
  "lineFocused",
  "lineDeleted"
])

const { t } = useI18n()   // t will be the translation function used for texts being in user's selected language

// function to let Creator know when mode is changed via the select
function changeMode(selectedOption) {
  emit("modeChanged", selectedOption.target.value)
}

function changeActiveTab(tab) {
  emit("tabChanged", tab)
}

function handleLineFocused(lineId) {
  emit("lineFocused", lineId)
}

function handleLineDeleted(lineId) {
  emit("lineDeleted", lineId)
}

// function to conduct file selection as image underlay utilizing standard browser built-in file explorer
function uploadImage(fileSelection) {
  const file = fileSelection.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (imageRead) => {
    emit("imageUploaded", imageRead.target.result)    // image.target.result contains the file
  }
  reader.readAsDataURL(file)    // read the file and encode it as string
}

const currentText = computed(() => {    // this text will inform the user how to use the tool he has selected
  switch (props.activeTab) {
    case CreatorPanelTab.STATIONS:
      return t("panel.textA")
    case CreatorPanelTab.LINES:
      return t("panel.textB")
    case CreatorPanelTab.ROUTES:
      return t("panel.textB")
    default:
      return t("panel.textB")
  }
})
</script>

<template>
  <div class="panel">
    <h2>{{ t('panel.title') }}</h2>

    <select :value="mode" @change="changeMode">
      <option value="osm">{{ t('panel.osm') }}</option>
      <option value="image">{{ t('panel.image') }}</option>
    </select>

    <div v-if="mode === 'image'">
      <input type="file" accept="image/*" @change="uploadImage" />
    </div>

    <input type="text" :value="currentText" readonly />

    <PanelTabs
      :stations="stations"
      :lines="lines"
      :routes="routes"
      @tabChanged="changeActiveTab"
      @lineFocused="handleLineFocused"
      @lineDeleted="handleLineDeleted"
    />
  </div>
</template>

<style src="../styles/CreatorPanel.css" scoped></style>
