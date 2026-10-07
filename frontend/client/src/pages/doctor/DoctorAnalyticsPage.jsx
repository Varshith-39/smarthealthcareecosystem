import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

const DoctorAnalyticsPage = () => {
  const [loading, setLoading] = useState(false);

  // Demographic & Risk Distribution Data
  const riskData = [
    { name: 'Low Risk', value: 14, color: '#10B981' },
    { name: 'Medium Risk', value: 8, color: '#0EA5E9' },
    { name: 'High Risk', value: 4, color: '#F59E0B' },
    { name: 'Critical Risk', value: 2, color: '#EF4444' },
  ];

  // Monthly Consultations Trend
  const consultationTrends = [
    { month: 'Jan', consultations: 28, telehealth: 14 },
    { month: 'Feb', consultations: 35, telehealth: 20 },
    { month: 'Mar', consultations: 42, telehealth: 27 },
    { month: 'Apr', consultations: 38, telehealth: 24 },
    { month: 'May', consultations: 48, telehealth: 33 },
    { month: 'Jun', consultations: 56, telehealth: 40 },
    { month: 'Jul', consultations: 52, telehealth: 38 },
  ];

  // Vitals Cohort Stability
  const vitalsStability = [
    { week: 'W1', avgHeartRate: 76, avgSpo2: 97, adherence: 88 },
    { week: 'W2', avgHeartRate: 74, avgSpo2: 98, adherence: 91 },
    { week: 'W3', avgHeartRate: 75, avgSpo2: 97, adherence: 93 },
    { week: 'W4', avgHeartRate: 72, avgSpo2: 98, adherence: 95 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-600/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Practice Analytics & Outcomes
            </h1>
            <p className="text-xs text-slate-500">
              Aggregated patient risk distributions, consultation volumes, and medication adherence trends
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
          Q3 Real-time Report
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Monitored
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">28 Patients</span>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +12% active enrollment
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Visits
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">142 Visits</span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              64% through Telemedicine
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cohort Adherence
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">93.4%</span>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Exceeding clinical target
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Critical Watchlist
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600">2 Patients</span>
            <p className="text-[11px] text-rose-600 font-bold mt-0.5">
              Under continuous IoT telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Risk Breakdown Donut */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Health Risk Tier Distribution</h3>
              <p className="text-xs text-slate-400">Classified by rule-based physiological engine</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Low: 50%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-600 font-medium">Medium: 28%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">High: 14%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Critical: 8%</span>
            </div>
          </div>
        </div>

        {/* Right: Monthly Consultation Growth */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Consultation Volume Trends</h3>
              <p className="text-xs text-slate-400">In-Person Visits vs. Telehealth Sessions</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="consultations" name="Total In-Clinic" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="telehealth" name="Telehealth Room" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cohort Adherence & Vitals Stability Over Time */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cohort Stability & Prescription Adherence (Weekly)
            </h3>
            <p className="text-xs text-slate-400">Average heart rate stability vs. medication compliance</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vitalsStability}>
              <defs>
                <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" />
              <Area
                type="monotone"
                dataKey="adherence"
                name="Adherence Rate (%)"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorAdherence)"
              />
              <Area
                type="monotone"
                dataKey="avgHeartRate"
                name="Avg Heart Rate (BPM)"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorHR)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalyticsPage;
