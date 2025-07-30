"use client";

import { UserManagementService } from "@/lib/api/services/user-management";
import { MultiFormatExport } from "./multi-format-export";

interface ExportFacultyExcelProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function ExportFacultyExcel({
  variant = "outline",
  size = "default",
  disabled = false,
}: ExportFacultyExcelProps) {

  // Define columns for faculty export
  const columns = [
    { key: 'id' as const, label: 'ID', width: 15, type: 'string' as const },
    { key: 'employeeId' as const, label: 'Employee ID', width: 15, type: 'string' as const },
    { key: 'name' as const, label: 'Name', width: 25, type: 'string' as const },
    { key: 'email' as const, label: 'Email', width: 30, type: 'string' as const },
    { key: 'phone' as const, label: 'Phone', width: 15, type: 'string' as const },
    { key: 'department' as const, label: 'Department', width: 20, type: 'string' as const },
    { key: 'isActive' as const, label: 'Status', width: 12, type: 'string' as const },
    { key: 'lastLogin' as const, label: 'Last Login', width: 18, type: 'string' as const },
    { key: 'createdAt' as const, label: 'Created Date', width: 15, type: 'date' as const },
  ];

  // Function to fetch faculty data
  const fetchData = async () => {
    const allUsers = await UserManagementService.getUsers({ role: "FACULTY" });
    
    if (allUsers.length === 0) {
      throw new Error("No faculty users found to export");
    }

    return allUsers;
  };

  // Transform data for export
  const transformData = (data: any[]) => {
    return data.map(user => ({
      ...user,
      isActive: user.isActive ? "Active" : "Inactive",
      lastLogin: user.lastLogin 
        ? new Date(user.lastLogin).toLocaleDateString() 
        : "Never",
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      employeeId: user.employeeId || 'N/A',
      phone: user.phone || 'N/A',
      department: user.department || 'N/A',
    }));
  };

  return (
    <MultiFormatExport
      fetchData={fetchData}
      columns={columns}
      filenamePrefix="faculty_users"
      transformData={transformData}
      buttonText="Export Faculty"
      variant={variant}
      size={size}
      disabled={disabled}
      showProgress={true}
      excelOptions={{
        title: "Faculty Users Report",
        subtitle: `Complete list of faculty members as of ${new Date().toLocaleDateString()}`,
        showSummary: true,
        summaryType: "faculty",
        companyInfo: {
          name: "CRT Portal - User Management System",
          address: "Academic Institution",
        },
      }}
      onExportStart={(format) => {
        console.log(`Starting ${format} export for faculty users`);
      }}
      onExportComplete={(format, count) => {
        console.log(`${format} export completed: ${count} faculty records`);
      }}
      onExportError={(format, error) => {
        console.error(`Faculty ${format} export failed:`, error);
      }}
    />
  );
}
