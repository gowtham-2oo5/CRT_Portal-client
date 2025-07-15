// 🎯 CRT Portal Attendance System - Session Timer
// Created: 2025-07-15 | Phase 2 - Task 2.2

'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, 
  Play, 
  Pause, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface SessionTimerProps {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive?: boolean;
  onTimeUpdate?: (timeData: {
    remaining: number;
    elapsed: number;
    progress: number;
    isOvertime: boolean;
  }) => void;
  className?: string;
}

export function SessionTimer({ 
  startTime, 
  endTime, 
  isActive = true,
  onTimeUpdate,
  className = "" 
}: SessionTimerProps) {
  const [timeData, setTimeData] = useState({
    remaining: 0,
    elapsed: 0,
    progress: 0,
    isOvertime: false,
    totalDuration: 0
  });

  useEffect(() => {
    if (!isActive) return;

    const calculateTimeData = () => {
      const now = new Date();
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const sessionStart = new Date();
      sessionStart.setHours(startHour, startMin, 0, 0);
      
      const sessionEnd = new Date();
      sessionEnd.setHours(endHour, endMin, 0, 0);
      
      const totalDuration = sessionEnd.getTime() - sessionStart.getTime();
      const elapsed = now.getTime() - sessionStart.getTime();
      const remaining = sessionEnd.getTime() - now.getTime();
      
      const isOvertime = remaining < 0;
      const remainingMinutes = Math.floor(Math.abs(remaining) / (1000 * 60));
      const elapsedMinutes = Math.floor(elapsed / (1000 * 60));
      const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      
      const newTimeData = {
        remaining: remainingMinutes,
        elapsed: elapsedMinutes,
        progress: progressPercentage,
        isOvertime,
        totalDuration: Math.floor(totalDuration / (1000 * 60))
      };
      
      setTimeData(newTimeData);
      onTimeUpdate?.(newTimeData);
    };

    // Calculate immediately
    calculateTimeData();

    // Update every second for real-time display
    const interval = setInterval(calculateTimeData, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, isActive, onTimeUpdate]);

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getUrgencyLevel = (): 'normal' | 'warning' | 'critical' | 'overtime' => {
    if (timeData.isOvertime) return 'overtime';
    if (timeData.remaining <= 2) return 'critical';
    if (timeData.remaining <= 5) return 'warning';
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  const getTimerColor = () => {
    switch (urgency) {
      case 'overtime': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/10';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/10';
    }
  };

  const getProgressColor = () => {
    switch (urgency) {
      case 'overtime': return '[&>div]:bg-red-500';
      case 'critical': return '[&>div]:bg-red-500';
      case 'warning': return '[&>div]:bg-yellow-500';
      default: return '[&>div]:bg-green-500';
    }
  };

  if (!isActive) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Pause className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Session not active</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Timer Display */}
      <div className={`flex items-center justify-between p-4 rounded-lg ${getTimerColor()}`}>
        <div className="flex items-center gap-3">
          {urgency === 'overtime' ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Timer className="h-5 w-5" />
          )}
          
          <div>
            <div className="font-bold text-lg">
              {timeData.isOvertime ? 'OVERTIME' : formatTime(timeData.remaining)}
            </div>
            <div className="text-xs opacity-75">
              {timeData.isOvertime 
                ? `${formatTime(timeData.remaining)} over` 
                : 'remaining'
              }
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold">
            {startTime} - {endTime}
          </div>
          <div className="text-xs opacity-75">
            {formatTime(timeData.elapsed)} elapsed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Session Progress</span>
          <span>{Math.round(timeData.progress)}%</span>
        </div>
        <Progress 
          value={timeData.isOvertime ? 100 : timeData.progress} 
          className={`h-2 ${getProgressColor()}`}
        />
        {timeData.isOvertime && (
          <div className="text-xs text-red-600 text-center">
            Session has exceeded scheduled time
          </div>
        )}
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold">{formatTime(timeData.totalDuration)}</div>
          <div className="text-xs text-muted-foreground">Total Duration</div>
        </div>
        <div>
          <div className="font-semibold">{formatTime(timeData.elapsed)}</div>
          <div className="text-xs text-muted-foreground">Elapsed</div>
        </div>
        <div>
          <div className="font-semibold">
            {timeData.isOvertime ? '+' : ''}{formatTime(timeData.remaining)}
          </div>
          <div className="text-xs text-muted-foreground">
            {timeData.isOvertime ? 'Overtime' : 'Remaining'}
          </div>
        </div>
      </div>

      {/* Urgency Messages */}
      {urgency === 'critical' && !timeData.isOvertime && (
        <div className="text-center text-sm text-red-600 font-medium">
          ⚠️ Session ending in {timeData.remaining} minute{timeData.remaining !== 1 ? 's' : ''}!
        </div>
      )}

      {urgency === 'warning' && (
        <div className="text-center text-sm text-yellow-600 font-medium">
          🕐 {timeData.remaining} minute{timeData.remaining !== 1 ? 's' : ''} remaining
        </div>
      )}

      {timeData.isOvertime && (
        <div className="text-center text-sm text-red-600 font-medium animate-pulse">
          🚨 Session is running overtime - consider wrapping up
        </div>
      )}
    </div>
  );
}
