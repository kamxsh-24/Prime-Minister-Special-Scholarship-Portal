import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, ChevronDown, LayoutDashboard, User, FileEdit, Clock, Folder, MessageSquare, HelpCircle, ArrowRight, X } from 'lucide-react';
import axios from 'axios';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { logout } from '../../store/slices/authSlice';
import { API_BASE_URL } from '../../services/apiBase';

const SEARCH_ITEMS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview of application status, document count & recent activity',
    path: '/dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'overview', 'main', 'summary'],
  },
  {
    id: 'profile',
    title: 'My Profile',
    description: 'Manage personal, address, academic & bank account details',
    path: '/dashboard/profile',
    icon: User,
    keywords: ['profile', 'my profile', 'personal', 'address', 'account', 'edit profile', 'details'],
  },
  {
    id: 'application',
    title: 'My Application',
    description: 'Fill or update your PMSSS scholarship application form',
    path: '/dashboard/application',
    icon: FileEdit,
    keywords: ['application', 'apply', 'my application', 'form', 'scholarship application', 'scholarship'],
  },
  {
    id: 'track-status',
    title: 'Track Status',
    description: 'Check institute & officer verification timeline progress',
    path: '/dashboard/status',
    icon: Clock,
    keywords: ['track', 'status', 'track status', 'timeline', 'progress', 'verification', 'approval'],
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Upload & verify Aadhaar, income, marksheet & bank certificates',
    path: '/dashboard/documents',
    icon: Folder,
    keywords: ['document', 'documents', 'upload', 'files', 'certificates', 'aadhaar', 'marksheet', 'income', 'bank passbook'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'View all official portal messages and application updates',
    path: '/dashboard/messages',
    icon: MessageSquare,
    keywords: ['notification', 'notifications', 'messages', 'alerts', 'inbox', 'updates'],
  },
  {
    id: 'support',
    title: 'Help & Support',
    description: 'Ask AI Assistant or search FAQs and resolution guides',
    path: '/dashboard/support',
    icon: HelpCircle,
    keywords: ['help', 'support', 'faq', 'contact', 'assistant', 'queries', 'guide'],
  },
];

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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const fullName = user?.fullName || 'Kamesh Kumar';
  const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student';
  const userInitial = fullName.charAt(0).toUpperCase();

  const isParentManaged = notifications !== undefined || onMarkAllRead !== undefined || onMarkSingleRead !== undefined;

  // Filter search results
  const filteredResults = searchQuery.trim() === ''
    ? []
    : SEARCH_ITEMS.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.keywords.some((k) => k.toLowerCase().includes(query))
        );
      });

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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectResult = (path) => {
    setSearchQuery('');
    setSearchOpen(false);
    setMobileSearchOpen(false);
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      e.preventDefault();
      handleSelectResult(filteredResults[0].path);
    }
  };

  const toggleNotif = (e) => {
    e.stopPropagation();
    setProfileOpen(false);
    setSearchOpen(false);
    setNotifOpen((prev) => !prev);
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    setNotifOpen(false);
    setSearchOpen(false);
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

          {/* Mobile Title */}
          <div className="sm:hidden flex items-center gap-1.5 font-bold text-sm text-[#0F2A5F] dark:text-[#F8FAFC]">
            <span>PMSSS</span>
          </div>

          {/* Desktop Search Bar & Dropdown */}
          <div ref={searchRef} className="relative hidden sm:flex flex-1 min-w-0 max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search portal sections (profile, track, docs)..."
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#F5F8FC] dark:bg-[#07111C] border border-[#E5E7EB] dark:border-[#132235] rounded-xl text-[#0F2A5F] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none focus:border-[#1769FF] dark:focus:border-[#1769FF] transition-colors truncate"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8] hover:text-red-500 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop Search Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0B1726] border border-gray-200 dark:border-[#1D324A] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {filteredResults.length > 0 ? (
                  <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#64748B]">
                      Matching Sections ({filteredResults.length})
                    </p>
                    {filteredResults.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectResult(item.path)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F8FC] dark:hover:bg-[#122338] text-left transition-colors group cursor-pointer"
                        >
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#172A45] text-[#1769FF] dark:text-[#3882FF] shrink-0 group-hover:scale-105 transition-transform">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-[#0F2A5F] dark:text-[#F8FAFC] truncate">
                                {item.title}
                              </p>
                              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      No matching pages found.
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-[#64748B] mt-1">
                      Try searching for "profile", "application", "track", or "documents".
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search Mobile Button, Theme Switcher, Notifications & Student Profile */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
          
          {/* Mobile Search Toggle */}
          <div ref={mobileSearchRef} className="relative sm:hidden">
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F8FC] dark:hover:bg-[#07111C] transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {mobileSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0B1726] border border-gray-200 dark:border-[#1D324A] rounded-2xl shadow-2xl p-3 z-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search sections..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F8FC] dark:bg-[#07111C] border border-[#E5E7EB] dark:border-[#132235] rounded-xl text-[#0F2A5F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                {searchQuery.trim().length > 0 && (
                  <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((item) => {
                        const IconComp = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectResult(item.path)}
                            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F5F8FC] dark:hover:bg-[#122338] text-left"
                          >
                            <IconComp className="w-4 h-4 text-[#1769FF]" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-[#0F2A5F] dark:text-[#F8FAFC] truncate">
                                {item.title}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="p-3 text-xs text-center text-gray-500 dark:text-gray-400">
                        No matching pages found.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
