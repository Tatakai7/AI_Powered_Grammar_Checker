const API_BASE_URL = 'http://localhost:5000/api';

export interface Document {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  _id: string;
  documentId: string;
  content: string;
  versionNumber: number;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, name?: string) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    return data;
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async createDocument(title: string, content: string) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async updateDocument(id: string, title: string, content: string) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Versions
  async getVersions(documentId: string) {
    return this.request(`/versions/${documentId}`);
  }

  async restoreVersion(documentId: string, versionId: string) {
    return this.request(`/versions/${documentId}/restore/${versionId}`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
