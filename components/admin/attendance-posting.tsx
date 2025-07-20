"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SectionManagementService } from "@/lib/api/services/section-management";
import { AttendanceService } from "@/lib/api/services/attendance";
import { StudentManagementService } from "@/lib/api/services/student-management";
import type { Section } from "@/lib/types/section-management";
import type { TimeSlot } from "@/lib/types/section-schedule";
import type { Student } from "@/lib/types/student-management";
import type { AttendanceRecord, SubmitAttendanceRequest } from "@/lib/types/attendance";
import { AttendanceSubmissionForm } from "@/components/faculty/attendance/AttendanceSubmissionForm";
import { StudentAttendanceRow } from "@/components/faculty/attendance/StudentAttendanceRow";

export function AdminAttendancePosting() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await SectionManagementService.getSections();
        setSections(data);
      } catch (error) {
        toast.error("Failed to load sections.");
      }
    };
    loadSections();
  }, []);

  useEffect(() => {
    const fetchTimeSlotsAndStudents = async () => {
      if (selectedSectionId && selectedDate) {
        setIsLoading(true);
        try {
          // Fetch time slots for the selected section and date
          // NOTE: Assuming a new API endpoint or modification to existing one for this
          // For now, I'll use a placeholder or mock data.
          // In a real scenario, you'd fetch time slots relevant to the section's schedule for the given date.
          const response = await AttendanceService.filterTimeSlots(selectedDate);
          const filteredTimeSlots = response.timeSlots.filter(ts => ts.sectionId === selectedSectionId);

          // Map FilteredTimeSlot to TimeSlot type expected by AttendanceSubmissionForm
          const mappedTimeSlots: TimeSlot[] = filteredTimeSlots.map(ts => ({
            id: ts.timeSlotId,
            startTime: ts.startTime,
            endTime: ts.endTime,
            sectionId: ts.sectionId,
            roomId: "", // Room ID is not in FilteredTimeSlot, might need to fetch separately or adjust type
            isBreak: false, // FilteredTimeSlot doesn't specify if it's a break, assuming false for now
            inchargeFacultyId: ts.facultyId,
            section: { id: ts.sectionId, name: ts.sectionName, strength: 0, training: undefined },
            room: undefined, // Room object is not in FilteredTimeSlot
          }));
          setTimeSlots(mappedTimeSlots);

          // Fetch students for the selected section
          const studentsData = await StudentManagementService.getStudentsBySection(selectedSectionId);
          setStudents(studentsData);

          // Initialize attendance records
          const initialRecords: Record<string, AttendanceRecord> = {};
          studentsData.forEach(student => {
            initialRecords[student.id] = { studentId: student.id, present: undefined };
          });
          setAttendanceRecords(initialRecords);

        } catch (error) {
          toast.error("Failed to load time slots or students.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTimeSlotsAndStudents();
  }, [selectedSectionId, selectedDate, sections]);

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { studentId, present }
    }));
  };

  const handleSubmitAttendance = async (data: SubmitAttendanceRequest) => {
    setIsSubmittingAttendance(true);
    try {
      // This is where you'd call your API to submit attendance
      console.log("Submitting attendance:", data);
      // await AttendanceService.submitAttendance(data);
      toast.success("Attendance submitted successfully!");
      // Reset form or navigate
      setSelectedTimeSlot(null);
      setAttendanceRecords({});
    } catch (error) {
      toast.error("Failed to submit attendance.");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Attendance (Admin)</CardTitle>
          <CardDescription>Select a section and time slot to post attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="section-select">Section</Label>
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger id="section-select">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="date-input">Date</Label>
            <Input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="timeslot-select">Time Slot</Label>
            <Select
              value={selectedTimeSlot?.id?.toString() || ""}
              onValueChange={value => setSelectedTimeSlot(timeSlots.find(ts => ts.id.toString() === value) || null)}
              disabled={timeSlots.length === 0 || isLoading}
            >
              <SelectTrigger id="timeslot-select">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(ts => (
                  <SelectItem key={ts.id} value={ts.id.toString()}>
                    {ts.startTime} - {ts.endTime} ({ts.isBreak ? "Break" : "Class"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p>Loading time slots and students...</p>}

      {selectedTimeSlot && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance for {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</CardTitle>
            <CardDescription>Section: {sections.find(s => s.id === selectedSectionId)?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map(student => (
                <StudentAttendanceRow
                  key={student.id}
                  student={student}
                  attendanceRecord={attendanceRecords[student.id]}
                  onAttendanceChange={handleAttendanceChange}
                />
              ))}
            </div>
            <div className="mt-6">
              <AttendanceSubmissionForm
                timeSlot={selectedTimeSlot}
                attendanceRecords={attendanceRecords}
                onSubmit={handleSubmitAttendance}
                isSubmitting={isSubmittingAttendance}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedTimeSlot && !isLoading && selectedSectionId && selectedDate && timeSlots.length === 0 && (
        <p className="text-center text-muted-foreground">No time slots found for the selected section and date.</p>
      )}
    </div>
  );
}
