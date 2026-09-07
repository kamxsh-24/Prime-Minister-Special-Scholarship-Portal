import React from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Activity, LogOut } from 'lucide-react';

const ProfileDropdown = ({ user, onLogout, onClose }) => {
  const fullName = user?.fullName || 'Kamesh Kumar';
  const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student';
  const userInitial = fullName.charAt(0).toUpperCase();

  return (
    <div
      className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#07111C] border border-[#E2E8F0] dark:border-[#162338] rounded-2xl shadow-xl z-50 overflow-hidden text-[#0F2A5F] dark:text-[#F8FAFC] transition-all duration-150 animate-in fade-in slide-in-from-top-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#162338] flex items-center gap-3 bg-[#F8FAFC]/50 dark:bg-[#0A1828]/50">
        <div className="h-10 w-10 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0F2A5F] dark:text-[#F8FAFC] truncate">
            {fullName}
          </p>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
            {role}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-1.5 divide-y divide-[#E2E8F0]/40 dark:divide-[#162338]/40">
        <div className="space-y-0.5 px-1.5">
          <Link
            to="/dashboard/profile"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#0F2A5F] dark:text-[#F8FAFC] hover:bg-[#F1F6FF] dark:hover:bg-[#0D1B2A] transition-colors"
          >
            <User className="h-4 w-4 text-[#1769FF] flex-shrink-0" />
            <span>My Profile</span>
          </Link>

          <Link
            to="/dashboard/application"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#0F2A5F] dark:text-[#F8FAFC] hover:bg-[#F1F6FF] dark:hover:bg-[#0D1B2A] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#1769FF] flex-shrink-0" />
            <span>My Application</span>
          </Link>

          <Link
            to="/dashboard/status"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#0F2A5F] dark:text-[#F8FAFC] hover:bg-[#F1F6FF] dark:hover:bg-[#0D1B2A] transition-colors"
          >
            <Activity className="h-4 w-4 text-[#1769FF] flex-shrink-0" />
            <span>Track Status</span>
          </Link>
        </div>

        {/* Logout Action */}
        <div className="pt-1 px-1.5">
          <button
            onClick={() => {
              if (onClose) onClose();
              if (onLogout) onLogout();
            }}
            id="profile-dropdown-logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
          >
            <LogOut className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
