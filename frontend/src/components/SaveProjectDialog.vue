<script setup>
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  originalName: String,
  originalCountries: Array,
  savingPending: Boolean,
  errorMessage: String,
})

const emit = defineEmits([
  "save", 
  "close"
])

const { t, locale } = useI18n()

const name = ref(props.originalName)
const countries = ref([...props.originalCountries])
const countryCodes = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]

function getCountryOptions() {
  // standard way to get local names of all countries
  const displayNames = new Intl.DisplayNames([locale.value], { type: "region" })
  return countryCodes
      .map(code => ({ code, name: displayNames.of(code) }))
      .sort((a, b) => a.name.localeCompare(b.name))
}

watch(() => props.originalName, value => { name.value = value })
watch(() => props.originalCountries, value => { countries.value = [...value] })

function approveSaving() {
  return name.value.trim().length > 0 && !props.savingPending
}

function submit() {
  if (approveSaving()) {
    emit("save", {
      name: name.value.trim(),
      countries: [...countries.value]
    })
  }
}

function closePopup() {
  emit("close")
}
</script>

<template>
  <div class="popup-back">
    <div class="project-dialog">
      <button class="project-dialog-close" type="button" :title="t('common.close')" @click="closePopup">×</button>
      <h2>{{ t("projectDialog.saveTitle") }}</h2>
      <form @submit.prevent="submit">
        <label for="project-name">{{ t("projectDialog.name") }}</label>
        <input id="project-name" v-model="name" type="text" required/>
        <label for="project-countries">{{ t("projectDialog.countries") }}</label>
        <select id="project-countries" v-model="countries" multiple size="5">
          <option v-for="country in getCountryOptions()" :key="country.code" :value="country.code">{{ country.name }}</option>
        </select>
        <p>{{ t("projectDialog.countriesMultiselectHint") }}</p>
        <button type="submit" :disabled="!approveSaving()">💾</button>
        <p v-if="props.errorMessage" class="project-dialog-error">{{ props.errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<style src="../styles/SaveProjectDialog.css" scoped></style>
