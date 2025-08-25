"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import type { CreateTimeSlotFromCellRequest } from "@/lib/types/section-schedule";

interface TimeSlotCellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTimeSlotFromCellRequest) => Promise<void>;
  dayOfWeek: string;
  templateName: string;
  sectionId: string;
  roomId: string;
}

export function TimeSlotCellModal({
  open,
  onOpenChange,
  onSubmit,
  dayOfWeek,
  templateName,
  sectionId,
  roomId,
}: TimeSlotCellModalProps) {
  const [formData, setFormData] = useState<CreateTimeSlotFromCellRequest>({
    dayOfWeek,
    templateName,
    sectionId,
    roomId,
    isRecurring: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating time slot from cell:", error);
      setError(error.message || "Failed to create time slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Time Slot
          </DialogTitle>
          <DialogDescription>
            Create a time slot for {dayOfWeek} using {templateName} template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Input value={dayOfWeek} disabled />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Input value={templateName} disabled />
          </div>

          <div className="space-y-2">
            <Label>Recurring</Label>
            <Select
              value={formData.isRecurring ? "true" : "false"}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, isRecurring: value === "true" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">One-time slot</SelectItem>
                <SelectItem value="true">Recurring weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Time Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
