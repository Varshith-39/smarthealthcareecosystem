import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  FileText,
  Plus,
  Calendar,
  User,
  Pill,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Activity,
  Trash2,
  Upload,
  FolderOpen,
} from 'lucide-react';

const MedicalRecordsPage = () => {
  const [activeTab, setActiveTab] = useState('PRESCRIPTIONS');
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Record Form State
  const [formData, setFormData] = useState({
    title: '',
    recordType: 'LAB_REPORT',
    diagnosis: '',
    notes: '',
    vitalsSummary: 'SpO2: 98%, BP: 120/80 mmHg, HR: 74 BPM',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prescRes, recRes] = await Promise.all([
        API.get('/prescriptions'),
        API.get('/medical-records'),
      ]);

      if (prescRes.data?.success) {
        setPrescriptions(prescRes.data.prescriptions || []);
      }
      if (recRes.data?.success) {
        setRecords(recRes.data.records || []);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setActionLoading(true);
      await API.post('/medical-records', formData);
      setShowUploadModal(false);
      setFormData({
        title: '',
        recordType: 'LAB_REPORT',
        diagnosis: '',
        notes: '',
        vitalsSummary: 'SpO2: 98%, BP: 120/80 mmHg, HR: 74 BPM',
      });
      fetchData();
    } catch (err) {
      console.error('Error saving record:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical document?')) return;
    try {
      await API.delete(`/medical-records/${id}`);
      fetchData();
      if (selectedItem?._id === id) setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-600 text-white shadow-md shadow-sky-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Digital Medical Records & Prescriptions
            </h1>
            <p className="text-xs text-slate-500">
              Access certified e-prescriptions, clinical notes, and diagnostic test results
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Add Medical Record</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PRESCRIPTIONS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Doctor Prescriptions</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'PRESCRIPTIONS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {prescriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'REPORTS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Diagnostic Reports & Notes</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'REPORTS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {records.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-500" />
          <p className="text-xs">Loading records...</p>
        </div>
      ) : activeTab === 'PRESCRIPTIONS' ? (
        /* Prescriptions Tab */
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No prescriptions issued yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your consultation prescriptions will appear here once finalized by your doctor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((presc) => (
                <div
                  key={presc._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          E-Prescription
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2">
                          {presc.diagnosis || 'Clinical Prescription'}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Prescribed by {presc.doctorId?.name || 'Attending Physician'}</span>
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(presc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Prescribed Medicines Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Prescribed Medications ({presc.medicines?.length || 0}):
                      </span>
                      {presc.medicines?.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{med.name}</span>
                            <span className="text-slate-500 ml-1.5 font-medium">({med.dosage})</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">{med.instructions}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 shrink-0">
                            {med.frequency}
                          </span>
                        </div>
                      ))}
                    </div>

                    {presc.generalAdvice && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/80 mt-3">
                        "{presc.generalAdvice}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItem({ type: 'PRESCRIPTION', data: presc })}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Rx</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem({ type: 'PRESCRIPTION', data: presc });
                        setTimeout(handlePrint, 300);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Reports Tab */
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No diagnostic reports uploaded</p>
              <p className="text-xs text-slate-400 mt-1">
                Upload your external laboratory test reports, scan summaries, or clinical files.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((rec) => (
                <div
                  key={rec._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                          {rec.recordType || 'REPORT'}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-2">
                          {rec.title}
                        </h3>
                        {rec.doctorId && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Added by {rec.doctorId.name}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rec.date || rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {rec.diagnosis && (
                      <div className="mt-3 text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Diagnosis: </span>
                        <span>{rec.diagnosis}</span>
                      </div>
                    )}

                    {rec.vitalsSummary && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium">
                        <span className="font-bold text-slate-700">Vitals at capture: </span>
                        {rec.vitalsSummary}
                      </div>
                    )}

                    {rec.notes && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {rec.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItem({ type: 'RECORD', data: rec })}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteRecord(rec._id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: View Full Prescription or Record */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 printable-area">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Smart Healthcare Ecosystem
                  </h3>
                  <p className="text-xs text-slate-400">Verified Clinical Document</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 print:hidden"
              >
                ✕
              </button>
            </div>

            {/* Document Content */}
            <div className="py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Patient</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedItem.data.patientId?.name || 'Rahul Verma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Attending Doctor</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedItem.data.doctorId?.name || 'Hospital Clinical Team'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Date of Issue</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(selectedItem.data.createdAt || selectedItem.data.date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Diagnosis / Title</span>
                  <span className="font-semibold text-slate-700">
                    {selectedItem.data.diagnosis || selectedItem.data.title || 'Routine Review'}
                  </span>
                </div>
              </div>

              {selectedItem.type === 'PRESCRIPTION' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Prescribed Medication & Dosage Instructions
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {selectedItem.data.medicines?.map((med, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{med.name}</span>
                          <span className="text-slate-500 ml-1">({med.dosage})</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{med.instructions}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-bold">
                          {med.frequency}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selectedItem.data.generalAdvice && (
                    <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900">
                      <span className="font-bold block mb-0.5">Physician Advice:</span>
                      {selectedItem.data.generalAdvice}
                    </div>
                  )}
                </div>
              )}

              {selectedItem.type === 'RECORD' && (
                <div className="space-y-3">
                  {selectedItem.data.vitalsSummary && (
                    <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900">
                      <span className="font-bold block mb-0.5">Telemetry & Vitals Snapshot:</span>
                      {selectedItem.data.vitalsSummary}
                    </div>
                  )}
                  {selectedItem.data.notes && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold block mb-0.5 text-slate-900">Clinical Observations:</span>
                      {selectedItem.data.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload / Create Medical Record */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add Medical Document</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadRecord} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) Report"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Record Category
                  </label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  >
                    <option value="LAB_REPORT">Lab Report</option>
                    <option value="DIAGNOSIS">Diagnosis Summary</option>
                    <option value="CONSULTATION_NOTE">Consultation Note</option>
                    <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Diagnosis / Key Finding
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Normal Platelets, Mild Anemia"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vitals at Capture
                </label>
                <input
                  type="text"
                  placeholder="SpO2: 98%, BP: 120/80 mmHg, HR: 74 BPM"
                  value={formData.vitalsSummary}
                  onChange={(e) => setFormData({ ...formData, vitalsSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Observations & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of laboratory investigation, reference ranges, and doctor observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
                >
                  {actionLoading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
