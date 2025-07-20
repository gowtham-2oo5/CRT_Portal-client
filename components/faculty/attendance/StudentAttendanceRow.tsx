// 🎯 CRT Portal Attendance System - Student Attendance Row
// Created: 2025-07-15 | Phase 3 - Task 3.1

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Student } from "@/lib/types/section-management";
import type { AttendanceRecord } from "@/lib/types/attendance";

interface StudentAttendanceRowProps {
  student: Student;
  attendanceRecord?: AttendanceRecord;
  onAttendanceChange: (record: Partial<AttendanceRecord>) => void;
  isSubmitting?: boolean;
  index: number;
  className?: string;
}

export function StudentAttendanceRow({
  student,
  attendanceRecord,
  onAttendanceChange,
  isSubmitting = false,
  index,
  className = "",
}: StudentAttendanceRowProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(attendanceRecord?.present || "");

  // Handle attendance status change
  const handleAttendanceChange = (present: boolean) => {
    const newRecord: Partial<AttendanceRecord> = {
      studentId: student.id,
      present,
    };

    onAttendanceChange(newRecord);
  };

  // Handle feedback change
  const handleFeedbackChange = (newFeedback: string) => {
    setFeedback(newFeedback);

    // Auto-save feedback if attendance is already marked
    if (attendanceRecord?.present !== undefined) {
      onAttendanceChange({
        ...attendanceRecord,
        feedback: newFeedback.trim() || undefined,
      });
    }
  };

  // Get attendance status
  const getAttendanceStatus = () => {
    if (attendanceRecord?.present === true) return "present";
    if (attendanceRecord?.present === false) return "absent";
    return "unmarked";
  };

  const attendanceStatus = getAttendanceStatus();
  const hasLowAttendance =
    student.attendancePercentage && student.attendancePercentage < 75;

  // Get student initials for avatar
  const getInitials = (name: string | undefined, regNum: string): string => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    // Fallback to regNum if name is undefined/null
    return regNum.toUpperCase().slice(0, 2);
  };

  return (
    <div className={`p-4 hover:bg-muted/50 transition-colors ${className}`}>
      <div className="flex items-center gap-4">
        {/* Index Number */}
        <div className="text-sm text-muted-foreground font-mono w-8 text-center">
          {index}
        </div>

        {/* Student Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
            alt={student.name}
          />
          <AvatarFallback className="text-sm font-semibold">
            {getInitials(student.name, student.regNum)}
          </AvatarFallback>
        </Avatar>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{student.name || student.regNum}</h4>

            {hasLowAttendance && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Attendance
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">{student.regNum}</span>
            <span className="font-mono">{student.regNum}</span>
            <span>{student.department}</span>
            {student.attendancePercentage !== undefined && (
              <span
                className={`font-semibold ${
                  student.attendancePercentage >= 90
                    ? "text-green-600"
                    : student.attendancePercentage >= 75
                    ? "text-blue-600"
                    : student.attendancePercentage >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {student.attendancePercentage.toFixed(1)}% overall
              </span>
            )}
          </div>
        </div>

        {/* Attendance Status */}
        <div className="flex items-center gap-2">
          {attendanceStatus === "present" && (
            <Badge variant="default" className="bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Present
            </Badge>
          )}

          {attendanceStatus === "absent" && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Absent
            </Badge>
          )}

          {attendanceStatus === "unmarked" && (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Unmarked
            </Badge>
          )}
        </div>

        {/* Attendance Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={attendanceStatus === "present" ? "default" : "outline"}
            onClick={() => handleAttendanceChange(true)}
            disabled={isSubmitting}
            className={
              attendanceStatus === "present"
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            }
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Present
          </Button>

          <Button
            size="sm"
            variant={attendanceStatus === "absent" ? "destructive" : "outline"}
            onClick={() => handleAttendanceChange(false)}
            disabled={isSubmitting}
            className={
              attendanceStatus !== "absent"
                ? "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                : ""
            }
          >
            <XCircle className="h-4 w-4 mr-1" />
            Absent
          </Button>
        </div>

        {/* Feedback Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFeedback(!showFeedback)}
          className={`${
            feedback.trim() ? "text-blue-600" : "text-muted-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          {showFeedback ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="mt-4 ml-16 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Feedback/Notes (Optional)
          </label>
          <Textarea
            placeholder="Add any notes about this student's attendance..."
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[80px] text-sm"
            maxLength={500}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{feedback.length}/500 characters</span>
            {feedback.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedbackChange("")}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Attendance Time */}
      {attendanceRecord?.attendanceTime && (
        <div className="mt-2 ml-16 text-xs text-muted-foreground">
          Marked at:{" "}
          {new Date(attendanceRecord.attendanceTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
