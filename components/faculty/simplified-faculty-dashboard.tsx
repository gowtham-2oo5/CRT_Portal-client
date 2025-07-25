"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Activity,
  GraduationCap,
  Building2,
  TrendingUp,
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

export function SimplifiedFacultyDashboard() {
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

  // Fetch dashboard data
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

  // Auto-refresh setup
  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Manual refresh
  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Get session status color
  const getSessionStatusColor = (slot: TodayScheduleSlot) => {
    if (slot.active) return "text-green-600 bg-green-100 dark:bg-green-950/20";
    return "text-muted-foreground bg-muted";
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>

        {/* Schedule Skeleton */}
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No dashboard data available</AlertDescription>
        </Alert>
      </div>
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      {/* Error Alert */}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {/* Metrics Cards - Simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today's Sessions
                </p>
                <p className="text-2xl font-bold">
                  {completedSessions}/{totalSessions}
                </p>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Weekly Sessions
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData.weeklyAttendanceCount}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned Sections
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData.assignedSections?.length || 0}
                </p>
              </div>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule - Simplified */}
      <Card>
        <CardHeader className="pb-3">
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
                  <div key={slot.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="font-medium">{slot.sectionName}</div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
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
                      <div className="flex items-center space-x-2">
                        {slot.active && (
                          <Badge className={getSessionStatusColor(slot)}>
                            Active
                          </Badge>
                        )}
                        <Link href={`/dashboard/faculty/attendance/${slot.id}`}>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Attendance
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Sections - Simplified */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Assigned Sections</span>
            <Badge variant="secondary">
              {dashboardData.assignedSections.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.assignedSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sections assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.assignedSections.map((section) => (
                <div key={section.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {section.totalStudents} students
                        </div>
                        <div>{section.trainingName}</div>
                      </div>
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/faculty/attendance/${section.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Attendance
                        </Button>
                      </Link>
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
