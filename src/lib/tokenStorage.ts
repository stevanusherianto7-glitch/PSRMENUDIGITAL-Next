/**
 * Token storage abstraksi untuk Sanctum token Laravel.
 *
 * Default: localStorage (web/PWA) — kompatibel & build-amam tanpa dependency baru.
 *
 * UNTUK NATIVE AMAN (Capacitor): install `@capacitor/secure-storage`
 * lalu wrap localStorage di bawah dengan SecureStorage. Sampai itu, localStorage
 * cukup untuk dev/UAT (token tidak disimpan di source, hanya di device storage).
 *
 * Catatan: api.ts membaca token secara SYNC via localStorage sebagai cache.
 * setToken() di sini menulis ke localStorage (sync) agar api.ts langsung dapat.
 */
const KEY = 'sanctum_token';

export async function setToken(token: string): Promise<void> {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* ignore */
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
