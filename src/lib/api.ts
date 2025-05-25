import axios from 'axios';
import { User, Task, Note, Vacation, Notification, Link, UserRole, UserStatus, Permission } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mueen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Default admin user
const defaultAdmin: User = {
  id: "1",
  username: "Ahmed",
  password: "12345",
  role: UserRole.Admin,
  status: UserStatus.Offline,
  permissions: Object.values(Permission) as Permission[],
  lastLogin: new Date().toISOString()
};

// Initialize storage if empty
const initializeStorage = () => {
  const users = localStorage.getItem('mueen_users');
  if (!users) {
    localStorage.setItem('mueen_users', JSON.stringify([defaultAdmin]));
  }
};

// Call initialization
initializeStorage();

// Auth endpoints
export const auth = {
  login: async (username: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('mueen_users') || '[]');
    const user = users.find((u: User) => u.username === username && u.password === password);
    
    if (user) {
      const token = 'dummy-token-' + Math.random();
      const updatedUser = {
        ...user,
        status: UserStatus.Online,
        lastLogin: new Date().toISOString()
      };
      
      // Update user in storage
      const updatedUsers = users.map((u: User) => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('mueen_users', JSON.stringify(updatedUsers));
      
      return {
        user: updatedUser,
        token
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('mueen_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('mueen_currentUser') || 'null');
    
    if (currentUser) {
      const updatedUsers = users.map((u: User) => 
        u.id === currentUser.id 
          ? { ...u, status: UserStatus.Offline }
          : u
      );
      localStorage.setItem('mueen_users', JSON.stringify(updatedUsers));
    }
  }
};

// User management endpoints
export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  create: async (userData: Partial<User>) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  update: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

// Tasks endpoints
export const tasks = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  create: async (taskData: Partial<Task>) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  update: async (id: string, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
};

// Notes endpoints
export const notes = {
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },
  create: async (noteData: Partial<Note>) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },
  update: async (id: string, noteData: Partial<Note>) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/notes/${id}`);
  },
};

// Vacations endpoints
export const vacations = {
  getAll: async () => {
    const response = await api.get('/vacations');
    return response.data;
  },
  create: async (vacationData: Partial<Vacation>) => {
    const response = await api.post('/vacations', vacationData);
    return response.data;
  },
  update: async (id: string, vacationData: Partial<Vacation>) => {
    const response = await api.put(`/vacations/${id}`, vacationData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/vacations/${id}`);
  },
};

// Notifications endpoints
export const notifications = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  create: async (notificationData: Partial<Notification>) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },
};

// Links endpoints
export const links = {
  getAll: async () => {
    const response = await api.get('/links');
    return response.data;
  },
  create: async (linkData: Partial<Link>) => {
    const response = await api.post('/links', linkData);
    return response.data;
  },
  update: async (id: string, linkData: Partial<Link>) => {
    const response = await api.put(`/links/${id}`, linkData);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/links/${id}`);
  },
};

export default api; 