import React from 'react';
import { FileText, Clock, CheckCircle2, FileCheck } from 'lucide-react';

const SummaryCards = ({
  applicationId,
  status = 'In Progress',
  profileCompletion = 85,
  uploadedDocs = 6,
  totalDocs = 6,
}) => {
  const formattedAppId = applicationId
    ? applicationId.startsWith('PMSSS-')
      ? applicationId
      : `PMSSS-2026-${applicationId.slice(-6).toUpperCase()}`
    : 'PMSSS-2026-000123';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Application ID */}
      <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#0A1628] text-[#0D6EFD] dark:text-[#0D6EFD] flex-shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-[#A3A3A3]">Application ID</p>
          <p className="text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white font-mono truncate mt-0.5">
            {formattedAppId}
          </p>
        </div>
      </div>

      {/* Card 2: Application Status */}
      <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-[#1C160C] text-amber-600 dark:text-[#F59E0B] flex-shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-[#A3A3A3]">Application Status</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white capitalize truncate">
              {status === 'draft' ? 'In Progress' : status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Profile Completion */}
      <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
        <div className="relative h-10 w-10 rounded-full bg-blue-50 dark:bg-[#0A1628] border-2 border-[#0D6EFD] dark:border-[#0D6EFD] flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-[#0D6EFD] dark:text-white">{profileCompletion}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-medium text-gray-500 dark:text-[#A3A3A3]">Profile Completion</p>
            <span className="text-xs font-semibold text-[#0D6EFD] dark:text-white">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-[#1A1A1A] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#0D6EFD] dark:bg-[#0D6EFD] h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Documents Uploaded */}
      <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
        <div className="p-2.5 rounded-xl bg-[#F0FDF4] dark:bg-[#051F10] text-[#15803D] dark:text-[#22C55E] flex-shrink-0">
          <FileCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-gray-500 dark:text-[#A3A3A3]">Documents Uploaded</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white font-display">
              {uploadedDocs} <span className="text-xs font-normal text-gray-400 dark:text-[#737373]">/ {totalDocs}</span>
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E] dark:text-[#22C55E] flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
