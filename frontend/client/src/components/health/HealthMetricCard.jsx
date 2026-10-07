import React from 'react';
import { Heart, Activity, Wind, Thermometer, Droplets, Footprints } from 'lucide-react';

const HealthMetricCard = ({ title, value, unit, status = 'Normal', iconType, range, color = 'sky' }) => {
  const getIcon = () => {
    switch (iconType) {
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      case 'bp':
        return <Activity className="w-5 h-5 text-sky-500" />;
      case 'spo2':
        return <Wind className="w-5 h-5 text-teal-500" />;
      case 'temp':
        return <Thermometer className="w-5 h-5 text-amber-500" />;
      case 'glucose':
        return <Droplets className="w-5 h-5 text-indigo-500" />;
      case 'steps':
        return <Footprints className="w-5 h-5 text-emerald-500" />;
      default:
        return <Activity className="w-5 h-5 text-sky-500" />;
    }
  };

  const getStatusColor = () => {
    if (status === 'Critical') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'Warning' || status === 'Elevated' || status === 'Low') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">{getIcon()}</div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor()}`}>
          {status}
        </span>
      </div>

      <div className="mt-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
        </div>
      </div>

      {range && (
        <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Standard Reference</span>
          <span className="font-medium text-slate-600">{range}</span>
        </div>
      )}
    </div>
  );
};

export default HealthMetricCard;
