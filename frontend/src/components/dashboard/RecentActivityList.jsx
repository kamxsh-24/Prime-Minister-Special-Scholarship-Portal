import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const DEFAULT_ACTIVITIES = [
  {
    id: 1,
    title: 'Documents submitted successfully',
    timestamp: '20 May 2026, 11:20 AM',
  },
  {
    id: 2,
    title: 'Profile information updated',
    timestamp: '16 May 2026, 04:15 PM',
  },
  {
    id: 3,
    title: 'Application registered successfully',
    timestamp: '13 May 2026, 10:30 AM',
  },
];

const RecentActivityList = ({ activities = DEFAULT_ACTIVITIES }) => {
  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display mb-5">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start gap-3.5">
              <div className="h-6 w-6 rounded-full bg-[#F0FDF4] dark:bg-[#051F10] border border-[#86EFAC] dark:border-[#22C55E]/30 text-[#22C55E] dark:text-[#22C55E] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-normal text-[#0B2545] dark:text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-[#737373] mt-0.5">
                  {item.timestamp}
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
          View All Activity &rarr;
        </Link>
      </div>
    </div>
  );
};

export default RecentActivityList;
