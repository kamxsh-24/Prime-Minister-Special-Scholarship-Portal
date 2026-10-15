import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  X, CheckCircle, XCircle, RotateCcw, Clock, AlertTriangle, ShieldCheck,
  FileText, Download, Eye, ExternalLink, User, BookOpen, CreditCard,
  Building, CheckSquare, MessageSquare, History, Sparkles, ChevronRight,
  Loader2, AlertCircle, HelpCircle
} from 'lucide-react';
import { showSuccess, showError } from '../../store/slices/toastSlice';
import {
  getVerificationDetail,
  updateVerificationStage,
  updateDocumentVerification,
} from '../../services/adminService';
import { BACKEND_ORIGIN, getMediaUrl } from '../../services/apiBase';
import DocumentPreviewModal from './DocumentPreviewModal';

const STAGES = [
  { key: 'registration',  label: 'Registration' },
  { key: 'profile',       label: 'Profile' },
  { key: 'document',      label: 'Documents' },
  { key: 'institute',     label: 'Institute' },
  { key: 'officer',       label: 'Officer' },
  { key: 'finalDecision', label: 'Final Decision' },
];

const DOC_NAME_MAP = {
  aadhaar: 'Aadhaar Card',
  incomeCertificate: 'Income Certificate',
  casteCertificate: 'Domicile / Caste Certificate',
  marksheet: '10th / 12th Marksheet',
  bankPassbook: 'Bank Passbook / Cancelled Cheque',
  bonafide: 'Admission Proof / Bonafide Certificate',
  photo: 'Passport Size Photo',
};

