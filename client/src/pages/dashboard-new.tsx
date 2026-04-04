import { useRef, useState } from "react";
import { MapLibreContainer } from "../components/maplibre-container";
import { LayerTogglePanel } from "../components/layer-toggle-panel-new";
import { SimulationControlPanel } from "../components/simulation-control-panel";
import { ChartsPanel } from "../components/charts-panel";
import { AQIBadge } from "../components/aqi-badge";
import { CO2Display } from "../components/co2-display";
import { useAQI } from "../hooks/useAQI";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Menu, X, Sun, Moon, BarChart3 } from "lucide-react";
import { useEffect } from "react";

type SidebarAlert = {
  title: string;
  zone: string;
  location: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  reason: string[];
  trend: string;
  actions: string[];
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const aqi = useAQI();
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('CO2-Simulator Summary Report');
  const [includeCO2, setIncludeCO2] = useState(true);
  const [includeAQI, setIncludeAQI] = useState(true);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulation state
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [currentHour, setCurrentHour] = useState(0);
  const [heatmapIntensity, setHeatmapIntensity] = useState(1.0);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(false);
  const [showNoonAlert, setShowNoonAlert] = useState(false);
  const [sidebarAlertExpanded, setSidebarAlertExpanded] = useState(false);
  const [sidebarAlert, setSidebarAlert] = useState<SidebarAlert | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; nonce: number } | null>(null);
  const previousHourRef = useRef(currentHour);

  useEffect(() => {
    if (isSimulationPlaying && previousHourRef.current !== 12 && currentHour === 12) {
      setShowNoonAlert(true);
      setSidebarAlertExpanded(false);
      setSidebarAlert({
        title: "Air Pollution Alert",
        zone: "B (Ward 3)",
        location: "Industrial Belt",
        severity: "HIGH",
        confidence: 84,
        reason: [
          "AQI exceeded safe limit (165+)",
          "PM 2.5 concentration increased rapidly.",
        ],
        trend: "Continuous rise in last 15 minutes.",
        actions: [
          "Restrict traffic in affected area.",
          "Issue public health advisory.",
          "Monitor nearby industrial emissions.",
        ],
      });
    }
    previousHourRef.current = currentHour;
  }, [currentHour, isSimulationPlaying]);

  // Layer state
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(['roads_highway', 'roads_street', 'power', 'industry_zones', 
             'industry_buildings', 'residential', 'forest_zones', 'forest_trees', 'agriculture', 'water_infra'])
  );
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({
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
  });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSO2Heatmap, setShowSO2Heatmap] = useState(false);

  const toggleLayer = (layer: string | string[]) => {
    setActiveLayers(prev => {
      const newLayers = new Set(prev);
      const layers = Array.isArray(layer) ? layer : [layer];
      
      layers.forEach(l => {
        if (newLayers.has(l)) {
          newLayers.delete(l);
        } else {
          newLayers.add(l);
        }
      });
      
      return newLayers;
    });
  };

  const updateLayerOpacity = (layer: string, opacity: number) => {
    setLayerOpacity(prev => ({ ...prev, [layer]: opacity }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getFeatureCoordinate = (feature: any): [number, number] | null => {
    const geometry = feature?.geometry;
    if (!geometry) return null;

    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      return [geometry.coordinates[0], geometry.coordinates[1]];
    }

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates?.[0]?.[0])) {
      return [geometry.coordinates[0][0][0], geometry.coordinates[0][0][1]];
    }

    if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates?.[0]?.[0]?.[0])) {
      return [geometry.coordinates[0][0][0][0], geometry.coordinates[0][0][0][1]];
    }

    return null;
  };

  const flyToCity = async () => {
    try {
      const response = await fetch('/data/industry_buildings.geojson');
      if (!response.ok) return;

      const geojson = await response.json();
      const features = Array.isArray(geojson?.features) ? geojson.features : [];
      if (features.length === 0) return;

      const randomFeature = features[Math.floor(Math.random() * features.length)];
      const coordinate = getFeatureCoordinate(randomFeature);
      if (!coordinate) return;

      setFlyToTarget({
        lng: coordinate[0],
        lat: coordinate[1],
        nonce: Date.now(),
      });
    } catch (error) {
      console.error('Failed to locate random industry point', error);
    }
  };

  const resetBearing = () => {
    // This will be handled by map component
    console.log('Reset bearing');
  };

  const handleExportClick = () => {
    setExportPanelOpen(true);
  };

  const handlePerformExport = () => {
    // In a real implementation we'd generate a PDF from report data and selections.
    // For now download the demo PDF placed in public folder.
    try {
      const link = document.createElement('a');
      link.href = '/demo-report.pdf';
      link.download = 'co2-simulator-demo-report.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Failed to download demo report', e);
    }

    setExportPanelOpen(false);
  };

  const handleCancelExport = () => {
    setExportPanelOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar - Black */}
      <header className="h-20 border-b border-gray-800 bg-black flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-gray-800"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/Untitled%20design.png" 
              alt="CO2-Simulator Logo" 
              className="h-20 w-auto"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExportClick}
            className="text-white hover:bg-gray-800"
          >
            Export
          </Button>
          <AQIBadge />
          <div className="font-mono text-base font-bold text-white tracking-wide">
            {currentTime}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleDarkMode}
            className="text-white hover:bg-gray-800"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Export modal - centered popup when export button clicked */}
      {exportPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancelExport} />

          <div className="relative z-60 w-11/12 max-w-md bg-white rounded-lg shadow-2xl border p-6">
            <h3 className="text-lg font-semibold mb-2">Export Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Fill in a few details to make the exported report look more realistic.</p>

            <div className="mb-3">
              <label className="text-xs font-medium block mb-1">Report Title</label>
              <input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex items-center gap-4 mb-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeCO2} onChange={(e) => setIncludeCO2(e.target.checked)} />
                Include CO₂ data
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeAQI} onChange={(e) => setIncludeAQI(e.target.checked)} />
                Include AQI
              </label>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium block mb-1">Format</label>
              <select className="w-full border rounded px-2 py-1 text-sm">
                <option>PDF (Demo)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelExport}>Cancel</Button>
              <Button size="sm" onClick={handlePerformExport}>Export</Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layer Controls */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-border bg-card overflow-y-auto">
            <LayerTogglePanel
              activeLayers={activeLayers}
              layerOpacity={layerOpacity}
              showHeatmap={showHeatmap}
              showSO2Heatmap={showSO2Heatmap}
              onToggleLayer={toggleLayer}
              onUpdateOpacity={updateLayerOpacity}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              onToggleSO2Heatmap={() => setShowSO2Heatmap(!showSO2Heatmap)}
            />
          </aside>
        )}

        {/* Center - Map View */}
        <main className="flex-1 relative overflow-hidden">
          <MapLibreContainer
            activeScenario={activeScenario}
            currentHour={currentHour}
            heatmapIntensity={heatmapIntensity}
            activeLayers={activeLayers}
            layerOpacity={layerOpacity}
            showHeatmap={showHeatmap}
            showSO2Heatmap={showSO2Heatmap}
            flyToTarget={flyToTarget}
          />
          
          {/* Floating Chart Button - Bottom Left */}
          {!showChart && (
            <Button
              onClick={() => setShowChart(true)}
              className="absolute bottom-14 left-6 z-30 bg-blue-600 text-white hover:bg-blue-700 shadow-lg font-semibold px-4 py-2 rounded-full"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Emission Chart
            </Button>
          )}

          {/* Chart Panel Overlay - Floating */}
          {showChart && (
            <div className="absolute bottom-6 left-6 z-40 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                   Charts
                </h2>
                <Button
                  onClick={() => setShowChart(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <ChartsPanel activeScenario={activeScenario} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Simulation Controls */}
        {rightPanelOpen && (
          <aside className="w-96 border-l border-border bg-card flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 pt-4 pb-2">
                <CO2Display />
              </div>

              {showNoonAlert && sidebarAlert && (
                <div className="px-4 pb-2">
                  <div className="rounded-2xl border border-red-500 bg-card overflow-hidden">
                    <div className="flex items-start justify-between px-3 pt-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h3 className="text-[30px] leading-none font-bold text-foreground">{sidebarAlert.title}</h3>
                          <div className="mt-1 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                            <span>Zone : {sidebarAlert.zone}</span>
                            <span>Location : {sidebarAlert.location}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => {
                          setShowNoonAlert(false);
                          setSidebarAlertExpanded(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="px-3 pb-3">
                      {!sidebarAlertExpanded ? (
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setSidebarAlertExpanded(true)}
                        >
                          Learn More
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                            onClick={flyToCity}
                          >
                            Locate On Map
                          </Button>

                          <div className="mt-3 text-sm text-foreground space-y-1">
                            <div className="flex gap-6 text-xs font-semibold">
                              <span>Severity: {sidebarAlert.severity}</span>
                              <span>Confidence: {sidebarAlert.confidence}%</span>
                            </div>

                            <div className="pt-1">
                              <p className="text-xs font-bold inline-block bg-red-100 px-1">Reason</p>
                              {sidebarAlert.reason.map((line) => (
                                <p key={line} className="text-xs">- {line}</p>
                              ))}
                            </div>

                            <div className="pt-1">
                              <p className="text-xs font-bold inline-block bg-red-100 px-1">Trend</p>
                              <p className="text-xs">- {sidebarAlert.trend}</p>
                            </div>

                            <div className="pt-1">
                              <p className="text-xs font-bold inline-block bg-red-100 px-1">Recommended Action</p>
                              {sidebarAlert.actions.map((action) => (
                                <p key={action} className="text-xs">- {action}</p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4">
                <SimulationControlPanel
                  activeScenario={activeScenario}
                  currentHour={currentHour}
                  heatmapIntensity={heatmapIntensity}
                  onScenarioChange={setActiveScenario}
                  onHourChange={setCurrentHour}
                  onIntensityChange={setHeatmapIntensity}
                  onFlyToCity={flyToCity}
                  onResetBearing={resetBearing}
                  onPlayStateChange={setIsSimulationPlaying}
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
