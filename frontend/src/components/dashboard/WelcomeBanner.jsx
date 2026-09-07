import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight } from 'lucide-react';

const WelcomeBanner = ({ studentName = 'Kamesh Kumar' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
        isDark
          ? 'bg-[#080808] border-[#1A1A1A] shadow-sm'
          : 'bg-gradient-to-r from-[#F0F6FF] via-[#F6F9FF] to-white border-blue-100/90 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch justify-between min-h-[200px] sm:min-h-[220px]">
        {/* Left Text & CTA Section */}
        <div className="p-6 sm:p-8 lg:p-9 flex-1 max-w-xl z-10 flex flex-col justify-center space-y-2.5 sm:space-y-3">
          <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-[#A3A3A3]">
            Welcome back,
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2545] dark:text-white font-display tracking-tight leading-tight">
            {studentName}!
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A3A3A3] leading-relaxed max-w-md">
            Keep moving forward. Complete your application and unlock new opportunities with PMSSS.
          </p>

          <div className="pt-2">
            <Link
              to="/dashboard/application"
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#0D6EFD] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-all duration-200 group"
            >
              <span>Continue Application</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Illustration Asset — Seamless Blend */}
        <div className="md:w-1/2 lg:w-7/12 relative flex items-end justify-end overflow-hidden pt-4 md:pt-0">
          <img
            src={isDark ? '/student-dark.png' : '/student-light.png'}
            alt="Students"
            className={`w-full max-h-[220px] sm:max-h-[240px] md:max-h-[260px] object-contain object-right-bottom transition-opacity duration-300 ${
              isDark ? 'mix-blend-normal' : 'mix-blend-multiply'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
