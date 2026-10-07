import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'sky', trend = null, onClick = null }) => {
  const colorMap = {
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      text: 'text-sky-600',
      gradient: 'from-sky-500/10 to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
      gradient: 'from-amber-500/10 to-transparent',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      text: 'text-rose-600',
      gradient: 'from-rose-500/10 to-transparent',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
      gradient: 'from-indigo-500/10 to-transparent',
    },
  };

  const scheme = colorMap[color] || colorMap.sky;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${scheme.gradient} pointer-events-none`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border ${scheme.text} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-medium">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-slate-500'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
