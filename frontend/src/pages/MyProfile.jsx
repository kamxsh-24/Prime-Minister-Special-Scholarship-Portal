import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DocumentUploadCard from '../components/ui/DocumentUploadCard';
import UserAvatar from '../components/ui/UserAvatar';
import { getProfile, updateProfile, requestProfileDeletion } from '../services/studentService';
import { uploadDocuments } from '../services/documentService';
import { profileStart, profileSuccess, profileFailure } from '../store/slices/profileSlice';
import { updateUser } from '../store/slices/authSlice';
import { showSuccess, showError, showInfo } from '../store/slices/toastSlice';
import { BACKEND_ORIGIN } from '../services/apiBase';
import {
  User,
  MapPin,
  GraduationCap,
  Users,
  Landmark,
  FileText,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Calendar,
  Lock
} from 'lucide-react';

const TABS = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'address', label: 'Address Info', icon: MapPin },
];

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const PROFILE_CACHE_KEY = 'pmsss-profile-cache';

const normalizeProfileData = (data) => {
  let formattedDob = '';
  if (data?.dob) {
    formattedDob = new Date(data.dob).toISOString().split('T')[0];
  }

  return {
    fullName: data?.fullName || '',
    dob: formattedDob,
    gender: data?.gender || '',
    email: data?.email || '',
    phone: data?.phone || '',
    aadhaar: data?.aadhaar || '',
    bloodGroup: data?.bloodGroup || '',
    nationality: data?.nationality || 'Indian',
    address: {
      permanentAddress: data?.address?.permanentAddress || '',
      currentAddress: data?.address?.currentAddress || '',
      state: data?.address?.state || '',
      district: data?.address?.district || '',
      pincode: data?.address?.pincode || '',
    },
    collegeName: data?.collegeName || '',
    universityName: data?.universityName || '',
    degree: data?.degree || '',
    department: data?.department || '',
    yearOfStudy: data?.yearOfStudy || '',
    rollNumber: data?.rollNumber || '',
    academicYear: data?.academicYear || '',
    cgpa: data?.cgpa ?? '',
    fatherName: data?.fatherName || '',
    motherName: data?.motherName || '',
    parentOccupation: data?.parentOccupation || '',
    familyIncome: data?.familyIncome ?? '',
    bankName: data?.bankName || '',
    accountHolderName: data?.accountHolderName || '',
    accountNumber: data?.accountNumber || '',
    ifscCode: data?.ifscCode || '',
    branchName: data?.branchName || '',
    profilePhoto: data?.profilePhoto || '',
    category: data?.category || '',
    documents: {
      aadhaar: data?.documents?.aadhaar || '',
      incomeCertificate: data?.documents?.incomeCertificate || '',
      casteCertificate: data?.documents?.casteCertificate || '',
      marksheet: data?.documents?.marksheet || '',
      bankPassbook: data?.documents?.bankPassbook || '',
    },
    documentStatuses: data?.documentStatuses || {},
    profileCompleted: data?.profileCompleted || false,
    completionPercentage: data?.completionPercentage || 0,
    verificationStatus: data?.verificationStatus || 'pending',
    verificationRemarks: data?.verificationRemarks || '',
    deleteRequested: data?.deleteRequested || false,
  };
};

const MyProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form Fields State
  const [profileData, setProfileData] = useState({
    fullName: '', dob: '', gender: '', category: '', email: '', phone: '', aadhaar: '', bloodGroup: '', nationality: 'Indian',
    address: { permanentAddress: '', currentAddress: '', state: '', district: '', pincode: '' },
    collegeName: '', universityName: '', degree: '', department: '', yearOfStudy: '', rollNumber: '', academicYear: '', cgpa: '',
    fatherName: '', motherName: '', parentOccupation: '', familyIncome: '',
    bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', branchName: '',
    profilePhoto: '',
    documents: { aadhaar: '', incomeCertificate: '', casteCertificate: '', marksheet: '', bankPassbook: '' },
    documentStatuses: {},
  });

  const [selectedFiles, setSelectedFiles] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      if (typeof window !== 'undefined') {
        try {
          const cachedProfile = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            setProfileData(normalizeProfileData(parsed));
          }
        } catch {
          // ignore cache parse failures
        }
      }

      dispatch(profileStart());
      try {
        const res = await getProfile();
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          const nextProfileData = normalizeProfileData(data);
          console.log('[DEBUG] React State (profileData):', nextProfileData);
          console.log('[DEBUG] Redux State (user):', user);
          setProfileData(nextProfileData);

          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
          }

          dispatch(profileSuccess({ data, exists: res.data.exists }));
        }
      } catch (err) {
        dispatch(profileFailure(err.message));
        dispatch(showError('Failed to load profile.'));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [dispatch, user]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      const next = { ...prev, [name]: value };
      validateCurrentSection(next);
      return next;
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => {
      const next = {
        ...prev,
        address: { ...prev.address, [name]: value }
      };
      validateCurrentSection(next);
      return next;
    });
  };

  const handleDocChange = (fieldName, file) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  // Form Validation logic
  const getFieldValue = (source, path) => path.split('.').reduce((acc, key) => acc?.[key], source);

  const sectionRules = {
    personal: [
      { field: 'fullName', path: 'fullName', message: 'Full Name is required.' },
      { field: 'dob', path: 'dob', message: 'Date of Birth is required.' },
      { field: 'gender', path: 'gender', message: 'Gender is required.' },
      { field: 'category', path: 'category', message: 'Category is required.' },
      { field: 'nationality', path: 'nationality', message: 'Nationality is required.' },
      { field: 'email', path: 'email', message: 'Email Address is required.' },
      { field: 'phone', path: 'phone', message: 'Mobile Number is required.' },
      { field: 'aadhaar', path: 'aadhaar', message: 'Aadhaar Number is required.' },
    ],
    address: [
      { field: 'address.permanentAddress', path: 'address.permanentAddress', message: 'Permanent Address is required.' },
      { field: 'address.currentAddress', path: 'address.currentAddress', message: 'Current Address is required.' },
      { field: 'address.state', path: 'address.state', message: 'State is required.' },
      { field: 'address.district', path: 'address.district', message: 'District is required.' },
      { field: 'address.pincode', path: 'address.pincode', message: 'Pincode is required.' },
    ],
  };

  const validateCurrentSection = (data = profileData, section = activeTab) => {
    const errors = {};
    const rules = sectionRules[section] || [];

    rules.forEach(({ field, path, message }) => {
      const value = getFieldValue(data, path);
      if (!value || String(value).trim() === '') {
        errors[field] = message;
      }
    });

    if (section === 'personal') {
      if (data.email?.trim()) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(data.email)) {
          errors.email = 'Invalid email address format.';
        }
      }
      if (data.phone?.trim()) {
        const cleanVal = data.phone.replace(/\D/g, '');
        if (cleanVal.length !== 10) {
          errors.phone = 'Mobile number must be exactly 10 digits.';
        }
      }
      if (data.aadhaar?.trim()) {
        const cleanVal = data.aadhaar.replace(/\D/g, '');
        if (cleanVal.length !== 12) {
          errors.aadhaar = 'Aadhaar must be exactly 12 digits.';
        }
      }
    }

    console.log(`[profile-validation][${section}]`, errors);
    setValidationErrors(errors);
    return errors;
  };

  const calculateCompletion = () => {
    const fields = [
      profileData.fullName, profileData.dob, profileData.gender, profileData.category, profileData.phone, profileData.email, profileData.aadhaar, profileData.bloodGroup, profileData.nationality,
      profileData.address?.permanentAddress, profileData.address?.currentAddress, profileData.address?.state, profileData.address?.district, profileData.address?.pincode,
    ];
    const filled = fields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sectionErrors = validateCurrentSection(profileData, activeTab);
    if (Object.keys(sectionErrors).length > 0) {
      dispatch(showError('Please complete the required fields in this section.'));
      return;
    }

    setSaving(true);
    try {
      // 1. Upload files first if selected
      let updatedPhoto = profileData.profilePhoto;
      let updatedDocs = { ...profileData.documents };

      const fileEntries = Object.entries(selectedFiles).filter(([, v]) => v instanceof File);
      if (fileEntries.length > 0) {
        dispatch(showInfo('Uploading profile files...'));
        const formData = new FormData();
        fileEntries.forEach(([key, file]) => {
          formData.append(key, file);
        });
        
        const uploadRes = await uploadDocuments(formData);
        if (uploadRes.data.success) {
          const urls = uploadRes.data.data;
          if (urls.photo) updatedPhoto = urls.photo;
          
          Object.keys(urls).forEach((key) => {
            if (key !== 'photo') {
              updatedDocs[key] = urls[key];
            }
          });
        }
      }

      // 2. Submit Profile Update payload (Always send the complete profile object)
      const payload = {
        fullName: profileData.fullName,
        dob: profileData.dob ? new Date(profileData.dob) : null,
        gender: profileData.gender,
        category: profileData.category,
        email: profileData.email,
        phone: profileData.phone,
        aadhaar: profileData.aadhaar,
        bloodGroup: profileData.bloodGroup,
        nationality: profileData.nationality,
        address: {
          permanentAddress: profileData.address?.permanentAddress || '',
          currentAddress: profileData.address?.currentAddress || '',
          state: profileData.address?.state || '',
          district: profileData.address?.district || '',
          pincode: profileData.address?.pincode || '',
        },
        collegeName: profileData.collegeName,
        universityName: profileData.universityName,
        degree: profileData.degree,
        department: profileData.department,
        yearOfStudy: profileData.yearOfStudy,
        rollNumber: profileData.rollNumber,
        academicYear: profileData.academicYear,
        cgpa: profileData.cgpa,
        fatherName: profileData.fatherName,
        motherName: profileData.motherName,
        parentOccupation: profileData.parentOccupation,
        familyIncome: profileData.familyIncome,
        bankName: profileData.bankName,
        accountHolderName: profileData.accountHolderName,
        accountNumber: profileData.accountNumber,
        ifscCode: profileData.ifscCode,
        branchName: profileData.branchName,
        profilePhoto: updatedPhoto,
        documents: updatedDocs,
      };

      const res = await updateProfile(payload);
      if (res.data.success) {
        dispatch(showSuccess('Profile updated successfully.'));

        const latestRes = await getProfile();
        if (latestRes.data.success && latestRes.data.data) {
          const freshData = latestRes.data.data;
          const nextProfileData = normalizeProfileData(freshData);
          setProfileData(nextProfileData);

          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(freshData));
          }

          dispatch(profileSuccess({ data: freshData, exists: true }));
          window.dispatchEvent(new Event('pmsss-profile-updated'));
        }

        const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
        if (currentIndex >= 0 && currentIndex < TABS.length - 1) {
          setActiveTab(TABS[currentIndex + 1].id);
        }
        setSelectedFiles({});
        setValidationErrors({});
      }
    } catch (err) {
      dispatch(showError(err.response?.data?.message || 'Failed to save profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    setDeleteLoading(true);
    try {
      const res = await requestProfileDeletion();
      if (res.data.success) {
        dispatch(showSuccess('Deletion request submitted successfully.'));
        setProfileData(prev => ({ ...prev, deleteRequested: true }));
        setShowDeleteModal(false);
      }
    } catch (err) {
      dispatch(showError('Failed to submit deletion request.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const completionPercent = calculateCompletion();

  const renderValidationMessage = (field) =>
    validationErrors[field] ? (
      <p className="mt-1 text-[11px] text-red-500">{validationErrors[field]}</p>
    ) : null;

  const getFieldClassName = (fieldName, baseClass = 'form-input') => {
    const hasError = Boolean(validationErrors[fieldName]);
    return `${baseClass} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`.trim();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card p-6 border border-[#E5E7EB] dark:border-[#132235] shadow-sm">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={profileData.profilePhoto}
              name={profileData.fullName || user?.fullName}
              className="h-16 w-16 rounded-full border-2 border-blue-500/30"
              textClassName="text-xl font-bold"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F2A5F] dark:text-[#F8FAFC]">{profileData.fullName || user?.fullName}</h1>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">Role: Student • {profileData.email}</p>
              
              <div className="flex gap-2 mt-2">
                {/* Verification Status Badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  profileData.verificationStatus === 'verified'
                    ? 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC] dark:bg-[#072414] dark:text-[#22C55E] dark:border-[#22C55E]/30'
                    : profileData.verificationStatus === 'rejected'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-[#240A0A] dark:text-[#EF4444] dark:border-[#EF4444]/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#1E170C] dark:text-[#F59E0B] dark:border-[#F59E0B]/30'
                }`}>
                  {profileData.verificationStatus === 'verified' ? '✓ Verified' : profileData.verificationStatus === 'rejected' ? '✗ Rejected' : '⧗ Pending Verify'}
                </span>
                
                {profileData.deleteRequested && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-[#240A0A] dark:text-[#EF4444] uppercase tracking-wider">
                    Delete Requested
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="w-full md:w-64 space-y-2 bg-[#F5F8FC] dark:bg-[#03070D] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#132235]">
            <div className="flex justify-between items-center text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">
              <span>Profile Complete</span>
              <span className="text-[#1769FF] dark:text-[#1769FF] font-bold">{completionPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#132235] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1769FF] dark:bg-[#1769FF] h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Complete profile to unlock application autofills.</p>
          </div>
        </div>

        {/* Tab & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Tab Selection Navigation */}
          <div className="card p-3 space-y-1 border border-gray-200 dark:border-[#333333]">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-[#4FC3F7] dark:text-black shadow-sm font-bold'
                      : 'text-gray-700 dark:text-[#E0E0E0] hover:bg-gray-100 dark:hover:bg-[#1E1E1E]'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content Panel */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="card border border-gray-200 dark:border-[#333333] shadow-card overflow-hidden">
              
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* 1. PERSONAL DETAILS */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#0B1F3A] dark:text-white border-b border-gray-200 dark:border-[#333333] pb-3">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
                        <input
                          type="text" id="fullName" name="fullName" placeholder="Full Name"
                          value={profileData.fullName} onChange={handleFieldChange} className={getFieldClassName('fullName', 'form-input')} required
                        />
                      </div>
                      <div>
                        <label htmlFor="dob" className="text-xs font-semibold text-gray-500 mb-1 block">Date of Birth *</label>
                        <input
                          type="date" id="dob" name="dob" placeholder="Date of Birth"
                          value={profileData.dob} onChange={handleFieldChange} className={getFieldClassName('dob', 'form-input')} required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="gender" className="text-xs font-semibold text-gray-500 mb-1 block">Gender *</label>
                        <select
                          id="gender" name="gender" value={profileData.gender} onChange={handleFieldChange}
                          className={getFieldClassName('gender', 'form-select')} required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {renderValidationMessage('gender')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="category" className="text-xs font-semibold text-gray-500 mb-1 block">Category *</label>
                        <select
                          id="category" name="category" value={profileData.category} onChange={handleFieldChange}
                          className={getFieldClassName('category', 'form-select')} required
                        >
                          <option value="">Select Category</option>
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                        {renderValidationMessage('category')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="bloodGroup" className="text-xs font-semibold text-gray-500 mb-1 block">Blood Group</label>
                        <input
                          type="text" id="bloodGroup" name="bloodGroup" placeholder="Blood Group (e.g. O+)"
                          value={profileData.bloodGroup} onChange={handleFieldChange} className="form-input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="nationality" className="text-xs font-semibold text-gray-500 mb-1 block">Nationality *</label>
                        <input
                          type="text" id="nationality" name="nationality" placeholder="Nationality"
                          value={profileData.nationality} onChange={handleFieldChange} className={getFieldClassName('nationality', 'form-input')} required
                        />
                        {renderValidationMessage('nationality')}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-500 mb-1 block">Email Address *</label>
                        <input
                          type="email" id="email" name="email" placeholder="Email Address"
                          value={profileData.email} onChange={handleFieldChange} className={getFieldClassName('email', 'form-input')} required
                        />
                        {renderValidationMessage('email')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-xs font-semibold text-gray-500 mb-1 block">Mobile Number *</label>
                        <input
                          type="text" id="phone" name="phone" placeholder="Mobile Number"
                          value={profileData.phone} onChange={handleFieldChange} className={getFieldClassName('phone', 'form-input')} required maxLength={10}
                        />
                        {renderValidationMessage('phone')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="aadhaar" className="text-xs font-semibold text-gray-500 mb-1 block">Aadhaar Number *</label>
                        <input
                          type="text" id="aadhaar" name="aadhaar" placeholder="Aadhaar Number"
                          value={profileData.aadhaar} onChange={handleFieldChange} className={getFieldClassName('aadhaar', 'form-input')} required maxLength={12}
                        />
                        {renderValidationMessage('aadhaar')}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ADDRESS DETAILS */}
                {activeTab === 'address' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Address Information</h3>
                    <div className="space-y-1">
                      <label htmlFor="permanentAddress" className="text-xs font-semibold text-gray-500 mb-1 block">Permanent Address *</label>
                      <input
                        type="text" id="permanentAddress" name="permanentAddress" placeholder="Permanent Address"
                        value={profileData.address.permanentAddress} onChange={handleAddressChange} className={getFieldClassName('address.permanentAddress', 'form-input')} required
                      />
                      {renderValidationMessage('address.permanentAddress')}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="currentAddress" className="text-xs font-semibold text-gray-500 mb-1 block">Current/Correspondence Address *</label>
                      <input
                        type="text" id="currentAddress" name="currentAddress" placeholder="Current Address"
                        value={profileData.address.currentAddress} onChange={handleAddressChange} className={getFieldClassName('address.currentAddress', 'form-input')} required
                      />
                      {renderValidationMessage('address.currentAddress')}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="state" className="text-xs font-semibold text-gray-500 mb-1 block">State *</label>
                        <select
                          id="state" name="state" value={profileData.address.state} onChange={handleAddressChange}
                          className={getFieldClassName('address.state', 'form-select')} required
                        >
                          <option value="">Select State</option>
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {renderValidationMessage('address.state')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="district" className="text-xs font-semibold text-gray-500 mb-1 block">District *</label>
                        <input
                          type="text" id="district" name="district" placeholder="District"
                          value={profileData.address.district} onChange={handleAddressChange} className={getFieldClassName('address.district', 'form-input')} required
                        />
                        {renderValidationMessage('address.district')}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="pincode" className="text-xs font-semibold text-gray-500 mb-1 block">Pincode *</label>
                        <input
                          type="text" id="pincode" name="pincode" placeholder="Pincode"
                          value={profileData.address.pincode} onChange={handleAddressChange} className={getFieldClassName('address.pincode', 'form-input')} required maxLength={6}
                        />
                        {renderValidationMessage('address.pincode')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={profileData.deleteRequested}
                  className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Request Profile Delete
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile Changes
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

      {/* Delete Request Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-card-lg relative animate-slide-up">
            <h3 className="text-lg font-bold text-rose-600 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Request Profile Deletion
            </h3>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Are you sure you want to request your profile deletion? 
              This will request permission from the administrator to clear all details. 
              Once deleted, you must fill all information again.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRequest}
                disabled={deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1"
              >
                {deleteLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProfile;
