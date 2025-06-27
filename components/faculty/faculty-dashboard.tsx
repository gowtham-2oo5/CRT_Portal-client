'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Check,
  FileBarChart
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-guard';
import type { FacultyDashboardData, TimeSlot } from '@/lib/types/faculty';

// Mock data - replace with actual API calls
const mockFacultyData: FacultyDashboardData = {
  profile: {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@klu.ac.in',
    department: 'Computer Science & Engineering',
    employeeId: 'FAC001',
    subjects: ['Data Structures', 'Algorithms', 'Database Systems']
  },
  currentSlot: {
    id: '1',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subject: 'Data Structures',
    section: 'CSE-A',
    room: 'Room 101',
    isActive: true
  },
  nextSlot: {
    id: '2',
    day: 'Monday',
    startTime: '11:00',
    endTime: '12:00',
    subject: 'Algorithms',
    section: 'CSE-B',
    room: 'Room 203'
  },
  todaySchedule: [
    {
      id: '1',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Data Structures',
      section: 'CSE-A',
      room: 'Room 101',
      isActive: true
    },
    {
      id: '2',
      day: 'Monday',
      startTime: '11:00',
      endTime: '12:00',
      subject: 'Algorithms',
      section: 'CSE-B',
      room: 'Room 203'
    },
    {
      id: '3',
      day: 'Monday',
      startTime: '14:00',
      endTime: '15:00',
      subject: 'Database Systems',
      section: 'CSE-A',
      room: 'Room 105'
    }
  ],
  weeklyTimetable: [],
  assignedSections: [
    {
      id: '1',
      name: 'CSE-A',
      subject: 'Data Structures',
      semester: 3,
      totalStudents: 45,
      students: []
    },
    {
      id: '2',
      name: 'CSE-B',
      subject: 'Algorithms',
      semester: 4,
      totalStudents: 42,
      students: []
    }
  ],
  todayAttendanceCount: 2,
  weeklyAttendanceCount: 8
};

export function FacultyDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<FacultyDashboardData>(mockFacultyData);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    return dashboardData.todaySchedule.find(slot => {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      return currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
    });
  };

  const getNextTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    return dashboardData.todaySchedule.find(slot => {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      
      return startTime > currentTimeMinutes;
    });
  };

  const currentSlot = getCurrentTimeSlot();
  const nextSlot = getNextTimeSlot();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || 'Faculty'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {dashboardData.profile.department}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Today</div>
            <div className="text-lg font-semibold">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current/Next Slot Alert */}
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

      {!currentSlot && nextSlot && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  Next Class: {nextSlot.subject}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  {nextSlot.section} • {nextSlot.room} • {nextSlot.startTime} - {nextSlot.endTime}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.todaySchedule.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.todaySchedule.filter(s => getCurrentTimeSlot()?.id === s.id).length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.assignedSections.length}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.assignedSections.reduce((acc, section) => acc + section.totalStudents, 0)} total students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.todayAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">
              Sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.weeklyAttendanceCount}</div>
            <p className="text-xs text-muted-foreground">
              Sessions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.todaySchedule.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  currentSlot?.id === slot.id
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{slot.startTime}</div>
                    <div className="text-xs text-muted-foreground">{slot.endTime}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{slot.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      {slot.section} • {slot.room}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentSlot?.id === slot.id && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/faculty/attendance">
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <Check className="h-6 w-6" />
                <span>Take Attendance</span>
              </Button>
            </Link>
            <Link href="/faculty/reports">
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <FileBarChart className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </Link>
            <Link href="/faculty/timetable">
              <Button className="h-20 flex flex-col space-y-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Full Timetable</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
