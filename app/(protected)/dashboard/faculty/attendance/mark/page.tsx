// 🎯 CRT Portal Attendance System - General Attendance Marking Page
// Created: 2025-07-15 | Phase 3 - Task 3.2

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Play,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-guard";
import { AttendanceService } from "@/lib/api/services/attendance";
import {
  CurrentSessionCard,
  NextSessionCard,
} from "@/components/faculty/session-management";
import type {
  CurrentSession,
  FacultyDashboardData,
} from "@/lib/types/attendance";
import type { TimeSlot } from "@/lib/types/section-schedule";

export default function AttendanceMarkPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(
    null
  );
  const [todaySchedule, setTodaySchedule] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log("🔄 Loading current session and today's schedule");

        const [sessionResponse, scheduleResponse] = await Promise.all([
          AttendanceService.getCurrentSession(user.id),
          AttendanceService.getTodaySchedule(user.id),
        ]);

        setCurrentSession(sessionResponse.currentSlot);
        setTodaySchedule(scheduleResponse.data);

        console.log("✅ Session data loaded successfully");
      } catch (error: any) {
        console.error("❌ Error loading session data:", error);
        setError(error.message || "Failed to load session data");
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [user?.id]);

  // Handle session selection
  const handleMarkAttendance = (timeSlotId: string) => {
    router.push(`/dashboard/faculty/attendance/${timeSlotId}`);
  };

  // Get session status for display
  const getSessionDisplayStatus = (
    slot: TimeSlot
  ): "active" | "completed" | "upcoming" => {
    const now = new Date();
    const [startHour, startMin] = slot.startTime.split(":").map(Number);
    const [endHour, endMin] = slot.endTime.split(":").map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0, 0);

    if (now < sessionStart) return "upcoming";
    if (now > sessionEnd) return "completed";
    return "active";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <h1 className="text-2xl font-bold">Loading Sessions...</h1>
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
        <h1 className="text-2xl font-bold">Mark Attendance</h1>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              <Link href="/dashboard/faculty">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground">
          Select a session to mark attendance for your students
        </p>
      </div>

      {/* Current Active Session */}
      {currentSession?.hasActiveSession && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Active Session
          </h2>

          <CurrentSessionCard
            currentSession={currentSession}
            onMarkAttendance={handleMarkAttendance}
          />
        </div>
      )}

      {/* Next Upcoming Session */}
      {currentSession?.nextSlot && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Next Session
          </h2>

          <NextSessionCard currentSession={currentSession} />
        </div>
      )}

      {/* Today's Schedule */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
        </h2>

        {todaySchedule.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Sessions Today
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                You don't have any sessions scheduled for today.
              </p>
              <Link href="/dashboard/faculty" className="mt-4">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {todaySchedule.map((slot) => {
              const status = getSessionDisplayStatus(slot);
              const isActive =
                currentSession?.currentSlot?.id === slot.id.toString();
              const hasAttendance = slot.hasAttendance;

              return (
                <Card
                  key={slot.id}
                  className={`transition-all hover:shadow-md ${
                    isActive
                      ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Time */}
                        <div className="text-center">
                          <div className="font-mono font-bold text-lg">
                            {slot.startTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {slot.endTime}
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {slot.section?.name || "Section"}
                            </h3>

                            {isActive && (
                              <Badge className="bg-green-600 animate-pulse">
                                <Play className="h-3 w-3 mr-1" />
                                Live
                              </Badge>
                            )}

                            {hasAttendance && !isActive && (
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {slot.room?.roomString || "Room"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {slot.section?.strength || 0} students
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-2">
                        {slot.attendanceSession && (
                          <div className="text-right text-sm mr-4">
                            <div className="font-semibold text-green-600">
                              {slot.attendanceSession.attendancePercentage.toFixed(
                                1
                              )}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {slot.attendanceSession.presentCount}/
                              {slot.attendanceSession.totalStudents}
                            </div>
                          </div>
                        )}

                        {!slot.isBreak && (
                          <Button
                            onClick={() =>
                              handleMarkAttendance(slot.id.toString())
                            }
                            variant={
                              isActive
                                ? "default"
                                : hasAttendance
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              isActive ? "bg-green-600 hover:bg-green-700" : ""
                            }
                          >
                            {hasAttendance ? (
                              <>
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            ) : (
                              <>
                                {isActive ? "Mark Now" : "Mark Attendance"}
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        )}

                        {slot.isBreak && (
                          <Badge
                            variant="outline"
                            className="border-orange-500 text-orange-700"
                          >
                            ☕ Break Time
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/dashboard/faculty">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/dashboard/faculty/reports">
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              View Attendance Reports
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
