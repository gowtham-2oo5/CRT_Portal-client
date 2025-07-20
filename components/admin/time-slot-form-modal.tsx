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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { RoomManagementService } from "@/lib/api/services/room-management";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import type {
  TimeSlot,
  CreateTimeSlotRequest,
  Faculty,
} from "@/lib/types/section-schedule";
import type { Room } from "@/lib/types/room-management";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";

interface TimeSlotFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTimeSlotRequest) => Promise<void>;
  initialData?: TimeSlot | null;
  scheduleId: string;
  sectionId: string;
  scheduleRoomId?: string;
  existingTimeSlots?: TimeSlot[];
  mode: "create" | "edit";
}

export function TimeSlotFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  scheduleId,
  sectionId,
  scheduleRoomId,
  existingTimeSlots = [],
  mode,
}: TimeSlotFormModalProps) {
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const [formData, setFormData] = useState<CreateTimeSlotRequest>({
    isBreak: false,
    breakDescription: "",
    inchargeFacultyId: "",
    sectionId,
    roomId: "",
    startTime: "", // Will be set by template
    endTime: "", // Will be set by template
  });

  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [facultyData, roomsData, templatesData] = await Promise.all([
          SectionScheduleService.getFaculty(),
          RoomManagementService.getRooms(),
          TimeSlotTemplateService.getTemplates(),
        ]);
        setFaculty(facultyData);
        setRooms(roomsData);
        setTemplates(templatesData);

        if (facultyData.length > 0 && !formData.inchargeFacultyId) {
          setFormData((prev) => ({
            ...prev,
            inchargeFacultyId: facultyData[0].id,
          }));
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, formData.inchargeFacultyId]);

  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setFormData({
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          isBreak: initialData.isBreak,
          breakDescription: initialData.breakDescription || "",
          inchargeFacultyId: initialData.inchargeFacultyId || "",
          sectionId: initialData.sectionId,
          roomId: initialData.roomId,
        });
      } else {
        setFormData({
          isBreak: false,
          breakDescription: "",
          inchargeFacultyId: "",
          sectionId,
          roomId: scheduleRoomId || "",
          startTime: "", // Will be set by template
          endTime: "", // Will be set by template
        });
      }
      setError(null);
    }
  }, [open, initialData, mode, sectionId, scheduleId, scheduleRoomId]);

  const handleTemplateChange = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        startTime: template.startTime,
        endTime: template.endTime,
      }));
    }
  };

  const checkTimeOverlap = (
    startTime: string,
    endTime: string
  ): string | null => {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const slot of existingTimeSlots) {
      if (mode === "edit" && initialData && slot.id === initialData.id) {
        continue;
      }

      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);

      if (newStart < existingEnd && newEnd > existingStart) {
        const slotLabel = slot.isBreak
          ? `Break (${slot.breakDescription})`
          : `Class session`;
        return `Time overlaps with existing ${slotLabel} from ${slot.startTime} to ${slot.endTime}`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.startTime || !formData.endTime) {
      setError("Please select a time slot template.");
      return;
    }

    if (!formData.roomId) {
      setError("Room selection is required");
      return;
    }

    if (formData.isBreak && !formData.breakDescription?.trim()) {
      setError("Break description is required for break sessions");
      return;
    }

    const overlapError = checkTimeOverlap(formData.startTime, formData.endTime);
    if (overlapError) {
      setError(overlapError);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting time slot form:", error);
      setError(error.message || "Failed to save time slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateTimeSlotRequest,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Time Slot" : "Edit Time Slot"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new time slot for this section."
              : "Update the time slot information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Time Slot Template</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name} ({template.startTime} - {template.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="isBreak"
              checked={formData.isBreak}
              onCheckedChange={(checked) =>
                handleInputChange("isBreak", checked)
              }
            />
            <Label htmlFor="isBreak" className="text-sm font-medium">
              This is a break session
            </Label>
          </div>

          {formData.isBreak && (
            <div className="space-y-2">
              <Label htmlFor="breakDescription">Break Description *</Label>
              <Textarea
                id="breakDescription"
                value={formData.breakDescription}
                onChange={(e) =>
                  handleInputChange("breakDescription", e.target.value)
                }
                placeholder="e.g., Lunch Break, Tea Break, etc."
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Room *</Label>
            <Select
              value={formData.roomId}
              onValueChange={(value) => handleInputChange("roomId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room..." />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => {
                  const roomName =
                    room.roomString ||
                    `${room.block}${room.floor}${room.roomNumber}`;
                  return (
                    <SelectItem key={room.id} value={room.id}>
                      {roomName} - {room.roomType} (Cap: {room.capacity})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Incharge Faculty *
              {formData.isBreak && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Auto-selected for breaks)
                </span>
              )}
            </Label>
            <Select
              value={formData.inchargeFacultyId}
              onValueChange={(value) =>
                handleInputChange("inchargeFacultyId", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select faculty..." />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((fac) => (
                  <SelectItem key={fac.id} value={fac.id}>
                    {fac.name}
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
                ? "Create Time Slot"
                : "Update Time Slot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
