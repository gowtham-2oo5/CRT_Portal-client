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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy } from "lucide-react";
import type { CopyScheduleRequest } from "@/lib/types/section-schedule";
import { DAYS_OF_WEEK, DAY_DISPLAY_NAMES } from "@/lib/types/section-schedule";

interface CopyScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CopyScheduleRequest) => Promise<void>;
  sectionId: string;
  roomId: string;
}

export function CopyScheduleModal({
  open,
  onOpenChange,
  onSubmit,
  sectionId,
  roomId,
}: CopyScheduleModalProps) {
  const [formData, setFormData] = useState<CopyScheduleRequest>({
    fromDay: "",
    toDay: "",
    sectionId,
    roomId,
    overwriteExisting: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fromDay || !formData.toDay) {
      setError("Please select both source and target days");
      return;
    }

    if (formData.fromDay === formData.toDay) {
      setError("Source and target days cannot be the same");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error copying schedule:", error);
      setError(error.message || "Failed to copy schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy Schedule
          </DialogTitle>
          <DialogDescription>
            Copy time slots from one day to another day of the week.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromDay">Copy From</Label>
            <Select
              value={formData.fromDay}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, fromDay: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {DAY_DISPLAY_NAMES[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toDay">Copy To</Label>
            <Select
              value={formData.toDay}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, toDay: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {DAY_DISPLAY_NAMES[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="overwrite"
              checked={formData.overwriteExisting}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, overwriteExisting: checked }))
              }
            />
            <Label htmlFor="overwrite" className="text-sm">
              Overwrite existing time slots
            </Label>
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
            {isSubmitting ? "Copying..." : "Copy Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
