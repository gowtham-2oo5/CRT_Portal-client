// 🚀 CRT Portal - WebSocket Faculty Dashboard (FIXED)
// Fixed user ID and data loading issues

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Play,
  Timer,
  Target,
  BarChart3,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-guard";
import { FacultyAttendanceService } from "@/lib/api/services/faculty-attendance";
import webSocketService, {
  FacultySessionEvent,
  AttendanceEvent,
} from "@/lib/websocket/websocket-service";

// Types matching your API response
interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  department: string | null;
  employeeId: string | null;
  phone: string;
}

interface TodayScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  sectionName: string;
  room: string;
  active: boolean;
}

interface AssignedSection {
  id: string;
  name: string;
  totalStudents: number;
  trainingName: string;
}

interface FacultyDashboardData {
  profile: FacultyProfile;
  todaySchedule: TodayScheduleSlot[];
  assignedSections: AssignedSection[];
  todayAttendanceCount: number;
  weeklyAttendanceCount: number;
}

interface CurrentSession {
  hasActiveSession: boolean;
  currentSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    active: boolean;
    timeRemaining?: number;
  } | null;
  nextSlot: {
    id: string;
    startTime: string;
    endTime: string;
    sectionName: string;
    sectionId: string;
    room: string;
    timeUntilStart?: number;
  } | null;
}

