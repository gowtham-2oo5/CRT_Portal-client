"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  Calendar,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { SectionAttendanceService, SectionAttendanceRecord } from "@/lib/api/services/section-attendance";
import { downloadCSV } from "@/lib/utils/csv-export";
import { toast } from "sonner";
import type { Section } from "@/lib/types/section-management";

interface SectionAttendanceRecordsProps {
  section: Section;
  onBack: () => void;
}

export function SectionAttendanceRecords({ section, onBack }: SectionAttendanceRecordsProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<SectionAttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SectionAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Date range state
  const defaultDateRange = SectionAttendanceService.getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [monthTitle, setMonthTitle] = useState("");

  // Load attendance records
  const loadAttendanceRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const records = await SectionAttendanceService.getSectionAttendance(
        section.id,
        startDate,
        endDate
      );
      
      setAttendanceRecords(records);
      setFilteredRecords(records);
      
      // Set month title from the first record or format from date range
      if (records.length > 0) {
        setMonthTitle(records[0].monthTitle);
      } else {
        setMonthTitle(SectionAttendanceService.formatMonthTitle(startDate));
      }
      
      toast.success("Attendance records loaded successfully");
    } catch (error: any) {
      console.error("Error loading attendance records:", error);
      setError(error.message || "Failed to load attendance records");
      toast.error(error.message || "Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAttendanceRecords();
  }, [section.id, startDate, endDate]);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(attendanceRecords);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = attendanceRecords.filter(
      (record) =>
        record.name.toLowerCase().includes(query) ||
        record.regNum.toLowerCase().includes(query)
    );
    
    setFilteredRecords(filtered);
  }, [searchQuery, attendanceRecords]);

  // Handle date change
  const handleDateChange = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    loadAttendanceRecords();
  };

  // Handle export to CSV
  const handleExportCSV = async () => {
    try {
      // Use our new CSV export utility
      const csvData = attendanceRecords.map(record => ({
        id: record.regNum,
        name: record.name,
        email: record.email || `${record.regNum}@kluniversity.in`, // Fallback if email not available
        attendancePercentage: `${record.attendancePercentage.toFixed(1)}%`,
        totalClasses: record.totalClasses,
        absences: record.absences,
        status: record.attendancePercentage >= 75 ? "Good Standing" : "Attendance Warning"
      }));
      
      const headers = [
        { key: "id" as const, label: "Registration Number" },
        { key: "name" as const, label: "Student Name" },
        { key: "email" as const, label: "Email" },
        { key: "attendancePercentage" as const, label: "Attendance %" },
        { key: "totalClasses" as const, label: "Total Classes" },
        { key: "absences" as const, label: "Absences" },
        { key: "status" as const, label: "Status" }
      ];
      
      const filename = `${section.name}-attendance-${startDate}-to-${endDate}`;
      downloadCSV(csvData, filename, headers);
      
      toast.success("Attendance records exported successfully");
    } catch (error: any) {
      console.error("Error exporting attendance records:", error);
      toast.error(error.message || "Failed to export attendance records");
    }
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    if (attendanceRecords.length === 0) {
      return {
        averageAttendance: 0,
        highestAttendance: 0,
        lowestAttendance: 0,
        totalStudents: 0,
      };
    }

    const attendanceValues = attendanceRecords.map((r) => r.attendancePercentage);
    
    return {
      averageAttendance: attendanceValues.reduce((sum, val) => sum + val, 0) / attendanceValues.length,
      highestAttendance: Math.max(...attendanceValues),
      lowestAttendance: Math.min(...attendanceValues),
      totalStudents: attendanceRecords.length,
    };
  };

  const stats = calculateStats();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sections
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendance Records: {section.name}
          </h1>
          <p className="text-muted-foreground">
            View and export attendance records for all students in this section
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAttendanceRecords}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} disabled={isLoading || attendanceRecords.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleDateChange} disabled={isLoading}>
                <Calendar className="h-4 w-4 mr-2" />
                Apply Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestAttendance.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lowest Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowestAttendance.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name or registration number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {monthTitle} - Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {attendanceRecords.length === 0
                ? "No attendance records found for the selected date range."
                : "No matching records found. Try adjusting your search."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg. Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Total Classes</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.regNum}>
                    <TableCell className="font-medium">{record.regNum}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.attendancePercentage.toFixed(1)}%</TableCell>
                    <TableCell>{record.totalClasses}</TableCell>
                    <TableCell>{record.absences}</TableCell>
                    <TableCell>
                      {record.attendancePercentage >= 85 ? (
                        <Badge className="bg-green-500">Excellent</Badge>
                      ) : record.attendancePercentage >= 75 ? (
                        <Badge className="bg-blue-500">Good</Badge>
                      ) : record.attendancePercentage >= 65 ? (
                        <Badge className="bg-yellow-500">Average</Badge>
                      ) : (
                        <Badge variant="destructive">Low</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
