import { Task } from '../types/task';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7ddd31f8`;

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  task?: T;
  tasks?: T[];
  message?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API error for ${endpoint}:`, data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const taskService = {
  // Get all tasks
  async getAllTasks(): Promise<Task[]> {
    const response = await apiRequest<Task>('/tasks');
    return response.tasks || [];
  },

  // Get single task
  async getTask(id: string): Promise<Task> {
    const response = await apiRequest<Task>(`/tasks/${id}`);
    if (!response.task) {
      throw new Error('Task not found');
    }
    return response.task;
  },

  // Create new task
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    
    if (!response.task) {
      throw new Error('Failed to create task');
    }
    return response.task;
  },

  // Update existing task
  async updateTask(id: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    
    if (!response.task) {
      throw new Error('Failed to update task');
    }
    return response.task;
  },

  // Delete task
  async deleteTask(id: string): Promise<void> {
    await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiRequest('/health');
      return response.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};