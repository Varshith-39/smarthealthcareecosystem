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
  User,
  Activity,
  Check,
  FileCheck,
} from 'lucide-react';

const DoctorEmergencyPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/emergency');
      if (res.data?.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching emergency alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 6000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleAcknowledge = async (id) => {
    try {
      setActionLoading(true);
      await API.put(`/emergency/${id}/acknowledge`);
      setSuccessBanner('Emergency incident acknowledged. Patient has been notified.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchAlerts();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolvingAlert) return;

    try {
      setActionLoading(true);
      await API.put(`/emergency/${resolvingAlert._id}/resolve`, {
        doctorNotes: resolutionNotes || 'Emergency intervention completed. Patient condition stabilized.',
      });
      setResolvingAlert(null);
      setResolutionNotes('');
      setSuccessBanner('Emergency incident marked as resolved.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'TRIGGERED' || a.status === 'ACKNOWLEDGED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-emerald-600/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emergency Dispatch & Critical Care Center
            </h1>
            <p className="text-xs text-slate-500">
              Real-time monitoring of patient SOS distress signals, telemetry alerts, and paramedic interventions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>{activeAlerts.length} Active Distress Calls</span>
          </span>
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Active SOS Distress Signals</span>
        </h2>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400 text-xs">
            <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
            Listening for emergency telemetry broadcasts...
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="text-sm font-bold text-slate-800">No active emergency signals</p>
            <p className="text-xs text-slate-400 mt-0.5">
              All monitored patients are operating within safe baseline telemetry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert._id}
                className="bg-white rounded-3xl border-2 border-red-500 shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl tracking-widest animate-pulse">
                  CRITICAL DISTRESS
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center font-black text-xl shrink-0">
                      {alert.patientId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {alert.patientId?.name || 'Emergency Patient'}
                        </h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{alert.location?.address || 'City Center District'}</span>
                        <span>&bull;</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals HUD */}
                  <div className="grid grid-cols-3 gap-3 bg-red-50/50 p-3.5 rounded-2xl border border-red-100 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-500 block">Heart Rate</span>
                      <span className="text-base font-black text-red-600">
                        {alert.healthData?.heartRate || 118} BPM
                      </span>
                    </div>
                    <div className="text-center border-x border-red-200/60 px-3">
                      <span className="text-[10px] font-bold text-slate-500 block">Blood Pressure</span>
                      <span className="text-base font-black text-red-600">
                        {alert.healthData?.bloodPressure?.systolic || 155}/
                        {alert.healthData?.bloodPressure?.diastolic || 98}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-500 block">SpO2 Oxygen</span>
                      <span className="text-base font-black text-amber-600">
                        {alert.healthData?.spo2 || 91}%
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
                    {alert.status === 'TRIGGERED' && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Acknowledge SOS</span>
                      </button>
                    )}

                    <button
                      onClick={() => setResolvingAlert(alert)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Resolve Alert</span>
                    </button>

                    <a
                      href={`tel:${alert.emergencyContact?.phone || '9876543210'}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Call Emergency Contact"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Incidents History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Resolved Emergency Cases Log</h3>
            <p className="text-xs text-slate-400">Institutional records of completed emergency dispatches</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {resolvedAlerts.length} resolved
          </span>
        </div>

        {resolvedAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No resolved cases logged yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resolvedAlerts.map((alert) => (
              <div
                key={alert._id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {alert.patientId?.name || 'Patient'} &bull; Case #{alert._id.substring(alert._id.length - 6).toUpperCase()}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      RESOLVED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 italic">"{alert.doctorNotes}"</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Resolved at: {new Date(alert.resolvedAt || alert.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-xs font-semibold text-slate-500 shrink-0">
                  <span>HR: {alert.healthData?.heartRate} BPM</span> &bull;{' '}
                  <span>SpO2: {alert.healthData?.spo2}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Resolve Emergency Alert */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Resolve Emergency Distress Case</h3>
              </div>
              <button
                onClick={() => setResolvingAlert(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 mt-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-bold block">Patient</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {resolvingAlert.patientId?.name || 'Patient'}
                </span>
                <span className="text-slate-500 block mt-0.5">{resolvingAlert.message}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physician Resolution Notes & Outcome *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Paramedic arrived at site. Oxygen therapy administered. Patient vitals stabilized at HR 78 BPM, SpO2 98%. Safe for discharge."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  {actionLoading ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorEmergencyPage;
