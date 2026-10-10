import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Star } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateUtils';

const ImportantNotificationsList = ({ notifications = [], onMarkRead, unreadCount = 0 }) => {
  const displayNotifs = notifications.slice(0, 3).map((n) => ({
    id: n._id || n.id,
    message: n.message || n.title,
    date: n.createdAt ? formatRelativeTime(n.createdAt) : 'Recently',
    isRead: n.isRead,
  }));

  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display flex items-center gap-2">
            Important Notifications
          </h3>
          {unreadCount > 0 && onMarkRead && (
            <button
              onClick={onMarkRead}
              className="text-[11px] font-semibold text-[#0D6EFD] dark:text-[#0D6EFD] hover:underline"
            >
              Mark read
            </button>
          )}
        </div>

        {displayNotifs.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No notifications yet.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-[#737373] mt-1 leading-snug">
              Official application updates and portal notices will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayNotifs.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Star className={`h-4 w-4 flex-shrink-0 mt-0.5 ${item.isRead ? 'text-gray-300 dark:text-[#525252]' : 'text-amber-500 fill-amber-500'}`} />
                <div>
                  <p className="text-xs sm:text-sm font-normal text-[#0B2545] dark:text-white leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 dark:text-[#737373] mt-1">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-gray-100 dark:border-[#1A1A1A]">
        <Link
          to="/dashboard/status"
          className="text-xs font-semibold text-[#0D6EFD] dark:text-[#0D6EFD] hover:underline inline-flex items-center gap-1 transition-colors"
        >
          View All Notifications &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ImportantNotificationsList;
