"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { UserManagementService } from '@/lib/api/services/user-management';
import { toast } from 'sonner';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/lib/types/user-management';

// Form validation schema
const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),

  email: z.string()
    .email('Please enter a valid email address')
    .endsWith('@klu.ac.in', 'Email must be a KLU domain (@klu.ac.in)'),

  phone: z.string()
    .regex(/^\+91-\d{10}$/, 'Phone must be in format +91-XXXXXXXXXX')
    .min(14, 'Phone number is required'),

  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores')
    .toLowerCase(),

  role: z.enum(['ADMIN', 'FACULTY'], {
    required_error: 'Please select a role',
  }),

  department: z.enum(['CSE', 'ME', 'CE', 'ECE', 'EEE'], {
    required_error: 'Please select a department',
  }),

  employeeId: z.string().optional(),

  isActive: z.boolean().default(true),
}).refine((data) => {
  // Employee ID is required for faculty
  if (data.role === 'FACULTY') {
    return data.employeeId && data.employeeId.length >= 3;
  }
  return true;
}, {
  message: "Employee ID is required for faculty members",
  path: ["employeeId"],
});

const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),

  email: z.string()
    .email('Please enter a valid email address')
    .endsWith('@klu.ac.in', 'Email must be a KLU domain (@klu.ac.in)'),

  phone: z.string()
    .regex(/^\+91-\d{10}$/, 'Phone must be in format +91-XXXXXXXXXX')
    .min(14, 'Phone number is required'),

  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores')
    .toLowerCase(),

  role: z.enum(['ADMIN', 'FACULTY'], {
    required_error: 'Please select a role',
  }),

  department: z.enum(['CSE', 'ME', 'CE', 'ECE', 'EEE'], {
    required_error: 'Please select a department',
  }),

  employeeId: z.string().optional(),

  isActive: z.boolean().default(true),
}).refine((data) => {
  // Employee ID is required for faculty
  if (data.role === 'FACULTY') {
    return data.employeeId && data.employeeId.length >= 3;
  }
  return true;
}, {
  message: "Employee ID is required for faculty members",
  path: ["employeeId"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null; // If provided, it's edit mode
  onSuccess: () => void;
}

export function UserFormModal({ open, onOpenChange, user, onSuccess }: UserFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!user;
  const schema = isEditMode ? updateUserSchema : createUserSchema;

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? {
      name: user.name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId || '',
      isActive: user.isActive ?? true,
    } : {
      name: '',
      email: '',
      phone: '+91-',
      username: '',
      role: 'FACULTY' as const,
      department: 'CSE' as const,
      employeeId: '',
      isActive: true,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId || '',
        isActive: user.isActive ?? true,
      });
    } else if (!isEditMode) {
      form.reset({
        name: '',
        email: '',
        phone: '+91-',
        username: '',
        role: 'FACULTY' as const,
        department: 'CSE' as const,
        employeeId: '',
        isActive: true,
      });
    }
  }, [user, isEditMode, form]);

  // Watch role to show/hide employee ID field
  const selectedRole = form.watch('role');

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && user) {
        // Update user
        const updateData: UpdateUserRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          username: data.username,
          role: data.role,
          department: data.department,
          employeeId: data.employeeId || undefined,
          isActive: data.isActive,
        };

        await UserManagementService.updateUser(user.id, updateData);
        toast.success('User updated successfully!');
      } else {
        // Create user - server will handle password generation
        const createData = data as CreateUserFormData;
        const newUserData: CreateUserRequest = {
          name: createData.name,
          email: createData.email,
          phone: createData.phone,
          username: createData.username,
          role: createData.role,
          department: createData.department,
          employeeId: createData.employeeId || undefined,
        };

        await UserManagementService.createUser(newUserData);
        toast.success('User created successfully! Password will be sent via email.');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setError(null);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Edit User</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Create New User</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update user information and permissions.'
              : 'Add a new user to the system. Password will be automatically generated and sent via email.'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dr. John Doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@klu.ac.in"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91-9876543210"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role and Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Role & Department</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FACULTY">Faculty</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                          <SelectItem value="ECE">Electronics & Communication</SelectItem>
                          <SelectItem value="ME">Mechanical Engineering</SelectItem>
                          <SelectItem value="CE">Civil Engineering</SelectItem>
                          <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Employee ID (Faculty only) */}
              {selectedRole === 'FACULTY' && (
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="FAC001"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active User
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update User' : 'Create User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
