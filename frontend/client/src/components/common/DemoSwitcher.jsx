import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Stethoscope, Shield, ArrowRightLeft, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoSwitcher = () => {
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: 'PATIENT',
      name: 'Rahul Verma',
      email: 'patient@example.com',
      password: 'Patient@123',
      badge: 'Patient Mode',
      icon: UserCheck,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      redirect: '/patient/dashboard',
    },
    {
      role: 'DOCTOR',
      name: 'Dr. Aarav Sharma',
      email: 'doctor@example.com',
      password: 'Doctor@123',
      badge: 'Doctor Mode',
      icon: Stethoscope,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      redirect: '/doctor/dashboard',
    },
    {
      role: 'ADMIN',
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      badge: 'Admin Mode',
      icon: Shield,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      redirect: '/admin/dashboard',
    },
  ];

  const handleQuickSwitch = async (account) => {
    try {
      setLoadingRole(account.role);
      await login(account.email, account.password, account.role);
      setIsOpen(false);
      navigate(account.redirect);
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500/10 to-teal-500/10 hover:from-sky-500/20 hover:to-teal-500/20 text-slate-700 border border-sky-200 transition-all shadow-sm"
        title="1-Click Role Switcher for Project Evaluation"
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
        <span className="hidden sm:inline">Demo Switcher:</span>
        <span className="font-bold text-sky-700">{user?.role || 'Guest'}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">College Demo Fast Switch</p>
            <p className="text-xs text-slate-500">Switch roles instantly to test patient-doctor workflows</p>
          </div>
          <div className="space-y-1">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isCurrent = user?.role === acc.role;
              return (
                <button
                  key={acc.role}
                  disabled={loadingRole !== null}
                  onClick={() => handleQuickSwitch(acc)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    isCurrent
                      ? 'bg-slate-100 font-semibold text-slate-900 cursor-default'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg border ${acc.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{acc.name}</p>
                      <p className="text-[11px] text-slate-400">{acc.badge}</p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : loadingRole === acc.role ? (
                    <span className="text-[10px] text-sky-600 animate-pulse">Switching...</span>
                  ) : (
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoSwitcher;
