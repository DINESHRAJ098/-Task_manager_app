import { Task, TaskStats, TaskFilterOptions, User } from '../types/index.js';

const API_BASE = '/api';

/**
 * Helper to get authorization headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('tm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Handle API response json and errors
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const authApi = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(res);
  },
};

export const taskApi = {
  async getTasks(filters: Partial<TaskFilterOptions> = {}): Promise<{ count: number; tasks: Task[] }> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);

    const url = `${API_BASE}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ count: number; tasks: Task[] }>(res);
  },

  async getStats(): Promise<{ stats: TaskStats }> {
    const res = await fetch(`${API_BASE}/tasks/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ stats: TaskStats }>(res);
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    status?: string;
    tags?: string[];
  }): Promise<{ task: Task }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse<{ task: Task }>(res);
  },

  async updateTask(
    id: string,
    taskData: Partial<Task>
  ): Promise<{ task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse<{ task: Task }>(res);
  },

  async deleteTask(id: string): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ id: string }>(res);
  },
};
