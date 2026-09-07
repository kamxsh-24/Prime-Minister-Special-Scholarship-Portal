import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Check,
  Search,
  ChevronRight,
  User,
  FileText,
  Upload,
  BarChart2,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  UserPlus,
  LogIn,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
} from 'lucide-react';

const eligibilityHighlights = [
  'Open for students across India',
  'Family income within the prescribed limit',
  'Must be enrolled in recognized institution',
  'Meet academic eligibility criteria',
];

const announcements = [
  { title: 'Application for AY 2026-27 is now open', date: '15 May 2026' },
  { title: 'Last date to apply has been extended', date: '10 May 2026' },
  { title: 'Guidelines for document upload', date: '05 May 2026' },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Register',
    desc: 'Create your account with basic details',
    icon: User,
  },
  {
    step: '02',
    title: 'Complete Profile',
    desc: 'Fill in your personal and academic details',
    icon: FileText,
  },
  {
    step: '03',
    title: 'Upload Documents',
    desc: 'Upload required documents',
    icon: Upload,
  },
  {
    step: '04',
    title: 'Track Application',
    desc: 'Track your application status online',
    icon: BarChart2,
  },
];

const faqs = [
  {
    q: 'Who can apply for PMSSS Scholarship?',
    a: 'Students who are Indian citizens admitted into recognized higher education institutions meeting the eligibility criteria.',
  },
  {
    q: 'What documents are required?',
    a: 'Aadhaar Card, Income Certificate, 10th Marksheet, Bank Passbook, and Bonafide Certificate.',
  },
  {
    q: 'How can I track my application status?',
    a: 'You can enter your Application ID in the status lookup box above or sign in to your dashboard.',
  },
  {
    q: 'How is eligibility determined?',
    a: 'Eligibility is based on academic merit, verified family income limits, and institution recognition.',
  },
];

