import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Clock, Stethoscope, Building, Plus, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/appointments');
      if (res.data?.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      setCancellingId(appointmentId);
      const res = await API.put(`/appointments/${appointmentId}/status`, { status: 'CANCELLED' });
      if (res.data?.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === appointmentId ? { ...a, status: 'CANCELLED' } : a))
        );
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'PENDING';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    if (filter === 'CANCELLED') return a.status === 'CANCELLED';
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Consultations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled visits, request new consultations, and view clinical statuses
          </p>
        </div>

        <Link
          to="/patient/doctors"
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All Consultations' },
          { id: 'UPCOMING', label: 'Upcoming & Pending' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.map((appt) => (
          <div
            key={appt._id}
            className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor Header & Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 font-black text-sm flex items-center justify-center border border-teal-100">
                    {appt.doctorId?.name ? appt.doctorId.name.charAt(3) : 'D'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {appt.doctorId?.name || 'Dr. Specialist'}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{appt.doctorId?.email}</p>
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

              {/* Consultation Timing & Reason */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> Date:
                  </span>
                  <span>{new Date(appt.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Time:
                  </span>
                  <span>{appt.time}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Reason for Visit:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{appt.reason}</p>
                </div>

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

            {/* Actions: Cancel if active */}
            {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => handleCancel(appt._id)}
                  disabled={cancellingId === appt._id}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                >
                  {cancellingId === appt._id ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredAppointments.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No appointments found under this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
