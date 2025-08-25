// 🎯 CRT Portal Attendance System - Dynamic Attendance Marking Page
// Created: 2025-07-15 | Phase 3 - Task 3.2

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-guard";
import { AttendanceService } from "@/lib/api/services/attendance";
import {
  StudentListCard,
  AttendanceSubmissionForm,
} from "@/components/attendance/forms";
import { SessionTimer } from "@/components/faculty/session-management";
import type {
  SessionStudentsResponse,
  AttendanceRecord,
  SubmitAttendanceRequest,
} from "@/lib/types/attendance";
import type { Student } from "@/lib/types/section-management";
import type { TimeSlot } from "@/lib/types/section-schedule";

export default function AttendanceMarkingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const timeSlotId = params.timeSlotId as string;

  const [sessionData, setSessionData] =
    useState<SessionStudentsResponse | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    console.log("In Marking attendance with timeSlotId: " + timeSlotId);

    const loadSessionData = async () => {
      if (!timeSlotId || !user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log("🔄 Loading session data for timeSlot:", timeSlotId);

        const response = await AttendanceService.getSessionStudents(
          timeSlotId
        );

        console.log(
          "✅ Session data loaded: in [timeSlotId]/page",
          response.data
        );
        setSessionData(response.data);
        console.log(
          "WE ACTUALLY DID SET SESSION DATA WTH"
          // response.data.timeSlot.roo
        );
        // console.log("ROOM RELATED BUG ANNA", response.data.tomeSlot.room);
        // Create time slot object from session data
        const timeSlotData: TimeSlot = {
          id: response.data.timeSlot.id,
          startTime: response.data.timeSlot.startTime,
          endTime: response.data.timeSlot.endTime,
          sectionId: response.data.sectionId,
          roomId: response.data.timeSlot.roomId,
          isBreak: response.data.timeSlot.isBreak,
          inchargeFacultyName: response.data.timeSlot.inchargeFacultyName,
          section: {
            id: response.data.sectionId,
            name: response.data.sectionName,
            strength: response.data.totalCount,
            activeStudents: response.data.students.length,
          },
          room: {
            id: response.data.timeSlot.roomId,
            roomString: response.data.timeSlot.roomName, // You might want to fetch actual room name
            capacity: response.data.totalCount,
            roomType: "LAB",
          },
        };
        setTimeSlot(timeSlotData);

        // Initialize empty attendance records
        const initialRecords: Record<string, AttendanceRecord> = {};
        response.data.students.forEach((student: { id: string | number }) => {
          initialRecords[student.id] = {
            studentId: student.id.toString(),
            regNum: student.regNum,
            name: student.name,
            present: undefined as any, // Will be set when marked
          };
        });
        setAttendanceRecords(initialRecords);
      } catch (error: any) {
        console.error("❌ Error loading session data:", error);
        setError(error.message || "Failed to load session data");

        if (error.message.includes("not authorized")) {
          toast.error(
            "You are not authorized to mark attendance for this session"
          );
          router.push("/dashboard/faculty");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [timeSlotId, user?.id, router]);

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

      console.log("📝 Submitting attendance:", submissionData);

      const response = await AttendanceService.submitAttendance(
        submissionData
      );

      console.log("✅ Attendance submitted successfully:", response.data);

      toast.success("Attendance submitted successfully!", {
        description: `${
          submissionData.attendanceRecords.filter((r) => r.present).length
        } students marked present`,
      });

      setHasSubmitted(true);

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard/faculty");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Error submitting attendance:", error);
      toast.error("Failed to submit attendance", {
        description: error.message || "Please try again",
      });
      throw error; // Re-throw to let form handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh session data
  const handleRefresh = () => {
    window.location.reload();
  };

  // Calculate session status
  const getSessionStatus = () => {
    if (!timeSlot) return "unknown";

    const now = new Date();
    const [startHour, startMin] = timeSlot.startTime.split(":").map(Number);
    const [endHour, endMin] = timeSlot.endTime.split(":").map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0, 0);

    if (now < sessionStart) return "upcoming";
    if (now > sessionEnd) return "completed";
    return "active";
  };

  const sessionStatus = getSessionStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculty">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
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
          <Link href="/dashboard/faculty">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!sessionData || !timeSlot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculty">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculty">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">{sessionData.sectionName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={sessionStatus === "active" ? "default" : "secondary"}>
            {sessionStatus === "active" && (
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            )}
            {sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}{" "}
            Session
          </Badge>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
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
                <span>{sessionData.timeSlot.roomName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {timeSlot.startTime} - {timeSlot.endTime}
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              {sessionStatus === "active" && (
                <SessionTimer
                  startTime={timeSlot.startTime}
                  endTime={timeSlot.endTime}
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This session has ended. Please submit attendance as soon as
                    possible.
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
            Attendance has been submitted successfully! Redirecting to
            dashboard...
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
      {!hasSubmitted && timeSlot && (
        <AttendanceSubmissionForm
          timeSlot={timeSlot}
          attendanceRecords={attendanceRecords}
          onSubmit={handleSubmitAttendance}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
