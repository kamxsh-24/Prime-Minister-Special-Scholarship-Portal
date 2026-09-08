import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { logout } from '../../store/slices/authSlice';
import { API_BASE_URL } from '../../services/apiBase';

const DashboardHeader = ({
  onMenuToggle,
  unreadCount,
  notifications,
  onMarkAllRead,
  onMarkSingleRead,
}) => {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fetchedNotifications, setFetchedNotifications] = useState([]);
  const [fetchedUnread, setFetchedUnread] = useState(0);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fullName = user?.fullName || 'Kamesh Kumar';
  const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student';
  const userInitial = fullName.charAt(0).toUpperCase();

  const isParentManaged = notifications !== undefined || onMarkAllRead !== undefined || onMarkSingleRead !== undefined;

  // Auto-fetch notifications if not supplied by parent page
  useEffect(() => {
    if (!isParentManaged && token) {
      axios
        .get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setFetchedNotifications(res.data.data);
            setFetchedUnread(res.data.data.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [token, isParentManaged]);

  const activeNotifications = isParentManaged
    ? (notifications || [])
    : (notifications && notifications.length > 0 ? notifications : fetchedNotifications);

  const activeUnread = unreadCount !== undefined
    ? unreadCount
    : (isParentManaged
        ? activeNotifications.filter((n) => !n.isRead).length
        : (fetchedUnread || activeNotifications.filter((n) => !n.isRead).length));

  // Handle Click Outside & Escape Key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleNotif = (e) => {
    e.stopPropagation();
    setProfileOpen(false);
    setNotifOpen((prev) => !prev);
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setNotifOpen(false);
    setProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setNotifOpen(false);
    navigate('/login');
  };

  const handleMarkAll = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    } else if (token) {
      axios
        .patch(`${API_BASE_URL}/notifications/read-all`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setFetchedNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setFetchedUnread(0);
        })
        .catch(() => {});
    }
  };

  const handleMarkSingle = (id) => {
    if (onMarkSingleRead) {
      onMarkSingleRead(id);
    } else if (token) {
      axios
        .patch(`${API_BASE_URL}/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setFetchedNotifications((prev) =>
            prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
          );
          setFetchedUnread((prev) => Math.max(0, prev - 1));
        })
        .catch(() => {});
    }
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 w-full bg-white dark:bg-[#03070D] border-b border-[#E5E7EB] dark:border-[#132235] transition-colors duration-200 flex items-center px-4 sm:px-6 lg:px-8"
    >
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

          {/* Mobile Title Fallback */}
          <div className="sm:hidden flex items-center gap-1.5 font-bold text-sm text-[#0F2A5F] dark:text-[#F8FAFC]">
            <span>PMSSS</span>
          </div>

          {/* Search Bar */}
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

          {/* Notification Bell Dropdown Area */}
          <div ref={notifRef} className="relative">
            <button
              onClick={toggleNotif}
              id="header-notification-btn"
              className="relative p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] dark:hover:text-white transition-colors flex-shrink-0 focus:outline-none"
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5" />
              {activeUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#03070D] animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <NotificationDropdown
                notifications={activeNotifications}
                unreadCount={activeUnread}
                onMarkAllRead={handleMarkAll}
                onMarkSingleRead={handleMarkSingle}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-[#E5E7EB] dark:bg-[#132235] hidden sm:block" />

          {/* Student Profile Dropdown Area */}
          <div ref={profileRef} className="relative">
            <button
              onClick={toggleProfile}
              id="header-profile-menu-btn"
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] transition-colors min-w-0 text-left focus:outline-none"
              aria-label="Student profile menu"
              aria-expanded={profileOpen}
            >
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
              <ChevronDown className={`h-4 w-4 text-[#64748B] dark:text-[#94A3B8] hidden sm:block ml-0.5 flex-shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <ProfileDropdown
                user={user}
                onLogout={handleLogout}
                onClose={() => setProfileOpen(false)}
              />
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
