import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'n1',
    message: 'Your application is under institute verification.',
    createdAt: '2026-05-20T10:00:00.000Z',
    isRead: false,
    color: 'bg-blue-500',
  },
  {
    _id: 'n2',
    message: 'Documents submitted successfully.',
    createdAt: '2026-05-20T08:30:00.000Z',
    isRead: true,
    color: 'bg-emerald-500',
  },
  {
    _id: 'n3',
    message: 'Verify your documents before the deadline.',
    createdAt: '2026-05-18T14:15:00.000Z',
    isRead: false,
    color: 'bg-amber-500',
  },
];

const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkSingleRead,
  onClose,
}) => {
  const notifList = notifications.length > 0
    ? notifications.map((n, idx) => {
        let dotColor = 'bg-blue-500';
        const msg = (n.message || n.title || '').toLowerCase();
        if (msg.includes('success') || msg.includes('approved') || msg.includes('disbursed') || msg.includes('submitted')) {
          dotColor = 'bg-emerald-500';
        } else if (msg.includes('verify') || msg.includes('deadline') || msg.includes('reject') || msg.includes('warning') || msg.includes('action')) {
          dotColor = 'bg-amber-500';
        }
        return {
          ...n,
          color: dotColor,
        };
      })
    : DEFAULT_NOTIFICATIONS;

  const totalUnread = unreadCount || notifList.filter((n) => !n.isRead).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '20 May 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#07111C] border border-[#E2E8F0] dark:border-[#162338] rounded-2xl shadow-xl z-50 overflow-hidden text-[#0F2A5F] dark:text-[#F8FAFC] transition-all duration-150 animate-in fade-in slide-in-from-top-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#162338] flex items-center justify-between bg-[#F8FAFC]/50 dark:bg-[#0A1828]/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#0F2A5F] dark:text-[#F8FAFC]">
            Notifications
          </h3>
          {totalUnread > 0 && (
            <span className="bg-[#1769FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totalUnread} new
            </span>
          )}
        </div>
        {totalUnread > 0 && onMarkAllRead && (
          <button
            onClick={() => {
              onMarkAllRead();
            }}
            className="text-[11px] font-semibold text-[#1769FF] hover:underline flex items-center gap-1 focus:outline-none"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications Items List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]/60 dark:divide-[#162338]">
        {notifList.length === 0 ? (
          <div className="p-6 text-center text-gray-400 dark:text-gray-500">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No notifications yet</p>
          </div>
        ) : (
          notifList.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  item.isRead
                    ? 'bg-transparent hover:bg-[#F1F6FF] dark:hover:bg-[#0D1B2A]'
                    : 'bg-[#F1F6FF]/60 dark:bg-[#0D1B2A]/60 hover:bg-[#F1F6FF] dark:hover:bg-[#0D1B2A]'
                }`}
              >
                {/* Status Dot */}
                <span className={`h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0 ${item.color || 'bg-blue-500'}`} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-[#0F2A5F] dark:text-[#F8FAFC] leading-snug">
                    {item.message || item.title}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-[#94A3B8] mt-1 font-mono">
                    {formatDate(item.createdAt || item.date)}
                  </p>
                </div>

                {!item.isRead && onMarkSingleRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkSingleRead(id);
                    }}
                    className="text-[10px] font-semibold text-[#1769FF] hover:underline flex-shrink-0 focus:outline-none"
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#E2E8F0] dark:border-[#162338] text-center bg-[#F8FAFC]/50 dark:bg-[#0A1828]/50">
        <Link
          to="/dashboard/status"
          onClick={() => onClose && onClose()}
          className="text-xs font-semibold text-[#1769FF] hover:underline inline-flex items-center gap-1 transition-colors"
        >
          View All Notifications &rarr;
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
