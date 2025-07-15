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
import type {
  TimeSlot,
  CreateTimeSlotRequest,
  Faculty,
} from "@/lib/types/section-schedule";
import type { Room } from "@/lib/types/room-management";

const DURATIONS = [10, 50, 60, 100];

interface TimeSlotFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTimeSlotRequest) => Promise<void>;
  initialData?: TimeSlot | null;
  scheduleId: string; // Changed from sectionId to scheduleId
  sectionId: string; // Keep sectionId for the TimeSlot data
  scheduleRoomId?: string; // Room ID from the section's schedule
  existingTimeSlots?: TimeSlot[]; // For overlap validation
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
  const [formData, setFormData] = useState<CreateTimeSlotRequest>({
    startTime: "09:00",
    endTime: "09:50",
    isBreak: false,
    breakDescription: "",
    inchargeFacultyId: "",
    sectionId,
    roomId: "",
  });

  const [selectedDuration, setSelectedDuration] = useState(50);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load faculty and rooms data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [facultyData, roomsData] = await Promise.all([
          SectionScheduleService.getFaculty(),
          RoomManagementService.getRooms(),
        ]);
        setFaculty(facultyData);
        setRooms(roomsData);
        
        // Auto-select first faculty if available and no faculty is selected
        if (facultyData.length > 0 && !formData.inchargeFacultyId) {
          setFormData(prev => ({
            ...prev,
            inchargeFacultyId: facultyData[0].id
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

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        const startMinutes = timeToMinutes(initialData.startTime);
        const endMinutes = timeToMinutes(initialData.endTime);
        const duration = endMinutes - startMinutes;

        setFormData({
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          isBreak: initialData.isBreak,
          breakDescription: initialData.breakDescription || "",
          inchargeFacultyId: initialData.inchargeFacultyId || "",
          sectionId: initialData.sectionId,
          roomId: initialData.roomId,
        });
        setSelectedDuration(duration);
      } else {
        // Create mode - pre-populate room from schedule
        setFormData({
          startTime: "09:00",
          endTime: "09:50",
          isBreak: false,
          breakDescription: "",
          inchargeFacultyId: "",
          sectionId,
          roomId: scheduleRoomId || "", // Pre-populate room
        });
        setSelectedDuration(50);
      }
      setError(null);
    }
  }, [open, initialData, mode, sectionId, scheduleId, scheduleRoomId]);

  // Helper functions
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Update end time when start time or duration changes
  useEffect(() => {
    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = startMinutes + selectedDuration;
    const endTime = minutesToTime(endMinutes);

    setFormData((prev) => ({
      ...prev,
      endTime,
    }));
  }, [formData.startTime, selectedDuration]);

  // Helper function to check for overlapping time slots
  const checkTimeOverlap = (startTime: string, endTime: string): string | null => {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const slot of existingTimeSlots) {
      // Skip checking against the slot we're editing
      if (mode === "edit" && initialData && slot.id === initialData.id) {
        continue;
      }

      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);

      // Check for overlap: new slot starts before existing ends AND new slot ends after existing starts
      if (newStart < existingEnd && newEnd > existingStart) {
        const slotLabel = slot.isBreak 
          ? `Break (${slot.breakDescription})` 
          : `Class session`;
        return `Time overlaps with existing ${slotLabel} from ${slot.startTime} to ${slot.endTime}`;
      }
    }

    return null; // No overlap found
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.startTime || !formData.endTime) {
      setError("Start time and end time are required");
      return;
    }

    if (!formData.roomId) {
      setError("Room selection is required");
      return;
    }

    // For breaks, description is required
    if (formData.isBreak && !formData.breakDescription?.trim()) {
      setError("Break description is required for break sessions");
      return;
    }

    // Check for time overlap
    const overlapError = checkTimeOverlap(formData.startTime, formData.endTime);
    if (overlapError) {
      setError(overlapError);
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData: CreateTimeSlotRequest = {
        startTime: formData.startTime,
        endTime: formData.endTime,
        isBreak: formData.isBreak,
        breakDescription: formData.breakDescription || "",
        inchargeFacultyId: formData.inchargeFacultyId || "", // Always send faculty ID (even for breaks)
        sectionId: formData.sectionId, // Always send
        roomId: formData.roomId, // Always send
      };

      console.log("🚀 Creating TimeSlot - Request Details:", {
        scheduleId,
        sectionId,
        timeSlotData: submitData,
        isBreakFlag: submitData.isBreak,
        isBreakType: typeof submitData.isBreak,
        breakDescription: submitData.breakDescription,
        formDataIsBreak: formData.isBreak,
        formDataIsBreakType: typeof formData.isBreak,
        apiEndpoint: `/section-schedules/${scheduleId}/time-slots`,
      });

      console.log("🚀 Raw submitData object:", JSON.stringify(submitData, null, 2));

      await onSubmit(submitData);
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
    console.log(`🔧 Form field changed: ${field} = ${value} (type: ${typeof value})`);
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      
      // Log the complete form state when isBreak changes
      if (field === 'isBreak') {
        console.log('🔧 Complete form state after isBreak change:', newData);
      }
      
      return newData;
    });
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

          {/* Duration Pills */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDuration === duration
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>

          {/* Time Inputs */}
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
                readOnly
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Break Toggle */}
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

          {/* Break Description (only for breaks) */}
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

          {/* Room Selection */}
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

          {/* Faculty Selection (always shown, auto-selected for breaks) */}
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
