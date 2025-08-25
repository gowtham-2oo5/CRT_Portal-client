"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { TimeSlotTemplate, CreateTimeSlotTemplateRequest } from "@/lib/types/timeslot-template";

interface TimeSlotTemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTimeSlotTemplateRequest) => Promise<void>;
  initialData?: TimeSlotTemplate | null;
  mode: "create" | "edit";
}

export function TimeSlotTemplateFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: TimeSlotTemplateFormModalProps) {
  const [formData, setFormData] = useState<CreateTimeSlotTemplateRequest>({
    name: "",
    startTime: "09:00",
    endTime: "09:50",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setFormData({
          name: initialData.name,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
        });
      } else {
        setFormData({
          name: "",
          startTime: "09:00",
          endTime: "09:50",
        });
      }
      setError(null);
    }
  }, [open, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Template name is required.");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError("Start time and end time are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting time slot template form:", error);
      setError(error.message || "Failed to save template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateTimeSlotTemplateRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Time Slot Template" : "Edit Time Slot Template"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new reusable time slot template."
              : "Update the details of this time slot template."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              readOnly={mode === "edit"} // Name is read-only when editing
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Adding..."
                  : "Updating..."
                : mode === "create"
                ? "Add Template"
                : "Update Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
