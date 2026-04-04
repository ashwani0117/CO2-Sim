import { useCO2Sensor } from '@/hooks/useCO2Sensor';

export function CO2Display() {
  const sensorData = useCO2Sensor();
  
  const getQualityLabel = (co2: number) => {
    if (co2 < 400) return { label: 'Excellent', color: 'text-emerald-400' };
    if (co2 < 600) return { label: 'Good', color: 'text-green-400' };
    if (co2 < 1000) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'High', color: 'text-orange-400' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'loading':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const quality = getQualityLabel(sensorData.co2);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg p-4 mb-4 border border-slate-700 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Average CO₂</h3>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(sensorData.status)} animate-pulse`}></div>
        </div>
        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded">ppm</span>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-black text-white">{sensorData.co2.toFixed(1)}</p>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-semibold ${quality.color}`}>
            {quality.label}
          </p>
          <p className="text-xs text-slate-500">
            {sensorData.source}
          </p>
        </div>
      </div>
    </div>
  );
}
