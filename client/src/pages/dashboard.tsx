import { useState } from "react";
import { MapLibreContainer } from "../components/maplibre-container";
import { LayerTogglePanel } from "../components/layer-toggle-panel";
import { EmissionStats } from "../components/emission-stats";
import { SimulationPanel } from "../components/simulation-panel";
import { SensorPanel } from "../components/sensor-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, Sun, Moon } from "lucide-react";
import { LayerType } from "@shared/schema";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'simulation' | 'sensors'>('stats');
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(new Set<LayerType>(['transport', 'industry', 'residential', 'forest', 'power']));
  const [layerOpacity, setLayerOpacity] = useState<Record<LayerType, number>>({
    transport: 100,
    industry: 100,
    residential: 100,
    forest: 100,
    power: 100,
  });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleLayer = (layer: LayerType) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    setActiveLayers(newLayers);
  };

  const updateLayerOpacity = (layer: LayerType, opacity: number) => {
    setLayerOpacity(prev => ({ ...prev, [layer]: opacity }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 z-10" data-testid="header-main">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-toggle-sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center" data-testid="logo">
              <span className="text-primary-foreground font-bold text-sm">CT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground" data-testid="heading-app-name">CO2-Simulator</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-app-tagline">Smart Carbon Monitoring System</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleDarkMode}
            data-testid="button-toggle-theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" data-testid="main-content">
        {/* Left Sidebar - Layer Controls */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-border bg-card overflow-y-auto" data-testid="sidebar-left">
            <LayerTogglePanel
              activeLayers={activeLayers}
              layerOpacity={layerOpacity}
              showHeatmap={showHeatmap}
              onToggleLayer={toggleLayer}
              onUpdateOpacity={updateLayerOpacity}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
            />
          </aside>
        )}

        {/* Center - Map View */}
        <main className="flex-1 relative" data-testid="main-map-view">
          <MapLibreContainer
            activeScenario="baseline"
            currentHour={0}
            heatmapIntensity={1}
            activeLayers={activeLayers}
            layerOpacity={layerOpacity}
            showHeatmap={showHeatmap}
            showSO2Heatmap={false}
          />
        </main>

        {/* Right Sidebar - Stats/Simulation/Sensors */}
        {rightPanelOpen && (
          <aside className="w-96 border-l border-border bg-card overflow-y-auto" data-testid="sidebar-right">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col" data-testid="tabs-right-panel">
              <div className="border-b border-border p-4 pb-0" data-testid="tabs-header">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stats" data-testid="tab-stats">Statistics</TabsTrigger>
                  <TabsTrigger value="simulation" data-testid="tab-simulation">Simulation</TabsTrigger>
                  <TabsTrigger value="sensors" data-testid="tab-sensors">Sensors</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="stats" className="m-0 p-4">
                  <EmissionStats />
                </TabsContent>
                
                <TabsContent value="simulation" className="m-0 p-4">
                  <SimulationPanel />
                </TabsContent>
                
                <TabsContent value="sensors" className="m-0 p-4">
                  <SensorPanel />
                </TabsContent>
              </div>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  );
}
