import { useState, useEffect } from 'react';
import { isBackendConfigured } from '../../lib/api';

// Hook untuk cek status backend Laravel (ganti Supabase ping).
export const useSupabaseStatus = () => {
  const [status, setStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('loading');
      // Backend terkonfigurasi (VITE_API_URL diisi) = online.
      // Fallback localStorage = offline-mode (tetap jalan).
      setStatus(isBackendConfigured() ? 'online' : 'offline');
      setLastCheck(new Date());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Cek setiap 30 detik

    return () => clearInterval(interval);
  }, []);

  return { status, lastCheck };
};
