import L from "leaflet"

export function renderRoutes(layerGroup, routes, currentRoute, stations, junctions, onRouteRightClick) {

    layerGroup.clearLayers()

    const stationMap = {}

    stations.forEach(station => {
        stationMap[station.id] = station
    })
    junctions.forEach(junction => {
        stationMap[junction.id] = junction
    })

    // completed routes
    routes.forEach(route => {
        const points = []
        const start = stationMap[route.stationA]
        const end = stationMap[route.stationB]

        if (!start || !end)
            return

        points.push([start.lat, start.lng])
        route.points.forEach(p => {
            points.push([p.lat, p.lng])
        })
        points.push([end.lat, end.lng])

        const polyline = L.polyline(points, {
            color: "grey",
            weight: 3
        })

        polyline.on("contextmenu", e => {
            L.DomEvent.stopPropagation(e)
            onRouteRightClick(route.id, e.latlng) // callback for when this route was clicked
        })
        polyline.addTo(layerGroup)

    })

    // route currently being created
    if (currentRoute) {
        const points = []
        const start = stationMap[currentRoute.stationA]

        if (start) {
            points.push([start.lat, start.lng])
        }
        currentRoute.points.forEach(p => {
            points.push([p.lat, p.lng])
        })
        L.polyline(points, {
            color: "grey",
            weight: 3,
            dashArray: "8 6"
        }).addTo(layerGroup)
    }
}
