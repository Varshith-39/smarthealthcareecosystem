import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import RiskBadge from '../../components/common/RiskBadge';
import Modal from '../../components/common/Modal';
import { Users, Search, Eye, Phone, Heart, Activity, AlertTriangle, Filter, CheckCircle2, Sparkles, Bot, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Selected Patient Details Modal & AI Activity
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiActivities, setAiActivities] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const navigate = useNavigate();

  const fetchAiActivities = async (patientId) => {
    if (!patientId) return;
    try {
      setLoadingAi(true);
      const res = await API.get(`/ai-assistant/patient-activity/${patientId}`);
      if (res.data?.success) {
        setAiActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching patient AI activities:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors/patients/all');
      if (res.data?.success) {
        setPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error('Error fetching patient directory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const nameMatch = p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase());
    const riskMatch = riskFilter === 'ALL' || p.latestReading?.riskLevel === riskFilter;
    return nameMatch && riskMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access authorized patient clinical profiles, medical history, and vital statistics
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, blood group, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Risk Tier:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Patients</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const reading = patient.latestReading || {};
          return (
            <div
              key={patient._id}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-black text-base flex items-center justify-center border border-teal-100 shadow-sm">
                      {patient.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {patient.user?.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {patient.age} yrs • {patient.gender} • Blood Group: {patient.bloodGroup || 'O+'}
                      </p>
                    </div>
                  </div>

                  <RiskBadge level={reading.riskLevel || 'LOW'} score={reading.riskScore} size="sm" />
                </div>

                {/* Vitals Summary Strip */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">HR</span>
                    <span className="font-bold text-slate-800">{reading.heartRate || 72} BPM</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BP</span>
                    <span className="font-bold text-slate-800">
                      {reading.bloodPressure?.systolic || 120}/{reading.bloodPressure?.diastolic || 80}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2</span>
                    <span className="font-bold text-teal-700">{reading.spo2 || 98}%</span>
                  </div>
                </div>

                {/* Clinical Conditions & Contacts */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <p className="line-clamp-1">
                    <strong className="text-slate-700">Conditions:</strong>{' '}
                    {patient.medicalConditions?.length ? patient.medicalConditions.join(', ') : 'None'}
                  </p>
                  <p className="line-clamp-1">
                    <strong className="text-slate-700">Allergies:</strong>{' '}
                    {patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <strong className="text-slate-700">Emergency:</strong> {patient.emergencyContact?.name} ({patient.emergencyContact?.phone})
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsModalOpen(true);
                    fetchAiActivities(patient.user?._id);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Clinical Dossier</span>
                </button>
                <button
                  onClick={() => navigate(`/doctor/records?patientId=${patient.user?._id}`)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Records</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredPatients.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No patients found</p>
          </div>
        )}
      </div>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Clinical Profile: ${selectedPatient.user?.name}`}
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
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Phone</span>
                <span className="font-bold text-slate-800">{selectedPatient.user?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Risk Status</span>
                <RiskBadge
                  level={selectedPatient.latestReading?.riskLevel}
                  score={selectedPatient.latestReading?.riskScore}
                  size="sm"
                />
              </div>
            </div>

            <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100">
              <span className="font-bold text-sky-900 block mb-1">Residential Address:</span>
              <p className="text-slate-700">{selectedPatient.address || 'Address on clinical file'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-slate-800 block mb-1">Pre-existing Conditions:</span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedPatient.medicalConditions?.length
                    ? selectedPatient.medicalConditions.join(', ')
                    : 'No chronic conditions reported'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-bold text-slate-800 block mb-1">Documented Allergies:</span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedPatient.allergies?.length
                    ? selectedPatient.allergies.join(', ')
                    : 'No known drug or environmental allergies'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/70 rounded-2xl border border-teal-100">
              <span className="font-bold text-teal-900 block mb-1">Emergency Care Contact:</span>
              <p className="text-slate-700">
                {selectedPatient.emergencyContact?.name} ({selectedPatient.emergencyContact?.relationship}) • Phone:{' '}
                {selectedPatient.emergencyContact?.phone}
              </p>
            </div>

            {/* Read-Only AI Assistance Activity Indicator (Requirement 11) */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Assistance Activity</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Read-Only Indicator
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                High-level patient AI self-service telemetry. Private conversation contents are protected and omitted.
              </p>

              {loadingAi ? (
                <div className="text-center py-2 text-slate-400 text-xs">Loading activity...</div>
              ) : aiActivities.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {aiActivities.map((act) => (
                    <div
                      key={act._id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="font-bold text-slate-800">{act.title}</span>
                        <span className="text-slate-500 hidden sm:inline">• {act.summary}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center text-slate-400 text-[11px]">
                  No recent AI assistance requests recorded for this patient.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
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

export default MyPatientsPage;
