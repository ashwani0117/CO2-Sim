import { useState, useEffect } from 'react';

interface CO2SensorData {
  co2: number;
  timestamp: string;
  status: 'loading' | 'connected' | 'error';
  source: string;
}

// Configuration for gas sensor API
const SENSOR_CONFIG = {
  apiKey: '', // Add your sensor API key here
  apiUrl: '', // Add your sensor API endpoint here
  refreshInterval: 30000, // Refresh every 30 seconds
};

export function useCO2Sensor() {
  const [sensorData, setSensorData] = useState<CO2SensorData>({
    co2: 420,
    timestamp: new Date().toISOString(),
    status: 'loading',
    source: 'Default',
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      // If no API key is configured, use fallback data
      if (!SENSOR_CONFIG.apiKey || !SENSOR_CONFIG.apiUrl) {
        setSensorData({
          co2: 420,
          timestamp: new Date().toISOString(),
          status: 'connected',
          source: 'Mock Sensor',
        });
        return;
      }

      try {
        const response = await fetch(SENSOR_CONFIG.apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${SENSOR_CONFIG.apiKey}`,
            // Add any other headers required by your sensor API
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Parse the sensor response - adjust based on your API structure
          const co2Value = data.co2 || data.carbon_dioxide || data.value || 420;
          
          setSensorData({
            co2: Math.round(co2Value * 10) / 10,
            timestamp: new Date().toISOString(),
            status: 'connected',
            source: 'Live Sensor',
          });
          
          console.log('✓ CO2 Sensor data updated:', co2Value);
        } else {
          throw new Error('Sensor API request failed');
        }
      } catch (error) {
        console.error('Failed to fetch CO2 sensor data:', error);
        setSensorData({
          co2: 420,
          timestamp: new Date().toISOString(),
          status: 'error',
          source: 'Offline',
        });
      }
    };

    // Initial fetch
    fetchSensorData();

    // Set up periodic refresh
    const interval = setInterval(fetchSensorData, SENSOR_CONFIG.refreshInterval);

    return () => clearInterval(interval);
  }, []);

  return sensorData;
}

// Export config for easy updates
export { SENSOR_CONFIG };
