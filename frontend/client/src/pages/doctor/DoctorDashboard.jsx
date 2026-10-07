import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import StatCard from '../../components/common/StatCard';
import RiskBadge from '../../components/common/RiskBadge';
import Modal from '../../components/common/Modal';
import {
  Users,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Search,
  Eye,
  Activity,
  HeartPulse,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Bot,
  Loader2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // View Patient Drawer/Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // AI Clinical Decision Support State
  const [aiClinicalLoading, setAiClinicalLoading] = useState(false);
  const [aiClinicalSummary, setAiClinicalSummary] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const [patientsRes, apptsRes, alertsRes] = await Promise.all([
          API.get('/doctors/patients/all'),
          API.get('/appointments'),
          API.get('/emergency'),
        ]);

        if (patientsRes.data?.success) {
          setPatients(patientsRes.data.patients || []);
        }
        if (apptsRes.data?.success) {
          setAppointments(apptsRes.data.appointments || []);
        }
        if (alertsRes.data?.success) {
          setEmergencyAlerts(alertsRes.data.alerts || []);
        }
      } catch (err) {
        console.error('Error fetching doctor dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Filtered Patients
  const filteredPatients = patients.filter((p) => {
    const nameMatch = p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const riskMatch = riskFilter === 'ALL' || p.latestReading?.riskLevel === riskFilter;
    return nameMatch && riskMatch;
  });

  // KPI Calculations
  const totalPatientsCount = patients.length;
  const todayAppointmentsCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
  const highRiskCount = patients.filter(
    (p) => p.latestReading?.riskLevel === 'HIGH' || p.latestReading?.riskLevel === 'CRITICAL'
  ).length;
  const activeAlertsCount = emergencyAlerts.filter((a) => a.status === 'TRIGGERED').length;

  // Chart: Risk breakdown data
  const riskDistributionData = [
    { name: 'Low Risk', value: patients.filter((p) => p.latestReading?.riskLevel === 'LOW').length, color: '#10b981' },
    { name: 'Medium Risk', value: patients.filter((p) => p.latestReading?.riskLevel === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'High Risk', value: patients.filter((p) => p.latestReading?.riskLevel === 'HIGH').length, color: '#f43f5e' },
    { name: 'Critical', value: patients.filter((p) => p.latestReading?.riskLevel === 'CRITICAL').length, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  // Fallback for chart if empty
  const chartRiskData = riskDistributionData.length > 0 ? riskDistributionData : [
    { name: 'Low Risk', value: 3, color: '#10b981' },
    { name: 'Medium Risk', value: 1, color: '#f59e0b' },
    { name: 'High Risk', value: 1, color: '#f43f5e' },
  ];

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setAiClinicalSummary(null);
    setCopiedSummary(false);
    setIsPatientModalOpen(true);
  };

  const handleGenerateAiSummary = async (patient) => {
    const targetPatient = patient || selectedPatient;
    if (!targetPatient) return;
    try {
      setAiClinicalLoading(true);
      setAiClinicalSummary(null);
      setCopiedSummary(false);
      const res = await API.post('/ai/doctor-clinical-summary', {
        patientName: targetPatient.user?.name,
        age: targetPatient.age,
        gender: targetPatient.gender,
        bloodGroup: targetPatient.bloodGroup,
        vitals: {
          systolicBP: targetPatient.latestReading?.bloodPressure?.systolic || 120,
          diastolicBP: targetPatient.latestReading?.bloodPressure?.diastolic || 80,
          heartRate: targetPatient.latestReading?.heartRate || 72,
          spo2: targetPatient.latestReading?.spo2 || 98,
          bloodGlucose: targetPatient.latestReading?.bloodGlucose || 110,
          temperature: targetPatient.latestReading?.temperature || 36.8,
        },
        conditions: targetPatient.medicalConditions || [],
        allergies: targetPatient.allergies || [],
        riskLevel: targetPatient.latestReading?.riskLevel || 'MODERATE',
      });
      if (res.data?.success) {
        setAiClinicalSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error('Error generating AI clinical summary:', err);
    } finally {
      setAiClinicalLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (aiClinicalSummary) {
      navigator.clipboard.writeText(aiClinicalSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-100 block mb-1">
            Clinical Telemetry & Practice Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Dr. {user?.name || 'Physician'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-xl leading-relaxed">
            Monitor real-time patient telemetry, review abnormal biometric signals, and coordinate medical care.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-semibold">
          <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>Patient Surveillance: Active</span>
        </div>
      </div>

      {/* KPI Cards: Total Patients, Today's Appointments, High Risk Patients, Emergency Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monitored Patients"
          value={totalPatientsCount}
          subtitle="Enrolled in telemetry ecosystem"
          icon={Users}
          color="teal"
          trend={{ isPositive: true, text: 'Active surveillance' }}
        />

        <StatCard
          title="Scheduled Consultations"
          value={todayAppointmentsCount}
          subtitle="Upcoming & pending review"
          icon={Calendar}
          color="sky"
          trend={{ isPositive: true, text: 'Daily schedule' }}
        />

        <StatCard
          title="High-Risk Patients"
          value={highRiskCount}
          subtitle="Elevated clinical risk score"
          icon={AlertTriangle}
          color="amber"
          trend={{ isPositive: false, text: 'Requires observation' }}
        />

        <StatCard
          title="Emergency Alerts"
          value={activeAlertsCount}
          subtitle="Active distress signals"
          icon={ShieldAlert}
          color="rose"
          trend={{ isPositive: false, text: activeAlertsCount > 0 ? 'Urgent attention!' : 'All clear' }}
        />
      </div>

      {/* Middle Row: Analytics / Chart Placeholder & Today's Appointments Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Patient Risk Stratification</h3>
            <p className="text-xs text-slate-400">AI Risk Index Distribution</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Appointments Quick View */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Upcoming Appointments</h3>
                <p className="text-xs text-slate-400">Patient consultation schedule</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                {appointments.length} total
              </span>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div
                  key={appt._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                      {appt.patientId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{appt.patientId?.name || 'Patient'}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{appt.reason}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 block">
                      {new Date(appt.date).toLocaleDateString()} • {appt.time}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1 inline-block">
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}

              {appointments.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs">No appointments scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Patient Monitoring Table (Crucial Requirement) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Patient Telemetry Surveillance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live biometric readings and automated AI risk indicators across your patient cohort
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Risk Tier Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Patient Name</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Heart Rate</th>
                <th className="pb-3">Blood Pressure</th>
                <th className="pb-3">SpO2</th>
                <th className="pb-3">Risk Level</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((patient) => {
                const reading = patient.latestReading || {};
                return (
                  <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center border border-teal-100">
                          {patient.user?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.user?.name}</p>
                          <p className="text-[11px] text-slate-400">{patient.bloodGroup || 'O+'} • {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-700">{patient.age} yrs</td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {reading.heartRate ? `${reading.heartRate} BPM` : '72 BPM'}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      {reading.bloodPressure
                        ? `${reading.bloodPressure.systolic}/${reading.bloodPressure.diastolic}`
                        : '120/80'}
                    </td>
                    <td className="py-3.5 font-bold text-teal-700">
                      {reading.spo2 ? `${reading.spo2}%` : '98%'}
                    </td>
                    <td className="py-3.5">
                      <RiskBadge level={reading.riskLevel || 'LOW'} score={reading.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {reading.timestamp ? new Date(reading.timestamp).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          handleViewPatient(patient);
                          handleGenerateAiSummary(patient);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        title="Generate AI Clinical Case Analysis"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>AI Insights</span>
                      </button>
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                    No patients matching the criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Patient Details Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
          title={`Patient Clinical Dossier: ${selectedPatient.user?.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Gender</span>
                <span className="font-bold text-slate-800">{selectedPatient.age} yrs • {selectedPatient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Blood Group</span>
                <span className="font-bold text-slate-800">{selectedPatient.bloodGroup || 'O+'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone</span>
                <span className="font-bold text-slate-800">{selectedPatient.user?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Risk Level</span>
                <RiskBadge level={selectedPatient.latestReading?.riskLevel} score={selectedPatient.latestReading?.riskScore} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Medical Conditions:</span>
                <p className="text-slate-600">
                  {selectedPatient.medicalConditions?.length ? selectedPatient.medicalConditions.join(', ') : 'None reported'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Allergies:</span>
                <p className="text-slate-600">
                  {selectedPatient.allergies?.length ? selectedPatient.allergies.join(', ') : 'None known'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100">
              <span className="font-bold text-sky-900 block mb-1.5">Latest Vitals Telemetry:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div>HR: <strong>{selectedPatient.latestReading?.heartRate || 72} BPM</strong></div>
                <div>BP: <strong>{selectedPatient.latestReading?.bloodPressure?.systolic || 120}/{selectedPatient.latestReading?.bloodPressure?.diastolic || 80}</strong></div>
                <div>SpO2: <strong>{selectedPatient.latestReading?.spo2 || 98}%</strong></div>
                <div>Temp: <strong>{selectedPatient.latestReading?.temperature || 36.7}°C</strong></div>
              </div>
            </div>

            {/* AI Decision Support Assistant */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/80 via-sky-50/50 to-teal-50/60 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">AI Clinical Decision Support</h4>
                    <p className="text-[10px] text-slate-500">Differential diagnosis & therapeutic guidance via Qwen LLM</p>
                  </div>
                </div>

                {!aiClinicalSummary && (
                  <button
                    type="button"
                    onClick={() => handleGenerateAiSummary()}
                    disabled={aiClinicalLoading}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    {aiClinicalLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating Case...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Case Evaluation</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {aiClinicalSummary && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="p-3.5 bg-white/95 rounded-xl border border-indigo-100 text-slate-700 leading-relaxed font-sans text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {aiClinicalSummary}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Engine: Qwen Clinical Microservice • Private Local Inference</span>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy to Consultation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorDashboard;
