const isLocal = window.location.hostname === 'localhost';

export const backendUrl = isLocal
  ? 'http://localhost:5000'
  : import.meta.env.VITE_BACKEND_URL || 'https://intex-2025.azurewebsites.net';
