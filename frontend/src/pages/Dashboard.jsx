import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import SummaryCards from '../components/dashboard/SummaryCards';
import ApplicationProgressTracker from '../components/dashboard/ApplicationProgressTracker';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import ImportantNotificationsList from '../components/dashboard/ImportantNotificationsList';
import MyDocumentsSection from '../components/dashboard/MyDocumentsSection';
import QuickActions from '../components/dashboard/QuickActions';

import { showError, showSuccess } from '../store/slices/toastSlice';
import { applicationSuccess } from '../store/slices/applicationSlice';
import { getApplication, getProfile } from '../services/studentService';
import { API_BASE_URL } from '../services/apiBase';
import { Download } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { application } = useSelector((s) => s.application);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fullName = user?.fullName || 'Kamesh Kumar';

  const fetchApp = async () => {
    try {
      const res = await getApplication();
      if (res.data.success) {
        dispatch(applicationSuccess(res.data.data));
      }
    } catch (err) {
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApp();
      fetchProfile();
      fetchNotifications();
    }
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      dispatch(showSuccess('All notifications marked as read.'));
    } catch (err) {
      dispatch(showError('Failed to clear notifications.'));
    }
  };

  const handleDownloadLetter = async () => {
    if (!application?._id) return;
    try {
      setDownloading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/applications/${application._id}/letter`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `PMSSS_Approval_Letter_${fullName.replace(/ /g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      dispatch(showSuccess('Letter downloaded successfully!'));
    } catch {
      dispatch(showError('Could not generate letter PDF.'));
    } finally {
      setDownloading(false);
    }
  };

  const appStatus = application?.status || 'draft';
  const isApproved = ['approved', 'disbursed'].includes(appStatus);

  const uploadedDocsCount = profile?.documents
    ? Object.values(profile.documents).filter(Boolean).length
    : 6;
  const totalRequiredDocs = 6;
  const profileCompletion = profile?.completionPercentage || 85;

  const getCurrentStageIndex = () => {
    if (!application) return 3;
    if (appStatus === 'draft') return 1;
    if (appStatus === 'submitted') return 2;
    if (appStatus === 'institution_verified') return 3;
    if (appStatus === 'under_review') return 4;
    if (appStatus === 'approved' || appStatus === 'disbursed') return 5;
    return 3;
  };

  const currentStageIdx = getCurrentStageIndex();

  return (
    <DashboardLayout unreadCount={unreadCount} onNotificationClick={handleMarkAllRead}>
      <div className="space-y-6 sm:space-y-7">
        
        {/* SECTION 1 — PAGE TITLE */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2545] dark:text-white font-display tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A3A3A3] mt-0.5">
            Welcome back, <span className="font-semibold text-gray-800 dark:text-white">{fullName}!</span>
          </p>
        </div>

        {/* Award Letter Download Notice (If Approved) */}
        {application && isApproved && (
          <div className="bg-[#F0FDF4] dark:bg-[#051F10] border border-[#86EFAC] dark:border-[#22C55E]/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E] dark:bg-[#22C55E] animate-pulse" />
              <p className="text-xs sm:text-sm font-semibold text-[#15803D] dark:text-[#22C55E]">
                Congratulations! Your scholarship application has been approved.
              </p>
            </div>
            <button
              onClick={handleDownloadLetter}
              disabled={downloading}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors flex-shrink-0"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Downloading...' : 'Award Letter'}
            </button>
          </div>
        )}

        {/* SECTION 2 — WELCOME BANNER */}
        <WelcomeBanner studentName={fullName} />

        {/* SECTION 3 — APPLICATION SUMMARY */}
        <SummaryCards
          applicationId={application?._id}
          status={appStatus}
          profileCompletion={profileCompletion}
          uploadedDocs={uploadedDocsCount}
          totalDocs={totalRequiredDocs}
        />

        {/* SECTION 4 — APPLICATION PROGRESS */}
        <ApplicationProgressTracker currentStepIndex={currentStageIdx} />

        {/* SECTION 5 — THREE INFORMATION PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          <RecentActivityList />
          <ImportantNotificationsList
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkAllRead}
          />
          <MyDocumentsSection />
        </div>

        {/* SECTION 6 — QUICK ACTIONS */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
