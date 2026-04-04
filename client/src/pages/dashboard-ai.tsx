import { useState } from "react";
import { MapLibreContainer } from "../components/maplibre-container";
import { AlertPopup } from "../components/alert-popup";
import { AlertPanel } from "../components/alert-panel";
import { useSimulation } from "../hooks/useSimulation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";

export default function DashboardAI() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set<string>());

  // Initialize simulation hook
  const { currentAlert, alertHistory, isLoading } = useSimulation({
    intervalMs: 3000,
    enabled: simulationEnabled,
  });

  // Check if current alert has been dismissed
  const shouldShowAlert =
    currentAlert && !dismissedAlerts.has(currentAlert.location + currentAlert.timestamp);

  // Handle map navigation to alert location
  const handleLocateOnMap = (lat: number, lng: number, zone: string) => {
    // In production, you would use maplibre's flyTo method:
    // mapRef.current?.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
    console.log(`📍 Flying to zone: ${zone} (${lat}, ${lng})`);
    alert(`Map would fly to:\n${zone}\nLat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  // Handle dismiss alert
  const handleDismissAlert = () => {
    if (currentAlert) {
      setDismissedAlerts(
        (prev) => new Set(prev).add(currentAlert.location + currentAlert.timestamp)
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard-ai">
      {/* Header */}
      <header
        className="h-16 border-b border-border bg-card flex items-center justify-between px-4 z-10 shadow-sm"
        data-testid="header-ai"
      >
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-toggle-sidebar-ai"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center" data-testid="logo-ai">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground" data-testid="heading-app-ai">
                Environmental Risk Monitor
              </h1>
              <p className="text-xs text-muted-foreground" data-testid="tagline-ai">
                AI-Powered Alert System
              </p>
            </div>
          </div>
        </div>

        {/* Simulation Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-slate-700">Simulation</span>
            <button
              onClick={() => setSimulationEnabled(!simulationEnabled)}
              className={`p-1 rounded transition-all ${
                simulationEnabled
                  ? "bg-green-600 text-white"
                  : "bg-slate-400 text-white"
              }`}
              data-testid="button-toggle-simulation"
            >
              {simulationEnabled ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Active Alerts Count */}
          {alertHistory.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-red-700">
                {alertHistory.length} Active Alerts
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" data-testid="main-content-ai">
        {/* Left Sidebar - Controls */}
        {sidebarOpen && (
          <aside
            className="w-80 border-r border-border bg-card overflow-y-auto p-4"
            data-testid="sidebar-left-ai"
          >
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Recent Alerts
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alertHistory.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No alerts yet. Simulation will generate alerts...
                    </p>
                  ) : (
                    alertHistory.map((alert, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 border border-red-200 rounded p-2 text-xs hover:bg-red-100 cursor-pointer transition-colors"
                        onClick={() => {
                          setPanelOpen(true);
                        }}
                      >
                        <p className="font-semibold text-red-900">{alert.location}</p>
                        <p className="text-red-700 text-xxs">
                          {alert.risk_type} • {alert.severity}
                        </p>
                        <p className="text-red-600 text-xxs mt-1">
                          {alert.reasons?.[0] || "Alert detected"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <h3 className="text-xs font-bold mb-2">System Status</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Simulation:</span>
                    <span
                      className={`font-semibold ${
                        simulationEnabled ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {simulationEnabled ? "Running" : "Paused"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Alerts:</span>
                    <span className="font-semibold text-slate-900">{alertHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Zone:</span>
                    <span className="font-semibold text-slate-900">Active</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-semibold mb-1">💡 How it works:</p>
                <ul className="space-y-1 text-xxs">
                  <li>• Simulation generates sensor data every 3 seconds</li>
                  <li>• API analyzes data for environmental risks</li>
                  <li>• Alerts appear when thresholds are exceeded</li>
                  <li>• Click "Learn More" for detailed analysis</li>
                  <li>• Use "Locate" to zoom to alert location on map</li>
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* Center - Map View */}
        <main className="flex-1 relative" data-testid="main-map-ai">
          <MapLibreContainer
            activeScenario="baseline"
            currentHour={0}
            heatmapIntensity={1}
            activeLayers={new Set(["roads_highway", "roads_street", "industry_zones", "industry_buildings", "residential", "forest_zones", "water_infra", "power"])}
            layerOpacity={{
              roads_highway: 100,
              roads_street: 100,
              power: 100,
              industry_zones: 100,
              industry_buildings: 100,
              residential: 100,
              forest_zones: 100,
              forest_trees: 100,
              agriculture: 100,
              water_infra: 100,
            }}
            showHeatmap={true}
            showSO2Heatmap={false}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-white rounded-full" />
                <span className="text-xs font-semibold text-slate-600">Analyzing...</span>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Alert Details */}
        {panelOpen && (
          <aside className="w-96 border-l border-border bg-card overflow-y-auto">
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <div className="border-b border-border p-4 pb-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Alert Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="details" className="m-0 p-4">
                  {currentAlert && shouldShowAlert ? (
                    <div className="space-y-4">
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <h3 className="font-bold text-red-900 mb-2">
                          {currentAlert.risk_type} Pollution Detected
                        </h3>
                        <p className="text-sm text-red-800 mb-3">
                          {currentAlert.reasons?.[0] || "Environmental risk detected"}
                        </p>
                        <div className="flex justify-between mb-3">
                          <span className="text-xs font-semibold">Severity:</span>
                          <span className="text-sm font-bold text-red-700">
                            {currentAlert.severity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-semibold">Confidence:</span>
                          <span className="text-sm font-bold text-blue-700">
                            {Math.round(currentAlert.confidence)}%
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          handleLocateOnMap(currentAlert.lat, currentAlert.lng, currentAlert.location);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        📍 Locate on Map
                      </Button>

                      <Button
                        onClick={() => setPanelOpen(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No active alert selected</p>
                  )}
                </TabsContent>

                <TabsContent value="history" className="m-0 p-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {alertHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No alerts in history
                      </p>
                    ) : (
                      alertHistory.map((alert, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-100 rounded p-2 text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <p className="font-semibold">{alert.location}</p>
                          <p className="text-muted-foreground">
                            {alert.risk_type} • {alert.severity}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </aside>
        )}
      </div>

      {/* Alert Popup - Top Right */}
      <AlertPopup
        alert={shouldShowAlert ? currentAlert : null}
        onLearnMore={() => {
          setPanelOpen(true);
        }}
        onDismiss={handleDismissAlert}
      />

      {/* Alert Panel - Drawer */}
      <AlertPanel
        alert={currentAlert}
        isOpen={false}
        onClose={() => setPanelOpen(false)}
        onLocate={handleLocateOnMap}
      />
    </div>
  );
}
