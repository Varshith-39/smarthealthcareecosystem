import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User, ShieldAlert, Menu, X, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';
import DemoSwitcher from './DemoSwitcher';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (isDoctor) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (isAdmin) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-sky-50 text-sky-700 border-sky-200';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
              Smart Healthcare
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-600">
              Connected Telemetry
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Emergency Shortcut + Demo Switcher + Notifications + Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Quick Emergency Button for Patient */}
        {isPatient && (
          <Link
            to="/patient/emergency"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-sm group"
          >
            <ShieldAlert className="w-4 h-4 text-red-600 group-hover:animate-pulse" />
            <span>SOS Emergency</span>
          </Link>
        )}

        {/* Demo Switcher for major project demonstration */}
        <DemoSwitcher />

        {/* Notifications Bell */}
        <NotificationBell />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider border mt-0.5 inline-block ${getRoleBadge()}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate(isPatient ? '/patient/profile' : isDoctor ? '/doctor/profile' : '/admin/dashboard');
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
