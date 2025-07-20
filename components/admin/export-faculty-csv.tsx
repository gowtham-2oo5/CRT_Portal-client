"use client";

import { Button } from "@/components/ui/button";
import { UserManagementService } from "@/lib/api/services/user-management";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import { handleError, tryCatch } from "@/lib/utils/error-handler";
import { FacultyExportData } from "@/lib/types/export-types";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportFacultyCSVProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportFacultyCSV({ 
  variant = "outline", 
  size = "default" 
}: ExportFacultyCSVProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    const { data, error } = await tryCatch(
      async () => {
        // Get all faculty users
        const allUsers = await UserManagementService.getUsers({ role: "FACULTY" });
        
        if (allUsers.length === 0) {
          toast.warning("No faculty users found to export");
          return null;
        }

        // Define CSV headers with proper field order
        const headers = [
          { key: "id" as const, label: "ID" },
          { key: "employeeId" as const, label: "Employee ID" },
          { key: "name" as const, label: "Name" },
          { key: "email" as const, label: "Email" },
          { key: "phone" as const, label: "Phone" },
          { key: "department" as const, label: "Department" },
          { key: "isActive" as const, label: "Active Status" },
          { key: "lastLogin" as const, label: "Last Login" },
        ];

        // Format data for CSV
        const csvData: FacultyExportData[] = allUsers.map(user => ({
          ...user,
          isActive: user.isActive ? "Active" : "Inactive",
          lastLogin: user.lastLogin 
            ? new Date(user.lastLogin).toLocaleDateString() 
            : "Never"
        }));

        // Generate filename and download
        const filename = generateFilename("faculty_users");
        downloadCSV(csvData, filename, headers);
        
        toast.success(`${allUsers.length} faculty users exported successfully`);
        return allUsers.length;
      },
      "ExportFacultyCSV"
    );
    
    setIsExporting(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Faculty CSV"}
    </Button>
  );
}
