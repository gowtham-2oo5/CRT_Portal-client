// 🎯 CRT Portal Attendance System - Student Detail Report
// Created: 2025-07-15 | Phase 4 - Task 4.1

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Mail,
  Phone,
  BookOpen,
  BarChart3
} from 'lucide-react';
import type { StudentAttendanceSummary } from '@/lib/types/attendance';

interface StudentDetailReportProps {
  studentSummary: StudentAttendanceSummary;
  onExport?: (format: 'csv' | 'pdf') => void;
  className?: string;
}

export function StudentDetailReport({
  studentSummary,
  onExport,
  className = ""
}: StudentDetailReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');

  const { student, attendanceSummary, sessionHistory } = studentSummary;

  // Filter session history based on selected period
  const filteredSessions = useMemo(() => {
    if (selectedPeriod === 'all') return sessionHistory;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (selectedPeriod === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    return sessionHistory.filter(session => 
      new Date(session.date) >= cutoffDate
    );
  }, [sessionHistory, selectedPeriod]);

  // Calculate period-specific statistics
  const periodStats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const attendedSessions = filteredSessions.filter(s => s.present).length;
    const percentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
    
    return {
      totalSessions,
      attendedSessions,
      percentage: Math.round(percentage * 100) / 100
    };
  }, [filteredSessions]);

  // Get student initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get attendance status color
  const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get attendance status badge
  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge className="bg-green-600">Excellent</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-blue-600">Good</Badge>;
    } else if (percentage >= 60) {
      return <Badge variant="secondary">Average</Badge>;
    } else {
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  // Get trend indicator
  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />; // Placeholder for stable
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Student Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`/api/students/${student.id}/avatar`} alt={student.name} />
                <AvatarFallback className="text-lg font-bold">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">{student.rollNumber}</span>
                  <span className="font-mono">{student.regNum}</span>
                  <span>{student.section}</span>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            {onExport && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overall Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getAttendanceColor(attendanceSummary.attendancePercentage)}`}>
                {attendanceSummary.attendancePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {attendanceSummary.attendedSessions}/{attendanceSummary.totalSessions} sessions
              </div>
            </div>
            
            <Progress 
              value={attendanceSummary.attendancePercentage} 
              className="h-3"
            />
            
            <div className="flex items-center justify-center gap-2">
              {getAttendanceBadge(attendanceSummary.attendancePercentage)}
              {getTrendIndicator(attendanceSummary.trend)}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendanceSummary.consecutiveAbsences > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  {attendanceSummary.consecutiveAbsences} consecutive absence(s)
                </span>
              </div>
            )}
            
            {attendanceSummary.attendancePercentage < 75 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Below 75% attendance threshold
                </span>
              </div>
            )}
            
            {attendanceSummary.attendancePercentage >= 90 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  Excellent attendance record
                </span>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Last attended: {new Date(attendanceSummary.lastAttended).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Period Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Period Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['all', 'month', 'week'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="flex-1"
                >
                  {period === 'all' ? 'All Time' : 
                   period === 'month' ? 'Last Month' : 'Last Week'}
                </Button>
              ))}
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getAttendanceColor(periodStats.percentage)}`}>
                {periodStats.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {periodStats.attendedSessions}/{periodStats.totalSessions} sessions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Session History
            <Badge variant="outline" className="ml-2">
              {filteredSessions.length} sessions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions found for the selected period.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSessions.map((session, index) => (
                <div
                  key={`${session.date}-${session.timeSlot}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    session.present 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {session.present ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    
                    <div>
                      <div className="font-medium">{session.topicTaught}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()} • {session.timeSlot} • {session.room}
                      </div>
                      {session.feedback && (
                        <div className="text-xs text-muted-foreground italic mt-1">
                          "{session.feedback}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant={session.present ? 'default' : 'destructive'}>
                    {session.present ? 'Present' : 'Absent'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
