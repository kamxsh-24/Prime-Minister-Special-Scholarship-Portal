import React from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, AlertTriangle, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { SkeletonTable } from '../ui/SkeletonLoader';

const VerificationStatusPill = ({ status }) => {
  const normalized = (status || 'pending').toLowerCase();

  switch (normalized) {
    case 'verified':
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-3 h-3" /> Verified
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    case 'returned_for_correction':
    case 'correction_required':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <RotateCcw className="w-3 h-3" /> Correction
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    case 'on_hold':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <Clock className="w-3 h-3" /> On Hold
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
  }
};

const VerificationTable = ({
  stageKey,
  stageTitle,
  applications = [],
  loading = false,
  error = null,
  onRetry = null,
  pagination = { total: 0, page: 1, totalPages: 1 },
  filters = {},
  onFilterChange,
  onPageChange,
  onSelectApplication,
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-[#07111C] p-4 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder={`Search applicants by student name, email, or institution...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified / Cleared</option>
            <option value="returned_for_correction">Returned for Correction</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="OBC">OBC</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#07111C] border border-slate-200 dark:border-[#132235] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} />
        ) : error ? (
          <div className="text-center py-16 px-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              Failed to Load {stageTitle}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 max-w-md mx-auto mb-4 leading-relaxed font-medium">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Fetching
              </button>
            )}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              No applications in {stageTitle} queue
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              There are no student applications currently awaiting review matching the selected filter criteria for {stageTitle}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-[#03070D] border-b border-slate-200 dark:border-[#132235] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Student Name & Contact</th>
                  <th className="py-3.5 px-4">College / Course</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">{stageTitle} Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#132235]">
                {applications.map((app) => {
                  const stageObj = app.verificationStages?.[stageKey] || {};
                  const stageStatus = stageObj.status || 'pending';
                  const appIdShort = app._id ? `PMSSS-2026-${app._id.slice(-6).toUpperCase()}` : '—';
                  const student = app.studentId;

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#0B1524] transition-colors cursor-pointer"
                      onClick={() => onSelectApplication(app)}
                    >
                      {/* Application ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {appIdShort}
                        {app.hasPotentialDuplicate && (
                          <span
                            className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold"
                            title="Duplicate account indicators detected"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" /> Dup
                          </span>
                        )}
                      </td>

                      {/* Student Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {student?.fullName || app.personalDetails?.fullName || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {student?.email || app.personalDetails?.email}
                          {student?.phone && ` • ${student.phone}`}
                        </div>
                      </td>

                      {/* College & Course */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {app.academicDetails?.institutionName || student?.institution || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {app.academicDetails?.courseName || student?.course || '—'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#132235] text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                          {app.personalDetails?.category || 'General'}
                        </span>
                      </td>

                      {/* Stage Status */}
                      <td className="py-3.5 px-4">
                        <VerificationStatusPill status={stageStatus} />
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-IN') : '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && applications.length > 0 && (
          <div className="p-3.5 border-t border-slate-200 dark:border-[#132235] bg-slate-50/50 dark:bg-[#03070D] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing applications <strong className="text-slate-800 dark:text-white">{(pagination.page - 1) * 10 + 1}</strong> to{' '}
              <strong className="text-slate-800 dark:text-white">{Math.min(pagination.page * 10, pagination.total)}</strong> of{' '}
              <strong className="text-slate-800 dark:text-white">{pagination.total}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] hover:bg-white dark:hover:bg-[#132235] disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] hover:bg-white dark:hover:bg-[#132235] disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationTable;

