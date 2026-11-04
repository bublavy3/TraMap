import { findPathToStation } from "./findPathToStation.js";

export function getDirectionRoutesPath(routesByStation, startStation, endStation, passthroughStations) {
    let path = []
    if (passthroughStations) {
        const guidingStations = [startStation, ...passthroughStations, endStation]
        for (let i = 0; i < guidingStations.length - 1; i++) {
            path.push(...findPathToStation(guidingStations[i], guidingStations[i + 1], routesByStation))
        }
        // TODO there must be exactly one possible path between each consecutive pair of guiding stations - loop support should be added later
    } else {
        path = findPathToStation(startStation, endStation, routesByStation)
    }
    return path
}