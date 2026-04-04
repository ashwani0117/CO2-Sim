import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Map, Factory, Home, Trees, Zap, Activity, Sprout, CheckSquare, Droplets } from "lucide-react";

interface LayerTogglePanelProps {
  activeLayers: Set<string>;
  layerOpacity: Record<string, number>;
  showHeatmap: boolean;
  showSO2Heatmap: boolean;
  onToggleLayer: (layer: string | string[]) => void;
  onUpdateOpacity: (layer: string, opacity: number) => void;
  onToggleHeatmap: () => void;
  onToggleSO2Heatmap: () => void;
}

const layerConfig: Record<string, { label: string; icon: any; color: string; description: string }> = {
  roads_highway: {
    label: 'Highways',
    icon: Map,
    color: 'text-black',
    description: 'Major roads and highways',
  },
  roads_street: {
    label: 'Streets',
    icon: Map,
    color: 'text-gray-600',
    description: 'Local streets and roads',
  },
  power: {
    label: 'Power Plants',
    icon: Zap,
    color: 'text-yellow-500',
    description: 'Energy generation facilities',
  },
  industry_zones: {
    label: 'Industrial Zones',
    icon: Factory,
    color: 'text-red-900',
    description: 'Industrial areas',
  },
  industry_buildings: {
    label: 'Factories',
    icon: Factory,
    color: 'text-red-500',
    description: 'Factory buildings',
  },
  residential: {
    label: 'Housing',
    icon: Home,
    color: 'text-blue-500',
    description: 'Residential buildings',
  },
  forest_zones: {
    label: 'Forest Floor',
    icon: Trees,
    color: 'text-green-700',
    description: 'Forest ground cover',
  },
  forest_trees: {
    label: 'Trees (3D)',
    icon: Trees,
    color: 'text-green-500',
    description: 'Individual trees',
  },
  agriculture: {
    label: 'Agriculture',
    icon: Sprout,
    color: 'text-orange-600',
    description: 'Agricultural land',
  },
  water_infra: {
    label: 'Water Infrastructure',
    icon: Droplets,
    color: 'text-cyan-600',
    description: 'Water bodies and infrastructure',
  },
};

