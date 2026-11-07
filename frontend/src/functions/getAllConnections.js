import {computeDirectionTimetable} from "./computeDirectionTimetable.js";

export function getAllConnections(lines, routes, stations) {

    const tripsCondensed = new Map() // each trip will get one index so that they can be referenced in an array during the CSA algorithm
    const stationsCondensed = new Map() // same for each station
    const tripsArray = []   // reverse lookup array corresponding to indexes from tripsCondensed
    const stationsArray = []    // reverse lookup array corresponding to indexes from stationsCondensed

    function getCondensedTripIndex(line, direction, departure) {
        const tripData = `${line}|${direction}|${departure}`
        let index = tripsCondensed.get(tripData)
        if (index === undefined) {
            index = tripsCondensed.size
            tripsCondensed.set(tripData, index)
            tripsArray.push(tripData)
        }
        return index
    }

    function getCondensedStationIndex(station) {
        let index = stationsCondensed.get(station)
        if (index === undefined) {
            index = stationsCondensed.size
            stationsCondensed.set(station, index)
            stationsArray.push(station)
        }
        return index
    }

    const connections = []
    for (const line of Object.values(lines)) {
        for (const direction of Object.values(line.directions)) {
            const directionTimetable = computeDirectionTimetable(line, direction.name, stations, routes)
            for (const trip of directionTimetable.timetable) {
                for (let i = 0; i < directionTimetable.stations.length - 1; i++) {
                    connections.push([
                        getCondensedStationIndex(directionTimetable.stations[i]), // departure station
                        getCondensedStationIndex(directionTimetable.stations[i + 1]), // arrival station
                        trip[i],    // departure time
                        trip[i + 1],    // arrival time
                        getCondensedTripIndex(line.id, direction.name, trip[0])   // trip index that can be then used to retrieve trip data
                    ])
                }
            }
        }
    }

    return {
        connections: connections.sort((con1, con2) => con1[2] - con2[2]),
        tripsCondensed: tripsCondensed,
        stationsCondensed: stationsCondensed,
        tripsArray: tripsArray,
        stationsArray: stationsArray
    }
}