import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { generateSO2HeatmapData, type HeatmapPoint } from "@/utils/heatmapGenerator";

interface MapLibreContainerProps {
  activeScenario: string;
  currentHour: number;
  heatmapIntensity: number;
  activeLayers: Set<string>;
  layerOpacity: Record<string, number>;
  showHeatmap: boolean;
  showSO2Heatmap: boolean;
  flyToTarget?: {
    lat: number;
    lng: number;
    nonce: number;
  } | null;
}

export function MapLibreContainer({
  activeScenario,
  currentHour,
  heatmapIntensity,
  activeLayers,
  layerOpacity,
  showHeatmap,
  showSO2Heatmap,
  flyToTarget,
}: MapLibreContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<number[][]>([]);
  const so2BasePointsRef = useRef<HeatmapPoint[]>([]);

  const getSO2HourMultiplier = (hour: number) => {
    if (hour >= 0 && hour < 5) return 0.55;
    if (hour >= 5 && hour < 9) return 1.05;
    if (hour >= 9 && hour < 13) return 1.2;
    if (hour >= 13 && hour < 17) return 1.0;
    if (hour >= 17 && hour < 21) return 1.15;
    return 0.75;
  };

  const updateSO2HeatmapForHour = (hour: number) => {
    if (!map.current?.getSource("so2-heatmap-source")) return;

    const multiplier = getSO2HourMultiplier(hour);
    const so2Features = so2BasePointsRef.current.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat],
      },
      properties: {
        intensity: Math.max(0, Math.min(100, point.intensity * multiplier)),
      },
    }));

    (map.current.getSource("so2-heatmap-source") as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: so2Features as any,
    });
  };

  // Initialize map with 3D capabilities
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [78.4625, 17.438], // Hyderabad (centered on actual data bounds)
      zoom: 13,
      pitch: 50,
      bearing: 0,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      "top-right"
    );
    map.current.addControl(new maplibregl.ScaleControl(), "bottom-right");

    map.current.on("load", () => {
      setMapLoaded(true);
      loadLayers();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Load all GeoJSON layers from Hydra data
  const loadLayers = async () => {
    if (!map.current) return;
    const layerGeoJsonMap: Record<string, any> = {};

    const layerConfigs: Record<string, {
      file: string;
      color: string;
      type: 'line' | 'fill-extrusion' | 'fill' | 'circle';
      height?: number;
    }> = {
      roads_highway: { file: 'roads_highway.geojson', color: '#000000', type: 'line' },
      roads_street: { file: 'roads_street.geojson', color: '#555555', type: 'line' },
      power: { file: 'power.geojson', color: '#f1c40f', type: 'fill-extrusion', height: 70 },
      industry_zones: { file: 'industry_zones.geojson', color: '#8b0000', type: 'fill-extrusion', height: 20 },
      industry_buildings: { file: 'industry_buildings.geojson', color: '#e74c3c', type: 'fill-extrusion', height: 50 },
      residential: { file: 'residential.geojson', color: '#3498db', type: 'fill-extrusion', height: 35 },
      forest_zones: { file: 'forest_zones.geojson', color: '#1e8449', type: 'fill' },
      forest_trees: { file: 'forest_trees.geojson', color: '#2ecc71', type: 'circle' },
      agriculture: { file: 'agriculture.geojson', color: '#d35400', type: 'fill' },
      water_infra: { file: 'water_infra.geojson', color: '#301934', type: 'fill-extrusion', height: 60 },
    };

    for (const [layerId, config] of Object.entries(layerConfigs)) {
      try {
        const response = await fetch(`/data/${config.file}`);
        if (!response.ok) continue;

        const geojsonData = await response.json();
        layerGeoJsonMap[layerId] = geojsonData;

        if (!map.current?.getSource(`${layerId}-source`)) {
          map.current?.addSource(`${layerId}-source`, {
            type: "geojson",
            data: geojsonData,
          });
        }

        if (config.type === 'line' && !map.current?.getLayer(`${layerId}-layer`)) {
          map.current?.addLayer({
            id: `${layerId}-layer`,
            type: "line",
            source: `${layerId}-source`,
            layout: { visibility: "visible" },
            paint: {
              "line-color": config.color,
              "line-width": layerId === 'roads_highway' ? 3 : 2,
              "line-opacity": 0.8,
            },
          });
        } else if (config.type === 'fill-extrusion' && !map.current?.getLayer(`${layerId}-layer`)) {
          map.current?.addLayer({
            id: `${layerId}-layer`,
            type: "fill-extrusion",
            source: `${layerId}-source`,
            layout: { visibility: "visible" },
            paint: {
              "fill-extrusion-color": config.color,
              "fill-extrusion-height": config.height || 10,
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.8,
            },
          });
        } else if (config.type === 'circle' && !map.current?.getLayer(`${layerId}-layer`)) {
          map.current?.addLayer({
            id: `${layerId}-layer`,
            type: "circle",
            source: `${layerId}-source`,
            layout: { visibility: "visible" },
            paint: {
              "circle-radius": 4,
              "circle-color": config.color,
              "circle-opacity": 0.7,
            },
          });
        } else if (config.type === 'fill' && !map.current?.getLayer(`${layerId}-layer`)) {
          map.current?.addLayer({
            id: `${layerId}-layer`,
            type: "fill",
            source: `${layerId}-source`,
            layout: { visibility: "visible" },
            paint: {
              "fill-color": config.color,
              "fill-opacity": 0.5,
            },
          });
        }
      } catch (error) {
        console.warn(`Failed to load ${layerId}:`, error);
      }
    }

    const so2Points = generateSO2HeatmapData(layerGeoJsonMap);
    so2BasePointsRef.current = so2Points;
    const initialMultiplier = getSO2HourMultiplier(currentHour);
    const so2Features = so2Points.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat],
      },
      properties: {
        intensity: Math.max(0, Math.min(100, point.intensity * initialMultiplier)),
      },
    }));

    if (map.current?.getSource("so2-heatmap-source")) {
      (map.current.getSource("so2-heatmap-source") as maplibregl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: so2Features as any,
      });
    } else {
      map.current?.addSource("so2-heatmap-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: so2Features as any,
        },
      });

      map.current?.addLayer({
        id: "so2-heatmap-layer",
        type: "heatmap",
        source: "so2-heatmap-source",
        layout: {
          visibility: showSO2Heatmap ? "visible" : "none",
        },
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "intensity"],
            0, 0,
            100, 1,
          ],
          "heatmap-intensity": heatmapIntensity * 1.2,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(34,197,94,0)",
            0.35, "rgb(34,197,94)",
            0.65, "rgb(250,204,21)",
            1, "rgb(220,38,38)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 12,
            15, 28,
          ],
          "heatmap-opacity": 0.75,
        },
      });
    }
  };

  // Load simulation frame data
  useEffect(() => {
    if (!mapLoaded) return;

    const loadFrame = async () => {
      try {
        const framePath = `/data/sim_output/${activeScenario}/frame_${String(currentHour).padStart(2, '0')}.json`;
        const response = await fetch(framePath);
        if (!response.ok) {
          console.warn(`Frame not found: ${framePath}`);
          return;
        }

        const frameData = await response.json();
        setCurrentFrame(frameData);
        updateHeatmap(frameData);
      } catch (error) {
        console.warn('Failed to load simulation frame:', error);
      }
    };

    loadFrame();
  }, [mapLoaded, activeScenario, currentHour]);

  // Update heatmap with simulation data
  const updateHeatmap = (frameData: number[][]) => {
    if (!map.current || !frameData || frameData.length === 0) return;

    const rows = frameData.length;
    const cols = frameData[0].length;

    // Hyderabad bounds
    // Bounds from rasterize_layers.py: (78.34, 17.365, 78.585, 17.511)
    const minLon = 78.34, maxLon = 78.585;
    const minLat = 17.365, maxLat = 17.511;

    const features = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = frameData[i][j];
        if (value <= 0) continue;

        // Fix flip: row 0 should be at maxLat (top), not minLat (bottom)
        const lat = maxLat - (i / rows) * (maxLat - minLat);
        const lon = minLon + (j / cols) * (maxLon - minLon);

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          properties: {
            value: value,
          },
        });
      }
    }

    if (map.current?.getSource('heatmap-source')) {
      (map.current.getSource('heatmap-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: features as any,
      });
    } else {
      map.current?.addSource('heatmap-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features as any,
        },
      });

      map.current?.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        layout: {
          visibility: showHeatmap ? 'visible' : 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, 0,
            100, 1
          ],
          'heatmap-intensity': heatmapIntensity,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 15,
            15, 30
          ],
          'heatmap-opacity': 0.8,
        },
      });
    }
  };

  // Toggle layer visibility
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const allLayers = [
      'roads_highway', 'roads_street', 'power', 'industry_zones',
      'industry_buildings', 'residential', 'forest_zones', 'forest_trees', 'agriculture', 'water_infra'
    ];

    allLayers.forEach(layerId => {
      if (map.current?.getLayer(`${layerId}-layer`)) {
        const visibility = activeLayers.has(layerId) ? 'visible' : 'none';
        map.current.setLayoutProperty(`${layerId}-layer`, 'visibility', visibility);

        const opacity = (layerOpacity[layerId] || 100) / 100;
        const layerDef = map.current.getLayer(`${layerId}-layer`);

        if (layerDef?.type === 'line') {
          map.current.setPaintProperty(`${layerId}-layer`, 'line-opacity', opacity);
        } else if (layerDef?.type === 'fill-extrusion') {
          map.current.setPaintProperty(`${layerId}-layer`, 'fill-extrusion-opacity', opacity * 0.8);
        } else if (layerDef?.type === 'circle') {
          map.current.setPaintProperty(`${layerId}-layer`, 'circle-opacity', opacity * 0.7);
        } else if (layerDef?.type === 'fill') {
          map.current.setPaintProperty(`${layerId}-layer`, 'fill-opacity', opacity * 0.5);
        }
      }
    });
  }, [activeLayers, layerOpacity, mapLoaded]);

  // Toggle heatmap
  useEffect(() => {
    if (!mapLoaded || !map.current?.getLayer('heatmap-layer')) return;

    map.current.setLayoutProperty(
      'heatmap-layer',
      'visibility',
      showHeatmap ? 'visible' : 'none'
    );
  }, [showHeatmap, mapLoaded]);

  // Toggle SO2 heatmap
  useEffect(() => {
    if (!mapLoaded || !map.current?.getLayer("so2-heatmap-layer")) return;

    map.current.setLayoutProperty(
      "so2-heatmap-layer",
      "visibility",
      showSO2Heatmap ? "visible" : "none"
    );
  }, [showSO2Heatmap, mapLoaded]);

  // Update SO2 by simulation hour (timer)
  useEffect(() => {
    if (!mapLoaded) return;
    updateSO2HeatmapForHour(currentHour);
  }, [currentHour, mapLoaded]);

  // Update heatmap intensity
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    if (map.current.getLayer('heatmap-layer')) {
      map.current.setPaintProperty('heatmap-layer', 'heatmap-intensity', heatmapIntensity);
    }

    if (map.current.getLayer('so2-heatmap-layer')) {
      map.current.setPaintProperty('so2-heatmap-layer', 'heatmap-intensity', heatmapIntensity * 1.2);
    }
  }, [heatmapIntensity, mapLoaded]);

  // Fly to requested target point
  useEffect(() => {
    if (!mapLoaded || !map.current || !flyToTarget) return;

    map.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: 15,
      speed: 0.9,
      curve: 1.35,
      essential: true,
    });
  }, [flyToTarget, mapLoaded]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Time Display */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full border border-primary shadow-lg z-10">
        <span className="text-2xl font-bold text-foreground font-mono">
          {String(currentHour).padStart(2, '0')}:00
        </span>
      </div>
    </div>
  );
}
