import API from './api';

// Applications
export const getAllApplications = (params) =>
  API.get('/admin/applications', { params });

export const getApplicationById = (id) => API.get(`/admin/applications/${id}`);

export const updateApplicationStatus = (id, data) =>
  API.patch(`/admin/applications/${id}/status`, data);

export const downloadLetterAdmin = (id) =>
  API.get(`/admin/applications/${id}/letter`, { responseType: 'blob' });

// Users
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id, isActive) =>
  API.patch(`/admin/users/${id}`, { isActive });

// Dashboard stats
export const getStats = () => API.get('/admin/stats');

// Reports
export const getReports = () => API.get('/admin/reports');
export const downloadReportCSV = () =>
  API.get('/admin/reports', { params: { format: 'csv' }, responseType: 'blob' });

// Audit Logs
export const getAuditLogs = () => API.get('/admin/logs');

// Student Profiles Management
export const getAllProfiles = (params) => API.get('/admin/profiles', { params });
export const getProfileById = (id) => API.get(`/admin/profiles/${id}`);
export const verifyProfile = (id, data) => API.patch(`/admin/profiles/${id}/verify`, data);
export const deleteProfileAdmin = (id) => API.delete(`/admin/profiles/${id}`);

export const updateDocumentStatus = (applicationId, docField, data) =>
  API.patch(`/admin/applications/${applicationId}/documents/${docField}`, data);

export const getAnalyticsDashboard = (params) =>
  API.get('/admin/analytics/dashboard', { params });

// Dedicated Verification Module APIs
export const getVerificationDashboard = async () => {
  try {
    return await API.get('/admin/verifications/dashboard');
  } catch (error) {
    if (error.response?.status === 404) {
      // Fallback to /admin/stats if verification routes are not yet deployed on backend
      const statsRes = await API.get('/admin/stats');
      const stats = statsRes.data?.data || statsRes.data || {};
      const fallbackCards = stats.cards || {
        totalApplications: stats.total || 0,
        pendingVerification: stats.pending || 0,
        applicationsUnderReview: stats.underReview || 0,
        verifiedApplications: stats.verified || 0,
        returnedForCorrection: stats.returnedForCorrection || 0,
        rejectedApplications: stats.rejected || 0,
        finalApprovedApplications: stats.finalApproved || (stats.approved || 0) + (stats.disbursed || 0),
      };
      return {
        ...statsRes,
        data: {
          success: true,
          message: 'Verification dashboard stats retrieved via stats fallback.',
          data: {
            cards: fallbackCards,
            stageCounts: stats.stageCounts || {},
            rawCounts: stats.rawCounts || stats,
          },
        },
      };
    }
    throw error;
  }
};

export const getStageApplications = (stage, params) =>
  API.get(`/admin/verifications/stage/${stage}`, { params });

export const getVerificationDetail = (applicationId) =>
  API.get(`/admin/verifications/${applicationId}`);

export const updateVerificationStage = (applicationId, data) =>
  API.patch(`/admin/verifications/${applicationId}/stage`, data);

export const updateDocumentVerification = (applicationId, docField, data) =>
  API.patch(`/admin/verifications/${applicationId}/documents/${docField}`, data);

export const getApplicationVerificationHistory = (applicationId) =>
  API.get(`/admin/verifications/${applicationId}/history`);

export const getAllVerificationHistory = (params) =>
  API.get('/admin/verifications/history/all', { params });

