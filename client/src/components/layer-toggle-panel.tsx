import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LayerType } from "@shared/schema";
import { Map, Factory, Home, Trees, Zap, Activity } from "lucide-react";

interface LayerTogglePanelProps {
  activeLayers: Set<LayerType>;
  layerOpacity: Record<LayerType, number>;
  showHeatmap: boolean;
  onToggleLayer: (layer: LayerType) => void;
  onUpdateOpacity: (layer: LayerType, opacity: number) => void;
  onToggleHeatmap: () => void;
}

const layerConfig: Record<LayerType, { label: string; icon: any; color: string; description: string }> = {
  transport: {
    label: 'Transport Network',
    icon: Map,
    color: 'text-blue-500',
    description: 'Roads and transportation infrastructure',
  },
  industry: {
    label: 'Industrial Zones',
    icon: Factory,
    color: 'text-purple-500',
    description: 'Manufacturing and industrial facilities',
  },
  residential: {
    label: 'Residential Areas',
    icon: Home,
    color: 'text-amber-500',
    description: 'Housing and residential buildings',
  },
  forest: {
    label: 'Green Cover',
    icon: Trees,
    color: 'text-green-500',
    description: 'Forests, parks, and vegetation',
  },
  power: {
    label: 'Power Plants',
    icon: Zap,
    color: 'text-red-500',
    description: 'Energy generation facilities',
  },
};

export function LayerTogglePanel({
  activeLayers,
  layerOpacity,
  showHeatmap,
  onToggleLayer,
  onUpdateOpacity,
  onToggleHeatmap,
}: LayerTogglePanelProps) {
  return (
    <div className="h-full flex flex-col" data-testid="layer-toggle-panel">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-semibold text-foreground mb-1" data-testid="heading-layer-controls">Layer Controls</h2>
        <p className="text-sm text-muted-foreground">Toggle and adjust city data layers</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="layer-controls-content">
        {/* Heatmap Toggle */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Visualization</h3>
            <p className="text-xs text-muted-foreground">CO₂ concentration overlay</p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor="heatmap-toggle" className="text-sm font-medium cursor-pointer">
                  CO₂ Heatmap
                </Label>
                <p className="text-xs text-muted-foreground">50m × 50m grid overlay</p>
              </div>
            </div>
            <Switch
              id="heatmap-toggle"
              checked={showHeatmap}
              onCheckedChange={onToggleHeatmap}
              data-testid="switch-heatmap"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* City Layers */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">City Layers</h3>
            <p className="text-xs text-muted-foreground">OpenStreetMap extracted data</p>
          </div>
          
          <div className="space-y-4">
            {(Object.entries(layerConfig) as [LayerType, typeof layerConfig[LayerType]][]).map(([layerType, config]) => {
              const Icon = config.icon;
              const isActive = activeLayers.has(layerType);
              
              return (
                <div
                  key={layerType}
                  className={`p-4 border rounded-lg transition-all ${
                    isActive ? 'border-primary/50 bg-accent/30' : 'border-border bg-card'
                  }`}
                  data-testid={`layer-card-${layerType}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`layer-${layerType}`}
                        checked={isActive}
                        onCheckedChange={() => onToggleLayer(layerType)}
                        data-testid={`checkbox-layer-${layerType}`}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`layer-${layerType}`}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          {config.label}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="ml-9 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Opacity</span>
                        <span className="text-xs font-mono text-foreground">{layerOpacity[layerType]}%</span>
                      </div>
                      <Slider
                        value={[layerOpacity[layerType]]}
                        onValueChange={(values) => onUpdateOpacity(layerType, values[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                        data-testid={`slider-opacity-${layerType}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
