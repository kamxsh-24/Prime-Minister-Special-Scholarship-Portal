import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import ChatbotWidget from '../ui/ChatbotWidget';

const DashboardLayout = ({
  children,
  unreadCount = 0,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onMarkSingleRead,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#02060B] text-[#0F2A5F] dark:text-[#F8FAFC] transition-colors duration-200 font-sans flex">
      {/* Fixed/Responsive Left Sidebar (250px / w-64) */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Workspace Area positioned to the right of Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64 bg-[#F8FAFC] dark:bg-[#02060B]">
        {/* Top Sticky Header Navbar */}
        <DashboardHeader
          onMenuToggle={toggleSidebar}
          unreadCount={unreadCount}
          notifications={notifications}
          onMarkAllRead={onMarkAllRead || onNotificationClick}
          onMarkSingleRead={onMarkSingleRead}
        />

        {/* Main Content Area flowing naturally directly below the 64px top navbar */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>

      {/* AI Assistant Floating Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