const HomePage = () => {
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [appIdInput, setAppIdInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleCheckStatus = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard/status');
    } else {
      navigate('/login');
    }
  };

  const isDarkMode = theme === 'dark';
  const heroImgSrc = isDarkMode ? '/students-dark.png' : '/students-light.png';

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] text-[#0B2545] dark:text-white transition-colors duration-200 flex flex-col">
      {/* Header Navigation */}
      <Navbar />

      {/* Main Container matching Reference Width */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-12 space-y-12">
        
        {/* HERO SECTION */}
        <section className="pt-6 pb-8 lg:py-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#1565F9] dark:text-[#4FC3F7] tracking-wider uppercase block mb-3">
                  SCHOLARSHIP ASSISTANCE
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] dark:text-white tracking-tight leading-tight font-display">
                  A simpler way to manage<br className="hidden sm:inline" /> your scholarship application
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#334E68] dark:text-[#E0E0E0] leading-relaxed max-w-xl">
                PMSSS Portal helps you register, submit documents and track your application status easily and transparently.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="btn-primary px-6 py-2.5 text-sm"
                    id="hero-dashboard-btn"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                      id="hero-start-btn"
                    >
                      <User className="h-4 w-4" />
                      Register
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2"
                      id="hero-status-btn"
                    >
                      <User className="h-4 w-4" />
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Right Graphic: Exact Uploaded Student Illustration for Light/Dark Theme */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-xl p-2 flex items-center justify-center">
                <img
                  src={heroImgSrc}
                  alt="Students using scholarship portal"
                  className="w-full h-auto object-contain max-h-[460px] transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CHECK APPLICATION STATUS CARD */}
        <section className="bg-white dark:bg-[#121212] border border-[#D9E2EC] dark:border-[#333333] rounded-2xl p-6 sm:p-8 shadow-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Card Left Title & Icon */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-[#161616] text-[#0D6EFD] dark:text-[#4FC3F7] border border-blue-100 dark:border-[#333333] flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B2545] dark:text-white">
                  Check Application Status
                </h3>
                <p className="text-xs text-[#334E68] dark:text-[#BDBDBD] mt-0.5">
                  Enter your Application ID to know the current status
                </p>
              </div>
            </div>

            {/* Input & Button Form */}
            <form onSubmit={handleCheckStatus} className="w-full md:w-auto flex-1 max-w-md flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter Application ID (e.g. PMSSS-2026-000123)"
                value={appIdInput}
                onChange={(e) => setAppIdInput(e.target.value)}
                className="form-input text-xs sm:text-sm py-2.5"
                id="home-status-input"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap text-xs sm:text-sm px-5 py-2.5 flex items-center gap-1.5"
                id="home-check-btn"
              >
                <Search className="h-4 w-4" />
                Check Status
              </button>
            </form>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#0B2545] dark:text-white font-display">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorksSteps.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative group">
                  {/* Step Ring Icon */}
                  <div className="h-16 w-16 rounded-full border-2 border-[#0D6EFD] dark:border-[#4FC3F7] bg-blue-50/50 dark:bg-[#121212] flex items-center justify-center text-[#0D6EFD] dark:text-[#4FC3F7] mb-3 shadow-xs">
                    <IconComp className="h-7 w-7" />
                  </div>

                  {/* Step Number & Title */}
                  <p className="text-xs font-bold text-[#334E68] dark:text-[#BDBDBD] uppercase">
                    {item.step}
                  </p>
                  <h4 className="text-sm font-bold text-[#0B2545] dark:text-white mt-1 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#334E68] dark:text-[#BDBDBD] max-w-[180px] leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Arrow Connector for Desktop */}
                  {idx < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute right-[-24px] top-[32px] text-[#D9E2EC] dark:text-[#333333]">
                      <span className="text-lg">➔</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ELIGIBILITY HIGHLIGHTS + ANNOUNCEMENTS */}
        <section className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Card: Eligibility Highlights */}
          <div className="bg-[#F8FAFC] dark:bg-[#121212] border border-[#D9E2EC] dark:border-[#333333] rounded-2xl p-6 sm:p-8">
            <h3 className="text-base font-bold text-[#0B2545] dark:text-white mb-5">
              Eligibility Highlights
            </h3>

            <div className="space-y-3.5">
              {eligibilityHighlights.map((text, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-[#0B2545] dark:text-[#E0E0E0]">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-[#161616] text-emerald-600 dark:text-[#81C784] flex items-center justify-center flex-shrink-0">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Important Announcements */}
          <div className="bg-[#F8FAFC] dark:bg-[#121212] border border-[#D9E2EC] dark:border-[#333333] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B2545] dark:text-white mb-5">
                Important Announcements
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                {announcements.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-2.5 border-b border-[#D9E2EC] dark:border-[#333333] last:border-none">
                    <span className="font-semibold text-[#0B2545] dark:text-white">{item.title}</span>
                    <span className="text-xs text-[#334E68] dark:text-[#BDBDBD] whitespace-nowrap ml-4">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <a href="#announcements" onClick={(e) => { e.preventDefault(); alert('Latest PMSSS notices for 2026-27 session are updated.'); }} className="text-xs font-bold text-[#0D6EFD] dark:text-[#4FC3F7] hover:underline flex items-center gap-1">
                View All Announcements →
              </a>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-[#F8FAFC] dark:bg-[#121212] border border-[#D9E2EC] dark:border-[#333333] rounded-2xl p-6 sm:p-8">
          <h2 className="text-base font-bold text-[#0B2545] dark:text-white mb-6 font-display">
            Frequently Asked Questions
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white dark:bg-[#161616] border border-[#D9E2EC] dark:border-[#333333] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 text-left flex justify-between items-center gap-3 text-xs sm:text-sm font-semibold text-[#0B2545] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`h-4 w-4 text-[#0D6EFD] dark:text-[#4FC3F7] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#334E68] dark:text-[#E0E0E0] leading-relaxed border-t border-gray-100 dark:border-[#333333]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-[#000000] border-t border-[#D9E2EC] dark:border-[#333333] pt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs text-[#334E68] dark:text-[#BDBDBD]">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#0D6EFD] text-white flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#0B2545] dark:text-white font-display">PMSSS</p>
                  <p className="text-xs text-[#334E68] dark:text-[#BDBDBD]">Scholarship Management Portal</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                A digital initiative to support students in managing their scholarship applications easily and transparently.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider">Quick Links</p>
              <ul className="space-y-1.5">
                <li><Link to="/" className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Home</Link></li>
                <li><a href="#eligibility" onClick={(e) => { e.preventDefault(); alert('PMSSS eligibility details.'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Eligibility</a></li>
                <li><a href="#process" onClick={(e) => { e.preventDefault(); alert('Application workflow.'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Application Process</a></li>
                <li><a href="#help" onClick={(e) => { e.preventDefault(); alert('Contact help@pmsss.gov.in'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Help</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); alert('Call 1800-123-4567'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Contact</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider">Resources</p>
              <ul className="space-y-1.5">
                <li><a href="#manual" onClick={(e) => { e.preventDefault(); alert('User Manual PDF download.'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">User Manual</a></li>
                <li><a href="#guidelines" onClick={(e) => { e.preventDefault(); alert('PMSSS Guidelines 2026.'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">Guidelines</a></li>
                <li><a href="#faq" onClick={(e) => { e.preventDefault(); alert('FAQ Center'); }} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">FAQ</a></li>
              </ul>
            </div>

            {/* Column 4: Contact Us & Follow Us */}
            <div className="space-y-3">
              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider">Contact Us</p>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <span>help@pmsss.gov.in</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <span>1800-123-4567</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <span>Mon - Sat: 10:00 AM - 6:00 PM</span>
                </p>
              </div>

              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider pt-2">Follow Us</p>
              <div className="flex items-center gap-3 text-[#0D6EFD] dark:text-[#4FC3F7]">
                <a href="#facebook" onClick={(e) => e.preventDefault()} aria-label="Facebook" className="hover:opacity-80"><Facebook className="h-4 w-4" /></a>
                <a href="#twitter" onClick={(e) => e.preventDefault()} aria-label="Twitter" className="hover:opacity-80"><Twitter className="h-4 w-4" /></a>
                <a href="#youtube" onClick={(e) => e.preventDefault()} aria-label="YouTube" className="hover:opacity-80"><Youtube className="h-4 w-4" /></a>
                <a href="#instagram" onClick={(e) => e.preventDefault()} aria-label="Instagram" className="hover:opacity-80"><Instagram className="h-4 w-4" /></a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="bg-[#0B2545] text-white py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-gray-300 gap-2">
            <p>© 2026 PMSSS. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
              <span>|</span>
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;


