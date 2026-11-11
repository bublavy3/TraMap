import { renderStationDot } from "./renderStationDot"
import { renderStationLabel } from "./renderStationLabel"

export function renderStations(layerGroup, stations, onStationRightClick = null, scale = 1) {
    layerGroup?.clearLayers()

    Object.values(stations ?? {}).forEach(station => {
        const dot = renderStationDot(station, onStationRightClick, scale)
        const label = renderStationLabel(station, scale)

        dot.addTo(layerGroup)
        label.addTo(layerGroup)
    })
}
