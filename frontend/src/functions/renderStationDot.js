import L from "leaflet"

export function renderStationDot(station, onRightClick) {
    const dot = L.circleMarker([station.lat, station.lng], {
        radius: 8,
        color: "black",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1
    })

    dot.on("contextmenu", (e) => {
        // don't let the map receive this event too
        L.DomEvent.stopPropagation(e)
        onRightClick(station.id) // callback
    })

    return dot
}