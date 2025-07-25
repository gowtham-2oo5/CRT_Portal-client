"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { SectionManagementService } from "@/lib/api/services/section-management";
import { AttendanceService } from "@/lib/api/services/attendance";
import { FacultyAttendanceService } from "@/lib/api/services/faculty-attendance";
import {
  StudentListCard,
  AttendanceSubmissionForm,
} from "@/components/faculty/attendance";
import { SessionTimer } from "@/components/faculty/session-management";
import type { Section } from "@/lib/types/section-management";
import type { TimeSlot } from "@/lib/types/section-schedule";
import type { Room } from "@/lib/types/room-management";
import type {
  SessionStudentsResponse,
  AttendanceRecord,
  SubmitAttendanceRequest,
} from "@/lib/types/attendance";
import { RoomManagementService } from "@/lib/api/services/room-management";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export function AdminAttendancePosting() {
  // Section selection state
  const [sections, setSections] = useState<Section[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(true);

  // Attendance marking state
  const [sessionData, setSessionData] =
    useState<SessionStudentsResponse | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sectionsData, roomsData] = await Promise.all([
          SectionManagementService.getSections(),
          RoomManagementService.getRooms(),
        ]);
        setSections(sectionsData);
        setRooms(roomsData);
      } catch (error) {
        toast.error("Failed to load initial data (sections/rooms).");
      }
    };
    loadInitialData();
  }, []);

  // Effect to fetch time slots when section changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedSectionId) {
        setIsLoading(true);
        try {
          const fetchedTimeSlots =
            await AttendanceService.getTimeSlotsBySection(selectedSectionId);
          setTimeSlots(fetchedTimeSlots);
          setSelectedTimeSlot(null); // Reset selected time slot when section changes

          // Find and set the selected section object
          const section = sections.find((s) => s.id === selectedSectionId);
          setSelectedSection(section || null);
        } catch (error) {
          toast.error("Failed to load time slots.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setTimeSlots([]);
        setSelectedTimeSlot(null);
        setSelectedSection(null);
      }
    };
    fetchTimeSlots();
  }, [selectedSectionId, sections]);

  // Log selected section and timeslot when they change
  useEffect(() => {
    if (selectedSection && selectedTimeSlot) {
      console.log("Selected Section:", selectedSection);
      console.log("Selected TimeSlot:", selectedTimeSlot);
    }
  }, [selectedSection, selectedTimeSlot]);

  // Handle proceed button click - load attendance data
  const handleProceed = async () => {
    if (!selectedTimeSlot || !selectedSection) {
      toast.error("Please select both a section and a time slot");
      return;
    }

    try {
      setIsLoadingSession(true);
      setError(null);

      console.log("🔄 Loading session data for timeSlot:", selectedTimeSlot.id);

      const response = await FacultyAttendanceService.getSessionStudents(
        selectedTimeSlot.id.toString()
      );

      console.log("✅ Session data loaded:", response.data);
      setSessionData(response.data);

      // Initialize empty attendance records
      const initialRecords: Record<string, AttendanceRecord> = {};
      response.data.students.forEach((student) => {
        initialRecords[student.id] = {
          studentId: student.id,
          regNum: student.rollNumber,
          name: student.name,
          present: undefined as any,
        };
      });
      setAttendanceRecords(initialRecords);

      // Switch to attendance marking mode
      setSelectionMode(false);
    } catch (error: any) {
      console.error("❌ Error loading session data:", error);
      setError(error.message || "Failed to load session data");
      toast.error(error.message || "Failed to load session data");
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Handle attendance record change
  const handleAttendanceChange = (
    studentId: string,
    record: Partial<AttendanceRecord>
  ) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...record,
      },
    }));
  };

  // Handle attendance submission
  const handleSubmitAttendance = async (
    submissionData: SubmitAttendanceRequest
  ) => {
    try {
      setIsSubmitting(true);

      console.log(
        "📝 Submitting attendance with admin override:",
        submissionData
      );

      // Add admin flag to the request
      const requestWithAdminFlag = {
        ...submissionData,
        isAdminRequest: true,
      };

      const response = await FacultyAttendanceService.submitAttendance(
        requestWithAdminFlag
      );

      console.log("✅ Attendance submitted successfully:", response.data);

      toast.success("Attendance submitted successfully!", {
        description: `${
          submissionData.attendanceRecords.filter((r) => r.present).length
        } students marked present`,
      });

      setHasSubmitted(true);

      // Reset to selection mode after successful submission
      setTimeout(() => {
        setSelectionMode(true);
        setSelectedTimeSlot(null);
        setSessionData(null);
        setAttendanceRecords({});
        setHasSubmitted(false);
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error submitting attendance:", error);
      toast.error("Failed to submit attendance", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate session status
  const getSessionStatus = () => {
    if (!selectedTimeSlot) return "unknown";

    const now = new Date();
    const [startHour, startMin] = selectedTimeSlot.startTime
      .split(":")
      .map(Number);
    const [endHour, endMin] = selectedTimeSlot.endTime.split(":").map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0, 0);

    if (now < sessionStart) return "upcoming";
    if (now > sessionEnd) return "completed";
    return "active";
  };

  // Go back to selection mode
  const handleBackToSelection = () => {
    setSelectionMode(true);
    setSessionData(null);
    setAttendanceRecords({});
    setHasSubmitted(false);
  };

  // Render section selection UI
  if (selectionMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Attendance Override</CardTitle>
            <CardDescription>
              Select a section and time slot to review and update attendance
              records.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="section-select">Section</Label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
              >
                <SelectTrigger id="section-select">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
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
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="timeslot-select">Time Slot</Label>
              <Select
                value={selectedTimeSlot?.id?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedTimeSlot(
                    timeSlots.find((ts) => ts.id.toString() === value) || null
                  )
                }
                disabled={timeSlots.length === 0 || isLoading}
              >
                <SelectTrigger id="timeslot-select">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((ts) => (
                    <SelectItem key={ts.id} value={ts.id.toString()}>
                      {ts.startTime} - {ts.endTime} (
                      {ts.isBreak ? "Break" : "Class"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleProceed}
              disabled={
                !selectedSectionId || !selectedTimeSlot || isLoadingSession
              }
              className="ml-auto"
            >
              {isLoadingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Review & Update Attendance"
              )}
            </Button>
          </CardFooter>
        </Card>

        {isLoading && <p className="text-center">Loading time slots...</p>}

        {!selectedTimeSlot &&
          !isLoading &&
          selectedSectionId &&
          selectedDate &&
          timeSlots.length === 0 && (
            <p className="text-center text-muted-foreground">
              No time slots found for the selected section and date.
            </p>
          )}

        {selectedSection && selectedTimeSlot && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Section:</h3>
                  <p>{selectedSection.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Date:</h3>
                  <p>{selectedDate}</p>
                </div>
                <div>
                  <h3 className="font-medium">Time Slot:</h3>
                  <p>
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime} (
                    {selectedTimeSlot.isBreak ? "Break" : "Class"})
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    Note: You are about to override attendance records as an
                    administrator. This action will be logged and will update
                    the original attendance data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Render attendance marking UI
  if (isLoadingSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading session...</span>
          </div>
        </div>

        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={handleProceed}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sessionData || !selectedTimeSlot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Session data not found. Please check the session ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sessionStatus = getSessionStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold">Admin Attendance Override</h1>
            <p className="text-muted-foreground">{sessionData.sectionName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Alert variant="warning" className="max-w-xs p-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Admin Override Mode
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{sessionData.sectionName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{sessionData.timeSlot.roomId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              {sessionStatus === "active" && (
                <SessionTimer
                  startTime={selectedTimeSlot.startTime}
                  endTime={selectedTimeSlot.endTime}
                  isActive={true}
                />
              )}

              {sessionStatus === "upcoming" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This session hasn't started yet. You can still mark
                    attendance in advance.
                  </AlertDescription>
                </Alert>
              )}

              {sessionStatus === "completed" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This session has ended. You are updating past attendance
                    records.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {hasSubmitted && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Attendance has been updated successfully! Returning to selection...
          </AlertDescription>
        </Alert>
      )}

      {/* Student List */}
      {!hasSubmitted && (
        <StudentListCard
          students={sessionData.students}
          attendanceRecords={attendanceRecords}
          onAttendanceChange={handleAttendanceChange}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Submission Form */}
      {!hasSubmitted && selectedTimeSlot && (
        <AttendanceSubmissionForm
          timeSlot={selectedTimeSlot}
          attendanceRecords={attendanceRecords}
          onSubmit={handleSubmitAttendance}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
