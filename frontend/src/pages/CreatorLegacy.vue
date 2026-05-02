<script setup>
import { onMounted, ref, watch, nextTick } from "vue"
import L from "leaflet"

const mode = ref("osm")
let map = null
let currentLayer = null

onMounted(() => {
  createMap()
})

// 🔁 Recreate map when mode changes
watch(mode, async () => {
  destroyMap()
  await nextTick() // wait for DOM
  createMap()
})

function createMap() {
  if (mode.value === "osm") {
    map = L.map("map", {
      center: [48.15, 17.11],
      zoom: 13
    })

    loadOSM()
  } else {
    map = L.map("map", {
      crs: L.CRS.Simple,
      minZoom: -5
    })
  }
}

function destroyMap() {
  if (map) {
    map.remove()
    map = null
  }
}

function loadOSM() {
  currentLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  })

  currentLayer.addTo(map)
}

// 📁 Handle image upload
function onImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    loadImage(e.target.result)
  }

  reader.readAsDataURL(file)
}

function loadImage(imageUrl) {
  if (!map) return

  // Remove previous image
  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  // Reset constraints
  map.setMinZoom(undefined)
  map.setMaxBounds(null)

  const img = new Image()

  img.onload = () => {
    const width = img.width
    const height = img.height

    const bounds = [[0, 0], [height, width]]

    currentLayer = L.imageOverlay(imageUrl, bounds)
    currentLayer.addTo(map)

    // Get container size
    const mapSize = map.getSize()

    const scaleX = mapSize.x / width
    const scaleY = mapSize.y / height

    const scale = Math.min(scaleX, scaleY)

    // Convert to Leaflet zoom
    const zoom = Math.log2(scale)

    // Apply zoom and center
    map.setView([height / 2, width / 2], zoom)

    // Lock zoom-out
    map.setMinZoom(zoom)

    // Prevent dragging outside
    map.setMaxBounds(bounds)
  }

  img.src = imageUrl
}
</script>

<!--<template>-->
<!--  <h1>Create Map</h1>-->

<!--  <select v-model="mode">-->
<!--    <option value="osm">OpenStreetMap</option>-->
<!--    <option value="image">Image</option>-->
<!--  </select>-->

<!--  <div v-if="mode === 'image'">-->
<!--    <input type="file" accept="image/*" @change="onImageUpload" />-->
<!--  </div>-->

<!--  <div id="map" style="height:500px;"></div>-->
<!--</template>-->

<template>
  <div class="creator-container">

    <!-- Map -->
    <div id="map"></div>

    <!-- Floating panel -->
    <div class="panel">
      <h2>{{ $t('panel.title') }}</h2>

      <!-- Mode select -->
      <select v-model="mode">
        <option value="osm">{{ $t('panel.osm') }}</option>
        <option value="image">{{ $t('panel.image') }}</option>
      </select>

      <div v-if="mode === 'image'">
        <input type="file" accept="image/*" @change="onImageUpload" />
      </div>

      <!-- Text field -->
      <input type="text" :value="currentText" readonly />

      <!-- Buttons -->
      <div class="buttons">
        <button :class="{ active: activeButton === 'a' }" @click="setActive('a')">
          {{ $t('panel.buttonA') }}
        </button>

        <button :class="{ active: activeButton === 'b' }" @click="setActive('b')">
          {{ $t('panel.buttonB') }}
        </button>
      </div>
    </div>

  </div>
</template>