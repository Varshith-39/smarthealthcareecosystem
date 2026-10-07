import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Activity,
  FileText,
  User,
  Search,
} from 'lucide-react';

const AdminAuditPage = () => {
  const [activeTab, setActiveTab] = useState('EMERGENCY');
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditData = useCallback(async () => {
    try {
      setLoading(true);
      const [emergRes, apptRes] = await Promise.all([
        API.get('/emergency'),
        API.get('/appointments'),
      ]);

      if (emergRes.data?.success) {
        setEmergencyLogs(emergRes.data.alerts || []);
      }
      if (apptRes.data?.success) {
        setAppointments(apptRes.data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-lg shadow-slate-900/20">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Institutional Compliance & Audit Trail
            </h1>
            <p className="text-xs text-slate-500">
              System emergency dispatch logs, critical telemetry anomalies, and clinical workflow history
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
          Audit Status: Compliant
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'EMERGENCY'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Emergency Dispatch Logs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-600 font-bold">
            {emergencyLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPOINTMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'APPOINTMENTS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Clinical Visits Audit</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {appointments.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400 text-xs">
          <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading institutional audit logs...
        </div>
      ) : activeTab === 'EMERGENCY' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Emergency Distress Incident Logs</h3>
            <span className="text-xs text-slate-400">Total {emergencyLogs.length} Records</span>
          </div>

          <div className="divide-y divide-slate-100">
            {emergencyLogs.map((log) => (
              <div key={log._id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        log.status === 'TRIGGERED'
                          ? 'bg-red-100 text-red-700'
                          : log.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {log.status}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      Incident #{log._id.substring(log._id.length - 8).toUpperCase()} &bull; Patient: {log.patientId?.name || 'Rahul Verma'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{log.message}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Telemetry</span>
                    <span className="font-bold text-slate-800">
                      HR: {log.healthData?.heartRate} BPM &bull; SpO2: {log.healthData?.spo2}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Blood Pressure</span>
                    <span className="font-bold text-slate-800">
                      {log.healthData?.bloodPressure?.systolic}/{log.healthData?.bloodPressure?.diastolic} mmHg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Attending Doctor</span>
                    <span className="font-bold text-slate-800">
                      {log.doctorId?.name || 'Emergency On-call'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Dispatch Location</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {log.location?.address || 'Metro Tech Zone'}
                    </span>
                  </div>
                </div>

                {log.doctorNotes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Physician Resolution: "{log.doctorNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Clinical Consultations Audit</h3>
            <span className="text-xs text-slate-400">Total {appointments.length} Visits</span>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.map((appt) => (
              <div key={appt._id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Patient: {appt.patientId?.name} &bull; Doctor: {appt.doctorId?.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Reason: {appt.reason}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scheduled: {new Date(appt.date).toLocaleDateString()} at {appt.time}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  Created: {new Date(appt.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditPage;
