// 🎯 CRT Portal Attendance System - Current Session Card
// Created: 2025-07-15 | Phase 2 - Task 2.2

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import Link from 'next/link';
import type { CurrentSession } from '@/lib/types/attendance';

interface CurrentSessionCardProps {
  currentSession: CurrentSession | null;
  onMarkAttendance?: (timeSlotId: string) => void;
  className?: string;
}

export function CurrentSessionCard({ 
  currentSession, 
  onMarkAttendance,
  className = "" 
}: CurrentSessionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionProgress, setSessionProgress] = useState<number>(0);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!currentSession?.hasActiveSession || !currentSession.currentSlot) {
      return;
    }

    const calculateTimeData = () => {
      const now = new Date();
      const [startHour, startMin] = currentSession.currentSlot!.startTime.split(':').map(Number);
      const [endHour, endMin] = currentSession.currentSlot!.endTime.split(':').map(Number);
      
      const sessionStart = new Date();
      sessionStart.setHours(startHour, startMin, 0, 0);
      
      const sessionEnd = new Date();
      sessionEnd.setHours(endHour, endMin, 0, 0);
      
      const totalDuration = sessionEnd.getTime() - sessionStart.getTime();
      const elapsed = now.getTime() - sessionStart.getTime();
      const remaining = sessionEnd.getTime() - now.getTime();
      
      const remainingMinutes = Math.max(0, Math.floor(remaining / (1000 * 60)));
      const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      
      setTimeRemaining(remainingMinutes);
      setSessionProgress(progressPercentage);
    };

    // Calculate immediately
    calculateTimeData();

    // Update every minute
    const interval = setInterval(calculateTimeData, 60000);
    return () => clearInterval(interval);
  }, [currentSession]);

  // Format time remaining display
  const formatTimeRemaining = (minutes: number): string => {
    if (minutes === 0) return 'Session ending';
    if (minutes === 1) return '1 minute left';
    if (minutes < 60) return `${minutes} minutes left`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m left`;
  };

  // Get urgency level based on time remaining
  const getUrgencyLevel = (minutes: number): 'low' | 'medium' | 'high' => {
    if (minutes <= 5) return 'high';
    if (minutes <= 15) return 'medium';
    return 'low';
  };

  if (!currentSession?.hasActiveSession || !currentSession.currentSlot) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Active Session
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            You don't have any active sessions right now.
            {currentSession.nextSlot && (
              <span className="block mt-1">
                Next session starts at {currentSession.nextSlot.startTime}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { currentSlot } = currentSession;
  const urgency = getUrgencyLevel(timeRemaining);

  return (
    <Card className={`border-l-4 ${
      urgency === 'high' 
        ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
        : urgency === 'medium'
        ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
        : 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
    } ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Play className={`h-5 w-5 ${
              urgency === 'high' ? 'text-red-600' : 
              urgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`} />
            Active Session
          </CardTitle>
          <Badge variant={urgency === 'high' ? 'destructive' : 'default'} className={
            urgency === 'medium' ? 'bg-yellow-600' : ''
          }>
            <Timer className="h-3 w-3 mr-1" />
            {formatTimeRemaining(timeRemaining)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{currentSlot.sectionName}</h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {currentSlot.startTime} - {currentSlot.endTime}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {currentSlot.room}
            </div>
          </div>
        </div>

        {/* Session Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Session Progress</span>
            <span>{Math.round(sessionProgress)}%</span>
          </div>
          <Progress 
            value={sessionProgress} 
            className={`h-2 ${
              urgency === 'high' ? '[&>div]:bg-red-500' :
              urgency === 'medium' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
            }`}
          />
        </div>

        {/* Urgency Messages */}
        {urgency === 'high' && (
          <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">
              Session ending soon! Mark attendance now to avoid missing the deadline.
            </span>
          </div>
        )}

        {urgency === 'medium' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Consider marking attendance soon to ensure all students are accounted for.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/faculty/attendance/mark/${currentSlot.id}`} className="flex-1">
            <Button 
              className={`w-full ${
                urgency === 'high' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : urgency === 'medium'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={() => onMarkAttendance?.(currentSlot.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </Link>
          
          <Link href={`/dashboard/faculty/session/${currentSlot.id}/details`}>
            <Button variant="outline" size="default">
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Session Stats (if available) */}
        {currentSlot.sectionId && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground">
                {/* This would be populated from API */}
                --
              </div>
              <div className="text-xs text-muted-foreground">Students Present</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground">
                --
              </div>
              <div className="text-xs text-muted-foreground">Total Students</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
