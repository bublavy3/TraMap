export function prepareRoutesByStation(routes) {
    const routesByStation = {}
    for (const routeId in routes) {
        const route = routes[routeId]
        if (!routesByStation[route.stationA]) {
            routesByStation[route.stationA] = []
        }
        routesByStation[route.stationA].push(route)
        if (!routesByStation[route.stationB]) {
            routesByStation[route.stationB] = []
        }
        routesByStation[route.stationB].push(route)
    }

    return routesByStation
}