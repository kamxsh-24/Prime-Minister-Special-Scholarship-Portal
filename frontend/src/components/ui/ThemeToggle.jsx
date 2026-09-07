import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ showLabel = true, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
        isDark
          ? 'bg-[#121212] text-[#4FC3F7] border-[#333333] hover:bg-[#1E1E1E]'
          : 'bg-white text-[#334E68] border-[#D9E2EC] hover:bg-gray-50 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark/light theme"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-[#FFB74D]" />
          {showLabel && <span>Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[#0D6EFD]" />
          {showLabel && <span>Dark</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

