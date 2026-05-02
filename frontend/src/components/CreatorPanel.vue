<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import PanelTabs from "./PanelTabs.vue"

const props = defineProps({
  mode: String,
  activeButton: String,
  stations: Array
})

const emit = defineEmits([
  "modeChanged",
  "imageUploaded",
  "buttonChanged"
])

const { t } = useI18n()   // t will be the translation function used for texts being in user's selected language

// function to let Creator know when mode is changed via the select
function changeMode(selectedOption) {
  emit("modeChanged", selectedOption.target.value)
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

// this will be utilized
function setActive(btn) {
  emit("buttonChanged", btn)
}

const currentText = computed(() => {    // this text will inform the user how to use the tool he has selected
  if (props.activeButton === "stationAddition") {
    // more stuff will of course happen here in the future
    return t("panel.textA")
  }
  if (props.activeButton === "lineAddition")
    // more stuff will of course happen here in the future
    return t("panel.textB")
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

    <div class="buttons">
      <button :class="{ active: activeButton === 'stationAddition' }" @click="setActive('stationAddition')">
        {{ t('panel.buttonA') }}
      </button>
      <button :class="{ active: activeButton === 'lineAddition' }" @click="setActive('lineAddition')">
        {{ t('panel.buttonB') }}
      </button>
    </div>
    <PanelTabs :stations="stations"/>
  </div>
</template>

<style src="../styles/CreatorPanel.css" scoped></style>