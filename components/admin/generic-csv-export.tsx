"use client";

import { Button } from "@/components/ui/button";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import { handleError, tryCatch } from "@/lib/utils/error-handler";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GenericCSVExportProps<T extends Record<string, any>> {
  // Function to fetch or prepare data
  fetchData: () => Promise<T[]>;
  
  // CSV headers configuration
  headers: { key: keyof T; label: string }[];
  
  // Filename prefix (will be combined with date)
  filenamePrefix: string;
  
  // Button text
  buttonText?: string;
  
  // Success message template (will be formatted with count)
  successMessage?: string;
  
  // Empty data message
  emptyDataMessage?: string;
  
  // Button styling
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  
  // Optional data transformation
  transformData?: (data: T[]) => T[];
  
  // Disabled state
  disabled?: boolean;
  
  // Context for error handling
  errorContext?: string;
}

export function GenericCSVExport<T extends Record<string, any>>({ 
  fetchData,
  headers,
  filenamePrefix,
  buttonText = "Export CSV",
  successMessage = "{count} records exported successfully",
  emptyDataMessage = "No data found to export",
  variant = "outline",
  size = "default",
  transformData,
  disabled = false,
  errorContext = "CSVExport"
}: GenericCSVExportProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    const { data, error } = await tryCatch(
      async () => {
        // Fetch data
        const rawData = await fetchData();
        
        if (!rawData || rawData.length === 0) {
          toast.warning(emptyDataMessage);
          return null;
        }

        // Apply transformation if provided
        const processedData = transformData ? transformData(rawData) : rawData;

        // Generate filename and download
        const filename = generateFilename(filenamePrefix);
        downloadCSV(processedData, filename, headers);
        
        // Show success message
        const formattedMessage = successMessage.replace("{count}", processedData.length.toString());
        toast.success(formattedMessage);
        
        return processedData.length;
      },
      errorContext
    );
    
    setIsExporting(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting || disabled}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : buttonText}
    </Button>
  );
}
