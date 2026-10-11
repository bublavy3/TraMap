<script setup>
import { ref } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps({
  route: Object,
  name: String,
  highTrafficTimesEnabled: Boolean,
  lowTrafficTimesEnabled: Boolean
})

const emit = defineEmits(["routeDeleted", "hover"])

function updateDuration(minutes, seconds, routeProperty) {
  props.route[routeProperty] = Number(minutes) * 60 + Number(seconds)
}

const travelTimeMinutes = ref(Math.floor(props.route.travelTime / 60))
const travelTimeSeconds = ref(props.route.travelTime % 60)
const highTrafficTimeMinutes = ref(Math.floor(props.route.highTrafficTime / 60))
const highTrafficTimeSeconds = ref(props.route.highTrafficTime % 60)
const lowTrafficTimeMinutes = ref(Math.floor(props.route.lowTrafficTime / 60))
const lowTrafficTimeSeconds = ref(props.route.lowTrafficTime % 60)

const nameParts = [props.name.slice(0, props.name.indexOf(" - ")), "↕", props.name.slice(props.name.indexOf(" - ") + 3)]

function handleDeleteClick() {
  emit("routeDeleted", props.route.id)
}

function handleMouseEnter() {
  emit("hover", props.route.id)
}

function handleMouseLeave() {
  emit("hover", null)
}
</script>

<template>
  <div class="routes-row" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="route-name">
      <span v-for="(part, i) in nameParts" :key="i" class="route-name-part">{{ part }}</span>
    </div>

    <div class="route-durations">
      <label class="duration-field">
        <span class="duration-label">⏳</span>
        <span class="duration-inputs">
          <input v-model.number="travelTimeMinutes" type="number" min="0" @input="updateDuration(travelTimeMinutes, travelTimeSeconds, 'travelTime')" />
          <span>{{ t('common.minutesShort') }}</span>
          <input v-model.number="travelTimeSeconds" type="number" min="0" max="59" step="10" @input="updateDuration(travelTimeMinutes, travelTimeSeconds, 'travelTime')" />
          <span>{{ t('common.secondsShort') }}</span>
        </span>
      </label>

      <label v-if="highTrafficTimesEnabled" class="duration-field">
        <span class="duration-label">
          🔥
        </span>
        <span class="duration-inputs">
          <input v-model.number="highTrafficTimeMinutes" type="number" min="0" @input="updateDuration(highTrafficTimeMinutes, highTrafficTimeSeconds, 'highTrafficTime')" />
          <span>{{ t('common.minutesShort') }}</span>
          <input v-model.number="highTrafficTimeSeconds" type="number" min="0" max="59" step="10" @input="updateDuration(highTrafficTimeMinutes, highTrafficTimeSeconds, 'highTrafficTime')" />
          <span>{{ t('common.secondsShort') }}</span>
        </span>
      </label>

      <label v-if="lowTrafficTimesEnabled" class="duration-field">
        <span class="duration-label">
          ⏾
        </span>
        <span class="duration-inputs">
          <input v-model.number="lowTrafficTimeMinutes" type="number" min="0" @input="updateDuration(lowTrafficTimeMinutes, lowTrafficTimeSeconds, 'lowTrafficTime')" />
          <span>{{ t('common.minutesShort') }}</span>
          <input v-model.number="lowTrafficTimeSeconds" type="number" min="0" max="59" step="10" @input="updateDuration(lowTrafficTimeMinutes, lowTrafficTimeSeconds, 'lowTrafficTime')" />
          <span>{{ t('common.secondsShort') }}</span>
        </span>
      </label>
    </div>

    <button type="button" class="delete-route-button" @click="handleDeleteClick">🗑</button>
  </div>
</template>

<style src="../styles/RoutesRow.css" scoped></style>
