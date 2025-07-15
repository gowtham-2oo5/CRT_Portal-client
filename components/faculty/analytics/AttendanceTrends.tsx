// 🎯 CRT Portal Attendance System - Attendance Trends
// Created: 2025-07-15 | Phase 4 - Task 4.2

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Minus
} from 'lucide-react';
import type { AttendanceAnalytics } from '@/lib/types/attendance';

interface AttendanceTrendsProps {
  analytics: AttendanceAnalytics;
  timePeriod?: 'week' | 'month' | 'semester';
  onPeriodChange?: (period: 'week' | 'month' | 'semester') => void;
  className?: string;
}

export function AttendanceTrends({
  analytics,
  timePeriod = 'month',
  onPeriodChange,
  className = ""
}: AttendanceTrendsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'percentage' | 'count'>('percentage');

  // Process daily trends data
  const trendData = useMemo(() => {
    const trends = analytics.dailyTrends.slice(-30); // Last 30 days
    
    // Calculate moving average
    const movingAverage = trends.map((day, index) => {
      const windowSize = Math.min(7, index + 1); // 7-day moving average
      const window = trends.slice(Math.max(0, index - windowSize + 1), index + 1);
      const average = window.reduce((sum, d) => sum + d.attendancePercentage, 0) / window.length;
      
      return {
        ...day,
        movingAverage: Math.round(average * 100) / 100
      };
    });

    return movingAverage;
  }, [analytics.dailyTrends]);

  // Calculate trend analysis
  const trendAnalysis = useMemo(() => {
    if (trendData.length < 7) return { direction: 'stable', change: 0, confidence: 'low' };

    const recent = trendData.slice(-7);
    const previous = trendData.slice(-14, -7);

    if (recent.length === 0 || previous.length === 0) {
      return { direction: 'stable', change: 0, confidence: 'low' };
    }

    const recentAvg = recent.reduce((sum, d) => sum + d.attendancePercentage, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.attendancePercentage, 0) / previous.length;
    
    const change = recentAvg - previousAvg;
    const direction = change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable';
    const confidence = Math.abs(change) > 5 ? 'high' : Math.abs(change) > 2 ? 'medium' : 'low';

    return { direction, change: Math.round(change * 100) / 100, confidence };
  }, [trendData]);

  // Get trend color and icon
  const getTrendDisplay = (direction: string) => {
    switch (direction) {
      case 'improving':
        return {
          icon: <TrendingUp className="h-4 w-4 text-green-600" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200'
        };
      case 'declining':
        return {
          icon: <TrendingDown className="h-4 w-4 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Minus className="h-4 w-4 text-gray-600" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200'
        };
    }
  };

  const trendDisplay = getTrendDisplay(trendAnalysis.direction);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const totalDays = trendData.length;
    const excellentDays = trendData.filter(d => d.attendancePercentage >= 90).length;
    const goodDays = trendData.filter(d => d.attendancePercentage >= 75 && d.attendancePercentage < 90).length;
    const poorDays = trendData.filter(d => d.attendancePercentage < 60).length;
    
    const averageAttendance = totalDays > 0 
      ? trendData.reduce((sum, d) => sum + d.attendancePercentage, 0) / totalDays 
      : 0;

    const bestDay = trendData.reduce((best, current) => 
      current.attendancePercentage > best.attendancePercentage ? current : best, 
      trendData[0] || { attendancePercentage: 0, date: '' }
    );

    const worstDay = trendData.reduce((worst, current) => 
      current.attendancePercentage < worst.attendancePercentage ? current : worst, 
      trendData[0] || { attendancePercentage: 100, date: '' }
    );

    return {
      totalDays,
      excellentDays,
      goodDays,
      poorDays,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      bestDay,
      worstDay
    };
  }, [trendData]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Attendance Trends
              <Badge variant="outline" className="ml-2">
                {trendData.length} days
              </Badge>
            </CardTitle>

            {/* Period Selector */}
            {onPeriodChange && (
              <div className="flex gap-2">
                {(['week', 'month', 'semester'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timePeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPeriodChange(period)}
                  >
                    {period === 'week' ? 'Week' : 
                     period === 'month' ? 'Month' : 'Semester'}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Trend */}
        <Card className={`${trendDisplay.borderColor} ${trendDisplay.bgColor}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {trendDisplay.icon}
              <span className={`font-semibold capitalize ${trendDisplay.color}`}>
                {trendAnalysis.direction}
              </span>
            </div>
            <div className={`text-2xl font-bold ${trendDisplay.color}`}>
              {trendAnalysis.change > 0 ? '+' : ''}{trendAnalysis.change}%
            </div>
            <div className="text-sm text-muted-foreground">
              vs previous period
            </div>
            <Badge variant="outline" className="mt-2">
              {trendAnalysis.confidence} confidence
            </Badge>
          </CardContent>
        </Card>

        {/* Average Performance */}
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className={`text-2xl font-bold ${
              performanceMetrics.averageAttendance >= 90 ? 'text-green-600' :
              performanceMetrics.averageAttendance >= 75 ? 'text-blue-600' :
              performanceMetrics.averageAttendance >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {performanceMetrics.averageAttendance.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              Average Attendance
            </div>
            <Progress 
              value={performanceMetrics.averageAttendance} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Excellent (90%+)</span>
                <span className="font-semibold">{performanceMetrics.excellentDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Good (75-89%)</span>
                <span className="font-semibold">{performanceMetrics.goodDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Poor (&lt;60%)</span>
                <span className="font-semibold">{performanceMetrics.poorDays} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Attendance Trends
            </CardTitle>

            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'percentage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('percentage')}
              >
                Percentage
              </Button>
              <Button
                variant={selectedMetric === 'count' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('count')}
              >
                Count
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trendData.map((day, index) => {
              const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
              const value = selectedMetric === 'percentage' ? day.attendancePercentage : day.presentCount;
              const maxValue = selectedMetric === 'percentage' ? 100 : Math.max(...trendData.map(d => d.presentCount));
              
              return (
                <div key={day.date} className={`flex items-center gap-4 p-3 rounded-lg ${
                  isWeekend ? 'bg-muted/30' : 'bg-background'
                } border`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {day.totalSessions > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {day.totalSessions} session{day.totalSessions !== 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        No sessions
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    {day.totalSessions > 0 && (
                      <>
                        <div className="text-right min-w-0">
                          <div className={`font-bold ${
                            day.attendancePercentage >= 90 ? 'text-green-600' :
                            day.attendancePercentage >= 75 ? 'text-blue-600' :
                            day.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedMetric === 'percentage' 
                              ? `${day.attendancePercentage.toFixed(1)}%`
                              : `${day.presentCount}/${day.presentCount + day.absentCount}`
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            MA: {day.movingAverage.toFixed(1)}%
                          </div>
                        </div>
                        
                        <Progress 
                          value={(value / maxValue) * 100} 
                          className="w-20 h-2"
                        />

                        {day.attendancePercentage >= 90 && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {day.attendancePercentage < 60 && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Best and Worst Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Best Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.bestDay.attendancePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(performanceMetrics.bestDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              Needs Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {performanceMetrics.worstDay.attendancePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(performanceMetrics.worstDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
