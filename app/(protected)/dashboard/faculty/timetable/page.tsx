"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  AlertCircle,
  Activity,
  BookOpen,
  ChevronLeft,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/dashboard/breadcrumb";
import { toast } from "sonner";

// Types matching your timetable API response
interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  sectionName: string;
  room: string;
  active: boolean;
}

export default function FacultyTimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load timetable data - Following admin pattern
  const fetchTimetableData = async (showRefreshIndicator = false) => {
    if (!user?.userId) return;

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      console.log("📅 Loading timetable for faculty:", user.userId);

      // Using your timetable API endpoint
      const response = await fetch(
        `http://localhost:8080/api/faculty/timetable?id=${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth-token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Timetable loaded:", data);

      setTimetable(data);
      setLastUpdated(new Date());

      if (showRefreshIndicator) {
        toast.success("Timetable updated successfully!");
      }
    } catch (err: any) {
      console.error("❌ Error loading timetable:", err);
      const errorMessage = err?.message || "Failed to load timetable";
      setError(errorMessage);

      if (showRefreshIndicator) {
        toast.error("Failed to refresh timetable");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh setup - Following admin pattern
  useEffect(() => {
    fetchTimetableData();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchTimetableData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [user?.userId]);

  // Manual refresh - Following admin pattern
  const handleManualRefresh = () => {
    fetchTimetableData(true);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    if (now >= start && now <= end) {
      return "current";
    } else if (now > end) {
      return "past";
    } else {
      return "upcoming";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "text-green-600 bg-green-100 dark:bg-green-950/20";
      case "past":
        return "text-muted-foreground bg-muted";
      case "upcoming":
        return "text-blue-600 bg-blue-100 dark:bg-blue-950/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const sortedTimetable = [...timetable].sort((a, b) => {
    const timeA = a.startTime.split(":").map(Number);
    const timeB = b.startTime.split(":").map(Number);
    return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
  });

  // Loading skeleton - Following admin pattern
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/faculty">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </PageHeader>

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

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
            <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
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

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/faculty">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Faculty Timetable</h1>
              <p className="text-muted-foreground">
                Your daily schedule and sessions
              </p>
            </div>
          </div>
        </PageHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTimetableData()}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculty">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Faculty Timetable</h1>
            <p className="text-muted-foreground">
              Your daily schedule and sessions
            </p>
          </div>
        </div>
      </PageHeader>

      {/* Header - Following admin pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Schedule</h1>
          <p className="text-muted-foreground">
            {sortedTimetable.length} sessions • Same schedule applies daily
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

      {/* Overview Cards - Following admin metrics pattern */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedTimetable.length}</div>
            <p className="text-xs text-muted-foreground">
              Daily recurring schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sortedTimetable.filter(
                  (slot) =>
                    getTimeStatus(slot.startTime, slot.endTime) === "past"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Sessions finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                sortedTimetable.filter(
                  (slot) =>
                    getTimeStatus(slot.startTime, slot.endTime) === "upcoming"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Sessions remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Schedule - Following admin recent actions pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Detailed Schedule</span>
            <Badge variant="secondary">{sortedTimetable.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTimetable.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTimetable.map((slot) => {
                const status = getTimeStatus(slot.startTime, slot.endTime);

                return (
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
                          <Badge className={getStatusColor(status)}>
                            {status === "current"
                              ? "LIVE NOW"
                              : status === "past"
                              ? "Completed"
                              : "Upcoming"}
                          </Badge>
                          <Link
                            href={`/dashboard/faculty/attendance/${slot.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {status === "current"
                                ? "Mark Now"
                                : "View Details"}
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
                          <Building2 className="h-3 w-3 mr-1" />
                          {slot.room}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          {Math.abs(
                            parseInt(slot.endTime.split(":")[0]) * 60 +
                              parseInt(slot.endTime.split(":")[1]) -
                              (parseInt(slot.startTime.split(":")[0]) * 60 +
                                parseInt(slot.startTime.split(":")[1]))
                          )}{" "}
                          minutes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
