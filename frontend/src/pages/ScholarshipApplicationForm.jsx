import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProgressSteps from '../components/ui/ProgressSteps';
import DocumentUploadCard from '../components/ui/DocumentUploadCard';
import { showSuccess, showError, showInfo } from '../store/slices/toastSlice';
import { applicationSuccess } from '../store/slices/applicationSlice';
import { profileSuccess } from '../store/slices/profileSlice';
import { getApplication, createApplication, updateApplication, getProfile } from '../services/studentService';
import { uploadDocuments } from '../services/documentService';
import { ChevronRight, ChevronLeft, Save, Send, Eye, Loader2, Sparkles, CheckCircle2, XCircle, Info, Landmark } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const STEPS = [
  { label: '01 Personal' },
  { label: '02 Address' },
  { label: '03 Academic' },
  { label: '04 Family & Income' },
  { label: '05 Bank Details' },
  { label: '06 Documents' },
];

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const initialPersonal = {
  fullName: '', dateOfBirth: '', gender: '', religion: '', category: '',
  aadhaarNumber: '', phone: '', email: '',
};

const initialAddress = {
  permanentAddress: '', currentAddress: '', state: '', district: '', pincode: '',
};

const initialAcademic = {
  institutionName: '', institutionAddress: '', courseName: '', department: '', yearOfStudy: '',
  rollNumber: '', boardUniversityName: '', previousYearMarks: '', academicYear: '',
};

const initialFamily = {
  fatherName: '', motherName: '', parentOccupation: '', annualIncome: '',
};

const initialBank = {
  accountHolderName: '', bankName: '', branchName: '', accountNumber: '', ifscCode: '',
};

const initialDocs = {
  aadhaar: null, incomeCertificate: null, casteCertificate: null, marksheet: null,
  bankPassbook: null, bonafide: null, photo: null,
};

const PROFILE_CACHE_KEY = 'pmsss-profile-cache';

const FloatInput = ({ id, name, label, value, onChange, type = 'text', required, maxLength, disabled }) => (
  <div>
    <label htmlFor={id} className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">{label}{required ? ' *' : ''}</label>
    <input
      type={type} id={id} name={name} placeholder={label}
      value={value} onChange={onChange} className="form-input disabled:bg-gray-100 dark:disabled:bg-[#1E1E1E] disabled:text-gray-500 dark:disabled:text-[#BDBDBD] disabled:border-gray-200 dark:disabled:border-[#333333]"
      required={required} maxLength={maxLength} disabled={disabled}
    />
  </div>
);

const SelectField = ({ id, name, label, value, onChange, options, required, disabled }) => (
  <div>
    <label htmlFor={id} className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">{label}{required ? ' *' : ''}</label>
    <select id={id} name={name} value={value} onChange={onChange} className="form-select w-full disabled:bg-gray-100 dark:disabled:bg-[#1E1E1E] disabled:text-gray-500 dark:disabled:text-[#BDBDBD]" disabled={disabled}>
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  </div>
);

const ScholarshipApplicationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { application } = useSelector((s) => s.application);
  const { profile: reduxProfile } = useSelector((s) => s.profile);

  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(initialPersonal);
  const [address, setAddress]   = useState(initialAddress);
  const [academic, setAcademic] = useState(initialAcademic);
  const [family, setFamily]     = useState(initialFamily);
  const [bank, setBank]         = useState(initialBank);
  const [docs, setDocs]         = useState(initialDocs);
  const [appId, setAppId]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ocrData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch Student Profile status
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        if (typeof window !== 'undefined') {
          const cachedProfile = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            setProfile(parsed);
          }
        }

        const res = await getProfile();
        if (res.data.success) {
          if (res.data.exists) {
            setProfile(res.data.data);
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(res.data.data));
            }
          } else {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchStudentProfile();
  }, []);

  useEffect(() => {
    if (reduxProfile) {
      setProfile(reduxProfile);
    }
  }, [reduxProfile]);

  // Pre-fill from student profile when loaded
  useEffect(() => {
    if (profile) {
      setPersonal((p) => ({
        fullName: p.fullName || profile.fullName || '',
        dateOfBirth: p.dateOfBirth || (profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''),
        gender: p.gender || profile.gender || '',
        religion: p.religion || '',
        category: p.category || profile.category || '',
        aadhaarNumber: p.aadhaarNumber || profile.aadhaar || '',
        phone: p.phone || profile.phone || '',
        email: p.email || profile.email || '',
      }));
      setAddress((a) => ({
        permanentAddress: a.permanentAddress || profile.address?.permanentAddress || '',
        currentAddress: a.currentAddress || profile.address?.currentAddress || '',
        state: a.state || profile.address?.state || '',
        district: a.district || profile.address?.district || '',
        pincode: a.pincode || profile.address?.pincode || '',
      }));
      setAcademic((a) => ({
        institutionName: a.institutionName || profile.collegeName || '',
        institutionAddress: a.institutionAddress || '',
        courseName: a.courseName || profile.degree || '',
        department: a.department || profile.department || '',
        yearOfStudy: a.yearOfStudy || profile.yearOfStudy || '',
        rollNumber: a.rollNumber || profile.rollNumber || '',
        boardUniversityName: a.boardUniversityName || profile.universityName || '',
        previousYearMarks: a.previousYearMarks || profile.cgpa || '',
        academicYear: a.academicYear || profile.academicYear || '',
      }));
      setFamily((f) => ({
        fatherName: f.fatherName || profile.fatherName || '',
        motherName: f.motherName || profile.motherName || '',
        parentOccupation: f.parentOccupation || profile.parentOccupation || '',
        annualIncome: f.annualIncome || profile.familyIncome || '',
      }));
      setBank((b) => ({
        accountHolderName: b.accountHolderName || profile.accountHolderName || '',
        bankName: b.bankName || profile.bankName || '',
        branchName: b.branchName || profile.branchName || '',
        accountNumber: b.accountNumber || profile.accountNumber || '',
        ifscCode: b.ifscCode || profile.ifscCode || '',
      }));
    }
  }, [profile]);

  // Load draft if exists
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApplication();
        const app = res.data.data;
        if (app) {
          setAppId(app._id);
          if (app.personalDetails) {
            setPersonal((p) => ({ ...p, ...app.personalDetails }));
            setAddress((a) => ({
              permanentAddress: app.personalDetails.permanentAddress || a.permanentAddress,
              currentAddress: app.personalDetails.currentAddress || a.currentAddress,
              state: app.personalDetails.state || a.state,
              district: app.personalDetails.district || a.district,
              pincode: app.personalDetails.pincode || a.pincode,
            }));
            setFamily((f) => ({
              ...f,
              annualIncome: app.personalDetails.annualIncome || f.annualIncome,
            }));
          }
          if (app.academicDetails) setAcademic((a) => ({ ...a, ...app.academicDetails }));
          if (app.bankDetails)     setBank((b) => ({ ...b, ...app.bankDetails }));
          dispatch(applicationSuccess(app));
        }
      } catch { /* new application */ }
    };
    load();
  }, [dispatch]);

  const handleFieldChange = (setter) => (e) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDocChange = (fieldName, file) =>
    setDocs((p) => ({ ...p, [fieldName]: file }));

  const getCompletionScore = () => {
    let score = 0;
    const personalItems = [personal.fullName, personal.dateOfBirth, personal.gender, personal.category, personal.aadhaarNumber];
    score += (personalItems.filter(Boolean).length / personalItems.length) * 20;

    const addressItems = [address.permanentAddress, address.state, address.district];
    score += (addressItems.filter(Boolean).length / addressItems.length) * 15;

    const academicItems = [academic.institutionName, academic.courseName, academic.yearOfStudy, academic.previousYearMarks];
    score += (academicItems.filter(Boolean).length / academicItems.length) * 25;

    const familyItems = [family.fatherName, family.annualIncome];
    score += (familyItems.filter(Boolean).length / familyItems.length) * 15;

    const bankItems = [bank.accountHolderName, bank.bankName, bank.accountNumber, bank.ifscCode];
    score += (bankItems.filter(Boolean).length / bankItems.length) * 15;

    const docItems = ['aadhaar', 'incomeCertificate', 'marksheet', 'photo'];
    const uploadedCount = docItems.filter((d) => 
      docs[d] || 
      application?.documents?.[d] || 
      profile?.documents?.[d] || 
      (d === 'photo' && profile?.profilePhoto)
    ).length;
    score += (uploadedCount / docItems.length) * 10;

    return Math.round(score);
  };

  const getEligibility = () => {
    const reasons = [];
    const recommendations = [];
    let status = 'Eligible';

    const income = family.annualIncome;
    if (income && Number(income) > 800000) {
      status = 'Not Eligible';
      reasons.push('Income exceeds ₹8,00,000 limit.');
      recommendations.push('Consider applying for open/private non-government aid.');
    }

    const marks = academic.previousYearMarks;
    if (marks === undefined || marks === '') {
      if (status !== 'Not Eligible') status = 'Missing Requirements';
      reasons.push('Marks are required.');
      recommendations.push('Fill in your class 12 or equivalent qualifying marks.');
    } else if (Number(marks) < 50) {
      status = 'Not Eligible';
      reasons.push('Marks are below the minimum 50% cutoff.');
      recommendations.push('A minimum academic score of 50% is required.');
    }

    if (!personal.aadhaarNumber || personal.aadhaarNumber.length < 12) {
      if (status !== 'Not Eligible') status = 'Missing Requirements';
      reasons.push('Aadhaar number is missing/incomplete.');
      recommendations.push('Provide a valid 12-digit Aadhaar Card number.');
    }

    if (!address.state) {
      if (status !== 'Not Eligible') status = 'Missing Requirements';
      reasons.push('Domicile State missing.');
      recommendations.push('State Domicile is mandatory to verify local bounds.');
    }

    if (status === 'Eligible' && Number(marks) >= 50 && Number(marks) < 60) {
      status = 'Probably Eligible';
      reasons.push('Marks qualify, but allocation is subject to board ranking cutoffs.');
      recommendations.push('Submit your application early to secure rank queue.');
    }

    return { status, reasons, recommendations };
  };

  const buildPayload = (status = 'draft') => ({
    personalDetails: {
      fullName: personal.fullName,
      dateOfBirth: personal.dateOfBirth ? new Date(personal.dateOfBirth) : undefined,
      gender: personal.gender,
      religion: personal.religion,
      category: personal.category,
      aadhaarNumber: personal.aadhaarNumber,
      phone: personal.phone,
      email: personal.email,
      permanentAddress: address.permanentAddress,
      currentAddress: address.currentAddress,
      state: address.state,
      district: address.district,
      pincode: address.pincode,
      annualIncome: family.annualIncome ? Number(family.annualIncome) : undefined,
    },
    academicDetails: {
      institutionName: academic.institutionName,
      institutionAddress: academic.institutionAddress,
      courseName: academic.courseName,
      department: academic.department,
      yearOfStudy: academic.yearOfStudy,
      rollNumber: academic.rollNumber,
      boardUniversityName: academic.boardUniversityName,
      previousYearMarks: academic.previousYearMarks ? Number(academic.previousYearMarks) : undefined,
      academicYear: academic.academicYear,
    },
    bankDetails: {
      accountHolderName: bank.accountHolderName,
      bankName: bank.bankName,
      branchName: bank.branchName,
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
    },
    ocrData,
    status,
  });

  const saveOrCreate = async (payload) => {
    if (appId) {
      const res = await updateApplication(appId, payload);
      return res.data.data;
    } else {
      const res = await createApplication(payload);
      const app = res.data.data;
      setAppId(app._id);
      return app;
    }
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const appRes = await getApplication();
      const currentApp = appRes.data.data;
      const profileRes = await getProfile();
      const currentProfile = profileRes.data.data;

      const payload = buildPayload('draft');
      payload.documents = {
        aadhaar: currentApp?.documents?.aadhaar || currentProfile?.documents?.aadhaar || '',
        incomeCertificate: currentApp?.documents?.incomeCertificate || currentProfile?.documents?.incomeCertificate || '',
        casteCertificate: currentApp?.documents?.casteCertificate || currentProfile?.documents?.casteCertificate || '',
        marksheet: currentApp?.documents?.marksheet || currentProfile?.documents?.marksheet || '',
        bankPassbook: currentApp?.documents?.bankPassbook || currentProfile?.documents?.bankPassbook || '',
        bonafide: currentApp?.documents?.bonafide || currentProfile?.documents?.bonafide || '',
        photo: currentApp?.documents?.photo || currentProfile?.profilePhoto || currentProfile?.documents?.photo || '',
      };

      const app = await saveOrCreate(payload);
      dispatch(applicationSuccess(app));
      dispatch(showSuccess(`Section ${step + 1} saved successfully!`));
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      }
    } catch (err) {
      dispatch(showError(err.response?.data?.message || 'Failed to save section.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profileRes = await getProfile();
      let latestProfile = profile;
      if (profileRes.data.success && profileRes.data.exists) {
        latestProfile = profileRes.data.data;
        setProfile(latestProfile);
        dispatch(profileSuccess({ data: latestProfile, exists: true }));
      }

      const appRes = await getApplication();
      let latestApp = application;
      if (appRes.data.data) {
        latestApp = appRes.data.data;
        setAppId(latestApp._id);
        dispatch(applicationSuccess(latestApp));
      }

      // Check required sections and documents
      const missingFields = [];
      if (!personal.fullName?.trim()) missingFields.push('Personal Details: Full Name');
      if (!personal.gender) missingFields.push('Personal Details: Gender');
      if (!personal.category) missingFields.push('Personal Details: Category');
      if (!personal.aadhaarNumber?.trim()) missingFields.push('Personal Details: Aadhaar Number');
      if (!address.permanentAddress?.trim()) missingFields.push('Address: Permanent Address');
      if (!address.state) missingFields.push('Address: State');
      if (!address.district?.trim()) missingFields.push('Address: District');
      if (!academic.institutionName?.trim()) missingFields.push('Academic: Institution Name');
      if (!academic.courseName?.trim()) missingFields.push('Academic: Course Name');
      if (!academic.yearOfStudy) missingFields.push('Academic: Year of Study');
      if (!family.fatherName?.trim()) missingFields.push('Family & Income: Father\'s Name');
      if (!family.annualIncome) missingFields.push('Family & Income: Annual Income');
      if (!bank.accountHolderName?.trim()) missingFields.push('Bank Details: Account Holder Name');
      if (!bank.accountNumber?.trim()) missingFields.push('Bank Details: Account Number');
      if (!bank.ifscCode?.trim()) missingFields.push('Bank Details: IFSC Code');

      const requiredDocs = ['aadhaar', 'incomeCertificate', 'marksheet', 'photo'];
      requiredDocs.forEach((field) => {
        const localVal = docs[field];
        const appVal = latestApp?.documents?.[field];
        const profileVal = field === 'photo'
          ? (latestProfile?.profilePhoto || latestProfile?.documents?.photo)
          : latestProfile?.documents?.[field];

        if (!localVal && !appVal && !profileVal) {
          missingFields.push(`Document: ${field}`);
        }
      });

      if (missingFields.length > 0) {
        dispatch(showError(`Application incomplete! Please complete all required sections:\n- ${missingFields.join('\n- ')}`));
        setSubmitting(false);
        return;
      }

      // Upload newly selected files
      const newFiles = Object.entries(docs).filter(([, v]) => v instanceof File);
      if (newFiles.length > 0) {
        dispatch(showInfo('Uploading documents...'));
        const formData = new FormData();
        newFiles.forEach(([key, file]) => formData.append(key, file));
        const uploadRes = await uploadDocuments(formData);
        
        if (uploadRes.data.success) {
          dispatch(showSuccess('Documents uploaded successfully!'));
        }
      }

      const finalProfileRes = await getProfile();
      const finalProfile = finalProfileRes.data.data || latestProfile;
      const finalAppRes = await getApplication();
      const finalApp = finalAppRes.data.data || latestApp;

      const payload = buildPayload('submitted');
      payload.documents = {
        aadhaar: finalApp?.documents?.aadhaar || finalProfile?.documents?.aadhaar || '',
        incomeCertificate: finalApp?.documents?.incomeCertificate || finalProfile?.documents?.incomeCertificate || '',
        casteCertificate: finalApp?.documents?.casteCertificate || finalProfile?.documents?.casteCertificate || '',
        marksheet: finalApp?.documents?.marksheet || finalProfile?.documents?.marksheet || '',
        bankPassbook: finalApp?.documents?.bankPassbook || finalProfile?.documents?.bankPassbook || '',
        bonafide: docs.bonafide instanceof File ? '' : (finalApp?.documents?.bonafide || finalProfile?.documents?.bonafide || ''),
        photo: finalApp?.documents?.photo || finalProfile?.profilePhoto || finalProfile?.documents?.photo || '',
      };

      const app = await saveOrCreate(payload);
      dispatch(applicationSuccess(app));
      dispatch(showSuccess('Application submitted successfully!'));
      navigate('/dashboard/status');
    } catch (err) {
      console.error('[DEBUG] Submission error:', err);
      dispatch(showError(err.response?.data?.message || 'Submission failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isAlreadySubmitted = application && !['draft', 'submitted'].includes(application.status) && application.status;

  if (isAlreadySubmitted) {
    return (
      <DashboardLayout>
        <div className="card p-8 text-center max-w-md mx-auto mt-8">
          <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Application Under Process</h2>
          <p className="text-sm text-gray-500 mb-5">
            Your application is currently <strong>{application.status?.replace('_', ' ')}</strong> and cannot be edited.
          </p>
          <button onClick={() => navigate('/dashboard/status')} className="btn-primary">
            View Status
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const completionPercent = getCompletionScore();
  const eligibility = getEligibility();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-800">{t('apply')}</h1>
              <p className="text-xs text-slate-500 mt-1">Prime Minister Special Scholarship Scheme — Section {step + 1} of {STEPS.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
            <ProgressSteps steps={STEPS} currentStep={step} />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            
            {/* SECTION 1: Personal Information */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">01 Personal Information</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="p-fullname" name="fullName" label={t('fullName')} value={personal.fullName} onChange={handleFieldChange(setPersonal)} required />
                  <FloatInput id="p-dob" name="dateOfBirth" label={t('dob')} type="date" value={personal.dateOfBirth} onChange={handleFieldChange(setPersonal)} required />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField id="p-gender" name="gender" label="Gender" value={personal.gender} onChange={handleFieldChange(setPersonal)} options={['Male','Female','Other']} required />
                  <FloatInput id="p-religion" name="religion" label="Religion" value={personal.religion} onChange={handleFieldChange(setPersonal)} />
                  <SelectField id="p-category" name="category" label={t('caste')} value={personal.category} onChange={handleFieldChange(setPersonal)} options={['SC','ST','OBC','General']} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="p-aadhaar" name="aadhaarNumber" label={t('aadhaar')} value={personal.aadhaarNumber} onChange={handleFieldChange(setPersonal)} maxLength={12} required />
                  <FloatInput id="p-phone" name="phone" label={t('phone')} value={personal.phone} onChange={handleFieldChange(setPersonal)} maxLength={10} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="p-email" name="email" label={t('email')} type="email" value={personal.email} onChange={handleFieldChange(setPersonal)} required />
                </div>
              </div>
            )}

            {/* SECTION 2: Address Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">02 Address Information</h2>
                </div>

                <FloatInput id="addr-perm" name="permanentAddress" label="Permanent Address" value={address.permanentAddress} onChange={handleFieldChange(setAddress)} required />
                <FloatInput id="addr-curr" name="currentAddress" label="Current / Correspondence Address" value={address.currentAddress} onChange={handleFieldChange(setAddress)} />

                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField id="addr-state" name="state" label={t('state')} value={address.state} onChange={handleFieldChange(setAddress)} options={STATES} required />
                  <FloatInput id="addr-district" name="district" label={t('district')} value={address.district} onChange={handleFieldChange(setAddress)} required />
                  <FloatInput id="addr-pin" name="pincode" label="Pincode" value={address.pincode} onChange={handleFieldChange(setAddress)} maxLength={6} required />
                </div>
              </div>
            )}

            {/* SECTION 3: Academic Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">03 Academic Information</h2>
                </div>
                
                <FloatInput id="a-inst" name="institutionName" label={t('institution')} value={academic.institutionName} onChange={handleFieldChange(setAcademic)} required />
                <FloatInput id="a-addr" name="institutionAddress" label="Institution Address" value={academic.institutionAddress} onChange={handleFieldChange(setAcademic)} />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="a-course" name="courseName" label={t('course')} value={academic.courseName} onChange={handleFieldChange(setAcademic)} required />
                  <FloatInput id="a-dept" name="department" label="Branch / Department" value={academic.department} onChange={handleFieldChange(setAcademic)} />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <SelectField id="a-year" name="yearOfStudy" label={t('yearOfStudy')} value={academic.yearOfStudy} onChange={handleFieldChange(setAcademic)}
                    options={['1st Year','2nd Year','3rd Year','4th Year','5th Year']} required />
                  <FloatInput id="a-roll" name="rollNumber" label={t('rollNumber')} value={academic.rollNumber} onChange={handleFieldChange(setAcademic)} />
                  <FloatInput id="a-academicYear" name="academicYear" label="Academic Year (e.g. 2024-25)" value={academic.academicYear} onChange={handleFieldChange(setAcademic)} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="a-marks" name="previousYearMarks" label={t('marks')} type="number" value={academic.previousYearMarks} onChange={handleFieldChange(setAcademic)} required />
                  <FloatInput id="a-uni" name="boardUniversityName" label="Board / University Name" value={academic.boardUniversityName} onChange={handleFieldChange(setAcademic)} required />
                </div>
              </div>
            )}

            {/* SECTION 4: Family & Income Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">04 Family & Income Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="f-father" name="fatherName" label="Father's Name" value={family.fatherName} onChange={handleFieldChange(setFamily)} required />
                  <FloatInput id="f-mother" name="motherName" label="Mother's Name" value={family.motherName} onChange={handleFieldChange(setFamily)} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="f-occ" name="parentOccupation" label="Parent's Occupation" value={family.parentOccupation} onChange={handleFieldChange(setFamily)} />
                  <FloatInput id="f-income" name="annualIncome" label="Annual Family Income (₹)" type="number" value={family.annualIncome} onChange={handleFieldChange(setFamily)} required />
                </div>
              </div>
            )}

            {/* SECTION 5: Bank Details */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">05 Bank Details</h2>
                </div>
                
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 shrink-0 text-amber-500" />
                  Ensure bank accounts are active and seeded with your Aadhaar for Direct Benefit Transfer (DBT).
                </p>

                <FloatInput id="b-holder" name="accountHolderName" label="Account Holder Name" value={bank.accountHolderName} onChange={handleFieldChange(setBank)} required />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="b-bank" name="bankName" label={t('bankName')} value={bank.bankName} onChange={handleFieldChange(setBank)} required />
                  <FloatInput id="b-branch" name="branchName" label="Branch Name" value={bank.branchName} onChange={handleFieldChange(setBank)} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatInput id="b-acc" name="accountNumber" label={t('accNo')} value={bank.accountNumber} onChange={handleFieldChange(setBank)} required />
                  <FloatInput id="b-ifsc" name="ifscCode" label={t('ifsc')} value={bank.ifscCode} onChange={handleFieldChange(setBank)} required />
                </div>
              </div>
            )}

            {/* SECTION 6: Documents */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4 uppercase tracking-wide">06 Documents</h2>
                <p className="text-[11px] text-slate-400">All certificates must be uploaded as legible PDFs (max 2MB). Photo should be JPG/PNG format.</p>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <DocumentUploadCard
                    label="Aadhaar Card *" fieldName="aadhaar" hint="PDF only, max 2MB"
                    value={application?.documents?.aadhaar || profile?.documents?.aadhaar} onChange={handleDocChange}
                    status={application?.documentStatuses?.aadhaar?.status || profile?.documentStatuses?.aadhaar?.status}
                    remarks={application?.documentStatuses?.aadhaar?.remarks || profile?.documentStatuses?.aadhaar?.remarks}
                  />
                  <DocumentUploadCard
                    label="Income Certificate *" fieldName="incomeCertificate" hint="PDF only, max 2MB"
                    value={application?.documents?.incomeCertificate || profile?.documents?.incomeCertificate} onChange={handleDocChange}
                    status={application?.documentStatuses?.incomeCertificate?.status || profile?.documentStatuses?.incomeCertificate?.status}
                    remarks={application?.documentStatuses?.incomeCertificate?.remarks || profile?.documentStatuses?.incomeCertificate?.remarks}
                  />
                  <DocumentUploadCard
                    label="Caste Certificate (if applicable)" fieldName="casteCertificate" hint="PDF only, max 2MB"
                    value={application?.documents?.casteCertificate || profile?.documents?.casteCertificate} onChange={handleDocChange}
                    status={application?.documentStatuses?.casteCertificate?.status || profile?.documentStatuses?.casteCertificate?.status}
                    remarks={application?.documentStatuses?.casteCertificate?.remarks || profile?.documentStatuses?.casteCertificate?.remarks}
                  />
                  <DocumentUploadCard
                    label="Class 12 / Qualifying Marksheet *" fieldName="marksheet" hint="PDF only, max 2MB"
                    value={application?.documents?.marksheet || profile?.documents?.marksheet} onChange={handleDocChange}
                    status={application?.documentStatuses?.marksheet?.status || profile?.documentStatuses?.marksheet?.status}
                    remarks={application?.documentStatuses?.marksheet?.remarks || profile?.documentStatuses?.marksheet?.remarks}
                  />
                  <DocumentUploadCard
                    label="Bank Passbook / Cancelled Cheque" fieldName="bankPassbook" hint="PDF only, max 2MB"
                    value={application?.documents?.bankPassbook || profile?.documents?.bankPassbook} onChange={handleDocChange}
                    status={application?.documentStatuses?.bankPassbook?.status || profile?.documentStatuses?.bankPassbook?.status}
                    remarks={application?.documentStatuses?.bankPassbook?.remarks || profile?.documentStatuses?.bankPassbook?.remarks}
                  />
                  <DocumentUploadCard
                    label="Bonafide Certificate from College" fieldName="bonafide" hint="PDF only, max 2MB"
                    value={application?.documents?.bonafide} onChange={handleDocChange}
                    status={application?.documentStatuses?.bonafide?.status}
                    remarks={application?.documentStatuses?.bonafide?.remarks}
                  />
                  <DocumentUploadCard
                    label="Passport Size Photo *" fieldName="photo" hint="JPG/PNG, max 2MB" accept=".jpg,.jpeg,.png"
                    value={application?.documents?.photo || profile?.profilePhoto} onChange={handleDocChange}
                    status={application?.documentStatuses?.photo?.status || profile?.documentStatuses?.photo?.status}
                    remarks={application?.documentStatuses?.photo?.remarks || profile?.documentStatuses?.photo?.remarks}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              type="button"
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate('/dashboard')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Dashboard' : 'Back'}
            </button>

            <div className="flex gap-2">
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save & Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile score card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t('profileCompletion')}</h3>
              <span className="text-xs font-black text-blue-600">{completionPercent}%</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>

            <div className="pt-2 text-[10px] space-y-1.5 text-slate-500 font-medium">
              <div className="flex justify-between">
                <span>Personal Fields:</span>
                <span className={personal.fullName && personal.category ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {personal.fullName && personal.category ? '✓ Done' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Address Info:</span>
                <span className={address.permanentAddress && address.state ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {address.permanentAddress && address.state ? '✓ Done' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Academic Fields:</span>
                <span className={academic.institutionName && academic.courseName && academic.previousYearMarks ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {academic.institutionName && academic.courseName && academic.previousYearMarks ? '✓ Done' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Family & Income:</span>
                <span className={family.fatherName && family.annualIncome ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {family.fatherName && family.annualIncome ? '✓ Done' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bank Details:</span>
                <span className={bank.accountNumber && bank.ifscCode ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {bank.accountNumber && bank.ifscCode ? '✓ Seeded' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded Certificates:</span>
                <span className={docs.marksheet || application?.documents?.marksheet ? 'text-[#15803D] dark:text-[#4ADE80] font-bold' : ''}>
                  {docs.marksheet || application?.documents?.marksheet ? '✓ Uploaded' : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Eligibility Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t('eligibilityCheck')}
            </h3>

            {/* Overall Status Banner */}
            <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 ${
              eligibility.status === 'Eligible' ? 'bg-[#F0FDF4] dark:bg-[#0B2E1B] text-[#15803D] dark:text-[#4ADE80] border border-[#86EFAC] dark:border-[#166534]' :
              eligibility.status === 'Probably Eligible' ? 'bg-orange-50 text-orange-800 border border-orange-100' :
              eligibility.status === 'Not Eligible' ? 'bg-red-50 text-red-800 border border-red-100' :
              'bg-slate-50 text-slate-600 border'
            }`}>
              {eligibility.status === 'Eligible' || eligibility.status === 'Probably Eligible' ? (
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${eligibility.status === 'Eligible' ? 'text-[#22C55E] dark:text-[#4ADE80]' : 'text-orange-500'}`} />
              ) : eligibility.status === 'Not Eligible' ? (
                <XCircle className="w-5 h-5 shrink-0 text-red-600" />
              ) : (
                <Info className="w-5 h-5 shrink-0 text-slate-400" />
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide">Status Estimate</p>
                <p className="text-xs font-black mt-0.5">{eligibility.status}</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Annual Income limit:</span>
                {family.annualIncome ? (
                  Number(family.annualIncome) <= 800000 ? (
                    <span className="text-[#15803D] dark:text-[#4ADE80] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ₹{Number(family.annualIncome).toLocaleString()}</span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Exceeded</span>
                  )
                ) : (
                  <span className="text-slate-400">Blank</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Qualifying Marks (50%):</span>
                {academic.previousYearMarks ? (
                  Number(academic.previousYearMarks) >= 50 ? (
                    <span className="text-[#15803D] dark:text-[#4ADE80] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {academic.previousYearMarks}%</span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed Cutoff</span>
                  )
                ) : (
                  <span className="text-slate-400">Blank</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Aadhaar Filled:</span>
                {personal.aadhaarNumber && personal.aadhaarNumber.length === 12 ? (
                  <span className="text-[#15803D] dark:text-[#4ADE80] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                ) : (
                  <span className="text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Incomplete</span>
                )}
              </div>
            </div>

            {/* Reasons/Recs */}
            {eligibility.reasons.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-500 space-y-2">
                <div>
                  <p className="font-bold text-slate-700 uppercase">Reasons:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-medium">
                    {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                {eligibility.recommendations.length > 0 && (
                  <div>
                    <p className="font-bold text-slate-700 uppercase">Action Advice:</p>
                    <ul className="list-disc list-inside space-y-0.5 mt-1 font-medium text-blue-600">
                      {eligibility.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScholarshipApplicationForm;
