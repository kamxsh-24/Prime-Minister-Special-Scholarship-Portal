import React from 'react';
import { Check } from 'lucide-react';

const ApplicationProgressTracker = ({ currentStepIndex = 1, profile, application }) => {
  const isProfileDone = (profile?.completionPercentage || 0) >= 80;
  const isAppSubmitted = application?.status && application.status !== 'draft';
  const isInstDone = ['institution_verified', 'under_review', 'approved', 'disbursed'].includes(application?.status);
  const isOfficerDone = ['approved', 'disbursed'].includes(application?.status);

  const STEPS = [
    { id: 1, name: 'Registration', statusText: 'Completed', key: 'registration' },
    { id: 2, name: 'Profile', statusText: isProfileDone ? 'Completed' : 'In Progress', key: 'profile' },
    { id: 3, name: 'Documents', statusText: isAppSubmitted ? 'Submitted' : 'Pending', key: 'documents' },
    { id: 4, name: 'Institute Verification', statusText: isInstDone ? 'Completed' : isAppSubmitted ? 'Active' : 'Pending', key: 'institute' },
    { id: 5, name: 'Officer Verification', statusText: isOfficerDone ? 'Completed' : isInstDone ? 'Active' : 'Pending', key: 'officer' },
    { id: 6, name: 'Final Decision', statusText: isOfficerDone ? 'Approved' : 'Pending', key: 'decision' },
  ];

  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-7 shadow-sm transition-colors">
      <h2 className="text-base sm:text-lg font-semibold text-[#0B2545] dark:text-white font-display mb-6">
        Application Progress
      </h2>

      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative px-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step Icon & Label */}
              <div className="flex flex-col items-center text-center relative z-10 w-28">
                {/* Circle Icon */}
                <div
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#22C55E] text-white shadow-sm shadow-emerald-500/20'
                      : isActive
                      ? 'bg-[#0D6EFD] text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-500/20'
                      : 'bg-transparent border-2 border-gray-300 dark:border-[#1A1A1A] text-gray-400 dark:text-[#737373]'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : step.id}
                </div>

                {/* Step Title */}
                <span
                  className={`text-xs font-medium mt-2.5 leading-snug ${
                    isActive
                      ? 'text-[#0B2545] dark:text-white font-semibold'
                      : isCompleted
                      ? 'text-gray-800 dark:text-[#A3A3A3]'
                      : 'text-gray-400 dark:text-[#737373]'
                  }`}
                >
                  {step.name}
                </span>

                {/* Subtext Status */}
                <span
                  className={`text-[11px] font-semibold mt-0.5 ${
                    isCompleted
                      ? 'text-[#15803D] dark:text-[#22C55E]'
                      : isActive
                      ? 'text-[#0D6EFD] dark:text-[#0D6EFD]'
                      : 'text-transparent'
                  }`}
                >
                  {isCompleted ? step.statusText : isActive ? 'Active' : ''}
                </span>
              </div>

              {/* Connecting Line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 mb-8">
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx < currentStepIndex
                        ? 'bg-[#22C55E]'
                        : idx === currentStepIndex
                        ? 'bg-gradient-to-r from-[#22C55E] to-gray-200 dark:to-[#1A1A1A]'
                        : 'bg-gray-200 dark:bg-[#1A1A1A]'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Stepper Fallback */}
      <div className="md:hidden space-y-2.5">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                isActive
                  ? 'bg-blue-50/50 dark:bg-[#0A1628] border-[#0D6EFD]/30'
                  : 'bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-[#22C55E] text-white'
                      : isActive
                      ? 'bg-[#0D6EFD] text-white'
                      : 'bg-gray-200 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#737373]'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : step.id}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0B2545] dark:text-white">{step.name}</p>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold ${
                  isCompleted
                    ? 'text-[#15803D] dark:text-[#22C55E]'
                    : isActive
                    ? 'text-[#0D6EFD] dark:text-[#0D6EFD]'
                    : 'text-gray-400 dark:text-[#737373]'
                }`}
              >
                {isCompleted ? step.statusText : isActive ? 'Active' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationProgressTracker;
