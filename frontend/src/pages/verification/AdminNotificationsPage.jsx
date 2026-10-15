import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import API from '../../services/api';
import { showError, showSuccess } from '../../store/slices/toastSlice';
import { Bell, Check, Trash2, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AdminNotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      dispatch(showError('Failed to fetch notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      dispatch(showSuccess('Notification marked as read.'));
    } catch {
      dispatch(showError('Failed to update notification.'));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#132235]">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                Verification Notifications & Alerts
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review system notifications, verification updates, student revision alerts, and milestone dispatches.
            </p>
          </div>

          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
            {notifications.filter((n) => !n.isRead).length} Unread
          </span>
        </div>

        {/* Notifications list */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#07111C] rounded-2xl border border-slate-200 dark:border-[#132235] text-xs text-slate-400">
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2 opacity-50" />
              No notifications to display.
            </div>
          ) : (
            notifications.map((n) => {
              const dateStr = new Date(n.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.isRead
                      ? 'bg-white dark:bg-[#07111C] border-slate-200 dark:border-[#132235] opacity-80'
                      : 'bg-blue-50/50 dark:bg-[#0B1524] border-blue-200 dark:border-blue-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.type === 'success'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : n.type === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                          : n.type === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      }`}
                    >
                      {n.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : n.type === 'error' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="px-2.5 py-1 bg-white dark:bg-[#132235] hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-[#1F304B] text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotificationsPage;

