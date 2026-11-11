import { getAllConnections } from "./getAllConnections.js";

export function findQuickestJourney(startStationId, endStationId, startTime, lines, routes, stations) {
    const allConnectionsData = getAllConnections(lines, routes, stations)
    const allConnections = allConnectionsData.connections
    const startStationIndex  = allConnectionsData.stationsCondensed.get(startStationId)
    const endStationIndex  = allConnectionsData.stationsCondensed.get(endStationId)
    const allConnectionsDescending = [...allConnections].sort((a, b) => b[3] - a[3])    // sorted by arrival time instead of departure time

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
            }
        }
    }

    if (targetEnter === null) { // no journey found
        return null
    }

    const destinationArrivalTime = allConnections[targetExit][ARR_TIME]

    // binary search for index in reverse array sorted by arrival times, also enables us to use different final connection if arrival time is the same while departure time is later
    lowLimit = 0
    highLimit = allConnectionsDescending.length
    while (lowLimit < highLimit) {
        const middle = (lowLimit + highLimit) >> 1
        if (allConnectionsDescending[middle][ARR_TIME] > destinationArrivalTime) {
            lowLimit = middle + 1
        }
        else highLimit = middle
    }

    const latest = new Int32Array(allConnectionsData.stationsCondensed.size).fill(-1) // latest time we can arrive at station to still be able to reach destination asap
    const boardings = new Int32Array(allConnectionsData.stationsCondensed.size).fill(1000000)   // lowest number of boardings from station to destination among journeys that arrive at earliest possible time
    const tripExit = new Int32Array(allConnectionsData.tripsCondensed.size).fill(-1) // earliest feasible exit connection found so far while scanning each trip backward
    const tripBoardings = new Int32Array(allConnectionsData.tripsCondensed.size).fill(1000000)  // lowest number of boardings needed if trip is utilized
    const entryPointer = new Int32Array(allConnectionsData.stationsCondensed.size).fill(-1)     // boardings of connections for path reconstruction
    const exitPointer = new Int32Array(allConnectionsData.stationsCondensed.size).fill(-1)      // exits of connections for path reconstruction

    let bestDeparture = startTime - 1 // latest departure among journeys with the fewest boardings
    let bestBoardings = 1000000
    let bestEnter = -1
    let bestExit = -1

    for (let i = lowLimit; i < allConnectionsDescending.length; i++) {    // connections are now in descending order, so every connection beyond lowLimit index arrives sooner at its arrival station
        const connection = allConnectionsDescending[i]
        if (bestBoardings === 1 && connection[ARR_TIME] <= bestDeparture) break
        const trip = connection[TRIP_ID]

        if (connection[ARR_STATION] === endStationIndex || connection[ARR_TIME] <= latest[connection[ARR_STATION]]) {
            const candidateBoardings = 1 + (connection[ARR_STATION] === endStationIndex ? 0 : boardings[connection[ARR_STATION]])
            if (tripExit[trip] === -1 || candidateBoardings <= tripBoardings[trip]) { // the scan moves backward, so replacing in case of same amount of connections needed keeps the earlier feasible exit
                tripExit[trip] = i
                tripBoardings[trip] = candidateBoardings
            }
        }
        if (tripExit[trip] === -1) { // target not reachable from here
            continue
        }

        if (connection[DEP_STATION] === startStationIndex) {
            if (tripBoardings[trip] < bestBoardings || (tripBoardings[trip] === bestBoardings && connection[DEP_TIME] > bestDeparture)) {
                bestBoardings = tripBoardings[trip]
                bestDeparture = connection[DEP_TIME]
                bestEnter = i
                bestExit = tripExit[trip]
            }
        } else {
            const newLatest = connection[DEP_TIME] - TRANSFER_TIME
            if (tripBoardings[trip] < boardings[connection[DEP_STATION]] || (tripBoardings[trip] === boardings[connection[DEP_STATION]] && newLatest > latest[connection[DEP_STATION]])) {
                // we either arrived with fewer boardings required or arrive with same amount of boardings required but can depart later
                boardings[connection[DEP_STATION]] = tripBoardings[trip]
                latest[connection[DEP_STATION]] = newLatest
                entryPointer[connection[DEP_STATION]] = i
                exitPointer[connection[DEP_STATION]] = tripExit[trip]
            }
        }
    }

    // journey reconstruction
    const journeyTrips = []
    let enterIndex = bestEnter
    let exitIndex = bestExit
    while (true) {
        const enter = allConnectionsDescending[enterIndex]
        const exit = allConnectionsDescending[exitIndex]
        journeyTrips.push({
            trip: allConnectionsData.tripsArray[enter[TRIP_ID]],
            from: allConnectionsData.stationsArray[enter[DEP_STATION]],
            to: allConnectionsData.stationsArray[exit[ARR_STATION]],
            departureTime: enter[DEP_TIME],
            arrivalTime: exit[ARR_TIME],
        })
        const arrivedAt = exit[ARR_STATION]
        if (arrivedAt === endStationIndex) {
            break
        }
        enterIndex = entryPointer[arrivedAt]
        exitIndex = exitPointer[arrivedAt]
    }

    return journeyTrips
}
