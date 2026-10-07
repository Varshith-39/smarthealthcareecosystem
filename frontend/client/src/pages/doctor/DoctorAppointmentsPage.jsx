import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  CheckCheck,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Complete Consultation Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/appointments');
      if (res.data?.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (apptId, status, extraData = {}) => {
    try {
      const res = await API.put(`/appointments/${apptId}/status`, {
        status,
        ...extraData,
      });

      if (res.data?.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === apptId ? res.data.appointment : a))
        );
      }
    } catch (err) {
      console.error(`Error updating appointment status to ${status}:`, err.message);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setRescheduleLoading(true);
    try {
      await handleUpdateStatus(selectedAppt._id, 'RESCHEDULED', {
        newDate,
        newTime,
      });
      setRescheduleModalOpen(false);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setCompleteLoading(true);
    try {
      await handleUpdateStatus(selectedAppt._id, 'COMPLETED', {
        doctorNotes,
      });
      setCompleteModalOpen(false);
      setDoctorNotes('');
    } finally {
      setCompleteLoading(false);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'PENDING') return a.status === 'PENDING';
    if (filter === 'CONFIRMED') return a.status === 'CONFIRMED' || a.status === 'RESCHEDULED';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'COMPLETED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'RESCHEDULED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Appointments Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review consultation requests, confirm slots, reschedule visits, and complete clinical consultations
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All Requests' },
          { id: 'PENDING', label: 'Pending Review' },
          { id: 'CONFIRMED', label: 'Confirmed Schedule' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((appt) => (
          <div
            key={appt._id}
            className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              {/* Patient Name & Status Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center border border-teal-100">
                    {appt.patientId?.name ? appt.patientId.name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {appt.patientId?.name || 'Patient'}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      Phone: {appt.patientId?.phone || 'N/A'} • {appt.patientId?.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                    appt.status
                  )}`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Consultation Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" /> Requested Date:
                  </span>
                  <span>{new Date(appt.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Time Slot:
                  </span>
                  <span>{appt.time}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Chief Complaint / Reason:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{appt.reason}</p>
                </div>

                {appt.notes && (
                  <div className="pt-1.5 text-slate-500 text-[11px]">
                    <strong>Patient Note:</strong> {appt.notes}
                  </div>
                )}

                {appt.doctorNotes && (
                  <div className="pt-2 border-t border-slate-200/60 text-teal-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider block mb-0.5">
                      Doctor Clinical Notes:
                    </span>
                    <p className="italic">{appt.doctorNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Management Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
              {appt.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(appt._id, 'CANCELLED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(appt._id, 'CONFIRMED')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Appointment</span>
                  </button>
                </>
              )}

              {(appt.status === 'CONFIRMED' || appt.status === 'RESCHEDULED') && (
                <>
                  <button
                    onClick={() => {
                      setSelectedAppt(appt);
                      setNewDate(new Date(appt.date).toISOString().split('T')[0]);
                      setNewTime(appt.time || '10:00 AM');
                      setRescheduleModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Clock3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppt(appt);
                      setCompleteModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No appointments found under this filter</p>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {selectedAppt && (
        <Modal
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title={`Reschedule Consultation: ${selectedAppt.patientId?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                New Date
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                New Time Slot
              </label>
              <input
                type="text"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rescheduleLoading}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50"
              >
                {rescheduleLoading ? 'Updating...' : 'Save Reschedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Complete Consultation Modal */}
      {selectedAppt && (
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title={`Complete Consultation for ${selectedAppt.patientId?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Doctor Consultation Summary & Clinical Advice
              </label>
              <textarea
                rows={3}
                required
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter clinical notes, diagnoses, dietary restrictions, and follow-up directives..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={completeLoading}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all disabled:opacity-50"
              >
                {completeLoading ? 'Saving...' : 'Mark Consultation Complete'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
