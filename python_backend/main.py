"""
FastAPI server for environmental risk detection and alerting.
Provides REST API endpoints for analyzing sensor data and generating alerts.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ai_processor import processor, RiskAlert

# Initialize FastAPI app
app = FastAPI(
    title="Environmental Risk Detection API",
    description="AI-powered environmental monitoring and alert system",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (configure restrictively in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Request/Response Models
# ============================================================================

class SensorDataInput(BaseModel):
    """Input model for sensor data."""
    zone: str
    lat: float
    lng: float
    aqi: Optional[float] = None
    ph: Optional[float] = None
    turbidity: Optional[float] = None
    timestamp: Optional[str] = None

class AlertResponse(BaseModel):
    """Response model for risk alerts."""
    show_alert: bool
    risk_type: str
    severity: str
    location: str
    lat: float
    lng: float
    confidence: float
    reasons: List[str]
    trend: str
    actions: List[str]
    aqi: Optional[float] = None
    ph: Optional[float] = None
    turbidity: Optional[float] = None
    timestamp: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str

# ============================================================================
# Routes
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

@app.post("/analyze-risk", response_model=AlertResponse, tags=["Analysis"])
async def analyze_risk(sensor_data: SensorDataInput):
    """
    Analyze environmental sensor data and generate risk alert.
    
    The AI processor evaluates:
    - Threshold violations (AQI, pH, turbidity)
    - Anomalous spikes/drops compared to historical data
    - Trend analysis (increasing/decreasing)
    - Confidence scoring
    
    Returns a detailed risk alert with recommendations.
    """
    try:
        # Convert input to dict if needed
        data_dict = sensor_data.dict()
        
        # Add timestamp if not provided
        if not data_dict.get("timestamp"):
            data_dict["timestamp"] = datetime.now().isoformat()
        
        # Run AI analysis
        alert = processor.analyze_risk(data_dict)
        
        # Convert dataclass to dict for response
        return AlertResponse(**alert.__dict__)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

@app.post("/batch-analyze", response_model=List[AlertResponse], tags=["Analysis"])
async def batch_analyze(sensor_data_list: List[SensorDataInput]):
    """
    Analyze multiple sensor readings in batch.
    Useful for processing historical data or multiple zones at once.
    """
    try:
        results = []
        
        for sensor_data in sensor_data_list:
            data_dict = sensor_data.dict()
            
            if not data_dict.get("timestamp"):
                data_dict["timestamp"] = datetime.now().isoformat()
            
            alert = processor.analyze_risk(data_dict)
            results.append(AlertResponse(**alert.__dict__))
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing batch: {str(e)}")

@app.get("/info", tags=["Information"])
async def get_info():
    """Get information about the API and thresholds."""
    return {
        "name": "Environmental Risk Detection API",
        "description": "AI-powered system for detecting environmental hazards",
        "thresholds": {
            "air": {
                "aqi_high": 150,
                "aqi_medium": 100
            },
            "water": {
                "ph_low": 6.5,
                "ph_high": 8.5,
                "turbidity_high": 5
            }
        },
        "features": [
            "Threshold-based detection",
            "Anomaly detection",
            "Trend analysis",
            "Confidence scoring",
            "Risk classification",
            "Action recommendations"
        ]
    }

# ============================================================================
# Root endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Environmental Risk Detection & Alert System API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "analyze": "POST /analyze-risk",
            "batch": "POST /batch-analyze",
            "info": "GET /info"
        }
    }

# ============================================================================
# Entry point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Run server on port 8000
    # For production: use gunicorn or similar
    print("🚀 Starting Environmental Risk Detection API...")
    print("📚 API Docs: http://localhost:8000/docs")
    print("❤️  Health: http://localhost:8000/health")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
