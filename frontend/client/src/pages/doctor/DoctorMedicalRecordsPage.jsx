import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Plus,
  Calendar,
  User,
  Pill,
  Search,
  CheckCircle2,
  Clock,
  Activity,
  Trash2,
  Eye,
  Filter,
  Sparkles,
  Bot,
  ShieldCheck,
} from 'lucide-react';

const DoctorMedicalRecordsPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get('patientId') || '';

  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId);
  const [filterType, setFilterType] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Read-only AI Assistance activity for selected patient
  const [aiActivities, setAiActivities] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // New record form state
  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId,
    title: '',
    recordType: 'CONSULTATION_NOTE',
    diagnosis: '',
    notes: '',
    vitalsSummary: 'BP: 120/80 mmHg, HR: 72 BPM, SpO2: 98%',
    followUpDate: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [patientsRes, recordsRes] = await Promise.all([
        API.get('/doctors/patients'),
        API.get(selectedPatientId ? `/medical-records?patientId=${selectedPatientId}` : '/medical-records'),
      ]);

      if (patientsRes.data?.success) {
        setPatients(patientsRes.data.patients || []);
      }
      if (recordsRes.data?.success) {
        setRecords(recordsRes.data.records || []);
      }
    } catch (err) {
      console.error('Error fetching records for doctor:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  // Fetch read-only AI activity for patient
  const fetchPatientAiActivity = async (pId) => {
    if (!pId) {
      setAiActivities([]);
      return;
    }
    try {
      setLoadingAi(true);
      const res = await API.get(`/ai-assistant/patient-activity/${pId}`);
      if (res.data?.success) {
        setAiActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching patient AI activity:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientAiActivity(selectedPatientId);
      setFormData((prev) => ({ ...prev, patientId: selectedPatientId }));
    } else {
      setAiActivities([]);
    }
  }, [selectedPatientId]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.title) return;

    try {
      setSubmitting(true);
      const res = await API.post('/medical-records', formData);
      if (res.data?.success) {
        setShowAddModal(false);
        setFormData({
          patientId: selectedPatientId || '',
          title: '',
          recordType: 'CONSULTATION_NOTE',
          diagnosis: '',
          notes: '',
          vitalsSummary: 'BP: 120/80 mmHg, HR: 72 BPM, SpO2: 98%',
          followUpDate: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error creating record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter((rec) => {
    if (filterType !== 'ALL' && rec.recordType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 block mb-1">
            Clinical Documentation & Archives
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Patient Medical Records</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Review patient clinical dossiers, lab diagnostic reports, follow-up notes, and AI assistance indicators.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Consultation Note</span>
        </button>
      </div>

      {/* Filter and Patient Selector Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 shrink-0">Filter by Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Monitored Patients</option>
            {patients.map((p) => (
              <option key={p.user?._id || p._id} value={p.user?._id || p._id}>
                {p.user?.name || 'Patient'} ({p.user?.email || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
          {['ALL', 'CONSULTATION_NOTE', 'LAB_REPORT', 'DISCHARGE_SUMMARY'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Records List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Medical Records Archive ({filteredRecords.length})
              </h3>
              <span className="text-[11px] text-slate-400">Authenticated Clinical View</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No medical records found for this selection.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100">
                          {rec.recordType?.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rec.date || rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                      {rec.diagnosis && (
                        <p className="text-xs text-slate-600 line-clamp-1">
                          <strong>Diagnosis:</strong> {rec.diagnosis}
                        </p>
                      )}
                      {rec.vitalsSummary && (
                        <p className="text-[11px] text-slate-500 font-mono">{rec.vitalsSummary}</p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): AI Assistance Activity (Read-Only Indicator) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  AI Assistance Activity
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                Read-Only
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Summary of patient self-service actions using the AI Health Assistant. Private chat conversations are strictly hidden to preserve patient confidentiality.
            </p>

            {loadingAi ? (
              <div className="py-6 text-center text-slate-400 text-xs">Loading activity indicator...</div>
            ) : aiActivities.length > 0 ? (
              <div className="space-y-2.5">
                {aiActivities.map((act) => (
                  <div
                    key={act._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700">{act.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{act.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                <Bot className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <p>
                  {selectedPatientId
                    ? 'No recent AI self-service requests for this patient.'
                    : 'Select a patient above to inspect AI assistance activity.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Dossier Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Type</span>
                <span className="font-bold text-indigo-700">
                  {selectedRecord.recordType?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedRecord.date || selectedRecord.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {selectedRecord.diagnosis && (
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">Clinical Diagnosis:</span>
                <p className="text-slate-700 leading-relaxed">{selectedRecord.diagnosis}</p>
              </div>
            )}

            {selectedRecord.vitalsSummary && (
              <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100">
                <span className="font-bold text-sky-900 block mb-1">Vitals Snapshot:</span>
                <p className="text-slate-700 font-mono">{selectedRecord.vitalsSummary}</p>
              </div>
            )}

            {selectedRecord.notes && (
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Consultation / Laboratory Notes:</span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRecord.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Record Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Patient Consultation Note"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.user?._id || p._id} value={p.user?._id || p._id}>
                    {p.user?.name || 'Patient'} ({p.user?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Note Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Cardiology Outpatient Consultation"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Record Type</label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="CONSULTATION_NOTE">Consultation Note</option>
                <option value="LAB_REPORT">Diagnostic Lab Report</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="e.g. Essential Stage 1 Hypertension"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observations & Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter clinical examination notes, diet guidance, or prescription summary..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorMedicalRecordsPage;
