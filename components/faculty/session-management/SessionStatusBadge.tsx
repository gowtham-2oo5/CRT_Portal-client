// 🎯 CRT Portal Attendance System - Session Status Badge
// Created: 2025-07-15 | Phase 2 - Task 2.2

'use client';

import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  XCircle
} from 'lucide-react';
import type { SessionStatus } from '@/lib/types/attendance';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  timeInfo?: {
    startTime?: string;
    endTime?: string;
    timeRemaining?: number;
    timeUntilStart?: number;
  };
  hasAttendance?: boolean;
  className?: string;
}

export function SessionStatusBadge({ 
  status, 
  timeInfo,
  hasAttendance = false,
  className = "" 
}: SessionStatusBadgeProps) {
  
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          icon: Play,
          text: timeInfo?.timeRemaining 
            ? `Live • ${timeInfo.timeRemaining}min left`
            : 'Live Session',
          pulse: true
        };
        
      case 'upcoming':
        const minutesUntil = timeInfo?.timeUntilStart || 0;
        const isApproaching = minutesUntil <= 15;
        
        return {
          variant: 'secondary' as const,
          className: isApproaching 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-600 text-white hover:bg-gray-700',
          icon: Clock,
          text: minutesUntil > 0 
            ? `Starts in ${minutesUntil}min`
            : 'Starting Soon',
          pulse: isApproaching
        };
        
      case 'completed':
        return {
          variant: 'outline' as const,
          className: hasAttendance 
            ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20'
            : 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
          icon: hasAttendance ? CheckCircle : AlertCircle,
          text: hasAttendance ? 'Completed' : 'Pending Attendance',
          pulse: !hasAttendance
        };
        
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-600 text-white hover:bg-red-700',
          icon: XCircle,
          text: 'Cancelled',
          pulse: false
        };
        
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-500 text-white',
          icon: Calendar,
          text: 'Unknown',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`
        ${config.className} 
        ${config.pulse ? 'animate-pulse' : ''} 
        ${className}
        flex items-center gap-1 px-2 py-1
      `}
    >
      <IconComponent className="h-3 w-3" />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
}

// Additional specialized status badges

interface AttendanceStatusBadgeProps {
  hasAttendance: boolean;
  attendancePercentage?: number;
  className?: string;
}

export function AttendanceStatusBadge({ 
  hasAttendance, 
  attendancePercentage,
  className = "" 
}: AttendanceStatusBadgeProps) {
  if (!hasAttendance) {
    return (
      <Badge variant="outline" className={`border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20 ${className}`}>
        <XCircle className="h-3 w-3 mr-1" />
        Not Marked
      </Badge>
    );
  }

  const percentage = attendancePercentage || 0;
  const getAttendanceColor = () => {
    if (percentage >= 90) return 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 75) return 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20';
    if (percentage >= 60) return 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <Badge variant="outline" className={`${getAttendanceColor()} ${className}`}>
      <CheckCircle className="h-3 w-3 mr-1" />
      {percentage.toFixed(1)}%
    </Badge>
  );
}

interface TimeRemainingBadgeProps {
  minutes: number;
  isOvertime?: boolean;
  className?: string;
}

export function TimeRemainingBadge({ 
  minutes, 
  isOvertime = false,
  className = "" 
}: TimeRemainingBadgeProps) {
  const formatTime = (mins: number): string => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getUrgencyStyle = () => {
    if (isOvertime) return 'bg-red-600 text-white animate-pulse';
    if (minutes <= 2) return 'bg-red-500 text-white animate-pulse';
    if (minutes <= 5) return 'bg-yellow-500 text-white';
    if (minutes <= 15) return 'bg-blue-500 text-white';
    return 'bg-green-500 text-white';
  };

  return (
    <Badge className={`${getUrgencyStyle()} ${className}`}>
      <Timer className="h-3 w-3 mr-1" />
      {isOvertime ? `+${formatTime(minutes)}` : formatTime(minutes)}
    </Badge>
  );
}

interface SessionTypeBadgeProps {
  isBreak: boolean;
  className?: string;
}

export function SessionTypeBadge({ 
  isBreak, 
  className = "" 
}: SessionTypeBadgeProps) {
  if (isBreak) {
    return (
      <Badge variant="outline" className={`border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-900/20 ${className}`}>
        ☕ Break
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/20 ${className}`}>
      📚 Class
    </Badge>
  );
}
