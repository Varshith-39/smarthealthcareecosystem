import React from 'react';

const RiskBadge = ({ level = 'LOW', score = null, size = 'md' }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const styles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300 ring-red-500/30 animate-pulse',
  };

  const dots = {
    LOW: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    HIGH: 'bg-rose-500',
    CRITICAL: 'bg-red-600',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 ${
        styles[normalizedLevel] || styles.LOW
      } ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[normalizedLevel] || dots.LOW}`} />
      <span>{normalizedLevel}</span>
      {score !== null && <span className="opacity-75 font-normal">({score}/100)</span>}
    </span>
  );
};

export default RiskBadge;
