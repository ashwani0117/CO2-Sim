import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sensor, InsertSensor } from "@shared/schema";
import { Plus, Radio, MapPin, Activity, Thermometer, Wind, Droplets } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSensorSchema } from "@shared/schema";

export function SensorPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: sensors, isLoading } = useQuery<Sensor[]>({
    queryKey: ['/api/sensors'],
  });

  const form = useForm<InsertSensor>({
    resolver: zodResolver(insertSensorSchema),
    defaultValues: {
      name: '',
      lat: 28.6139,
      lng: 77.2090,
      status: 'active',
      co2: 400,
      pm25: 35,
      temperature: 25,
      humidity: 60,
      windSpeed: 3.5,
      windDirection: 180,
    },
  });

  const addSensorMutation = useMutation({
    mutationFn: async (data: InsertSensor) => {
      return await apiRequest('POST', '/api/sensors', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
      toast({
        title: 'Sensor Added',
        description: 'The new IoT sensor has been successfully added.',
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Failed to Add Sensor',
        description: 'There was an error adding the sensor. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertSensor) => {
    addSensorMutation.mutate(data);
  };

  const activeSensors = sensors?.filter(s => s.status === 'active').length || 0;
  const avgCO2 = sensors?.length
    ? sensors.reduce((sum, s) => sum + (s.co2 || 0), 0) / sensors.length
    : 0;

  return (
    <div className="space-y-6" data-testid="sensor-panel">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1" data-testid="heading-sensors">IoT Sensors</h2>
          <p className="text-sm text-muted-foreground" data-testid="text-sensors-desc">Real-time environmental monitoring</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-sensor">
              <Plus className="h-4 w-4 mr-2" />
              Add Sensor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New IoT Sensor</DialogTitle>
              <DialogDescription>
                Configure a new sensor for environmental monitoring
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sensor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Connaught Place Sensor" {...field} data-testid="input-sensor-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-lat"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lng"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-lng"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="co2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CO₂ (ppm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-co2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pm25"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PM2.5 (µg/m³)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-pm25"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-temp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humidity (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-humidity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="windSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wind Speed (m/s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-wind"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="windDirection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wind Dir (°)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            max="360"
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-sensor-wind-dir"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={addSensorMutation.isPending} data-testid="button-save-sensor">
                    {addSensorMutation.isPending ? 'Adding...' : 'Add Sensor'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sensors</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{activeSensors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {sensors?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg CO₂</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {avgCO2.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ppm</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sensor Network</CardTitle>
          <CardDescription>Real-time readings from deployed sensors</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !sensors || sensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Radio className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="text-sm font-semibold text-foreground">No Sensors Deployed</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first IoT sensor to start monitoring
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Sensor</TableHead>
                    <TableHead>CO₂</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensors.map((sensor) => (
                    <TableRow key={sensor.id} data-testid={`sensor-row-${sensor.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm text-foreground">{sensor.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono">{sensor.lat.toFixed(4)}, {sensor.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium text-sm">{sensor.co2?.toFixed(0) || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground ml-1">ppm</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {sensor.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
