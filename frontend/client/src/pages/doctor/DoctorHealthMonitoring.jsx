import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import HealthMetricCard from '../../components/health/HealthMetricCard';
import VitalsChart from '../../components/health/VitalsChart';
import AIRiskWidget from '../../components/health/AIRiskWidget';
import IoTDataSimulator from '../../components/health/IoTDataSimulator';
import RiskBadge from '../../components/common/RiskBadge';
import {
  HeartPulse,
  Users,
  Search,
  Activity,
  History,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const DoctorHealthMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [readings, setReadings] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  // Fetch doctors' patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get('/doctors/patients/all');
        if (res.data?.success) {
          const list = res.data.patients || [];
          setPatients(list);
          if (list.length > 0 && !selectedPatientId) {
            setSelectedPatientId(list[0].user?._id || list[0].user);
          }
        }
      } catch (err) {
        console.error('Error fetching patients for monitoring:', err.message);
      }
    };
    fetchPatients();
  }, []);

  // Fetch selected patient's telemetry dossier
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchDossier = async () => {
      try {
        setLoading(true);
        const [dossierRes, readingsRes] = await Promise.all([
          API.get(`/doctors/patient/${selectedPatientId}`),
          API.get(`/health?patientId=${selectedPatientId}&timeRange=${timeRange}`),
        ]);

        if (dossierRes.data?.success) {
          setPatientData(dossierRes.data.patient);
        }
        if (readingsRes.data?.success) {
          setReadings(readingsRes.data.readings || []);
        }
      } catch (err) {
        console.error('Error fetching patient dossier:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [selectedPatientId, timeRange]);

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Patient Telemetry & Remote Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric surveillance, abnormal vital sign warnings, and AI risk calculations
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <Users className="w-4 h-4 text-teal-600 ml-2 shrink-0" />
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none bg-transparent"
          >
            {patients.map((p) => (
              <option key={p.user?._id} value={p.user?._id}>
                {p.user?.name} ({p.age} yrs • {p.latestReading?.riskLevel || 'LOW'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Patient Bio Header Card */}
      {patientData && (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white font-black text-xl flex items-center justify-center shadow-md">
              {patientData.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">{patientData.name}</h2>
                <RiskBadge
                  level={latestReading?.riskLevel || 'LOW'}
                  score={latestReading?.riskScore}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patientData.age} yrs • Blood Group: {patientData.profile?.bloodGroup || 'O+'} • Phone: {patientData.phone || 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Known Conditions: {patientData.profile?.medicalConditions?.join(', ') || 'None reported'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium text-slate-600">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency Contact</span>
              <span className="font-bold text-slate-800">
                {patientData.profile?.emergencyContact?.name} ({patientData.profile?.emergencyContact?.phone})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Vitals Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <HealthMetricCard
          title="Heart Rate"
          value={latestReading?.heartRate ?? 72}
          unit="BPM"
          status={
            (latestReading?.heartRate ?? 72) > 100
              ? 'Elevated'
              : (latestReading?.heartRate ?? 72) < 55
              ? 'Low'
              : 'Normal'
          }
          iconType="heart"
          range="60 - 100"
        />

        <HealthMetricCard
          title="Blood Pressure"
          value={`${latestReading?.bloodPressure?.systolic ?? 120}/${latestReading?.bloodPressure?.diastolic ?? 80}`}
          unit="mmHg"
          status={
            (latestReading?.bloodPressure?.systolic ?? 120) >= 140
              ? 'Elevated'
              : 'Normal'
          }
          iconType="bp"
          range="< 120/80"
        />

        <HealthMetricCard
          title="Oxygen (SpO2)"
          value={latestReading?.spo2 ?? 98}
          unit="%"
          status={(latestReading?.spo2 ?? 98) < 95 ? 'Low' : 'Normal'}
          iconType="spo2"
          range="95 - 100%"
        />

        <HealthMetricCard
          title="Temperature"
          value={latestReading?.temperature ? Number(latestReading.temperature).toFixed(1) : '36.7'}
          unit="°C"
          status={(latestReading?.temperature ?? 36.7) > 37.5 ? 'Fever' : 'Normal'}
          iconType="temp"
          range="36.5 - 37.5"
        />

        <HealthMetricCard
          title="Blood Glucose"
          value={latestReading?.glucose ?? 95}
          unit="mg/dL"
          status={(latestReading?.glucose ?? 95) > 140 ? 'High' : 'Normal'}
          iconType="glucose"
          range="70 - 120"
        />

        <HealthMetricCard
          title="Daily Steps"
          value={latestReading?.steps ?? 5200}
          unit="steps"
          status="Active"
          iconType="steps"
          range="Target: 8,000"
        />
      </div>

      {/* Simulated IoT Stream for Testing Patient Telemetry */}
      {selectedPatientId && (
        <IoTDataSimulator
          patientId={selectedPatientId}
          onDataGenerated={(newReading) => setReadings((prev) => [...prev, newReading])}
        />
      )}

      {/* Vitals Trend Chart & AI Risk Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VitalsChart
            readings={readings}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div>
          <AIRiskWidget latestReading={latestReading} />
        </div>
      </div>

      {/* Historical Telemetry Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Patient Telemetry Stream History</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{readings.length} records</span>
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
                <th className="pb-3">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {readings.slice(-10).reverse().map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-600">
                    {new Date(r.timestamp).toLocaleDateString()} {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-bold text-slate-800">{r.heartRate} BPM</td>
                  <td className="py-3 font-semibold text-slate-700">
                    {r.bloodPressure?.systolic}/{r.bloodPressure?.diastolic} mmHg
                  </td>
                  <td className="py-3 font-bold text-teal-700">{r.spo2}%</td>
                  <td className="py-3 text-slate-600">{Number(r.temperature).toFixed(1)}°C</td>
                  <td className="py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border">
                      {r.source === 'SIMULATED_IOT' ? 'IoT Wearable' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-3">
                    <RiskBadge level={r.riskLevel} score={r.riskScore} size="sm" />
                  </td>
                  <td className="py-3 text-slate-500 text-[11px] truncate max-w-xs">
                    {r.notes || '—'}
                  </td>
                </tr>
              ))}

              {readings.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                    No readings recorded for this patient.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorHealthMonitoring;
