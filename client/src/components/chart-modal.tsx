import { X } from "lucide-react";
import { ChartsPanel } from "./charts-panel";
import { Button } from "@/components/ui/button";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: string;
}

export function ChartModal({ isOpen, onClose, activeScenario }: ChartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end">
      <div className="bg-white w-full max-h-96 shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">24h Emission Charts</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-80 p-4">
          <ChartsPanel activeScenario={activeScenario} />
        </div>
      </div>
    </div>
  );
}