export function WebSocketFacultyDashboardFixed() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<FacultyDashboardData | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<string>("Connecting...");

  // Refs to prevent memory leaks
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  // Set up WebSocket event handlers
  const setupWebSocketEventHandlers = useCallback(() => {
    console.log("🔧 Setting up WebSocket event handlers...");

    // Faculty session events (matches your implementation)
    webSocketService.on("faculty_session_started", (data: any) => {
      console.log("🎯 Session started event received:", data);
      if (isComponentMountedRef.current) {
        setCurrentSession((prev) => ({
          ...prev,
          hasActiveSession: true,
          currentSlot: {
            id: data.sessionId,
            startTime: data.startTime,
            endTime: data.endTime,
            sectionName: data.sectionName,
            sectionId: data.sessionId,
            room: data.room,
            active: true,
            timeRemaining: data.timeRemaining,
          },
        }));

        // Update today's schedule to mark session as active
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                todaySchedule: prev.todaySchedule.map((slot) =>
                  slot.id === data.sessionId ? { ...slot, active: true } : slot
                ),
              }
            : null
        );
      }
    });

    webSocketService.on("faculty_session_ended", (data: any) => {
      console.log("🏁 Session ended event received:", data);
      if (isComponentMountedRef.current) {
        setCurrentSession((prev) => ({
          ...prev,
          hasActiveSession: false,
          currentSlot: null,
        }));

        // Update today's schedule
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                todaySchedule: prev.todaySchedule.map((slot) =>
                  slot.id === data.sessionId ? { ...slot, active: false } : slot
                ),
                todayAttendanceCount: prev.todayAttendanceCount + 1,
              }
            : null
        );
      }
    });

    webSocketService.on("faculty_session_updated", (data: any) => {
      console.log("🔄 Session updated event received:", data);
      if (isComponentMountedRef.current && currentSession?.currentSlot) {
        setCurrentSession((prev) =>
          prev?.currentSlot
            ? {
                ...prev,
                currentSlot: {
                  ...prev.currentSlot,
                  timeRemaining: data.timeRemaining,
                },
              }
            : prev
        );
      }
    });

    webSocketService.on("faculty_next_session", (data: any) => {
      console.log("⏰ Next session warning received:", data);
      if (isComponentMountedRef.current) {
        setCurrentSession((prev) => ({
          ...prev,
          nextSlot: {
            id: data.sessionId,
            startTime: data.startTime,
            endTime: data.endTime,
            sectionName: data.sectionName,
            sectionId: data.sessionId,
            room: data.room,
            timeUntilStart: data.timeUntilStart,
          },
        }));
      }
    });

    // Attendance events
    webSocketService.on("attendance_stats_updated", (data: any) => {
      console.log("📊 Attendance stats updated:", data);
      if (isComponentMountedRef.current) {
        setDashboardData((prev) =>
          prev
            ? {
                ...prev,
                todayAttendanceCount:
                  data.todayCount || prev.todayAttendanceCount,
                weeklyAttendanceCount:
                  data.weeklyCount || prev.weeklyAttendanceCount,
              }
            : null
        );
      }
    });

    // Connection events
    webSocketService.on("connection_established", () => {
      console.log("✅ WebSocket connection established");
      setWsConnected(true);
      setWsStatus("Connected");
    });

    webSocketService.on("connection_lost", () => {
      console.log("❌ WebSocket connection lost");
      setWsConnected(false);
      setWsStatus("Disconnected");
    });

    webSocketService.on("connection_failed", () => {
      console.log("🚨 WebSocket connection failed");
      setWsConnected(false);
      setWsStatus("Failed");
    });

    // Heartbeat response
    webSocketService.on("pong", (data: any) => {
      console.log("💓 Heartbeat response received:", data);
    });

    console.log("✅ WebSocket event handlers set up complete");
  }, [currentSession]);

  // WebSocket connection and event handlers
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        console.log("🔌 Initializing WebSocket connection...");

        // Set up event handlers first
        setupWebSocketEventHandlers();

        // Connect to WebSocket
        await webSocketService.connect();
        setWsConnected(true);
        setWsStatus("Connected");

        // FIXED: Use user.userId instead of user.userId
        if (user?.userId) {
          console.log("🏠 Joining faculty room for:", user.userId);
          webSocketService.joinFacultyRoom(user.userId);
        } else {
          console.warn("⚠️ No user ID available for WebSocket room joining");
        }

        // Start heartbeat
        startHeartbeat();
      } catch (error) {
        console.error("❌ WebSocket connection failed:", error);
        setWsConnected(false);
        setWsStatus("Connection Failed");
      }
    };

    initializeWebSocket();

    return () => {
      isComponentMountedRef.current = false;
      webSocketService.cleanup();
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [user?.userId, setupWebSocketEventHandlers]);

  // Start heartbeat (matches your /app/ping endpoint)
  const startHeartbeat = () => {
    heartbeatTimerRef.current = setInterval(() => {
      if (webSocketService.isWebSocketConnected()) {
        webSocketService.sendHeartbeat();
      }
    }, 30000); // Every 30 seconds
  };

  // Optimized clock update - every 30 seconds
  useEffect(() => {
    const updateClock = () => {
      if (isComponentMountedRef.current) {
        setCurrentTime(new Date());
      }
    };

    updateClock();
    clockTimerRef.current = setInterval(updateClock, 30000);

    return () => {
      if (clockTimerRef.current) {
        clearInterval(clockTimerRef.current);
      }
    };
  }, []);

  // FIXED: Load initial data (this was missing!)
  const loadInitialData = useCallback(async () => {
    if (!user?.userId || !isComponentMountedRef.current) {
      console.warn("⚠️ Cannot load initial data - no user ID");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "📊 Loading initial dashboard data for faculty:",
        user.userId
      );

      // Load initial data once
      const [dashboardResponse, sessionResponse] = await Promise.all([
        FacultyAttendanceService.getFacultyDashboard(user.userId),
        FacultyAttendanceService.getCurrentSession(user.userId),
      ]);

      if (!isComponentMountedRef.current) return;

      console.log("✅ Initial dashboard data loaded:", dashboardResponse);
      console.log("✅ Initial session data loaded:", sessionResponse);

      setDashboardData(dashboardResponse);
      setCurrentSession(sessionResponse);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error("❌ Error loading initial dashboard data:", error);
      if (isComponentMountedRef.current) {
        setError(error.message || "Failed to load dashboard");
      }
    } finally {
      if (isComponentMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.userId]);

  // Load initial data once
  useEffect(() => {
    if (user?.userId) {
      loadInitialData();
    }
  }, [loadInitialData, user?.userId]);

  // Helper functions
  const getTimeRemaining = (endTime: string): number => {
    try {
      const now = new Date();
      const [hours, minutes] = endTime.split(":").map(Number);
      const sessionEnd = new Date();
      sessionEnd.setHours(hours, minutes, 0, 0);
      const diffMs = sessionEnd.getTime() - now.getTime();
      return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    } catch {
      return 0;
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Manual refresh (fallback if WebSocket fails)
  const handleManualRefresh = () => {
    loadInitialData();
  };

  // Debug function to test WebSocket events
  const testWebSocketEvent = () => {
    console.log("🧪 Testing WebSocket event...");
    // Simulate a session started event
    webSocketService.emit("faculty_session_started", {
      sessionId: "test-session-123",
      sectionName: "TEST-SECTION",
      startTime: "10:00",
      endTime: "11:00",
      room: "TEST-ROOM",
      timeRemaining: 60,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>No dashboard data available</span>
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Data
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  const totalStudents =
    dashboardData.assignedSections?.reduce(
      (acc, section) => acc + (section.totalStudents || 0),
      0
    ) || 0;
  const completedSessions =
    dashboardData.todaySchedule?.filter((slot) => !slot.active).length || 0;
  const totalSessions = dashboardData.todaySchedule?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header with WebSocket status and debug */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {dashboardData.profile.name}!
          </h1>
          <p className="text-muted-foreground">
            {dashboardData.profile.department || "Faculty Member"}
          </p>
          <div className="flex items-center gap-4 mt-2">
            {lastRefresh && (
              <p className="text-xs text-muted-foreground">
                Last updated: {formatTime(lastRefresh)}
              </p>
            )}
            <div className="flex items-center gap-2">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-xs ${
                  wsConnected ? "text-green-600" : "text-red-600"
                }`}
              >
                WebSocket: {wsStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {process.env.NODE_ENV === "development" && (
              <Button variant="outline" size="sm" onClick={testWebSocketEvent}>
                🧪 Test Event
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time session alerts */}
      {currentSession?.hasActiveSession && currentSession.currentSlot && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <Play className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>🔴 LIVE SESSION:</strong>{" "}
                {currentSession.currentSlot.sectionName}
                <div className="text-sm text-muted-foreground">
                  {currentSession.currentSlot.room} •{" "}
                  {currentSession.currentSlot.startTime} -{" "}
                  {currentSession.currentSlot.endTime}
                  <span className="ml-2">
                    •{" "}
                    {currentSession.currentSlot.timeRemaining ||
                      getTimeRemaining(currentSession.currentSlot.endTime)}{" "}
                    minutes remaining
                  </span>
                </div>
              </div>
              <Link
                href={`/dashboard/faculty/attendance?sectionId=${currentSession.currentSlot.sectionId}`}
              >
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Next session warning */}
      {!currentSession?.hasActiveSession && currentSession?.nextSlot && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Timer className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>⏰ NEXT SESSION:</strong>{" "}
                {currentSession.nextSlot.sectionName}
                <div className="text-sm text-muted-foreground">
                  {currentSession.nextSlot.room} •{" "}
                  {currentSession.nextSlot.startTime} -{" "}
                  {currentSession.nextSlot.endTime}
                  <span className="ml-2">
                    • Starts in {currentSession.nextSlot.timeUntilStart} minutes
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Prepare
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards - Updated in real-time via WebSocket */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedSessions}/{totalSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.todayAttendanceCount} attendance submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSessions > 0
                ? Math.round((completedSessions / totalSessions) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.weeklyAttendanceCount}
            </div>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.assignedSections?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule - Updated in real-time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
            {wsConnected && (
              <Badge
                variant="outline"
                className="ml-2 text-xs bg-green-100 text-green-800"
              >
                🔴 LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboardData.todaySchedule ||
          dashboardData.todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.todaySchedule.map((slot) => {
                const isActive = currentSession?.currentSlot?.id === slot.id;
                const timeRemaining = isActive
                  ? currentSession.currentSlot?.timeRemaining ||
                    getTimeRemaining(slot.endTime)
                  : 0;

                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isActive
                        ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                        : slot.active
                        ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 bg-gray-50 dark:bg-gray-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-mono font-bold">
                          {slot.startTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.endTime}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{slot.sectionName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {slot.room}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge variant="default" className="bg-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          🔴 LIVE • {timeRemaining}min left
                        </Badge>
                      )}

                      <Link
                        href={`/dashboard/faculty/attendance?sectionId=${slot.id}`}
                      >
                        <Button
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isActive ? "Mark Now" : "Attendance"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assigned Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData.assignedSections ||
            dashboardData.assignedSections.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assigned sections</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.assignedSections.slice(0, 3).map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 rounded border"
                  >
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {section.trainingName} • {section.totalStudents}{" "}
                        students
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/faculty/attendance?sectionId=${section.id}`}
                    >
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Attendance
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/faculty/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/dashboard/faculty/timetable">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Weekly Timetable
              </Button>
            </Link>
            {currentSession?.hasActiveSession && currentSession.currentSlot && (
              <Link
                href={`/dashboard/faculty/attendance?sectionId=${currentSession.currentSlot.sectionId}`}
              >
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  🔴 Mark Live Session
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
