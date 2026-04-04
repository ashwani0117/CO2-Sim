import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSensorSchema, insertSimulationSchema, interventionConfigs } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== Sensor Routes ==========
  
  // Get all sensors
  app.get("/api/sensors", async (_req, res) => {
    try {
      const sensors = await storage.getSensors();
      res.json(sensors);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      res.status(500).json({ error: 'Failed to fetch sensors' });
    }
  });

  // Create new sensor
  app.post("/api/sensors", async (req, res) => {
    try {
      const validatedData = insertSensorSchema.parse(req.body);
      const sensor = await storage.createSensor(validatedData);
      res.status(201).json(sensor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        console.error('Error creating sensor:', error);
        res.status(500).json({ error: 'Failed to create sensor' });
      }
    }
  });

  // Update sensor readings (simulate live updates)
  app.patch("/api/sensors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const sensor = await storage.updateSensor(id, updates);
      
      if (!sensor) {
        return res.status(404).json({ error: 'Sensor not found' });
      }
      
      res.json(sensor);
    } catch (error) {
      console.error('Error updating sensor:', error);
      res.status(500).json({ error: 'Failed to update sensor' });
    }
  });

  // ========== Simulation Routes ==========
  
  // Get all simulations
  app.get("/api/simulations", async (_req, res) => {
    try {
      const simulations = await storage.getSimulations();
      res.json(simulations);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      res.status(500).json({ error: 'Failed to fetch simulations' });
    }
  });

  // Run a new simulation
  app.post("/api/simulations/run", async (req, res) => {
    try {
      const { name, interventionType, parameters } = req.body;
      
      if (!name || !interventionType || !parameters) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find intervention configuration
      const interventionConfig = interventionConfigs.find(c => c.type === interventionType);
      if (!interventionConfig) {
        return res.status(400).json({ error: 'Invalid intervention type' });
      }

      // Get current emission stats for baseline
      const stats = await storage.getEmissionStats();
      const baselineCO2 = stats.avgCO2;

      // Calculate reduction based on intervention and parameters
      let reductionFactor = interventionConfig.reductionFactor;
      
      // Adjust reduction based on parameters
      Object.keys(parameters).forEach(key => {
        const value = parameters[key];
        if (key === 'coverage' || key === 'diversion' || key === 'shutdown') {
          // Percentage-based parameters
          reductionFactor *= (value / 100);
        } else if (key === 'count') {
          // Count-based parameters (devices)
          reductionFactor *= Math.min(value / 20, 1.5); // Max 1.5x at 30 devices
        } else if (key === 'speed') {
          // Speed limit reduction
          const speedReduction = (60 - value) / 60;
          reductionFactor *= speedReduction;
        }
      });

      // Apply Gaussian diffusion factors (simplified)
      const windFactor = 0.95; // Wind helps disperse
      const atmosphericStability = 0.98; // Neutral stability
      
      const simulatedCO2 = baselineCO2 * (1 - reductionFactor) * windFactor * atmosphericStability;
      const reductionPercent = ((baselineCO2 - simulatedCO2) / baselineCO2) * 100;

      // Create simulation record
      const simulationData = {
        name,
        interventionType,
        parameters,
        zoneId: null,
        baselineCO2,
        simulatedCO2,
        reductionPercent,
      };

      const simulation = await storage.createSimulation(simulationData);
      res.status(201).json(simulation);
    } catch (error) {
      console.error('Error running simulation:', error);
      res.status(500).json({ error: 'Failed to run simulation' });
    }
  });

  // ========== Statistics Routes ==========
  
  // Get emission statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getEmissionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // ========== Heatmap Routes ==========
  
  // Get heatmap data
  app.get("/api/heatmap", async (_req, res) => {
    try {
      const heatmapCells = await storage.getHeatmapCells();
      res.json(heatmapCells);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
  });

  // ========== City Layer Routes ==========
  
  // Get city layer by type
  app.get("/api/layers/:layerType", async (req, res) => {
    try {
      const { layerType } = req.params;
      
      const validLayerTypes = ['transport', 'industry', 'residential', 'forest', 'power'];
      if (!validLayerTypes.includes(layerType)) {
        return res.status(400).json({ error: 'Invalid layer type' });
      }

      const layer = await storage.getCityLayer(layerType as any);
      
      if (!layer) {
        return res.status(404).json({ error: 'Layer not found' });
      }
      
      res.json(layer);
    } catch (error) {
      console.error('Error fetching layer:', error);
      res.status(500).json({ error: 'Failed to fetch layer data' });
    }
  });

  // ========== Prediction Routes ==========
  
  // ML prediction endpoint
  app.post("/api/predict", async (req, res) => {
    try {
      const { features } = req.body;
      
      if (!features) {
        return res.status(400).json({ error: 'Missing features' });
      }

      // Simple ML prediction model (simplified XGBoost simulation)
      const {
        roadLength = 0,
        industryArea = 0,
        residentialDensity = 0,
        forestArea = 0,
        windSpeed = 0,
        population = 0,
      } = features;

      // Feature importance weights (simulated trained model)
      const weights = {
        roadLength: 0.25,
        industryArea: 0.30,
        residentialDensity: 0.20,
        forestArea: -0.15,
        windSpeed: -0.05,
        population: 0.10,
      };

      // Calculate prediction
      const baselineCO2 = 400; // Base atmospheric CO2
      let predictedCO2 = baselineCO2;

      predictedCO2 += roadLength * weights.roadLength * 0.05;
      predictedCO2 += industryArea * weights.industryArea * 0.02;
      predictedCO2 += residentialDensity * weights.residentialDensity * 0.03;
      predictedCO2 += forestArea * weights.forestArea * 0.01;
      predictedCO2 += windSpeed * weights.windSpeed * 10;
      predictedCO2 += population * weights.population * 0.001;

      // Calculate confidence (0-1)
      const confidence = Math.max(0.6, Math.min(0.95, 0.8 - (Math.random() * 0.2)));

      // Feature importance for explainability
      const featureImportance = [
        { name: 'Industry Area', value: industryArea, importance: Math.abs(weights.industryArea) },
        { name: 'Road Length', value: roadLength, importance: Math.abs(weights.roadLength) },
        { name: 'Residential Density', value: residentialDensity, importance: Math.abs(weights.residentialDensity) },
        { name: 'Forest Area', value: forestArea, importance: Math.abs(weights.forestArea) },
        { name: 'Population', value: population, importance: Math.abs(weights.population) },
        { name: 'Wind Speed', value: windSpeed, importance: Math.abs(weights.windSpeed) },
      ].sort((a, b) => b.importance - a.importance);

      const response = {
        predictedCO2,
        confidence,
        features: featureImportance,
      };

      res.json(response);
    } catch (error) {
      console.error('Error making prediction:', error);
      res.status(500).json({ error: 'Failed to generate prediction' });
    }
  });

  // ========== Diffusion Model Routes ==========
  
  // Calculate Gaussian plume diffusion
  app.post("/api/diffusion/calculate", async (req, res) => {
    try {
      const { windSpeed, windDirection, atmosphericStability, emissionRate } = req.body;

      if (!windSpeed || !windDirection || !atmosphericStability || !emissionRate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Simplified Gaussian plume calculation
      const stabilityFactors: Record<string, number> = {
        stable: 0.8,
        neutral: 1.0,
        unstable: 1.2,
      };

      const stabilityFactor = stabilityFactors[atmosphericStability] || 1.0;
      
      // Calculate dispersion coefficients (simplified)
      const sigmaY = 10 * Math.sqrt(windSpeed) * stabilityFactor;
      const sigmaZ = 8 * Math.sqrt(windSpeed) * stabilityFactor;

      // Effective emission concentration at downwind points
      const downwindDistances = [100, 500, 1000, 2000, 5000]; // meters
      const concentrations = downwindDistances.map(distance => {
        const concentration = (emissionRate / (2 * Math.PI * windSpeed * sigmaY * sigmaZ)) *
          Math.exp(-(distance * distance) / (2 * sigmaY * sigmaY));
        return {
          distance,
          concentration: Math.max(0, concentration),
        };
      });

      res.json({
        sigmaY,
        sigmaZ,
        concentrations,
        windSpeed,
        windDirection,
        atmosphericStability,
      });
    } catch (error) {
      console.error('Error calculating diffusion:', error);
      res.status(500).json({ error: 'Failed to calculate diffusion' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
