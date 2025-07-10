"use client";

import { UserManagement } from "@/components/admin/user-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">User Management</h1>
      </PageHeader>
      <UserManagement />
    </div>
  );
}
