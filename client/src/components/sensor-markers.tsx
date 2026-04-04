import { useQuery } from "@tanstack/react-query";
import { Marker, Popup } from "react-leaflet";
import { Sensor } from "@shared/schema";
import L from "leaflet";

const createSensorIcon = (status: string) => {
  const color = status === 'active' ? '#10b981' : '#6b7280';
  return L.divIcon({
    className: 'custom-sensor-icon',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function SensorMarkers() {
  const { data: sensors, isLoading } = useQuery<Sensor[]>({
    queryKey: ['/api/sensors'],
  });

  if (isLoading || !sensors) {
    return null;
  }

  return (
    <>
      {sensors.map((sensor) => (
        <Marker
          key={sensor.id}
          position={[sensor.lat, sensor.lng]}
          icon={createSensorIcon(sensor.status)}
          data-testid={`marker-sensor-${sensor.id}`}
        >
          <Popup data-testid={`popup-sensor-${sensor.id}`}>
            <div className="p-2 space-y-2 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{sensor.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  sensor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {sensor.status}
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO₂:</span>
                  <span className="font-mono font-medium">{sensor.co2?.toFixed(1) || 'N/A'} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PM2.5:</span>
                  <span className="font-mono">{sensor.pm25?.toFixed(1) || 'N/A'} µg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">{sensor.temperature?.toFixed(1) || 'N/A'}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Humidity:</span>
                  <span className="font-mono">{sensor.humidity?.toFixed(0) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind:</span>
                  <span className="font-mono">{sensor.windSpeed?.toFixed(1) || 'N/A'} m/s</span>
                </div>
              </div>
              
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Last updated: {sensor.lastReading ? new Date(sensor.lastReading).toLocaleString() : 'Never'}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
