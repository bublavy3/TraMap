import L from "leaflet"
import { settings } from "../config/settings.js"

export function renderStationDot(station, onRightClick) {
    const dot = L.circleMarker([station.lat, station.lng], {
        radius: settings.stationDot.radius,
        color: "black",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1,
        pane: "stationPane" // put stations in a pane that's always above lines and routes
    })

    dot.on("contextmenu", (e) => {
        // don't let the map receive this event too
        L.DomEvent.stopPropagation(e)
        onRightClick(station.id) // callback
    })

    return dot
}
