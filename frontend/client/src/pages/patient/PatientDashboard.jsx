import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import HealthMetricCard from '../../components/health/HealthMetricCard';
import VitalsChart from '../../components/health/VitalsChart';
import AIRiskWidget from '../../components/health/AIRiskWidget';
import IoTDataSimulator from '../../components/health/IoTDataSimulator';
import EmergencyModal from '../../components/emergency/EmergencyModal';
import VideoConsultModal from '../../components/telemedicine/VideoConsultModal';
import {
  HeartPulse,
  Calendar,
  Pill,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Video,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [records, setRecords] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [readingsRes, riskRes, apptRes, medRes, recRes] = await Promise.all([
        API.get(`/health?timeRange=${timeRange}`),
        API.get('/health/risk-assessment'),
        API.get('/appointments'),
        API.get('/medicines'),
        API.get('/medical-records'),
      ]);

      if (readingsRes.data?.success) {
        setReadings(readingsRes.data.readings || []);
        setLatestReading(readingsRes.data.latestReading || null);
      }
      if (riskRes.data?.success) {
        setRiskAssessment(riskRes.data.assessment);
      }
      if (apptRes.data?.success) {
        setAppointments(apptRes.data.appointments || []);
      }
      if (medRes.data?.success) {
        setMedicines(medRes.data.medicines || []);
      }
      if (recRes.data?.success) {
        setRecords(recRes.data.records || []);
      }
    } catch (err) {
      console.error('Error loading patient dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const handleDataGenerated = (newReading, aiAnalysis) => {
    setLatestReading(newReading);
    setReadings((prev) => [...prev, newReading]);
    if (aiAnalysis) setRiskAssessment(aiAnalysis);
  };

  const handleTakeDose = async (medicineId) => {
    try {
      await API.post(`/medicines/${medicineId}/log`, { status: 'TAKEN', doseTime: 'Now' });
      // Refresh medicines
      const res = await API.get('/medicines');
      if (res.data?.success) setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error('Error marking dose taken:', err.message);
    }
  };

  const upcomingAppointment = appointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-100 block mb-1">
            Personal Health Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl leading-relaxed">
            Your physiological vitals and wearable telemetry are actively monitored by our clinical AI risk engine.
          </p>
        </div>

        {/* Big Emergency SOS Button */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-red-900/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-red-400 shrink-0 pulse-emergency"
        >
          <ShieldAlert className="w-5 h-5 text-white" />
          <span>Emergency SOS</span>
        </button>
      </div>

      {/* AI Health Assistant Banner Card (Requirement 10) */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-teal-50 border border-sky-100/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">AI Health Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-sky-200/70 text-sky-800 text-[10px] font-bold uppercase tracking-wider">
                Intelligent Guide
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl">
              Upload medical reports for instant parameter explanation, disease-specific diet & exercise plans, and AI health guidance.
            </p>
          </div>
        </div>

        <Link
          to="/patient/ai-assistant"
          className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Open AI Assistant</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Primary Health Vitals KPI Grid */}
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

      {/* Simulated IoT Device Stream Control (Fulfills Project Requirement) */}
      <IoTDataSimulator onDataGenerated={handleDataGenerated} />

      {/* Middle Row: Trend Charts & AI Risk Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VitalsChart
            readings={readings}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        <div>
          <AIRiskWidget assessment={riskAssessment} latestReading={latestReading} />
        </div>
      </div>

      {/* Bottom Row: Upcoming Appointments, Medicine Reminders, Recent Medical Records */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Appointments Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Next Consultation</span>
              </div>
              <Link to="/patient/appointments" className="text-xs text-sky-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            {upcomingAppointment ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      {upcomingAppointment.doctorId?.name || 'Dr. Aarav Sharma'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-800">
                      {upcomingAppointment.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    {upcomingAppointment.reason}
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {new Date(upcomingAppointment.date).toLocaleDateString()} at {upcomingAppointment.time}
                    </span>
                  </div>
                </div>

                {/* Telemedicine Consultation Button */}
                <button
                  onClick={() => {
                    setSelectedAppointment(upcomingAppointment);
                    setConsultationModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Consultation (Demo)</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <p>No upcoming appointments</p>
                <Link
                  to="/patient/appointments"
                  className="mt-2 inline-block font-bold text-sky-600 hover:underline"
                >
                  Book a Consultation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Medicine Reminders Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Today's Medicines</span>
              </div>
              <Link to="/patient/medicines" className="text-xs text-teal-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {medicines.slice(0, 3).map((med) => (
                <div
                  key={med._id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{med.medicineName}</h5>
                    <p className="text-[11px] text-slate-500">
                      {med.dosage} • {med.reminderTimes?.[0] || 'Scheduled'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTakeDose(med._id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Take</span>
                  </button>
                </div>
              ))}
              {medicines.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-xs">No active medication schedules</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Medical Records Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Clinical Records</span>
              </div>
              <Link to="/patient/records" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {records.slice(0, 3).map((rec) => (
                <div key={rec._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {rec.recordType}
                  </span>
                  <h5 className="text-xs font-bold text-slate-800 mt-0.5 truncate">{rec.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{rec.diagnosis || rec.notes}</p>
                </div>
              ))}
              {records.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-xs">No medical records archived</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Telemedicine Video Consult Modal */}
      <VideoConsultModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default PatientDashboard;
