import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('proxima_tokens');
  if (tokens) {
    try {
      const parsed = JSON.parse(tokens);
      const token = parsed.accessToken || parsed.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore parse errors
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('proxima_tokens');
      localStorage.removeItem('proxima_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string; institutionId?: number }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Institution APIs
export const institutionAPI = {
  register: (data: { institutionName: string; slug: string; adminName: string; adminEmail: string; adminPassword: string }) =>
    api.post('/institutions/register', data),
  getBySlug: (slug: string) => api.get(`/institutions/${slug}`),
};

// Class APIs
export const classAPI = {
  create: (data: { name: string; subject?: string; description?: string }) =>
    api.post('/classes', data),
  getAll: () => api.get('/classes'),
  getById: (classId: number) => api.get(`/classes/${classId}`),
  getByJoinKey: (joinKey: string) => api.get(`/classes/join/${joinKey}`),
};

// Enrollment APIs
export const enrollAPI = {
  enroll: (data: { joinKey: string; name: string; username: string; password: string }) =>
    api.post('/enroll', data),
};

// Session APIs
export const sessionAPI = {
  create: (classId: number, data: { title: string; scheduledAt?: string }) =>
    api.post(`/sessions/classes/${classId}`, data),
  start: (sessionId: number) => api.post(`/sessions/${sessionId}/start`),
  end: (sessionId: number) => api.post(`/sessions/${sessionId}/end`),
  getAll: (classId: number) => api.get(`/sessions/classes/${classId}`),
};

// Feed APIs
export const feedAPI = {
  getFeed: (classId: number, page?: number, limit?: number) =>
    api.get(`/feed/classes/${classId}`, { params: { page, limit } }),
  createPost: (classId: number, data: { type: string; title?: string; body?: string; fileUrl?: string; fileName?: string }) =>
    api.post(`/feed/classes/${classId}`, data),
  deletePost: (itemId: number) => api.delete(`/feed/${itemId}`),
};

// Token APIs
export const tokenAPI = {
  getLiveKitToken: (params: { room?: string; session_id?: number; name?: string; role?: string }) =>
    api.get('/token', { params }),
};

// Upload APIs
export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Attendance APIs
export const attendanceAPI = {
  markPresent: (sessionId: number, studentId: number) =>
    api.post(`/attendance/${sessionId}/mark`, { studentId }),
  markLeft: (sessionId: number, studentId: number) =>
    api.post(`/attendance/${sessionId}/leave`, { studentId }),
  getReport: (sessionId: number) =>
    api.get(`/attendance/${sessionId}/report`),
  getClassSessions: (classId: number) =>
    api.get(`/attendance/classes/${classId}/sessions`),
};

// Room APIs (legacy/compatibility)
export const roomAPI = {
  create: (data: { roomName: string; teacherName: string }) =>
    api.post('/rooms/create', data),
  getById: (roomId: string) => api.get(`/rooms/${roomId}`),
  list: () => api.get('/rooms/list'),
};

export default api;
