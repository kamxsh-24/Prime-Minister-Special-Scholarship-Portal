import React from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { BACKEND_ORIGIN, getMediaUrl } from '../../services/apiBase';

const DocumentPreviewModal = ({ isOpen, onClose, documentUrl, title = 'Document Preview', studentName = '' }) => {
  if (!isOpen || !documentUrl) return null;

  const fullUrl = getMediaUrl(documentUrl);
  const cleanUrl = fullUrl.toLowerCase().split('?')[0];
  const isPdf = cleanUrl.endsWith('.pdf');
  const isImage = cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png') || cleanUrl.endsWith('.webp');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-[#07111C] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[#132235]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#132235] bg-slate-50/80 dark:bg-[#03070D]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              {isPdf ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {studentName && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Student: <span className="font-semibold text-slate-700 dark:text-slate-300">{studentName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1F304B] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132235] text-xs font-semibold flex items-center gap-1.5 transition"
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <a
              href={fullUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132235] transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 w-full h-full bg-slate-100/50 dark:bg-[#03070D] flex items-center justify-center overflow-auto p-4">
          {isPdf ? (
            <iframe
              src={`${fullUrl}#toolbar=1&navpanes=0`}
              title={title}
              className="w-full h-full rounded-xl border border-slate-200 dark:border-[#132235] bg-white shadow-xs"
            />
          ) : isImage ? (
            <div className="max-h-full max-w-full flex items-center justify-center p-2">
              <img
                src={fullUrl}
                alt={title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-[#132235]"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-[#07111C] rounded-2xl border border-slate-200 dark:border-[#132235] max-w-md">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Preview not available directly</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                This document format cannot be rendered inline. Please open or download it to view.
              </p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-xs px-4 py-2"
              >
                <Download className="h-4 w-4" /> Open / Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-[#132235] bg-white dark:bg-[#07111C] flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">File path: {documentUrl}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 dark:bg-[#132235] hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;

