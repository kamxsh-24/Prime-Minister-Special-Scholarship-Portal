const getLocalFallback = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://pmsss-t2og.onrender.com/api';
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || getLocalFallback();

if (!API_BASE_URL) {
  console.warn('VITE_API_URL is missing. Frontend API requests may fail in production.');
}

export const BACKEND_ORIGIN = import.meta.env.VITE_SOCKET_URL || (() => {
  if (!API_BASE_URL) {
    return '';
  }
  try {
    return new URL(API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173').origin;
  } catch {
    return '';
  }
})();

export const getMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  const origin = BACKEND_ORIGIN.endsWith('/') ? BACKEND_ORIGIN.slice(0, -1) : BACKEND_ORIGIN;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${path}`;
};