const VerificationReviewDrawer = ({
  isOpen,
  onClose,
  applicationId,
  currentStage = 'document',
  onActionComplete,
}) => {
  const dispatch = useDispatch();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Active sub-tab in drawer: 'review', 'documents', 'applicant', 'history'
  const [activeTab, setActiveTab] = useState('review');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState({ open: false, url: '', title: '' });

  // Action Dialog (Reject, Return for Correction, Final Approve, etc.)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: '', // 'verify', 'correction', 'reject', 'approve', 'hold', 'under_review'
    title: '',
    description: '',
    requiresRemark: false,
    remarkPlaceholder: '',
    targetDocField: null,
  });
  const [dialogRemark, setDialogRemark] = useState('');

  // Interactive stage checklist state
  const [checklist, setChecklist] = useState({});
  const [officerRecommendation, setOfficerRecommendation] = useState('approve');

  // Fetch application verification details
  const fetchDetails = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getVerificationDetail(applicationId);
      const data = res.data?.data || res.data || {};
      setDetailData(data);

      // Pre-fill existing stage checklist if available
      const savedChecklist = data.application?.verificationStages?.[currentStage]?.checklist || {};
      setChecklist(savedChecklist);

      if (data.application?.verificationStages?.officer?.recommendation) {
        setOfficerRecommendation(data.application.verificationStages.officer.recommendation);
      }
    } catch (err) {
      console.error('Failed to load application verification details:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load application verification details.';
      setError(msg);
      dispatch(showError(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetails();
      setActiveTab('review');
    }
  }, [isOpen, applicationId, currentStage]);

  if (!isOpen) return null;

  const app = detailData?.application;
  const student = app?.studentId;
  const profile = detailData?.studentProfile;
  const history = detailData?.verificationHistory || [];
  const duplicateFlags = detailData?.duplicateFlags || [];
  const eligibility = detailData?.eligibilityChecks || {};

  const currentStageInfo = app?.verificationStages?.[currentStage] || { status: 'pending', remarks: '' };

  // Handle document verification action
  const handleVerifyDocument = async (field) => {
    setActionLoading(true);
    try {
      const res = await updateDocumentVerification(applicationId, field, {
        status: 'verified',
        remarks: 'Document verified and authentic.',
      });
      dispatch(showSuccess(`${DOC_NAME_MAP[field] || field} verified.`));
      await fetchDetails();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      dispatch(showError(err.response?.data?.message || 'Failed to verify document.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDocReject = (field, action = 'rejected') => {
    setDialogRemark('');
    setConfirmDialog({
      open: true,
      action: action === 'reupload_required' ? 'doc_reupload' : 'doc_reject',
      targetDocField: field,
      title: action === 'reupload_required' ? `Request Re-upload: ${DOC_NAME_MAP[field] || field}` : `Reject Document: ${DOC_NAME_MAP[field] || field}`,
      description: 'Please provide a clear reason to help the student upload the correct document.',
      requiresRemark: true,
      remarkPlaceholder: 'e.g. Document image is blurred / illegible, or name does not match record...',
    });
  };

  // Open Stage Action Dialog
  const handleOpenStageAction = (action) => {
    setDialogRemark('');
    const configs = {
      verify: {
        title: `Verify ${STAGES.find((s) => s.key === currentStage)?.label || currentStage}`,
        description: 'Are you sure you want to approve and clear this verification stage?',
        requiresRemark: false,
        remarkPlaceholder: 'Optional remarks or verification notes...',
      },
      under_review: {
        title: 'Mark as Under Review',
        description: 'Set this stage status to Under Review while verification is in progress.',
        requiresRemark: false,
        remarkPlaceholder: 'Optional notes on what is currently under review...',
      },
      correction: {
        title: 'Return Application for Correction',
        description: 'The student will be notified to correct and resubmit the highlighted details or documents.',
        requiresRemark: true,
        remarkPlaceholder: 'Specify the exact corrections required from the student...',
      },
      reject: {
        title: 'Reject Stage / Application',
        description: 'This application will be marked as rejected for this verification stage.',
        requiresRemark: true,
        remarkPlaceholder: 'Enter mandatory rejection grounds...',
      },
      approve_final: {
        title: 'Approve Scholarship Application (Final Decision)',
        description: 'This will issue official scholarship approval for this student. Are you sure?',
        requiresRemark: false,
        remarkPlaceholder: 'Optional final approval comments...',
      },
      hold_final: {
        title: 'Place Final Decision on Hold',
        description: 'Hold this application until further clarification or quota allocation is available.',
        requiresRemark: true,
        remarkPlaceholder: 'Reason for putting decision on hold...',
      },
    };

    const cfg = configs[action];
    if (!cfg) return;

    setConfirmDialog({
      open: true,
      action,
      targetDocField: null,
      ...cfg,
    });
  };

  // Confirm and Execute Dialog Action
  const handleExecuteDialogAction = async () => {
    const { action, targetDocField, requiresRemark } = confirmDialog;

    if (requiresRemark && !dialogRemark.trim()) {
      dispatch(showError('A remark/reason is strictly required for this action.'));
      return;
    }

    setActionLoading(true);
    try {
      // Document rejection or reupload
      if (action === 'doc_reject' || action === 'doc_reupload') {
        const docStatus = action === 'doc_reupload' ? 'reupload_required' : 'rejected';
        await updateDocumentVerification(applicationId, targetDocField, {
          status: docStatus,
          remarks: dialogRemark,
        });
        dispatch(showSuccess(`Document status updated to ${docStatus.replace('_', ' ')}.`));
      } else {
        // Stage status update
        let stageStatus = 'verified';
        if (action === 'correction') stageStatus = 'returned_for_correction';
        if (action === 'reject') stageStatus = 'rejected';
        if (action === 'under_review') stageStatus = 'under_review';
        if (action === 'approve_final') stageStatus = 'approved';
        if (action === 'hold_final') stageStatus = 'on_hold';

        await updateVerificationStage(applicationId, {
          stage: currentStage,
          status: stageStatus,
          remarks: dialogRemark,
          checklist,
          recommendation: currentStage === 'officer' ? officerRecommendation : undefined,
        });

        dispatch(showSuccess(`Stage '${currentStage}' status updated to ${stageStatus.replace('_', ' ')}.`));
      }

      setConfirmDialog({ open: false });
      await fetchDetails();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      dispatch(showError(err.response?.data?.message || 'Verification action failed.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChecklistToggle = (itemKey) => {
    setChecklist((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  return (
    <>
      {/* Drawer Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white dark:bg-[#07111C] shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#132235] animate-slide-left">
        
        {/* Top Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-[#132235] bg-slate-50/70 dark:bg-[#03070D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {student?.fullName || app?.personalDetails?.fullName || 'Application Review'}
                </h2>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-[#132235] text-slate-700 dark:text-slate-300">
                  {app?._id ? `PMSSS-2026-${app._id.slice(-6).toUpperCase()}` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reviewing Stage:{' '}
                <strong className="text-blue-600 dark:text-blue-400 capitalize">
                  {STAGES.find((s) => s.key === currentStage)?.label || currentStage}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132235] transition"
            aria-label="Close review drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verification Progress Stepper */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-[#132235] bg-white dark:bg-[#07111C] overflow-x-auto">
          <div className="flex items-center min-w-[620px] justify-between">
            {STAGES.map((s, idx) => {
              const stageStatus = app?.verificationStages?.[s.key]?.status || 'pending';
              const isCurrent = s.key === currentStage;
              const isVerified = stageStatus === 'verified' || stageStatus === 'approved';
              const isCorrection = stageStatus === 'returned_for_correction';
              const isRejected = stageStatus === 'rejected';

              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isVerified
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isCorrection
                          ? 'bg-amber-500 text-white'
                          : isRejected
                          ? 'bg-red-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : 'bg-slate-100 dark:bg-[#132235] text-slate-400'
                      }`}
                    >
                      {isVerified ? '✓' : isRejected ? '✗' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-bold ${
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400'
                          : isVerified
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < STAGES.length - 1 && (
                    <div className="w-8 sm:w-12 h-0.5 bg-slate-200 dark:bg-[#132235] mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex px-6 border-b border-slate-200 dark:border-[#132235] bg-slate-50/50 dark:bg-[#03070D] gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-3.5 border-b-2 transition ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Stage Checklist & Action
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3.5 border-b-2 transition ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Documents ({Object.keys(app?.documents || {}).length})
          </button>
          <button
            onClick={() => setActiveTab('applicant')}
            className={`py-3 px-3.5 border-b-2 transition ${
              activeTab === 'applicant'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Applicant Record
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3.5 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Audit History ({history.length})
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Loading verification details...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Failed to Load Application Details
              </h4>
              <p className="text-xs text-red-600 dark:text-red-400 max-w-sm mb-4">
                {error}
              </p>
              <button
                onClick={fetchDetails}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* Warnings / Alerts */}
              {duplicateFlags.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Potential Duplicate Account Flag
                  </div>
                  {duplicateFlags.map((flag, idx) => (
                    <p key={idx} className="text-xs text-amber-700 dark:text-amber-300">
                      • {flag.message}
                    </p>
                  ))}
                </div>
              )}

              {/* TAB 1: STAGE REVIEW & ACTION */}
              {activeTab === 'review' && (
                <div className="space-y-6">
                  {/* Current Stage Status Summary */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0B1524] border border-slate-200 dark:border-[#132235] rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Current Stage Status
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5 block">
                        {currentStageInfo.status ? currentStageInfo.status.replace(/_/g, ' ') : 'Pending Review'}
                      </span>
                      {currentStageInfo.remarks && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Remarks: <span className="italic">{currentStageInfo.remarks}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Overall Application Status
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                        {app?.status ? app.status.replace(/_/g, ' ').toUpperCase() : 'SUBMITTED'}
                      </span>
                    </div>
                  </div>

                  {/* STAGE-SPECIFIC INTERACTIVE CHECKLISTS */}
                  {currentStage === 'registration' && (
                    <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        Registration Verification Criteria
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[
                          { key: 'emailValid', label: 'Student email format is verified and valid.' },
                          { key: 'phoneValid', label: '10-digit mobile number confirmed active.' },
                          { key: 'noDuplicateRecord', label: 'Confirmed no duplicate registration accounts detected.' },
                          { key: 'activeStatusConfirmed', label: 'Student account is active with regular registration timestamp.' },
                        ].map((chk) => (
                          <label
                            key={chk.key}
                            className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-[#03070D] rounded-xl border border-slate-100 dark:border-[#132235] cursor-pointer hover:bg-slate-100 transition"
                          >
                            <input
                              type="checkbox"
                              checked={!!checklist[chk.key]}
                              onChange={() => handleChecklistToggle(chk.key)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{chk.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStage === 'profile' && (
                    <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        Student Profile Verification Criteria
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[
                          { key: 'personalDetailsMatch', label: 'Personal particulars (Full Name, DOB, Gender, Category) are complete.' },
                          { key: 'aadhaarFormatValid', label: '12-digit Aadhaar number is formatted correctly and verified.' },
                          { key: 'addressComplete', label: 'Permanent & Current address with State, District, and PIN code present.' },
                          { key: 'bankDetailsValid', label: 'Bank Name, IFSC code, and Account Number confirmed matching passbook.' },
                          { key: 'incomeUnder8LPA', label: 'Family annual income is under ₹8,00,000 threshold requirement.' },
                        ].map((chk) => (
                          <label
                            key={chk.key}
                            className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-[#03070D] rounded-xl border border-slate-100 dark:border-[#132235] cursor-pointer hover:bg-slate-100 transition"
                          >
                            <input
                              type="checkbox"
                              checked={!!checklist[chk.key]}
                              onChange={() => handleChecklistToggle(chk.key)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{chk.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStage === 'document' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Individual Document Reviews
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Verify each document independently. Rejections require specific feedback.
                        </span>
                      </div>

                      {/* Documents List */}
                      <div className="space-y-3">
                        {['aadhaar', 'incomeCertificate', 'marksheet', 'bankPassbook', 'casteCertificate', 'bonafide', 'photo'].map((docKey) => {
                          const docUrl = app?.documents?.[docKey];
                          const docStatusObj = app?.documentStatuses?.[docKey] || { status: 'pending', remarks: '' };
                          const docStatus = docStatusObj.status || 'pending';
                          const docRemarks = docStatusObj.remarks || '';
                          const isVerified = docStatus === 'verified';
                          const isRejected = docStatus === 'rejected' || docStatus === 'reupload_required';

                          return (
                            <div
                              key={docKey}
                              className="p-4 bg-white dark:bg-[#07111C] border border-slate-200 dark:border-[#132235] rounded-2xl shadow-xs space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-[#132235] flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                                      {DOC_NAME_MAP[docKey] || docKey}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                          isVerified
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                            : isRejected
                                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                        }`}
                                      >
                                        {isVerified ? '✓ Verified' : isRejected ? '✗ ' + docStatus.replace('_', ' ') : '⧗ Pending'}
                                      </span>
                                      {docUrl ? (
                                        <span className="text-[10px] text-slate-400">File uploaded</span>
                                      ) : (
                                        <span className="text-[10px] text-red-400 font-semibold">Missing upload</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Doc Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {docUrl && (
                                    <button
                                      onClick={() => setPreviewDoc({ open: true, url: docUrl, title: DOC_NAME_MAP[docKey] || docKey })}
                                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132235] text-xs font-bold flex items-center gap-1 transition"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                                      Preview
                                    </button>
                                  )}

                                  {!isVerified && docUrl && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleVerifyDocument(docKey)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs disabled:opacity-50"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Verify
                                    </button>
                                  )}

                                  {!isRejected && docUrl && (
                                    <>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleOpenDocReject(docKey, 'reupload_required')}
                                        className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1 transition border border-amber-200 dark:border-amber-800 disabled:opacity-50"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Re-upload
                                      </button>
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleOpenDocReject(docKey, 'rejected')}
                                        className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1 transition border border-red-200 dark:border-red-800 disabled:opacity-50"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {docRemarks && (
                                <div className="p-2.5 bg-slate-50 dark:bg-[#03070D] border border-slate-100 dark:border-[#132235] rounded-xl text-xs text-slate-600 dark:text-slate-400">
                                  <span className="font-bold text-slate-800 dark:text-white uppercase text-[9px] block mb-0.5">
                                    Review Remarks:
                                  </span>
                                  {docRemarks}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStage === 'institute' && (
                    <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        Institute Verification Criteria
                      </h4>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                        <p className="font-bold">Institution: {app?.academicDetails?.institutionName || student?.institution || '—'}</p>
                        <p className="text-[11px] mt-0.5">Course: {app?.academicDetails?.courseName || student?.course || '—'} • Year of Study: {app?.academicDetails?.yearOfStudy || '—'}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        {[
                          { key: 'enrollmentActive', label: 'Student active enrollment and roll number confirmed on institute records.' },
                          { key: 'bonafideConfirmed', label: 'College Bonafide / Admission certificate authentic and endorsed.' },
                          { key: 'courseMatch', label: 'Degree programme and department align with PMSSS guidelines.' },
                          { key: 'attendanceGoodStanding', label: 'Candidate maintains good academic standing and required attendance.' },
                        ].map((chk) => (
                          <label
                            key={chk.key}
                            className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-[#03070D] rounded-xl border border-slate-100 dark:border-[#132235] cursor-pointer hover:bg-slate-100 transition"
                          >
                            <input
                              type="checkbox"
                              checked={!!checklist[chk.key]}
                              onChange={() => handleChecklistToggle(chk.key)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{chk.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStage === 'officer' && (
                    <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Central Officer Eligibility Checklist
                      </h4>
                      <div className="space-y-2 text-xs">
                        {[
                          { key: 'domicileEligibilityMet', label: 'Indian citizenship and qualifying State domicile criteria verified.' },
                          { key: 'incomeUnderCeiling', label: 'Income certificate verified; annual family income below ₹8,00,000 ceiling.' },
                          { key: 'marksCutoffSatisfied', label: 'Class 12 / qualifying score meets AICTE/PMSSS cutoff benchmarks.' },
                          { key: 'bankAadhaarLinked', label: 'Bank details validated for Direct Benefit Transfer (DBT) disbursement.' },
                          { key: 'priorStagesCleared', label: 'Registration, Profile, Document, and Institute stages fully cleared.' },
                        ].map((chk) => (
                          <label
                            key={chk.key}
                            className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-[#03070D] rounded-xl border border-slate-100 dark:border-[#132235] cursor-pointer hover:bg-slate-100 transition"
                          >
                            <input
                              type="checkbox"
                              checked={!!checklist[chk.key]}
                              onChange={() => handleChecklistToggle(chk.key)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{chk.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Officer Recommendation Selector */}
                      <div className="pt-3 border-t border-slate-200 dark:border-[#132235]">
                        <label className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-2">
                          Officer Recommendation for Final Decision
                        </label>
                        <select
                          value={officerRecommendation}
                          onChange={(e) => setOfficerRecommendation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                        >
                          <option value="approve">Recommend for Scholarship Approval</option>
                          <option value="correction">Recommend Return for Correction</option>
                          <option value="reject">Recommend Rejection</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStage === 'finalDecision' && (
                    <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Consolidated Verification Report
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        {STAGES.filter((s) => s.key !== 'finalDecision').map((stg) => {
                          const st = app?.verificationStages?.[stg.key]?.status || 'pending';
                          const isOk = st === 'verified';
                          return (
                            <div
                              key={stg.key}
                              className={`p-3 rounded-xl border flex flex-col justify-between ${
                                isOk
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase text-slate-500">{stg.label}</span>
                              <span className={`font-bold mt-1 text-xs ${isOk ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                {st.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {app?.verificationStages?.officer?.recommendation && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                          <span className="font-bold block uppercase text-[10px]">Officer Recommendation:</span>
                          <span className="font-semibold">{app.verificationStages.officer.recommendation.toUpperCase()}</span>
                          {app.verificationStages.officer.remarks && (
                            <p className="text-[11px] mt-0.5 text-blue-800 dark:text-blue-400 italic">
                              "{app.verificationStages.officer.remarks}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STAGE ACTION BUTTONS */}
                  <div className="pt-4 border-t border-slate-200 dark:border-[#132235] space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      Stage Decision Actions
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {currentStage !== 'finalDecision' ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('verify')}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify Stage
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('under_review')}
                            className="py-2.5 px-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition disabled:opacity-50"
                          >
                            <Clock className="w-4 h-4" />
                            Under Review
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('correction')}
                            className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800 transition disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Correction Req.
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('reject')}
                            className="py-2.5 px-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-800 transition disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Stage
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('approve_final')}
                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50 sm:col-span-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Scholarship (Final Decision)
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('hold_final')}
                            className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-200 dark:border-purple-800 transition disabled:opacity-50"
                          >
                            <Clock className="w-4 h-4" />
                            Put On Hold
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenStageAction('reject')}
                            className="py-2.5 px-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-800 transition disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Application
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ALL DOCUMENTS & PREVIEWS */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(DOC_NAME_MAP).map(([fieldKey, fieldLabel]) => {
                      const docUrl = app?.documents?.[fieldKey];
                      const docStatus = app?.documentStatuses?.[fieldKey]?.status || 'pending';
                      const docRemarks = app?.documentStatuses?.[fieldKey]?.remarks || '';

                      return (
                        <div
                          key={fieldKey}
                          className="bg-white dark:bg-[#07111C] p-4 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {fieldLabel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                  docStatus === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : docStatus === 'rejected' || docStatus === 'reupload_required'
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}
                              >
                                {docStatus.replace('_', ' ')}
                              </span>
                            </div>

                            {docRemarks && (
                              <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 bg-red-50/50 dark:bg-red-950/20 p-2 rounded-lg">
                                {docRemarks}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-[#132235] flex items-center justify-between gap-2">
                            {docUrl ? (
                              <>
                                <button
                                  onClick={() => setPreviewDoc({ open: true, url: docUrl, title: fieldLabel })}
                                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Preview Document
                                </button>
                                <a
                                  href={getMediaUrl(docUrl)}
                                  target="_blank"
                                  download
                                  className="text-slate-400 hover:text-slate-600 p-1"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400">Not uploaded</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: APPLICANT RECORD DETAILS */}
              {activeTab === 'applicant' && (
                <div className="space-y-6 text-xs">
                  {/* Personal details card */}
                  <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#132235] pb-2">
                      <User className="w-4 h-4 text-blue-600" /> Personal Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Full Name</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.personalDetails?.fullName || student?.fullName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Aadhaar Number</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.personalDetails?.aadhaarNumber || profile?.aadhaar || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {app?.personalDetails?.dateOfBirth ? new Date(app.personalDetails.dateOfBirth).toLocaleDateString('en-IN') : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Category & Gender</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {app?.personalDetails?.category || 'General'} • {app?.personalDetails?.gender || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Domicile State & District</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {app?.personalDetails?.state || profile?.address?.state || '—'} • {app?.personalDetails?.district || profile?.address?.district || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Family Annual Income</span>
                        <span className="font-bold text-emerald-600">
                          {profile?.familyIncome ? `₹${Number(profile.familyIncome).toLocaleString()}` : app?.personalDetails?.annualIncome ? `₹${Number(app.personalDetails.annualIncome).toLocaleString()}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Academic details */}
                  <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#132235] pb-2">
                      <BookOpen className="w-4 h-4 text-purple-600" /> Academic Particulars
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">College Name</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.academicDetails?.institutionName || student?.institution || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Course Programme</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.academicDetails?.courseName || student?.course || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Board Roll Number</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.academicDetails?.rollNumber || profile?.rollNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Previous Year Marks / CGPA</span>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {app?.academicDetails?.previousYearMarks ? `${app.academicDetails.previousYearMarks}%` : profile?.cgpa ? `CGPA ${profile.cgpa}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank & DBT details */}
                  <div className="bg-white dark:bg-[#07111C] p-5 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-[#132235] pb-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Bank & DBT Disbursement Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Holder Name</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.bankDetails?.accountHolderName || profile?.accountHolderName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <span className="font-bold text-slate-800 dark:text-white">{app?.bankDetails?.bankName || profile?.bankName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account Number</span>
                        <span className="font-bold text-slate-800 dark:text-white font-mono">{app?.bankDetails?.accountNumber || profile?.accountNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank IFSC Code</span>
                        <span className="font-bold text-slate-800 dark:text-white font-mono">{app?.bankDetails?.ifscCode || profile?.ifscCode || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No verification history entries recorded yet for this application.
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 dark:border-[#132235] ml-3 space-y-4">
                      {history.map((log) => {
                        const dateStr = new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        return (
                          <div key={log._id} className="relative pl-6">
                            <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white dark:border-[#07111C]" />
                            <div className="p-3.5 bg-white dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl shadow-xs space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900 dark:text-white capitalize">
                                  {log.stage ? log.stage.replace('_', ' ') : 'Verification Action'} • {log.action.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400">{dateStr}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                Reviewer: <strong className="text-slate-800 dark:text-slate-200">{log.reviewerName || 'System'}</strong> ({log.reviewerRole || 'admin'})
                              </p>
                              {log.remarks && (
                                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#07111C] p-2 rounded-lg mt-1 italic">
                                  "{log.remarks}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#132235] bg-slate-50/70 dark:bg-[#03070D] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Stage: <strong className="text-slate-800 dark:text-white capitalize">{currentStage}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-[#132235] hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition"
          >
            Close Drawer
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDoc.open}
        onClose={() => setPreviewDoc({ open: false, url: '', title: '' })}
        documentUrl={previewDoc.url}
        title={previewDoc.title}
        studentName={student?.fullName || app?.personalDetails?.fullName}
      />

      {/* Confirmation & Remarks Modal */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#07111C] rounded-2xl p-6 border border-slate-200 dark:border-[#132235] shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {confirmDialog.description}
            </p>

            {/* Remark input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {confirmDialog.requiresRemark ? 'Feedback / Reason (Required) *' : 'Feedback / Remarks (Optional)'}
              </label>
              <textarea
                rows={3}
                value={dialogRemark}
                onChange={(e) => setDialogRemark(e.target.value)}
                placeholder={confirmDialog.remarkPlaceholder}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmDialog({ open: false })}
                className="px-4 py-2 border border-slate-200 dark:border-[#1F304B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132235] rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleExecuteDialogAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs ${
                  confirmDialog.action.includes('reject')
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmDialog.action.includes('correction') || confirmDialog.action.includes('reupload')
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationReviewDrawer;

