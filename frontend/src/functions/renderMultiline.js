import L from "leaflet"
import 'leaflet-polylineoffset';

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
        polyline.on("contextmenu", event => {
                        L.DomEvent.stopPropagation(event)
                        onRouteRightClick(routeId)
                    })
        polyline.addTo(layerGroup)
        edge += lineWidth;
    });

}
