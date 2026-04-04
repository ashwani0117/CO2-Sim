import { useState, useEffect, useCallback } from "react";
import { riskAPI, type SensorData, type AlertResponse } from "../services/risk-api";

/**
 * Demo sensor zones with fixed coordinates
 */
const DEMO_ZONES = [
  {
    zone: "Tank A - Zone 1",
    lat: 28.6139,
    lng: 77.209,
  },
  {
    zone: "Industrial Zone B",
    lat: 28.5244,
    lng: 77.1855,
  },
  {
    zone: "Urban Ward 3",
    lat: 28.6505,
    lng: 77.231,
  },
];

interface SimulationConfig {
  intervalMs: number;
  enabled: boolean;
}

/**
 * Hook for simulating environmental sensor data and calling the risk API
 */
export function useSimulation(config: SimulationConfig = { intervalMs: 3000, enabled: true }) {
  const [currentAlert, setCurrentAlert] = useState<AlertResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertHistory, setAlertHistory] = useState<AlertResponse[]>([]);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);

  /**
   * Generate simulated sensor data with variations
   */
  const generateSensorData = useCallback((): SensorData => {
    const zone = DEMO_ZONES[currentZoneIndex % DEMO_ZONES.length];

    // Add random variations to simulate real sensor readings
    // Some readings will trigger alerts, others will be normal
    const baseAQI = 70 + Math.random() * 150; // 70-220
    const basePH = 6.8 + Math.random() * 2; // 6.8-8.8
    const baseTurbidity = 2 + Math.random() * 6; // 2-8

    return {
      zone: zone.zone,
      lat: zone.lat,
      lng: zone.lng,
      aqi: Math.round(baseAQI * 10) / 10, // One decimal
      ph: Math.round(basePH * 100) / 100, // Two decimals
      turbidity: Math.round(baseTurbidity * 100) / 100,
      timestamp: new Date().toISOString(),
    };
  }, [currentZoneIndex]);

  /**
   * Send data to API and update alert state
   */
  const sendAnalysis = useCallback(async (sensorData?: SensorData) => {
    setIsLoading(true);
    try {
      const dataToSend = sensorData || generateSensorData();
      const response = await riskAPI.analyzeRisk(dataToSend);

      setCurrentAlert(response);

      // Keep alert history (max 20 recent alerts)
      if (response.show_alert) {
        setAlertHistory((prev) => [response, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error("Error in simulation:", error);
    } finally {
      setIsLoading(false);
    }
  }, [generateSensorData]);

  /**
   * Initialize simulation loop
   */
  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // Send initial reading
    sendAnalysis();

    // Set up interval for periodic readings
    const interval = setInterval(() => {
      setCurrentZoneIndex((prev) => prev + 1); // Cycle through zones
      sendAnalysis();
    }, config.intervalMs);

    return () => clearInterval(interval);
  }, [config.enabled, config.intervalMs, sendAnalysis]);

  return {
    currentAlert,
    isLoading,
    alertHistory,
    sendAnalysis,
    currentZone: DEMO_ZONES[currentZoneIndex % DEMO_ZONES.length],
  };
}
