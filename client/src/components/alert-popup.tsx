import { useState, useEffect } from "react";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertResponse } from "@/services/risk-api";

interface AlertPopupProps {
  alert: AlertResponse | null;
  onLearnMore: () => void;
  onDismiss: () => void;
}

/**
 * Top-right alert popup notification
 * Shows summary of detected environmental risk
 */
export function AlertPopup({ alert, onLearnMore, onDismiss }: AlertPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissCountdown, setDismissCountdown] = useState(8);

  useEffect(() => {
    if (alert?.show_alert) {
      setIsVisible(true);
      setDismissCountdown(8);
    }
  }, [alert]);

  // Auto-dismiss after countdown
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setDismissCountdown((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onDismiss]);

  if (!alert?.show_alert || !isVisible) {
    return null;
  }

  const severityColors = {
    HIGH: "bg-red-50 border-red-300",
    MEDIUM: "bg-orange-50 border-orange-300",
    LOW: "bg-yellow-50 border-yellow-300",
  };

  const severityIconColors = {
    HIGH: "text-red-600",
    MEDIUM: "text-orange-600",
    LOW: "text-yellow-600",
  };

  const severityBadgeColors = {
    HIGH: "bg-red-600 text-white",
    MEDIUM: "bg-orange-600 text-white",
    LOW: "bg-yellow-600 text-white",
  };

  return (
    <div
      className={`fixed top-6 right-6 w-96 rounded-lg border-2 p-4 shadow-lg transition-all duration-300 z-50 ${
        severityColors[alert.severity as keyof typeof severityColors] || severityColors.MEDIUM
      }`}
      data-testid="alert-popup"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle
            className={`h-6 w-6 mt-0.5 flex-shrink-0 ${
              severityIconColors[alert.severity as keyof typeof severityIconColors]
            }`}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900">{alert.risk_type} Pollution Alert</h3>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold">Zone:</span> {alert.location}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          data-testid="alert-dismiss-btn"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Severity Badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            severityBadgeColors[alert.severity as keyof typeof severityBadgeColors]
          }`}
        >
          {alert.severity} SEVERITY
        </span>
      </div>

      {/* Main Reason */}
      <p className="text-xs text-gray-700 mb-4 leading-relaxed">
        {alert.reasons?.[0] || "Environmental anomaly detected"}
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => {
            onLearnMore();
            setIsVisible(false);
          }}
          className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 flex-1"
          data-testid="alert-learn-more-btn"
        >
          Learn More
        </Button>
      </div>

      {/* Auto-dismiss countdown */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Auto-dismiss in {dismissCountdown}s
      </p>
    </div>
  );
}
