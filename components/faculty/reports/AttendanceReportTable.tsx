// 🎯 CRT Portal Attendance System - Attendance Report Table
// Created: 2025-07-15 | Phase 4 - Task 4.1

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  FileText
} from 'lucide-react';
import type { AttendanceSession } from '@/lib/types/attendance';

interface AttendanceReportTableProps {
  sessions: AttendanceSession[];
  onViewDetails?: (sessionId: string) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  isLoading?: boolean;
  className?: string;
}

type SortField = 'date' | 'section' | 'attendance' | 'topic';
type SortDirection = 'asc' | 'desc';

export function AttendanceReportTable({
  sessions,
  onViewDetails,
  onExport,
  isLoading = false,
  className = ""
}: AttendanceReportTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.section?.name.toLowerCase().includes(searchLower) ||
        session.topicTaught.toLowerCase().includes(searchLower) ||
        session.faculty?.name.toLowerCase().includes(searchLower) ||
        session.date.includes(searchTerm)
      );
    });

    // Sort sessions
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'section':
          aValue = a.section?.name || '';
          bValue = b.section?.name || '';
          break;
        case 'attendance':
          aValue = a.attendancePercentage;
          bValue = b.attendancePercentage;
          break;
        case 'topic':
          aValue = a.topicTaught.toLowerCase();
          bValue = b.topicTaught.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sessions, searchTerm, sortField, sortDirection]);

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle session selection
  const handleSessionSelect = (sessionId: string, selected: boolean) => {
    const newSelected = new Set(selectedSessions);
    if (selected) {
      newSelected.add(sessionId);
    } else {
      newSelected.delete(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  // Handle select all
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedSessions(new Set(filteredAndSortedSessions.map(s => s.id)));
    } else {
      setSelectedSessions(new Set());
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalSessions = filteredAndSortedSessions.length;
    const totalStudents = filteredAndSortedSessions.reduce((sum, s) => sum + s.totalStudents, 0);
    const totalPresent = filteredAndSortedSessions.reduce((sum, s) => sum + s.presentCount, 0);
    const averageAttendance = totalSessions > 0 
      ? filteredAndSortedSessions.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalSessions
      : 0;

    return {
      totalSessions,
      totalStudents,
      totalPresent,
      averageAttendance: Math.round(averageAttendance * 100) / 100
    };
  }, [filteredAndSortedSessions]);

  // Get attendance trend indicator
  const getAttendanceTrend = (percentage: number): 'up' | 'down' | 'stable' => {
    if (percentage >= 90) return 'up';
    if (percentage < 75) return 'down';
    return 'stable';
  };

  // Get attendance color class
  const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const allSelected = filteredAndSortedSessions.length > 0 && 
    filteredAndSortedSessions.every(session => selectedSessions.has(session.id));
  const someSelected = selectedSessions.size > 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attendance Reports
            <Badge variant="outline" className="ml-2">
              {filteredAndSortedSessions.length} sessions
            </Badge>
          </CardTitle>

          {/* Export Actions */}
          {onExport && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('csv')}
                disabled={filteredAndSortedSessions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('excel')}
                disabled={filteredAndSortedSessions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{summaryStats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.totalPresent}</div>
            <div className="text-xs text-muted-foreground">Students Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summaryStats.totalStudents}</div>
            <div className="text-xs text-muted-foreground">Total Students</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAttendanceColor(summaryStats.averageAttendance)}`}>
              {summaryStats.averageAttendance.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Attendance</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by section, topic, faculty, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('date')}
              className="flex items-center gap-1"
            >
              Date
              {sortField === 'date' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('attendance')}
              className="flex items-center gap-1"
            >
              Attendance
              {sortField === 'attendance' && (
                sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {someSelected && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedSessions.size} session(s) selected
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('csv')}
                disabled={!someSelected}
              >
                <Download className="h-4 w-4 mr-1" />
                Export Selected
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {filteredAndSortedSessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
            <p>No attendance sessions match your search criteria.</p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <Calendar className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('section')}
                  >
                    <div className="flex items-center gap-1">
                      Section
                      <Users className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('topic')}
                  >
                    Topic Taught
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('attendance')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Attendance
                      <TrendingUp className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSessions.map((session) => {
                  const trend = getAttendanceTrend(session.attendancePercentage);
                  const isSelected = selectedSessions.has(session.id);
                  
                  return (
                    <TableRow 
                      key={session.id}
                      className={`hover:bg-muted/50 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSessionSelect(session.id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {new Date(session.date).toLocaleDateString()}
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.section?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.faculty?.name}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-mono text-sm">
                        {session.startTime} - {session.endTime}
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs truncate" title={session.topicTaught}>
                          {session.topicTaught}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-bold ${getAttendanceColor(session.attendancePercentage)}`}>
                            {session.attendancePercentage.toFixed(1)}%
                          </span>
                          
                          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                          {trend === 'stable' && <Minus className="h-3 w-3 text-gray-600" />}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {session.presentCount}/{session.totalStudents}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(session.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
