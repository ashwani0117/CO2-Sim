"""
Memory store for historical sensor data used in anomaly and trend detection.
Keeps the last N readings for each zone for comparison analysis.
"""

from collections import defaultdict, deque
from typing import Dict, List
from datetime import datetime

class MemoryStore:
    def __init__(self, max_history: int = 10):
        """Initialize memory store with configurable history size."""
        self.max_history = max_history
        # Structure: {zone: {metric: deque([values])}}
        self.history: Dict[str, Dict[str, deque]] = defaultdict(lambda: defaultdict(lambda: deque(maxlen=max_history)))
    
    def add_reading(self, zone: str, metric: str, value: float) -> None:
        """Add a new reading to the history for a zone/metric."""
        self.history[zone][metric].append(value)
    
    def get_history(self, zone: str, metric: str) -> List[float]:
        """Get historical readings for a metric in a zone."""
        return list(self.history[zone][metric])
    
    def get_last_n(self, zone: str, metric: str, n: int) -> List[float]:
        """Get last N readings for a metric."""
        history = self.get_history(zone, metric)
        return history[-n:] if len(history) >= n else history
    
    def detect_anomaly(self, zone: str, metric: str, current_value: float, threshold_ratio: float = 1.5) -> bool:
        """
        Detect if current value is anomalous compared to recent average.
        Args:
            threshold_ratio: How much the current value should deviate (1.5 = 50% deviation)
        """
        history = self.get_last_n(zone, metric, 5)
        
        if len(history) < 2:
            return False
        
        avg_prev = sum(history[:-1]) / len(history[:-1])
        
        if avg_prev == 0:
            return current_value > 0
        
        ratio = abs(current_value - avg_prev) / avg_prev
        return ratio > (threshold_ratio - 1)
    
    def detect_trend(self, zone: str, metric: str) -> str:
        """
        Detect trend in recent values: 'increasing', 'decreasing', or 'stable'.
        """
        history = self.get_last_n(zone, metric, 4)
        
        if len(history) < 2:
            return "stable"
        
        # Simple trend: compare average of first half vs second half
        mid = len(history) // 2
        first_half_avg = sum(history[:mid]) / mid if mid > 0 else history[0]
        second_half_avg = sum(history[mid:]) / len(history[mid:]) if len(history[mid:]) > 0 else history[-1]
        
        diff_ratio = (second_half_avg - first_half_avg) / (first_half_avg + 0.001)
        
        if diff_ratio > 0.1:
            return "increasing"
        elif diff_ratio < -0.1:
            return "decreasing"
        else:
            return "stable"

# Global instance
memory_store = MemoryStore()
