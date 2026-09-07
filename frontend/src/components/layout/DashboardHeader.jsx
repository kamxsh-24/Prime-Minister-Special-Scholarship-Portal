import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Menu, Search, ChevronDown } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const DashboardHeader = ({ onMenuToggle, unreadCount = 0, onNotificationClick }) => {
  const { user } = useSelector((s) => s.auth);
  const fullName = user?.fullName || 'Kamesh Kumar';
  const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student';
  const userInitial = fullName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white dark:bg-[#03070D] border-b border-[#E5E7EB] dark:border-[#132235] transition-colors duration-200 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Hamburger Menu & Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xs sm:max-w-md">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] dark:hover:text-white transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Title Fallback (Visible on Mobile only) */}
          <div className="sm:hidden flex items-center gap-1.5 font-bold text-sm text-[#0F2A5F] dark:text-[#F8FAFC]">
            <span>PMSSS</span>
          </div>

          {/* Search Bar (Hidden on small mobile, visible on sm and up) */}
          <div className="relative hidden sm:flex flex-1 min-w-0 max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#F5F8FC] dark:bg-[#07111C] border border-[#E5E7EB] dark:border-[#132235] rounded-xl text-[#0F2A5F] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] dark:focus:border-[#1769FF] transition-colors truncate"
            />
          </div>
        </div>

        {/* Right: Theme Switcher, Notifications & Student Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] dark:hover:text-white transition-colors flex-shrink-0"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#03070D]" />
            )}
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#132235] hidden sm:block" />

          {/* Student Profile & Avatar */}
          <div className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] transition-colors min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              {userInitial}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#0F2A5F] dark:text-[#F8FAFC] leading-snug truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">
                {fullName}
              </p>
              <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-tight truncate">
                {role}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#64748B] dark:text-[#94A3B8] hidden sm:block ml-0.5 flex-shrink-0" />
          </div>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