export function LayerTogglePanel({
  activeLayers,
  layerOpacity,
  showHeatmap,
  showSO2Heatmap,
  onToggleLayer,
  onUpdateOpacity,
  onToggleHeatmap,
  onToggleSO2Heatmap,
}: LayerTogglePanelProps) {
  const allLayers = Object.keys(layerConfig);
  const transportLayers = ['roads_highway', 'roads_street'];
  const industryLayers = ['power', 'industry_zones', 'industry_buildings'];
  const natureLayers = ['residential', 'forest_zones', 'forest_trees', 'agriculture'];
  const waterLayers = ['water_infra'];

  const toggleAllLayers = () => {
    const allSelected = allLayers.every(layer => activeLayers.has(layer));
    if (allSelected) {
      // Deselect all - pass all active layers
      const layersToDeselect = allLayers.filter(layer => activeLayers.has(layer));
      if (layersToDeselect.length > 0) {
        onToggleLayer(layersToDeselect as any);
      }
    } else {
      // Select all - pass all inactive layers
      const layersToSelect = allLayers.filter(layer => !activeLayers.has(layer));
      if (layersToSelect.length > 0) {
        onToggleLayer(layersToSelect as any);
      }
    }
  };

  const toggleCategoryLayers = (layers: string[]) => {
    const allSelected = layers.every(layer => activeLayers.has(layer));
    if (allSelected) {
      // Deselect all in category
      const layersToDeselect = layers.filter(layer => activeLayers.has(layer));
      if (layersToDeselect.length > 0) {
        onToggleLayer(layersToDeselect as any);
      }
    } else {
      // Select all in category
      const layersToSelect = layers.filter(layer => !activeLayers.has(layer));
      if (layersToSelect.length > 0) {
        onToggleLayer(layersToSelect as any);
      }
    }
  };

  const allSelected = allLayers.every(layer => activeLayers.has(layer));
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-3xl font-black text-foreground mb-1">Layer Controls</h2>
        <p className="text-sm font-medium text-muted-foreground">Toggle and adjust city data layers</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Heatmap Toggle */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Visualization</h3>
            <p className="text-xs font-medium text-muted-foreground">CO₂ concentration overlay</p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="heatmap-toggle" className="text-sm font-medium cursor-pointer">
                  CO₂ Heatmap
                </Label>
                <p className="text-xs text-muted-foreground">Real-time simulation</p>
              </div>
            </div>
            <Switch
              id="heatmap-toggle"
              checked={showHeatmap}
              onCheckedChange={onToggleHeatmap}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-red-500" />
              <div>
                <Label htmlFor="so2-heatmap-toggle" className="text-sm font-medium cursor-pointer">
                  Total SO₂
                </Label>
                <p className="text-xs text-muted-foreground">Urban source-weighted layer</p>
              </div>
            </div>
            <Switch
              id="so2-heatmap-toggle"
              checked={showSO2Heatmap}
              onCheckedChange={onToggleSO2Heatmap}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllLayers}
            className="w-full h-10 text-sm font-medium"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {allSelected ? 'Deselect All Layers' : 'Select All Layers'}
          </Button>
        </div>
        
        <Separator />
        
        {/* Transport */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Transport</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCategoryLayers(transportLayers)}
              className="h-7 text-xs"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All
            </Button>
          </div>
          
          <div className="space-y-3">
            {(['roads_highway', 'roads_street'] as const).map((layerType) => {
              const config = layerConfig[layerType];
              const Icon = config.icon;
              const isActive = activeLayers.has(layerType);
              
              return (
                <div
                  key={layerType}
                  className={`p-3 border rounded-lg transition-all ${
                    isActive ? 'border-primary/50 bg-accent/30' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`layer-${layerType}`}
                      checked={isActive}
                      onCheckedChange={() => onToggleLayer(layerType)}
                    />
                    <Label
                      htmlFor={`layer-${layerType}`}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Industry & Power */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Industry & Power</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCategoryLayers(industryLayers)}
              className="h-7 text-xs"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All
            </Button>
          </div>
          
          <div className="space-y-3">
            {(['power', 'industry_zones', 'industry_buildings'] as const).map((layerType) => {
              const config = layerConfig[layerType];
              const Icon = config.icon;
              const isActive = activeLayers.has(layerType);
              
              return (
                <div
                  key={layerType}
                  className={`p-3 border rounded-lg transition-all ${
                    isActive ? 'border-primary/50 bg-accent/30' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`layer-${layerType}`}
                      checked={isActive}
                      onCheckedChange={() => onToggleLayer(layerType)}
                    />
                    <Label
                      htmlFor={`layer-${layerType}`}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Living & Nature */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Living & Nature</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCategoryLayers(natureLayers)}
              className="h-7 text-xs"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All
            </Button>
          </div>
          
          <div className="space-y-3">
            {(['residential', 'forest_zones', 'forest_trees', 'agriculture'] as const).map((layerType) => {
              const config = layerConfig[layerType];
              const Icon = config.icon;
              const isActive = activeLayers.has(layerType);
              
              return (
                <div
                  key={layerType}
                  className={`p-3 border rounded-lg transition-all ${
                    isActive ? 'border-primary/50 bg-accent/30' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`layer-${layerType}`}
                      checked={isActive}
                      onCheckedChange={() => onToggleLayer(layerType)}
                    />
                    <Label
                      htmlFor={`layer-${layerType}`}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Water */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Water Tamnsimission Souces</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCategoryLayers(waterLayers)}
              className="h-7 text-xs"
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All
            </Button>
          </div>

          <div className="space-y-3">
            {(['water_infra'] as const).map((layerType) => {
              const config = layerConfig[layerType];
              const Icon = config.icon;
              const isActive = activeLayers.has(layerType);

              return (
                <div
                  key={layerType}
                  className={`p-3 border rounded-lg transition-all ${
                    isActive ? 'border-primary/50 bg-accent/30' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`layer-${layerType}`}
                      checked={isActive}
                      onCheckedChange={() => onToggleLayer(layerType)}
                    />
                    <Label
                      htmlFor={`layer-${layerType}`}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
