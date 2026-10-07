import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Calendar, Filter } from 'lucide-react';

const VitalsChart = ({ readings = [], timeRange = '7days', onTimeRangeChange }) => {
  const [activeMetric, setActiveMetric] = useState('heartRate');

  // Format data for chart display
  const chartData = readings.map((r) => {
    const d = new Date(r.timestamp);
    const dateLabel =
      timeRange === 'today'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

    return {
      date: dateLabel,
      heartRate: r.heartRate,
      systolic: r.bloodPressure?.systolic,
      diastolic: r.bloodPressure?.diastolic,
      spo2: r.spo2,
      temperature: r.temperature,
      glucose: r.glucose,
      riskScore: r.riskScore,
    };
  });

  const metricsConfig = {
    heartRate: {
      title: 'Heart Rate (BPM)',
      color: '#f43f5e',
      unit: 'BPM',
      domain: [50, 140],
      reference: '60 - 100 BPM Normal',
    },
    bloodPressure: {
      title: 'Blood Pressure (mmHg)',
      color: '#0284c7',
      unit: 'mmHg',
      domain: [50, 190],
      reference: '< 120/80 mmHg Normal',
    },
    spo2: {
      title: 'Blood Oxygen (SpO2 %)',
      color: '#0d9488',
      unit: '%',
      domain: [85, 100],
      reference: '95 - 100% Normal',
    },
    temperature: {
      title: 'Body Temperature (°C)',
      color: '#f59e0b',
      unit: '°C',
      domain: [35, 41],
      reference: '36.5 - 37.5 °C Normal',
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
      {/* Header with Title and Time Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Physiological Telemetry Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous wearable trend analysis with clinical threshold monitoring
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTimeRangeChange && onTimeRangeChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2 my-4">
        {[
          { id: 'heartRate', label: 'Heart Rate', color: 'rose' },
          { id: 'bloodPressure', label: 'Blood Pressure', color: 'sky' },
          { id: 'spo2', label: 'SpO2 Oxygen', color: 'teal' },
          { id: 'temperature', label: 'Temperature', color: 'amber' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveMetric(btn.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeMetric === btn.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Recharts Container */}
      <div className="h-72 w-full mt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No telemetry readings available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'bloodPressure' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[50, 180]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic (mmHg)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic (mmHg)"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricsConfig[activeMetric].color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={metricsConfig[activeMetric].color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  domain={metricsConfig[activeMetric].domain}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  name={metricsConfig[activeMetric].title}
                  stroke={metricsConfig[activeMetric].color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
        <span>Clinical Reference Range</span>
        <span className="font-semibold text-slate-700">{metricsConfig[activeMetric].reference}</span>
      </div>
    </div>
  );
};

export default VitalsChart;
