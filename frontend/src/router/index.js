import { createRouter, createWebHistory } from "vue-router"

import Home from "../pages/Home.vue"
import Viewer from "../pages/Viewer.vue"
import Creator from "../pages/Creator.vue"
import Login from "../pages/Login.vue"
import About from "../pages/About.vue"
import PrintExport from "../pages/PrintExport.vue"

const routes = [
    { path: "/", component: Home },
    { path: "/viewer/:id", component: Viewer },
    { path: "/creator", component: Creator },
    { path: "/login", component: Login },
    { path: "/about", component: About },
    { path: "/export", component: PrintExport }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
