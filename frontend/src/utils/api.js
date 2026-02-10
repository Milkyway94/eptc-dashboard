/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Task endpoints
  async getTasks() {
    return this.request('/api/tasks');
  }

  async getTasksByDate(year = null) {
    const query = year ? `?year=${year}` : '';
    return this.request(`/api/tasks/by-date${query}`);
  }

  async getTaskCounts(year = null) {
    const query = year ? `?year=${year}` : '';
    return this.request(`/api/tasks/counts${query}`);
  }

  async getUpcomingTasks(limit = null) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/tasks/upcoming${query}`);
  }

  async getTasksForDate(date) {
    return this.request(`/api/tasks/date/${date}`);
  }

  async getDepartments() {
    return this.request('/api/departments');
  }

  async getStats() {
    return this.request('/api/stats');
  }

  // Admin endpoints
  async login(username, password) {
    return this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async logout() {
    return this.request('/api/admin/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/api/admin/me');
  }

  async importExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/admin/import', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData
    });
  }

  async previewExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/admin/preview', {
      method: 'POST',
      headers: {},
      body: formData
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
  }
}

export const api = new ApiClient();
