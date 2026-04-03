"""
AI-based risk processor for environmental monitoring.
Analyzes sensor data and generates risk alerts based on:
- Threshold detection
- Anomaly detection
- Trend analysis
- Confidence scoring
"""

from enum import Enum
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from memory_store import memory_store

class RiskType(str, Enum):
    AIR = "Air"
    WATER = "Water"
    NONE = "None"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

@dataclass
class RiskAlert:
    """Risk alert data structure."""
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
    aqi: float = None
    ph: float = None
    turbidity: float = None
    timestamp: str = None

class RiskProcessor:
    """Main AI processor for environmental risk detection."""
    
    # Threshold values for triggering alerts
    AQI_HIGH_THRESHOLD = 150
    AQI_MEDIUM_THRESHOLD = 100
    PH_LOW_THRESHOLD = 6.5
    PH_HIGH_THRESHOLD = 8.5
    TURBIDITY_HIGH_THRESHOLD = 5
    
    def __init__(self):
        self.memory_store = memory_store
    
    def analyze_risk(self, data: Dict[str, Any]) -> RiskAlert:
        """
        Main analysis function. Process sensor data and generate risk alert.
        
        Input data expected:
        {
            "zone": "Tank A",
            "lat": number,
            "lng": number,
            "aqi": number,
            "ph": number,
            "turbidity": number,
            "timestamp": string
        }
        """
        # 1. Data Validation
        alert_data = self._validate_input(data)
        if not alert_data:
            return RiskAlert(
                show_alert=False,
                risk_type=RiskType.NONE.value,
                severity=Severity.LOW.value,
                location=data.get("zone", "Unknown"),
                lat=data.get("lat", 0),
                lng=data.get("lng", 0),
                confidence=0,
                reasons=["Invalid input data"],
                trend="stable",
                actions=[]
            )
        
        zone = alert_data["zone"]
        aqi = alert_data.get("aqi")
        ph = alert_data.get("ph")
        turbidity = alert_data.get("turbidity")
        
        # Store readings in memory for trend/anomaly detection
        if aqi is not None:
            self.memory_store.add_reading(zone, "aqi", aqi)
        if ph is not None:
            self.memory_store.add_reading(zone, "ph", ph)
        if turbidity is not None:
            self.memory_store.add_reading(zone, "turbidity", turbidity)
        
        # 2. Threshold-based Detection
        threshold_violations = self._check_thresholds(zone, aqi, ph, turbidity)
        
        # 3. Anomaly Detection
        anomalies = self._detect_anomalies(zone, aqi, ph, turbidity)
        
        # 4. Trend Detection
        trends = self._analyze_trends(zone, aqi, ph, turbidity)
        
        # 5. Risk Classification
        risk_type, severity, is_alert = self._classify_risk(
            threshold_violations, anomalies, trends
        )
        
        # 6. Confidence Score Calculation
        confidence = self._calculate_confidence(
            threshold_violations, anomalies, is_alert
        )
        
        # 7. Generate Reasons and Actions
        reasons = self._generate_reasons(threshold_violations, anomalies, trends)
        actions = self._generate_actions(risk_type, severity, zone)
        primary_trend = self._get_primary_trend(trends)
        
        # Build alert response
        alert = RiskAlert(
            show_alert=is_alert,
            risk_type=risk_type.value,
            severity=severity.value,
            location=zone,
            lat=alert_data["lat"],
            lng=alert_data["lng"],
            confidence=confidence,
            reasons=reasons,
            trend=primary_trend,
            actions=actions,
            aqi=aqi,
            ph=ph,
            turbidity=turbidity,
            timestamp=alert_data.get("timestamp")
        )
        
        return alert
    
    def _validate_input(self, data: Dict[str, Any]) -> Dict[str, Any] | None:
        """Validate input data structure and values."""
        required_fields = ["zone", "lat", "lng"]
        
        for field in required_fields:
            if field not in data:
                return None
        
        try:
            # Validate numeric fields
            lat = float(data["lat"])
            lng = float(data["lng"])
            
            if lat < -90 or lat > 90 or lng < -180 or lng > 180:
                return None
            
            validated = {
                "zone": str(data["zone"]),
                "lat": lat,
                "lng": lng,
                "timestamp": data.get("timestamp", "")
            }
            
            # Optional numeric fields
            if "aqi" in data:
                validated["aqi"] = float(data["aqi"])
            if "ph" in data:
                validated["ph"] = float(data["ph"])
            if "turbidity" in data:
                validated["turbidity"] = float(data["turbidity"])
            
            return validated
        except (ValueError, TypeError):
            return None
    
    def _check_thresholds(self, zone: str, aqi: float | None, 
                          ph: float | None, turbidity: float | None) -> Dict[str, bool]:
        """Check if sensor values exceed critical thresholds."""
        violations = {
            "aqi_high": False,
            "aqi_medium": False,
            "ph_low": False,
            "ph_high": False,
            "turbidity_high": False
        }
        
        if aqi is not None:
            if aqi > self.AQI_HIGH_THRESHOLD:
                violations["aqi_high"] = True
            elif aqi > self.AQI_MEDIUM_THRESHOLD:
                violations["aqi_medium"] = True
        
        if ph is not None:
            if ph < self.PH_LOW_THRESHOLD:
                violations["ph_low"] = True
            elif ph > self.PH_HIGH_THRESHOLD:
                violations["ph_high"] = True
        
        if turbidity is not None:
            if turbidity > self.TURBIDITY_HIGH_THRESHOLD:
                violations["turbidity_high"] = True
        
        return violations
    
    def _detect_anomalies(self, zone: str, aqi: float | None,
                          ph: float | None, turbidity: float | None) -> Dict[str, bool]:
        """Detect anomalous spikes or drops in sensor readings."""
        anomalies = {
            "aqi_anomaly": False,
            "ph_anomaly": False,
            "turbidity_anomaly": False
        }
        
        if aqi is not None:
            anomalies["aqi_anomaly"] = self.memory_store.detect_anomaly(zone, "aqi", aqi)
        
        if ph is not None:
            anomalies["ph_anomaly"] = self.memory_store.detect_anomaly(zone, "ph", ph, threshold_ratio=1.3)
        
        if turbidity is not None:
            anomalies["turbidity_anomaly"] = self.memory_store.detect_anomaly(zone, "turbidity", turbidity)
        
        return anomalies
    
    def _analyze_trends(self, zone: str, aqi: float | None,
                        ph: float | None, turbidity: float | None) -> Dict[str, str]:
        """Analyze trends in sensor data over recent readings."""
        trends = {
            "aqi_trend": self.memory_store.detect_trend(zone, "aqi") if aqi is not None else "stable",
            "ph_trend": self.memory_store.detect_trend(zone, "ph") if ph is not None else "stable",
            "turbidity_trend": self.memory_store.detect_trend(zone, "turbidity") if turbidity is not None else "stable"
        }
        
        return trends
    
    def _classify_risk(self, thresholds: Dict[str, bool], 
                      anomalies: Dict[str, bool], 
                      trends: Dict[str, str]) -> tuple[RiskType, Severity, bool]:
        """
        Classify risk based on violations, anomalies, and trends.
        Returns: (risk_type, severity, should_show_alert)
        """
        risk_type = RiskType.NONE
        severity = Severity.LOW
        is_alert = False
        
        # Check for water risks
        water_risk_count = sum([
            thresholds.get("ph_low", False),
            thresholds.get("ph_high", False),
            thresholds.get("turbidity_high", False),
            anomalies.get("turbidity_anomaly", False)
        ])
        
        # Check for air risks
        air_risk_count = sum([
            thresholds.get("aqi_high", False),
            thresholds.get("aqi_medium", False),
            anomalies.get("aqi_anomaly", False)
        ])
        
        # Determine primary risk type
        if air_risk_count > 0 and air_risk_count >= water_risk_count:
            risk_type = RiskType.AIR
            is_alert = air_risk_count > 0
        elif water_risk_count > 0:
            risk_type = RiskType.WATER
            is_alert = water_risk_count > 0
        
        # Determine severity
        if is_alert:
            if thresholds.get("aqi_high") or thresholds.get("ph_low") or thresholds.get("turbidity_high"):
                severity = Severity.HIGH
            elif thresholds.get("aqi_medium") or anomalies.get("aqi_anomaly") or anomalies.get("turbidity_anomaly"):
                severity = Severity.MEDIUM
            else:
                severity = Severity.LOW
            
            # Increase severity if trend is deteriorating
            if risk_type == RiskType.AIR and trends["aqi_trend"] == "increasing":
                if severity == Severity.LOW:
                    severity = Severity.MEDIUM
                elif severity == Severity.MEDIUM:
                    severity = Severity.HIGH
            
            if risk_type == RiskType.WATER and trends["turbidity_trend"] == "increasing":
                if severity == Severity.LOW:
                    severity = Severity.MEDIUM
        
        return risk_type, severity, is_alert
    
    def _calculate_confidence(self, thresholds: Dict[str, bool],
                              anomalies: Dict[str, bool], is_alert: bool) -> float:
        """Calculate confidence score based on triggering conditions."""
        if not is_alert:
            return 0.0
        
        # Base confidence
        confidence = 70.0
        
        # Add 10% for each triggered condition
        trigger_count = sum(thresholds.values()) + sum(anomalies.values())
        confidence += min(trigger_count * 10, 25)  # Cap at 95%
        
        return min(confidence, 100.0)
    
    def _generate_reasons(self, thresholds: Dict[str, bool],
                         anomalies: Dict[str, bool],
                         trends: Dict[str, str]) -> List[str]:
        """Generate human-readable reasons for the alert."""
        reasons = []
        
        if thresholds.get("aqi_high"):
            reasons.append("AQI exceeded safe limit (> 150)")
        elif thresholds.get("aqi_medium"):
            reasons.append("AQI exceeded moderate limit (> 100)")
        
        if thresholds.get("ph_low"):
            reasons.append("pH below safe range (< 6.5)")
        elif thresholds.get("ph_high"):
            reasons.append("pH above safe range (> 8.5)")
        
        if thresholds.get("turbidity_high"):
            reasons.append("Turbidity increased rapidly (> 5)")
        
        if anomalies.get("aqi_anomaly"):
            reasons.append("AQI spike detected")
        
        if anomalies.get("turbidity_anomaly"):
            reasons.append("Turbidity spike detected")
        
        if trends["aqi_trend"] == "increasing":
            reasons.append("AQI values rising continuously")
        
        if trends["turbidity_trend"] == "increasing":
            reasons.append("Turbidity increasing over time")
        
        return reasons[:3] if reasons else ["Anomalous readings detected"]
    
    def _generate_actions(self, risk_type: RiskType, severity: Severity, location: str) -> List[str]:
        """Generate recommended actions based on risk type and severity."""
        actions = []
        
        if risk_type == RiskType.AIR:
            if severity == Severity.HIGH:
                actions.extend([
                    "Restrict traffic in affected area",
                    "Issue public health advisory",
                    "Monitor nearby industrial emissions"
                ])
            else:
                actions.extend([
                    "Increase air quality monitoring",
                    "Advise vulnerable populations to limit outdoor activities"
                ])
        
        elif risk_type == RiskType.WATER:
            if severity == Severity.HIGH:
                actions.extend([
                    "Stop water supply",
                    "Inspect pipelines and treatment facilities",
                    "Issue public warning"
                ])
            else:
                actions.extend([
                    "Increase water quality testing frequency",
                    "Monitor for contamination sources"
                ])
        
        return actions
    
    def _get_primary_trend(self, trends: Dict[str, str]) -> str:
        """Get the primary trend from all metrics."""
        # Return the most significant trend
        if trends.get("aqi_trend") == "increasing":
            return "AQI rising"
        elif trends.get("turbidity_trend") == "increasing":
            return "Turbidity rising"
        elif trends.get("aqi_trend") == "decreasing":
            return "AQI decreasing"
        elif trends.get("turbidity_trend") == "decreasing":
            return "Turbidity decreasing"
        return "Stable"

# Global processor instance
processor = RiskProcessor()
