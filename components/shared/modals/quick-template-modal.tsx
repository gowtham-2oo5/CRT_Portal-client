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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Star, User } from "lucide-react";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import type { QuickTemplateRequest, Faculty } from "@/lib/types/section-schedule";
import { DAYS_OF_WEEK, DAY_DISPLAY_NAMES } from "@/lib/types/section-schedule";

interface QuickTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuickTemplateRequest) => Promise<void>;
  sectionId: string;
  roomId: string;
}

export function QuickTemplateModal({
  open,
  onOpenChange,
  onSubmit,
  sectionId,
  roomId,
}: QuickTemplateModalProps) {
  const [formData, setFormData] = useState<QuickTemplateRequest>({
    sectionId,
    roomId,
    templateName: "",
    days: [],
    isRecurring: true,
    facultyId: "",
    facultyName: "",
  });
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const facultyData = await SectionScheduleService.getFaculty();
        setFaculty(facultyData);
      } catch (error) {
        console.error("Error loading faculty:", error);
      }
    };

    if (open) {
      loadFaculty();
    }
  }, [open]);

  const handleDayToggle = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      days: checked 
        ? [...prev.days, day]
        : prev.days.filter(d => d !== day)
    }));
  };

  const handleFacultyChange = (facultyId: string) => {
    const selectedFaculty = faculty.find(f => f.id === facultyId);
    setFormData(prev => ({
      ...prev,
      facultyId,
      facultyName: selectedFaculty?.name || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.templateName.trim()) {
      setError("Template name is required");
      return;
    }

    if (formData.days.length === 0) {
      setError("Please select at least one day");
      return;
    }

    if (!formData.facultyId) {
      setError("Please select a faculty member");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating quick template:", error);
      setError(error.message || "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Quick Template
          </DialogTitle>
          <DialogDescription>
            Quickly create time slots using a template across multiple days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              value={formData.templateName}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, templateName: e.target.value }))
              }
              placeholder="e.g., Period 1, Morning Session"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Faculty *
            </Label>
            <Select value={formData.facultyId} onValueChange={handleFacultyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((fac) => (
                  <SelectItem key={fac.id} value={fac.id}>
                    {fac.name} ({fac.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Select Days *</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.days.includes(day)}
                    onCheckedChange={(checked) => 
                      handleDayToggle(day, checked as boolean)
                    }
                  />
                  <Label htmlFor={day} className="text-sm">
                    {DAY_DISPLAY_NAMES[day]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, isRecurring: checked }))
              }
            />
            <Label htmlFor="recurring" className="text-sm">
              Recurring weekly
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
            {isSubmitting ? "Creating..." : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
