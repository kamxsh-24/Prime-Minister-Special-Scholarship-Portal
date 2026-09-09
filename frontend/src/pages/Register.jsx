import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import { showError, showSuccess } from '../store/slices/toastSlice';
import { registerStudent } from '../services/authService';
import Navbar from '../components/layout/Navbar';
import { GraduationCap, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check, ShieldCheck } from 'lucide-react';
import { getStatesList, getDistrictsForState } from '../utils/indiaStatesDistricts';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dateOfBirth: '',
  state: '',
  district: '',
  institution: '',
  course: '',
  yearOfStudy: '',
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState(initialForm);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(0); // 0 = account, 1 = personal

  const statesList = getStatesList();
  const availableDistricts = getDistrictsForState(form.state);

  const passwordCriteria = [
    { label: 'Minimum 8 characters', valid: form.password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(form.password) },
    { label: 'One number', valid: /[0-9]/.test(form.password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(form.password) },
  ];

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setForm((prev) => ({
      ...prev,
      state: selectedState,
      district: '', // Reset district when state changes
    }));
  };

  const validateStep0 = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Valid email address is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(form.password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(form.password)) return 'Password must contain at least one special character.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const validateStep1 = () => {
    if (!form.state) return 'Please select your State.';
    if (!form.district) return 'Please select your District.';
    if (form.phone && !/^\d{10}$/.test(form.phone)) return 'Phone number must be exactly 10 digits.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) {
      dispatch(showError(err));
      return;
    }
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      dispatch(showError(err));
      return;
    }

    dispatch(authStart());
    try {
      const { confirmPassword, ...payload } = form;
      const res = await registerStudent(payload);
      if (res.data.success) {
        dispatch(authSuccess(res.data.data));
        dispatch(showSuccess('Registration successful! Welcome to PMSSS.'));
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Unable to connect to server. Please check if the backend server is running.'
          : err.message) ||
        'Registration failed. Please try again.';
      dispatch(authFailure(msg));
      dispatch(showError(msg));
    }
  };

  const stepperItems = [
    { num: '01', title: 'Account Details' },
    { num: '02', title: 'Personal Information' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] text-[#0B2545] dark:text-white flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Top Stepper Banner matching reference design */}
        <div className="bg-white dark:bg-[#121212] p-6 mb-8 border border-[#D9E2EC] dark:border-[#333333] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepperItems.map((item, idx) => {
              const active = step === idx;
              const completed = step > idx;
              return (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center group">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                        completed
                          ? 'bg-[#0D6EFD] border-[#0D6EFD] text-white dark:bg-[#4FC3F7] dark:border-[#4FC3F7] dark:text-black'
                          : active
                          ? 'border-[#0D6EFD] text-[#0D6EFD] dark:border-[#4FC3F7] dark:text-[#4FC3F7] bg-blue-50 dark:bg-[#161616]'
                          : 'border-gray-300 dark:border-[#333333] text-gray-400 dark:text-[#BDBDBD]'
                      }`}
                    >
                      {completed ? <Check className="h-5 w-5" strokeWidth={3} /> : item.num}
                    </div>
                    <span
                      className={`text-xs font-semibold mt-2 hidden sm:block ${
                        active || completed ? 'text-[#0B2545] dark:text-white' : 'text-gray-400 dark:text-[#BDBDBD]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  {idx < stepperItems.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 transition-all ${
                        completed ? 'bg-[#0D6EFD] dark:bg-[#4FC3F7]' : 'bg-[#D9E2EC] dark:bg-[#333333]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>


        {/* Form Main Card */}
        <div className="card p-6 sm:p-10 border border-gray-200 dark:border-[#333333] shadow-card">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-[#333333]">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0B1F3A] dark:text-white font-display">
                {step === 0 ? '01 Account Credentials' : '02 Personal Information'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#BDBDBD] mt-1">
                {step === 0 ? 'Create your PMSSS account login credentials' : 'Provide your personal and educational background'}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400 dark:text-[#BDBDBD]">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-[#4FC3F7] font-bold hover:underline">
                Login
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="reg-fullname" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="reg-fullname"
                      name="fullName"
                      placeholder="Enter full name"
                      value={form.fullName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        id="reg-password"
                        name="password"
                        placeholder="Create password"
                        value={form.password}
                        onChange={handleChange}
                        className="form-input pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="reg-confirm" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Confirm Password *
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      id="reg-confirm"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`form-input ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? 'border-red-500 dark:border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-600 dark:text-[#EF5350] mt-1.5 font-semibold">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {/* Password requirement panel matching reference design */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#333333] text-xs">
                  <p className="font-bold text-[#0B1F3A] dark:text-white mb-2.5">Password must contain:</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {passwordCriteria.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {c.valid ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-[#81C784] font-bold" strokeWidth={3} />
                        ) : (
                          <span className="h-4 w-4 flex items-center justify-center text-gray-400 dark:text-[#BDBDBD] font-bold text-[11px]">○</span>
                        )}
                        <span className={`font-medium ${c.valid ? 'text-emerald-700 dark:text-[#81C784]' : 'text-gray-500 dark:text-[#BDBDBD]'}`}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    id="reg-button"
                    name="register-button"
                    className="btn-primary px-8 py-3 text-base"
                  >
                    Save & Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="reg-phone" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      placeholder="Enter 10-digit number"
                      value={form.phone}
                      onChange={handleChange}
                      className="form-input"
                      maxLength={10}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="reg-dob" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="reg-dob"
                      name="dateOfBirth"
                      placeholder="dd/mm/yyyy"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* State */}
                  <div>
                    <label htmlFor="reg-state" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      State / Union Territory *
                    </label>
                    <select
                      id="reg-state"
                      name="state"
                      value={form.state}
                      onChange={handleStateChange}
                      className="form-select w-full"
                      required
                    >
                      <option value="">Select State / UT</option>
                      {statesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="reg-district" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      District *
                    </label>
                    <select
                      id="reg-district"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      disabled={!form.state}
                      className="form-select w-full"
                      required
                    >
                      {!form.state ? (
                        <option value="">Select State First</option>
                      ) : (
                        <>
                          <option value="">Select District</option>
                          {availableDistricts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Institution */}
                  <div>
                    <label htmlFor="reg-institution" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Institution / College
                    </label>
                    <input
                      type="text"
                      id="reg-institution"
                      name="institution"
                      placeholder="Enter institution name"
                      value={form.institution}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  {/* Course */}
                  <div>
                    <label htmlFor="reg-course" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                      Course
                    </label>
                    <input
                      type="text"
                      id="reg-course"
                      name="course"
                      placeholder="Select Course / Degree"
                      value={form.course}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Year of Study */}
                <div>
                  <label htmlFor="reg-year" className="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-2 block">
                    Year of Study
                  </label>
                  <select
                    id="reg-year"
                    name="yearOfStudy"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    className="form-select w-full"
                  >
                    <option value="">Select Year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="btn-secondary flex-1 py-3"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    id="register-btn"
                    disabled={loading}
                    className="btn-primary flex-1 py-3 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Registering...
                      </>
                    ) : (
                      <>
                        Complete Registration <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

