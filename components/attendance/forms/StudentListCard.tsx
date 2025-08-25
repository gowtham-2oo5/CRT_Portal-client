// 🎯 CRT Portal Attendance System - Student List Card
// Created: 2025-07-15 | Phase 3 - Task 3.1

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Users, 
  CheckCircle, 
  XCircle,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { StudentAttendanceRow } from './StudentAttendanceRow';
import type { Student } from '@/lib/types/section-management';
import type { AttendanceRecord } from '@/lib/types/attendance';

interface StudentListCardProps {
  students: Student[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onAttendanceChange: (studentId: string, record: Partial<AttendanceRecord>) => void;
  isSubmitting?: boolean;
  className?: string;
}

type SortField = 'name' | 're' | 'attendance';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'present' | 'absent' | 'unmarked';

export function StudentListCard({
  students,
  attendanceRecords,
  onAttendanceChange,
  isSubmitting = false,
  className = ""
}: StudentListCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('re');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState<FilterType>('all');

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const total = students.length;
    const present = Object.values(attendanceRecords).filter(record => record.present === true).length;
    const absent = Object.values(attendanceRecords).filter(record => record.present === false).length;
    const unmarked = total - present - absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, unmarked, percentage };
  }, [students, attendanceRecords]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.re.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.regNum.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Attendance filter
      const record = attendanceRecords[student.id];
      switch (filter) {
        case 'present':
          return record?.present === true;
        case 'absent':
          return record?.present === false;
        case 'unmarked':
          return !record || record.present === undefined;
        default:
          return true;
      }
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 're':
          aValue = a.regNum.toLowerCase();
          bValue = b.regNum.toLowerCase();
          break;
        case 'attendance':
          const aRecord = attendanceRecords[a.id];
          const bRecord = attendanceRecords[b.id];
          aValue = aRecord?.present === true ? 2 : aRecord?.present === false ? 1 : 0;
          bValue = bRecord?.present === true ? 2 : bRecord?.present === false ? 1 : 0;
          break;
        default:
          aValue = a.re.toLowerCase();
          bValue = b.re.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, attendanceRecords, searchTerm, sortField, sortDirection, filter]);

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attendance
            <Badge variant="outline" className="ml-2">
              {attendanceStats.total} students
            </Badge>
          </CardTitle>
          
          {/* Attendance Summary */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {attendanceStats.present} Present
            </Badge>
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {attendanceStats.absent} Absent
            </Badge>
            <Badge variant="secondary">
              {attendanceStats.unmarked} Unmarked
            </Badge>
            <Badge variant="outline" className="font-bold">
              {attendanceStats.percentage}%
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, roll number, or reg number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">All Students ({students.length})</option>
              <option value="present">Present ({attendanceStats.present})</option>
              <option value="absent">Absent ({attendanceStats.absent})</option>
              <option value="unmarked">Unmarked ({attendanceStats.unmarked})</option>
            </select>

            {/* Sort Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('re')}
              className="flex items-center gap-1"
            >
              Roll No.
              {sortField === 're' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className="flex items-center gap-1"
            >
              Name
              {sortField === 'name' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              students.forEach(student => {
                onAttendanceChange(student.id, { present: true });
              });
            }}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark All Present
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              students.forEach(student => {
                onAttendanceChange(student.id, { present: false });
              });
            }}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Mark All Absent
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              students.forEach(student => {
                onAttendanceChange(student.id, { present: undefined });
              });
            }}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredAndSortedStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No students found matching your criteria</p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredAndSortedStudents.map((student, index) => (
              <StudentAttendanceRow
                key={student.id}
                student={student}
                attendanceRecord={attendanceRecords[student.id]}
                onAttendanceChange={(record) => onAttendanceChange(student.id, record)}
                isSubmitting={isSubmitting}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
