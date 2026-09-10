import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/toastSlice';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const CONFIG = {
  error: {
    container: 'bg-[#FEF2F2] dark:bg-[#2A0F12] border-[#FECACA] dark:border-[#7F1D1D]',
    text: 'text-[#991B1B] dark:text-[#FEE2E2]',
    icon: <XCircle className="h-5 w-5 text-[#DC2626] dark:text-[#EF4444] flex-shrink-0 mt-0.5" />,
    close: 'text-[#F87171] hover:text-[#991B1B] dark:text-[#FCA5A5] dark:hover:text-[#FEE2E2]',
  },
  success: {
    container: 'bg-[#F0FDF4] dark:bg-[#052E16] border-[#BBF7D0] dark:border-[#166534]',
    text: 'text-[#166534] dark:text-[#DCFCE7]',
    icon: <CheckCircle className="h-5 w-5 text-[#16A34A] dark:text-[#22C55E] flex-shrink-0 mt-0.5" />,
    close: 'text-[#22C55E] hover:text-[#166534] dark:text-[#4ADE80] dark:hover:text-[#DCFCE7]',
  },
  warning: {
    container: 'bg-[#FFFBEB] dark:bg-[#2A1A05] border-[#FDE68A] dark:border-[#92400E]',
    text: 'text-[#92400E] dark:text-[#FEF3C7]',
    icon: <AlertTriangle className="h-5 w-5 text-[#D97706] dark:text-[#F59E0B] flex-shrink-0 mt-0.5" />,
    close: 'text-[#F59E0B] hover:text-[#92400E] dark:text-[#FCD34D] dark:hover:text-[#FEF3C7]',
  },
  info: {
    container: 'bg-[#EFF6FF] dark:bg-[#071A2E] border-[#BFDBFE] dark:border-[#1D4ED8]',
    text: 'text-[#1D4ED8] dark:text-[#DBEAFE]',
    icon: <Info className="h-5 w-5 text-[#2563EB] dark:text-[#3B82F6] flex-shrink-0 mt-0.5" />,
    close: 'text-[#3B82F6] hover:text-[#1D4ED8] dark:text-[#93C5FD] dark:hover:text-[#DBEAFE]',
  },
};

const Toast = ({ toast }) => {
  const dispatch = useDispatch();
  const type = toast.type || 'info';
  const cfg = CONFIG[type] || CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div
      id={`toast-item-${toast.id}`}
      className={`toast-enter toast-notification flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg min-w-[280px] max-w-[380px] transition-colors ${cfg.container}`}
    >
      {cfg.icon}
      <p className={`text-sm font-medium flex-1 leading-snug ${cfg.text}`}>
        {toast.message}
      </p>
      <button
        id={`toast-close-btn-${toast.id}`}
        onClick={() => dispatch(removeToast(toast.id))}
        className={`transition-colors flex-shrink-0 p-0.5 rounded-md ${cfg.close}`}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useSelector((s) => s.toast);

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} />
        </div>
      ))}
    </div>
  );
};

export { ToastContainer };
export default Toast;
