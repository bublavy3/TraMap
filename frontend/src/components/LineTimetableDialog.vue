<script setup>
import { ref } from "vue"
import LineDirectionEditor from "./LineDirectionEditor.vue"
import LineDirectionView from "./LineDirectionView.vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  line: Object,
  routes: Object,
  stations: Object,
  junctions: Object,
  editingAllowed: Boolean
})

const emit = defineEmits([
    "close"
])

const NEW_DIRECTION = "new_direction"
const directionKeys = Object.keys(props.line.directions)
const direction = ref(directionKeys.length > 0 ? directionKeys[0] : NEW_DIRECTION)

function closePopup() {
  emit("close", null)
}
</script>

<template>
  <div v-if="props.editingAllowed || Object.keys(props.line.directions).length !== 0" class="popup-back">
    <div class="timetable-popup">
      <button class="timetable-close" type="button" :title="t('common.close')" @click="closePopup">×</button>
      <h2 id="timetable-title">{{ t('timetable.title') }}</h2>
      <label class="timetable-direction">
        <span>{{ t('timetable.direction') }}</span>
        <select v-model="direction">
          <option v-for="key in Object.keys(line.directions)" :key="key" :value="key">
            {{ key }}
          </option>
          <option v-if="props.editingAllowed" :value="NEW_DIRECTION">{{ t('timetable.addNewDirection') }}</option>
        </select>
      </label>

      <LineDirectionEditor
          v-if="direction === NEW_DIRECTION && props.editingAllowed"
          class="timetable-direction-content"
          :line="line"
          :routes="routes"
          :stations="stations"
      />
      <LineDirectionView
          v-else
          :key="direction"
          class="timetable-direction-content"
          :line="line"
          :directionName="direction"
          :stations="stations"
          :routes="routes"
      />
    </div>
  </div>
</template>

<style src="../styles/LineTimetableDialog.css" scoped></style>
