// 🎯 CRT Portal Attendance System - Section Analytics
// Created: 2025-07-15 | Phase 4 - Task 4.1

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Minus
} from 'lucide-react';
import type { AttendanceAnalytics } from '@/lib/types/attendance';
import type { Student } from '@/lib/types/section-management';

interface SectionAnalyticsProps {
  analytics: AttendanceAnalytics;
  sectionId?: string;
  onViewStudent?: (studentId: string) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  className?: string;
}

export function SectionAnalytics({
  analytics,
  sectionId,
  onViewStudent,
  onExport,
  className = ""
}: SectionAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'students'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  // Filter data based on selected section if provided
  const sectionData = useMemo(() => {
    if (!sectionId) return analytics;
    
    const filteredSectionStats = analytics.sectionStats.filter(
      section => section.sectionId === sectionId
    );
    
    return {
      ...analytics,
      sectionStats: filteredSectionStats
    };
  }, [analytics, sectionId]);

  // Get performance categories
  const performanceCategories = useMemo(() => {
    const excellent = sectionData.topPerformers.filter(s => s.attendancePercentage >= 90);
    const good = sectionData.topPerformers.filter(s => s.attendancePercentage >= 75 && s.attendancePercentage < 90);
    const average = [...sectionData.topPerformers, ...sectionData.lowPerformers].filter(
      s => s.attendancePercentage >= 60 && s.attendancePercentage < 75
    );
    const poor = sectionData.lowPerformers.filter(s => s.attendancePercentage < 60);

    return { excellent, good, average, poor };
  }, [sectionData]);

  // Get trend analysis
  const trendAnalysis = useMemo(() => {
    const recentTrends = sectionData.dailyTrends.slice(-7); // Last 7 days
    if (recentTrends.length < 2) return 'stable';
    
    const firstHalf = recentTrends.slice(0, Math.floor(recentTrends.length / 2));
    const secondHalf = recentTrends.slice(Math.floor(recentTrends.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, day) => sum + day.attendancePercentage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.attendancePercentage, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }, [sectionData.dailyTrends]);

  // Get attendance distribution
  const attendanceDistribution = useMemo(() => {
    const total = sectionData.overallStats.totalStudents;
    const excellent = performanceCategories.excellent.length;
    const good = performanceCategories.good.length;
    const average = performanceCategories.average.length;
    const poor = performanceCategories.poor.length;

    return {
      excellent: { count: excellent, percentage: (excellent / total) * 100 },
      good: { count: good, percentage: (good / total) * 100 },
      average: { count: average, percentage: (average / total) * 100 },
      poor: { count: poor, percentage: (poor / total) * 100 }
    };
  }, [performanceCategories, sectionData.overallStats.totalStudents]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Section Analytics
              {sectionId && (
                <Badge variant="outline" className="ml-2">
                  Section Specific
                </Badge>
              )}
            </CardTitle>

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
                  onClick={() => onExport('excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            )}
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mt-4">
            {(['overview', 'trends', 'students'] as const).map((view) => (
              <Button
                key={view}
                variant={selectedView === view ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView(view)}
              >
                {view === 'overview' ? 'Overview' : 
                 view === 'trends' ? 'Trends' : 'Students'}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{sectionData.overallStats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total Sessions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{sectionData.overallStats.presentToday}</div>
                <div className="text-xs text-muted-foreground">Present Today</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{sectionData.overallStats.totalStudents}</div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${
                  sectionData.overallStats.averageAttendance >= 90 ? 'text-green-600' :
                  sectionData.overallStats.averageAttendance >= 75 ? 'text-blue-600' :
                  sectionData.overallStats.averageAttendance >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {sectionData.overallStats.averageAttendance.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  Avg Attendance
                  {getTrendIcon(sectionData.overallStats.trendDirection)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Attendance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {attendanceDistribution.excellent.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Excellent (90%+)</div>
                  <Progress value={attendanceDistribution.excellent.percentage} className="h-2 mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {attendanceDistribution.good.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Good (75-89%)</div>
                  <Progress value={attendanceDistribution.good.percentage} className="h-2 mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {attendanceDistribution.average.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Average (60-74%)</div>
                  <Progress value={attendanceDistribution.average.percentage} className="h-2 mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {attendanceDistribution.poor.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Poor (&lt;60%)</div>
                  <Progress value={attendanceDistribution.poor.percentage} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Performance */}
          {!sectionId && sectionData.sectionStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Section Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sectionData.sectionStats.map((section) => (
                    <div key={section.sectionId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{section.sectionName}</div>
                        <div className="text-sm text-muted-foreground">
                          {section.totalStudents} students • {section.totalSessions} sessions
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${
                          section.averageAttendance >= 90 ? 'text-green-600' :
                          section.averageAttendance >= 75 ? 'text-blue-600' :
                          section.averageAttendance >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {section.averageAttendance.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(section.lastSessionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Trends Tab */}
      {selectedView === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Trends
              <div className={`flex items-center gap-1 ml-2 ${getTrendColor(trendAnalysis)}`}>
                {getTrendIcon(trendAnalysis)}
                <span className="text-sm capitalize">{trendAnalysis}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectionData.dailyTrends.slice(-14).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {day.totalSessions} sessions
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className={`font-bold ${
                        day.attendancePercentage >= 90 ? 'text-green-600' :
                        day.attendancePercentage >= 75 ? 'text-blue-600' :
                        day.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {day.attendancePercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.presentCount}/{day.presentCount + day.absentCount}
                      </div>
                    </div>
                    <Progress value={day.attendancePercentage} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Tab */}
      {selectedView === 'students' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Top Performers
                <Badge variant="outline" className="ml-2">
                  {sectionData.topPerformers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionData.topPerformers.slice(0, 10).map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-sm">
                          {student.attendancePercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.totalSessions} sessions
                        </div>
                      </div>
                      
                      {onViewStudent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewStudent(student.studentId)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Students Needing Attention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Needs Attention
                <Badge variant="destructive" className="ml-2">
                  {sectionData.lowPerformers.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionData.lowPerformers.slice(0, 10).map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-2 border rounded border-red-200">
                    <div>
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                      {student.consecutiveAbsences > 0 && (
                        <div className="text-xs text-red-600">
                          {student.consecutiveAbsences} consecutive absences
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-bold text-red-600 text-sm">
                          {student.attendancePercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.totalSessions} sessions
                        </div>
                      </div>
                      
                      {onViewStudent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewStudent(student.studentId)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
