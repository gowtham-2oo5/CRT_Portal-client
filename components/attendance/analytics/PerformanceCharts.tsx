// 🎯 CRT Portal Attendance System - Performance Charts
// Created: 2025-07-15 | Phase 4 - Task 4.2

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  AlertTriangle,
  Calendar,
  Activity
} from 'lucide-react';
import type { AttendanceAnalytics } from '@/lib/types/attendance';

interface PerformanceChartsProps {
  analytics: AttendanceAnalytics;
  chartType?: 'distribution' | 'comparison' | 'performance';
  onChartTypeChange?: (type: 'distribution' | 'comparison' | 'performance') => void;
  className?: string;
}

export function PerformanceCharts({
  analytics,
  chartType = 'distribution',
  onChartTypeChange,
  className = ""
}: PerformanceChartsProps) {
  const [selectedView, setSelectedView] = useState<'students' | 'sections'>('students');

  // Calculate student performance distribution
  const studentDistribution = useMemo(() => {
    const allStudents = [...analytics.topPerformers, ...analytics.lowPerformers];
    
    const excellent = allStudents.filter(s => s.attendancePercentage >= 90);
    const good = allStudents.filter(s => s.attendancePercentage >= 75 && s.attendancePercentage < 90);
    const average = allStudents.filter(s => s.attendancePercentage >= 60 && s.attendancePercentage < 75);
    const poor = allStudents.filter(s => s.attendancePercentage < 60);
    
    const total = allStudents.length;
    
    return {
      excellent: { count: excellent.length, percentage: (excellent.length / total) * 100, students: excellent },
      good: { count: good.length, percentage: (good.length / total) * 100, students: good },
      average: { count: average.length, percentage: (average.length / total) * 100, students: average },
      poor: { count: poor.length, percentage: (poor.length / total) * 100, students: poor },
      total
    };
  }, [analytics.topPerformers, analytics.lowPerformers]);

  // Calculate section performance comparison
  const sectionComparison = useMemo(() => {
    return analytics.sectionStats.map(section => ({
      ...section,
      performanceLevel: section.averageAttendance >= 90 ? 'excellent' :
                       section.averageAttendance >= 75 ? 'good' :
                       section.averageAttendance >= 60 ? 'average' : 'poor'
    })).sort((a, b) => b.averageAttendance - a.averageAttendance);
  }, [analytics.sectionStats]);

  // Calculate performance trends
  const performanceTrends = useMemo(() => {
    const recentTrends = analytics.dailyTrends.slice(-14); // Last 2 weeks
    
    return recentTrends.map((day, index) => {
      const previousDay = index > 0 ? recentTrends[index - 1] : null;
      const change = previousDay ? day.attendancePercentage - previousDay.attendancePercentage : 0;
      
      return {
        ...day,
        change,
        trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable'
      };
    });
  }, [analytics.dailyTrends]);

  // Get performance color
  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get performance background color
  const getPerformanceBgColor = (level: string): string => {
    switch (level) {
      case 'excellent': return 'bg-green-100 dark:bg-green-900/20 border-green-200';
      case 'good': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200';
      case 'average': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200';
      case 'poor': return 'bg-red-100 dark:bg-red-900/20 border-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900/20 border-gray-200';
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
              Performance Analytics
            </CardTitle>

            {/* Chart Type Selector */}
            {onChartTypeChange && (
              <div className="flex gap-2">
                {(['distribution', 'comparison', 'performance'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onChartTypeChange(type)}
                  >
                    {type === 'distribution' ? 'Distribution' : 
                     type === 'comparison' ? 'Comparison' : 'Performance'}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Distribution Chart */}
      {chartType === 'distribution' && (
        <>
          {/* Performance Distribution Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {studentDistribution.excellent.count}
                </div>
                <div className="text-xs text-muted-foreground">Excellent (90%+)</div>
                <div className="text-xs text-green-600 font-medium">
                  {studentDistribution.excellent.percentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {studentDistribution.good.count}
                </div>
                <div className="text-xs text-muted-foreground">Good (75-89%)</div>
                <div className="text-xs text-blue-600 font-medium">
                  {studentDistribution.good.percentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">
                  {studentDistribution.average.count}
                </div>
                <div className="text-xs text-muted-foreground">Average (60-74%)</div>
                <div className="text-xs text-yellow-600 font-medium">
                  {studentDistribution.average.percentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {studentDistribution.poor.count}
                </div>
                <div className="text-xs text-muted-foreground">Poor (&lt;60%)</div>
                <div className="text-xs text-red-600 font-medium">
                  {studentDistribution.poor.percentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Performance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual Progress Bars */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Excellent (90%+)</span>
                    <span className="text-sm text-muted-foreground">
                      {studentDistribution.excellent.count} students
                    </span>
                  </div>
                  <Progress value={studentDistribution.excellent.percentage} className="h-3 [&>div]:bg-green-500" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Good (75-89%)</span>
                    <span className="text-sm text-muted-foreground">
                      {studentDistribution.good.count} students
                    </span>
                  </div>
                  <Progress value={studentDistribution.good.percentage} className="h-3 [&>div]:bg-blue-500" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">Average (60-74%)</span>
                    <span className="text-sm text-muted-foreground">
                      {studentDistribution.average.count} students
                    </span>
                  </div>
                  <Progress value={studentDistribution.average.percentage} className="h-3 [&>div]:bg-yellow-500" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Poor (&lt;60%)</span>
                    <span className="text-sm text-muted-foreground">
                      {studentDistribution.poor.count} students
                    </span>
                  </div>
                  <Progress value={studentDistribution.poor.percentage} className="h-3 [&>div]:bg-red-500" />
                </div>

                {/* Summary Stats */}
                <div className="pt-4 border-t text-center">
                  <div className="text-lg font-bold">
                    {studentDistribution.total} Total Students
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((studentDistribution.excellent.count + studentDistribution.good.count) / studentDistribution.total * 100).toFixed(1)}% 
                    performing above 75%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Section Comparison Chart */}
      {chartType === 'comparison' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Section Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectionComparison.map((section, index) => (
                <div 
                  key={section.sectionId} 
                  className={`p-4 rounded-lg border ${getPerformanceBgColor(section.performanceLevel)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{section.sectionName}</div>
                        <div className="text-sm text-muted-foreground">
                          {section.totalStudents} students • {section.totalSessions} sessions
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xl font-bold ${getPerformanceColor(section.averageAttendance)}`}>
                        {section.averageAttendance.toFixed(1)}%
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {section.performanceLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress 
                      value={section.averageAttendance} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Trends Chart */}
      {chartType === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Trends (Last 2 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceTrends.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.totalSessions} session{day.totalSessions !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-bold ${getPerformanceColor(day.attendancePercentage)}`}>
                        {day.attendancePercentage.toFixed(1)}%
                      </div>
                      {day.change !== 0 && (
                        <div className={`text-xs flex items-center gap-1 ${
                          day.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${day.change < 0 ? 'rotate-180' : ''}`} />
                          {Math.abs(day.change).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <Progress 
                      value={day.attendancePercentage} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Strengths
              </h4>
              
              {studentDistribution.excellent.percentage > 25 && (
                <div className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  Strong performance: {studentDistribution.excellent.percentage.toFixed(1)}% of students have excellent attendance
                </div>
              )}
              
              {analytics.overallStats.trendDirection === 'up' && (
                <div className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  Positive trend: Attendance is improving over time
                </div>
              )}
              
              {analytics.overallStats.averageAttendance > 80 && (
                <div className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  Above average: Overall attendance ({analytics.overallStats.averageAttendance.toFixed(1)}%) exceeds typical standards
                </div>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Areas for Improvement
              </h4>
              
              {studentDistribution.poor.percentage > 10 && (
                <div className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  Attention needed: {studentDistribution.poor.percentage.toFixed(1)}% of students have poor attendance
                </div>
              )}
              
              {analytics.overallStats.trendDirection === 'down' && (
                <div className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  Declining trend: Attendance is decreasing and needs intervention
                </div>
              )}
              
              {analytics.lowPerformers.length > analytics.topPerformers.length && (
                <div className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  Balance concern: More students need support than are excelling
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
