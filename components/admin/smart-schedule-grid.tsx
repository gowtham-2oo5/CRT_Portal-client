"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Clock, 
  BookOpen, 
  Coffee, 
  GraduationCap, 
  Star, 
  Edit, 
  Trash2, 
  Copy,
  Zap,
  Save,
  X,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import { RoomManagementService } from "@/lib/api/services/room-management";
import type {
  TimeSlot,
  CreateTimeSlotRequest,
  Faculty,
} from "@/lib/types/section-schedule";
import {
  DAYS_OF_WEEK,
  DAY_DISPLAY_NAMES,
  SLOT_TYPES,
  SLOT_TYPE_DISPLAY_NAMES,
} from "@/lib/types/section-schedule";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";
import type { Room } from "@/lib/types/room-management";

interface SmartScheduleGridProps {
  sectionId: string;
  roomId?: string; // Made optional to allow room selection
  sectionName: string;
  roomName?: string; // Made optional
  onScheduleUpdate: () => void;
}

const SLOT_TYPE_ICONS = {
  REGULAR: BookOpen,
  BREAK: Coffee,
  EXAM: GraduationCap,
  SPECIAL: Star,
};

const SLOT_TYPE_COLORS = {
  REGULAR: "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
  BREAK: "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
  EXAM: "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
  SPECIAL: "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200",
};

interface GridCell {
  day: string;
  timeSlot?: TimeSlot;
  template: TimeSlotTemplate;
  isEmpty: boolean;
}

interface QuickSlotData {
  slotType: string;
  facultyId: string;
  title?: string;
  description?: string;
}

