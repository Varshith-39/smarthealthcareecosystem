import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  HeartPulse,
  Calendar,
  Users,
  Pill,
  FileText,
  MessageSquare,
  Bell,
  AlertTriangle,
  UserCheck,
  BarChart3,
  Stethoscope,
  LogOut,
  Settings,
  ShieldCheck,
  Video,
  Bot,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'AI Health Assistant', path: '/patient/ai-assistant', icon: Bot },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Find Doctors', path: '/patient/doctors', icon: Stethoscope },
    { name: 'Medicines', path: '/patient/medicines', icon: Pill },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'Messages', path: '/patient/messages', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Emergency SOS', path: '/patient/emergency', icon: AlertTriangle, alert: true },
    { name: 'My Profile', path: '/patient/profile', icon: UserCheck },
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'My Patients', path: '/doctor/patients', icon: Users },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/doctor/records', icon: FileText },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
    { name: 'Messages', path: '/doctor/messages', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Emergency Alerts', path: '/doctor/emergency', icon: AlertTriangle, alert: true },
    { name: 'Analytics', path: '/doctor/analytics', icon: BarChart3 },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'All Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Emergency Audit', path: '/admin/emergency', icon: AlertTriangle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const links = isPatient ? patientLinks : isDoctor ? doctorLinks : adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-sm block leading-tight">
                HealthEco AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600">
                {user?.role} PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    item.alert
                      ? isActive
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200 shadow-sm'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.alert ? 'text-red-500' : ''
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.alert && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-sm mb-2">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
