"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceService } from "@/lib/api/services/attendance";
import { FacultyWithPendingAttendance } from "@/lib/types/attendance";
import {
  AbsenteeExportData,
  AbsenteeRecordExportData,
} from "@/lib/types/export-types";
import { Calendar, Clock, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExportAbsenteeRecordsCSV } from "./export-absentee-records-csv";
import { ExportAbsenteesCSV } from "./export-absentees-csv";
import { ExportFacultyCSV } from "./export-faculty-csv";
import { ExportPendingFacultyCSV } from "./export-pending-faculty-csv";

export function DataExportSettings() {
  const [isLoadingAbsentees, setIsLoadingAbsentees] = useState(false);
  const [absentees, setAbsentees] = useState<AbsenteeExportData[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [records, setRecords] = useState<AbsenteeRecordExportData[]>([]);
  const [isLoadingPendingFaculty, setIsLoadingPendingFaculty] = useState(false);
  const [pendingFaculty, setPendingFaculty] = useState<
    FacultyWithPendingAttendance[]
  >([]);
  const [pendingDate, setPendingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Function to load recent absentees for export
  const loadRecentAbsentees = async () => {
    try {
      setIsLoadingAbsentees(true);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Filter time slots for today
      const response = await AttendanceService.filterTimeSlots(today);

      // Collect absentees from all posted time slots
      const allAbsentees: any[] = [];
      for (const slot of response.timeSlots) {
        if (slot.attendancePosted) {
          const slotAbsentees = await AttendanceService.getAbsentees(
            slot.timeSlotId.toString()
          );

          // Add additional context to each absentee
          slotAbsentees.forEach((absentee) => {
            console.log("Absentee DATA format: ", absentee);
            allAbsentees.push({
              ...absentee,
              timeSlotId: slot.timeSlotId,
              sectionName: slot.sectionName,
              date: today,
              startTime: slot.startTime,
              endTime: slot.endTime,
              facultyName: slot.facultyName,
            });
          });
        }
      }

      setAbsentees(allAbsentees);
      toast.success(
        `Loaded ${allAbsentees.length} absentees from today's sessions`
      );
    } catch (error: any) {
      console.error("Error loading absentees:", error);
      toast.error(error.message || "Failed to load absentees");
    } finally {
      setIsLoadingAbsentees(false);
    }
  };

  // Function to prepare absentee records for export
  const prepareAbsenteeRecords = async () => {
    try {
      setIsLoadingRecords(true);

      // For demonstration, we'll use the same data as absentees
      // In a real implementation, you might want to fetch more comprehensive records
      if (absentees.length === 0) {
        await loadRecentAbsentees();
      }

      // Format records for the export component
      const formattedRecords = absentees.map((absentee) => ({
        studentId: absentee.id,
        studentName: absentee.name,
        studentEmail: absentee.email,
        studentPhone: absentee.phone || "N/A",
        date: absentee.date ?? "",
        startTime: absentee.startTime ?? "",
        endTime: absentee.endTime ?? "",
        sectionName: absentee.sectionName ?? "",
        facultyName: absentee.facultyName ?? "",
      }));

      setRecords(formattedRecords);
    } catch (error: any) {
      console.error("Error preparing records:", error);
      toast.error(error.message || "Failed to prepare records");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Function to load faculty with pending attendance
  const loadPendingFaculty = async () => {
    try {
      setIsLoadingPendingFaculty(true);

      const response = await AttendanceService.filterTimeSlots(pendingDate);
      console.log("ACtual pending faculty response: ", response);
      
      const faculty = response.facultiesWithPendingAttendance;


      const facultyMap = new Map<
        string,
        FacultyWithPendingAttendance & { pendingCount: number }
      >();

      response.timeSlots.forEach((slot) => {
        if (!slot.attendancePosted) {
          const facultyId = slot.facultyId;
          if (facultyMap.has(facultyId)) {
            const faculty = facultyMap.get(facultyId)!;
            faculty.pendingCount += 1;
          } else {
            const matchingFaculty =
              response.facultiesWithPendingAttendance.find(
                (f) => f.id === facultyId
              );
            if (matchingFaculty) {
              facultyMap.set(facultyId, {
                ...matchingFaculty,
                pendingCount: 1,
              });
            }
          }
        }
      });

      const facultyWithCounts = Array.from(facultyMap.values());
      setPendingFaculty(facultyWithCounts);

      toast.success(
        `Loaded ${facultyWithCounts.length} faculty with pending attendance for ${pendingDate}`
      );
    } catch (error: any) {
      console.error("Error loading pending faculty:", error);
      toast.error(error.message || "Failed to load pending faculty");
    } finally {
      setIsLoadingPendingFaculty(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Export various data from the system in CSV format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="faculty">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="pending">Pending Attendance</TabsTrigger>
            <TabsTrigger value="absentees">Absentees</TabsTrigger>
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Faculty Data</h3>
                <p className="text-sm text-muted-foreground">
                  Export faculty user information including ID, name, email,
                  phone, department, and status.
                </p>
              </div>
              <ExportFacultyCSV />
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  Faculty with Pending Attendance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Export faculty members who have pending attendance for their
                  assigned time slots.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="pending-date" className="sr-only">
                    Date
                  </Label>
                  <Input
                    id="pending-date"
                    type="date"
                    value={pendingDate}
                    onChange={(e) => setPendingDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={loadPendingFaculty}
                  disabled={isLoadingPendingFaculty}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {isLoadingPendingFaculty
                    ? "Loading..."
                    : "Load Pending Faculty"}
                </Button>
                <ExportPendingFacultyCSV
                  date={pendingDate}
                  pendingFaculty={pendingFaculty}
                  disabled={pendingFaculty.length === 0}
                />
              </div>
            </div>
            {pendingFaculty.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {pendingFaculty.length} faculty with pending attendance loaded
                for {pendingDate}.
              </p>
            )}
          </TabsContent>

          <TabsContent value="absentees" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Absentee Data</h3>
                <p className="text-sm text-muted-foreground">
                  Export student absentee information including ID, name, email,
                  and phone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={loadRecentAbsentees}
                  disabled={isLoadingAbsentees}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isLoadingAbsentees ? "Loading..." : "Load Today's Absentees"}
                </Button>
                <ExportAbsenteesCSV
                  absentees={absentees}
                  disabled={absentees.length === 0}
                />
              </div>
            </div>
            {absentees.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {absentees.length} absentees loaded and ready for export.
              </p>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Attendance Records</h3>
                <p className="text-sm text-muted-foreground">
                  Export detailed absentee records including student
                  information, section, date, time slot, and faculty.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={prepareAbsenteeRecords}
                  disabled={isLoadingRecords}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isLoadingRecords ? "Preparing..." : "Prepare Records"}
                </Button>
                <ExportAbsenteeRecordsCSV
                  records={records}
                  disabled={records.length === 0}
                />
              </div>
            </div>
            {records.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {records.length} attendance records prepared and ready for
                export.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
