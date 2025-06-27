"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/dashboard/breadcrumb';
import { 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import type { TimeSlot, Student, AttendanceRecord } from '@/lib/types/faculty';

// Mock data
const mockCurrentSlot: TimeSlot = {
  id: '1',
  day: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  subject: 'Data Structures',
  section: 'CSE-A',
  room: 'Room 101',
  isActive: true
};

const mockStudents: Student[] = [
  { id: '1', rollNumber: '21CSE001', name: 'Aarav Sharma', email: 'aarav@klu.ac.in', section: 'CSE-A' },
  { id: '2', rollNumber: '21CSE002', name: 'Priya Patel', email: 'priya@klu.ac.in', section: 'CSE-A' },
  { id: '3', rollNumber: '21CSE003', name: 'Arjun Kumar', email: 'arjun@klu.ac.in', section: 'CSE-A' },
  { id: '4', rollNumber: '21CSE004', name: 'Sneha Reddy', email: 'sneha@klu.ac.in', section: 'CSE-A' },
  { id: '5', rollNumber: '21CSE005', name: 'Vikram Singh', email: 'vikram@klu.ac.in', section: 'CSE-A' },
  { id: '6', rollNumber: '21CSE006', name: 'Ananya Gupta', email: 'ananya@klu.ac.in', section: 'CSE-A' },
  { id: '7', rollNumber: '21CSE007', name: 'Rohit Verma', email: 'rohit@klu.ac.in', section: 'CSE-A' },
  { id: '8', rollNumber: '21CSE008', name: 'Kavya Nair', email: 'kavya@klu.ac.in', section: 'CSE-A' },
  { id: '9', rollNumber: '21CSE009', name: 'Aditya Joshi', email: 'aditya@klu.ac.in', section: 'CSE-A' },
  { id: '10', rollNumber: '21CSE010', name: 'Riya Agarwal', email: 'riya@klu.ac.in', section: 'CSE-A' },
];

export default function FacultyAttendancePage() {
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(mockCurrentSlot);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if there's an active slot
  const checkActiveSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    if (mockCurrentSlot) {
      const [startHour, startMinute] = mockCurrentSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = mockCurrentSlot.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      const isActive = currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
      setCurrentSlot(isActive ? mockCurrentSlot : null);
    }
  };

  useEffect(() => {
    checkActiveSlot();
    const interval = setInterval(checkActiveSlot, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleAttendanceToggle = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleMarkAll = (isPresent: boolean) => {
    const newAttendance: Record<string, boolean> = {};
    students.forEach(student => {
      newAttendance[student.id] = isPresent;
    });
    setAttendance(newAttendance);
  };

  const handleSubmitAttendance = async () => {
    if (!currentSlot) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const attendanceRecords: AttendanceRecord[] = students.map(student => ({
        studentId: student.id,
        rollNumber: student.rollNumber,
        name: student.name,
        isPresent: attendance[student.id] || false,
        markedAt: new Date()
      }));

      console.log('Submitting attendance:', {
        slot: currentSlot,
        records: attendanceRecords
      });

      setHasSubmitted(true);
      toast.success('Attendance submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;
  const unmarkedCount = students.length - Object.keys(attendance).length;

  if (!currentSlot) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submit Attendance</h1>
          <p className="text-muted-foreground">Mark student attendance for your classes</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active class session found. Attendance can only be submitted during your scheduled class hours.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Next Scheduled Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Your next class will appear here when it's time to take attendance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance Submitted</h1>
          <p className="text-muted-foreground">Successfully recorded attendance for {currentSlot.subject}</p>
        </div>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Attendance Recorded Successfully
              </h3>
              <div className="space-y-2 text-sm text-green-600 dark:text-green-300">
                <p>{currentSlot.subject} - {currentSlot.section}</p>
                <p>{currentSlot.room} • {currentSlot.startTime} - {currentSlot.endTime}</p>
                <p>Present: {presentCount} | Absent: {absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => setHasSubmitted(false)}>
            Take Another Attendance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Submit Attendance</h1>
        <p className="text-muted-foreground">Mark student attendance for your current class</p>
      </div>

      {/* Current Class Info */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  {currentSlot.subject} - {currentSlot.section}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300 flex items-center space-x-4">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentSlot.startTime} - {currentSlot.endTime}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {currentSlot.room}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Active Session
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{unmarkedCount}</div>
                <div className="text-sm text-muted-foreground">Unmarked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleMarkAll(true)}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Mark All Present</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleMarkAll(false)}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Mark All Absent</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const isPresent = attendance[student.id];
              const isMarked = student.id in attendance;
              
              return (
                <Card 
                  key={student.id}
                  className={`cursor-pointer transition-all ${
                    isMarked
                      ? isPresent
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20'
                        : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20'
                      : 'hover:border-primary'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                      </div>
                      {isMarked && (
                        <div className="flex items-center">
                          {isPresent ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant={isPresent === true ? "default" : "outline"}
                        onClick={() => handleAttendanceToggle(student.id, true)}
                        className="flex-1"
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={isPresent === false ? "destructive" : "outline"}
                        onClick={() => handleAttendanceToggle(student.id, false)}
                        className="flex-1"
                      >
                        Absent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmitAttendance}
          disabled={isSubmitting || Object.keys(attendance).length === 0}
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Attendance ({Object.keys(attendance).length}/{students.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
