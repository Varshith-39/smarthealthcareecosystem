import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { Bell, AlertTriangle, CheckCircle, Info, HeartPulse, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Polling fallback to guarantee notifications work 100% without WebSockets
      const interval = setInterval(() => {
        fetchNotifications();
      }, 6000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Real-time socket listener for incoming notifications
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = (notification) => {
      console.log('🔔 Received real-time notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger pop-up toast
      setActiveToast(notification);

      // Automatically dismiss toast after 6 seconds
      setTimeout(() => {
        setActiveToast((current) => (current?._id === notification._id ? null : current));
      }, 6000);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err.message);
    }
  };

  // Helper for notification icons based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EMERGENCY_ALERT':
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'ABNORMAL_HEALTH_READING':
      case 'HIGH_RISK_AI_PREDICTION':
        return <HeartPulse className="w-5 h-5 text-amber-500" />;
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getNotificationIcon,
      }}
    >
      {children}

      {/* Floating Real-time Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
            {getNotificationIcon(activeToast.type)}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
              {activeToast.title}
            </h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {activeToast.message}
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
