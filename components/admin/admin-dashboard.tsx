"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  Clock, 
  CheckCircle,
  FileText,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { AdminService } from '@/lib/api/services/admin';
import { useAuth } from '@/components/auth/auth-guard';
import { toast } from 'sonner';
import type { DashboardMetrics, RecentAction } from '@/lib/types/admin';

export function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    totalFaculties: 0,
    totalSections: 0,
    totalRooms: 0,
    totalTimeSlots: 0,
    activeStudents: 0,
    totalAttendanceRecords: 0
  });
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
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

      // Load metrics first for faster perceived performance
      try {
        const metricsData = await AdminService.getDashboardMetrics();
        setMetrics(metricsData);
        setIsLoading(false); // Show metrics immediately
      } catch (metricsError) {
        console.error('[AdminDashboard] Error fetching metrics:', metricsError);
      }

      // Then load recent actions
      try {
        const actionsData = await AdminService.getRecentActions(15);
        setRecentActions(actionsData);
      } catch (actionsError) {
        console.error('[AdminDashboard] Error fetching actions:', actionsError);
      }

      setLastUpdated(new Date());
      
      if (showRefreshIndicator) {
        toast.success('Dashboard updated successfully!');
      }
    } catch (error: any) {
      console.error('[AdminDashboard] Error fetching data:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      if (showRefreshIndicator) {
        toast.error('Failed to refresh dashboard');
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
  }, []);

  // Manual refresh
  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  // Get attendance color based on percentage
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-100 dark:bg-green-950/20';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/20';
    return 'text-red-600 bg-red-100 dark:bg-red-950/20';
  };

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
          {Array.from({ length: 8 }).map((_, i) => (
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

        {/* Recent Actions Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
              <div className="h-5 bg-muted rounded w-8 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                      <div className="h-5 bg-muted rounded w-12 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your system overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeStudents} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFaculties}</div>
            <p className="text-xs text-muted-foreground">
              Teaching staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSections}</div>
            <p className="text-xs text-muted-foreground">
              Active class sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Available classrooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTimeSlots}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled time slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              CRT eligible students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAttendanceRecords}</div>
            <p className="text-xs text-muted-foreground">
              Total attendance entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Actions</span>
            <Badge variant="secondary" className="ml-2">
              {recentActions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {action.facultyName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{action.facultyName}</span>
                      <span className="text-muted-foreground">posted attendance</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {action.sectionName}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {action.timeSlotInfo}
                      </span>
                      <Badge 
                        className={`text-xs ${getAttendanceColor(action.attendancePercentage)}`}
                      >
                        {action.attendancePercentage}%
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(action.timestamp)}
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
