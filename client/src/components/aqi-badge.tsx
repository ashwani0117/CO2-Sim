import { useAQI } from '@/hooks/useAQI';
import { Wind } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AQIBadge() {
  const aqi = useAQI();

  const getAQIColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 text-black';
      case 'unhealthy':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good':
        return '✓ Good';
      case 'moderate':
        return '⚠ Moderate';
      case 'unhealthy':
        return '✗ Unhealthy';
      default:
        return '? Unknown';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer hover:shadow-lg transition-shadow ${getAQIColor(aqi.status)}`}>
            <Wind className="h-5 w-5" />
            <div className="flex flex-col leading-tight">
              <div className="text-xs font-medium opacity-90">AQI</div>
              <div className="text-xl font-black">{aqi.aqi}</div>
            </div>
            <div className="h-8 w-px opacity-30"></div>
            <span className="text-xs font-semibold opacity-90">
              {getStatusLabel(aqi.status)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-64 p-4">
          <div className="space-y-3">
            <div>
              <p className="font-bold text-sm text-black">Hyderabad - Live AQI</p>
              <p className="text-xs text-gray-600 mt-1">Source: {aqi.source}</p>
            </div>
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600">AQI</p>
                  <p className="font-bold text-lg text-black">{aqi.aqi}</p>
                </div>
                <div>
                  <p className="text-gray-600">PM2.5</p>
                  <p className="font-bold text-black">{aqi.pm25} <span className="text-xs">µg/m³</span></p>
                </div>
                <div>
                  <p className="text-gray-600">PM10</p>
                  <p className="font-bold text-black">{aqi.pm10} <span className="text-xs">µg/m³</span></p>
                </div>
                <div>
                  <p className="text-gray-600">CO₂</p>
                  <p className="font-bold text-black">{aqi.co2} <span className="text-xs">ppm</span></p>
                </div>
                <div>
                  <p className="text-gray-600">NO₂</p>
                  <p className="font-bold text-black">{aqi.no2} <span className="text-xs">ppb</span></p>
                </div>
                <div>
                  <p className="text-gray-600">SO₂</p>
                  <p className="font-bold text-black">{aqi.so2} <span className="text-xs">ppb</span></p>
                </div>
                <div>
                  <p className="text-gray-600">CO</p>
                  <p className="font-bold text-black">{aqi.co} <span className="text-xs">ppb</span></p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-2">
              <p className="text-xs text-gray-600">
                Updated: {new Date(aqi.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
