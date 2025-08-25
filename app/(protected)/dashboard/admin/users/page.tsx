"use client";

import { UserManagement } from "@/components/shared/forms/user-management";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <UserManagement />
    </div>
  );
}
