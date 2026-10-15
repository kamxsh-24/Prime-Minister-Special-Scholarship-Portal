import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import VerificationTable from '../../components/verification/VerificationTable';
import VerificationReviewDrawer from '../../components/verification/VerificationReviewDrawer';
import { getStageApplications } from '../../services/adminService';
import { showError } from '../../store/slices/toastSlice';
import { Building, CheckCircle, Clock, RotateCcw, XCircle } from 'lucide-react';

const InstituteVerificationPage = () => {
  const dispatch = useDispatch();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: '',
    institution: '',
    page: 1,
  });

  const [selectedApp, setSelectedApp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStageApplications('institute', {
        page: filters.page,
        limit: 10,
        search: filters.search,
        status: filters.status,
        category: filters.category,
        institution: filters.institution,
      });
      const data = res.data?.data || res.data || {};
      const appList = Array.isArray(data.applications) ? data.applications : (Array.isArray(data) ? data : []);
      setApplications(appList);
      setPagination(data.pagination || { total: appList.length, page: filters.page, totalPages: Math.ceil(appList.length / 10) || 1 });
    } catch (err) {
      console.error('Failed to fetch institute verification applications:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to fetch applications for institute verification.';
      setError(msg);
      dispatch(showError(msg));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenDrawer = (app) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#132235]">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                Institute Verification Module
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify active college enrollment, student admission bonafide status, department credentials, and roll numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900">
              {pagination.total} In Institute Queue
            </span>
          </div>
        </div>

        {/* Quick Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleFilterChange('status', 'all')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
              filters.status === 'all'
                ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700 shadow-xs'
                : 'bg-white dark:bg-[#07111C] border-slate-200 dark:border-[#132235] hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Filter</span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5 block">All Submissions</span>
            </div>
            <Building className="w-4 h-4 text-blue-500" />
          </button>

          <button
            onClick={() => handleFilterChange('status', 'pending')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
              filters.status === 'pending'
                ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700 shadow-xs'
                : 'bg-white dark:bg-[#07111C] border-slate-200 dark:border-[#132235] hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Filter</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">Pending Review</span>
            </div>
            <Clock className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={() => handleFilterChange('status', 'verified')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
              filters.status === 'verified'
                ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-[#07111C] border-slate-200 dark:border-[#132235] hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Filter</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">College Verified</span>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </button>

          <button
            onClick={() => handleFilterChange('status', 'returned_for_correction')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
              filters.status === 'returned_for_correction'
                ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700 shadow-xs'
                : 'bg-white dark:bg-[#07111C] border-slate-200 dark:border-[#132235] hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Filter</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">Revision Needed</span>
            </div>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Verification Table */}
        <VerificationTable
          stageKey="institute"
          stageTitle="Institute Verification"
          applications={applications}
          loading={loading}
          error={error}
          onRetry={fetchApps}
          pagination={pagination}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onSelectApplication={handleOpenDrawer}
        />
      </div>

      {/* Review Drawer */}
      <VerificationReviewDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        applicationId={selectedApp?._id}
        currentStage="institute"
        onActionComplete={fetchApps}
      />
    </DashboardLayout>
  );
};

export default InstituteVerificationPage;

