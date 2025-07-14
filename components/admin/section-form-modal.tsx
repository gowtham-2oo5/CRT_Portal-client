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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Section, CreateSectionRequest } from "@/lib/types/section-management";
import type { Trainer } from "@/lib/types/trainer-management";

interface SectionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSectionRequest) => Promise<void>;
  initialData?: Section | null;
  trainers: Trainer[];
  mode: "create" | "edit";
}

export function SectionFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  trainers,
  mode,
}: SectionFormModalProps) {
  const [formData, setFormData] = useState<CreateSectionRequest>({
    trainerId: "",
    sectionName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setFormData({
          trainerId: initialData.training?.id || "",
          sectionName: initialData.name,
        });
      } else {
        setFormData({
          trainerId: "",
          sectionName: "",
        });
      }
      setError(null);
    }
  }, [open, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.sectionName.trim()) {
      setError("Section name is required");
      return;
    }
    if (!formData.trainerId) {
      setError("Trainer is required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Clean up the data before submitting
      const submitData: CreateSectionRequest = {
        trainerId: formData.trainerId,
        sectionName: formData.sectionName.trim(),
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting section form:", error);
      setError(error.message || "Failed to save section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateSectionRequest, value: any) => {
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
            {mode === "create" ? "Add New Section" : "Edit Section"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new training section."
              : "Update the section information."}
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
            <Label htmlFor="sectionName">Section Name *</Label>
            <Input
              id="sectionName"
              value={formData.sectionName}
              onChange={(e) => handleInputChange("sectionName", e.target.value)}
              placeholder="e.g., Section A, Morning Batch, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainerId">Trainer *</Label>
            <Select
              value={formData.trainerId}
              onValueChange={(value) => handleInputChange("trainerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Section"
                : "Update Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
