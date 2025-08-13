"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import type { TimeSlot } from "@/lib/types/section-schedule";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";

interface FacultyTimetableSlot {
  dayOfWeek: string;
  templateName: string;
  timeSlot?: TimeSlot;
  isEmpty: boolean;
}

interface FacultyTimetableRow {
  dayOfWeek: string;
  slots: FacultyTimetableSlot[];
}

interface FacultyTimetableViewProps {
  facultyId: string;
  facultyName: string;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export function FacultyTimetableView({
  facultyId,
  facultyName,
  onBack,
}: FacultyTimetableViewProps) {
  const [timetable, setTimetable] = useState<FacultyTimetableRow[]>([]);
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load faculty timetable
  const loadTimetable = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const timetableData = await FacultyService.getWeeklyTimetable(facultyId);
      // const templatesData = await TimeSlotTemplateService.getTemplates();
      
      // Mock data for now
      const mockTemplates: TimeSlotTemplate[] = [
        { name: "Period 1", startTime: "09:00", endTime: "09:50" },
        { name: "Period 2", startTime: "10:00", endTime: "10:50" },
        { name: "Period 3", startTime: "11:00", endTime: "11:50" },
        { name: "Period 4", startTime: "12:00", endTime: "12:50" },
        { name: "Period 5", startTime: "14:00", endTime: "14:50" },
        { name: "Period 6", startTime: "15:00", endTime: "15:50" },
      ];

      const mockTimetable: FacultyTimetableRow[] = DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day,
        slots: mockTemplates.map(template => {
          // Mock some time slots for demonstration
          const hasSlot = Math.random() > 0.7; // 30% chance of having a slot
          return {
            dayOfWeek: day,
            templateName: template.name,
            timeSlot: hasSlot ? {
              id: Math.random(),
              startTime: template.startTime,
              endTime: template.endTime,
              isBreak: false,
              breakDescription: "",
              inchargeFacultyId: facultyId,
              inchargeFacultyName: facultyName,
              sectionId: "mock-section",
              roomId: "mock-room",
              dayOfWeek: day,
              isRecurring: true,
              duration: 50,
              label: template.name,
              section: {
                id: "mock-section",
                name: "Mock Section",
                strength: 25,
                activeStudents: 25,
              },
              room: {
                id: "mock-room",
                roomString: "Room 101",
                capacity: 30,
                roomType: "Classroom",
              },
            } : undefined,
            isEmpty: !hasSlot,
          };
        })
      }));

      setTemplates(mockTemplates);
      setTimetable(mockTimetable);
    } catch (error) {
      console.error("Failed to load timetable", error);
      toast.error("Could not load timetable.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [facultyId]);

  const getCellContent = (slot: FacultyTimetableSlot) => {
    if (slot.timeSlot) {
      return (
        <div className="text-xs">
          <div className="font-medium">{slot.timeSlot.section?.name}</div>
          <div className="text-muted-foreground">
            {slot.timeSlot.startTime} - {slot.timeSlot.endTime}
          </div>
          <div className="text-muted-foreground">
            {slot.timeSlot.room?.roomString}
          </div>
          {slot.timeSlot.isRecurring && (
            <Badge variant="secondary" className="text-xs">Recurring</Badge>
          )}
        </div>
      );
    }
    return (
      <div className="text-xs text-muted-foreground text-center">
        No Class
      </div>
    );
  };

  const getCellClassName = (slot: FacultyTimetableSlot) => {
    const baseClasses = "p-2 min-h-[80px]";
    if (slot.timeSlot) {
      return `${baseClasses} bg-blue-50 border-l-4 border-l-blue-500`;
    }
    return `${baseClasses} bg-muted/20`;
  };

  const getCurrentDayIndex = () => {
    const today = new Date().getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    return today === 0 ? 6 : today - 1;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading timetable...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">Weekly Timetable</h1>
          <p className="text-muted-foreground">
            {facultyName}
          </p>
        </div>
      </div>

      {/* Timetable */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Day</TableHead>
                  {templates.map((template) => (
                    <TableHead key={template.name} className="text-center">
                      <div className="text-xs font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.startTime} - {template.endTime}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetable.map((row, rowIndex) => (
                  <TableRow 
                    key={row.dayOfWeek}
                    className={rowIndex === getCurrentDayIndex() ? "bg-blue-50/50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {row.dayOfWeek}
                        {rowIndex === getCurrentDayIndex() && (
                          <Badge variant="default" className="text-xs">Today</Badge>
                        )}
                      </div>
                    </TableCell>
                    {row.slots.map((slot) => (
                      <TableCell
                        key={`${slot.dayOfWeek}-${slot.templateName}`}
                        className={getCellClassName(slot)}
                      >
                        {getCellContent(slot)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-l-4 border-l-blue-500"></div>
              <span>Class Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/20"></div>
              <span>No Class</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Recurring</Badge>
              <span>Weekly Recurring</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
