import { useQuery } from "@tanstack/react-query";
import { Rectangle, Popup } from "react-leaflet";
import { HeatmapCell } from "@shared/schema";

export function HeatmapOverlay() {
  const { data: heatmapData, isLoading } = useQuery<HeatmapCell[]>({
    queryKey: ['/api/heatmap'],
  });

  if (isLoading || !heatmapData) {
    return null;
  }

  return (
    <>
      {heatmapData.map((cell) => {
        const gridSize = 0.0005; // approximately 50m at this latitude
        const bounds: [[number, number], [number, number]] = [
          [cell.lat, cell.lng],
          [cell.lat + gridSize, cell.lng + gridSize]
        ];

        return (
          <Rectangle
            key={cell.id}
            bounds={bounds}
            pathOptions={{
              fillColor: cell.color,
              fillOpacity: 0.6,
              color: cell.color,
              weight: 0,
            }}
            data-testid={`heatmap-cell-${cell.id}`}
          >
            <Popup data-testid={`popup-heatmap-${cell.id}`}>
              <div className="p-2 space-y-1 min-w-[200px]">
                <div className="font-semibold text-sm mb-2">Grid Cell {cell.id}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net CO₂:</span>
                    <span className="font-mono font-medium">{cell.netCO2.toFixed(1)} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Emission:</span>
                    <span className="font-mono">{cell.emission.toFixed(1)} g/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Absorption:</span>
                    <span className="font-mono">{cell.absorption.toFixed(1)} g/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diffused:</span>
                    <span className="font-mono">{cell.diffusedCO2.toFixed(1)} ppm</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Rectangle>
        );
      })}
    </>
  );
}
