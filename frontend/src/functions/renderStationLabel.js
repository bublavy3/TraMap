import L from "leaflet"

export function renderStationLabel(station) {
    return L.marker([station.lat, station.lng], {
        icon: L.divIcon({
            className: "station-label",
            html: station.name,
            iconSize: [0, 0],       // set like this to not place small station names far off the dot
            iconAnchor: [-10, 10]   // relative position of the label
        })
    })
}