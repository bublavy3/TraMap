import L from "leaflet"

const MAX_LABEL_LINE_LENGTH = 15

function wrapStationName(name) {
    const words = name.split(" ")
    const textLines = []
    let textLine = ""
    for (const word of words) {
        const candidate = textLine ? `${textLine} ${word}` : word
        if (textLine && candidate.length > MAX_LABEL_LINE_LENGTH) {
            textLines.push(textLine)
            textLine = word
        } else {
            textLine = candidate
        }
    }
    if (textLine) {
        textLines.push(textLine)
    }
    return textLines
}

export function renderStationLabel(station, scale = 1) {
    const htmlNameText = wrapStationName(station.name).join("<br>")

    return L.marker([station.lat, station.lng], {
        icon: L.divIcon({
            className: "station-label",
            html: htmlNameText,
            iconSize: [0, 0],       // set like this to not place small station names far off the dot
            iconAnchor: [-10 * scale, 10 * scale]   // relative position of the label
        })
    })
}
