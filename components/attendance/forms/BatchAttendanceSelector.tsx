"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AttendanceService } from "@/lib/api/services/attendance";
import { 
  BatchGroup, 
  BatchableTimeSlot, 
  AttendanceRecord,
  SessionStudentsResponse
} from "@/lib/types/attendance";
import { StudentAttendanceData } from "@/lib/types/export-types";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";

interface BatchAttendanceSelectorProps {
  facultyId: string;
  date: string;
  onSuccess?: () => void;
}

export function BatchAttendanceSelector({ 
  facultyId, 
  date,
  onSuccess
}: BatchAttendanceSelectorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchGroups, setBatchGroups] = useState<BatchGroup[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [topicTaught, setTopicTaught] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [students, setStudents] = useState<StudentAttendanceData[]>([]);
  const [absentStudentIds, setAbsentStudentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Load batchable time slots
  useEffect(() => {
    const loadBatchableTimeSlots = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await AttendanceService.getBatchableTimeSlots(facultyId, date);
        setBatchGroups(response.batchGroups);
      } catch (error: any) {
        console.error("Error loading batchable time slots:", error);
        setError(error.message || "Failed to load time slots");
      } finally {
        setIsLoading(false);
      }
    };

    loadBatchableTimeSlots();
  }, [facultyId, date]);

  // Handle time slot selection
  const handleTimeSlotSelection = async (timeSlotId: string, checked: boolean) => {
    try {
      let newSelection: string[];
      
      if (checked) {
        // Add to selection
        newSelection = [...selectedTimeSlots, timeSlotId];
      } else {
        // Remove from selection
        newSelection = selectedTimeSlots.filter(id => id !== timeSlotId);
        
        // If we're removing the last time slot, clear students
        if (newSelection.length === 0) {
          setStudents([]);
          setAbsentStudentIds([]);
          setCurrentSectionId(null);
          setSelectedTimeSlots(newSelection);
          return;
        }
      }
      
      // Validate the new selection
      if (newSelection.length > 1) {
        const validation = await AttendanceService.validateBatchTimeSlots(newSelection);
        
        if (!validation.valid) {
          toast.error(validation.reason || "Invalid time slot selection");
          return;
        }
      }
      
      setSelectedTimeSlots(newSelection);
      
      // If this is the first selection, load students
      if (selectedTimeSlots.length === 0 && newSelection.length > 0) {
        await loadStudentsForTimeSlot(timeSlotId);
      }
    } catch (error: any) {
      console.error("Error handling time slot selection:", error);
      toast.error(error.message || "Failed to validate time slot selection");
    }
  };

  // Load students for a time slot
  const loadStudentsForTimeSlot = async (timeSlotId: string) => {
    try {
      setIsLoading(true);
      
      // Find the section ID for this time slot
      let sectionId = "";
      for (const group of batchGroups) {
        const slot = group.batchableSlots.find(slot => slot.id === timeSlotId);
        if (slot) {
          sectionId = group.sectionId;
          setCurrentSectionId(sectionId);
          break;
        }
      }
      
      if (!sectionId) {
        throw new Error("Section not found for selected time slot");
      }
      
      // Load students for this time slot
      const response = await AttendanceService.getSessionStudents(timeSlotId, date);
      setStudents(response.students);
      
      // Initialize all students as present (no absentees)
      setAbsentStudentIds([]);
    } catch (error: any) {
      console.error("Error loading students:", error);
      toast.error(error.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle student attendance
  const toggleStudentAttendance = (studentId: string, absent: boolean) => {
    if (absent) {
      setAbsentStudentIds([...absentStudentIds, studentId]);
    } else {
      setAbsentStudentIds(absentStudentIds.filter(id => id !== studentId));
    }
  };

  // Submit batch attendance
  const submitBatchAttendance = async () => {
    if (selectedTimeSlots.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }
    
    if (!topicTaught.trim()) {
      toast.error("Please enter the topic taught");
      return;
    }
    
    if (!currentSectionId) {
      toast.error("Section information is missing");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare attendance records
      const attendanceRecords: AttendanceRecord[] = students.map(student => ({
        studentId: student.id,
        present: !absentStudentIds.includes(student.id)
      }));
      
      // Submit batch attendance
      const response = await AttendanceService.submitBatchAttendance({
        date,
        sectionId: currentSectionId,
        topicTaught,
        sessionNotes: sessionNotes || undefined,
        timeSlotIds: selectedTimeSlots,
        attendanceRecords,
        isAdminRequest: false
      });
      
      if (response.success) {
        toast.success(response.message);
        
        // Reset form
        setSelectedTimeSlots([]);
        setTopicTaught("");
        setSessionNotes("");
        setStudents([]);
        setAbsentStudentIds([]);
        setCurrentSectionId(null);
        
        // Refresh data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Handle partial success
        const failedSlots = response.results.filter(r => r.status === 'error');
        if (failedSlots.length > 0) {
          toast.warning(`${failedSlots.length} time slots failed: ${failedSlots.map(s => s.error).join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error("Error submitting batch attendance:", error);
      toast.error(error.message || "Failed to submit attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time (e.g., "09:00:00" to "9:00 AM")
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  if (isLoading && batchGroups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (batchGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch Attendance</CardTitle>
          <CardDescription>
            Mark attendance for multiple consecutive time slots at once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>No Time Slots Available</AlertTitle>
            <AlertDescription>
              There are no pending time slots available for batch attendance marking.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Attendance</CardTitle>
        <CardDescription>
          Mark attendance for multiple consecutive time slots at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Slot Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">1. Select Time Slots</h3>
          <p className="text-sm text-muted-foreground">
            Select adjacent time slots for the same section to mark attendance in batch.
          </p>
          
          {batchGroups.map((group) => (
            <div key={group.sectionId} className="space-y-2">
              <h4 className="font-medium">{group.sectionName}</h4>
              <div className="space-y-2 pl-4">
                {group.batchableSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`slot-${slot.id}`}
                      checked={selectedTimeSlots.includes(slot.id)}
                      onCheckedChange={(checked) => handleTimeSlotSelection(slot.id, !!checked)}
                      disabled={
                        isSubmitting || 
                        slot.attendanceStatus !== 'PENDING' ||
                        (selectedTimeSlots.length > 0 && 
                         !selectedTimeSlots.includes(slot.id) && 
                         currentSectionId !== group.sectionId)
                      }
                    />
                    <Label 
                      htmlFor={`slot-${slot.id}`}
                      className={slot.attendanceStatus !== 'PENDING' ? "text-muted-foreground" : ""}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      {slot.attendanceStatus !== 'PENDING' && ` (${slot.attendanceStatus.toLowerCase()})`}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Topic and Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">2. Enter Session Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic Taught *</Label>
            <Input
              id="topic"
              value={topicTaught}
              onChange={(e) => setTopicTaught(e.target.value)}
              placeholder="Enter the topic covered in these sessions"
              disabled={isSubmitting || selectedTimeSlots.length === 0}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Enter any additional notes for these sessions"
              disabled={isSubmitting || selectedTimeSlots.length === 0}
            />
          </div>
        </div>

        <Separator />

        {/* Student Attendance */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">3. Mark Attendance</h3>
          
          {students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Students</AlertTitle>
              <AlertDescription>
                {selectedTimeSlots.length === 0 
                  ? "Please select a time slot to view students."
                  : "No students found for the selected time slot."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {students.length} students in this section. {absentStudentIds.length} marked absent.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAbsentStudentIds([])}
                  disabled={absentStudentIds.length === 0}
                >
                  Mark All Present
                </Button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">ID</th>
                      <th className="text-right p-2">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{student.regNum || student.id}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Label htmlFor={`attendance-${student.id}`}>
                              {absentStudentIds.includes(student.id) ? "Absent" : "Present"}
                            </Label>
                            <Checkbox
                              id={`attendance-${student.id}`}
                              checked={!absentStudentIds.includes(student.id)}
                              onCheckedChange={(checked) => toggleStudentAttendance(student.id, !checked)}
                              disabled={isSubmitting}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={submitBatchAttendance}
            disabled={
              isSubmitting || 
              selectedTimeSlots.length === 0 || 
              !topicTaught.trim() || 
              students.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for {selectedTimeSlots.length} Time Slot{selectedTimeSlots.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
