import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router"
import 'leaflet/dist/leaflet.css'
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import i18n from "./translations"
import "./styles/main.css"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})

createApp(App)
    .use(router)
    .use(i18n)
    .mount("#app")
