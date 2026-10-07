import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { Cpu, Play, Square, AlertOctagon, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

const IoTDataSimulator = ({ onDataGenerated, patientId = null }) => {
  const [loading, setLoading] = useState(false);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const intervalRef = useRef(null);

  const generateData = async (abnormal = false) => {
    try {
      setLoading(true);
      const res = await API.post('/health/simulate-iot', { abnormal, patientId });
      if (res.data?.success) {
        setLastGenerated(res.data.reading);
        if (onDataGenerated) onDataGenerated(res.data.reading, res.data.aiAnalysis);
      }
    } catch (err) {
      console.error('Error generating simulated IoT data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Live monitoring periodic stream
  useEffect(() => {
    if (isLiveMonitoring) {
      // Generate telemetry every 8 seconds
      intervalRef.current = setInterval(() => {
        generateData(false);
      }, 8000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMonitoring]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">Simulated IoT Wearable Stream</h4>
            <p className="text-[11px] text-slate-400">Continuous biometric edge sensor simulation</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          Demo / Simulated IoT Data
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mb-5">
        Generates realistic physiological telemetry readings with natural variations and saves them directly to MongoDB. Use this to demonstrate real-time risk scoring and alert generation without physical hardware.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Simulate Normal Reading */}
        <button
          onClick={() => generateData(false)}
          disabled={loading || isLiveMonitoring}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Simulate Wearable Data
        </button>

        {/* Simulate Abnormal Reading for AI Risk Demo */}
        <button
          onClick={() => generateData(true)}
          disabled={loading || isLiveMonitoring}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 text-xs font-bold transition-all disabled:opacity-50"
          title="Generates abnormal vitals to trigger AI risk warning & notifications"
        >
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Trigger Abnormal Reading (Demo AI)
        </button>

        {/* Live Monitoring Toggle */}
        <button
          onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            isLiveMonitoring
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
          }`}
        >
          {isLiveMonitoring ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Live Monitoring
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
              Start Live Monitoring (8s)
            </>
          )}
        </button>
      </div>

      {/* Telemetry Stream Output Pill */}
      {lastGenerated && (
        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Telemetry Stored in MongoDB:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
            <span>HR: <strong className="text-white">{lastGenerated.heartRate} BPM</strong></span>
            <span>BP: <strong className="text-white">{lastGenerated.bloodPressure?.systolic}/{lastGenerated.bloodPressure?.diastolic}</strong></span>
            <span>SpO2: <strong className="text-white">{lastGenerated.spo2}%</strong></span>
            <span>Temp: <strong className="text-white">{lastGenerated.temperature}°C</strong></span>
            <span>Risk: <strong className={lastGenerated.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-rose-400'}>{lastGenerated.riskLevel}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDataSimulator;
