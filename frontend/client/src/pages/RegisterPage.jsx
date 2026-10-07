import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, UserCheck, Stethoscope, Mail, Lock, Phone, User, MapPin, Calendar, Heart, Award, Building, DollarSign } from 'lucide-react';

const RegisterPage = ({ defaultRole }) => {
  const location = useLocation();
  const getInitialRole = () => {
    if (defaultRole) return defaultRole.toUpperCase();
    const params = new URLSearchParams(location.search);
    const r = params.get('role');
    if (r && ['PATIENT', 'DOCTOR'].includes(r.toUpperCase())) return r.toUpperCase();
    if (location.pathname.includes('/doctor')) return 'DOCTOR';
    return 'PATIENT';
  };

  const [role, setRole] = useState(getInitialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Shared form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient specific fields
  const [dateOfBirth, setDateOfBirth] = useState('1995-06-15');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');
  const [medicalConditions, setMedicalConditions] = useState('');

  // Doctor specific fields
  const [specialization, setSpecialization] = useState('General Physician');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [consultationFee, setConsultationFee] = useState(500);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        role,
        ...(role === 'PATIENT' && {
          dateOfBirth,
          gender,
          bloodGroup,
          address,
          emergencyContact: {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRel,
          },
          medicalConditions,
        }),
        ...(role === 'DOCTOR' && {
          specialization,
          licenseNumber,
          hospital,
          experienceYears: Number(experienceYears),
          consultationFee: Number(consultationFee),
        }),
      };

      const user = await register(payload);
      if (user.role === 'PATIENT') navigate('/patient/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 medical-hero-gradient">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">
              Smart Healthcare
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join the connected healthcare telemetry ecosystem</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'PATIENT' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Register as Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'DOCTOR' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Register as Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'DOCTOR' ? 'Dr. Sarah Jenkins' : 'John Doe'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Patient Specific Fields */}
            {role === 'PATIENT' ? (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block">
                  Patient Health Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Spouse / Parent"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRel}
                      onChange={(e) => setEmergencyRel(e.target.value)}
                      placeholder="e.g. Spouse"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Known Medical Conditions (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Hypertension, Asthma, Diabetes"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            ) : (
              /* Doctor Specific Fields */
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                  Physician Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Cardiologist, Pulmonologist"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">License / Registration No.</label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. MCI-2024-9988"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Hospital / Clinic</label>
                    <input
                      type="text"
                      required
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="e.g. Apex Health Center"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Exp. (Yrs)</label>
                      <input
                        type="number"
                        min="1"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50 mt-4 ${
                role === 'DOCTOR' ? 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/25' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/25'
              }`}
            >
              {loading ? 'Creating Profile...' : `Complete ${role === 'DOCTOR' ? 'Doctor' : 'Patient'} Registration`}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-sky-600 hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
