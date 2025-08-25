"use client";

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, UserX, UserCheck } from 'lucide-react';
import { StudentManagementService } from '@/lib/api/services/student-management';
import { toast } from 'sonner';
import type { Student } from '@/lib/types/student-management';

// Form validation schema
const crtEligibilitySchema = z.object({
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
});

type CRTEligibilityFormData = z.infer<typeof crtEligibilitySchema>;

interface CRTEligibilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  action: 'ADD' | 'REMOVE'; // Add to CRT or Remove from CRT
  onSuccess: () => void;
}

export function CRTEligibilityModal({ 
  open, 
  onOpenChange, 
  student, 
  action, 
  onSuccess 
}: CRTEligibilityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CRTEligibilityFormData>({
    resolver: zodResolver(crtEligibilitySchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = async (data: CRTEligibilityFormData) => {
    if (!student) return;

    try {
      setIsLoading(true);
      setError(null);

      if (action === 'ADD') {
        await StudentManagementService.addToCRT(student.id, data.reason);
        toast.success(`${student.name} has been added to CRT program`);
      } else {
        await StudentManagementService.removeFromCRT(student.id, data.reason);
        toast.success(`${student.name} has been removed from CRT program`);
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error updating CRT eligibility:', error);
      setError(error.message || `Failed to ${action.toLowerCase()} student ${action === 'ADD' ? 'to' : 'from'} CRT`);
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

  if (!student) return null;

  const isAdding = action === 'ADD';
  const actionText = isAdding ? 'Add to CRT' : 'Remove from CRT';
  const actionDescription = isAdding 
    ? 'This student will be eligible for Campus Recruitment Training'
    : 'This student will no longer be eligible for Campus Recruitment Training';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isAdding ? (
              <>
                <UserCheck className="h-5 w-5 text-green-600" />
                <span>Add Student to CRT</span>
              </>
            ) : (
              <>
                <UserX className="h-5 w-5 text-red-600" />
                <span>Remove Student from CRT</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {actionDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Student Information */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="font-semibold">{student.name}</div>
          <div className="text-sm text-muted-foreground">
            {student.regNum} • {student.department}
          </div>
          <div className="text-sm text-muted-foreground">
            Batch: {student.batch} • Current Status: {student.crtEligibility ? 'Eligible' : 'Not Eligible'}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for {actionText} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={isAdding 
                        ? "Explain why this student should be added to CRT program..."
                        : "Explain why this student should be removed from CRT program..."
                      }
                      className="min-h-[120px]"
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning for removal */}
            {!isAdding && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Removing a student from CRT will affect their placement opportunities. 
                  This action should be taken only after careful consideration.
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant={isAdding ? "default" : "destructive"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isAdding ? (
                      <UserCheck className="mr-2 h-4 w-4" />
                    ) : (
                      <UserX className="mr-2 h-4 w-4" />
                    )}
                    {actionText}
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
