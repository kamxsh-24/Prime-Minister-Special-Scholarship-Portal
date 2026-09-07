import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UploadCloud, Eye, Activity } from 'lucide-react';

const ACTIONS = [
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Update personal & academic details',
    icon: UserCheck,
    to: '/dashboard/profile',
    iconBg: 'bg-blue-500/10 text-[#0D6EFD] dark:text-[#0D6EFD]',
  },
  {
    id: 'documents',
    title: 'Upload Documents',
    description: 'Attach required certificates & proofs',
    icon: UploadCloud,
    to: '/dashboard/documents',
    iconBg: 'bg-[#F0FDF4] dark:bg-[#051F10] text-[#22C55E] dark:text-[#22C55E]',
  },
  {
    id: 'view',
    title: 'View Application',
    description: 'Review your submitted application form',
    icon: Eye,
    to: '/dashboard/application',
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-[#A855F7]',
  },
  {
    id: 'status',
    title: 'Check Application Status',
    description: 'Track verification & decision timeline',
    icon: Activity,
    to: '/dashboard/status',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-[#F59E0B]',
  },
];

const QuickActions = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTIONS.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              to={act.to}
              className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] hover:border-blue-300 dark:hover:border-[#0D6EFD]/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3.5 group"
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${act.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white group-hover:text-[#0D6EFD] dark:group-hover:text-[#0D6EFD] transition-colors truncate">
                  {act.title}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-[#A3A3A3] mt-0.5 leading-snug line-clamp-2">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
