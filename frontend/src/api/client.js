// HTTP client terpusat untuk seluruh frontend.
// Tanggung jawab:
// - Inject Authorization: Bearer <token> dari localStorage
// - Parse JSON response, throw error kalau success: false
// - Handle 401: clear localStorage + redirect /login
// - Handle 5xx: throw error dengan message backend
// - Handle network error: throw error generic

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

async function request(method, path, { body, query, isFormData } = {}) {
  let url = BASE_URL + path;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += '?' + qs;
  }

  const headers = {};
  const token = localStorage.getItem('auth_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    throw new Error('Backend tidak bisa dihubungi. Cek koneksi atau hubungi admin.', { cause: err });
  }

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    const error = new Error('Sesi habis, silakan login ulang');
    error.status = res.status;
    throw error;
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Server error');
  }

  if (res.status >= 500) {
    const error = new Error(json?.message ?? 'Server error');
    error.status = res.status;
    error.errors = json?.errors;
    throw error;
  }

  if (!json.success) {
    const error = new Error(json.message ?? 'Request gagal');
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }

  return json;
}

export const apiClient = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  del: (path) => request('DELETE', path),
  upload: (path, formData) => request('POST', path, { body: formData, isFormData: true }),
};
