"use client";

import { UserManagement } from "@/components/admin/user-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader 
        title="User Management" 
        description="Manage admin and faculty user accounts"
      />
      <UserManagement />
    </div>
  );
}
