export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  user: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
  overdue: number;
}

export interface TaskFilterOptions {
  status: string; // 'All' | 'Pending' | 'In Progress' | 'Completed'
  priority: string; // 'All' | 'Low' | 'Medium' | 'High'
  search: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  order: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}
