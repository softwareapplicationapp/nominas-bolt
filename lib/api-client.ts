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

  // FIXED: Payroll methods with better error handling
  async getPayroll() {
    try {
      console.log('API Client: Fetching payroll records');
      const data = await this.request('/payroll');
      console.log('API Client: Payroll records fetched:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('API Client: Error fetching payroll:', error);
      throw error;
    }
  }

  // Get payroll records for the logged in employee
  async getMyPayroll() {
    try {
      console.log('API Client: Fetching my payroll records');
      const data = await this.request('/employees/payroll');
      console.log('API Client: My payroll records fetched:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('API Client: Error fetching my payroll:', error);
      throw error;
    }
  }

  async createPayroll(payrollData: any) {
    try {
      console.log('API Client: Creating payroll with data:', payrollData);
      const data = await this.request('/payroll', {
        method: 'POST',
        body: JSON.stringify(payrollData),
      });
      console.log('API Client: Payroll created successfully:', data);
      return data;
    } catch (error) {
      console.error('API Client: Error creating payroll:', error);
      throw error;
    }
  }

  async updatePayroll(payrollId: number, payrollData: any) {
    try {
      console.log('API Client: Updating payroll', payrollId, 'with data:', payrollData);
      const data = await this.request(`/payroll/${payrollId}`, {
        method: 'PUT',
        body: JSON.stringify(payrollData),
      });
      console.log('API Client: Payroll updated successfully');
      return data;
    } catch (error) {
      console.error('API Client: Error updating payroll:', error);
      throw error;
    }
  }

  async deletePayroll(payrollId: number) {
    return this.request(`/payroll/${payrollId}`, {
      method: 'DELETE',
    });
  }

  // FIXED: Download payroll PDF with better error handling
  async downloadPayrollPDF(payrollId: number): Promise<Blob> {
    try {
      console.log('API Client: Downloading PDF for payroll', payrollId);
      
      // Use direct fetch instead of this.request to get binary data
      const url = `${this.baseUrl}/payroll/${payrollId}/pdf`;
      const headers = new Headers();
      
      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }
      
      console.log('API Client: Sending PDF request to:', url);
      console.log('API Client: With authorization header:', !!this.token);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        console.error('API Client: PDF download failed:', response.status, response.statusText);
        
        // Try to parse error response
        let errorMessage = 'Failed to download PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use text
          errorMessage = await response.text() || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      console.log('API Client: PDF download successful');
      return response.blob();
    } catch (error) {
      console.error('API Client: Error downloading PDF:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();