import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  Brain,
  ShieldAlert,
  Pill,
  Video,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Users,
  Lock,
  Cpu,
  PhoneCall,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg block leading-none">
                Smart Healthcare
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600">
                Connected Ecosystem
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#about" className="hover:text-sky-600 transition-colors">About</a>
            <a href="#features" className="hover:text-sky-600 transition-colors">Key Features</a>
            <a href="#how-it-works" className="hover:text-sky-600 transition-colors">How It Works</a>
            <a href="#ai-monitoring" className="hover:text-sky-600 transition-colors">AI Monitoring</a>
            <a href="#emergency" className="hover:text-sky-600 transition-colors">Emergency Alerts</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/25 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 medical-hero-gradient">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Brain className="w-4 h-4 text-sky-600" />
              Next-Gen Medical Telemetry Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Smart Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">Ecosystem</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connected healthcare powered by AI, real-time monitoring and intelligent alerts. Seamlessly bridges patients, healthcare providers, and physiological telemetry into one unified clinical platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login?role=PATIENT"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
              >
                <Users className="w-4 h-4 text-sky-600" />
                <span>Patient Portal</span>
              </Link>
              <Link
                to="/login?role=DOCTOR"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Portal</span>
              </Link>
            </div>

            {/* Quick Demo Credentials Reminder Banner */}
            <div className="mt-8 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 max-w-lg mx-auto shadow-sm text-xs text-slate-600 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Demonstration Ready:</span>
              <span className="font-mono text-slate-500">patient@example.com / doctor@example.com</span>
              <Link to="/login" className="text-sky-600 font-bold hover:underline">1-Click Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">Core Ecosystem Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Comprehensive Connected Health Architecture</h2>
            <p className="text-sm text-slate-500 mt-3">
              Engineered with modern full-stack web technologies and clinical heuristic algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                color: 'sky',
                title: 'Remote Wearable Telemetry',
                desc: 'Simulated IoT biometric sensors stream Heart Rate, Blood Pressure, SpO2, and Temperature directly to MongoDB with time filtering.',
              },
              {
                icon: Brain,
                color: 'teal',
                title: 'AI Health Risk Engine',
                desc: 'Transparent explainable clinical scoring (0-100) categorizing health risk into LOW, MEDIUM, HIGH, and CRITICAL with clinical rationales.',
              },
              {
                icon: ShieldAlert,
                color: 'rose',
                title: 'Instant Emergency SOS',
                desc: 'One-click SOS alert instantly dispatches telemetry snapshot and GPS address to assigned doctors and emergency response services.',
              },
              {
                icon: Pill,
                color: 'indigo',
                title: 'Smart Medicine Reminders',
                desc: 'Dosage scheduling with real-time in-app notification triggers and medication adherence tracking visible to physicians.',
              },
              {
                icon: Video,
                color: 'emerald',
                title: 'Telemedicine Consultation',
                desc: 'Integrated virtual consultation room with live video simulator, clinical telemetry HUD, and simultaneous consultation notes.',
              },
              {
                icon: BarChart3,
                color: 'amber',
                title: 'Healthcare Analytics',
                desc: 'Recharts-driven interactive charts analyzing vital trends, risk distribution, appointment statistics, and clinical compliance.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-7 rounded-3xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center mb-5 text-sky-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 subtle-gradient">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Continuous Clinical Loop</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How The Ecosystem Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Patient vitals captured manually or streamed via simulated IoT wearable device.' },
              { step: '02', title: 'AI Risk Calculation', desc: 'Risk engine computes composite score (0-100) and detects clinical anomalies.' },
              { step: '03', title: 'Smart Notification', desc: 'WebSocket engine dispatches dual alerts to both patient and doctor in real time.' },
              { step: '04', title: 'Doctor Intervention', desc: 'Physician reviews telemetry, prescribes digital medication, or coordinates emergency care.' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card relative">
                <span className="text-3xl font-black text-slate-200 block mb-2">{s.step}</span>
                <h4 className="text-base font-bold text-slate-900 mb-1">{s.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency & AI Section Highlights */}
      <section id="emergency" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldAlert className="w-4 h-4" />
              Zero-Latency Emergency Response
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Rapid Medical Dispatch When Seconds Count
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              When a patient activates the Emergency SOS button, the system captures immediate physiological vitals (SpO2, Blood Pressure, Heart Rate), attaches location coordinates, and alerts attending physicians and designated emergency contacts.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Immediate real-time WebSocket broadcast to doctor dashboard
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Vitals snapshot archived in MongoDB emergency incident log
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Doctor acknowledgment and care coordination status tracking
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl relative">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500 text-white animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">EMERGENCY ALERT: ACTIVE</h4>
                  <p className="text-xs text-red-300">Patient: Amit Joshi (67 yrs)</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-red-950 px-2.5 py-1 rounded-lg text-red-400 font-bold border border-red-800">
                CRITICAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase block">Heart Rate</span>
                <span className="text-lg font-bold text-white">118 BPM</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase block">Blood Oxygen</span>
                <span className="text-lg font-bold text-red-400">90% SpO2</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase block">Blood Pressure</span>
                <span className="text-lg font-bold text-white">168/104 mmHg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <span className="text-slate-400 text-[10px] uppercase block">AI Risk Score</span>
                <span className="text-lg font-bold text-red-400">88 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">Smart Healthcare Ecosystem</span>
          </div>

          <p>
            Final-Year B.Tech Major Project • Built with React, Node.js, Express, MongoDB & Tailwind CSS.
          </p>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-sky-600">Sign In</Link>
            <Link to="/register" className="hover:text-sky-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
