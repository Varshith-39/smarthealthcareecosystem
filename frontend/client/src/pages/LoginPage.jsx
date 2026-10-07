import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, UserCheck, Stethoscope, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If role passed in query string (e.g. ?role=DOCTOR)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['PATIENT', 'DOCTOR', 'ADMIN'].includes(roleParam.toUpperCase())) {
      setRole(roleParam.toUpperCase());
    }
  }, [location.search]);

  // If already authenticated, redirect to proper dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'PATIENT') navigate('/patient/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password, role);
      if (loggedUser.role === 'PATIENT') navigate('/patient/dashboard');
      else if (loggedUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fill Demo Credentials
  const fillDemoCredentials = (demoRole, demoEmail, demoPass) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 medical-hero-gradient">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">
              Smart Healthcare
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your connected healthcare dashboard</p>
        </div>

        {/* Demo Quick-Fill Credentials Card (Crucial for Evaluation!) */}
        <div className="mb-5 p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>College Evaluation: 1-Click Demo Login</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('PATIENT', 'patient@example.com', 'Patient@123')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-sky-200 text-[11px] font-bold text-sky-700 hover:bg-sky-100/50 flex flex-col items-center gap-0.5 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('DOCTOR', 'doctor@example.com', 'Doctor@123')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-teal-200 text-[11px] font-bold text-teal-700 hover:bg-teal-100/50 flex flex-col items-center gap-0.5 transition-all shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('ADMIN', 'admin@example.com', 'Admin@123')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-purple-200 text-[11px] font-bold text-purple-700 hover:bg-purple-100/50 flex flex-col items-center gap-0.5 transition-all shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Main Auth Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Tab Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Login Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['PATIENT', 'DOCTOR', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      role === r
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Registration */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
