import { ClientAuth } from "@/lib/auth/client";
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters 
} from "@/lib/types/user-management";

// Toggle for mock data during development
const USE_MOCK_DATA = true;

export class UserManagementService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error("[UserManagementService] Failed to create authenticated API:", error);
      throw new Error("Authentication required");
    }
  }

  // Get all users with optional filtering
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    if (USE_MOCK_DATA) {
      return this.getMockUsers(filters);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
      if (filters?.department && filters.department !== 'ALL') params.append('department', filters.department);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);

      const response = await api.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error fetching users:", error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User> {
    if (USE_MOCK_DATA) {
      const users = await this.getMockUsers();
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error fetching user:", error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUserRequest): Promise<User> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newUser;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error creating user:", error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingUser = await this.getUserById(id);
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedUser;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error updating user:", error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error("[UserManagementService] Error deleting user:", error);
      throw error;
    }
  }

  // Bulk delete users
  static async bulkDeleteUsers(userIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.post('/users/bulk-delete', { userIds });
    } catch (error) {
      console.error("[UserManagementService] Error bulk deleting users:", error);
      throw error;
    }
  }

  // Mock data for development
  private static async getMockUsers(filters?: UserFilters): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@klu.ac.in',
        phone: '+91-9876543210',
        username: 'sarah.johnson',
        role: 'FACULTY',
        department: 'CSE',
        employeeId: 'FAC001',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-20T14:30:00Z',
        lastLogin: '2024-06-26T09:15:00Z'
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@klu.ac.in',
        phone: '+91-9876543211',
        username: 'michael.chen',
        role: 'FACULTY',
        department: 'ECE',
        employeeId: 'FAC002',
        isActive: true,
        createdAt: '2024-02-10T11:00:00Z',
        updatedAt: '2024-06-25T16:45:00Z',
        lastLogin: '2024-06-26T08:30:00Z'
      },
      {
        id: '3',
        name: 'Admin User',
        email: 'admin@klu.ac.in',
        phone: '+91-9876543212',
        username: 'admin',
        role: 'ADMIN',
        department: 'CSE',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-26T12:00:00Z',
        lastLogin: '2024-06-26T17:00:00Z'
      },
      {
        id: '4',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@klu.ac.in',
        phone: '+91-9876543213',
        username: 'priya.sharma',
        role: 'FACULTY',
        department: 'ME',
        employeeId: 'FAC003',
        isActive: false,
        createdAt: '2024-03-05T09:00:00Z',
        updatedAt: '2024-06-15T10:20:00Z',
        lastLogin: '2024-06-10T15:45:00Z'
      },
      {
        id: '5',
        name: 'Prof. Raj Kumar',
        email: 'raj.kumar@klu.ac.in',
        phone: '+91-9876543214',
        username: 'raj.kumar',
        role: 'FACULTY',
        department: 'EEE',
        employeeId: 'FAC004',
        isActive: true,
        createdAt: '2024-04-12T13:30:00Z',
        updatedAt: '2024-06-22T11:15:00Z',
        lastLogin: '2024-06-25T14:20:00Z'
      }
    ];

    // Apply filters
    let filteredUsers = mockUsers;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.role && filters.role !== 'ALL') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters?.department && filters.department !== 'ALL') {
      filteredUsers = filteredUsers.filter(user => user.department === filters.department);
    }

    if (filters?.status && filters.status !== 'ALL') {
      const isActive = filters.status === 'ACTIVE';
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    return filteredUsers;
  }
}
