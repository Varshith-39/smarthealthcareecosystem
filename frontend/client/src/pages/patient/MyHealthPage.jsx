import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import VitalsChart from '../../components/health/VitalsChart';
import IoTDataSimulator from '../../components/health/IoTDataSimulator';
import RiskBadge from '../../components/common/RiskBadge';
import { PlusCircle, History, Heart, Activity, Wind, Thermometer, Droplets, CheckCircle, RefreshCw } from 'lucide-react';

const MyHealthPage = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Health Reading Form State
  const [heartRate, setHeartRate] = useState(72);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState(36.7);
  const [glucose, setGlucose] = useState(95);
  const [weight, setWeight] = useState(70);
  const [steps, setSteps] = useState(5000);
  const [notes, setNotes] = useState('');

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/health?timeRange=${timeRange}`);
      if (res.data?.success) {
        setReadings(res.data.readings || []);
      }
    } catch (err) {
      console.error('Error fetching health readings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [timeRange]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await API.post('/health', {
        heartRate: Number(heartRate),
        bloodPressure: { systolic: Number(systolic), diastolic: Number(diastolic) },
        spo2: Number(spo2),
        temperature: Number(temperature),
        glucose: Number(glucose),
        weight: Number(weight),
        steps: Number(steps),
        source: 'MANUAL',
        notes,
      });

      if (res.data?.success) {
        setSuccessMsg('Health reading recorded successfully with AI risk analysis!');
        setNotes('');
        fetchReadings();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error recording manual health reading:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Health Telemetry & Biometrics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manual vital log entry, simulated wearable stream, and historical trend analysis
          </p>
        </div>
        <button
          onClick={fetchReadings}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* IoT Wearable Simulator Module */}
      <IoTDataSimulator onDataGenerated={() => fetchReadings()} />

      {/* Telemetry Chart with Range Filter */}
      <VitalsChart
        readings={readings}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* Manual Health Reading Form & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Entry Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 font-bold text-slate-800 text-sm">
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>Manual Health Reading Log</span>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  required
                  min="40"
                  max="220"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  required
                  min="70"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  min="60"
                  max="250"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  min="40"
                  max="150"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="32"
                  max="44"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Glucose (mg/dL)</label>
                <input
                  type="number"
                  min="40"
                  max="500"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Clinical Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Post 30-min brisk walk / Morning fasting"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Health Reading'}
            </button>
          </form>
        </div>

        {/* Health History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <History className="w-4 h-4 text-teal-600" />
                <span>Telemetry History Log</span>
              </div>
              <span className="text-xs text-slate-400">{readings.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Heart Rate</th>
                    <th className="pb-3">Blood Pressure</th>
                    <th className="pb-3">SpO2</th>
                    <th className="pb-3">Temp</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">AI Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {readings.slice(-8).reverse().map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-600">
                        {new Date(item.timestamp).toLocaleDateString()} {' '}
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 font-bold text-slate-800">{item.heartRate} BPM</td>
                      <td className="py-3 font-semibold text-slate-700">
                        {item.bloodPressure?.systolic}/{item.bloodPressure?.diastolic}
                      </td>
                      <td className="py-3 font-semibold text-teal-700">{item.spo2}%</td>
                      <td className="py-3 text-slate-600">{Number(item.temperature).toFixed(1)}°C</td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border">
                          {item.source === 'SIMULATED_IOT' ? 'IoT Wearable' : 'Manual'}
                        </span>
                      </td>
                      <td className="py-3">
                        <RiskBadge level={item.riskLevel} score={item.riskScore} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {readings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No health readings recorded yet. Use the simulator or form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyHealthPage;
