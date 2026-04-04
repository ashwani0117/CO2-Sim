import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { interventionConfigs, Simulation, InterventionType } from "@shared/schema";
import { Leaf, Trees, GitBranch, Wind, Gauge, Factory, Play, BarChart3, TrendingDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, any> = {
  Leaf,
  Trees,
  GitBranch,
  Wind,
  Gauge,
  Factory,
};

export function SimulationPanel() {
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [simulationName, setSimulationName] = useState('');
  const { toast } = useToast();

  const { data: simulations, isLoading: loadingSimulations } = useQuery<Simulation[]>({
    queryKey: ['/api/simulations'],
  });

  const runSimulationMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      interventionType: string;
      parameters: Record<string, number>;
    }) => {
      return await apiRequest('POST', '/api/simulations/run', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'Simulation Complete',
        description: 'The intervention simulation has been successfully completed.',
      });
      setSelectedIntervention(null);
      setParameters({});
      setSimulationName('');
    },
    onError: () => {
      toast({
        title: 'Simulation Failed',
        description: 'There was an error running the simulation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const selectedConfig = selectedIntervention
    ? interventionConfigs.find(c => c.type === selectedIntervention)
    : null;

  const handleRunSimulation = () => {
    if (!selectedIntervention) return;
    
    const name = simulationName || `${selectedConfig?.name} - ${new Date().toLocaleDateString()}`;
    
    runSimulationMutation.mutate({
      name,
      interventionType: selectedIntervention,
      parameters,
    });
  };

  const handleSelectIntervention = (type: InterventionType) => {
    setSelectedIntervention(type);
    const config = interventionConfigs.find(c => c.type === type);
    if (config) {
      const defaultParams: Record<string, number> = {};
      config.parameters.forEach(param => {
        defaultParams[param.key] = param.default;
      });
      setParameters(defaultParams);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intervention Selection */}
      <div className="space-y-4" data-testid="intervention-selection-section">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1" data-testid="heading-run-simulation">Run Simulation</h2>
          <p className="text-sm text-muted-foreground" data-testid="text-run-simulation-desc">Test interventions and view impact</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {interventionConfigs.map((config) => {
            const Icon = iconMap[config.icon];
            const isSelected = selectedIntervention === config.type;
            
            return (
              <Card
                key={config.type}
                className={`cursor-pointer transition-all hover-elevate ${
                  isSelected ? 'border-primary bg-accent/30' : ''
                }`}
                onClick={() => handleSelectIntervention(config.type)}
                data-testid={`intervention-${config.type}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {config.category}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{config.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {config.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingDown className="h-3 w-3" />
                      <span className="font-mono">-{(config.reductionFactor * 100).toFixed(0)}% CO₂</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Parameters Configuration */}
      {selectedConfig && (
        <Card data-testid="card-configure-parameters">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Configure Parameters</CardTitle>
            <CardDescription>Adjust intervention settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" data-testid="parameters-content">
            <div className="space-y-2">
              <Label htmlFor="simulation-name">Simulation Name (Optional)</Label>
              <Input
                id="simulation-name"
                placeholder={`${selectedConfig.name} - ${new Date().toLocaleDateString()}`}
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                data-testid="input-simulation-name"
              />
            </div>

            <Separator />

            {selectedConfig.parameters.map((param) => (
              <div key={param.key} className="space-y-3" data-testid={`parameter-group-${param.key}`}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium" data-testid={`label-${param.key}`}>{param.name}</Label>
                  <span className="text-sm font-mono font-bold text-foreground" data-testid={`value-${param.key}`}>
                    {parameters[param.key] || param.default} {param.unit}
                  </span>
                </div>
                
                {param.type === 'slider' && (
                  <Slider
                    value={[parameters[param.key] || param.default]}
                    onValueChange={(values) => setParameters({ ...parameters, [param.key]: values[0] })}
                    min={param.min}
                    max={param.max}
                    step={1}
                    data-testid={`slider-${param.key}`}
                  />
                )}
                
                {param.type === 'number' && (
                  <Input
                    type="number"
                    value={parameters[param.key] || param.default}
                    onChange={(e) => setParameters({ ...parameters, [param.key]: Number(e.target.value) })}
                    min={param.min}
                    max={param.max}
                    data-testid={`input-${param.key}`}
                  />
                )}
              </div>
            ))}

            <Separator />

            <Button
              onClick={handleRunSimulation}
              disabled={runSimulationMutation.isPending}
              className="w-full"
              data-testid="button-run-simulation"
            >
              <Play className="h-4 w-4 mr-2" />
              {runSimulationMutation.isPending ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulation History */}
      <div className="space-y-4" data-testid="simulation-history-section">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground" data-testid="heading-simulation-history">Simulation History</h3>
        </div>

        <ScrollArea className="h-[300px]" data-testid="scroll-simulation-history">
          {loadingSimulations ? (
            <div className="space-y-3" data-testid="simulations-loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-sim-${i}`} />
              ))}
            </div>
          ) : !simulations || simulations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center" data-testid="simulations-empty-state">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="text-sm font-semibold text-foreground" data-testid="text-no-simulations">No Simulations Yet</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Run your first intervention simulation to see results
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="list-simulations">
              {simulations.map((sim) => (
                <Card key={sim.id} className="hover-elevate" data-testid={`simulation-${sim.id}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground" data-testid={`sim-name-${sim.id}`}>{sim.name}</h4>
                          <Badge variant="secondary" className="text-xs mt-1" data-testid={`sim-type-${sim.id}`}>
                            {sim.interventionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className={`text-right ${
                          sim.reductionPercent >= 20 ? 'text-green-500' :
                          sim.reductionPercent >= 10 ? 'text-blue-500' :
                          'text-yellow-500'
                        }`} data-testid={`sim-reduction-${sim.id}`}>
                          <div className="font-mono font-bold text-sm">
                            -{sim.reductionPercent.toFixed(1)}%
                          </div>
                          <div className="text-xs">reduction</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs" data-testid={`sim-metrics-${sim.id}`}>
                        <div>
                          <span className="text-muted-foreground">Baseline:</span>
                          <div className="font-mono font-medium text-foreground" data-testid={`sim-baseline-${sim.id}`}>{sim.baselineCO2.toFixed(0)} ppm</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Simulated:</span>
                          <div className="font-mono font-medium text-foreground" data-testid={`sim-simulated-${sim.id}`}>{sim.simulatedCO2.toFixed(0)} ppm</div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground" data-testid={`sim-timestamp-${sim.id}`}>
                        {sim.createdAt ? new Date(sim.createdAt).toLocaleString() : 'Recently'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
