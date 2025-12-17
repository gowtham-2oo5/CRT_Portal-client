"use client";

import { useState, useEffect, useMemo } from "react";
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
  Absentee,
} from "@/lib/types/attendance";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";
import { AllAbsenteesModal } from "@/components/shared/modals/all-absentees-modal";
import { BulkEmailModal } from "@/components/shared/modals/bulk-email-modal";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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
  
  // Pagination and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter and paginate data
  const filteredTimeSlots = useMemo(() => {
    return timeSlots.filter((slot) =>
      slot.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [timeSlots, searchTerm]);
  
  const paginatedTimeSlots = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTimeSlots.slice(startIndex, endIndex);
  }, [filteredTimeSlots, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredTimeSlots.length / itemsPerPage);
  
  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                facultyName: slot.facultyName,
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
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Time Slots ({stats.total})</CardTitle>
                  <CardDescription>
                    Posted: {stats.posted}, Pending: {stats.pending}
                    {searchTerm && ` | Showing ${filteredTimeSlots.length} of ${stats.total} slots`}
                  </CardDescription>
                </div>
                <div className="w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by section name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Results table */}
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Section</th>
                      <th className="text-left p-3 font-medium">Faculty</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTimeSlots.length > 0 ? (
                      paginatedTimeSlots.map((slot) => (
                        <tr key={slot.timeSlotId} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </td>
                          <td className="p-3 font-medium">{slot.sectionName}</td>
                          <td className="p-3">{slot.facultyName}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                slot.attendancePosted
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {slot.attendancePosted ? "Posted" : "Pending"}
                            </span>
                          </td>
                          <td className="p-3">
                            {slot.attendancePosted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleViewAbsentees(slot.timeSlotId.toString())
                                }
                              >
                                View Absentees
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          {searchTerm
                            ? `No time slots found matching "${searchTerm}"`
                            : "No time slots found. Try adjusting your filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTimeSlots.length)}-
                    {Math.min(currentPage * itemsPerPage, filteredTimeSlots.length)} of{" "}
                    {filteredTimeSlots.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and adjacent pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              className="w-9 h-9 p-0"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-1 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-6">
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
