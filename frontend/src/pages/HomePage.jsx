import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  Check,
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
    a: 'You can sign in to your student dashboard to track your application status.',
  },
  {
    q: 'How is eligibility determined?',
    a: 'Eligibility is based on academic merit, verified family income limits, and institution recognition.',
  },
];

const HomePage = () => {
  const { user } = useSelector((s) => s.auth);
  const { theme } = useTheme();
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const scrollToSection = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        <section id="home-top" className="pt-6 pb-8 lg:py-12">
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



        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-4">
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
        <section id="eligibility" className="grid lg:grid-cols-2 gap-6">
          
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

            <div id="announcements" className="pt-4">
              <button
                onClick={() => scrollToSection('faq')}
                className="text-xs font-bold text-[#0D6EFD] dark:text-[#4FC3F7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All Announcements & FAQs →
              </button>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="bg-[#F8FAFC] dark:bg-[#121212] border border-[#D9E2EC] dark:border-[#333333] rounded-2xl p-6 sm:p-8">
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
      <footer id="contact" className="bg-white dark:bg-[#000000] border-t border-[#D9E2EC] dark:border-[#333333] pt-12 transition-colors">
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
                <li>
                  <button onClick={() => scrollToSection('top')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('eligibility')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Eligibility
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Application Process
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Help
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contact')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider">Resources</p>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setActiveModal('userManual')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    User Manual
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('guidelines')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    Guidelines
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7] cursor-pointer transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact Us & Follow Us */}
            <div className="space-y-3">
              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider">Contact Us</p>
              <div className="space-y-1.5">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <a href="mailto:help@pmsss.gov.in" className="hover:underline hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">
                    help@pmsss.gov.in
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <a href="tel:18001234567" className="hover:underline hover:text-[#0D6EFD] dark:hover:text-[#4FC3F7]">
                    1800-123-4567
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#0D6EFD]" />
                  <span>Mon - Sat: 10:00 AM - 6:00 PM</span>
                </p>
              </div>

              <p className="font-bold text-[#0B2545] dark:text-white text-xs uppercase tracking-wider pt-2">Follow Us</p>
              <div className="flex items-center gap-3 text-[#0D6EFD] dark:text-[#4FC3F7]">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:opacity-80 transition-opacity">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="bg-[#0B2545] text-white py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-gray-300 gap-2">
            <p>© 2026 PMSSS. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => setActiveModal('privacy')} className="hover:underline cursor-pointer">
                Privacy Policy
              </button>
              <span>|</span>
              <button onClick={() => setActiveModal('terms')} className="hover:underline cursor-pointer">
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* FOOTER MODALS */}
      {/* 1. User Manual Modal */}
      <Modal
        isOpen={activeModal === 'userManual'}
        onClose={() => setActiveModal(null)}
        title="PMSSS Student User Manual & Portal Guide"
        size="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm">Step 1: Student Registration</h4>
            <p className="mt-1 leading-relaxed">Register on the PMSSS Portal with your basic personal details, Aadhaar card number, Class 12 roll number, and valid contact information. Verify through OTP.</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm">Step 2: Fill Application Form</h4>
            <p className="mt-1 leading-relaxed">Log in to your student dashboard to complete personal, academic, and family income details. Ensure all entered information matches your official certificates.</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm">Step 3: Document Upload</h4>
            <p className="mt-1 leading-relaxed">Upload clear scanned copies of required documents: Domicile Certificate, Income Certificate (under ₹8 Lakhs/year), Class 10 & 12 Marksheets, and Bank Passbook.</p>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm">Step 4: Document Verification</h4>
            <p className="mt-1 leading-relaxed">Visit the nearest Facilitation Center with original documents for physical/online verification. Obtain your verification acknowledgment receipt.</p>
          </div>
          <div>
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm">Step 5: Choice Filling & Seat Allotment</h4>
            <p className="mt-1 leading-relaxed">Participate in online choice filling for courses & colleges. Check merit rank and seat allocation status on your dashboard.</p>
          </div>
        </div>
      </Modal>

      {/* 2. Guidelines Modal */}
      <Modal
        isOpen={activeModal === 'guidelines'}
        onClose={() => setActiveModal(null)}
        title="PMSSS Scheme Guidelines 2026-27"
        size="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <div>
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm mb-1">1. Academic & Income Eligibility</h4>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              <li>Must have passed 10+2 examination from recognized State/Central Board.</li>
              <li>Annual family income from all sources must not exceed ₹8.00 Lakh per annum.</li>
              <li>Open for eligible candidates seeking higher education in General, Engineering, and Medical streams.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm mb-1">2. Financial Assistance Rates</h4>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              <li><strong>General Degree Courses:</strong> Academic Fee up to ₹30,000/year.</li>
              <li><strong>Engineering / Professional Courses:</strong> Academic Fee up to ₹1,25,000/year.</li>
              <li><strong>Medical / BDS / Nursing:</strong> Academic Fee up to ₹3,000,000/year.</li>
              <li><strong>Maintenance Allowance:</strong> ₹1,00,000/year paid directly to student's Aadhaar-seeded bank account in two installments.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#0B2545] dark:text-white text-sm mb-1">3. Important Rules</h4>
            <p className="leading-relaxed">Students admitted through PMSSS centralized counseling only are eligible for financial disbursement. Transfer of college without prior AICTE permission is prohibited.</p>
          </div>
        </div>
      </Modal>

      {/* 3. Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        size="md"
      >
        <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          <p>This Privacy Policy outlines how the PMSSS Management Portal collects, stores, and protects applicant data.</p>
          <h4 className="font-bold text-[#0B2545] dark:text-white">Data Security & Privacy</h4>
          <p>All sensitive information including Aadhaar details, financial bank details, and personal records are encrypted and stored in compliance with Government security standards.</p>
          <h4 className="font-bold text-[#0B2545] dark:text-white">Information Sharing</h4>
          <p>Data is strictly used for scholarship eligibility evaluation, document verification, and direct benefit transfer (DBT) processing by authorized AICTE systems.</p>
        </div>
      </Modal>

      {/* 4. Terms & Conditions Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms & Conditions"
        size="md"
      >
        <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          <p>By using the Prime Minister Special Scholarship Scheme (PMSSS) portal, applicants agree to the following terms:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All submitted information and uploaded documents must be authentic and verifiable.</li>
            <li>Submission of forged certificates will result in immediate disqualification and legal action.</li>
            <li>Renewal of scholarship for subsequent academic years requires satisfactory attendance and academic promotion.</li>
            <li>Beneficiaries cannot avail double financial benefits from any other scholarship scheme.</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;


