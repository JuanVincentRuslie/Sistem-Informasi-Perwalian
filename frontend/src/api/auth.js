// Service layer untuk domain auth.
// Component TIDAK boleh panggil apiClient untuk auth langsung — harus lewat file ini.
import { apiClient } from './client.js';

/**
 * Login dev mode: kirim email saja (no password).
 * Backend gated NODE_ENV !== 'production'.
 * @param {string} email
 * @returns {Promise<{success, data: { token, user }, message}>}
 */
export const login = (email) => apiClient.post('/auth/dev-login', { email });

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
