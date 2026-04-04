import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { LayerType } from "@shared/schema";
import { HeatmapOverlay } from "./heatmap-overlay";
import { SensorMarkers } from "./sensor-markers";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapContainerProps {
  activeLayers: Set<LayerType>;
  layerOpacity: Record<LayerType, number>;
  showHeatmap: boolean;
}

// Layer styling based on type
const getLayerStyle = (layerType: LayerType, opacity: number) => {
  const styles: Record<LayerType, any> = {
    transport: {
      color: '#3b82f6',
      weight: 2,
      opacity: opacity / 100,
    },
    industry: {
      fillColor: '#8b5cf6',
      fillOpacity: opacity / 100 * 0.6,
      color: '#8b5cf6',
      weight: 1,
      opacity: opacity / 100,
    },
    residential: {
      fillColor: '#f59e0b',
      fillOpacity: opacity / 100 * 0.4,
      color: '#f59e0b',
      weight: 1,
      opacity: opacity / 100,
    },
    forest: {
      fillColor: '#10b981',
      fillOpacity: opacity / 100 * 0.5,
      color: '#10b981',
      weight: 1,
      opacity: opacity / 100,
    },
    power: {
      fillColor: '#ef4444',
      fillOpacity: opacity / 100 * 0.7,
      color: '#ef4444',
      weight: 2,
      opacity: opacity / 100,
    },
  };
  return styles[layerType];
};

function MapController({ activeLayers, layerOpacity }: { activeLayers: Set<LayerType>, layerOpacity: Record<LayerType, number> }) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}

export function MapContainer({ activeLayers, layerOpacity, showHeatmap }: MapContainerProps) {
  // Default center: Delhi, India
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  const defaultZoom = 12;

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Your style URL
      center: [77.2090, 28.6139], // Your coordinates
      zoom: 12
    });

    // Add your datasets here
    map.current.on('load', () => {
      // Add your GeoJSON layers, markers, etc.
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="w-full h-full relative" data-testid="map-container">
      <div ref={mapContainer} className="w-full h-full" />
        
        {/* Heatmap Overlay */}
        {showHeatmap && <HeatmapOverlay />}
        
        {/* Sensor Markers */}
        <SensorMarkers />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg z-[1000]" data-testid="map-legend">
          <h3 className="text-sm font-semibold mb-3 text-card-foreground" data-testid="legend-title">CO₂ Levels (ppm)</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 rounded" style={{ background: 'linear-gradient(to right, #10b981, #3b82f6, #f59e0b, #ef4444)' }}></div>
              <span className="text-xs text-muted-foreground font-mono">0 - 1000+</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border" data-testid="legend-categories">
              <div className="flex items-center gap-1.5" data-testid="legend-item-low">
                <div className="w-3 h-3 rounded-sm bg-[#10b981]"></div>
                <span className="text-muted-foreground">Low</span>
              </div>
              <div className="flex items-center gap-1.5" data-testid="legend-item-high">
                <div className="w-3 h-3 rounded-sm bg-[#f59e0b]"></div>
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="flex items-center gap-1.5" data-testid="legend-item-medium">
                <div className="w-3 h-3 rounded-sm bg-[#3b82f6]"></div>
                <span className="text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-1.5" data-testid="legend-item-critical">
                <div className="w-3 h-3 rounded-sm bg-[#ef4444]"></div>
                <span className="text-muted-foreground">Critical</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scale */}
        <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground z-[1000]" data-testid="map-scale">
          Scale: 1:50,000
        </div>
    </div>
  );
}

export function MapLibreIframe() {
  return (
    <iframe 
      src="/your-map.html" 
      className="w-full h-full border-0"
      title="MapLibre Map"
    />
  );
}
