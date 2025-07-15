"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, User, Coffee } from "lucide-react";
import type { SectionSchedule, TimeSlot } from "@/lib/types/section-schedule";
import type { Section } from "@/lib/types/section-management";

interface ScheduleViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  schedule: SectionSchedule;
}

export function ScheduleViewModal({
  open,
  onOpenChange,
  section,
  schedule,
}: ScheduleViewModalProps) {
  // Sort time slots by start time
  const sortedTimeSlots = [...(schedule.timeSlots || [])].sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = startTime.split(':').map(Number);
    const end = endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes - startMinutes;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule for {section.name}
          </DialogTitle>
          <DialogDescription>
            Complete timetable showing all time slots, rooms, and faculty assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span><strong>Students:</strong> {section.strength}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span><strong>Primary Room:</strong> {schedule.room?.roomString || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span><strong>Total Slots:</strong> {sortedTimeSlots.length}</span>
              </div>
            </div>
          </div>

          {/* Time Slots Grid */}
          {sortedTimeSlots.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Time Slots</h3>
              <div className="grid gap-3">
                {sortedTimeSlots.map((slot, index) => (
                  <Card key={slot.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {calculateDuration(slot.startTime, slot.endTime)} minutes
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            {slot.isBreak ? (
                              <div className="flex items-center gap-2">
                                <Coffee className="h-4 w-4 text-orange-500" />
                                <div>
                                  <div className="font-medium text-orange-700 dark:text-orange-400">
                                    Break
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {slot.breakDescription}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-500" />
                                <div>
                                  <div className="font-medium">Class Session</div>
                                  <div className="text-sm text-muted-foreground">
                                    Faculty: {slot.inchargeFaculty?.name || 'Not assigned'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Room */}
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            <div>
                              <div className="font-medium">
                                {slot.room?.roomString || 'Room not set'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {slot.room?.roomType}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <Badge variant={slot.isBreak ? "secondary" : "default"}>
                            {slot.isBreak ? "Break" : "Class"}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Time Slots</h3>
              <p className="text-muted-foreground">
                This schedule doesn't have any time slots yet. Add some time slots to create the timetable.
              </p>
            </div>
          )}

          {/* Summary */}
          {sortedTimeSlots.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Schedule Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-400">
                    {sortedTimeSlots.filter(s => !s.isBreak).length}
                  </div>
                  <div className="text-muted-foreground">Class Sessions</div>
                </div>
                <div>
                  <div className="font-medium text-orange-700 dark:text-orange-400">
                    {sortedTimeSlots.filter(s => s.isBreak).length}
                  </div>
                  <div className="text-muted-foreground">Breaks</div>
                </div>
                <div>
                  <div className="font-medium text-green-700 dark:text-green-400">
                    {sortedTimeSlots.length > 0 ? formatTime(sortedTimeSlots[0].startTime) : 'N/A'}
                  </div>
                  <div className="text-muted-foreground">First Slot</div>
                </div>
                <div>
                  <div className="font-medium text-purple-700 dark:text-purple-400">
                    {sortedTimeSlots.length > 0 ? formatTime(sortedTimeSlots[sortedTimeSlots.length - 1].endTime) : 'N/A'}
                  </div>
                  <div className="text-muted-foreground">Last Slot</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
