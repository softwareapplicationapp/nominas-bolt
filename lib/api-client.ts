class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseUrl = '/api';
    // Only access localStorage on the client side
    this.initializeToken();
  }

  private initializeToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Cannot refresh token on server side');
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid, clear all tokens
      this.clearToken();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setToken(data.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers();
    
    // Set default Content-Type
    headers.set('Content-Type', 'application/json');
    
    // Add any existing headers from options
    if (options.headers) {
      const existingHeaders = new Headers(options.headers);
      existingHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    // Add authorization header if token exists
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401 and we have a refresh token, try to refresh
    if (response.status === 401 && this.token && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Prevent multiple simultaneous refresh attempts
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
          }
          
          await this.refreshPromise;
          this.refreshPromise = null;

          // Retry the original request with the new token
          headers.set('Authorization', `Bearer ${this.token}`);
          response = await fetch(url, {
            ...options,
            headers,
          });
        } catch (error) {
          // Refresh failed, clear tokens and let the error propagate
          this.clearToken();
          this.refreshPromise = null;
          throw new Error('Session expired. Please log in again.');
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(email: string, password: string, companyName: string, industry?: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, companyName, industry }),
    });
    
    this.setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  // Employee methods
  async getEmployees() {
    return this.request('/employees');
  }

  async createEmployee(employeeData: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId: number, employeeData: any) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId: number) {
    return this.request(`/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  // Employee self-service methods
  async getMyProfile() {
    return this.request('/employees/me');
  }

  async updateMyProfile(profileData: any) {
    return this.request('/employees/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getMyAttendance(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/employees/attendance${params}`);
  }

  async checkInOut(action: 'check_in' | 'check_out') {
    return this.request('/employees/attendance', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getMyLeaves() {
    return this.request('/employees/leaves');
  }

  async createMyLeave(leaveData: any) {
    return this.request('/employees/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async getMyStats() {
    return this.request('/employees/stats');
  }

  // Attendance methods (Admin)
  async getAttendance(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/attendance${params}`);
  }

  async createAttendance(attendanceData: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(attendanceId: number, attendanceData: any) {
    return this.request(`/attendance/${attendanceId}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(attendanceId: number) {
    return this.request(`/attendance/${attendanceId}`, {
      method: 'DELETE',
    });
  }

  // Leave methods (Admin)
  async getLeaves() {
    return this.request('/leaves');
  }

  async createLeave(leaveData: any) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  // UPDATED: Include comments parameter
  async approveLeave(leaveId: number, action: 'approve' | 'reject', comments?: string) {
    return this.request(`/leaves/${leaveId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, comments }),
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // NEW: Payroll methods
  async getPayroll() {
    return this.request('/payroll');
  }

  async createPayroll(payrollData: any) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
  }

  async updatePayroll(payrollId: number, payrollData: any) {
    return this.request(`/payroll/${payrollId}`, {
      method: 'PUT',
      body: JSON.stringify(payrollData),
    });
  }

  async deletePayroll(payrollId: number) {
    return this.request(`/payroll/${payrollId}`, {
      method: 'DELETE',
    });
  }

  // NEW: Download payroll PDF
  async downloadPayrollPDF(payrollId: number): Promise<Blob> {
    const url = `${this.baseUrl}/payroll/${payrollId}/pdf`;
    const headers = new Headers();
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Failed to download PDF');
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();