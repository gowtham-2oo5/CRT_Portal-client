"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminBulkOperationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bulk Operations" 
        description="Import/export data and perform bulk operations"
      />
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Bulk Operations System</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
