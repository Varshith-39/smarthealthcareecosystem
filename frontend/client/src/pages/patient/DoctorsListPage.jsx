import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Stethoscope,
  Search,
  Building,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  ChevronRight,
  User,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorsListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  // Doctor Details Modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('General Health Consultation');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const navigate = useNavigate();

  // Specialization filter tags
  const specializations = [
    'All',
    'Cardiologist',
    'Endocrinologist & Diabetologist',
    'Pulmonologist & Critical Care',
    'General Physician',
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:30 PM',
    '04:30 PM',
  ];

  // Set default appointment date to tomorrow
  useEffect(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors');
      if (res.data?.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const nameMatch = doc.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      doc.hospital?.toLowerCase().includes(searchQuery.toLowerCase());
    const specMatch =
      selectedSpecialization === 'All' ||
      doc.specialization?.toLowerCase().includes(selectedSpecialization.toLowerCase());
    return nameMatch && specMatch;
  });

  const handleOpenBooking = (doc) => {
    setBookingDoctor(doc);
    setBookingSuccess(false);
    setIsBookingModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await API.post('/appointments', {
        doctorId: bookingDoctor.user?._id || bookingDoctor.user,
        date: appointmentDate,
        time: appointmentTime,
        reason: appointmentReason,
      });

      if (res.data?.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setIsBookingModalOpen(false);
          navigate('/patient/appointments');
        }, 1800);
      }
    } catch (err) {
      console.error('Error booking appointment:', err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Find Healthcare Specialists</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with verified doctors, review clinical credentials, and book appointments
          </p>
        </div>
      </div>

      {/* Search & Specialization Filters */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-card space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, medical specialization, or hospital..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSpecialization === spec
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor Avatar & Basic Info */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                  {doc.user?.name ? doc.user.name.charAt(3) || doc.user.name.charAt(0) : 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {doc.user?.name || 'Dr. Specialist'}
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {doc.specialization}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doc.rating || 4.8} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Clinic / Hospital & Experience Details */}
              <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.hospital}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Award className="w-4 h-4 text-slate-400" />
                    Experience:
                  </span>
                  <span className="font-bold text-slate-800">{doc.experienceYears} Years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Consultation Fee:
                  </span>
                  <span className="font-bold text-emerald-600">₹{doc.consultationFee}</span>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                {doc.about || 'Specialist dedicated to comprehensive patient-centered care and telemetry monitoring.'}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedDoctor(doc);
                  setIsProfileModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors text-center"
              >
                View Profile
              </button>
              <button
                onClick={() => handleOpenBooking(doc)}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all text-center"
              >
                Book Visit
              </button>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No doctors found matching criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialization('All');
              }}
              className="mt-2 text-xs text-sky-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title={`Physician Profile: ${selectedDoctor.user?.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
              <h4 className="font-bold text-teal-900 text-sm">{selectedDoctor.user?.name}</h4>
              <p className="text-teal-700 font-semibold">{selectedDoctor.specialization}</p>
              <p className="text-slate-600 mt-1">License: {selectedDoctor.licenseNumber}</p>
              <p className="text-slate-600">Hospital: {selectedDoctor.hospital}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">About Clinical Practice:</span>
              <p className="text-slate-600 leading-relaxed">{selectedDoctor.about}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Available Days:</span>
                <span className="font-bold text-slate-800">{selectedDoctor.availableDays?.join(', ') || 'Mon - Fri'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Working Hours:</span>
                <span className="font-bold text-slate-800">
                  {selectedDoctor.availableHours?.start || '09:00 AM'} - {selectedDoctor.availableHours?.end || '05:00 PM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-emerald-600">₹{selectedDoctor.consultationFee}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  handleOpenBooking(selectedDoctor);
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-500"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Appointment Booking Modal */}
      {bookingDoctor && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={`Book Consultation with ${bookingDoctor.user?.name}`}
          maxWidth="max-w-md"
        >
          {bookingSuccess ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Appointment Request Dispatched!</h4>
              <p className="text-xs text-slate-500">
                Your consultation request has been submitted to Dr. {bookingDoctor.user?.name}. Redirecting to your appointments...
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{bookingDoctor.user?.name}</h4>
                  <p className="text-[11px] text-teal-700 font-medium">{bookingDoctor.specialization}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">₹{bookingDoctor.consultationFee}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Select Available Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAppointmentTime(slot)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        appointmentTime === slot
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reason for Consultation / Symptoms
                </label>
                <textarea
                  rows={2}
                  required
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  placeholder="e.g. Routine hypertension follow-up, reviewing SpO2 telemetry readings..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/25 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default DoctorsListPage;
