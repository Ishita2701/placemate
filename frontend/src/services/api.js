const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'placemate_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Error thrown for every failed API call. "errors" holds field-level messages.
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_URL}${path}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) query.append(key, value);
    });
    const text = query.toString();
    if (text) url += `?${text}`;
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (err) {
    throw new ApiError('Cannot connect to the server. Please make sure the backend is running.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }
  if (!response.ok) {
    throw new ApiError((data && data.message) || `Request failed (${response.status})`, response.status, data && data.errors);
  }
  return data;
}

export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
};

export const profileApi = {
  get: () => request('/profile'),
  save: (body) => request('/profile', { method: 'PUT', body }),
};

export const jobsApi = {
  list: (params) => request('/jobs', { params }),
  meta: () => request('/jobs/meta'),
  get: (id) => request(`/jobs/${id}`),
  mine: () => request('/jobs/mine'),
  create: (body) => request('/jobs', { method: 'POST', body }),
  update: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
};

export const applicationsApi = {
  apply: (jobId) => request('/applications', { method: 'POST', body: { jobId } }),
  mine: () => request('/applications/mine'),
  forJob: (jobId) => request(`/applications/job/${jobId}`),
  updateStatus: (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
};
