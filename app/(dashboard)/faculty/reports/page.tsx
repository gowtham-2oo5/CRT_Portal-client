"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileBarChart, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import type { AttendanceReport, FacultySection } from '@/lib/types/faculty';

// Mock data
const mockSections: FacultySection[] = [
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
  },
  {
    id: '3',
    name: 'CSE-C',
    subject: 'Database Systems',
    semester: 3,
    totalStudents: 38,
    students: []
  }
];

const mockAttendanceReports: AttendanceReport[] = [
  {
    studentId: '1',
    rollNumber: '21CSE001',
    name: 'Aarav Sharma',
    section: 'CSE-A',
    totalSessions: 20,
    attendedSessions: 18,
    attendancePercentage: 90,
    lastAttended: new Date('2024-06-25'),
    sessions: []
  },
  {
    studentId: '2',
    rollNumber: '21CSE002',
    name: 'Priya Patel',
    section: 'CSE-A',
    totalSessions: 20,
    attendedSessions: 19,
    attendancePercentage: 95,
    lastAttended: new Date('2024-06-26'),
    sessions: []
  },
  {
    studentId: '3',
    rollNumber: '21CSE003',
    name: 'Arjun Kumar',
    section: 'CSE-A',
    totalSessions: 20,
    attendedSessions: 15,
    attendancePercentage: 75,
    lastAttended: new Date('2024-06-24'),
    sessions: []
  },
  {
    studentId: '4',
    rollNumber: '21CSE004',
    name: 'Sneha Reddy',
    section: 'CSE-A',
    totalSessions: 20,
    attendedSessions: 16,
    attendancePercentage: 80,
    lastAttended: new Date('2024-06-25'),
    sessions: []
  },
  {
    studentId: '5',
    rollNumber: '21CSE005',
    name: 'Vikram Singh',
    section: 'CSE-A',
    totalSessions: 20,
    attendedSessions: 12,
    attendancePercentage: 60,
    lastAttended: new Date('2024-06-20'),
    sessions: []
  }
];

export default function FacultyReportsPage() {
  const [selectedSection, setSelectedSection] = useState<string>('1');
  const [selectedStudent, setSelectedStudent] = useState<AttendanceReport | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'good' | 'average' | 'poor'>('all');

  const currentSection = mockSections.find(s => s.id === selectedSection);
  const filteredReports = mockAttendanceReports.filter(report => {
    if (filterType === 'all') return true;
    if (filterType === 'good') return report.attendancePercentage >= 85;
    if (filterType === 'average') return report.attendancePercentage >= 70 && report.attendancePercentage < 85;
    if (filterType === 'poor') return report.attendancePercentage < 70;
    return true;
  });

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-100 dark:bg-green-950/20';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/20';
    return 'text-red-600 bg-red-100 dark:bg-red-950/20';
  };

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 85) return <TrendingUp className="h-4 w-4" />;
    if (percentage >= 70) return <Calendar className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const sectionStats = {
    totalStudents: filteredReports.length,
    averageAttendance: Math.round(
      filteredReports.reduce((acc, report) => acc + report.attendancePercentage, 0) / filteredReports.length
    ),
    goodAttendance: filteredReports.filter(r => r.attendancePercentage >= 85).length,
    poorAttendance: filteredReports.filter(r => r.attendancePercentage < 70).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Reports</h1>
          <p className="text-muted-foreground">View attendance reports for your assigned sections</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Select Section & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {mockSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} - {section.subject} (Sem {section.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Attendance</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="good">Good (≥85%)</SelectItem>
                  <SelectItem value="average">Average (70-84%)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Stats */}
      {currentSection && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{sectionStats.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{sectionStats.averageAttendance}%</div>
                  <div className="text-sm text-muted-foreground">Average Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{sectionStats.goodAttendance}</div>
                  <div className="text-sm text-muted-foreground">Good Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{sectionStats.poorAttendance}</div>
                  <div className="text-sm text-muted-foreground">Poor Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileBarChart className="h-5 w-5" />
            <span>Student Attendance Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.studentId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${report.name}`} />
                    <AvatarFallback>
                      {report.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-semibold">{report.name}</div>
                    <div className="text-sm text-muted-foreground">{report.rollNumber}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Sessions</div>
                    <div className="font-semibold">
                      {report.attendedSessions}/{report.totalSessions}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Last Attended</div>
                    <div className="font-semibold text-sm">
                      {report.lastAttended?.toLocaleDateString()}
                    </div>
                  </div>

                  <Badge 
                    className={`flex items-center space-x-1 ${getAttendanceColor(report.attendancePercentage)}`}
                  >
                    {getAttendanceIcon(report.attendancePercentage)}
                    <span>{report.attendancePercentage}%</span>
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudent(report)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students found matching the selected filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Details: {selectedStudent.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Roll Number</div>
                <div className="font-semibold">{selectedStudent.rollNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Section</div>
                <div className="font-semibold">{selectedStudent.section}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
                <div className="font-semibold">{selectedStudent.totalSessions}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Attended</div>
                <div className="font-semibold text-green-600">{selectedStudent.attendedSessions}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-lg ${getAttendanceColor(selectedStudent.attendancePercentage)}`}>
                  <div className="flex items-center space-x-2">
                    {getAttendanceIcon(selectedStudent.attendancePercentage)}
                    <span className="font-semibold">{selectedStudent.attendancePercentage}% Attendance</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Student Report
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This is a read-only view. Faculty members cannot edit or delete attendance records. 
                For any corrections, please contact the administration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
