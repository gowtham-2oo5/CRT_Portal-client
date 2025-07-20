"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AttendanceService } from "@/lib/api/services/attendance";
import type { FilteredTimeSlot, FacultyWithPendingAttendance } from "@/lib/types/attendance";

import { BulkEmailModal } from "./bulk-email-modal";

const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export function TimeSlotFilter() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<FilteredTimeSlot[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<FacultyWithPendingAttendance[]>([]);
  const [stats, setStats] = useState({ total: 0, posted: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [absenteeEmails, setAbsenteeEmails] = useState<string[]>([]);

  const handleFilter = async () => {
    try {
      setIsLoading(true);
      const response = await AttendanceService.filterTimeSlots(date, startTime, endTime);
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
      setAbsenteeEmails(absentees.map(a => a.email));
      setShowEmailModal(true);
    } catch (error) {
      toast.error("Failed to fetch absentees.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Time Slots</CardTitle>
          <CardDescription>Filter time slots by date and time to see attendance status.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-[180px]" />
          </div>
          <div className="space-y-2">
            <Label>Start Time (Optional)</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-[140px]" />
          </div>
          <div className="space-y-2">
            <Label>End Time (Optional)</Label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-[140px]" />
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
              <CardDescription>Posted: {stats.posted}, Pending: {stats.pending}</CardDescription>
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
                  {timeSlots.map(slot => (
                    <tr key={slot.timeSlotId}>
                      <td className="p-2">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</td>
                      <td className="p-2">{slot.sectionName}</td>
                      <td className="p-2">{slot.facultyName}</td>
                      <td className="p-2">{slot.attendancePosted ? 'Posted' : 'Pending'}</td>
                      <td className="p-2">
                        {slot.attendancePosted && (
                          <Button size="sm" onClick={() => handleViewAbsentees(slot.timeSlotId.toString())}>View Absentees</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                {pendingFaculty.map(faculty => (
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
    </div>
  );
}
