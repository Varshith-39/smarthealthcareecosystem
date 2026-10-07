import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  MapPin,
  HeartPulse,
  Clock,
  CheckCircle2,
  Ambulance,
  Building2,
  User,
  Activity,
  AlertCircle,
} from 'lucide-react';

const EmergencySOSPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/emergency');
      if (res.data?.success) {
        const list = res.data.alerts || [];
        setAlerts(list);
        const active = list.find((a) => a.status === 'TRIGGERED' || a.status === 'ACKNOWLEDGED');
        setActiveAlert(active || null);
      }
    } catch (err) {
      console.error('Error fetching emergency alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const initiateSOS = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      executeTriggerSOS();
      setCountdown(null);
    }
  }, [countdown]);

  const abortSOS = () => {
    setCountdown(null);
  };

  const executeTriggerSOS = async () => {
    try {
      setTriggering(true);
      const res = await API.post('/emergency/trigger', {
        message: 'Acute medical distress reported. High vital variability detected. Paramedic dispatch requested.',
      });

      if (res.data?.success) {
        setSuccessBanner('🚨 Emergency SOS Broadcast Sent! Healthcare providers and paramedics are notified.');
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error triggering emergency SOS:', err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Alert */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-red-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-red-600/30 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 animate-pulse shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emergency SOS Response Center
            </h1>
            <p className="text-xs text-slate-500">
              Immediate distress broadcasting, telemetry dispatch, and paramedic coordination
            </p>
          </div>
        </div>
      </div>

      {/* Main SOS Trigger Hub */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Big SOS Action */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            {countdown !== null ? (
              <div className="flex flex-col items-center animate-in zoom-in-95">
                <div className="w-36 h-36 rounded-full bg-red-600 border-4 border-red-400 text-white flex flex-col items-center justify-center font-black shadow-2xl shadow-red-600/60 animate-pulse">
                  <span className="text-4xl">{countdown}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Sending...</span>
                </div>
                <button
                  onClick={abortSOS}
                  className="mt-4 px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Cancel / Abort
                </button>
              </div>
            ) : (
              <button
                onClick={initiateSOS}
                disabled={triggering}
                className="group relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border-4 border-white/20 hover:border-white/40 text-white flex flex-col items-center justify-center font-black shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition-all focus:outline-none"
              >
                <ShieldAlert className="w-12 h-12 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black tracking-widest">SOS</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                  {triggering ? 'Broadcasting...' : 'Press for Help'}
                </span>
              </button>
            )}

            <p className="text-xs text-rose-200/80 mt-4 max-w-xs leading-relaxed">
              Pressing SOS broadcasts your current GPS location, vital telemetry, and emergency contacts to hospital dispatch.
            </p>
          </div>

          {/* Right Column: Active Emergency Telemetry Snapshot */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
                  Broadcasted Telemetry Snapshot
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 border border-red-500/40">
                Live Sensor Feed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-300 block font-semibold">Heart Rate</span>
                <span className="text-lg font-black text-rose-400">118 BPM</span>
                <span className="text-[9px] text-rose-300 block">Tachycardia</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-300 block font-semibold">Blood Pressure</span>
                <span className="text-lg font-black text-rose-400">155/98</span>
                <span className="text-[9px] text-rose-300 block">Hypertensive</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-300 block font-semibold">Blood Oxygen</span>
                <span className="text-lg font-black text-amber-300">91% SpO2</span>
                <span className="text-[9px] text-amber-200 block">Hypoxia Alert</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-300 block font-semibold">Temperature</span>
                <span className="text-lg font-black text-white">38.8 °C</span>
                <span className="text-[9px] text-slate-300 block">High Fever</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 pt-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Broadcast Address: Sector 62, Metro Tech Zone, City Center (Lat 28.628, Lng 77.375)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts & Hospital Network */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Designated Primary Emergency Contact */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Primary Emergency Contact
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Pooja Verma (Spouse)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Relation: Next of Kin</p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="tel:9876543210"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call +91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>

        {/* Assigned Trauma Care Center */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Assigned Emergency Center
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Apollo City Hospital Trauma Care</h3>
            <p className="text-xs text-slate-500 mt-0.5">Rapid Response Unit #04 &bull; 2.4 km away</p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="tel:108"
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Call Paramedic (108)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Incident Log History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Emergency Incident History</h3>
            <p className="text-xs text-slate-400">All registered SOS events and dispatch resolutions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {alerts.length} incidents
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
            Loading incident logs...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="text-sm font-bold text-slate-700">No emergency incidents recorded</p>
            <p className="text-slate-400 mt-0.5">Your vital telemetry is routinely stable.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.status === 'TRIGGERED'
                        ? 'bg-red-50 text-red-600 animate-pulse'
                        : item.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        SOS Distress Signal #{item._id.substring(item._id.length - 6).toUpperCase()}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'TRIGGERED'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : item.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {item.doctorId && (
                        <span>Attending: {item.doctorId.name}</span>
                      )}
                    </div>

                    {item.doctorNotes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl mt-2">
                        Resolution Notes: {item.doctorNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-700">
                    HR {item.healthData?.heartRate || 118} BPM &bull; SpO2 {item.healthData?.spo2 || 91}%
                  </div>
                  <span className="text-[11px] text-slate-400">
                    BP {item.healthData?.bloodPressure?.systolic || 150}/{item.healthData?.bloodPressure?.diastolic || 95}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOSPage;
