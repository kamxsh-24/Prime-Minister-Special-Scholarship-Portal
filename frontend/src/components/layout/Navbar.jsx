import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../ui/UserAvatar';
import {
  GraduationCap,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user } = useSelector((s) => s.auth);
  const { profile } = useSelector((s) => s.profile);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const avatarSrc = user?.profilePhoto || profile?.profilePhoto;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#000000] border-b border-[#D9E2EC] dark:border-[#333333] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          {user && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors lg:hidden"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          <Link to={isAdmin ? '/admin' : user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-[#0D6EFD] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-white">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#0B2545] dark:text-white leading-tight tracking-tight font-display">
                PMSSS
              </p>
              <p className="text-xs text-[#334E68] dark:text-[#BDBDBD] font-medium leading-tight">
                Scholarship Management Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Right Side: Theme Switcher & Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#D9E2EC] dark:border-[#333333] bg-white dark:bg-[#121212] text-[#334E68] dark:text-[#E0E0E0] hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-all text-xs font-semibold shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[#FFB74D]" />
                <span className="inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#0D6EFD]" />
                <span className="inline">Dark</span>
              </>
            )}
          </button>

          {!user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Login Button */}
              <Link
                to="/login"
                id="nav-login-btn"
                className="btn-secondary px-5 py-2 text-sm font-semibold flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Login
              </Link>

              {/* Register Button */}
              <Link
                to="/register"
                id="nav-register-btn"
                className="btn-primary px-5 py-2 text-sm font-semibold flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Register
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                id="profile-menu-btn"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#D9E2EC] dark:border-[#333333] hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-all"
                aria-expanded={profileOpen}
              >
                <UserAvatar
                  src={avatarSrc}
                  name={user.fullName}
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-[#424242]"
                  textClassName="text-xs font-semibold"
                />
                <span className="hidden sm:block text-xs font-bold text-[#0B2545] dark:text-white truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#161616] rounded-2xl shadow-xl border border-[#D9E2EC] dark:border-[#333333] py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-[#333333]">
                    <p className="text-xs font-bold text-[#0B2545] dark:text-white truncate">{user.fullName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-[#BDBDBD] truncate">{user.email}</p>
                  </div>

                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-[#E0E0E0] hover:bg-gray-50 dark:hover:bg-[#1E1E1E]"
                  >
                    <GraduationCap className="h-4 w-4 text-[#0D6EFD]" />
                    Dashboard
                  </Link>

                  {!isAdmin && (
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-[#E0E0E0] hover:bg-gray-50 dark:hover:bg-[#1E1E1E]"
                    >
                      <User className="h-4 w-4 text-[#0D6EFD]" />
                      My Profile
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    id="pmss-logout-btn"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 dark:text-[#EF5350] hover:bg-red-50 dark:hover:bg-[#1E1E1E] font-medium border-t border-gray-100 dark:border-[#333333] mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


