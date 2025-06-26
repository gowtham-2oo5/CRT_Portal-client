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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { StudentManagementService } from '@/lib/api/services/student-management';
import { DEPARTMENTS, BATCHES } from '@/lib/types/student-management';
import { toast } from 'sonner';
import type { Student, CreateStudentRequest, UpdateStudentRequest } from '@/lib/types/student-management';

// Form validation schema
const studentSchema = z.object({
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

  regNum: z.string()
    .min(5, 'Registration number must be at least 5 characters')
    .max(20, 'Registration number must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Registration number can only contain uppercase letters and numbers'),

  department: z.enum(DEPARTMENTS as [string, ...string[]], {
    required_error: 'Please select a department',
  }),

  batch: z.enum(BATCHES as [string, ...string[]], {
    required_error: 'Please select a batch',
  }),

  crtEligibility: z.boolean().default(true),

  feedback: z.string()
    .max(500, 'Feedback must be less than 500 characters')
    .optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null; // If provided, it's edit mode
  onSuccess: () => void;
}

export function StudentFormModal({ open, onOpenChange, student, onSuccess }: StudentFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!student;

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: isEditMode ? {
      name: student.name,
      email: student.email,
      phone: student.phone,
      regNum: student.regNum,
      department: student.department as any,
      batch: student.batch as any,
      crtEligibility: student.crtEligibility,
      feedback: student.feedback || '',
    } : {
      name: '',
      email: '',
      phone: '+91-',
      regNum: '',
      department: 'Computer Science & Engineering' as any,
      batch: '2024-2028' as any,
      crtEligibility: true,
      feedback: '',
    },
  });

  // Reset form when student changes
  useEffect(() => {
    if (isEditMode && student) {
      form.reset({
        name: student.name,
        email: student.email,
        phone: student.phone,
        regNum: student.regNum,
        department: student.department as any,
        batch: student.batch as any,
        crtEligibility: student.crtEligibility,
        feedback: student.feedback || '',
      });
    } else if (!isEditMode) {
      form.reset({
        name: '',
        email: '',
        phone: '+91-',
        regNum: '',
        department: 'Computer Science & Engineering' as any,
        batch: '2024-2028' as any,
        crtEligibility: true,
        feedback: '',
      });
    }
  }, [student, isEditMode, form]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && student) {
        // Update student
        const updateData: UpdateStudentRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          regNum: data.regNum,
          department: data.department,
          batch: data.batch,
          crtEligibility: data.crtEligibility,
          feedback: data.feedback || undefined,
        };

        await StudentManagementService.updateStudent(student.id, updateData);
        toast.success('Student updated successfully!');
      } else {
        // Create student
        const createData: CreateStudentRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          regNum: data.regNum,
          department: data.department,
          batch: data.batch,
          crtEligibility: data.crtEligibility,
          feedback: data.feedback || undefined,
        };

        await StudentManagementService.createStudent(createData);
        toast.success('Student created successfully!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving student:', error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} student`);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Edit Student</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span>Add New Student</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update student information and CRT eligibility status.'
              : 'Add a new student to the system with academic and personal details.'
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
                          placeholder="Aarav Sharma"
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
                          placeholder="aarav.sharma@klu.ac.in"
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
                  name="regNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="21CSE001"
                          {...field}
                          disabled={isLoading}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Academic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BATCHES.map((batch) => (
                            <SelectItem key={batch} value={batch}>
                              {batch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CRT Eligibility */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">CRT Status</h3>

              <FormField
                control={form.control}
                name="crtEligibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        CRT Eligible
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

            {/* Feedback */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback / Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes or feedback about the student..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
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
                    {isEditMode ? 'Update Student' : 'Create Student'}
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
