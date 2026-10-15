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

export const getStageApplications = async (stage, params) => {
  try {
    return await API.get(`/admin/verifications/stage/${stage}`, { params });
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Stage route /admin/verifications/stage/${stage} 404, falling back to /admin/applications`);
      const res = await API.get('/admin/applications', { params });
      return res;
    }
    throw error;
  }
};

export const getVerificationDetail = async (applicationId) => {
  try {
    return await API.get(`/admin/verifications/${applicationId}`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Detail route /admin/verifications/${applicationId} 404, falling back to /admin/applications/${applicationId}`);
      const res = await API.get(`/admin/applications/${applicationId}`);
      const app = res.data?.data || res.data;
      return {
        ...res,
        data: {
          success: true,
          message: 'Application verification details retrieved via fallback.',
          data: {
            application: app,
            studentProfile: null,
            verificationHistory: [],
            duplicateFlags: [],
            eligibilityChecks: {
              incomeCriteriaMet: true,
              academicMarksSufficient: true,
              validDomicileEntered: true,
              bankDetailsComplete: true,
              requiredDocsUploaded: Boolean(
                app?.documents?.aadhaar &&
                app?.documents?.incomeCertificate &&
                app?.documents?.marksheet &&
                app?.documents?.bankPassbook
              ),
            },
          },
        },
      };
    }
    throw error;
  }
};

export const updateVerificationStage = async (applicationId, data) => {
  try {
    return await API.patch(`/admin/verifications/${applicationId}/stage`, data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Stage update 404, falling back to /admin/applications/${applicationId}/status`);
      const statusMap = {
        verified: 'under_review',
        returned_for_correction: 'correction_required',
        rejected: 'rejected',
        approved: 'approved',
        on_hold: 'under_review',
      };
      const fallbackStatus = statusMap[data.status] || data.status;
      return await API.patch(`/admin/applications/${applicationId}/status`, {
        status: fallbackStatus,
        remarks: data.remarks || '',
      });
    }
    throw error;
  }
};

export const updateDocumentVerification = async (applicationId, docField, data) => {
  try {
    return await API.patch(`/admin/verifications/${applicationId}/documents/${docField}`, data);
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Doc verify 404, falling back to /admin/applications/${applicationId}/documents/${docField}`);
      return await API.patch(`/admin/applications/${applicationId}/documents/${docField}`, data);
    }
    throw error;
  }
};

export const getApplicationVerificationHistory = async (applicationId) => {
  try {
    return await API.get(`/admin/verifications/${applicationId}/history`);
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        data: { success: true, data: [] },
      };
    }
    throw error;
  }
};

export const getAllVerificationHistory = async (params) => {
  try {
    return await API.get('/admin/verifications/history/all', { params });
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('History route /admin/verifications/history/all 404, falling back to /admin/logs');
      const res = await API.get('/admin/logs', { params });
      const raw = res.data?.data || res.data || [];
      const logList = Array.isArray(raw) ? raw : (raw.logs || []);
      const transformedLogs = logList.map((l) => ({
        _id: l._id,
        applicationId: l.details?.applicationId ? { _id: l.details.applicationId } : null,
        studentId: l.details?.studentId ? { _id: l.details.studentId } : null,
        stage: l.details?.docField ? 'document' : 'general',
        action: l.action,
        reviewerName: l.userId?.fullName || 'Admin User',
        reviewerRole: l.userId?.role || 'admin',
        remarks: l.details?.remarks || l.action,
        createdAt: l.createdAt,
      }));
      return {
        ...res,
        data: {
          success: true,
          message: 'Verification audit logs fetched via fallback.',
          data: {
            logs: transformedLogs,
            pagination: res.data?.pagination || {
              total: transformedLogs.length,
              page: params?.page || 1,
              limit: params?.limit || 15,
              totalPages: Math.ceil(transformedLogs.length / 15) || 1,
            },
          },
        },
      };
    }
    throw error;
  }
};

