require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const fs = require('fs');

const connectDB = require('./config/db');
const User = require('./models/User');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');
const institutionRoutes = require('./routes/institution');
const aiRoutes = require('./routes/ai');
const publicRoutes = require('./routes/public');
const analyticsRoutes = require('./routes/analytics');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Set default fallbacks for development environment variables if absent
process.env.PORT = process.env.PORT || '5000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'pmsss_jwt_secret_key_2026_super_secure';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pmsss_jwt_refresh_secret_key_2026_super_secure';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const requiredEnvKeys = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL', 'GEMINI_API_KEY'];
for (const key of requiredEnvKeys) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is missing`);
  }
}

const getAllowedOrigins = () => {
  const configuredOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL, process.env.CORS_ORIGINS, process.env.CORS_ORIGIN]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .map((value) => value.replace(/\/+$/, ''))
    .filter(Boolean);

  return [...new Set([
    'http://localhost:5173',
    'http://localhost:1024',
    'https://prime-minister-special-scholarship-portal.onrender.com',
    ...configuredOrigins,
  ])];
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman), any localhost port in dev,
    // and configured production frontend origins.
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      callback(null, true);
      return;
    }

    const cleanOrigin = origin.replace(/\/+$/, '');

    try {
      const parsedOrigin = new URL(cleanOrigin);
      const isLocalhost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';
      if (allowedOrigins.includes(cleanOrigin) || isLocalhost) {
        callback(null, true);
        return;
      }
    } catch (error) {
      // Fall through to the explicit rejection below.
    }

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development mode, allow non-configured origins to avoid local blockages
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/ai/chatbot', chatbotRoutes);

// Direct top-level activity endpoints for compatibility
const { protect } = require('./middleware/auth');
const AuditLog = require('./models/AuditLog');

const getDirectActivityLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const docNameMap = {
      aadhaar: 'Aadhaar Card',
      incomeCertificate: 'Income Certificate',
      casteCertificate: 'Caste Certificate',
      marksheet: 'Academic Marksheet',
      bankPassbook: 'Bank Passbook',
      bonafide: 'Bonafide Certificate',
      photo: 'Passport Photo',
    };

    const activities = logs.map((log) => {
      let title = log.details?.title;
      let description = log.details?.description;
      let type = log.details?.type || 'success';

      switch (log.action) {
        case 'register':
        case 'account_registered':
          title = title || 'Application registered successfully';
          description = description || 'Your PMSSS account was created';
          type = 'success';
          break;

        case 'profile_updated':
          title = title || log.details?.sectionName || 'Profile information updated';
          description = description || log.details?.description || 'Personal information updated';
          type = 'success';
          break;

        case 'application_section_saved':
        case 'section_completed':
          title = title || (log.details?.sectionName ? `${log.details.sectionName} completed` : 'Application section saved');
          description = description || 'Application section saved';
          type = 'success';
          break;

        case 'document_uploaded': {
          const docKey = log.details?.fieldname || log.details?.documentName;
          const docLabel = docNameMap[docKey] || log.details?.documentName || 'Document';
          title = title || `${docLabel} uploaded successfully`;
          description = description || 'Document uploaded successfully';
          type = 'success';
          break;
        }

        case 'document_replaced':
        case 'document_updated': {
          const docKey = log.details?.fieldname || log.details?.documentName;
          const docLabel = docNameMap[docKey] || log.details?.documentName || 'Document';
          title = title || `${docLabel} replaced successfully`;
          description = description || 'Document replaced successfully';
          type = 'info';
          break;
        }

        case 'document_removed': {
          const docKey = log.details?.fieldname || log.details?.documentName;
          const docLabel = docNameMap[docKey] || log.details?.documentName || 'Document';
          title = title || `${docLabel} removed`;
          description = description || 'Document deleted';
          type = 'warning';
          break;
        }

        case 'document_rejected': {
          const docKey = log.details?.fieldname || log.details?.documentName;
          const docLabel = docNameMap[docKey] || log.details?.documentName || 'Document';
          title = title || `${docLabel} rejected`;
          description = log.details?.remarks || description || 'Document rejected during verification';
          type = 'error';
          break;
        }

        case 'submit_application':
        case 'application_submitted':
          title = title || 'Application submitted successfully';
          description = description || 'Submitted for institute verification';
          type = 'success';
          break;

        case 'update_application':
        case 'save_draft':
          title = title || (log.action === 'save_draft' ? 'Application draft saved' : 'Application updated');
          description = description || 'Application details updated';
          type = 'info';
          break;

        case 'status_changed':
          title = title || log.details?.statusTitle || 'Application status updated';
          description = description || log.details?.statusDescription || `Status changed to ${log.details?.newStatus || 'updated'}`;
          type = log.details?.newStatus === 'rejected' ? 'error' : log.details?.newStatus === 'approved' ? 'success' : 'info';
          break;

        default:
          title = title || log.action || 'Activity recorded';
          description = description || '';
          break;
      }

      return {
        id: log._id,
        title,
        description,
        type,
        timestamp: log.createdAt,
      };
    });

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching activities.', error: error.message });
  }
};

app.get('/api/activity', protect, getDirectActivityLogs);
app.get('/api/activities', protect, getDirectActivityLogs);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PMSS backend is running',
  });
});

app.get('/', (req, res) => {
  const databaseState = require('mongoose').connection?.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    status: 'running',
    database: databaseState,
    environment: process.env.NODE_ENV || 'unknown',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
});

// Seed default admin account
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@pmss.gov.in';
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      console.log('Seeding default admin account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin@123', salt);

      await User.create({
        fullName: 'PMSS Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
      });

      console.log('════════════════════════════════════════');
      console.log('  DEFAULT ADMIN ACCOUNT CREATED');
      console.log(`  Email:    ${adminEmail}`);
      console.log('  Password: Admin@123');
      console.log('════════════════════════════════════════');
    }
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
  }
};

// Seed default FAQ knowledge base
const seedFaqs = async () => {
  try {
    const FAQ = require('./models/FAQ');
    await FAQ.deleteMany({});
    console.log('Seeding default chatbot FAQs...');
    const defaultFaqs = [
      {
        question: 'Who is eligible for PMSSS?',
        answer: "Eligibility depends on the current PMSSS scheme rules and the applicant's qualification/category. I can help you check your eligibility based on your academic qualification, domicile/residency requirements, income criteria, and other applicable conditions.",
        category: 'eligibility'
      },
      {
        question: 'Am I eligible for this scholarship?',
        answer: "Eligibility depends on the current PMSSS scheme rules and the applicant's qualification/category. I can help you check your eligibility based on your academic qualification, domicile/residency requirements, income criteria, and other applicable conditions.",
        category: 'eligibility'
      },
      {
        question: 'What documents are required?',
        answer: 'The required documents are:\n1. Aadhaar Card\n2. Domicile/State Residence Certificate\n3. Income Certificate\n4. Caste/Community Certificate (if applicable)\n5. Class 12 Marksheet\n6. Bank Passbook\n7. Bonafide College Certificate / Passport Photo.',
        category: 'documents'
      },
      {
        question: 'How do I apply?',
        answer: 'First, navigate to "My Profile" and complete all details to at least 80%. Then, go to "Application", verify your pre-filled details, upload any additional files, and click "Submit Application".',
        category: 'process'
      },
      {
        question: 'How do I track my application?',
        answer: 'You can check your application timeline on the "Track Status" section of your dashboard. Statuses progress from Draft ➔ Submitted ➔ Institute Verification ➔ Officer Verification ➔ Approved ➔ Scholarship Disbursed.',
        category: 'process'
      },
      {
        question: 'What does Institute Verification mean?',
        answer: 'Institute Verification means your college/institution nodal officer reviews your bonafide status, academic enrollment details, and uploaded certificates to verify your active student status.',
        category: 'process'
      },
      {
        question: 'What does Officer Verification mean?',
        answer: 'Officer Verification is the central scholarship administration review step where government officials review your verified application before issuing final approval and DBT disbursement.',
        category: 'process'
      },
      {
        question: 'When is the deadline?',
        answer: 'Scholarship registration deadlines are set by the Ministry of Education, Government of India. Please monitor the homepage announcements and dashboard notifications for current registration dates.',
        category: 'deadlines'
      },
      {
        question: 'Why was my application rejected?',
        answer: 'Common reasons for rejection include: blurred or illegible documents, mismatched names between Aadhaar and marksheets, or incorrect bank details. Please check reviewer remarks under "Track Status" or "My Profile", fix the issues, and resubmit.',
        category: 'general'
      },
      {
        question: 'How can I update my profile?',
        answer: 'You can update your profile by navigating to the "My Profile" page. Fill in the required fields under the respective tabs, upload any updated documents, and click "Save Profile Changes" at the bottom.',
        category: 'general'
      }
    ];
    await FAQ.insertMany(defaultFaqs);
    console.log('✅ FAQ Knowledge Base seeded successfully.');
  } catch (error) {
    console.error('Failed to seed FAQs:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PMSS Backend running on port ${PORT} (0.0.0.0)`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close existing process or use a different PORT.`);
  } else {
    console.error('❌ Server startup error:', error.message);
  }
});

// Asynchronously connect to database and run non-fatal seeds
connectDB()
  .then(async (conn) => {
    if (conn) {
      try {
        await seedAdmin();
        await seedFaqs();
      } catch (seedErr) {
        console.warn('Non-fatal seeding warning:', seedErr.message);
      }
    }
  })
  .catch((dbErr) => {
    console.error('❌ Database connection error (server remains active):', dbErr.message);
  });

// Assistant verified write access

