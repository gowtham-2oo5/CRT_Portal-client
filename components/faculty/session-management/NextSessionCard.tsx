// 🎯 CRT Portal Attendance System - Next Session Card
// Created: 2025-07-15 | Phase 2 - Task 2.2

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Bell,
  BookOpen,
  ArrowRight,
  Timer
} from 'lucide-react';
import Link from 'next/link';
import type { CurrentSession } from '@/lib/types/attendance';

interface NextSessionCardProps {
  currentSession: CurrentSession | null;
  onPrepareSession?: (timeSlotId: string) => void;
  className?: string;
}

export function NextSessionCard({ 
  currentSession, 
  onPrepareSession,
  className = "" 
}: NextSessionCardProps) {
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [isApproaching, setIsApproaching] = useState<boolean>(false);

  // Calculate time until next session starts
  useEffect(() => {
    if (!currentSession?.nextSlot) {
      return;
    }

    const calculateTimeUntilStart = () => {
      const now = new Date();
      const [hour, min] = currentSession.nextSlot!.startTime.split(':').map(Number);
      
      const sessionStart = new Date();
      sessionStart.setHours(hour, min, 0, 0);
      
      // If the time has passed today, assume it's tomorrow
      if (sessionStart <= now) {
        sessionStart.setDate(sessionStart.getDate() + 1);
      }
      
      const diffMs = sessionStart.getTime() - now.getTime();
      const minutesUntil = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      
      setTimeUntilStart(minutesUntil);
      setIsApproaching(minutesUntil <= 15 && minutesUntil > 0);
    };

    calculateTimeUntilStart();
    const interval = setInterval(calculateTimeUntilStart, 60000);
    return () => clearInterval(interval);
  }, [currentSession?.nextSlot]);

  const formatTimeUntilStart = (minutes: number): string => {
    if (minutes === 0) return 'Starting now';
    if (minutes === 1) return 'Starts in 1 minute';
    if (minutes < 60) return `Starts in ${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 1 && mins === 0) return 'Starts in 1 hour';
    if (mins === 0) return `Starts in ${hours} hours`;
    return `Starts in ${hours}h ${mins}m`;
  };

  if (!currentSession?.nextSlot) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Upcoming Sessions
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            You don't have any more sessions scheduled for today.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { nextSlot } = currentSession;
  const isUrgent = timeUntilStart <= 5;
  const isPreparing = timeUntilStart <= 15;

  return (
    <Card className={`border-l-4 ${
      isUrgent 
        ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10' 
        : isPreparing
        ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
        : 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10'
    } ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className={`h-5 w-5 ${
              isUrgent ? 'text-orange-600' : 
              isPreparing ? 'text-blue-600' : 'text-gray-600'
            }`} />
            Next Session
          </CardTitle>
          <Badge variant={isUrgent ? 'destructive' : 'secondary'} className={
            isPreparing && !isUrgent ? 'bg-blue-600 text-white' : ''
          }>
            <Timer className="h-3 w-3 mr-1" />
            {formatTimeUntilStart(timeUntilStart)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{nextSlot.sectionName}</h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {nextSlot.startTime} - {nextSlot.endTime}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {nextSlot.room}
            </div>
          </div>
        </div>

        {isApproaching && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isUrgent 
              ? 'bg-orange-100 dark:bg-orange-900/20' 
              : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            <Bell className={`h-4 w-4 ${
              isUrgent ? 'text-orange-600' : 'text-blue-600'
            }`} />
            <span className={`text-sm ${
              isUrgent 
                ? 'text-orange-800 dark:text-orange-200' 
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {isUrgent ? 'Session starting very soon!' : 'Time to prepare for your session'}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`/dashboard/faculty/session/${nextSlot.id}/prepare`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onPrepareSession?.(nextSlot.id)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Prepare Session
            </Button>
          </Link>
          
          <Link href={`/dashboard/faculty/session/${nextSlot.id}/students`}>
            <Button variant="outline" size="default">
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
