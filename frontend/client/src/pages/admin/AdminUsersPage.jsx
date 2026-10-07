import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  Mail,
} from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await API.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    try {
      setActionLoading(true);
      const res = await API.put(`/admin/users/${user._id}/toggle-status`);
      if (res.data?.success) {
        setFeedbackBanner({
          type: 'success',
          text: `User ${user.name} is now ${res.data.user.isActive ? 'Active' : 'Deactivated'}.`,
        });
        setTimeout(() => setFeedbackBanner(null), 4000);
        fetchUsers();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{feedbackBanner.text}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              User Management & Access Control
            </h1>
            <p className="text-xs text-slate-500">
              Manage system access, audit user identities, and toggle active credentials
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto">
          Total Registered: {users.length} Users
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading accounts database...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No users found matching current filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          u.isActive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={actionLoading}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
