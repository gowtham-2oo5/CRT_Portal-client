"use client";

import { PageHeader } from "@/components/dashboard/breadcrumb";
import { RoomManagement } from "@/components/admin/room-management";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <RoomManagement />
    </div>
  );
}
