import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// City Layer Types
export type LayerType = 'transport' | 'industry' | 'residential' | 'forest' | 'power';
export type InterventionType = 'green_roof' | 'vertical_garden' | 'traffic_diversion' | 'capture_device' | 'speed_limit' | 'industry_shutdown';

// GeoJSON Feature for city layers
export interface GeoFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    id: string;
    layerType: LayerType;
    name?: string;
    area?: number;
    length?: number;
    emissionFactor?: number;
    [key: string]: any;
  };
}

export interface GeoJSONLayer {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

// Heatmap Grid Cell
export interface HeatmapCell {
  id: string;
  gridX: number;
  gridY: number;
  lat: number;
  lng: number;
  emission: number;
  absorption: number;
  netCO2: number;
  diffusedCO2: number;
  color: string;
}

// IoT Sensor
export const sensors = pgTable("sensors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  status: text("status").notNull().default('active'),
  lastReading: timestamp("last_reading").defaultNow(),
  co2: real("co2"),
  pm25: real("pm25"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  windDirection: real("wind_direction"),
});

export const insertSensorSchema = createInsertSchema(sensors).omit({
  id: true,
  lastReading: true,
});

export type InsertSensor = z.infer<typeof insertSensorSchema>;
export type Sensor = typeof sensors.$inferSelect;

// Emission Factors Configuration
export interface EmissionFactor {
  layerType: LayerType;
  factor: number;
  unit: string;
  description: string;
}

export const emissionFactors: EmissionFactor[] = [
  { layerType: 'transport', factor: 120, unit: 'g CO₂/m/day', description: 'Road transport emissions per meter' },
  { layerType: 'industry', factor: 850, unit: 'g CO₂/m²/day', description: 'Industrial area emissions per square meter' },
  { layerType: 'residential', factor: 180, unit: 'g CO₂/m²/day', description: 'Residential area emissions per square meter' },
  { layerType: 'power', factor: 2500, unit: 'g CO₂/m²/day', description: 'Power plant emissions per square meter' },
  { layerType: 'forest', factor: -45, unit: 'g CO₂/m²/day', description: 'Forest CO₂ absorption per square meter (negative = absorption)' },
];

// Simulation
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  interventionType: text("intervention_type").notNull(),
  parameters: jsonb("parameters").notNull(),
  zoneId: text("zone_id"),
  baselineCO2: real("baseline_co2").notNull(),
  simulatedCO2: real("simulated_co2").notNull(),
  reductionPercent: real("reduction_percent").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
});

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;

// Intervention Configuration
export interface InterventionConfig {
  type: InterventionType;
  name: string;
  description: string;
  icon: string;
  category: 'vegetation' | 'traffic' | 'industry' | 'infrastructure';
  reductionFactor: number;
  parameters: {
    name: string;
    key: string;
    type: 'slider' | 'select' | 'number';
    min?: number;
    max?: number;
    default: number;
    unit: string;
    options?: { value: number; label: string }[];
  }[];
}

export const interventionConfigs: InterventionConfig[] = [
  {
    type: 'green_roof',
    name: 'Green Roofs',
    description: 'Install vegetation on building rooftops to absorb CO₂',
    icon: 'Leaf',
    category: 'vegetation',
    reductionFactor: 0.15,
    parameters: [
      { name: 'Coverage', key: 'coverage', type: 'slider', min: 0, max: 100, default: 50, unit: '%' },
    ],
  },
  {
    type: 'vertical_garden',
    name: 'Vertical Gardens',
    description: 'Install vertical greenery systems on building facades',
    icon: 'Trees',
    category: 'vegetation',
    reductionFactor: 0.12,
    parameters: [
      { name: 'Coverage', key: 'coverage', type: 'slider', min: 0, max: 100, default: 40, unit: '%' },
    ],
  },
  {
    type: 'traffic_diversion',
    name: 'Traffic Diversion',
    description: 'Redirect traffic away from high-emission zones',
    icon: 'GitBranch',
    category: 'traffic',
    reductionFactor: 0.25,
    parameters: [
      { name: 'Diversion %', key: 'diversion', type: 'slider', min: 0, max: 100, default: 60, unit: '%' },
    ],
  },
  {
    type: 'capture_device',
    name: 'CO₂ Capture Devices',
    description: 'Install carbon capture technology in high-emission areas',
    icon: 'Wind',
    category: 'infrastructure',
    reductionFactor: 0.30,
    parameters: [
      { name: 'Device Count', key: 'count', type: 'number', min: 1, max: 50, default: 10, unit: 'units' },
    ],
  },
  {
    type: 'speed_limit',
    name: 'Reduced Speed Limits',
    description: 'Lower speed limits to reduce vehicle emissions',
    icon: 'Gauge',
    category: 'traffic',
    reductionFactor: 0.08,
    parameters: [
      { name: 'Speed Limit', key: 'speed', type: 'slider', min: 20, max: 60, default: 40, unit: 'km/h' },
    ],
  },
  {
    type: 'industry_shutdown',
    name: 'Industrial Regulation',
    description: 'Temporary shutdown or regulation of industrial activities',
    icon: 'Factory',
    category: 'industry',
    reductionFactor: 0.40,
    parameters: [
      { name: 'Shutdown %', key: 'shutdown', type: 'slider', min: 0, max: 100, default: 30, unit: '%' },
    ],
  },
];

// Zone
export interface Zone {
  id: string;
  name: string;
  type: 'polygon' | 'rectangle' | 'circle';
  coordinates: number[][];
  area: number;
  totalEmission: number;
  avgCO2: number;
  sensorCount: number;
}

// Statistics
export interface EmissionStats {
  totalEmission: number;
  hotspotCount: number;
  avgCO2: number;
  absorptionRate: number;
  topHotspots: {
    id: string;
    name: string;
    co2: number;
    lat: number;
    lng: number;
  }[];
  zoneBreakdown: {
    layerType: LayerType;
    emission: number;
    percentage: number;
  }[];
}

// Prediction Request/Response
export interface PredictionRequest {
  features: {
    roadLength: number;
    industryArea: number;
    residentialDensity: number;
    forestArea: number;
    windSpeed: number;
    population?: number;
  };
}

export interface PredictionResponse {
  predictedCO2: number;
  confidence: number;
  features: {
    name: string;
    value: number;
    importance: number;
  }[];
}

// Diffusion Parameters
export interface DiffusionParams {
  windSpeed: number;
  windDirection: number;
  atmosphericStability: 'stable' | 'neutral' | 'unstable';
  emissionRate: number;
}

// User schema (from template)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
