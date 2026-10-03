import { User, Resume, Analysis, AnalysisSummaryItem } from './types';

const API_BASE = '/api';

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ user: User }>(res);
  },

  // Resumes
  async uploadResume(file: File): Promise<{ resume: Resume }> {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse<{ resume: Resume }>(res);
  },

  async getResumes(): Promise<{ resumes: Resume[] }> {
    const res = await fetch(`${API_BASE}/resumes`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ resumes: Resume[] }>(res);
  },

  async getResume(id: string): Promise<{ resume: Resume & { extractedText: string } }> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ resume: Resume & { extractedText: string } }>(res);
  },

  async deleteResume(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Analyses
  async createAnalysis(resumeId: string, jobDescription: string): Promise<{ analysis: Analysis }> {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resumeId, jobDescription })
    });
    return handleResponse<{ analysis: Analysis }>(res);
  },

  async getAnalyses(): Promise<{ analyses: AnalysisSummaryItem[] }> {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ analyses: AnalysisSummaryItem[] }>(res);
  },

  async getAnalysis(id: string): Promise<{ analysis: Analysis }> {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse<{ analysis: Analysis }>(res);
  },

  async deleteAnalysis(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse<{ message: string }>(res);
  }
};
