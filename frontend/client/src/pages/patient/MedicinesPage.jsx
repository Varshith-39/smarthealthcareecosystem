import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  Trash2,
  Calendar,
  AlertCircle,
  Activity,
  Heart,
  TrendingUp,
} from 'lucide-react';

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(90);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '500 mg',
    frequency: 'Twice daily',
    reminderTimes: '09:00 AM, 09:00 PM',
    instructions: 'Take with food and a glass of water',
  });

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/medicines');
      if (res.data?.success) {
        setMedicines(res.data.medicines || []);
        setAdherenceRate(res.data.adherenceRate || 92);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleLogDose = async (id, status) => {
    try {
      await API.post(`/medicines/${id}/log`, { status });
      setBannerMessage({
        type: status === 'TAKEN' ? 'success' : 'warning',
        text: `Dose recorded as ${status === 'TAKEN' ? 'Taken' : 'Missed'}!`,
      });
      setTimeout(() => setBannerMessage(null), 4000);
      fetchMedicines();
    } catch (err) {
      console.error('Error logging dose:', err);
    }
  };

  const handleTriggerDemo = async (id, medName) => {
    try {
      await API.post(`/medicines/${id}/trigger-reminder`);
      setBannerMessage({
        type: 'info',
        text: `Demo alert for "${medName}" sent to your Notification Bell!`,
      });
      setTimeout(() => setBannerMessage(null), 4000);
    } catch (err) {
      console.error('Error triggering demo reminder:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medication reminder?')) return;
    try {
      await API.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!formData.medicineName.trim()) return;

    try {
      setActionLoading(true);
      const timesArray = formData.reminderTimes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await API.post('/medicines', {
        ...formData,
        reminderTimes: timesArray.length > 0 ? timesArray : ['09:00 AM'],
      });

      setShowModal(false);
      setFormData({
        medicineName: '',
        dosage: '500 mg',
        frequency: 'Twice daily',
        reminderTimes: '09:00 AM, 09:00 PM',
        instructions: 'Take with food and a glass of water',
      });
      fetchMedicines();
    } catch (err) {
      console.error('Error adding reminder:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Message */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : bannerMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-sky-50 text-sky-800 border border-sky-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Medicines & Daily Reminders
              </h1>
              <p className="text-xs text-slate-500">
                Track prescriptions, adhere to dosage schedules, and log taken doses
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine Schedule</span>
        </button>
      </div>

      {/* Adherence Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Medication Adherence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{adherenceRate}%</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> High
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Consistency over past 30 days</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            {adherenceRate >= 80 ? '🌟' : '⚠️'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Prescriptions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{medicines.length}</span>
              <span className="text-xs text-slate-400 font-semibold">Medications</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ongoing active courses</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Next Scheduled Dose
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-indigo-600">09:00 PM</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Evening routine check</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Medication Schedule</h3>
            <p className="text-xs text-slate-400">Click to record taken doses or test reminder alerts</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {medicines.length} items
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-500" />
            <p className="text-xs">Loading medication schedule...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No active medication reminders</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first prescription schedule to begin tracking your doses
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
            >
              + Add First Schedule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {medicines.map((med) => (
              <div
                key={med._id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                        {med.medicineName}
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {med.dosage}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {med.frequency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">Instructions:</span>
                      {med.instructions || 'Take as advised by physician.'}
                    </p>

                    {/* Schedule times pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[11px] text-slate-400 font-semibold mr-1">Dose Times:</span>
                      {med.reminderTimes?.map((time, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleLogDose(med._id, 'TAKEN')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Mark this dose as taken"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Took Dose</span>
                  </button>

                  <button
                    onClick={() => handleLogDose(med._id, 'MISSED')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Mark this dose as missed"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed</span>
                  </button>

                  <button
                    onClick={() => handleTriggerDemo(med._id, med.medicineName)}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Simulate push notification reminder now"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Test Alert</span>
                  </button>

                  <button
                    onClick={() => handleDelete(med._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Medicine Schedule */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add Medicine Schedule</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Amlodipine, Amoxicillin"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg, 1 Tablet"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reminder Times (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM, 09:00 PM"
                  value={formData.reminderTimes}
                  onChange={(e) => setFormData({ ...formData, reminderTimes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Example: 08:00 AM, 02:00 PM, 08:00 PM
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take after breakfast with warm water"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                />
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
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
                >
                  {actionLoading ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicinesPage;
