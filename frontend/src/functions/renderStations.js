import { renderStationDot } from "./renderStationDot"
import { renderStationLabel } from "./renderStationLabel"

export function renderStations(layerGroup, stations) {
    layerGroup?.clearLayers()

    stations?.forEach(station => {
        const dot = renderStationDot(station)
        const label = renderStationLabel(station)

        dot.addTo(layerGroup)
        label.addTo(layerGroup)
    })
}