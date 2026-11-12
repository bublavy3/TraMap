import L from "leaflet"

export function fitNetwork(map, stations) {
  if (!map || Object.keys(stations).length === 0) {
    return
  }

  const points = Object.values(stations).map(point => [point.lat, point.lng])
  if (points.length) {
    map.fitBounds(L.latLngBounds(points), { padding: [10, 10], maxZoom: 19 }) // without padding it looked weird to have stations touching the edges
  }
}
