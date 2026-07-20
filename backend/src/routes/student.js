const express = require('express');
const { protect, studentOnly } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('../services/email');
const { syncAnalyticsDb } = require('../utils/syncHelper');
const { mergeProfileData, normalizeProfilePayload, calculateCompletionPercentage } = require('../utils/profileWorkflow');

const router = express.Router();

// All routes require login + student role
router.use(protect, studentOnly);

const StudentProfile = require('../models/StudentProfile');

// @route   GET /api/student/profile
router.get('/profile', async (req, res) => {
  try {
    console.log('[DEBUG] Incoming GET /api/student/profile for User ID:', req.user._id);
    let profile = await StudentProfile.findOne({ studentId: req.user._id });
    if (!profile) {
      const user = await User.findById(req.user._id);
      const initialProfileData = {
        studentId: req.user._id,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dateOfBirth || null,
        gender: '',
        category: '',
        aadhaar: '',
        bloodGroup: '',
        nationality: 'Indian',
        address: {
          permanentAddress: '',
          currentAddress: '',
          state: user.state || '',
          district: user.district || '',
          pincode: '',
        },
        collegeName: user.institution || '',
        universityName: '',
        degree: '',
        department: user.course || '',
        yearOfStudy: user.yearOfStudy || '',
        rollNumber: '',
        academicYear: '',
        cgpa: null,
        fatherName: '',
        motherName: '',
        parentOccupation: '',
        familyIncome: null,
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        profilePhoto: '',
        documents: {},
        profileCompleted: false,
        completionPercentage: 0,
      };

      profile = await StudentProfile.create(initialProfileData);
      console.log('[DEBUG] MongoDB Fetch Result (New Initialized Profile):', profile.toObject());
      return res.json({ success: true, message: 'Profile default data initialized.', data: profile, exists: false });
    }
    console.log('[DEBUG] MongoDB Fetch Result (Existing Profile):', profile.toObject());
    return res.json({ success: true, message: 'Profile fetched.', data: profile, exists: true });
  } catch (error) {
    console.error('[DEBUG] Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// Profile update handler supporting both PUT and PATCH /api/student/profile
const saveProfileHandler = async (req, res) => {
  try {
    console.log('[DEBUG] Incoming Request Body:', req.body);
    let profile = await StudentProfile.findOne({ studentId: req.user._id });
    console.log('[DEBUG] Existing Profile:', profile ? profile.toObject() : null);

    if (!profile) {
      profile = new StudentProfile({ studentId: req.user._id });
    }

    const body = req.body || {};

    // Email validation
    if (body.email !== undefined && body.email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address format.' });
      }
    }

    // Phone validation
    if (body.phone !== undefined && body.phone !== '') {
      const cleanPhone = String(body.phone).replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
      }
    }

    // Aadhaar validation & uniqueness check
    if (body.aadhaar !== undefined && body.aadhaar !== '') {
      const cleanAadhaar = String(body.aadhaar).replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        return res.status(400).json({ success: false, message: 'Aadhaar number must be exactly 12 digits.' });
      }
      
      const dup = await StudentProfile.findOne({
        studentId: { $ne: req.user._id },
        aadhaar: cleanAadhaar,
      });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Aadhaar number is already registered in another profile.' });
      }
    }

    // IFSC validation
    if (body.ifscCode !== undefined && body.ifscCode !== '') {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(String(body.ifscCode).toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Invalid bank IFSC code format. E.g. SBIN0012345' });
      }
    }

    // Top-level fields to update after merging with existing profile data
    const existingObj = profile.toObject();
    const merged = mergeProfileData(existingObj, body);

    const directFields = [
      'fullName', 'dob', 'gender', 'category', 'email', 'phone', 'aadhaar', 'bloodGroup', 'nationality',
      'collegeName', 'universityName', 'degree', 'department', 'yearOfStudy', 'rollNumber', 'academicYear', 'cgpa',
      'fatherName', 'motherName', 'parentOccupation', 'familyIncome',
      'bankName', 'accountHolderName', 'accountNumber', 'ifscCode', 'branchName',
      'profilePhoto'
    ];

    directFields.forEach((field) => {
      if (merged[field] !== undefined) {
        profile[field] = merged[field];
      }
    });

    // Merge nested address fields
    if (merged.address && typeof merged.address === 'object') {
      if (!profile.address) profile.address = {};
      const addressFields = ['permanentAddress', 'currentAddress', 'state', 'district', 'pincode'];
      addressFields.forEach((f) => {
        if (merged.address[f] !== undefined) {
          profile.address[f] = merged.address[f];
        }
      });
    }

    // Merge nested documents fields
    if (merged.documents && typeof merged.documents === 'object') {
      if (!profile.documents) profile.documents = {};
      const docFields = ['aadhaar', 'incomeCertificate', 'casteCertificate', 'marksheet', 'bankPassbook', 'bonafide', 'photo'];
      docFields.forEach((f) => {
        if (merged.documents[f] !== undefined) {
          profile.documents[f] = merged.documents[f];
        }
      });
    }

    console.log('[DEBUG] Merged Profile:', profile.toObject());

    // Recalculate completion based on updated merged document
    const allFields = [
      profile.fullName, profile.dob, profile.gender, profile.category, profile.phone, profile.email, profile.aadhaar, profile.bloodGroup, profile.nationality,
      profile.address?.permanentAddress, profile.address?.currentAddress, profile.address?.state, profile.address?.district, profile.address?.pincode,
      profile.collegeName, profile.universityName, profile.degree, profile.department, profile.yearOfStudy, profile.rollNumber, profile.academicYear, profile.cgpa,
      profile.fatherName, profile.motherName, profile.parentOccupation, profile.familyIncome,
      profile.bankName, profile.accountHolderName, profile.accountNumber, profile.ifscCode, profile.branchName,
      profile.profilePhoto,
      profile.documents?.aadhaar, profile.documents?.incomeCertificate, profile.documents?.casteCertificate, profile.documents?.marksheet, profile.documents?.bankPassbook
    ];
    const totalFieldsCount = allFields.length;
    const filledFieldsCount = allFields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
    profile.completionPercentage = Math.round((filledFieldsCount / totalFieldsCount) * 100);

    const requiredFields = [
      profile.fullName, profile.dob, profile.gender, profile.category, profile.phone, profile.email, profile.aadhaar,
      profile.address?.permanentAddress, profile.address?.state, profile.address?.district, profile.address?.pincode,
      profile.collegeName, profile.degree, profile.department, profile.yearOfStudy, profile.rollNumber, profile.academicYear, profile.cgpa,
      profile.fatherName, profile.motherName, profile.familyIncome,
      profile.bankName, profile.accountHolderName, profile.accountNumber, profile.ifscCode, profile.branchName,
      profile.profilePhoto,
      profile.documents?.aadhaar, profile.documents?.incomeCertificate, profile.documents?.marksheet, profile.documents?.bankPassbook
    ];
    profile.profileCompleted = requiredFields.every(f => f !== undefined && f !== null && String(f).trim() !== '');

    await profile.save();
    console.log('[DEBUG] MongoDB Update Result:', profile.toObject());
    return res.json({ success: true, message: 'Profile saved successfully.', data: profile });
  } catch (error) {
    console.error('[DEBUG] Error saving profile:', error);
    return res.status(500).json({ success: false, message: 'Server error saving profile.', error: error.message });
  }
};

