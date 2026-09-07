import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Activity,
  LogOut,
  GraduationCap,
  Users,
  BarChart2,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

const StudentLinks = [
  { to: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/profile',     icon: User,            label: 'My Profile' },
  { to: '/dashboard/application', icon: FileText,        label: 'My Application' },
  { to: '/dashboard/status',      icon: Activity,        label: 'Track Status' },
];

const AdminLinks = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/applications', icon: FileText,        label: 'Applications' },
  { to: '/admin/profiles',     icon: Users,           label: 'Profiles' },
  { to: '/admin/reports',      icon: BarChart2,       label: 'Reports' },
  { to: '/admin/users',        icon: Users,           label: 'Users' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === 'admin' ? AdminLinks : StudentLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col
          bg-white dark:bg-[#03070D] border-r border-[#E5E7EB] dark:border-[#132235]
          transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Sidebar"
      >
        {/* Top Left Brand Header */}
        <div className="h-16 flex-shrink-0 border-b border-[#E5E7EB] dark:border-[#132235] flex items-center px-4 gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1769FF] text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-[#0F2A5F] dark:text-[#F8FAFC] font-display tracking-tight leading-tight">
              PMSSS
            </span>
            <span className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-tight truncate">
              Scholarship Management Portal
            </span>
          </div>
        </div>

        {/* 4 Main Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Navigation
          </div>
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/dashboard'}
              onClick={() => {
                if (isOpen) onToggle();
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 relative overflow-hidden ${
                  isActive
                    ? 'bg-[#EBF3FE] dark:bg-[#1769FF] text-[#1769FF] dark:text-white font-semibold shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-gray-100/70 dark:hover:bg-[#07111C] hover:text-[#1769FF] dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#1769FF] dark:bg-white rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3 pl-1">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                  {badge && (
                    <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Bottom Section */}
        <div className="mt-auto p-3 flex-shrink-0 border-t border-[#E5E7EB] dark:border-[#132235] flex flex-col gap-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#94A3B8] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span>Logout</span>
          </button>

          {/* Empowering Students Card BELOW Logout */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-[#132235] bg-[#F0F7FF] dark:bg-[#07111C] p-3 text-center shadow-xs">
            <img
              src={isDark ? '/student-dark.png' : '/student-light.png'}
              alt="Empowering Students"
              className={`w-full h-auto max-h-[100px] object-contain mx-auto rounded-xl transition-opacity duration-300 ${
                isDark ? 'mix-blend-normal' : 'mix-blend-multiply'
              }`}
            />
            <p className="text-[11px] font-bold text-[#0F2A5F] dark:text-[#F8FAFC] mt-1.5 leading-tight">
              Empowering Students
            </p>
            <p className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-tight">
              Building a Brighter India
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
