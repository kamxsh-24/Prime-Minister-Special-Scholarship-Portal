import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import { SkeletonStats, SkeletonTable } from '../components/ui/SkeletonLoader';
import { showError } from '../store/slices/toastSlice';
import { getVerificationDashboard, getAllApplications, getAuditLogs } from '../services/adminService';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  RotateCcw,
  ArrowRight,
  BarChart2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  History,
  Building,
  UserCheck,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [dashboardData, setDashboardData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, appsRes, logsRes] = await Promise.all([
        getVerificationDashboard(),
        getAllApplications({ limit: 6, page: 1 }),
        getAuditLogs(),
      ]);
      const dashData = dashRes.data?.data || dashRes.data || {};
      const appsData = appsRes.data?.data || appsRes.data || {};
      const logsData = logsRes.data?.data || logsRes.data || [];

      setDashboardData(dashData);
      setRecent(Array.isArray(appsData.applications) ? appsData.applications : (Array.isArray(appsData) ? appsData : []));
      setLogs(Array.isArray(logsData) ? logsData : (Array.isArray(logsData.logs) ? logsData.logs : []));
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load admin dashboard data.';
      setError(msg);
      dispatch(showError(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const cards = dashboardData?.cards || {};
  const stageCounts = dashboardData?.stageCounts || {};

  // 7 Required Summary Cards
  const summaryCards = [
    {
      title: 'Total Applications',
      value: cards.totalApplications ?? 0,
      icon: FileText,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending Verification',
      value: cards.pendingVerification ?? 0,
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Applications Under Review',
      value: cards.applicationsUnderReview ?? 0,
      icon: Clock,
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: 'Verified Applications',
      value: cards.verifiedApplications ?? 0,
      icon: ShieldCheck,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Returned for Correction',
      value: cards.returnedForCorrection ?? 0,
      icon: RotateCcw,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Rejected Applications',
      value: cards.rejectedApplications ?? 0,
      icon: XCircle,
      iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Final Approved Applications',
      value: cards.finalApprovedApplications ?? 0,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  // 6 Pipeline Stages for Verification Overview
  const verificationPipeline = [
    {
      stage: 'registration',
      name: 'Registration Verification',
      count: stageCounts.registration ?? 0,
      path: '/admin/verifications/registration',
      icon: UserCheck,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
      description: 'Account identity, duplicate checks',
    },
    {
      stage: 'profile',
      name: 'Student Profile Verification',
      count: stageCounts.profile ?? 0,
      path: '/admin/verifications/profile',
      icon: User,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
      description: 'Academic & personal completeness',
    },
    {
      stage: 'document',
      name: 'Document Verification',
      count: stageCounts.document ?? 0,
      path: '/admin/verifications/documents',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
      description: 'Aadhaar, income, marksheet, passbook',
    },
    {
      stage: 'institute',
      name: 'Institute Verification',
      count: stageCounts.institute ?? 0,
      path: '/admin/verifications/institute',
      icon: Building,
      color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
      description: 'College enrollment & bonafide status',
    },
    {
      stage: 'officer',
      name: 'Officer Verification',
      count: stageCounts.officer ?? 0,
      path: '/admin/verifications/officer',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
      description: 'Scheme eligibility & recommendation',
    },
    {
      stage: 'finalDecision',
      name: 'Final Decision',
      count: stageCounts.finalDecision ?? 0,
      path: '/admin/verifications/final',
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
      description: 'Consolidated sign-off & award decision',
    },
  ];

  const fraudApplications = recent.filter(app => app.fraudFlags && app.fraudFlags.length > 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white font-display">
            Central Scholarship Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PMSS Government-level Scholarship Management Console & Verification Pipeline
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/verifications/history"
            className="px-3.5 py-2 border border-slate-200 dark:border-[#132235] hover:bg-slate-50 dark:hover:bg-[#132235] text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <History className="w-4 h-4 text-slate-400" />
            Audit History
          </Link>
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 border border-slate-200 dark:border-[#132235] hover:bg-slate-50 dark:hover:bg-[#132235] text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <BarChart2 className="w-4 h-4 text-slate-400" />
            Reports
          </Link>
          <Link
            to="/admin/verifications/documents"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
          >
            Document Verification
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
                Dashboard Data Retrieval Issue
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          {summaryCards.map((card) => (
            <StatsCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* Verification Overview Section */}
      <div className="bg-white dark:bg-[#07111C] border border-slate-200 dark:border-[#132235] rounded-3xl p-5 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-[#132235]">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Verification Overview: Application Pipeline Stages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live count of student applications awaiting review across each verification stage in the PMSS workflow.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            Real Database Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {verificationPipeline.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.stage}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#03070D] border border-slate-100 dark:border-[#132235] flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Stage {idx + 1}
                    </span>
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-[#132235] flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none block">
                      {item.count}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">
                      Pending
                    </span>
                  </div>

                  <Link
                    to={item.path}
                    className="px-2 py-1 bg-white dark:bg-[#07111C] hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 rounded-lg border border-slate-200 dark:border-[#1F304B] text-[10px] font-bold flex items-center gap-1 transition shadow-2xs"
                  >
                    Review <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Recent Applications & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#07111C] border border-slate-200/80 dark:border-[#132235] rounded-3xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#132235]">
              <h2 className="font-extrabold text-slate-800 dark:text-white text-xs tracking-wider uppercase">
                Recent Submitted Applications
              </h2>
              <Link to="/admin/applications" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
                View All Applications
              </Link>
            </div>

            {loading ? (
              <SkeletonTable rows={5} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-[#03070D] border-b border-slate-100 dark:border-[#132235]">
                      {['Student Details', 'Institution / Course', 'Category', 'Status', 'Verification'].map((h) => (
                        <th key={h} className="text-left font-bold text-slate-400 uppercase p-4 text-[10px] tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#132235] font-medium">
                    {recent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold">
                          No student applications submitted yet.
                        </td>
                      </tr>
                    ) : (
                      recent.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-[#0B1524] transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{app.studentId?.fullName || '—'}</p>
                              <p className="text-[10px] text-slate-400 font-normal mt-0.5">{app.studentId?.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                            <p className="font-semibold">{app.academicDetails?.institutionName || '—'}</p>
                            <p className="text-[10px] text-slate-400 font-normal mt-0.5">{app.academicDetails?.courseName || '—'}</p>
                          </td>
                          <td className="p-4">
                            {app.personalDetails?.category ? (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#132235] text-slate-600 dark:text-slate-300 rounded-full font-bold">
                                {app.personalDetails.category}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="p-4">
                            <Link
                              to={`/admin/verifications/documents`}
                              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                              Review Docs →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Security & Duplicate Flags */}
          <div className="bg-white dark:bg-[#07111C] p-5 rounded-3xl border border-slate-200/80 dark:border-[#132235] shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-[#132235] pb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Security & Fraud Flags
            </h3>
            
            {fraudApplications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-semibold text-[10px]">
                No active security flags detected across current submissions.
              </div>
            ) : (
              <div className="space-y-3">
                {fraudApplications.slice(0, 3).map((app) => (
                  <div key={app._id} className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-white text-[11px]">{app.studentId?.fullName}</span>
                      <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-black uppercase">CRITICAL</span>
                    </div>
                    {app.fraudFlags.slice(0, 1).map((flag, idx) => (
                      <p key={idx} className="text-[10px] text-red-700 dark:text-red-300 leading-normal font-medium">{flag.description}</p>
                    ))}
                    <Link to={`/admin/verifications/registration`} className="text-[9px] text-red-600 font-black hover:underline block pt-1">
                      Inspect Duplicate Flag →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Audit Logs */}
          <div className="bg-white dark:bg-[#07111C] p-5 rounded-3xl border border-slate-200/80 dark:border-[#132235] shadow-xs flex flex-col max-h-[340px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#132235] pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Recent Audit Trail
              </h3>
              <Link to="/admin/verifications/history" className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline">
                View All Logs
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-[10px]">No audit logs available.</div>
              ) : (
                logs.slice(0, 5).map((log) => {
                  const date = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={log._id} className="pb-2 border-b border-slate-100 dark:border-[#132235] last:border-b-0">
                      <div className="flex justify-between text-[9px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.userId?.fullName || 'System'}</span>
                        <span className="text-slate-400">{date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Action: <span className="font-bold text-slate-700 dark:text-slate-300">{log.action.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
