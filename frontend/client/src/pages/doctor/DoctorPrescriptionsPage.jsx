import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  Pill,
  Plus,
  Calendar,
  User,
  Search,
  CheckCircle2,
  Printer,
  Eye,
  Activity,
  Trash2,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

const DoctorPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPresc, setSelectedPresc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successBanner, setSuccessBanner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    generalAdvice: 'Take medications regularly after meals. Maintain hydration and report any acute changes.',
    followUpDate: '',
    autoScheduleReminders: true,
    medicines: [
      { name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily', instructions: 'After food' },
    ],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prescRes, patientsRes] = await Promise.all([
        API.get('/prescriptions'),
        API.get('/patients'),
      ]);

      if (prescRes.data?.success) {
        setPrescriptions(prescRes.data.prescriptions || []);
      }
      if (patientsRes.data?.success) {
        const pList = patientsRes.data.patients || [];
        setPatients(pList);
        if (pList.length > 0 && !formData.patientId) {
          setFormData((prev) => ({ ...prev, patientId: pList[0].user?._id || pList[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching prescriptions data:', err);
    } finally {
      setLoading(false);
    }
  }, [formData.patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMedicineRow = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        { name: '', dosage: '500 mg', frequency: 'Once daily', instructions: 'Take with water' },
      ],
    });
  };

  const handleRemoveMedicineRow = (idx) => {
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((_, i) => i !== idx),
    });
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...formData.medicines];
    updated[idx][field] = value;
    setFormData({ ...formData, medicines: updated });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!formData.patientId || formData.medicines.length === 0) return;

    try {
      setActionLoading(true);
      const res = await API.post('/prescriptions', formData);
      if (res.data?.success) {
        setShowModal(false);
        setSuccessBanner('Prescription created and dispatched to patient with reminder alerts!');
        setTimeout(() => setSuccessBanner(null), 5000);
        fetchData();
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl shadow-emerald-600/20">
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Prescriptions & Pharmacotherapy
            </h1>
            <p className="text-xs text-slate-500">
              Generate certified digital Rx with automatic patient medicine schedule integration
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write Prescription</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search prescriptions by patient name or diagnosis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs focus:outline-none bg-transparent font-medium"
        />
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400 text-xs">
          <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
          Loading issued prescriptions...
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No prescriptions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Write Prescription" to create your first digital prescription for a patient.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrescriptions.map((presc) => (
            <div
              key={presc._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Issued Rx
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {presc.patientId?.name || 'Patient'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Diagnosis: <span className="font-semibold text-slate-700">{presc.diagnosis || 'Clinical Review'}</span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(presc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Prescribed Items ({presc.medicines?.length || 0}):
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

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPresc(presc)}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPresc(presc);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Rx</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Write New Prescription */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Write Digital Prescription</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Patient *
                  </label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  >
                    {patients.map((p) => (
                      <option key={p.user?._id || p._id} value={p.user?._id || p._id}>
                        {p.user?.name || 'Patient'} ({p.bloodGroup || 'O+'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Diagnosis *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Medicine Rows */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Prescribed Medications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="500 mg"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white font-medium"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white font-medium"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Thrice daily">Thrice daily</option>
                          <option value="As needed (SOS)">As needed (SOS)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="After food"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none bg-white"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        {formData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  General Advice & Lifestyle Guidelines
                </label>
                <textarea
                  rows={2}
                  value={formData.generalAdvice}
                  onChange={(e) => setFormData({ ...formData, generalAdvice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                />
              </div>

              {/* Auto Schedule Reminders Checkbox */}
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="autoReminders"
                  checked={formData.autoScheduleReminders}
                  onChange={(e) =>
                    setFormData({ ...formData, autoScheduleReminders: e.target.checked })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <label htmlFor="autoReminders" className="text-xs text-teal-900 font-bold cursor-pointer">
                  Auto-schedule Medicine Reminders in Patient's Portal with push alerts
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
                >
                  {actionLoading ? 'Issuing...' : 'Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details and Print */}
      {selectedPresc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 printable-area">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black">
                  Rx
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Smart Healthcare Ecosystem
                  </h3>
                  <p className="text-xs text-slate-400">Certified Medical Prescription</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPresc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 print:hidden"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Patient Name</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedPresc.patientId?.name || 'Rahul Verma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Prescribing Physician</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {selectedPresc.doctorId?.name || 'Dr. Aarav Sharma'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Date of Issue</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(selectedPresc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Diagnosis</span>
                  <span className="font-semibold text-slate-700">
                    {selectedPresc.diagnosis || 'Clinical Consultation'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Prescribed Medications
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedPresc.medicines?.map((med, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-slate-500 ml-1">({med.dosage})</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{med.instructions}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-bold">
                        {med.frequency}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedPresc.generalAdvice && (
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Physician Advice:</span>
                    {selectedPresc.generalAdvice}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedPresc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsPage;