// @route   PUT /api/student/profile
router.put('/profile', saveProfileHandler);

// @route   PATCH /api/student/profile
router.patch('/profile', saveProfileHandler);

// @route   POST /api/student/profile/delete-request
router.post('/profile/delete-request', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ studentId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    profile.deleteRequested = true;
    profile.deleteRequestedAt = new Date();
    await profile.save();
    return res.json({ success: true, message: 'Profile deletion request submitted to Admin for approval.', data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// @route   GET /api/student/application
router.get('/application', async (req, res) => {
  try {
    const application = await Application.findOne({ studentId: req.user._id });
    if (!application) {
      return res.json({ success: true, message: 'No application found.', data: null });
    }
    return res.json({ success: true, message: 'Application fetched.', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @route   POST /api/student/application
// @desc    Creates a new application (draft or submitted)
router.post('/application', async (req, res) => {
  try {
    const existing = await Application.findOne({ studentId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an application. Use PUT to update it.',
      });
    }

    const { personalDetails, academicDetails, bankDetails, documents, ocrData, status } = req.body;
    const appStatus = status === 'submitted' ? 'submitted' : 'draft';

    if (appStatus === 'submitted') {
      const StudentProfile = require('../models/StudentProfile');
      const profile = await StudentProfile.findOne({ studentId: req.user._id });
      if (!profile || (profile.completionPercentage || 0) < 80) {
        return res.status(400).json({
          success: false,
          message: `Minimum 80% profile completion is required to submit your application. Current: ${profile ? profile.completionPercentage : 0}%. Please complete your profile.`,
        });
      }
    }

    // Fetch profile to copy/merge documents
    const profile = await StudentProfile.findOne({ studentId: req.user._id });
    const profileDocs = profile ? {
      aadhaar: profile.documents?.aadhaar || '',
      incomeCertificate: profile.documents?.incomeCertificate || '',
      casteCertificate: profile.documents?.casteCertificate || '',
      marksheet: profile.documents?.marksheet || '',
      bankPassbook: profile.documents?.bankPassbook || '',
      bonafide: profile.documents?.bonafide || '',
      photo: profile.profilePhoto || profile.documents?.photo || '',
    } : {};

    const mergedDocs = { ...profileDocs, ...documents };

    const application = new Application({
      studentId: req.user._id,
      personalDetails,
      academicDetails,
      bankDetails,
      documents: mergedDocs,
      ocrData,
      status: appStatus,
      submittedAt: appStatus === 'submitted' ? new Date() : undefined,
      statusHistory: [{ status: appStatus, changedAt: new Date(), remark: appStatus === 'submitted' ? 'Application submitted.' : 'Draft created.' }],
    });

    // Run Fraud Checks on Submission
    if (appStatus === 'submitted') {
      // 1. Check duplicate Aadhaar
      if (personalDetails.aadhaarNumber) {
        const dupAadhaar = await Application.findOne({
          studentId: { $ne: req.user._id },
          'personalDetails.aadhaarNumber': personalDetails.aadhaarNumber,
          status: { $ne: 'draft' },
        });
        if (dupAadhaar) {
          application.fraudFlags.push({
            flagType: 'duplicate_aadhaar',
            description: `Aadhaar number is already associated with another student's application.`,
            severity: 'high',
          });
        }
      }

      // 2. Check duplicate Bank Account
      if (bankDetails.accountNumber) {
        const dupBank = await Application.findOne({
          studentId: { $ne: req.user._id },
          'bankDetails.accountNumber': bankDetails.accountNumber,
          status: { $ne: 'draft' },
        });
        if (dupBank) {
          application.fraudFlags.push({
            flagType: 'duplicate_bank',
            description: `Bank account number is registered in another scholarship application.`,
            severity: 'high',
          });
        }
      }

      // 3. OCR Name/DOB mismatches
      if (ocrData) {
        if (ocrData.fullName && personalDetails.fullName && ocrData.fullName.trim().toUpperCase() !== personalDetails.fullName.trim().toUpperCase()) {
          application.fraudFlags.push({
            flagType: 'mismatch_name',
            description: `Name on uploaded Aadhaar (${ocrData.fullName}) does not match application name (${personalDetails.fullName}).`,
            severity: 'medium',
          });
        }
        if (ocrData.aadhaarNumber && personalDetails.aadhaarNumber && ocrData.aadhaarNumber.replace(/[^0-9]/g, '') !== personalDetails.aadhaarNumber.replace(/[^0-9]/g, '')) {
          application.fraudFlags.push({
            flagType: 'mismatch_aadhaar',
            description: `Aadhaar Number on document does not match form Aadhaar.`,
            severity: 'high',
          });
        }
      }

      // Send Email
      emailService.sendApplicationSubmitted(req.user, application._id).catch(console.error);

      // Create Notification
      await Notification.create({
        recipientId: req.user._id,
        title: 'Application Submitted',
        message: 'Your scholarship application has been successfully submitted and is pending Institution verification.',
        type: 'success',
      });
    }

    await application.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: appStatus === 'submitted' ? 'submit_application' : 'save_draft',
      ipAddress: req.ip,
      details: { applicationId: application._id, fraudFlagsCount: application.fraudFlags.length },
    });

    syncAnalyticsDb().catch(err => console.error('Failed to sync analytics:', err.message));

    return res.status(201).json({
      success: true,
      message: appStatus === 'submitted' ? 'Application submitted successfully.' : 'Draft saved.',
      data: application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// @route   PUT /api/student/application/:id
// @desc    Updates an existing application
router.put('/application/:id', async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only allow edit if draft or submitted
    if (!['draft', 'submitted'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit application in '${application.status}' status.`,
      });
    }

    const { personalDetails, academicDetails, bankDetails, documents, ocrData, status } = req.body;
    const newStatus = status === 'submitted' ? 'submitted' : application.status;
    const isFirstSubmit = application.status === 'draft' && newStatus === 'submitted';

    if (newStatus === 'submitted') {
      const StudentProfile = require('../models/StudentProfile');
      const profile = await StudentProfile.findOne({ studentId: req.user._id });
      if (!profile || (profile.completionPercentage || 0) < 80) {
        return res.status(400).json({
          success: false,
          message: `Minimum 80% profile completion is required to submit your application. Current: ${profile ? profile.completionPercentage : 0}%. Please complete your profile.`,
        });
      }
    }

    // Clear old flags if re-evaluating
    if (newStatus === 'submitted') {
      application.fraudFlags = [];
    }

    // Fetch profile to copy/merge documents
    const profile = await StudentProfile.findOne({ studentId: req.user._id });
    const profileDocs = profile ? {
      aadhaar: profile.documents?.aadhaar || '',
      incomeCertificate: profile.documents?.incomeCertificate || '',
      casteCertificate: profile.documents?.casteCertificate || '',
      marksheet: profile.documents?.marksheet || '',
      bankPassbook: profile.documents?.bankPassbook || '',
      bonafide: profile.documents?.bonafide || '',
      photo: profile.profilePhoto || profile.documents?.photo || '',
    } : {};

    const mergedDocs = { ...profileDocs, ...application.documents, ...documents };

    Object.assign(application, {
      personalDetails: { ...application.personalDetails, ...personalDetails },
      academicDetails: { ...application.academicDetails, ...academicDetails },
      bankDetails: { ...application.bankDetails, ...bankDetails },
      documents: mergedDocs,
      ocrData: ocrData ? { ...application.ocrData, ...ocrData } : application.ocrData,
      status: newStatus,
    });

    if (isFirstSubmit || newStatus === 'submitted') {
      application.submittedAt = new Date();
      application.statusHistory.push({ status: 'submitted', changedAt: new Date(), remark: 'Application submitted.' });

      // Run Fraud Checks
      const pDetails = application.personalDetails;
      const bDetails = application.bankDetails;
      const oData = application.ocrData;

      if (pDetails.aadhaarNumber) {
        const dupAadhaar = await Application.findOne({
          studentId: { $ne: req.user._id },
          'personalDetails.aadhaarNumber': pDetails.aadhaarNumber,
          status: { $ne: 'draft' },
        });
        if (dupAadhaar) {
          application.fraudFlags.push({
            flagType: 'duplicate_aadhaar',
            description: `Aadhaar number is already associated with another student's application.`,
            severity: 'high',
          });
        }
      }

      if (bDetails.accountNumber) {
        const dupBank = await Application.findOne({
          studentId: { $ne: req.user._id },
          'bankDetails.accountNumber': bDetails.accountNumber,
          status: { $ne: 'draft' },
        });
        if (dupBank) {
          application.fraudFlags.push({
            flagType: 'duplicate_bank',
            description: `Bank account number is registered in another scholarship application.`,
            severity: 'high',
          });
        }
      }

      if (oData) {
        if (oData.fullName && pDetails.fullName && oData.fullName.trim().toUpperCase() !== pDetails.fullName.trim().toUpperCase()) {
          application.fraudFlags.push({
            flagType: 'mismatch_name',
            description: `Name on uploaded Aadhaar (${oData.fullName}) does not match application name (${pDetails.fullName}).`,
            severity: 'medium',
          });
        }
        if (oData.aadhaarNumber && pDetails.aadhaarNumber && oData.aadhaarNumber.replace(/[^0-9]/g, '') !== pDetails.aadhaarNumber.replace(/[^0-9]/g, '')) {
          application.fraudFlags.push({
            flagType: 'mismatch_aadhaar',
            description: `Aadhaar Number on document does not match form Aadhaar.`,
            severity: 'high',
          });
        }
      }

      emailService.sendApplicationSubmitted(req.user, application._id).catch(console.error);

      // Create Notification
      await Notification.create({
        recipientId: req.user._id,
        title: 'Application Submitted',
        message: 'Your scholarship application has been successfully submitted and is pending Institution verification.',
        type: 'success',
      });
    }

    await application.save();

    // Create Audit Log
    await AuditLog.create({
      userId: req.user._id,
      action: isFirstSubmit ? 'submit_application' : 'update_application',
      ipAddress: req.ip,
      details: { applicationId: application._id, status: application.status, fraudFlagsCount: application.fraudFlags.length },
    });

    syncAnalyticsDb().catch(err => console.error('Failed to sync analytics:', err.message));

    return res.json({
      success: true,
      message: newStatus === 'submitted' ? 'Application submitted.' : 'Application updated.',
      data: application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// @route   GET /api/student/application/status
router.get('/application/status', async (req, res) => {
  try {
    const application = await Application.findOne({ studentId: req.user._id })
      .select('status reviewerRemarks statusHistory submittedAt updatedAt');
    if (!application) {
      return res.json({ success: true, message: 'No application found.', data: null });
    }
    return res.json({ success: true, message: 'Status fetched.', data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// @route   GET /api/student/application/letter
// Download approval letter PDF
router.get('/application/letter', async (req, res) => {
  try {
    const application = await Application.findOne({
      studentId: req.user._id,
      status: { $in: ['approved', 'disbursed'] },
    });
    if (!application) {
      return res.status(404).json({ success: false, message: 'No approved or disbursed application found.' });
    }
    const { generateApprovalLetter } = require('../services/pdf');
    generateApprovalLetter(res, application, req.user);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
