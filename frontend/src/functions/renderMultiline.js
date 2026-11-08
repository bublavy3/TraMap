import L from "leaflet"
import 'leaflet-polylineoffset';

const MIN_BUNDLE_LENGTH_PX = 120
const MAX_CHARS_FOR_ROW = 3

// midpoint at zoom 0.
function findPathMidpoint(map, points) {
    const projected = points.map(p => map.project(L.latLng(p), 0))

    const segmentLengths = []
    for (let i = 1; i < projected.length; i++) {
        segmentLengths.push(projected[i].distanceTo(projected[i - 1]))
    }
    let length = 0;
    for (const l of segmentLengths) {
        length += l;
    }

    let remaining = length / 2
    for (let i = 0; i < segmentLengths.length; i++) {
        if (remaining <= segmentLengths[i]) {
            const segmentProportion = segmentLengths[i] === 0 ? 0 : remaining / segmentLengths[i]
            const segmentStart = projected[i]
            const segmentEnd = projected[i + 1]
            const mid = segmentStart.add(segmentEnd.subtract(segmentStart).multiplyBy(segmentProportion))
            return {
                latlng: map.unproject(mid, 0),
                length: length
            }
        }
        remaining -= segmentLengths[i]
    }
    return null
}

function createBadgeIcon(lines) {
    const useColumn = lines.some(line => line.name.length > MAX_CHARS_FOR_ROW)

    const badge = document.createElement("div") // the full badge holding all line names
    badge.className = useColumn ? "line-badge line-badge-column" : "line-badge"

    lines.forEach(line => {
        const cell = document.createElement("div")  // cells for name of each line
        cell.className = "line-badge-cell"
        cell.textContent = line.name
        cell.style.background = line.color
        badge.appendChild(cell)
    })

    return L.divIcon({
        className: "",
        html: badge,
        iconSize: [0, 0]
    })
}

// this whole method was mostly engineered by AI
function addBadge(layerGroup, points, lines) {
    const marker = L.marker([0, 0], {   // real position is set at addition when midpoint is calculated
        icon: createBadgeIcon(lines),
        interactive: false
    })

    marker.on("add", () => {    // automatically triggered Leaflet event
        const map = marker._map
        const midpoint = findPathMidpoint(map, points)
        if (!midpoint) {
            return
        }
        marker.setLatLng(midpoint.latlng)

       function updateVisibility() {
            const lengthPx = midpoint.length * map.getZoomScale(map.getZoom(), 0)
            marker.getElement().style.display = lengthPx >= MIN_BUNDLE_LENGTH_PX ? "" : "none"
        }

        updateVisibility()
        map.on("zoomend", updateVisibility) // automatically triggered Leaflet event
        marker.once("remove", () => map.off("zoomend", updateVisibility))   // automatically triggered Leaflet event
    })

    marker.addTo(layerGroup)
}

export function renderMultiline(layerGroup, routeId, points, lines, lineWidth, onRouteRightClick) {
    const totalWidth = lines.length * lineWidth

    let edge = -totalWidth / 2;
    lines.forEach((line) => {
        const center = edge + lineWidth / 2;
        const polyline = L.polyline(points, {
            color: line.color,
            weight: lineWidth,
            offset: center,
            lineCap: "round",
            lineJoin: "round"
        })
        if (onRouteRightClick) {
            polyline.on("contextmenu", event => {
                L.DomEvent.stopPropagation(event)
                onRouteRightClick(routeId, event.latlng, event.originalEvent.ctrlKey)
            })
        }
        polyline.addTo(layerGroup)
        edge += lineWidth;
    })

    addBadge(layerGroup, points, lines)
}
