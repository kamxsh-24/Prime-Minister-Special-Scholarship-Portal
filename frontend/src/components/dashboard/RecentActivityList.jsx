import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { getActivities } from '../../services/studentService';
import { formatRelativeTime } from '../../utils/dateUtils';

const RecentActivityList = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getActivities();
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setActivities(res.data.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError(true);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  const renderBadgeIcon = (type) => {
    switch (type) {
      case 'info':
        return (
          <div className="h-6 w-6 rounded-full bg-[#EFF6FF] dark:bg-[#071A2E] border border-[#BFDBFE] dark:border-[#1D4ED8]/40 text-[#3B82F6] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        );
      case 'warning':
        return (
          <div className="h-6 w-6 rounded-full bg-[#FFFBEB] dark:bg-[#2A1A05] border border-[#FDE68A] dark:border-[#92400E]/40 text-[#F59E0B] flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        );
      case 'error':
        return (
          <div className="h-6 w-6 rounded-full bg-[#FEF2F2] dark:bg-[#2A0F12] border border-[#FECACA] dark:border-[#7F1D1D]/40 text-[#EF4444] flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        );
      case 'success':
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-[#F0FDF4] dark:bg-[#051F10] border border-[#86EFAC] dark:border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          </div>
        );
    }
  };

  const displayedActivities = activities.slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display flex items-center gap-2">
            Recent Activity
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
              Live
            </span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-4 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3.5 animate-pulse">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-[#1A1A1A] flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 dark:bg-[#1A1A1A] rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 dark:bg-[#121212] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="py-6 text-center">
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-3">
              Unable to load recent activity.
            </p>
            <button
              onClick={fetchActivities}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#262626] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && displayedActivities.length === 0 && (
          <div className="py-8 text-center px-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No activity yet.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-[#737373] mt-1 leading-snug">
              Your recent application activity will appear here.
            </p>
          </div>
        )}

        {/* REAL ACTIVITIES LIST */}
        {!loading && !error && displayedActivities.length > 0 && (
          <div className="space-y-4">
            {displayedActivities.map((item) => (
              <div key={item.id} className="flex items-start gap-3.5">
                {renderBadgeIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white leading-snug truncate">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-gray-500 dark:text-[#A3A3A3] leading-tight mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-[#737373] mt-1 font-medium">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-5 mt-4 border-t border-gray-100 dark:border-[#1A1A1A]">
        <Link
          to="/dashboard/status"
          className="text-xs font-semibold text-[#0D6EFD] dark:text-[#0D6EFD] hover:underline inline-flex items-center gap-1 transition-colors"
        >
          View All Activity &rarr;
        </Link>
      </div>
    </div>
  );
};

export default RecentActivityList;
