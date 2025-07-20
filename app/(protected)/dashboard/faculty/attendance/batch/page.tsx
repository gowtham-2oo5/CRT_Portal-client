"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";
import { BatchAttendanceSelector } from "@/components/faculty/attendance/BatchAttendanceSelector";
import { useAuth } from "@/lib/auth/client";
import { useState } from "react";

export default function BatchAttendancePage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  return (
    <div className="space-y-6">
      <PageHeader />
      
      <div>
        <h1 className="text-3xl font-bold">Batch Attendance</h1>
        <p className="text-muted-foreground">
          Mark attendance for multiple consecutive time slots at once
        </p>
      </div>
      
      {user && (
        <BatchAttendanceSelector 
          facultyId={user.id} 
          date={date}
        />
      )}
    </div>
  );
}
