import {renderMultiline} from "./renderMultiline.js";
import { settings } from "../config/settings.js"

export function renderLines(layerGroup, lines, routes, stations, junctions, onRouteRightClick) {
    layerGroup.clearLayers()

    const stationMap = { ...stations, ...junctions }

    Object.values(routes).forEach(route => {
        if (!route.lines) {
            return
        }
        const linesOnRoute = route.lines
            .map(id => lines[id])

        // TODO duplicate
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

        renderMultiline(layerGroup, route.id, points, linesOnRoute, settings.line.width, onRouteRightClick)
    })
}
