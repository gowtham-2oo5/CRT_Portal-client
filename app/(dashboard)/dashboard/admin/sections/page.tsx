"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminSectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Section Management" 
        description="Organize students into sections and manage class groups"
      />
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Section Management System</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
