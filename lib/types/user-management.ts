// User Management Types based on your API specification

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  role: 'ADMIN' | 'FACULTY';
  department: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string; // For faculty
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  username: string;
  role: 'ADMIN' | 'FACULTY';
  department: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  role?: 'ADMIN' | 'FACULTY';
  department?: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE';
  employeeId?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'FACULTY' | 'ALL';
  department?: 'CSE' | 'ME' | 'CE' | 'ECE' | 'EEE' | 'ALL';
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
}

export interface UserTableColumn {
  key: keyof User;
  label: string;
  sortable: boolean;
  filterable: boolean;
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'CHANGE_ROLE';
  newRole?: 'ADMIN' | 'FACULTY';
}
