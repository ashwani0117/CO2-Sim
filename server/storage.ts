import {
  type User,
  type InsertUser,
  type Sensor,
  type InsertSensor,
  type Simulation,
  type InsertSimulation,
  type HeatmapCell,
  type EmissionStats,
  type GeoJSONLayer,
  type LayerType,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sensors
  getSensors(): Promise<Sensor[]>;
  getSensor(id: string): Promise<Sensor | undefined>;
  createSensor(sensor: InsertSensor): Promise<Sensor>;
  updateSensor(id: string, sensor: Partial<Sensor>): Promise<Sensor | undefined>;
  deleteSensor(id: string): Promise<boolean>;
  
  // Simulations
  getSimulations(): Promise<Simulation[]>;
  getSimulation(id: string): Promise<Simulation | undefined>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  
  // Heatmap
  getHeatmapCells(): Promise<HeatmapCell[]>;
  
  // Stats
  getEmissionStats(): Promise<EmissionStats>;
  
  // City Layers
  getCityLayer(layerType: LayerType): Promise<GeoJSONLayer | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sensors: Map<string, Sensor>;
  private simulations: Map<string, Simulation>;
  private heatmapCells: HeatmapCell[];
  private cityLayers: Map<LayerType, GeoJSONLayer>;

  constructor() {
    this.users = new Map();
    this.sensors = new Map();
    this.simulations = new Map();
    this.heatmapCells = [];
    this.cityLayers = new Map();
    this.initializeMockData();
  }

  // Initialize with mock data
  private initializeMockData() {
    // Mock city layers (simplified GeoJSON)
    const delhiCenter = { lat: 28.6139, lng: 77.2090 };
    
    // Transport layer - roads
    this.cityLayers.set('transport', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [77.2090, 28.6139],
              [77.2190, 28.6239],
            ],
          },
          properties: {
            id: 'road-1',
            layerType: 'transport',
            name: 'Main Road',
            length: 1500,
            emissionFactor: 120,
          },
        },
      ],
    });

    // Industry layer
    this.cityLayers.set('industry', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [77.200, 28.610],
              [77.205, 28.610],
              [77.205, 28.615],
              [77.200, 28.615],
              [77.200, 28.610],
            ]],
          },
          properties: {
            id: 'industry-1',
            layerType: 'industry',
            name: 'Industrial Zone A',
            area: 50000,
            emissionFactor: 850,
          },
        },
      ],
    });

    // Residential layer
    this.cityLayers.set('residential', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [77.210, 28.615],
              [77.220, 28.615],
              [77.220, 28.625],
              [77.210, 28.625],
              [77.210, 28.615],
            ]],
          },
          properties: {
            id: 'residential-1',
            layerType: 'residential',
            name: 'Residential Area',
            area: 100000,
            emissionFactor: 180,
          },
        },
      ],
    });

    // Forest layer
    this.cityLayers.set('forest', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [77.195, 28.620],
              [77.200, 28.620],
              [77.200, 28.625],
              [77.195, 28.625],
              [77.195, 28.620],
            ]],
          },
          properties: {
            id: 'forest-1',
            layerType: 'forest',
            name: 'City Park',
            area: 30000,
            emissionFactor: -45,
          },
        },
      ],
    });

    // Power plants layer
    this.cityLayers.set('power', {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [77.215, 28.605],
              [77.218, 28.605],
              [77.218, 28.608],
              [77.215, 28.608],
              [77.215, 28.605],
            ]],
          },
          properties: {
            id: 'power-1',
            layerType: 'power',
            name: 'Power Plant A',
            area: 10000,
            emissionFactor: 2500,
          },
        },
      ],
    });

    // Mock sensors
    const mockSensors: InsertSensor[] = [
      {
        name: 'Connaught Place Sensor',
        lat: 28.6304,
        lng: 77.2177,
        status: 'active',
        co2: 450.5,
        pm25: 45.2,
        temperature: 28.5,
        humidity: 65,
        windSpeed: 3.2,
        windDirection: 180,
      },
      {
        name: 'India Gate Monitor',
        lat: 28.6129,
        lng: 77.2295,
        status: 'active',
        co2: 380.2,
        pm25: 38.5,
        temperature: 27.8,
        humidity: 68,
        windSpeed: 2.8,
        windDirection: 165,
      },
      {
        name: 'Nehru Place Station',
        lat: 28.5494,
        lng: 77.2501,
        status: 'active',
        co2: 520.8,
        pm25: 52.3,
        temperature: 29.2,
        humidity: 62,
        windSpeed: 4.1,
        windDirection: 195,
      },
    ];

    mockSensors.forEach(sensor => {
      const id = randomUUID();
      this.sensors.set(id, {
        id,
        name: sensor.name,
        lat: sensor.lat,
        lng: sensor.lng,
        status: sensor.status ?? 'active',
        co2: sensor.co2 ?? null,
        pm25: sensor.pm25 ?? null,
        temperature: sensor.temperature ?? null,
        humidity: sensor.humidity ?? null,
        windSpeed: sensor.windSpeed ?? null,
        windDirection: sensor.windDirection ?? null,
        lastReading: new Date(),
      });
    });

    // Generate heatmap cells
    this.generateHeatmapCells();
  }

  private generateHeatmapCells() {
    const cells: HeatmapCell[] = [];
    const baseCoords = { lat: 28.6000, lng: 77.2000 };
    const gridSize = 0.0005; // approximately 50m
    const gridCount = 40; // 40x40 grid

    for (let x = 0; x < gridCount; x++) {
      for (let y = 0; y < gridCount; y++) {
        const lat = baseCoords.lat + (y * gridSize);
        const lng = baseCoords.lng + (x * gridSize);
        
        // Simulate emissions based on location
        const emission = Math.random() * 1000 + 200;
        const absorption = Math.random() * 100;
        const netCO2 = emission - absorption;
        const diffusedCO2 = netCO2 * (0.8 + Math.random() * 0.4);
        
        // Color based on CO2 level
        let color = '#10b981'; // green
        if (diffusedCO2 > 800) color = '#ef4444'; // red
        else if (diffusedCO2 > 600) color = '#f59e0b'; // orange
        else if (diffusedCO2 > 400) color = '#3b82f6'; // blue

        cells.push({
          id: `${x}-${y}`,
          gridX: x,
          gridY: y,
          lat,
          lng,
          emission,
          absorption,
          netCO2,
          diffusedCO2,
          color,
        });
      }
    }

    this.heatmapCells = cells;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Sensor methods
  async getSensors(): Promise<Sensor[]> {
    return Array.from(this.sensors.values());
  }

  async getSensor(id: string): Promise<Sensor | undefined> {
    return this.sensors.get(id);
  }

  async createSensor(insertSensor: InsertSensor): Promise<Sensor> {
    const id = randomUUID();
    const sensor: Sensor = {
      id,
      name: insertSensor.name,
      lat: insertSensor.lat,
      lng: insertSensor.lng,
      status: insertSensor.status ?? 'active',
      co2: insertSensor.co2 ?? null,
      pm25: insertSensor.pm25 ?? null,
      temperature: insertSensor.temperature ?? null,
      humidity: insertSensor.humidity ?? null,
      windSpeed: insertSensor.windSpeed ?? null,
      windDirection: insertSensor.windDirection ?? null,
      lastReading: new Date(),
    };
    this.sensors.set(id, sensor);
    return sensor;
  }

  async updateSensor(id: string, updates: Partial<Sensor>): Promise<Sensor | undefined> {
    const sensor = this.sensors.get(id);
    if (!sensor) return undefined;
    
    const updated = { ...sensor, ...updates, lastReading: new Date() };
    this.sensors.set(id, updated);
    return updated;
  }

  async deleteSensor(id: string): Promise<boolean> {
    return this.sensors.delete(id);
  }

  // Simulation methods
  async getSimulations(): Promise<Simulation[]> {
    return Array.from(this.simulations.values())
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = randomUUID();
    const simulation: Simulation = {
      ...insertSimulation,
      id,
      zoneId: insertSimulation.zoneId ?? null,
      createdAt: new Date(),
    };
    this.simulations.set(id, simulation);
    return simulation;
  }

  // Heatmap methods
  async getHeatmapCells(): Promise<HeatmapCell[]> {
    return this.heatmapCells;
  }

  // Stats methods
  async getEmissionStats(): Promise<EmissionStats> {
    const totalEmission = this.heatmapCells.reduce((sum, cell) => sum + cell.emission, 0);
    const absorptionRate = this.heatmapCells.reduce((sum, cell) => sum + cell.absorption, 0);
    const avgCO2 = this.heatmapCells.reduce((sum, cell) => sum + cell.diffusedCO2, 0) / this.heatmapCells.length;
    const hotspotCount = this.heatmapCells.filter(cell => cell.diffusedCO2 > 700).length;

    // Top hotspots
    const topHotspots = this.heatmapCells
      .sort((a, b) => b.diffusedCO2 - a.diffusedCO2)
      .slice(0, 10)
      .map((cell, index) => ({
        id: cell.id,
        name: `Zone ${cell.gridX}-${cell.gridY}`,
        co2: cell.diffusedCO2,
        lat: cell.lat,
        lng: cell.lng,
      }));

    // Zone breakdown
    const zoneBreakdown = [
      { layerType: 'transport' as LayerType, emission: totalEmission * 0.30, percentage: 30 },
      { layerType: 'industry' as LayerType, emission: totalEmission * 0.35, percentage: 35 },
      { layerType: 'residential' as LayerType, emission: totalEmission * 0.25, percentage: 25 },
      { layerType: 'power' as LayerType, emission: totalEmission * 0.10, percentage: 10 },
      { layerType: 'forest' as LayerType, emission: -absorptionRate, percentage: -5 },
    ];

    return {
      totalEmission,
      hotspotCount,
      avgCO2,
      absorptionRate,
      topHotspots,
      zoneBreakdown,
    };
  }

  // City layer methods
  async getCityLayer(layerType: LayerType): Promise<GeoJSONLayer | undefined> {
    return this.cityLayers.get(layerType);
  }
}

export const storage = new MemStorage();
