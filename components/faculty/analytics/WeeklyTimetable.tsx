// 🎯 CRT Portal Attendance System - Weekly Timetable
// Created: 2025-07-15 | Phase 4 - Task 4.2

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import type { TimeSlot } from '@/lib/types/section-schedule';

interface WeeklyTimetableProps {
  timeSlots: TimeSlot[];
  onViewSession?: (timeSlotId: string) => void;
  onMarkAttendance?: (timeSlotId: string) => void;
  onExport?: (format: 'pdf' | 'csv') => void;
  className?: string;
}

export function WeeklyTimetable({
  timeSlots,
  onViewSession,
  onMarkAttendance,
  onExport,
  className = ""
}: WeeklyTimetableProps) {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get week boundaries
  const getWeekBoundaries = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  // Get current week's time slots
  const weekTimeSlots = useMemo(() => {
    const { start, end } = getWeekBoundaries(selectedWeek);
    
    // For demo purposes, we'll organize by day of week
    // In real implementation, you'd filter by actual dates
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const organizedSlots = daysOfWeek.map((day, dayIndex) => {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + dayIndex);
      
      // Filter slots for this day (in real app, you'd match by actual date)
      const daySlots = timeSlots.filter(slot => {
        // For demo, we'll distribute slots across weekdays
        const slotHash = parseInt(slot.id.toString()) % 5; // 0-4 for Mon-Fri
        return dayIndex >= 1 && dayIndex <= 5 && slotHash === (dayIndex - 1);
      });
      
      return {
        day,
        date: dayDate,
        slots: daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    });
    
    return organizedSlots;
  }, [timeSlots, selectedWeek]);

  // Get time slots organized by time for grid view
  const timeGrid = useMemo(() => {
    const allTimes = new Set<string>();
    weekTimeSlots.forEach(day => {
      day.slots.forEach(slot => {
        allTimes.add(slot.startTime);
      });
    });
    
    const sortedTimes = Array.from(allTimes).sort();
    
    return sortedTimes.map(time => ({
      time,
      slots: weekTimeSlots.map(day => ({
        day: day.day,
        slot: day.slots.find(slot => slot.startTime === time)
      }))
    }));
  }, [weekTimeSlots]);

  // Get slot status
  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.isBreak) return 'break';
    if (slot.hasAttendance) return 'completed';
    
    const now = new Date();
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    
    const slotStart = new Date();
    slotStart.setHours(startHour, startMin, 0, 0);
    
    const slotEnd = new Date();
    slotEnd.setHours(endHour, endMin, 0, 0);
    
    if (now >= slotStart && now <= slotEnd) return 'active';
    if (now > slotEnd) return 'past';
    return 'upcoming';
  };

  // Get slot styling
  const getSlotStyling = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200';
      case 'past':
        return 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200';
      case 'break':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 text-gray-800 dark:text-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case 'past':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'break':
        return <div className="text-xs">☕</div>;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const { start: weekStart, end: weekEnd } = getWeekBoundaries(selectedWeek);
  const isCurrentWeek = new Date() >= weekStart && new Date() <= weekEnd;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Timetable
              {isCurrentWeek && (
                <Badge variant="default" className="ml-2">
                  Current Week
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Export Actions */}
              {onExport && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>

            <div className="text-center">
              <div className="font-semibold">
                {weekStart.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })} - {weekEnd.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                Week {Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Time</th>
                    {weekTimeSlots.slice(1, 6).map((day) => ( // Mon-Fri only
                      <th key={day.day} className="p-3 text-center font-medium min-w-32">
                        <div>{day.day}</div>
                        <div className="text-xs text-muted-foreground font-normal">
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeGrid.map((timeRow) => (
                    <tr key={timeRow.time} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono font-medium">
                        {timeRow.time}
                      </td>
                      {timeRow.slots.slice(1, 6).map((daySlot, index) => ( // Mon-Fri only
                        <td key={`${timeRow.time}-${index}`} className="p-2">
                          {daySlot.slot ? (
                            <div 
                              className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-md ${
                                getSlotStyling(getSlotStatus(daySlot.slot))
                              }`}
                              onClick={() => onViewSession?.(daySlot.slot!.id.toString())}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium truncate">
                                  {daySlot.slot.section?.name || 'Section'}
                                </span>
                                {getStatusIcon(getSlotStatus(daySlot.slot))}
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs opacity-75">
                                <MapPin className="h-2 w-2" />
                                <span className="truncate">
                                  {daySlot.slot.room?.roomString || 'Room'}
                                </span>
                              </div>
                              
                              {daySlot.slot.attendanceSession && (
                                <div className="text-xs font-medium mt-1">
                                  {daySlot.slot.attendanceSession.attendancePercentage.toFixed(0)}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {weekTimeSlots.slice(1, 6).map((day) => ( // Mon-Fri only
            <Card key={day.day}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {day.day}
                  <Badge variant="outline" className="ml-2">
                    {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                  <Badge variant="secondary" className="ml-1">
                    {day.slots.length} session{day.slots.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {day.slots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No sessions scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.slots.map((slot) => {
                      const status = getSlotStatus(slot);
                      
                      return (
                        <div 
                          key={slot.id}
                          className={`p-4 rounded-lg border ${getSlotStyling(status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(status)}
                              
                              <div>
                                <div className="font-semibold">
                                  {slot.isBreak ? 'Break Time' : slot.section?.name}
                                </div>
                                <div className="text-sm opacity-75">
                                  {slot.startTime} - {slot.endTime}
                                  {!slot.isBreak && (
                                    <>
                                      {' • '}
                                      <MapPin className="h-3 w-3 inline mr-1" />
                                      {slot.room?.roomString}
                                      {' • '}
                                      <Users className="h-3 w-3 inline mr-1" />
                                      {slot.section?.strength} students
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {slot.attendanceSession && (
                                <Badge variant="outline">
                                  {slot.attendanceSession.attendancePercentage.toFixed(1)}%
                                </Badge>
                              )}
                              
                              {!slot.isBreak && (
                                <div className="flex gap-1">
                                  {onViewSession && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onViewSession(slot.id.toString())}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {onMarkAttendance && status !== 'completed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => onMarkAttendance(slot.id.toString())}
                                      disabled={status === 'past'}
                                    >
                                      {status === 'active' ? 'Mark Now' : 'Mark Attendance'}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Week Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {weekTimeSlots.reduce((sum, day) => sum + day.slots.filter(s => !s.isBreak).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {weekTimeSlots.reduce((sum, day) => sum + day.slots.filter(s => s.hasAttendance).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {weekTimeSlots.reduce((sum, day) => sum + day.slots.filter(s => getSlotStatus(s) === 'active').length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Active Now</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {weekTimeSlots.reduce((sum, day) => sum + day.slots.filter(s => s.isBreak).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Break Times</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
