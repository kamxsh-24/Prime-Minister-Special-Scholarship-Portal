import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadDocuments } from '../../services/documentService';
import { showSuccess, showError } from '../../store/slices/toastSlice';

const REQUIRED_DOC_CONFIG = [
  { key: 'aadhaar', name: 'Aadhaar Card' },
  { key: 'incomeCertificate', name: 'Income Certificate' },
  { key: 'marksheet', name: '10th / 12th Marksheet' },
  { key: 'bankPassbook', name: 'Bank Passbook' },
  { key: 'casteCertificate', name: 'Domicile / Caste Certificate' },
  { key: 'photo', name: 'Admission Proof / Photo' },
];

const MyDocumentsSection = ({ profile, application, onRefresh }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const combinedDocs = {
    ...(profile?.documents || {}),
    ...(application?.documents || {}),
  };
  if (profile?.profilePhoto) combinedDocs.photo = profile.profilePhoto;

  const docStatuses = profile?.documentStatuses || application?.documentStatuses || {};

  const documentList = REQUIRED_DOC_CONFIG.map((item) => {
    const url = combinedDocs[item.key];
    const docMeta = typeof docStatuses.get === 'function' ? docStatuses.get(item.key) : docStatuses[item.key];
    const rawStatus = docMeta?.status || 'pending';

    let status = 'Pending';
    if (rawStatus === 'rejected') {
      status = 'Rejected';
    } else if (url && String(url).trim() !== '') {
      status = 'Uploaded';
    }

    return {
      key: item.key,
      name: item.name,
      status,
      url,
    };
  });

  const uploadedDocs = documentList.filter((d) => d.status === 'Uploaded');
  const pendingDocs = documentList.filter((d) => d.status === 'Pending');
  const rejectedDocs = documentList.filter((d) => d.status === 'Rejected');

  const displayedDocs =
    activeTab === 'uploaded'
      ? uploadedDocs
      : activeTab === 'pending'
      ? pendingDocs
      : activeTab === 'rejected'
      ? rejectedDocs
      : documentList;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      dispatch(showError('File size exceeds 2MB limit.'));
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const isPhoto = ['jpg', 'jpeg', 'png'].includes(ext);
    const isPdf = ext === 'pdf';

    if (!isPhoto && !isPdf) {
      dispatch(showError('File must be PDF, JPG, or PNG format.'));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      const fieldName = isPhoto ? 'photo' : 'aadhaar';
      formData.append(fieldName, file);

      const res = await uploadDocuments(formData);
      if (res.data?.success) {
        dispatch(showSuccess('Document uploaded successfully!'));
        if (onRefresh) onRefresh();
      } else {
        dispatch(showError(res.data?.message || 'Upload failed.'));
      }
    } catch (err) {
      dispatch(showError(err.response?.data?.message || err.message || 'Upload failed. Status kept as Pending.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-[#050505] rounded-xl mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3]'
            }`}
          >
            All ({documentList.length})
          </button>
          <button
            onClick={() => setActiveTab('uploaded')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'uploaded'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3]'
            }`}
          >
            Uploaded ({uploadedDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3]'
            }`}
          >
            Pending ({pendingDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'rejected'
                ? 'bg-white dark:bg-[#0D6EFD] text-[#0D6EFD] dark:text-white shadow-sm font-semibold'
                : 'text-gray-500 dark:text-[#A3A3A3]'
            }`}
          >
            Rejected ({rejectedDocs.length})
          </button>
        </div>

        {/* Documents Table/List */}
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
          {displayedDocs.map((doc) => (
            <div
              key={doc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100/60 dark:border-[#1A1A1A] text-xs"
            >
              <span className="font-medium text-[#0B2545] dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                {doc.name}
              </span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-[11px] font-semibold ${
                    doc.status === 'Uploaded'
                      ? 'text-[#15803D] dark:text-[#22C55E]'
                      : doc.status === 'Rejected'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="mt-5 p-4 rounded-xl border-2 border-dashed border-blue-200 dark:border-[#1A1A1A] bg-blue-50/30 dark:bg-[#050505] text-center flex flex-col items-center justify-center">
        {uploading ? (
          <Loader2 className="h-8 w-8 text-[#0D6EFD] animate-spin mb-2" />
        ) : (
          <UploadCloud className="h-8 w-8 text-[#0D6EFD] dark:text-[#0D6EFD] mb-2" />
        )}
        <p className="text-xs font-semibold text-[#0B2545] dark:text-white">
          {uploading ? 'Uploading document...' : 'Drag & drop files here or click to browse'}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-[#737373] mt-0.5 mb-3">
          PDF, JPG, PNG (Max 2MB)
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
        />

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 py-2.5 px-3 bg-[#0D6EFD] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-colors"
          >
            Upload File
          </button>
          <Link
            to="/dashboard/application"
            className="flex-1 py-2.5 px-3 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 text-gray-700 dark:text-[#E0E0E0] font-semibold text-xs rounded-xl transition-colors text-center"
          >
            Manage All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyDocumentsSection;
