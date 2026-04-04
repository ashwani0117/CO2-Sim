import { useState } from "react";
import { X, MapPin, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertResponse } from "@/services/risk-api";

interface AlertPanelProps {
  alert: AlertResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onLocate: (lat: number, lng: number, zone: string) => void;
}

/**
 * Detailed alert panel drawer
 * Shows full risk assessment, confidence, reasons, trends, and recommended actions
 */
export function AlertPanel({ alert, isOpen, onClose, onLocate }: AlertPanelProps) {
  const [isLocating, setIsLocating] = useState(false);

  if (!alert) {
    return null;
  }

  const handleLocate = async () => {
    setIsLocating(true);
    try {
      onLocate(alert.lat, alert.lng, alert.location);
      // Give visual feedback
      setTimeout(() => setIsLocating(false), 500);
    } catch (error) {
      console.error("Error locating:", error);
      setIsLocating(false);
    }
  };

  const severityColors = {
    HIGH: "bg-red-100 text-red-900 border-red-300",
    MEDIUM: "bg-orange-100 text-orange-900 border-orange-300",
    LOW: "bg-yellow-100 text-yellow-900 border-yellow-300",
  };

  const severityBadgeColors = {
    HIGH: "bg-red-600 text-white",
    MEDIUM: "bg-orange-600 text-white",
    LOW: "bg-yellow-600 text-white",
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]" data-testid="alert-panel">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <DrawerTitle className="text-lg font-bold">
                {alert.risk_type} Pollution Alert - Details
              </DrawerTitle>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              data-testid="panel-close-btn"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Location Card */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-sm text-slate-900">Location</h3>
            </div>
            <p className="text-sm font-medium text-slate-900">{alert.location}</p>
            <p className="text-xs text-slate-600 mt-1">
              Coordinates: {alert.lat.toFixed(4)}°, {alert.lng.toFixed(4)}°
            </p>
            <Button
              onClick={handleLocate}
              disabled={isLocating}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              data-testid="panel-locate-btn"
            >
              {isLocating ? "Locating..." : "📍 Locate On Map"}
            </Button>
          </div>

          {/* Severity & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`rounded-lg p-4 border ${
                severityColors[alert.severity as keyof typeof severityColors] || severityColors.MEDIUM
              }`}
            >
              <p className="text-xs font-semibold mb-1">SEVERITY</p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                    severityBadgeColors[alert.severity as keyof typeof severityBadgeColors]
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold mb-1">CONFIDENCE</p>
              <p className="text-2xl font-bold text-blue-900">{Math.round(alert.confidence)}%</p>
            </div>
          </div>

          {/* Sensor Readings */}
          {(alert.aqi != null || alert.ph != null || alert.turbidity != null) && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">Current Readings</h3>
              <div className="space-y-2 text-sm">
                {alert.aqi != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">AQI:</span>
                    <span className="font-medium text-slate-900">{alert.aqi.toFixed(1)}</span>
                  </div>
                )}
                {alert.ph != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">pH Level:</span>
                    <span className="font-medium text-slate-900">{alert.ph.toFixed(2)}</span>
                  </div>
                )}
                {alert.turbidity != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Turbidity:</span>
                    <span className="font-medium text-slate-900">{alert.turbidity.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trend */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              <h3 className="font-semibold text-sm text-slate-900">Trend</h3>
            </div>
            <p className="text-sm text-slate-700 italic">{alert.trend}</p>
          </div>

          {/* Reasons */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-sm text-red-900 mb-3">Why This Alert?</h3>
            <ul className="space-y-2">
              {alert.reasons.map((reason, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-red-800">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
              <h3 className="font-semibold text-sm text-green-900">Recommended Actions</h3>
            </div>
            <ul className="space-y-2">
              {alert.actions.map((action, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-green-800">
                  <span className="text-green-700 font-bold">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timestamp */}
          {alert.timestamp && (
            <p className="text-xs text-slate-500 text-center">
              Alert generated: {new Date(alert.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-slate-50 flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            data-testid="panel-close-action-btn"
          >
            Close
          </Button>
          <Button
            onClick={handleLocate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="panel-locate-action-btn"
          >
            📍 Locate
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
