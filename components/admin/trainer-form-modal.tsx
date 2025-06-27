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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { TrainerManagementService } from '@/lib/api/services/trainer-management';
import { toast } from 'sonner';
import type { Trainer, CreateTrainerRequest, UpdateTrainerRequest } from '@/lib/types/trainer-management';

// Form validation schema
const trainerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .endsWith('@klu.ac.in', 'Email must be a KLU domain (@klu.ac.in)'),
  
  sn: z.string()
    .min(2, 'Serial number must be at least 2 characters')
    .max(20, 'Serial number must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Serial number can only contain uppercase letters and numbers'),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface TrainerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer?: Trainer | null; // If provided, it's edit mode
  onSuccess: () => void;
}

export function TrainerFormModal({ open, onOpenChange, trainer, onSuccess }: TrainerFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!trainer;

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: isEditMode ? {
      name: trainer.name,
      email: trainer.email,
      sn: trainer.sn,
    } : {
      name: '',
      email: '',
      sn: '',
    },
  });

  // Reset form when trainer changes
  useEffect(() => {
    if (isEditMode && trainer) {
      form.reset({
        name: trainer.name,
        email: trainer.email,
        sn: trainer.sn,
      });
    } else if (!isEditMode) {
      form.reset({
        name: '',
        email: '',
        sn: '',
      });
    }
  }, [trainer, isEditMode, form]);

  const onSubmit = async (data: TrainerFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (isEditMode && trainer) {
        // Update trainer
        const updateData: UpdateTrainerRequest = {
          name: data.name,
          email: data.email,
          sn: data.sn,
        };

        await TrainerManagementService.updateTrainer(trainer.id, updateData);
        toast.success('Trainer updated successfully!');
      } else {
        // Create trainer
        const createData: CreateTrainerRequest = {
          name: data.name,
          email: data.email,
          sn: data.sn,
        };

        await TrainerManagementService.createTrainer(createData);
        toast.success('Trainer created successfully!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving trainer:', error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} trainer`);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span>Edit Trainer</span>
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5 text-green-600" />
                <span>Add New Trainer</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update trainer information.'
              : 'Add a new trainer to the system.'
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Dr. Rajesh Kumar" 
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
                      placeholder="rajesh.kumar@klu.ac.in (KLU domain required)" 
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
              name="sn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="RK001 (Unique trainer short form)" 
                      {...field} 
                      disabled={isLoading}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update Trainer' : 'Create Trainer'}
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
