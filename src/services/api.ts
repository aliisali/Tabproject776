const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://blindscloud-backend.onrender.com/api'
    : 'http://localhost:3001/api');

class ApiService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse(response);
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  }

  static async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  // Users endpoints
  static async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  static async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  static async deleteUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Businesses endpoints
  static async getBusinesses() {
    const response = await fetch(`${API_BASE_URL}/businesses`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async createBusiness(businessData: any) {
    const response = await fetch(`${API_BASE_URL}/businesses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(businessData)
    });
    return this.handleResponse(response);
  }

  static async updateBusiness(id: string, businessData: any) {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(businessData)
    });
    return this.handleResponse(response);
  }

  static async deleteBusiness(id: string) {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Jobs endpoints
  static async getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async createJob(jobData: any) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData)
    });
    return this.handleResponse(response);
  }

  // Customers endpoints
  static async getCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async createCustomer(customerData: any) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(customerData)
    });
    return this.handleResponse(response);
  }

  // Products endpoints
  static async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async createProduct(productData: any) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return this.handleResponse(response);
  }

  // File upload
  static async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/uploads/single`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    return this.handleResponse(response);
  }
}

export default ApiService;