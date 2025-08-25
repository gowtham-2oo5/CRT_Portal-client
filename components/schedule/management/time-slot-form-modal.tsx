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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// RadioGroup not available, using Select for slot type selection
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  User, 
  Calendar, 
  BookOpen, 
  Coffee, 
  GraduationCap, 
  Star 
} from "lucide-react";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { RoomManagementService } from "@/lib/api/services/room-management";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import type {
  TimeSlot,
  CreateTimeSlotRequest,
  Faculty,
} from "@/lib/types/section-schedule";
import {
  DAYS_OF_WEEK,
  SLOT_TYPES,
  DAY_DISPLAY_NAMES,
  SLOT_TYPE_DISPLAY_NAMES,
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

// Slot type icons for better UX
const SLOT_TYPE_ICONS = {
  REGULAR: BookOpen,
  BREAK: Coffee,
  EXAM: GraduationCap,
  SPECIAL: Star,
};

// Slot type colors for visual distinction
const SLOT_TYPE_COLORS = {
  REGULAR: "bg-blue-50 border-blue-200 text-blue-800",
  BREAK: "bg-green-50 border-green-200 text-green-800",
  EXAM: "bg-red-50 border-red-200 text-red-800",
  SPECIAL: "bg-purple-50 border-purple-200 text-purple-800",
};

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
    inchargeFacultyId: "",
    sectionId,
    roomId: scheduleRoomId || "",
    startTime: "",
    endTime: "",
    slotType: "REGULAR",
    title: "",
    description: "",
    dayOfWeek: "MONDAY",
  });

  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

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

        // Set default faculty if none selected
        if (facultyData.length > 0 && !formData.inchargeFacultyId) {
          setFormData((prev) => ({
            ...prev,
            inchargeFacultyId: facultyData[0].id,
          }));
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        setError("Failed to load form data. Please try again.");
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
          inchargeFacultyId: initialData.inchargeFacultyId || "",
          sectionId: initialData.sectionId,
          roomId: initialData.roomId,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          slotType: initialData.slotType || "REGULAR",
          title: initialData.title || "",
          description: initialData.description || "",
          dayOfWeek: initialData.dayOfWeek || "MONDAY",
        });
      } else {
        setFormData({
          inchargeFacultyId: "",
          sectionId,
          roomId: scheduleRoomId || "",
          startTime: "",
          endTime: "",
          slotType: "REGULAR",
          title: "",
          description: "",
          dayOfWeek: "MONDAY",
        });
      }
      setError(null);
      setValidationWarnings([]);
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

  const handleSlotTypeChange = (slotType: string) => {
    setFormData((prev) => ({
      ...prev,
      slotType: slotType as any,
      // Clear title if switching from BREAK/EXAM/SPECIAL to REGULAR
      title: slotType === "REGULAR" ? "" : prev.title,
    }));
  };

  const checkTimeOverlap = (
    startTime: string,
    endTime: string,
    dayOfWeek: string
  ): string | null => {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const slot of existingTimeSlots) {
      if (mode === "edit" && initialData && slot.id === initialData.id) {
        continue;
      }

      // Only check conflicts for the same day
      if (slot.dayOfWeek !== dayOfWeek) {
        continue;
      }

      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);

      if (newStart < existingEnd && newEnd > existingStart) {
        const slotLabel = slot.slotType === "BREAK"
          ? `Break (${slot.title || slot.breakDescription})`
          : slot.slotType === "EXAM"
          ? `Exam (${slot.title})`
          : slot.slotType === "SPECIAL"
          ? `Special Event (${slot.title})`
          : `Regular Class`;
        return `Time overlaps with existing ${slotLabel} from ${slot.startTime} to ${slot.endTime} on ${DAY_DISPLAY_NAMES[slot.dayOfWeek]}`;
      }
    }

    return null;
  };

  const validateForm = async (): Promise<boolean> => {
    const warnings: string[] = [];
    
    // Basic validation
    if (!formData.startTime || !formData.endTime) {
      setError("Please select start and end times.");
      return false;
    }

    if (!formData.roomId) {
      setError("Room selection is required.");
      return false;
    }

    if (!formData.inchargeFacultyId) {
      setError("Faculty selection is required.");
      return false;
    }

    // Slot type specific validation
    if ((formData.slotType === "BREAK" || formData.slotType === "EXAM" || formData.slotType === "SPECIAL") && !formData.title?.trim()) {
      setError(`Title is required for ${SLOT_TYPE_DISPLAY_NAMES[formData.slotType]} slots.`);
      return false;
    }

    // Time validation
    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);
    
    if (startMinutes >= endMinutes) {
      setError("End time must be after start time.");
      return false;
    }

    // Check for overlaps
    const overlapError = checkTimeOverlap(formData.startTime, formData.endTime, formData.dayOfWeek);
    if (overlapError) {
      setError(overlapError);
      return false;
    }

    // Duration warnings
    const duration = endMinutes - startMinutes;
    if (formData.slotType === "REGULAR" && duration < 30) {
      warnings.push("Regular classes are typically at least 30 minutes long.");
    }
    if (formData.slotType === "BREAK" && duration > 60) {
      warnings.push("Break periods are typically less than 60 minutes.");
    }

    // API validation
    try {
      const validationResult = await SectionScheduleService.validateTimeSlot(formData);
      if (!validationResult.valid) {
        setError(validationResult.message);
        return false;
      }
    } catch (error) {
      console.warn("API validation failed, proceeding with client-side validation");
    }

    setValidationWarnings(warnings);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting time slot:", error);
      setError(error.response?.data?.message || error.message || "Failed to save time slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFaculty = faculty.find(f => f.id === formData.inchargeFacultyId);
  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  const SlotIcon = SLOT_TYPE_ICONS[formData.slotType as keyof typeof SLOT_TYPE_ICONS];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {mode === "create" ? "Create New Time Slot" : "Edit Time Slot"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new time slot to the schedule. Fill in all required fields."
              : "Update the time slot details. Changes will be saved immediately."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slot Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <SlotIcon className="h-4 w-4" />
              Slot Type *
            </Label>
            <Select value={formData.slotType} onValueChange={handleSlotTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select slot type" />
              </SelectTrigger>
              <SelectContent>
                {SLOT_TYPES.map((type) => {
                  const Icon = SLOT_TYPE_ICONS[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{SLOT_TYPE_DISPLAY_NAMES[type]}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {/* Visual indicator for selected type */}
            <div className={`p-3 rounded-lg border ${SLOT_TYPE_COLORS[formData.slotType as keyof typeof SLOT_TYPE_COLORS]}`}>
              <div className="flex items-center gap-2">
                <SlotIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {SLOT_TYPE_DISPLAY_NAMES[formData.slotType]} Selected
                </span>
              </div>
            </div>
          </div>

          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Day of Week *
            </Label>
            <Select value={formData.dayOfWeek} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, dayOfWeek: value as any }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
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

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Template</Label>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
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
            <div className="flex items-end">
              <Badge variant="outline" className="text-xs">
                Or set custom times below
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Faculty Selection */}
          <div className="space-y-2">
            <Label htmlFor="faculty" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Incharge Faculty *
            </Label>
            <Select value={formData.inchargeFacultyId} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, inchargeFacultyId: value }))
            }>
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

          {/* Room Selection - Auto-populated and hidden when scheduleRoomId is provided */}
          {!scheduleRoomId && (
            <div className="space-y-2">
              <Label htmlFor="room" className="text-sm font-medium">Room *</Label>
              <Select value={formData.roomId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, roomId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.roomString} (Capacity: {room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show selected room info when auto-populated */}
          {scheduleRoomId && selectedRoom && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Room: {selectedRoom.roomString} (Capacity: {selectedRoom.capacity})
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Auto-selected from section schedule
              </p>
            </div>
          )}

          {/* Title (for non-regular slots) */}
          {formData.slotType !== "REGULAR" && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title * 
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.slotType === "BREAK" ? "Break name" : 
                    formData.slotType === "EXAM" ? "Exam name" : "Event name"})
                </span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={
                  formData.slotType === "BREAK" ? "e.g., Morning Break" :
                  formData.slotType === "EXAM" ? "e.g., Mid-term Exam" :
                  "e.g., Guest Lecture"
                }
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-xs text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about this time slot..."
              rows={3}
            />
          </div>

          {/* Summary Card */}
          {formData.startTime && formData.endTime && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <SlotIcon className="h-4 w-4" />
                  <span className="font-medium">Time Slot Summary</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Type:</strong> {SLOT_TYPE_DISPLAY_NAMES[formData.slotType]}</p>
                  <p><strong>Day:</strong> {DAY_DISPLAY_NAMES[formData.dayOfWeek]}</p>
                  <p><strong>Time:</strong> {formData.startTime} - {formData.endTime}</p>
                  {selectedFaculty && <p><strong>Faculty:</strong> {selectedFaculty.name}</p>}
                  {selectedRoom && <p><strong>Room:</strong> {selectedRoom.roomString}</p>}
                  {formData.title && <p><strong>Title:</strong> {formData.title}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationWarnings.map((warning, index) => (
                    <p key={index} className="text-sm">{warning}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
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
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Time Slot" : "Update Time Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
