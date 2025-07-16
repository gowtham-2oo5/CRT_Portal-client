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
  AlertCircle,
  FileDown,
  Mail,
  Phone,
} from "lucide-react";
import { SectionAttendanceService } from "@/lib/api/services/section-attendance";
import { toast } from "sonner";
import type { Section, Student } from "@/lib/types/section-management";

interface SectionStudentsListProps {
  section: Section;
  onBack: () => void;
}

export function SectionStudentsList({
  section,
  onBack,
}: SectionStudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize with empty arrays to prevent filter errors
      setStudents([]);
      setFilteredStudents([]);

      // If section already has students, use them
      if (
        section.students &&
        Array.isArray(section.students) &&
        section.students.length > 0
      ) {
        setStudents(section.students);
        setFilteredStudents(section.students);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      const studentsData = await SectionAttendanceService.getSectionStudents(
        section.id
      );

      // Ensure studentsData is an array before setting state
      if (Array.isArray(studentsData.students)) {
        // Use the students array from the response
        const students = studentsData.students;
        console.log("Raw students data from API:", students);

        // Log the crtEligibility values to debug
        students.forEach((student, index) => {
          console.log(
            `Student ${index} (${student.name}) crtEligibility:`,
            student.crtEligibility
          );
        });

        setStudents(students);
        setFilteredStudents(students);
        toast.success("Students list loaded successfully");
      } else if (Array.isArray(studentsData)) {
        // Handle case where the API returns the array directly
        console.log("Raw students data from API (direct array):", studentsData);

        // Log the crtEligibility values to debug
        studentsData.forEach((student, index) => {
          console.log(
            `Student ${index} (${student.name}) crtEligibility:`,
            student.crtEligibility
          );
        });

        setStudents(studentsData);
        setFilteredStudents(studentsData);
        toast.success("Students list loaded successfully");
      } else {
        console.error("API did not return an array of students:", studentsData);
        setError("Invalid data format received from server");
      }
    } catch (error: any) {
      console.error("Error loading students:", error);
      setError(error.message || "Failed to load students");
      toast.error(error.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log("LOADING STUDENTS ANNA");
    loadStudents();
  }, [section.id]);

  // Apply search filter
  useEffect(() => {
    // Ensure students is an array before filtering
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }

    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    try {
      const filtered = students.filter(
        (student) =>
          student.name?.toLowerCase().includes(query) ||
          student.regNum?.toLowerCase().includes(query) ||
          student.rollNumber?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query) ||
          student.department?.toLowerCase().includes(query)
      );

      setFilteredStudents(filtered);
    } catch (error) {
      console.error("Error filtering students:", error);
      // If filter fails, just show all students
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  // Handle export to CSV
  const handleExportCSV = () => {
    try {
      // Ensure filteredStudents is an array
      if (!Array.isArray(filteredStudents) || filteredStudents.length === 0) {
        toast.error("No students data to export");
        return;
      }

      // Convert students to CSV
      const headers = [
        "Reg Number",
        "Name",
        "Email",
        "Phone",
        "Department",
        "Batch",
        "CRT Eligible",
      ];

      const csvContent = [
        headers.join(","),
        ...filteredStudents.map((student) =>
          [
            student.regNum || "",
            `"${student.name || ""}"`,
            student.email || "",
            student.phone || "",
            `"${student.department || ""}"`,
            student.batch || "",
            student.crtEligibility ? "Yes" : "No",
          ].join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${section.name}-students.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Students list exported successfully");
    } catch (error: any) {
      console.error("Error exporting students list:", error);
      toast.error(error.message || "Failed to export students list");
    }
  };

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
            Students List: {section.name}
          </h1>
          <p className="text-muted-foreground">
            View and export all students enrolled in this section
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
            onClick={loadStudents}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={isLoading || filteredStudents.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(students) ? students.length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CRT Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(students)
                ? students.filter((s) => s && s.crtEligibility).length
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(students)
                ? students.filter((s) => s && !s.crtEligibility).length
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(students)
                ? new Set(
                    students
                      .filter((s) => s && s.department)
                      .map((s) => s.department)
                  ).size
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, reg number, email, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {students.length === 0
                ? "No students found in this section."
                : "No matching students found. Try adjusting your search."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg. Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>CRT Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.regNum || student.rollNumber}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>
                      {student.crtEligibility === true ? (
                        <Badge className="bg-green-500">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive">Not Eligible</Badge>
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
