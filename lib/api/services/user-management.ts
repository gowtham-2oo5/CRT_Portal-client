import { apiClient } from "@/lib/api/client";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/lib/types/user-management";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class UserManagementService {
  // Get all users with optional filtering
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    if (USE_MOCK_DATA) {
      return this.getMockUsers(filters);
    }

    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);

      const response = await apiClient.get(`/users?${params.toString()}`);
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
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      return user;
    }

    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error fetching user:", error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUserRequest): Promise<User> {
    if (USE_MOCK_DATA) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newUser;
    }

    try {
      const response = await apiClient.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error creating user:", error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    if (USE_MOCK_DATA) {
      const users = await this.getMockUsers();
      const existingUser = users.find((u) => u.id === id);
      if (!existingUser) throw new Error("User not found");

      return {
        ...existingUser,
        ...userData,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error updating user:", error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Deleting user ${id}`);
      return;
    }

    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error("[UserManagementService] Error deleting user:", error);
      throw error;
    }
  }

  // Change user password
  static async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Changing password for user ${id}`);
      return;
    }

    try {
      await apiClient.put(`/users/${id}/password`, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error("[UserManagementService] Error changing password:", error);
      throw error;
    }
  }

  // Reset user password (admin only)
  static async resetPassword(id: string, newPassword: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Resetting password for user ${id}`);
      return;
    }

    try {
      await apiClient.post(`/users/${id}/reset-password`, {
        newPassword,
      });
    } catch (error) {
      console.error("[UserManagementService] Error resetting password:", error);
      throw error;
    }
  }

  // Toggle user active status
  static async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    if (USE_MOCK_DATA) {
      const users = await this.getMockUsers();
      const existingUser = users.find((u) => u.id === id);
      if (!existingUser) throw new Error("User not found");

      return {
        ...existingUser,
        isActive,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.patch(`/users/${id}/status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      console.error("[UserManagementService] Error toggling user status:", error);
      throw error;
    }
  }

  // Mock data for development
  private static async getMockUsers(filters?: UserFilters): Promise<User[]> {
    const mockUsers: User[] = [
      {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        name: "Admin User",
        role: "ADMIN",
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        username: "faculty1",
        email: "faculty1@example.com",
        name: "Faculty User 1",
        role: "FACULTY",
        isActive: true,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "3",
        username: "faculty2",
        email: "faculty2@example.com",
        name: "Faculty User 2",
        role: "FACULTY",
        isActive: false,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    ];

    let filteredUsers = mockUsers;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.username.toLowerCase().includes(search)
      );
    }

    if (filters?.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
    }

    if (filters?.status !== undefined) {
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === filters.status
      );
    }

    return filteredUsers;
  }
}
