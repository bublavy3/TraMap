export function findPathToStation(startStation, endStation, routesByStation) {
    const visitedStations = {}

    function searchFromStation(station, path) {
        if (station === endStation) {
            return path
        }
        visitedStations[station] = true
        const connectedRoutes = routesByStation[station]
        for (const route of connectedRoutes) {
            const nextStation = route.stationA === station ? route.stationB : route.stationA
            if (visitedStations[nextStation]) {
                continue
            }
            const foundPath = searchFromStation(nextStation, [...path, route])
            if (foundPath) {
                return foundPath
            }
        }
        return null
    }

    return searchFromStation(startStation, [])
}
