import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';

const DEFAULT_DOCS = [
  { id: '1', name: 'Aadhaar Card', status: 'Uploaded', date: '16 May 2026' },
  { id: '2', name: 'Domicile Certificate', status: 'Uploaded', date: '16 May 2026' },
  { id: '3', name: 'Income Certificate', status: 'Uploaded', date: '17 May 2026' },
  { id: '4', name: '10th Marksheet', status: 'Uploaded', date: '17 May 2026' },
  { id: '5', name: '12th Marksheet', status: 'Uploaded', date: '17 May 2026' },
  { id: '6', name: 'Admission Proof', status: 'Uploaded', date: '18 May 2026' },
];

const MyDocumentsSection = ({ documents = DEFAULT_DOCS }) => {
  const [activeTab, setActiveTab] = useState('uploaded');

  const uploadedCount = documents.length;
  const pendingCount = 0;
  const rejectedCount = 0;

  return (
    <div className="bg-white dark:bg-[#080808] border border-gray-200/80 dark:border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
      <div>
        {/* Title */}
        <h3 className="text-base font-semibold text-[#0B2545] dark:text-white font-display">
          My Documents
        </h3>
        <p className="text-xs text-gray-400 dark:text-[#737373] mt-0.5 mb-4">
          Upload and manage your documents
        </p>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-[#050505] rounded-xl mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'uploaded'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3] hover:text-[#0B2545] dark:hover:text-white'
            }`}
          >
            Uploaded ({uploadedCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3] hover:text-[#0B2545] dark:hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'rejected'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3] hover:text-[#0B2545] dark:hover:text-white'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Documents Table/List */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100/60 dark:border-[#1A1A1A] text-xs"
            >
              <span className="font-medium text-[#0B2545] dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                {doc.name}
              </span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] font-semibold text-[#15803D] dark:text-[#22C55E]">
                  {doc.status}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-[#737373] hidden sm:inline">
                  {doc.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drag & Drop Upload Zone matching Reference */}
      <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-blue-200 dark:border-[#1A1A1A] bg-blue-50/30 dark:bg-[#050505] text-center flex flex-col items-center justify-center">
        <UploadCloud className="h-8 w-8 text-[#0D6EFD] dark:text-[#0D6EFD] mb-2" />
        <p className="text-xs font-semibold text-[#0B2545] dark:text-white">
          Drag & drop files here or click to browse
        </p>
        <p className="text-[10px] text-gray-400 dark:text-[#737373] mt-0.5 mb-3">
          PDF, JPG, PNG (Max 5MB)
        </p>

        <Link
          to="/dashboard/profile"
          className="w-full py-2.5 px-4 bg-[#0D6EFD] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors block text-center"
        >
          Upload New
        </Link>
      </div>
    </div>
  );
};

export default MyDocumentsSection;
