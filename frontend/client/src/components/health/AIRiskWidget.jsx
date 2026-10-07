import React from 'react';
import RiskBadge from '../common/RiskBadge';
import { Brain, AlertCircle, Info, ShieldCheck, Activity } from 'lucide-react';

const AIRiskWidget = ({ assessment, latestReading }) => {
  const score = assessment?.score ?? latestReading?.riskScore ?? 15;
  const level = assessment?.level ?? latestReading?.riskLevel ?? 'LOW';
  const reasons = assessment?.reasons ?? latestReading?.riskFactors ?? [
    'Physiological parameters within healthy baseline ranges',
  ];

  // Gauge bar color
  const getProgressColor = () => {
    if (score >= 80) return 'bg-gradient-to-r from-rose-500 to-red-600';
    if (score >= 55) return 'bg-gradient-to-r from-amber-500 to-rose-500';
    if (score >= 28) return 'bg-gradient-to-r from-sky-500 to-amber-500';
    return 'bg-gradient-to-r from-teal-500 to-emerald-500';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card hover:shadow-card-hover transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Health Risk Prediction</h3>
            <p className="text-xs text-slate-500">Explainable clinical heuristic scoring engine</p>
          </div>
        </div>
        <RiskBadge level={level} size="lg" />
      </div>

      {/* Score Gauge */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Calculated Risk Index
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{score}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor()}`}
            style={{ width: `${Math.max(6, Math.min(100, score))}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
          <span className="text-emerald-600">Low (0-27)</span>
          <span className="text-amber-600">Medium (28-54)</span>
          <span className="text-rose-600">High (55-79)</span>
          <span className="text-red-700">Critical (80+)</span>
        </div>
      </div>

      {/* Explainability Factors */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-600" />
          Why this risk was detected:
        </h4>
        <ul className="space-y-2">
          {reasons.map((reason, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Medical Disclaimer */}
      <div className="mt-5 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-amber-800">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Educational Project Disclaimer:</strong> This prediction is generated for college demonstration and educational purposes only and does not constitute a clinical medical diagnosis. Modular design ready for PyTorch/ONNX ML models.
        </p>
      </div>
    </div>
  );
};

export default AIRiskWidget;
