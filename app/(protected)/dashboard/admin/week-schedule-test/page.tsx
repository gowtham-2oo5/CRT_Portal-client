"use client";

import { WeekScheduleView } from "@/components/schedule/calendar/week-schedule-view";

export default function WeekScheduleTestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Week Schedule Test</h1>
        <p className="text-muted-foreground">
          Testing the new day-specific week schedule functionality
        </p>
      </div>
      
      <WeekScheduleView
        sectionId="test-section-1"
        roomId="test-room-1"
        sectionName="Test Section A"
        roomName="Room 101"
        onScheduleUpdate={() => {
          console.log("Schedule updated");
        }}
      />
    </div>
  );
}
