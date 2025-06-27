"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        description="Configure system preferences and global settings"
      />
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">System Settings</h2>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
