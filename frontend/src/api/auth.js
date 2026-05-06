// Service layer untuk domain auth.
// Component TIDAK boleh panggil apiClient untuk auth langsung — harus lewat file ini.
import { apiClient } from './client.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPE = 'openid email profile';
const GOOGLE_STATE_KEY = 'google_oauth_state';

/**
 * Login dev mode: kirim email saja (no password).
 * Backend gated NODE_ENV !== 'production'.
 * @param {string} email
 * @returns {Promise<{success, data: { token, user }, message}>}
 */
export const login = (email) => apiClient.post('/auth/dev-login', { email });

/**
 * Tukar authorization code Google dengan JWT internal dari backend.
 * @param {string} code
 * @returns {Promise<{success, data: { token, user }, message}>}
 */
export const exchangeGoogleCode = (code) => apiClient.post('/auth/google', { code });

function createOAuthState() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

/**
 * Build URL Google OAuth. Secret tetap aman di backend; frontend hanya pakai client ID publik.
 */
export const createGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/auth/callback`;

  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID belum diisi di frontend/.env');
  }

  const state = createOAuthState();
  sessionStorage.setItem(GOOGLE_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    prompt: 'select_account',
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const consumeGoogleOAuthState = () => {
  const state = sessionStorage.getItem(GOOGLE_STATE_KEY);
  sessionStorage.removeItem(GOOGLE_STATE_KEY);
  return state;
};

/**
 * Get current user dari token di localStorage.
 * @returns {Promise<{success, data: { id, email, nama, role, avatar_url }, message}>}
 */
export const getMe = () => apiClient.get('/auth/me');

/**
 * Logout: clear localStorage. JWT stateless, no backend call needed.
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};
