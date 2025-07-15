"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  CalendarSearchIcon,
  Eye,
} from "lucide-react";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { TimeSlotFormModal } from "./time-slot-form-modal";
import { ScheduleViewModal } from "./schedule-view-modal";
import { toast } from "sonner";
import type {
  SectionSchedule,
  TimeSlot,
  CreateTimeSlotRequest,
  ScheduleValidation,
} from "@/lib/types/section-schedule";
import type { Section } from "@/lib/types/section-management";

interface SectionScheduleProps {
  section: Section;
  onBack: () => void;
}

export function SectionScheduleComponent({
  section,
  onBack,
}: SectionScheduleProps) {
  const [schedule, setSchedule] = useState<SectionSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeSlotDialog, setShowTimeSlotDialog] = useState(false);
  const [showScheduleView, setShowScheduleView] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [validation, setValidation] = useState<ScheduleValidation | null>(null);

  const BUSINESS_START = 7 * 60 + 10; // 7:10 AM
  const BUSINESS_END = 17 * 60 + 30; // 5:30 PM

  // Load schedule data
  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const scheduleData = await SectionScheduleService.getScheduleBySection(
        section.id
      );
      setSchedule(scheduleData);

      if (scheduleData?.timeSlots) {
        const validationResult = SectionScheduleService.validateSchedule(
          scheduleData.timeSlots
        );
        setValidation(validationResult);
      }
    } catch (error: any) {
      console.error("Error loading schedule:", error);
      setError(error.message || "Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [section.id]);

  // Helper functions
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      if (hours === 12) return "12 PM";
      if (hours === 0) return "12 AM";
      if (hours < 12) return `${hours} AM`;
      return `${hours - 12} PM`;
    }
    if (hours === 12) return `12:${mins.toString().padStart(2, "0")} PM`;
    if (hours === 0) return `12:${mins.toString().padStart(2, "0")} AM`;
    if (hours < 12) return `${hours}:${mins.toString().padStart(2, "0")} AM`;
    return `${hours - 12}:${mins.toString().padStart(2, "0")} PM`;
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToPercent = (minutes: number): number => {
    return ((minutes - BUSINESS_START) / (BUSINESS_END - BUSINESS_START)) * 100;
  };

  const getCurrentTimeMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Handle time slot operations
  const handleCreateTimeSlot = async (timeSlotData: CreateTimeSlotRequest) => {
    try {
      console.log("🎯 Creating TimeSlot with data:", timeSlotData);

      if (!schedule) {
        // Create schedule first if it doesn't exist
        const newSchedule = await SectionScheduleService.createSectionSchedule({
          sectionId: section.id,
          roomId: timeSlotData.roomId,
        });
        setSchedule(newSchedule);
      }

      const updatedSchedule = await SectionScheduleService.addTimeSlot(
        schedule?.id || "new",
        timeSlotData
      );

      console.log("🔄 Updated schedule received:", updatedSchedule);
      console.log(
        "🔄 TimeSlots in updated schedule:",
        updatedSchedule.timeSlots
      );
      console.log(
        "🔄 Break flags in TimeSlots:",
        updatedSchedule.timeSlots?.map((ts) => ({
          id: ts.id,
          startTime: ts.startTime,
          isBreak: ts.isBreak,
          breakDescription: ts.breakDescription,
        }))
      );

      setSchedule(updatedSchedule);

      const validationResult = SectionScheduleService.validateSchedule(
        updatedSchedule.timeSlots
      );
      setValidation(validationResult);

      toast.success("Time slot added successfully");
      setShowTimeSlotDialog(false);
    } catch (error: any) {
      console.error("Error creating time slot:", error);
      toast.error(error.message || "Failed to create time slot");
    }
  };

  const handleUpdateTimeSlot = async (timeSlotData: any) => {
    if (!editingTimeSlot || !schedule) return;

    try {
      const updatedSchedule = await SectionScheduleService.updateTimeSlot(
        schedule.id,
        editingTimeSlot.id,
        timeSlotData
      );
      setSchedule(updatedSchedule);

      const validationResult = SectionScheduleService.validateSchedule(
        updatedSchedule.timeSlots
      );
      setValidation(validationResult);

      toast.success("Time slot updated successfully");
      setEditingTimeSlot(null);
    } catch (error: any) {
      console.error("Error updating time slot:", error);
      toast.error(error.message || "Failed to update time slot");
    }
  };

  const handleDeleteTimeSlot = async (timeSlotId: number) => {
    if (!schedule) return;
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    try {
      const updatedSchedule = await SectionScheduleService.deleteTimeSlot(
        schedule.id,
        timeSlotId
      );
      setSchedule(updatedSchedule);

      const validationResult = SectionScheduleService.validateSchedule(
        updatedSchedule.timeSlots
      );
      setValidation(validationResult);

      toast.success("Time slot deleted successfully");
    } catch (error: any) {
      console.error("Error deleting time slot:", error);
      toast.error(error.message || "Failed to delete time slot");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentTimeMinutes = getCurrentTimeMinutes();
  const currentTimePercent = minutesToPercent(currentTimeMinutes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Schedule for {section.name}
            </h1>
            <p className="text-muted-foreground">
              Training: {section.training?.name} • Students: {section.strength}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This schedule will be repeated throughout the week
            </p>
          </div>
        </div>
        {schedule && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowScheduleView(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
            <Button onClick={() => setShowTimeSlotDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        )}
      </div>

      {/* Validation Warning */}
      {validation && validation.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Schedule Requirements Not Met:</p>
              {validation.warnings.map((warning, index) => (
                <p key={index} className="text-sm">
                  • {warning}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedule?.timeSlots?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Time</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation ? `${validation.workMinutes}min` : "0min"}
            </div>
            <p className="text-xs text-muted-foreground">
              Required: {validation?.requiredWorkMinutes || 400}min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break Time</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation ? `${validation.breakMinutes}min` : "0min"}
            </div>
            <p className="text-xs text-muted-foreground">
              Required: {validation?.requiredBreakMinutes || 70}min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {validation?.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation?.isValid ? "Complete" : "Incomplete"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading schedule...</div>
            </div>
          </CardContent>
        </Card>
      ) : !schedule ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <CalendarSearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Schedule Found</h3>
              <p className="text-muted-foreground mb-4">
                This section doesn't have a schedule yet. Initialize one from
                Schedule Management.
              </p>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sections
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="relative h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
                {/* Hour markers */}
                {[8, 10, 12, 14, 16].map((hour) => {
                  const percent = minutesToPercent(hour * 60);
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600"
                      style={{ left: `${percent}%` }}
                    >
                      <span className="absolute -bottom-6 -translate-x-1/2 text-xs text-gray-500">
                        {hour > 12
                          ? `${hour - 12}PM`
                          : hour === 12
                          ? "12PM"
                          : `${hour}AM`}
                      </span>
                    </div>
                  );
                })}

                {/* Time slots */}
                {schedule?.timeSlots?.map((slot) => {
                  const startMinutes = timeToMinutes(slot.startTime);
                  const endMinutes = timeToMinutes(slot.endTime);
                  const startPercent = minutesToPercent(startMinutes);
                  const widthPercent =
                    minutesToPercent(endMinutes) - startPercent;

                  return (
                    <div
                      key={slot.id}
                      className={`absolute top-2 bottom-2 rounded-lg cursor-pointer group ${
                        slot.isBreak === true
                          ? "bg-orange-400 hover:bg-orange-500"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      onClick={() => setEditingTimeSlot(slot)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {slot.isBreak === true ? "Break" : "Class"}
                      </div>
                    </div>
                  );
                })}

                {/* Current time indicator */}
                {currentTimeMinutes >= BUSINESS_START &&
                  currentTimeMinutes <= BUSINESS_END && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${currentTimePercent}%` }}
                    >
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full" />
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Slots List */}
      {schedule?.timeSlots && schedule.timeSlots.length > 0 && (
        <div
          className="space-y-3"
          key={`schedule-${schedule.id}-${schedule.timeSlots.length}`}
        >
          {schedule.timeSlots
            .sort(
              (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
            )
            .map((slot) => {
              const startMinutes = timeToMinutes(slot.startTime);
              const endMinutes = timeToMinutes(slot.endTime);
              const isCurrent =
                currentTimeMinutes >= startMinutes &&
                currentTimeMinutes < endMinutes;

              return (
                <Card
                  key={slot.id}
                  className={`border-0 shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    isCurrent
                      ? "bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500"
                      : slot.isBreak === true
                      ? "bg-orange-50 dark:bg-orange-900/20"
                      : "bg-white dark:bg-gray-800"
                  }`}
                  onClick={() => setEditingTimeSlot(slot)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {isCurrent
                            ? "🔴"
                            : slot.isBreak === true
                            ? "☕"
                            : "📚"}
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-white">
                            {slot.isBreak === true
                              ? slot.breakDescription || "Break"
                              : "Class Session"}
                          </div>
                          <div className="text-gray-500">
                            {slot.startTime} - {slot.endTime} •{" "}
                            {slot.duration ||
                              timeToMinutes(slot.endTime) -
                                timeToMinutes(slot.startTime)}
                            min
                          </div>
                          {!(slot.isBreak === true) &&
                            slot.inchargeFacultyId && (
                              <div className="text-sm text-gray-400">
                                Faculty: {slot.inchargeFacultyId}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isCurrent && (
                          <Badge className="bg-green-500 text-white">
                            Live
                          </Badge>
                        )}
                        {slot.isBreak === true && (
                          <Badge className="bg-orange-500 text-white">
                            Break
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTimeSlot(slot.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* View Schedule Modal */}
      {schedule && (
        <ScheduleViewModal
          open={showScheduleView}
          onOpenChange={setShowScheduleView}
          section={section}
          schedule={schedule}
        />
      )}

      {/* View Schedule Modal */}
      {schedule && (
        <ScheduleViewModal
          open={showScheduleView}
          onOpenChange={setShowScheduleView}
          section={section}
          schedule={schedule}
        />
      )}

      {/* Create/Edit Time Slot Modal */}
      <TimeSlotFormModal
        open={showTimeSlotDialog || !!editingTimeSlot}
        onOpenChange={(open) => {
          if (!open) {
            setShowTimeSlotDialog(false);
            setEditingTimeSlot(null);
          }
        }}
        onSubmit={editingTimeSlot ? handleUpdateTimeSlot : handleCreateTimeSlot}
        initialData={editingTimeSlot}
        scheduleId={schedule?.id || ""} // Pass the schedule ID
        sectionId={section.id} // Keep section ID for TimeSlot data
        scheduleRoomId={schedule?.roomId} // Pass the room from schedule
        existingTimeSlots={schedule?.timeSlots || []} // Pass existing TimeSlots for overlap validation
        mode={editingTimeSlot ? "edit" : "create"}
      />
    </div>
  );
}
