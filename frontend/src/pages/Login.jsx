import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import { showError, showSuccess } from '../store/slices/toastSlice';
import { loginUser } from '../services/authService';
import Navbar from '../components/layout/Navbar';
import { GraduationCap, Eye, EyeOff, ArrowRight, Loader2, User } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      dispatch(showError('Please enter email and password.'));
      return;
    }
    dispatch(authStart());
    try {
      const res = await loginUser(form);
      if (res.data.success) {
        dispatch(authSuccess(res.data.data));
        dispatch(showSuccess(`Welcome back, ${res.data.data.user.fullName}!`));
        const role = res.data.data.user.role;
        navigate(
          role === 'admin'
            ? '/admin'
            : role === 'institution_officer'
            ? '/institution'
            : '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Unable to connect to server. Please check if the backend server is running.'
          : err.message) ||
        'Login failed. Please try again.';
      dispatch(authFailure(msg));
      dispatch(showError(msg));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] text-[#0B2545] dark:text-white flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center bg-[#0D6EFD] rounded-2xl shadow-sm mb-3 text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0B2545] dark:text-white font-display">Student Login</h1>
            <p className="text-xs text-[#334E68] dark:text-[#BDBDBD] mt-1">PMSSS Scholarship Management Portal</p>
          </div>

          <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-[#D9E2EC] dark:border-[#333333] shadow-card">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="text-xs font-bold text-[#0B2545] dark:text-[#E0E0E0] mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="Enter registered email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="text-xs font-bold text-[#0B2545] dark:text-[#E0E0E0] mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-input pr-12"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-btn"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold mt-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing In...</>
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#334E68] dark:text-[#BDBDBD] mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#0D6EFD] dark:text-[#4FC3F7] font-bold hover:underline">
                Register Now
              </Link>
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#333333] text-center">
              <p className="text-xs text-[#334E68] dark:text-[#BDBDBD]">
                Institution or Portal Admin?{' '}
                <Link to="/admin/login" className="text-[#0D6EFD] dark:text-[#4FC3F7] font-bold hover:underline">
                  Admin Login →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


