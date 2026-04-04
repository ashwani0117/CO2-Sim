import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ChartsPanelProps {
  activeScenario: string;
}

export function ChartsPanel({ activeScenario }: ChartsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  
  const scenarios = [
    { id: 'baseline', name: 'Baseline', color: '#555555' },
    { id: 'rooftop_garden', name: 'Rooftop Gardens', color: '#10b981' },
    { id: 'vertical_garden', name: 'Vertical Gardens', color: '#059669' },
    { id: 'biofilters', name: 'Biofilters', color: '#3b82f6' },
    { id: 'roadside_capture', name: 'Roadside Capture', color: '#8b5cf6' },
    { id: 'policy_ev_50pct', name: '50% EV Policy', color: '#f59e0b' },
  ];

  const activeScenarioData = scenarios.find(s => s.id === activeScenario);

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            24h Emission Impact
          </CardTitle>
          <ChevronDown 
            className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {/* Active Scenario - Large */}
          {activeScenarioData && (
            <div className="rounded-lg border-2 bg-blue-50 border-primary p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold" style={{ color: activeScenarioData.color }}>
                  {activeScenarioData.name}
                </h3>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-semibold">
                  Active
                </span>
              </div>
              <img 
                src={`/charts/${activeScenarioData.id}.png`} 
                alt={`${activeScenarioData.name} emissions`}
                className="w-full rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/charts/baseline.png';
                }}
              />
            </div>
          )}
          
          {/* Other Scenarios - Compact */}
          <div className="border-t pt-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">Other Scenarios</p>
            {scenarios
              .filter(s => s.id !== activeScenario)
              .map(scenario => (
                <div 
                  key={scenario.id} 
                  className="rounded border bg-gray-50 p-1.5 mb-1"
                >
                  <h4 className="text-xs font-semibold" style={{ color: scenario.color }}>
                    {scenario.name}
                  </h4>
                  <img 
                    src={`/charts/${scenario.id}.png`} 
                    alt={`${scenario.name} emissions`}
                    className="w-full rounded text-xs mt-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/charts/baseline.png';
                    }}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      )}
      
      {!expanded && activeScenarioData && (
        <CardContent className="pb-3">
          <div className="rounded-lg border bg-blue-50 p-2">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: activeScenarioData.color }}
              ></div>
              <h3 className="text-xs font-bold">{activeScenarioData.name}</h3>
            </div>
            <img 
              src={`/charts/${activeScenarioData.id}.png`} 
              alt={`${activeScenarioData.name} emissions`}
              className="w-full rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/charts/baseline.png';
              }}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
