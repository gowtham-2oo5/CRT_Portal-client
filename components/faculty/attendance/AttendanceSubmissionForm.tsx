// 🎯 CRT Portal Attendance System - Attendance Submission Form
// Created: 2025-07-15 | Phase 3 - Task 3.1

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Users
} from 'lucide-react';
import type { SubmitAttendanceRequest, AttendanceRecord } from '@/lib/types/attendance';
import type { TimeSlot } from '@/lib/types/section-schedule';
import { AttendanceValidator } from '@/lib/utils/attendance-validation';

interface AttendanceSubmissionFormProps {
  timeSlot: TimeSlot;
  attendanceRecords: Record<string, AttendanceRecord>;
  onSubmit: (data: SubmitAttendanceRequest) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function AttendanceSubmissionForm({
  timeSlot,
  attendanceRecords,
  onSubmit,
  isSubmitting = false,
  className = ""
}: AttendanceSubmissionFormProps) {
  const [topicTaught, setTopicTaught] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Calculate submission statistics
  const totalStudents = Object.keys(attendanceRecords).length;
  const markedStudents = Object.values(attendanceRecords).filter(
    record => record.present !== undefined
  ).length;
  const presentStudents = Object.values(attendanceRecords).filter(
    record => record.present === true
  ).length;
  const absentStudents = Object.values(attendanceRecords).filter(
    record => record.present === false
  ).length;
  const unmarkedStudents = totalStudents - markedStudents;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  // Enhanced validation using AttendanceValidator
  const validateForm = (): { errors: string[]; warnings: string[] } => {
    const submissionData: SubmitAttendanceRequest = {
      timeSlotId: timeSlot.id.toString(),
      sectionId: timeSlot.sectionId,
      date: new Date().toISOString().split('T')[0],
      topicTaught: topicTaught.trim(),
      sessionNotes: sessionNotes.trim() || undefined,
      attendanceRecords: Object.values(attendanceRecords).filter(
        record => record.present !== undefined
      ),
    };

    // Use comprehensive validation
    const validation = AttendanceValidator.validateSubmissionRequest(
      submissionData,
      [] // Students array would be passed from parent component
    );

    return {
      errors: validation.errors,
      warnings: validation.warnings
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    setErrors(validation.errors);
    setWarnings(validation.warnings);

    if (validation.errors.length > 0) {
      return;
    }

    try {
      let submissionData: SubmitAttendanceRequest = {
        timeSlotId: timeSlot.id.toString(),
        sectionId: timeSlot.sectionId,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        topicTaught: topicTaught.trim(),
        sessionNotes: sessionNotes.trim() || undefined,
        attendanceRecords: Object.values(attendanceRecords).filter(
          record => record.present !== undefined
        ),
      };

      // Sanitize data before submission
      submissionData = AttendanceValidator.sanitizeSubmissionData(submissionData);

      console.log('📝 Submitting sanitized attendance data:', submissionData);

      await onSubmit(submissionData);
      
      // Clear form on successful submission
      setTopicTaught('');
      setSessionNotes('');
      setErrors([]);
      setWarnings([]);
    } catch (error: any) {
      setErrors([error.message || 'Failed to submit attendance']);
    }
  };

  const canSubmit = unmarkedStudents === 0 && topicTaught.trim() && !isSubmitting;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Submit Attendance
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{presentStudents}</div>
            <div className="text-xs text-muted-foreground">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{absentStudents}</div>
            <div className="text-xs text-muted-foreground">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{unmarkedStudents}</div>
            <div className="text-xs text-muted-foreground">Unmarked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </div>

        {/* Session Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Session Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{timeSlot.section?.name || 'Section'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{timeSlot.room?.roomString || 'Room'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Taught */}
          <div className="space-y-2">
            <label htmlFor="topicTaught" className="text-sm font-medium">
              Topic Taught <span className="text-red-500">*</span>
            </label>
            <Input
              id="topicTaught"
              placeholder="Enter the topic/subject covered in this session"
              value={topicTaught}
              onChange={(e) => setTopicTaught(e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>What was taught in this session?</span>
              <span>{topicTaught.length}/200</span>
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <label htmlFor="sessionNotes" className="text-sm font-medium">
              Session Notes (Optional)
            </label>
            <Textarea
              id="sessionNotes"
              placeholder="Add any additional notes about the session (e.g., activities conducted, student participation, etc.)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
              className="min-h-[100px]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Additional information about the session</span>
              <span>{sessionNotes.length}/1000</span>
            </div>
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Warnings */}
          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Warnings:</strong>
                  {warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Status */}
          {unmarkedStudents > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please mark attendance for all {unmarkedStudents} remaining student(s) before submitting.
              </AlertDescription>
            </Alert>
          )}

          {unmarkedStudents === 0 && totalStudents > 0 && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                All students have been marked. Ready to submit attendance!
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Attendance
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                // Save as draft functionality could be added here
                console.log('Save as draft');
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>

          {/* Submission Summary */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            Submitting attendance for {totalStudents} students • {presentStudents} present, {absentStudents} absent
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
