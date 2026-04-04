import { useState, useEffect } from 'react';

export interface AQIData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  co2: number;
  timestamp: string;
  status: 'good' | 'moderate' | 'unhealthy' | 'loading' | 'error';
  source: string;
}

export function useAQI() {
  const [aqi, setAQI] = useState<AQIData>({
    aqi: 0,
    pm25: 0,
    pm10: 0,
    o3: 0,
    no2: 0,
    so2: 0,
    co: 0,
    co2: 0,
    timestamp: new Date().toISOString(),
    status: 'loading',
    source: 'Loading...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        setLoading(true);
        // Hyderabad coordinates
        const lat = 17.384;
        const lon = 78.4564;
        let data = null;
        let source = 'unknown';

        // Use Open-Meteo with hourly data including CO2
        try {
          const response = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=17.384&longitude=78.4564&hourly=pm10,pm2_5,carbon_dioxide,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide&forecast_days=7`,
            { 
              method: 'GET',
              headers: { 'Accept': 'application/json' }
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.hourly) {
              // Calculate averages from hourly data
              const hourly = result.hourly;
              const pm25Array = hourly.pm2_5 || [];
              const pm10Array = hourly.pm10 || [];
              const co2Array = hourly.carbon_dioxide || [];
              const coArray = hourly.carbon_monoxide || [];
              const no2Array = hourly.nitrogen_dioxide || [];
              const so2Array = hourly.sulphur_dioxide || [];

              const calculateAverage = (arr: number[]) => {
                if (!arr || arr.length === 0) return 0;
                const validValues = arr.filter(v => v !== null && v !== undefined && !isNaN(v));
                if (validValues.length === 0) return 0;
                return validValues.reduce((a, b) => a + b, 0) / validValues.length;
              };

              data = {
                current: {
                  pm2_5: calculateAverage(pm25Array),
                  pm10: calculateAverage(pm10Array),
                  carbon_dioxide: calculateAverage(co2Array),
                  carbon_monoxide: calculateAverage(coArray),
                  nitrogen_dioxide: calculateAverage(no2Array),
                  sulphur_dioxide: calculateAverage(so2Array),
                }
              };
              source = 'Open-Meteo (Avg)';
              console.log('✓ Using Open-Meteo API average data:', data);
            }
          }
        } catch (e) {
          console.warn('Open-Meteo API failed:', e);
        }

        // If Open-Meteo fails, use fallback with mock data
        if (!data) {
          console.log('⚠ Using mock data - Check your internet connection');
          data = {
            current: {
              pm2_5: 45,
              pm10: 85,
              carbon_monoxide: 450,
              nitrogen_dioxide: 28,
              sulphur_dioxide: 12,
              carbon_dioxide: 420,
            }
          };
          source = 'Mock Data (Development)';
        }

        const current = data.current;

        // Calculate AQI from PM2.5 (EPA method)
        const pm25 = current.pm2_5 || 0;
        let aqiValue = 0;
        let status: 'good' | 'moderate' | 'unhealthy' = 'good';

        if (pm25 <= 12) {
          aqiValue = (pm25 / 12) * 50;
          status = 'good';
        } else if (pm25 <= 35.4) {
          aqiValue = ((pm25 - 12) / 23.4) * 50 + 50;
          status = 'moderate';
        } else if (pm25 <= 55.4) {
          aqiValue = ((pm25 - 35.4) / 20) * 50 + 100;
          status = 'unhealthy';
        } else {
          aqiValue = 150 + ((pm25 - 55.4) / 50) * 50;
          status = 'unhealthy';
        }

        setAQI({
          aqi: Math.round(aqiValue),
          pm25: Math.round(pm25 * 10) / 10,
          pm10: Math.round((current.pm10 || 0) * 10) / 10,
          o3: 0, // Not available in new API
          no2: Math.round((current.nitrogen_dioxide || 0) * 10) / 10,
          so2: Math.round((current.sulphur_dioxide || 0) * 10) / 10,
          co: Math.round((current.carbon_monoxide || 0) * 10) / 10,
          co2: Math.round((current.carbon_dioxide || 420) * 10) / 10,
          timestamp: new Date().toISOString(),
          status: status,
          source: source,
        });
      } catch (error) {
        console.error('Failed to fetch AQI:', error);
        setAQI({
          aqi: 0,
          pm25: 0,
          pm10: 0,
          o3: 0,
          no2: 0,
          so2: 0,
          co: 0,
          co2: 0,
          timestamp: new Date().toISOString(),
          status: 'error',
          source: 'Error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAQI();
    // Refresh every 15 minutes
    const interval = setInterval(fetchAQI, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return aqi;
}
