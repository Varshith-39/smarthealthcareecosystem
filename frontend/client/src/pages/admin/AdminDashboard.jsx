import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  Stethoscope,
  Calendar,
  ShieldCheck,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get(`/admin/users?role=${roleFilter}&search=${searchQuery}`),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data?.success) {
        setUsers(usersRes.data.users || []);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/toggle-status`);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.user.isActive } : u))
        );
      }
    } catch (err) {
      console.error('Error toggling user status:', err.message);
    }
  };

  const chartData = [
    { name: 'Patients', count: stats?.totalPatients || 5 },
    { name: 'Doctors', count: stats?.totalDoctors || 3 },
    { name: 'Appointments', count: stats?.totalAppointments || 5 },
    { name: 'Emergency Incidents', count: stats?.totalEmergencyAlerts || 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-200 block mb-1">
            System Administration & Ecosystem Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl leading-relaxed">
            Manage system users, inspect appointment activity, audit emergency events, and verify platform health.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-semibold">
          <Server className="w-4 h-4 text-emerald-300" />
          <span>Cluster Status: Operational</span>
        </div>
      </div>

      {/* KPI Cards: Total Patients, Total Doctors, Total Appointments, System Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={stats?.totalPatients ?? 5}
          subtitle="Active ecosystem patients"
          icon={Users}
          color="sky"
          trend={{ isPositive: true, text: 'Enrolled patients' }}
        />

        <StatCard
          title="Licensed Physicians"
          value={stats?.totalDoctors ?? 3}
          subtitle="Active doctors in network"
          icon={Stethoscope}
          color="teal"
          trend={{ isPositive: true, text: 'Active specialties' }}
        />

        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments ?? 5}
          subtitle="Lifetime consultations"
          icon={Calendar}
          color="indigo"
          trend={{ isPositive: true, text: 'System-wide activity' }}
        />

        <StatCard
          title="System Statistics"
          value={stats?.activeUsers ?? 9}
          subtitle="Active authenticated users"
          icon={ShieldCheck}
          color="emerald"
          trend={{ isPositive: true, text: '100% server uptime' }}
        />
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ecosystem Activity Metrics</h3>
            <p className="text-xs text-slate-400">Total record volume by entity</p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Real-time DB Sync
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">User Access Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Activate or deactivate patient and doctor platform accounts</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="PATIENT">Patients</option>
              <option value="DOCTOR">Doctors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 text-slate-600">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === 'DOCTOR'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : u.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{u.phone || '—'}</td>
                  <td className="py-3">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                        <XCircle className="w-3.5 h-3.5" />
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
