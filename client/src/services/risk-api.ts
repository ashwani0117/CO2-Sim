// Configure default API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface SensorData {
  zone: string;
  lat: number;
  lng: number;
  aqi?: number;
  ph?: number;
  turbidity?: number;
  timestamp?: string;
}

interface AlertResponse {
  show_alert: boolean;
  risk_type: "Air" | "Water" | "None";
  severity: "LOW" | "MEDIUM" | "HIGH";
  location: string;
  lat: number;
  lng: number;
  confidence: number;
  reasons: string[];
  trend: string;
  actions: string[];
  aqi?: number;
  ph?: number;
  turbidity?: number;
  timestamp?: string;
}

class RiskAnalysisAPI {
  /**
   * Analyze sensor data and get risk alert
   */
  async analyzeRisk(sensorData: SensorData): Promise<AlertResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sensorData,
          timestamp: sensorData.timestamp || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as AlertResponse;
    } catch (error) {
      console.error("Error analyzing risk:", error);
      // Return safe default on error
      return {
        show_alert: false,
        risk_type: "None",
        severity: "LOW",
        location: sensorData.zone,
        lat: sensorData.lat,
        lng: sensorData.lng,
        confidence: 0,
        reasons: ["API Error - unable to analyze"],
        trend: "stable",
        actions: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Batch analyze multiple sensor readings
   */
  async analyzeRiskBatch(sensorDataList: SensorData[]): Promise<AlertResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/batch-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          sensorDataList.map((data) => ({
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          }))
        ),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as AlertResponse[];
    } catch (error) {
      console.error("Error in batch analysis:", error);
      return [];
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get API information and thresholds
   */
  async getInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/info`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching API info:", error);
      return null;
    }
  }
}

// Export singleton instance
export const riskAPI = new RiskAnalysisAPI();
export type { SensorData, AlertResponse };
