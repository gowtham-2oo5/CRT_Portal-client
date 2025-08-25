// 🎯 CRT Portal Attendance System - Date Range Filter
// Created: 2025-07-15 | Phase 4 - Task 4.1

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Filter,
  X,
  CalendarDays,
  Clock,
  RefreshCw
} from 'lucide-react';

interface DateRangeFilterProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    sectionId?: string;
    facultyId?: string;
    attendanceThreshold?: number;
  }) => void;
  availableSections?: Array<{ id: string; name: string }>;
  availableFaculty?: Array<{ id: string; name: string }>;
  initialFilters?: {
    startDate?: string;
    endDate?: string;
    sectionId?: string;
    facultyId?: string;
    attendanceThreshold?: number;
  };
  className?: string;
}

type QuickFilter = 'today' | 'week' | 'month' | 'semester' | 'custom';

export function DateRangeFilter({
  onFilterChange,
  availableSections = [],
  availableFaculty = [],
  initialFilters = {},
  className = ""
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [sectionId, setSectionId] = useState(initialFilters.sectionId || '');
  const [facultyId, setFacultyId] = useState(initialFilters.facultyId || '');
  const [attendanceThreshold, setAttendanceThreshold] = useState(
    initialFilters.attendanceThreshold?.toString() || ''
  );
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('custom');
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick filter presets
  const getQuickFilterDates = (filter: QuickFilter): { start: string; end: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return { start: formatDate(today), end: formatDate(today) };
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
        return { start: formatDate(weekStart), end: formatDate(weekEnd) };
      
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: formatDate(monthStart), end: formatDate(monthEnd) };
      
      case 'semester':
        // Assuming semester starts in January or July
        const currentMonth = today.getMonth();
        const semesterStart = currentMonth < 6 
          ? new Date(today.getFullYear(), 0, 1) // January
          : new Date(today.getFullYear(), 6, 1); // July
        const semesterEnd = currentMonth < 6
          ? new Date(today.getFullYear(), 5, 30) // June
          : new Date(today.getFullYear(), 11, 31); // December
        return { start: formatDate(semesterStart), end: formatDate(semesterEnd) };
      
      default:
        return { start: '', end: '' };
    }
  };

  // Handle quick filter selection
  const handleQuickFilter = (filter: QuickFilter) => {
    setQuickFilter(filter);
    
    if (filter !== 'custom') {
      const { start, end } = getQuickFilterDates(filter);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sectionId: sectionId || undefined,
      facultyId: facultyId || undefined,
      attendanceThreshold: attendanceThreshold ? parseFloat(attendanceThreshold) : undefined,
    };

    onFilterChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSectionId('');
    setFacultyId('');
    setAttendanceThreshold('');
    setQuickFilter('custom');
    
    onFilterChange({});
  };

  // Auto-apply filters when quick filter changes
  useEffect(() => {
    if (quickFilter !== 'custom') {
      applyFilters();
    }
  }, [startDate, endDate, quickFilter]);

  // Count active filters
  const activeFiltersCount = [
    startDate,
    endDate,
    sectionId,
    facultyId,
    attendanceThreshold
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(['today', 'week', 'month', 'semester', 'custom'] as const).map((filter) => (
            <Button
              key={filter}
              variant={quickFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter(filter)}
              className="flex items-center gap-1"
            >
              {filter === 'today' && <Clock className="h-3 w-3" />}
              {filter === 'week' && <CalendarDays className="h-3 w-3" />}
              {filter === 'month' && <Calendar className="h-3 w-3" />}
              {filter === 'semester' && <Calendar className="h-3 w-3" />}
              {filter === 'custom' && <Filter className="h-3 w-3" />}
              
              {filter === 'today' ? 'Today' :
               filter === 'week' ? 'This Week' :
               filter === 'month' ? 'This Month' :
               filter === 'semester' ? 'This Semester' : 'Custom'}
            </Button>
          ))}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setQuickFilter('custom');
                }}
                max={endDate || undefined}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setQuickFilter('custom');
                }}
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Section Filter */}
          {availableSections.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="">All Sections</option>
                {availableSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Faculty Filter */}
          {availableFaculty.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Faculty</label>
              <select
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="">All Faculty</option>
                {availableFaculty.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attendance Threshold */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Minimum Attendance Threshold (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 75"
              value={attendanceThreshold}
              onChange={(e) => setAttendanceThreshold(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Show only sessions/students above this attendance percentage
            </div>
          </div>

          {/* Apply/Reset Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyFilters} className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            
            <Button variant="outline" onClick={clearFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {startDate && (
                  <Badge variant="outline">
                    From: {new Date(startDate).toLocaleDateString()}
                  </Badge>
                )}
                {endDate && (
                  <Badge variant="outline">
                    To: {new Date(endDate).toLocaleDateString()}
                  </Badge>
                )}
                {sectionId && (
                  <Badge variant="outline">
                    Section: {availableSections.find(s => s.id === sectionId)?.name || sectionId}
                  </Badge>
                )}
                {facultyId && (
                  <Badge variant="outline">
                    Faculty: {availableFaculty.find(f => f.id === facultyId)?.name || facultyId}
                  </Badge>
                )}
                {attendanceThreshold && (
                  <Badge variant="outline">
                    Min Attendance: {attendanceThreshold}%
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
