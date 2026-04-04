import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EmissionStats as EmissionStatsType } from "@shared/schema";
import { TrendingUp, TrendingDown, AlertTriangle, Leaf, Activity, MapPin } from "lucide-react";

export function EmissionStats() {
  const { data: stats, isLoading } = useQuery<EmissionStatsType>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="stats-loading">
        <Skeleton className="h-32 w-full" data-testid="skeleton-stats-1" />
        <Skeleton className="h-32 w-full" data-testid="skeleton-stats-2" />
        <Skeleton className="h-64 w-full" data-testid="skeleton-stats-3" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center" data-testid="stats-empty-state">
        <Activity className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground" data-testid="text-no-data">No Data Available</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Emission statistics will appear here once data is loaded
        </p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  // Mock trend data for area chart
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    co2: stats.avgCO2 * (0.9 + Math.random() * 0.2),
  }));

  return (
    <div className="space-y-6" data-testid="emission-stats-container">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4" data-testid="stats-metrics-grid">
        <Card data-testid="card-total-emission">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emission</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="value-total-emission">
              {(stats.totalEmission / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">kg CO₂/day</p>
          </CardContent>
        </Card>

        <Card data-testid="card-hotspots">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hotspots</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="value-hotspot-count">
              {stats.hotspotCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">critical zones</p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-co2">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg CO₂</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="value-avg-co2">
              {stats.avgCO2.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ppm</p>
          </CardContent>
        </Card>

        <Card data-testid="card-absorption">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absorption</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground" data-testid="value-absorption">
              {(stats.absorptionRate / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">kg CO₂/day</p>
          </CardContent>
        </Card>
      </div>

      {/* CO₂ Trend Chart */}
      <Card data-testid="card-co2-trend">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">CO₂ Trend</CardTitle>
          <p className="text-xs text-muted-foreground">Average concentration over 12 weeks</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180} data-testid="chart-co2-trend">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="week"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCo2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Hotspots */}
      <Card data-testid="card-top-hotspots">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Hotspots</CardTitle>
          <p className="text-xs text-muted-foreground">Areas with highest CO₂ concentration</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-testid="list-hotspots">
            {stats.topHotspots.slice(0, 5).map((hotspot, index) => (
              <div
                key={hotspot.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-elevate"
                data-testid={`hotspot-${index}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    index === 0 ? 'bg-red-500/10 text-red-500' :
                    index === 1 ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{hotspot.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono">{hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-foreground">{hotspot.co2.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">ppm</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone Breakdown */}
      <Card data-testid="card-zone-breakdown">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Emission Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">By layer type</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200} data-testid="chart-zone-breakdown">
              <PieChart>
                <Pie
                  data={stats.zoneBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="emission"
                  label={(entry) => `${entry.percentage.toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.zoneBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2" data-testid="list-zone-breakdown">
              {stats.zoneBreakdown.map((zone, index) => (
                <div key={zone.layerType} className="flex items-center justify-between text-sm" data-testid={`zone-breakdown-${zone.layerType}`}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground capitalize">{zone.layerType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground" data-testid={`value-emission-${zone.layerType}`}>{(zone.emission / 1000).toFixed(1)}k</span>
                    <Badge variant="secondary" className="font-mono text-xs" data-testid={`badge-percentage-${zone.layerType}`}>
                      {zone.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
