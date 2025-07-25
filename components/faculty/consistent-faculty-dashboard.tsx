// 🎯 Faculty Dashboard - UI Consistent with Admin Dashboard
// Matches the exact design system and patterns from admin pages

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  GraduationCap,
  Building2,
  Activity,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-guard";
import { FacultyAttendanceService } from "@/lib/api/services/faculty-attendance";
import { toast } from "sonner";

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

export function ConsistentFacultyDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<FacultyDashboardData | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data - Following admin dashboard pattern
  const fetchDashboardData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      if (!user?.id) {
        throw new Error("User ID not available");
      }

      // Load dashboard data first for faster perceived performance
      try {
        const dashboardResponse =
          await FacultyAttendanceService.getFacultyDashboard(user.id);
        setDashboardData(dashboardResponse);
        setIsLoading(false); // Show data immediately
      } catch (dashboardError) {
        console.error(
          "[FacultyDashboard] Error fetching dashboard:",
          dashboardError
        );
      }

      // Then load session data
      try {
        const sessionResponse =
          await FacultyAttendanceService.getCurrentSession(user.id);
        setCurrentSession(sessionResponse);
      } catch (sessionError) {
        console.error(
          "[FacultyDashboard] Error fetching session:",
          sessionError
        );
      }

      setLastUpdated(new Date());

      if (showRefreshIndicator) {
        toast.success("Dashboard updated successfully!");
      }
    } catch (error: any) {
      console.error("[FacultyDashboard] Error fetching data:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load dashboard data";
      setError(errorMessage);

      if (showRefreshIndicator) {
        toast.error("Failed to refresh dashboard");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh setup - Following admin pattern
  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Manual refresh - Following admin pattern
  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  // Format timestamp for display - Following admin pattern
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Get session status color
  const getSessionStatusColor = (slot: TodayScheduleSlot) => {
    if (slot.active) return "text-green-600 bg-green-100 dark:bg-green-950/20";
    return "text-muted-foreground bg-muted";
  };

  // Loading skeleton - Following admin pattern exactly
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-9 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-12 mb-1 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schedule Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No dashboard data available</AlertDescription>
      </Alert>
    );
  }

  // Calculate metrics
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
      {/* Header - Following admin pattern exactly */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {dashboardData.profile.name}! Here's your teaching
            overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error Alert - Following admin pattern */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData()}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Session Alert */}
      {currentSession?.hasActiveSession && currentSession.currentSlot && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <Activity className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Active Session:</strong>{" "}
                {currentSession.currentSlot.sectionName} in{" "}
                {currentSession.currentSlot.room}
                <div className="text-sm text-muted-foreground">
                  {currentSession.currentSlot.startTime} -{" "}
                  {currentSession.currentSlot.endTime}
                </div>
              </div>
              <Link
                href={`/dashboard/faculty/attendance/${currentSession.currentSlot.id}`}
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

      {/* Metrics Cards - Following admin pattern exactly */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {dashboardData.todayAttendanceCount} attendance taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Sessions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.weeklyAttendanceCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions completed this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Sections
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.assignedSections?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active training sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students under guidance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule - Following admin recent actions pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Today's Schedule</span>
            <Badge variant="secondary">
              {dashboardData.todaySchedule.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.todaySchedule
                .sort((a, b) => {
                  const timeA = a.startTime.split(":").map(Number);
                  const timeB = b.startTime.split(":").map(Number);
                  return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                })
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{slot.sectionName}</div>
                        <div className="flex items-center space-x-2">
                          {slot.active && (
                            <Badge className={getSessionStatusColor(slot)}>
                              Active
                            </Badge>
                          )}
                          <Link
                            href={`/dashboard/faculty/attendance/${slot.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Attendance
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {slot.room}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Sections - Following admin pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Assigned Sections</span>
            <Badge variant="secondary">
              {dashboardData.assignedSections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.assignedSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sections assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.assignedSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarFallback>{section.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{section.name}</div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/faculty/attendance/${section.id}`}
                        >
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Attendance
                          </Button>
                        </Link>
                        <Link href={`/dashboard/faculty/reports/${section.id}`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Reports
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {section.totalStudents} students
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {section.trainingName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
