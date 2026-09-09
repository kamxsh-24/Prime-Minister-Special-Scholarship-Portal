import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusBadge from '../components/ui/StatusBadge';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { showError } from '../store/slices/toastSlice';
import { applicationSuccess } from '../store/slices/applicationSlice';
import { getApplication, downloadApprovalLetter } from '../services/studentService';
import { generateApplicationPDF } from '../utils/pdfGenerator';
import {
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  Info,
  FileText,
  ArrowRight,
  Loader2,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

const TIMELINE = [
  { status: 'draft',                 label: 'Registration & Application', desc: 'Complete and save all required application sections.' },
  { status: 'submitted',            label: 'Application Submission',     desc: 'Your application has been successfully submitted.' },
  { status: 'institution_verified',  label: 'Institute Verification',     desc: 'Your college or institution nodal officer has verified your registration details.' },
  { status: 'under_review',          label: 'Officer Verification',       desc: 'State and nodal scholarship officers are reviewing your documents.' },
  { status: 'approved',              label: 'Final Decision & Approval',  desc: 'Congratulations! Your scholarship application has been officially approved.' },
  { status: 'disbursed',             label: 'Fund Disbursement',          desc: 'Scholarship funds have been disbursed to your Aadhaar-seeded bank account.' },
];

const ApplicationStatus = () => {
  const dispatch = useDispatch();
  const { application } = useSelector((s) => s.application);
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadAppPDF = () => {
    try {
      if (!application) return;
      generateApplicationPDF(application, user);
    } catch (err) {
      dispatch(showError(err.message || 'Failed to generate PDF.'));
    }
  };

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getApplication();
        if (res.data.success) dispatch(applicationSuccess(res.data.data));
      } catch {
        dispatch(showError('Failed to load application status.'));
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [dispatch]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await downloadApprovalLetter();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PMSSS_Approval_Letter.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      dispatch(showError('Failed to download letter.'));
    } finally {
      setDownloading(false);
    }
  };

  const getStepIndex = (status) => {
    if (!status || status === 'draft') return 0;
    const idx = TIMELINE.findIndex((t) => t.status === status);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = application ? getStepIndex(application.status) : 0;
  const isDraft = !application || application?.status === 'draft';
  const isRejected = application?.status === 'rejected';
  const isApproved = application?.status === 'approved' || application?.status === 'disbursed';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-gray-200 dark:border-[#333333]">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] dark:text-white font-display">
            Application Status
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#BDBDBD] mt-1">
            Track your PMSSS scholarship application progress and verification timeline in real time
          </p>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : !application || isDraft ? (
          <div className="card p-8 border border-gray-200 dark:border-[#333333] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-[#BDBDBD] uppercase tracking-wider mb-1">
                  Current Application Status
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-full border border-amber-300 dark:border-amber-800">
                    Application Incomplete
                  </span>
                  {application?._id && (
                    <span className="text-xs font-mono font-bold text-gray-600 dark:text-[#E0E0E0]">
                      ID: PMSSS-2026-{application._id.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <Link
                to="/dashboard/application"
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
              >
                Continue Application <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-[#1E170C] border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Info className="h-4 w-4 shrink-0 text-amber-600" />
                Action Required: Complete Application Form
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Your application has not been submitted yet. Please complete all required sections (Personal, Address, Academic, Family & Income, Bank Details, and Documents) before final submission.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Header Card */}
            <div className="card p-6 border border-gray-200 dark:border-[#333333] shadow-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-[#BDBDBD] uppercase tracking-wider mb-1">
                    Current Application Status
                  </p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={application.status} className="text-sm px-3 py-1" />
                    <span className="text-xs font-mono font-bold text-gray-600 dark:text-[#E0E0E0]">
                      ID: PMSSS-2026-{application._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                {application.submittedAt && (
                  <div className="sm:text-right">
                    <p className="text-xs text-gray-400 dark:text-[#BDBDBD]">Submitted On</p>
                    <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                      {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#333333] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500 dark:text-[#BDBDBD] font-medium">Export official application document:</span>
                <button
                  onClick={handleDownloadAppPDF}
                  className="btn-secondary text-xs px-4 py-2 flex items-center gap-2"
                  id="download-application-pdf-btn"
                >
                  <FileText className="h-4 w-4" />
                  Download Application PDF
                </button>
              </div>

              {isApproved && (
                <div className="mt-5 p-4 bg-[#F0FDF4] dark:bg-[#0B2E1B] border border-[#86EFAC] dark:border-[#166534] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-[#22C55E] dark:text-[#4ADE80] flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[#15803D] dark:text-[#4ADE80] text-sm">Scholarship Approved!</p>
                      <p className="text-xs text-[#15803D]/90 dark:text-[#4ADE80]/90 mt-0.5">Your official award letter is available for download.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn-primary bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs px-4 py-2.5"
                    id="download-letter-btn"
                  >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download Letter
                  </button>
                </div>
              )}

              {isRejected && (
                <div className="mt-5 p-4 bg-red-50 dark:bg-[#121212] border border-red-200 dark:border-[#EF5350]/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-[#EF5350] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 dark:text-[#EF5350] text-sm">Application Needs Revision / Disapproved</p>
                    {application.reviewerRemarks && (
                      <p className="text-xs text-red-700 dark:text-[#E0E0E0] mt-1 font-medium">{application.reviewerRemarks}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-[#BDBDBD] mt-2">
                      Need help? Contact support at <a href="mailto:help@pmsss.gov.in" className="text-blue-600 dark:text-[#4FC3F7] underline">help@pmsss.gov.in</a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Stepper */}
            {!isRejected && (
              <div className="card p-6 sm:p-8 border border-gray-200 dark:border-[#333333]">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white mb-6 font-display">
                  Verification Timeline
                </h2>
                <div className="space-y-6">
                  {TIMELINE.map((step, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    const pending = i > currentIdx;
                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? 'bg-[#22C55E] border-[#22C55E] text-white dark:bg-[#0B2E1B] dark:border-[#166534] dark:text-[#4ADE80]'
                            : active ? 'border-blue-600 text-blue-600 dark:border-[#4FC3F7] dark:text-[#4FC3F7] bg-blue-50 dark:bg-[#161616] ring-4 ring-blue-500/20'
                            : 'border-gray-300 dark:border-[#333333] text-gray-400 dark:text-[#BDBDBD] bg-white dark:bg-[#161616]'
                          }`}>
                            {done ? <CheckCircle2 className="h-5 w-5" /> : <Clock className={`h-5 w-5 ${active ? 'animate-pulse' : ''}`} />}
                          </div>
                          {i < TIMELINE.length - 1 && (
                            <div className={`w-0.5 h-12 my-1 ${done ? 'bg-[#22C55E] dark:bg-[#166534]' : 'bg-gray-200 dark:bg-[#333333]'}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-1 pb-4">
                          <div className="flex items-center gap-3">
                            <p className={`font-bold text-sm sm:text-base ${active ? 'text-blue-600 dark:text-[#4FC3F7]' : done ? 'text-[#0B1F3A] dark:text-white' : 'text-gray-400 dark:text-[#BDBDBD]'}`}>
                              {step.label}
                            </p>
                            {active && (
                              <span className="text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-[#161616] text-blue-700 dark:text-[#4FC3F7] px-2 py-0.5 rounded border border-blue-200 dark:border-[#4FC3F7]/30">
                                Current Stage
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${pending ? 'text-gray-400 dark:text-[#BDBDBD]' : 'text-gray-600 dark:text-[#E0E0E0]'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviewer Remarks */}
            {application.reviewerRemarks && !isRejected && (
              <div className="card p-6 border border-gray-200 dark:border-[#333333]">
                <h2 className="text-sm font-bold text-[#0B1F3A] dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-[#4FC3F7]" />
                  Officer Remarks
                </h2>
                <div className="bg-blue-50/70 dark:bg-[#161616] border border-blue-200 dark:border-[#4FC3F7]/30 rounded-xl p-4 text-xs text-gray-800 dark:text-[#E0E0E0]">
                  {application.reviewerRemarks}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationStatus;

