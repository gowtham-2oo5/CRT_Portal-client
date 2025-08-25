// 🎯 CRT Portal Attendance System - Faculty Reports Page
// Created: 2025-07-15 | Phase 4 - Task 4.3

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  BarChart3,
  Users,
  Calendar,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/auth-guard';
import { AttendanceService } from '@/lib/api/services/attendance';
import { 
  AttendanceReportTable, 
  StudentDetailReport, 
  SectionAnalytics,
  DateRangeFilter 
} from '@/components/attendance/reports';
import { ExportButtons } from '@/components/attendance/analytics';
import type { 
  AttendanceSession, 
  AttendanceFilters,
  StudentAttendanceSummary,
  AttendanceAnalytics
} from '@/lib/types/attendance';

export default function FacultyReportsPage() {
  const { user } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics' | 'students'>('reports');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttendanceSummary | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reports data
  useEffect(() => {
    const loadReportsData = async () => {
      if (!user?.userId) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log('📊 Loading faculty reports with filters:', filters);

        // Load reports and analytics in parallel
        const [reportsResponse, analyticsResponse] = await Promise.all([
          AttendanceService.getFacultyReports(user.userId, filters),
          AttendanceService.getFacultyAnalytics(user.userId, filters),
        ]);

        setSessions(reportsResponse.data);
        setAnalytics(analyticsResponse.data);

        console.log('✅ Faculty reports loaded successfully');
      } catch (error: any) {
        console.error('❌ Error loading faculty reports:', error);
        setError(error.message || 'Failed to load reports');
        toast.error('Failed to load reports', {
          description: error.message || 'Please try again'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, [user?.userId, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: AttendanceFilters) => {
    setFilters(newFilters);
  };

  // Handle student detail view
  const handleViewStudent = async (studentId: string) => {
    try {
      console.log('👤 Loading student detail report:', studentId);
      
      const response = await AttendanceService.getStudentDetailReport(studentId);
      setSelectedStudent(response.data);
      setActiveTab('students');
      
      toast.success('Student report loaded');
    } catch (error: any) {
      console.error('❌ Error loading student report:', error);
      toast.error('Failed to load student report', {
        description: error.message || 'Please try again'
      });
    }
  };

  // Handle session details view
  const handleViewSession = (sessionId: string) => {
    // Navigate to session details or open modal
    console.log('📋 Viewing session details:', sessionId);
    toast.info('Session details view - to be implemented');
  };

  // Handle data export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      console.log(`📤 Exporting faculty data as ${format}`);
      
      if (!user?.userId) throw new Error('User not authenticated');

      let blob: Blob;
      
      if (format === 'csv') {
        blob = await AttendanceService.exportFacultyData(user.userId, filters);
      } else {
        // For Excel and PDF, use the report service
        blob = await AttendanceService.exportAsCSV(filters, true);
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faculty-reports-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ ${format.toUpperCase()} export completed`);
    } catch (error: any) {
      console.error(`❌ Export failed for ${format}:`, error);
      throw error; // Re-throw for ExportButtons to handle
    }
  };

  // Refresh data
  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <h1 className="text-2xl font-bold">Loading Reports...</h1>
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
        <h1 className="text-2xl font-bold">Faculty Reports</h1>
        
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faculty Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive attendance reports and analytics
          </p>
        </div>

        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex gap-2">
            {[
              { id: 'reports', label: 'Attendance Reports', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'students', label: 'Student Details', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'default' : 'outline'}
                onClick={() => setActiveTab(id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <DateRangeFilter
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Export Options */}
      <ExportButtons
        onExport={handleExport}
        filters={filters}
        dataCount={sessions.length}
      />

      {/* Content Tabs */}
      {activeTab === 'reports' && (
        <AttendanceReportTable
          sessions={sessions}
          onViewDetails={handleViewSession}
          onExport={handleExport}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'analytics' && analytics && (
        <SectionAnalytics
          analytics={analytics}
          onViewStudent={handleViewStudent}
          onExport={handleExport}
        />
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  ← Back to Analytics
                </Button>
                <h2 className="text-xl font-semibold">Student Detail Report</h2>
              </div>
              
              <StudentDetailReport
                studentSummary={selectedStudent}
                onExport={handleExport}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Student Selected
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Select a student from the Analytics tab to view detailed attendance report.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('analytics')}
                >
                  Go to Analytics
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessions.reduce((sum, s) => sum + s.presentCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Students Present</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {sessions.reduce((sum, s) => sum + s.totalStudents, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.length > 0 
                    ? (sessions.reduce((sum, s) => sum + s.attendancePercentage, 0) / sessions.length).toFixed(1)
                    : '0.0'
                  }%
                </div>
                <div className="text-xs text-muted-foreground">Average Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
