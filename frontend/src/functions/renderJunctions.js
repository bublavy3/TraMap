import L from "leaflet"

export function renderJunctions(layerGroup, junctions, onJunctionRightClick) {
    layerGroup?.clearLayers()
    if (!junctions) {
        return
    }

    Object.values(junctions).forEach(junction => {
        const marker = L.circleMarker([junction.lat, junction.lng], {
            radius: 6,
            color: "gray",
            weight: 2,
            fillColor: "gray",
            fillOpacity: 1,
            pane: "stationPane"
        })
        marker.on("contextmenu", event => {
            L.DomEvent.stopPropagation(event)
            onJunctionRightClick(junction.id)
        })
        marker.addTo(layerGroup)
    })
}
