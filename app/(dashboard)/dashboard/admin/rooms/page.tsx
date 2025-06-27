"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Room Management" 
        description="Manage classrooms and training facilities"
      />
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Room Management System</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
