import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllVerificationHistory } from '../../services/adminService';
import { showError } from '../../store/slices/toastSlice';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';
import { History, Search, Filter, ChevronLeft, ChevronRight, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';

const STAGE_LABELS = {
  registration: 'Registration Verification',
  profile: 'Student Profile Verification',
  document: 'Document Verification',
  institute: 'Institute Verification',
  officer: 'Officer Verification',
  final_decision: 'Final Decision',
  finalDecision: 'Final Decision',
  document_item: 'Document Item Verification',
};

const VerificationHistoryPage = () => {
  const dispatch = useDispatch();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    stage: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: '',
    page: 1,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllVerificationHistory({
        page: filters.page,
        limit: 15,
        search: filters.search,
        stage: filters.stage,
        action: filters.action,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      const data = res.data.data;
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      dispatch(showError('Failed to fetch verification audit history.'));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#132235]">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <History className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                Verification History & Audit Trail
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Append-only audit log recording all stage decisions, individual document approvals, rejection grounds, reviewer identities, and timestamps.
            </p>
          </div>

          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 self-start sm:self-auto">
            {pagination.total} Historical Events Recorded
          </span>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-[#07111C] p-4 rounded-2xl border border-slate-200 dark:border-[#132235] shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by student name or remark..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Stage filter */}
            <select
              value={filters.stage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">All Verification Stages</option>
              <option value="registration">Registration Stage</option>
              <option value="profile">Profile Stage</option>
              <option value="document">Document Stage</option>
              <option value="document_item">Individual Document Item</option>
              <option value="institute">Institute Stage</option>
              <option value="officer">Officer Stage</option>
              <option value="final_decision">Final Decision</option>
            </select>

            {/* Date From */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">From:</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">To:</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#03070D] border border-slate-200 dark:border-[#132235] rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white dark:bg-[#07111C] border border-slate-200 dark:border-[#132235] rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : logs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <History className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                No audit entries found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                There are no verification actions recorded matching the selected filter parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-[#03070D] border-b border-slate-200 dark:border-[#132235] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Verification Stage</th>
                    <th className="py-3 px-4">Action & Status Transition</th>
                    <th className="py-3 px-4">Reviewer</th>
                    <th className="py-3 px-4">Remarks / Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#132235]">
                  {logs.map((log) => {
                    const appId = log.applicationId?._id
                      ? `PMSSS-2026-${log.applicationId._id.slice(-6).toUpperCase()}`
                      : '—';
                    const dateStr = new Date(log.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    const isSuccess = log.newStatus === 'verified' || log.newStatus === 'approved';
                    const isError = log.newStatus === 'rejected';
                    const isWarning = log.newStatus === 'returned_for_correction' || log.newStatus === 'reupload_required' || log.newStatus === 'on_hold';

                    return (
                      <tr key={log._id} className="hover:bg-slate-50/70 dark:hover:bg-[#0B1524] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {dateStr}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {appId}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {log.studentId?.fullName || log.applicationId?.personalDetails?.fullName || '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.studentId?.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {STAGE_LABELS[log.stage] || log.stage}
                          </span>
                          {log.documentField && (
                            <span className="block text-[10px] text-blue-600 dark:text-blue-400">
                              Doc: {log.documentField}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                isSuccess
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : isError
                                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                                  : isWarning
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                              }`}
                            >
                              {log.newStatus.replace(/_/g, ' ')}
                            </span>
                            {log.previousStatus && (
                              <span className="text-[9px] text-slate-400">
                                (was: {log.previousStatus.replace(/_/g, ' ')})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-white">
                            {log.reviewerName || 'System'}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            Role: {log.reviewerRole || 'admin'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-[240px]">
                          {log.remarks ? (
                            <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2" title={log.remarks}>
                              "{log.remarks}"
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No remarks noted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="p-3.5 border-t border-slate-200 dark:border-[#132235] bg-slate-50/50 dark:bg-[#03070D] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing logs <strong className="text-slate-800 dark:text-white">{(pagination.page - 1) * 15 + 1}</strong> to{' '}
                <strong className="text-slate-800 dark:text-white">{Math.min(pagination.page * 15, pagination.total)}</strong> of{' '}
                <strong className="text-slate-800 dark:text-white">{pagination.total}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] hover:bg-white dark:hover:bg-[#132235] disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] hover:bg-white dark:hover:bg-[#132235] disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VerificationHistoryPage;

