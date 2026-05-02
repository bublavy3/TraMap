<script setup>
import { ref } from "vue"
import CreatorMap from "../components/CreatorMap.vue"
import CreatorPanel from "../components/CreatorPanel.vue"

const mode = ref("osm")
const imageUrl = ref(null)
const activeButton = ref("a")
const stations = ref([])

// in diploma thesis version only 2 underlay modes will be supported - OpenStreetMap and image, but in future there might be desire to add more map providers for example, or raw map data import
function handleModeChange(newMode) {
  mode.value = newMode
}

function handleImageUpload(url) {
  imageUrl.value = url
}

function handleButtonChange(button) {
  activeButton.value = button
}

function handleAddStation(station) {
  stations.value.push({
    id: Date.now(),       // just a very simple way to give unique id-s, later will be (probably) changed
    lat: station.lat,     // latitude (north-south)
    lng: station.lng,     // longitude (east-west)
    name: "New station"   // default name that can be overwritten in the Stations tab
  })
}
</script>

<template>
  <div class="creator-container">
    <!--    The component with the map and all its rendered layers and listeners   -->
    <CreatorMap
        :mode="mode"
        :imageUrl="imageUrl"
        :stations="stations"
        @addStation="handleAddStation"
    />

    <!--    The component with the control panel and all its functionality  -->
    <CreatorPanel
        :mode="mode"
        :activeButton="activeButton"
        :stations="stations"
        @modeChanged="handleModeChange"
        @imageUploaded="handleImageUpload"
        @buttonChanged="handleButtonChange"
    />
  </div>
</template>

<style src="../styles/Creator.css" scoped></style>
