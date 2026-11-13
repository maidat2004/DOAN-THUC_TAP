import api from './api';

// Auth services
export const authService = {
  register: async (fullName, email, password, phone, company, role) => {
    return api.post('/auth/register', { fullName, email, password, phone, company, role });
  },

  createUser: async (data) => {
    return api.post('/auth/users', data);
  },

  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  updateProfile: async (data) => {
    return api.put('/auth/profile', data);
  },

  changePassword: async (oldPassword, newPassword) => {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  },

  getAllUsers: async () => {
    return api.get('/auth/users');
  },

  updateUser: async (userId, data) => {
    return api.put(`/auth/users/${userId}`, data);
  },
  deleteUser: async (userId) => {
    return api.delete(`/auth/users/${userId}`);
  },

};

// Station services
export const stationService = {
  createStation: async (data) => {
    return api.post('/stations', data);
  },

  getAllStations: async (filters = {}) => {
    return api.get('/stations', { params: filters });
  },

  getStationById: async (id) => {
    return api.get(`/stations/${id}`);
  },

  updateStation: async (id, data) => {
    return api.put(`/stations/${id}`, data);
  },

  deleteStation: async (id) => {
    return api.delete(`/stations/${id}`);
  },

  getStatistics: async () => {
    return api.get('/stations/statistics');
  },
};

// Environment data services
export const dataService = {
  createData: async (data) => {
    return api.post('/data', data);
  },

  getData: async (filters = {}) => {
    return api.get('/data', { params: filters });
  },

  getEnvironmentData: async (filters = {}) => {
    return api.get('/data', { params: filters });
  },

  getDataById: async (id) => {
    return api.get(`/data/${id}`);
  },

  updateData: async (id, data) => {
    return api.put(`/data/${id}`, data);
  },

  deleteData: async (id) => {
    return api.delete(`/data/${id}`);
  },

  submitReport: async (id) => {
    return api.post(`/data/${id}/submit`);
  },

  approveReport: async (id, data) => {
    return api.put(`/data/${id}/approve`, data);
  },

  rejectReport: async (id, data) => {
    return api.put(`/data/${id}/reject`, data);
  },

  getStatistics: async (filters = {}) => {
    return api.get('/data/statistics', { params: filters });
  },
};

// Location services
export const locationService = {
  getProvinces: async () => {
    return api.get('/locations/provinces');
  },

  getDistrictsByProvince: async (provinceId) => {
    return api.get(`/locations/districts/${provinceId}`);
  },

  getCommunesByDistrict: async (districtId) => {
    return api.get(`/locations/communes/${districtId}`);
  },
};

// Threshold services
export const thresholdService = {
  createThreshold: async (data) => {
    return api.post('/thresholds', data);
  },

  getThresholds: async (type = '', sourceType = '') => {
    return api.get('/thresholds', { params: { type, sourceType } });
  },

  getStandardThresholds: async () => {
    return api.get('/thresholds/standards');
  },

  applyStandardThresholds: async () => {
    return api.post('/thresholds/standards/apply');
  },

  getThresholdById: async (id) => {
    return api.get(`/thresholds/${id}`);
  },

  updateThreshold: async (id, data) => {
    return api.put(`/thresholds/${id}`, data);
  },

  deleteThreshold: async (id) => {
    return api.delete(`/thresholds/${id}`);
  },
};

// Alert services
export const alertService = {
  getAlerts: async (filters = {}) => {
    return api.get('/alerts', { params: filters });
  },

  resolveAlert: async (id) => {
    return api.put(`/alerts/${id}/resolve`);
  },

  getStatistics: async () => {
    return api.get('/alerts/statistics');
  },
};

// Public monitoring services
export const publicService = {
  getStations: async () => {
    return api.get('/public/stations');
  },
  getStationSummary: async (stationId) => {
    return api.get(`/public/stations/${stationId}/summary`);
  },
};

// Report services
export const reportService = {
  exportReport: async (data) => {
    return api.post('/reports/export', data);
  },
  getFiles: async () => {
    return api.get('/reports/files');
  },
  downloadFile: async (id) => {
    return api.get(`/reports/files/${id}/download`, { responseType: 'blob' });
  },
  getSchedules: async () => {
    return api.get('/reports/schedules');
  },
  createSchedule: async (data) => {
    return api.post('/reports/schedules', data);
  },
  toggleSchedule: async (id) => {
    return api.patch(`/reports/schedules/${id}/toggle`);
  },
  deleteSchedule: async (id) => {
    return api.delete(`/reports/schedules/${id}`);
  },
};
