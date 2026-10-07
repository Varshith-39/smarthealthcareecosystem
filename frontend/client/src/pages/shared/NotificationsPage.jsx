import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Trash2, Check, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getNotificationIcon } = useNotifications();
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'ALERTS') return n.type.includes('ALERT') || n.type.includes('ABNORMAL');
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts, abnormal telemetry warnings, and consultation updates
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-sky-700 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All Notifications' },
          { id: 'UNREAD', label: 'Unread Only' },
          { id: 'ALERTS', label: 'Alerts & Warnings' },
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

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card divide-y divide-slate-100 overflow-hidden">
        {filtered.map((item) => (
          <div
            key={item._id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
              !item.isRead ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shrink-0 mt-0.5">
                {getNotificationIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.message}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  {item.link && (
                    <button
                      onClick={() => {
                        markAsRead(item._id);
                        navigate(item.link);
                      }}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      View Details →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {!item.isRead && (
                <button
                  onClick={() => markAsRead(item._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  title="Mark read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(item._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No notifications found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
