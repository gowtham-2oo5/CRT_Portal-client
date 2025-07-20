"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AttendanceService } from "@/lib/api/services/attendance";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import type {
  FilteredTimeSlot,
  FacultyWithPendingAttendance,
  Absentee
} from "@/lib/types/attendance";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";
import { AllAbsenteesModal } from "./all-absentees-modal";

import { BulkEmailModal } from "./bulk-email-modal";

const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

export function TimeSlotFilter() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("all");
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [timeSlots, setTimeSlots] = useState<FilteredTimeSlot[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<
    FacultyWithPendingAttendance[]
  >([]);
  const [stats, setStats] = useState({ total: 0, posted: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [absenteeEmails, setAbsenteeEmails] = useState<string[]>([]);
  const [showAllAbsenteesModal, setShowAllAbsenteesModal] = useState(false);
  const [allAbsenteeEmails, setAllAbsenteeEmails] = useState<string[]>([]);
  const [allAbsentees, setAllAbsentees] = useState<Absentee[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await TimeSlotTemplateService.getTemplates();
        setTemplates(data);
      } catch (error) {
        toast.error("Failed to load time slot templates.");
      }
    };
    loadTemplates();
  }, []);

  const handleFilter = async () => {
    try {
      setIsLoading(true);
      let filterStartTime = "";
      let filterEndTime = "";

      if (selectedTemplateName && selectedTemplateName !== "all") {
        const selectedTemplate = templates.find(
          (t) => t.name === selectedTemplateName
        );
        if (selectedTemplate) {
          filterStartTime = selectedTemplate.startTime;
          filterEndTime = selectedTemplate.endTime;
        }
      }

      const response = await AttendanceService.filterTimeSlots(
        date,
        filterStartTime,
        filterEndTime
      );
      setTimeSlots(response.timeSlots);
      setPendingFaculty(response.facultiesWithPendingAttendance);
      setStats({
        total: response.totalTimeSlots,
        posted: response.postedAttendanceCount,
        pending: response.pendingAttendanceCount,
      });
    } catch (error) {
      toast.error("Failed to filter time slots.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAbsentees = async (timeSlotId: string) => {
    try {
      const absentees = await AttendanceService.getAbsentees(timeSlotId);
      setAllAbsenteeEmails(absentees.map((a) => a.email));
      setAllAbsentees(absentees);
      setShowAllAbsenteesModal(true);
    } catch (error) {
      toast.error("Failed to fetch absentees.");
    }
  };

  const handleGetAllAbsentees = async () => {
    setIsLoading(true);
    try {
      const allEmails: string[] = [];
      const allAbsenteeData: any[] = [];
      
      for (const slot of timeSlots) {
        if (slot.attendancePosted) {
          const absentees = await AttendanceService.getAbsentees(
            slot.timeSlotId.toString()
          );
          
          absentees.forEach((absentee) => {
            if (!allEmails.includes(absentee.email)) {
              allEmails.push(absentee.email);
              // Add additional data for CSV export
              allAbsenteeData.push({
                ...absentee,
                timeSlotId: slot.timeSlotId,
                sectionName: slot.sectionName,
                date: date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                facultyName: slot.facultyName
              });
            }
          });
        }
      }
      
      setAllAbsenteeEmails(allEmails);
      setAllAbsentees(allAbsenteeData);
      setShowAllAbsenteesModal(true);
    } catch (error) {
      toast.error("Failed to get all absentees.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Time Slots</CardTitle>
          <CardDescription>
            Filter time slots by date and time to see attendance status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Time Slot Template (Optional)</Label>
            <Select
              value={selectedTemplateName}
              onValueChange={setSelectedTemplateName}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name} ({formatTime(template.startTime)} -{" "}
                    {formatTime(template.endTime)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleFilter} disabled={isLoading}>
            {isLoading ? "Filtering..." : "Filter"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Time Slots ({stats.total})</CardTitle>
              <CardDescription>
                Posted: {stats.posted}, Pending: {stats.pending}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Section</th>
                    <th className="text-left p-2">Faculty</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.timeSlotId}>
                      <td className="p-2">
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </td>
                      <td className="p-2">{slot.sectionName}</td>
                      <td className="p-2">{slot.facultyName}</td>
                      <td className="p-2">
                        {slot.attendancePosted ? "Posted" : "Pending"}
                      </td>
                      <td className="p-2">
                        {slot.attendancePosted && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleViewAbsentees(slot.timeSlotId.toString())
                            }
                          >
                            View Absentees
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <Button
                  onClick={handleGetAllAbsentees}
                  disabled={isLoading || timeSlots.length === 0}
                >
                  Get All Absentees
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pending Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {pendingFaculty.map((faculty) => (
                  <li key={faculty.id} className="mb-2">
                    <p className="font-semibold">{faculty.name}</p>
                    <p className="text-sm text-gray-500">{faculty.email}</p>
                    <p className="text-sm text-gray-500">{faculty.phone}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <BulkEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        emailIds={absenteeEmails}
      />
      <AllAbsenteesModal
        open={showAllAbsenteesModal}
        onOpenChange={setShowAllAbsenteesModal}
        absenteeEmails={allAbsenteeEmails}
        absentees={allAbsentees}
      />
    </div>
  );
}
