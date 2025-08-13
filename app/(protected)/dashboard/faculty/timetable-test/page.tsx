"use client";

import { FacultyTimetableView } from "@/components/faculty/faculty-timetable-view";

export default function FacultyTimetableTestPage() {
  return (
    <div className="container mx-auto py-6">
      <FacultyTimetableView
        facultyId="test-faculty-1"
        facultyName="Dr. John Doe"
        onBack={() => {
          console.log("Back to dashboard");
        }}
      />
    </div>
  );
}
