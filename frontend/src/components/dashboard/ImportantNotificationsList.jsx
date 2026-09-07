import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const DEFAULT_NOTIFS = [
  {
    id: 'n1',
    message: 'Your application is under institute verification. Please check back later.',
    date: '20 May 2026',
    isStarred: true,
  },
  {
    id: 'n2',
    message: 'Keep your documents updated to avoid rejection.',
    date: '18 May 2026',
    isStarred: true,
    starColor: 'text-amber-500 fill-amber-500',
  },
];

const ImportantNotificationsList = ({ notifications = [], onMarkRead, unreadCount = 0 }) => {
  const displayNotifs = notifications.length > 0
    ? notifications.slice(0, 3).map((n) => ({
        id: n._id || n.id,
        message: n.message || n.title,
        date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 May 2026',
        isStarred: true,
      }))
    : DEFAULT_NOTIFS;

  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display">
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

        <div className="space-y-4">
          {displayNotifs.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <Star className={`h-4 w-4 flex-shrink-0 mt-0.5 ${item.starColor || 'text-gray-400 dark:text-[#737373] fill-gray-400/20'}`} />
              <div>
                <p className="text-xs sm:text-sm font-normal text-[#0B2545] dark:text-white leading-relaxed">
                  {item.message}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-[#737373] mt-1">
                  {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
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
