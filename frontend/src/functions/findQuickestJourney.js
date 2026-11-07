import { getAllConnections } from "./getAllConnections.js";

export function findQuickestJourney(startStationId, endStationId, startTime, lines, routes, stations) {
    const allConnectionsData = getAllConnections(lines, routes, stations)
    const allConnections = allConnectionsData.connections
    const startStationIndex  = allConnectionsData.stationsCondensed.get(startStationId)
    const endStationIndex  = allConnectionsData.stationsCondensed.get(endStationId)

    // indexes for better orientation because it was a mess to debug without them
    const DEP_STATION = 0
    const ARR_STATION = 1
    const DEP_TIME = 2
    const ARR_TIME = 3
    const TRIP_ID = 4

    const TRANSFER_TIME = 2 // TODO settable per station?

    // binary search for index of first boardable connection
    let lowLimit = 0
    let highLimit = allConnections.length
    while (lowLimit < highLimit) {
        const middle = (lowLimit + highLimit) >> 1 // byte shift efficiently divides by 2 without remainder
        if (allConnections[middle][DEP_TIME] < startTime) {
            lowLimit = middle + 1
        } else {
            highLimit = middle
        }
    }

    const readyAt = new Int32Array(allConnectionsData.stationsCondensed.size).fill(1000000)   // earliest time we can board a connection at this station
    readyAt[startStationIndex] = startTime
    const tripEnter = new Int32Array(allConnectionsData.tripsCondensed.size).fill(-1) // index of the first boardable connection of the trip
    const entryPointer = new Int32Array(allConnectionsData.stationsCondensed.size).fill(-1)     // boardings of connections for path reconstruction
    const exitPointer = new Int32Array(allConnectionsData.stationsCondensed.size).fill(-1)      // exits of connections for path reconstruction

    let bestArrival = 1000000000
    let targetEnter = null
    let targetExit = null

    for (let i = lowLimit; i < allConnections.length; i++) {
        const connection = allConnections[i]
        if (connection[DEP_TIME] >= bestArrival) {  // no connection will be better anymore
            break
        }

        const trip = connection[TRIP_ID]

        if (tripEnter[trip] === -1 && readyAt[connection[DEP_STATION]] <= connection[DEP_TIME]) {
                tripEnter[trip] = i  // first reachable connection of this trip
        }
        if (tripEnter[trip] === -1) {
            continue    // connection not reachable
        }

        const arrivalStation = connection[ARR_STATION]
        const arrivalTime = connection[ARR_TIME]

        if (arrivalStation === endStationIndex) {
            if (arrivalTime < bestArrival) {
                bestArrival = arrivalTime
                targetEnter = tripEnter[trip]
                targetExit = i
            }
        } else {
            const newReady = arrivalTime + TRANSFER_TIME
            if (newReady < readyAt[arrivalStation]) {
                readyAt[arrivalStation] = newReady
                entryPointer[arrivalStation] = tripEnter[trip]
                exitPointer[arrivalStation] = i
            }
        }
    }

    if (targetEnter === null) { // no journey found
        return null
    }

    // journey reconstruction
    const journeyTrips = []
    let enterIndex = targetEnter
    let exitIndex = targetExit
    while (true) {
        const enter = allConnections[enterIndex]
        const exit = allConnections[exitIndex]
        journeyTrips.push({
            trip: allConnectionsData.tripsArray[enter[TRIP_ID]],
            from: allConnectionsData.stationsArray[enter[DEP_STATION]],
            to: allConnectionsData.stationsArray[exit[ARR_STATION]],
            departureTime: enter[DEP_TIME],
            arrivalTime: exit[ARR_TIME],
        })
        const boardedAt = enter[DEP_STATION]
        if (boardedAt === startStationIndex) {
            break
        }
        enterIndex = entryPointer[boardedAt]
        exitIndex = exitPointer[boardedAt]
    }
    journeyTrips.reverse()

    return journeyTrips
}
