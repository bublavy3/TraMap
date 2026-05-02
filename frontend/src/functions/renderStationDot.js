import L from "leaflet"

export function renderStationDot(station) {
    return L.circleMarker([station.lat, station.lng], {
        radius: 6,
        color: "black",
        weight: 2,
        fillColor: "white",
        fillOpacity: 1
    })
}