"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/breadcrumb';
import { Calendar, Clock, MapPin, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import type { TimeSlot } from '@/lib/types/faculty';

// Mock timetable data
const mockTimetable: TimeSlot[] = [
  // Monday
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', section: 'CSE-A', room: 'Room 101' },
  { id: '2', day: 'Monday', startTime: '11:00', endTime: '12:00', subject: 'Algorithms', section: 'CSE-B', room: 'Room 203' },
  { id: '3', day: 'Monday', startTime: '14:00', endTime: '15:00', subject: 'Database Systems', section: 'CSE-A', room: 'Room 105' },
  
  // Tuesday
  { id: '4', day: 'Tuesday', startTime: '10:00', endTime: '11:00', subject: 'Data Structures', section: 'CSE-B', room: 'Room 102' },
  { id: '5', day: 'Tuesday', startTime: '13:00', endTime: '14:00', subject: 'Algorithms', section: 'CSE-A', room: 'Room 201' },
  { id: '6', day: 'Tuesday', startTime: '15:00', endTime: '16:00', subject: 'Database Systems', section: 'CSE-C', room: 'Room 106' },
  
  // Wednesday
  { id: '7', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', section: 'CSE-C', room: 'Room 103' },
  { id: '8', day: 'Wednesday', startTime: '11:00', endTime: '12:00', subject: 'Database Systems', section: 'CSE-B', room: 'Room 107' },
  
  // Thursday
  { id: '9', day: 'Thursday', startTime: '10:00', endTime: '11:00', subject: 'Algorithms', section: 'CSE-C', room: 'Room 204' },
  { id: '10', day: 'Thursday', startTime: '14:00', endTime: '15:00', subject: 'Data Structures', section: 'CSE-A', room: 'Room 101' },
  
  // Friday
  { id: '11', day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'Database Systems', section: 'CSE-A', room: 'Room 108' },
  { id: '12', day: 'Friday', startTime: '13:00', endTime: '14:00', subject: 'Algorithms', section: 'CSE-B', room: 'Room 205' },
];

const timeSlots = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function FacultyTimetablePage() {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    return mockTimetable.find(slot => {
      if (slot.day !== currentDay) return false;
      
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      return currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
    });
  };

  const getSlotForDayAndTime = (day: string, timeSlot: string) => {
    const [startTime] = timeSlot.split('-');
    return mockTimetable.find(slot => 
      slot.day === day && slot.startTime === startTime
    );
  };

  const currentSlot = getCurrentTimeSlot();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Timetable</h1>
          <p className="text-muted-foreground">Your complete weekly schedule</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Week of {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Current Slot Alert */}
      {currentSlot && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="font-semibold text-green-800 dark:text-green-200">
                  Current Class: {currentSlot.subject}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  {currentSlot.section} • {currentSlot.room} • {currentSlot.startTime} - {currentSlot.endTime}
                </div>
              </div>
              <Link href="/faculty/attendance">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Take Attendance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="p-3 font-semibold text-center bg-muted rounded-lg">
                  Time
                </div>
                {days.map(day => (
                  <div key={day} className="p-3 font-semibold text-center bg-muted rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Timetable Rows */}
              <div className="space-y-2">
                {timeSlots.map(timeSlot => (
                  <div key={timeSlot} className="grid grid-cols-6 gap-2">
                    {/* Time Column */}
                    <div className="p-3 text-center text-sm font-medium bg-card border rounded-lg">
                      {timeSlot}
                    </div>
                    
                    {/* Day Columns */}
                    {days.map(day => {
                      const slot = getSlotForDayAndTime(day, timeSlot);
                      const isCurrentSlot = currentSlot?.id === slot?.id;
                      
                      return (
                        <div
                          key={`${day}-${timeSlot}`}
                          className={`p-3 border rounded-lg min-h-[80px] cursor-pointer transition-all ${
                            slot
                              ? isCurrentSlot
                                ? 'bg-green-100 border-green-300 dark:bg-green-950/30 dark:border-green-700'
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-800 dark:hover:bg-blue-950/30'
                              : 'bg-card hover:bg-muted'
                          }`}
                          onClick={() => slot && setSelectedSlot(slot)}
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-sm text-blue-800 dark:text-blue-200">
                                {slot.subject}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-300">
                                {slot.section}
                              </div>
                              <div className="text-xs text-blue-500 dark:text-blue-400 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {slot.room}
                              </div>
                              {isCurrentSlot && (
                                <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                                  Active
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm">
                              Free
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slot Details Modal/Card */}
      {selectedSlot && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Class Details</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSlot(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Subject</div>
                  <div className="font-semibold">{selectedSlot.subject}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Section</div>
                  <div className="font-semibold">{selectedSlot.section}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-semibold">{selectedSlot.startTime} - {selectedSlot.endTime}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Room</div>
                  <div className="font-semibold">{selectedSlot.room}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Link href="/faculty/attendance">
                <Button size="sm">
                  Take Attendance
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                View Section Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-green-300 rounded"></div>
              <span className="text-sm">Current Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border-blue-200 rounded"></div>
              <span className="text-sm">Scheduled Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-card border rounded"></div>
              <span className="text-sm">Free Period</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
