import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Navigation } from "lucide-react";

interface SimulationControlPanelProps {
  activeScenario: string;
  currentHour: number;
  heatmapIntensity: number;
  onScenarioChange: (scenario: string) => void;
  onHourChange: (hour: number) => void;
  onIntensityChange: (intensity: number) => void;
  onFlyToCity: () => void;
  onResetBearing: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const scenarios = [
  { value: 'baseline', label: '📉 Baseline (No Action)', description: 'Current state without interventions' },
  { value: 'rooftop_garden', label: '🏡 Rooftop Gardens', description: 'Green roofs absorb CO₂' },
  { value: 'vertical_garden', label: '🌿 Vertical Gardens', description: 'Building-side vegetation' },
  { value: 'biofilters', label: '🏭 Biofilters (-70%)', description: 'Industrial emission filters' },
  { value: 'roadside_capture', label: '🛣️ Roadside Capture', description: 'CO₂ capture along roads' },
  { value: 'policy_ev_50pct', label: '⚡ Policy: 50% EV', description: 'Electric vehicle adoption' },
];

export function SimulationControlPanel({
  activeScenario,
  currentHour,
  heatmapIntensity,
  onScenarioChange,
  onHourChange,
  onIntensityChange,
  onFlyToCity,
  onResetBearing,
  onPlayStateChange,
}: SimulationControlPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onHourChange((currentHour + 1) % 24);
      }, 5000); // 5 seconds interval
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentHour, onHourChange]);

  const handlePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    onPlayStateChange?.(nextState);
  };

  const currentScenario = scenarios.find(s => s.value === activeScenario);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-3xl font-black text-foreground mb-1">Simulation Control</h2>
        <p className="text-sm font-medium text-muted-foreground">Scenarios and temporal simulation</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Scenarios */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Scenarios</h3>
            <p className="text-xs font-medium text-muted-foreground">Select intervention strategy</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario-select">Active Scenario</Label>
            <Select value={activeScenario} onValueChange={onScenarioChange}>
              <SelectTrigger id="scenario-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.value} value={scenario.value}>
                    {scenario.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentScenario && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentScenario.description}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Simulation Time */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Simulation</h3>
            <p className="text-xs text-muted-foreground">Time-based CO₂ evolution</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="time-slider">Time (Hour)</Label>
                <span className="text-sm font-mono font-bold text-foreground">
                  {String(currentHour).padStart(2, '0')}:00
                </span>
              </div>
              <Slider
                id="time-slider"
                value={[currentHour]}
                onValueChange={(values) => onHourChange(values[0])}
                min={0}
                max={23}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={isPlaying ? "default" : "outline"}
                onClick={handlePlayPause}
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onHourChange(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Heatmap Intensity */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Heatmap Settings</h3>
            <p className="text-xs text-muted-foreground">Adjust visualization intensity</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="intensity-slider">Intensity</Label>
              <span className="text-sm font-mono font-bold text-foreground">
                {heatmapIntensity.toFixed(1)}
              </span>
            </div>
            <Slider
              id="intensity-slider"
              value={[heatmapIntensity]}
              onValueChange={(values) => onIntensityChange(values[0])}
              min={0.1}
              max={5.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* View Controls */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">View Controls</h3>
            <p className="text-xs text-muted-foreground">Navigate the map</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onFlyToCity} className="w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Fly to City
            </Button>
            <Button variant="outline" onClick={onResetBearing} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset North
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
