const resolveApiBaseUrl = () => {
  // If running in browser on localhost or 127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const viteApiUrl = import.meta.env.VITE_API_URL;
    // If explicitly configured for localhost, use it
    if (viteApiUrl && (viteApiUrl.includes('localhost') || viteApiUrl.includes('127.0.0.1'))) {
      return viteApiUrl;
    }
    // When on localhost in browser, default to local backend on port 5000
    return 'http://localhost:5000/api';
  }
  return import.meta.env.VITE_API_URL || 'https://pmsss-t2og.onrender.com/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

if (!API_BASE_URL) {
  console.warn('VITE_API_URL is missing. Frontend API requests may fail in production.');
}

export const BACKEND_ORIGIN = (() => {
  const viteSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (viteSocketUrl && (viteSocketUrl.includes('localhost') || viteSocketUrl.includes('127.0.0.1'))) {
      return viteSocketUrl;
    }
    return 'http://localhost:5000';
  }
  if (viteSocketUrl) return viteSocketUrl;
  try {
    return new URL(API_BASE_URL, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000').origin;
  } catch {
    return 'https://pmsss-t2og.onrender.com';
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