export function SmartScheduleGrid({
  sectionId,
  roomId: initialRoomId,
  sectionName,
  roomName: initialRoomName,
  onScheduleUpdate,
}: SmartScheduleGridProps) {
  const [weekSchedule, setWeekSchedule] = useState<Record<string, TimeSlot[]>>({});
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId || "");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quick add modal state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; template: TimeSlotTemplate } | null>(null);
  const [quickSlotData, setQuickSlotData] = useState<QuickSlotData>({
    slotType: "REGULAR",
    facultyId: "",
    title: "",
    description: "",
  });

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [templatesData, facultyData, roomsData] = await Promise.all([
        TimeSlotTemplateService.getTemplates(),
        SectionScheduleService.getFaculty(),
        RoomManagementService.getRooms(),
      ]);
      
      setTemplates(templatesData);
      setFaculty(facultyData);
      setRooms(roomsData);

      // Set selected room
      if (initialRoomId) {
        const room = roomsData.find(r => r.id === initialRoomId);
        setSelectedRoom(room || null);
        setSelectedRoomId(initialRoomId);
      } else if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
        setSelectedRoomId(roomsData[0].id);
      }

      // Load existing time slots for each day (only if room is selected)
      if (selectedRoomId || initialRoomId) {
        const roomIdToUse = selectedRoomId || initialRoomId;
        const weekData: Record<string, TimeSlot[]> = {};
        for (const day of DAYS_OF_WEEK) {
          try {
            const daySlots = await SectionScheduleService.getTimeSlotsByDay(day, sectionId);
            weekData[day] = daySlots.filter(slot => slot.roomId === roomIdToUse);
          } catch (error) {
            weekData[day] = [];
          }
        }
        setWeekSchedule(weekData);
      }
      
      // Set default faculty if available
      if (facultyData.length > 0 && !quickSlotData.facultyId) {
        setQuickSlotData(prev => ({ ...prev, facultyId: facultyData[0].id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sectionId, selectedRoomId]);

  // Handle room change
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoomId(roomId);
    setSelectedRoom(room || null);
  };

  // Check if a time slot exists for a specific day and time
  const getTimeSlotForCell = (day: string, template: TimeSlotTemplate): TimeSlot | undefined => {
    const daySlots = weekSchedule[day] || [];
    return daySlots.find(slot => 
      slot.startTime === template.startTime && slot.endTime === template.endTime
    );
  };

  // Handle quick add
  const handleQuickAdd = (day: string, template: TimeSlotTemplate) => {
    setSelectedCell({ day, template });
    setShowQuickAdd(true);
  };

  // Submit quick add
  const handleQuickSubmit = async () => {
    if (!selectedCell || !selectedRoomId) return;

    try {
      const requestData: CreateTimeSlotRequest = {
        inchargeFacultyId: quickSlotData.facultyId,
        sectionId,
        roomId: selectedRoomId, // Use selected room
        startTime: selectedCell.template.startTime,
        endTime: selectedCell.template.endTime,
        slotType: quickSlotData.slotType as any,
        title: quickSlotData.title,
        description: quickSlotData.description,
        dayOfWeek: selectedCell.day as any,
      };

      await SectionScheduleService.addTimeSlot(`schedule-${sectionId}`, requestData);
      toast.success("Time slot added successfully!");
      
      setShowQuickAdd(false);
      await loadData();
      onScheduleUpdate();
    } catch (error: any) {
      console.error("Error adding time slot:", error);
      toast.error(error.message || "Failed to add time slot");
    }
  };

  // Handle delete
  const handleDelete = async (timeSlot: TimeSlot) => {
    if (!confirm(`Delete this ${SLOT_TYPE_DISPLAY_NAMES[timeSlot.slotType || "REGULAR"].toLowerCase()}?`)) {
      return;
    }

    try {
      await SectionScheduleService.deleteTimeSlot(`schedule-${sectionId}`, timeSlot.id);
      toast.success("Time slot deleted successfully!");
      await loadData();
      onScheduleUpdate();
    } catch (error: any) {
      console.error("Error deleting time slot:", error);
      toast.error(error.message || "Failed to delete time slot");
    }
  };

  // Copy time slot to another day
  const handleCopyToDay = async (timeSlot: TimeSlot, targetDay: string) => {
    if (!selectedRoomId) return;

    try {
      const requestData: CreateTimeSlotRequest = {
        inchargeFacultyId: timeSlot.inchargeFacultyId || "",
        sectionId,
        roomId: selectedRoomId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        slotType: timeSlot.slotType || "REGULAR",
        title: timeSlot.title,
        description: timeSlot.description,
        dayOfWeek: targetDay as any,
      };

      await SectionScheduleService.addTimeSlot(`schedule-${sectionId}`, requestData);
      toast.success(`Time slot copied to ${DAY_DISPLAY_NAMES[targetDay]}!`);
      await loadData();
      onScheduleUpdate();
    } catch (error: any) {
      console.error("Error copying time slot:", error);
      toast.error(error.message || "Failed to copy time slot");
    }
  };

  // Render time slot cell
  const renderTimeSlotCell = (day: string, template: TimeSlotTemplate) => {
    const existingSlot = getTimeSlotForCell(day, template);
    
    if (existingSlot) {
      const Icon = SLOT_TYPE_ICONS[existingSlot.slotType as keyof typeof SLOT_TYPE_ICONS] || BookOpen;
      const colorClass = SLOT_TYPE_COLORS[existingSlot.slotType as keyof typeof SLOT_TYPE_COLORS] || SLOT_TYPE_COLORS.REGULAR;
      
      return (
        <div className={`p-2 rounded-lg border-2 ${colorClass} group relative min-h-[80px]`}>
          <div className="flex items-center justify-between mb-1">
            <Icon className="h-3 w-3" />
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0"
                onClick={() => handleDelete(existingSlot)}
              >
                <Trash2 className="h-2 w-2" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium">
              {SLOT_TYPE_DISPLAY_NAMES[existingSlot.slotType || "REGULAR"]}
            </p>
            {existingSlot.title && (
              <p className="text-xs text-gray-600 truncate" title={existingSlot.title}>
                {existingSlot.title}
              </p>
            )}
            <p className="text-xs text-gray-500 truncate" title={existingSlot.inchargeFacultyName || "Faculty"}>
              👨‍🏫 {(existingSlot.inchargeFacultyName || "Faculty").split(' ')[0]}
            </p>
          </div>

          {/* Copy dropdown */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100">
            <Select onValueChange={(targetDay) => handleCopyToDay(existingSlot, targetDay)}>
              <SelectTrigger className="h-4 w-4 p-0 border-0">
                <Copy className="h-2 w-2" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.filter(d => d !== day).map((targetDay) => (
                  <SelectItem key={targetDay} value={targetDay}>
                    Copy to {DAY_DISPLAY_NAMES[targetDay]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    // Empty cell - show quick add button
    return (
      <div 
        className="p-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group min-h-[80px]"
        onClick={() => handleQuickAdd(day, template)}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Plus className="h-4 w-4 mx-auto text-gray-400 group-hover:text-blue-500 mb-1" />
            <p className="text-xs text-gray-400 group-hover:text-blue-500">
              Add Slot
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading schedule grid...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSlots = Object.values(weekSchedule).flat().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Smart Schedule Grid
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {sectionName} • {totalSlots} time slots
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {templates.length} Templates
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {totalSlots} Slots
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Quick fill common schedule
                  toast.info("Bulk actions coming soon!");
                }}
                className="flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                Quick Fill
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Room Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Room Selection
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {sectionName} • {selectedRoom ? `${selectedRoom.roomString} (Capacity: ${selectedRoom.capacity})` : "Select a room"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRoomId} onValueChange={handleRoomChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{room.roomString}</span>
                        <span className="text-xs text-gray-500 ml-2">Cap: {room.capacity}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid */}
      {selectedRoomId ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {/* Header row - Time slots */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${templates.length}, 1fr)` }}>
                <div className="font-medium text-sm text-gray-600">Day / Time</div>
                {templates.map((template) => (
                  <div key={template.name} className="font-medium text-xs text-center text-gray-600 p-2 bg-gray-50 rounded">
                    <div>{template.startTime}</div>
                    <div className="text-gray-400">-{template.endTime}</div>
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${templates.length}, 1fr)` }}>
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-700">
                      {DAY_DISPLAY_NAMES[day]}
                    </div>
                  </div>
                  {templates.map((template) => (
                    <div key={`${day}-${template.name}`}>
                      {renderTimeSlotCell(day, template)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Room</h3>
            <p className="text-gray-500">Choose a room above to start managing the schedule</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Modal */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Add Time Slot
            </DialogTitle>
            <DialogDescription>
              {selectedCell && (
                <>
                  Adding slot for {DAY_DISPLAY_NAMES[selectedCell.day]} • {selectedCell.template.startTime}-{selectedCell.template.endTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Slot Type */}
            <div className="space-y-2">
              <Label>Slot Type</Label>
              <Select 
                value={quickSlotData.slotType} 
                onValueChange={(value) => setQuickSlotData(prev => ({ ...prev, slotType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_TYPES.map((type) => {
                    const Icon = SLOT_TYPE_ICONS[type];
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {SLOT_TYPE_DISPLAY_NAMES[type]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Faculty */}
            <div className="space-y-2">
              <Label>Faculty</Label>
              <Select 
                value={quickSlotData.facultyId} 
                onValueChange={(value) => setQuickSlotData(prev => ({ ...prev, facultyId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
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

            {/* Title (for non-regular slots) */}
            {quickSlotData.slotType !== "REGULAR" && (
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={quickSlotData.title}
                  onChange={(e) => setQuickSlotData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={
                    quickSlotData.slotType === "BREAK" ? "e.g., Morning Break" :
                    quickSlotData.slotType === "EXAM" ? "e.g., Mid-term Exam" :
                    "e.g., Guest Lecture"
                  }
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={quickSlotData.description}
                onChange={(e) => setQuickSlotData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickAdd(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleQuickSubmit} disabled={!quickSlotData.facultyId}>
              <Save className="h-4 w-4 mr-1" />
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
