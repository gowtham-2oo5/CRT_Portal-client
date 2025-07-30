"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { downloadCSV } from "@/lib/utils/csv-export";
import { exportToSimpleExcel, SimpleExcelColumn } from "@/lib/utils/simple-excel-export";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type ExportFormat = 'csv' | 'excel';

interface MultiFormatExportProps<T extends Record<string, any>> {
  // Data fetching
  fetchData: () => Promise<T[]>;
  
  // Column configuration
  columns: {
    key: keyof T;
    label: string;
    width?: number;
    type?: 'string' | 'number' | 'date' | 'boolean';
    format?: string;
  }[];
  
  // File naming
  filenamePrefix: string;
  
  // Excel-specific options
  excelOptions?: {
    title?: string;
    subtitle?: string;
    showSummary?: boolean;
    summaryType?: 'faculty' | 'attendance' | 'absentees';
    companyInfo?: {
      name: string;
      address?: string;
    };
  };
  
  // UI customization
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  
  // Progress tracking
  showProgress?: boolean;
  
  // Data transformation
  transformData?: (data: T[]) => T[];
  
  // Callbacks
  onExportStart?: (format: ExportFormat) => void;
  onExportComplete?: (format: ExportFormat, recordCount: number) => void;
  onExportError?: (format: ExportFormat, error: Error) => void;
}

export function MultiFormatExport<T extends Record<string, any>>({
  fetchData,
  columns,
  filenamePrefix,
  excelOptions,
  buttonText = "Export Data",
  variant = "outline",
  size = "default",
  disabled = false,
  showProgress = false,
  transformData,
  onExportStart,
  onExportComplete,
  onExportError,
}: MultiFormatExportProps<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setCurrentFormat(format);
      setExportProgress(0);
      onExportStart?.(format);

      // Fetch data
      setExportProgress(20);
      const rawData = await fetchData();
      
      console.log("MultiFormatExport - Raw data:", rawData);
      console.log("MultiFormatExport - Raw data type:", typeof rawData);
      console.log("MultiFormatExport - Is array?", Array.isArray(rawData));
      
      if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
        toast.warning("No data found to export");
        return;
      }

      // Transform data if needed
      setExportProgress(40);
      console.log("MultiFormatExport - About to transform data:", rawData);
      const processedData = transformData ? transformData(rawData) : rawData;
      console.log("MultiFormatExport - Processed data:", processedData);

      if (format === 'csv') {
        await exportAsCSV(processedData);
      } else {
        await exportAsExcel(processedData);
      }

      setExportProgress(100);
      toast.success(`${processedData.length} records exported as ${format.toUpperCase()}`);
      onExportComplete?.(format, processedData.length);

    } catch (error) {
      console.error(`${format} export failed:`, error);
      const errorMessage = error instanceof Error ? error.message : `${format} export failed`;
      toast.error(errorMessage);
      onExportError?.(format, error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsExporting(false);
      setCurrentFormat(null);
      setExportProgress(0);
    }
  };

  const exportAsCSV = async (data: T[]) => {
    console.log("exportAsCSV - Received data:", data);
    console.log("exportAsCSV - Data type:", typeof data);
    console.log("exportAsCSV - Is array?", Array.isArray(data));
    
    setExportProgress(60);
    const csvHeaders = columns.map(col => ({
      key: col.key,
      label: col.label,
    }));
    
    setExportProgress(80);
    const filename = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}`;
    
    // Ensure data is an array before passing to downloadCSV
    if (!Array.isArray(data)) {
      throw new Error(`CSV export expects an array, but received ${typeof data}`);
    }
    
    downloadCSV(data, filename, csvHeaders);
  };

  const exportAsExcel = async (data: T[]) => {
    console.log("exportAsExcel - Received data:", data);
    console.log("exportAsExcel - Data type:", typeof data);
    console.log("exportAsExcel - Is array?", Array.isArray(data));
    
    setExportProgress(60);
    
    // Ensure data is an array before processing
    if (!Array.isArray(data)) {
      throw new Error(`Excel export expects an array, but received ${typeof data}`);
    }
    
    const excelColumns: SimpleExcelColumn[] = columns.map(col => ({
      key: String(col.key),
      label: col.label,
      width: col.width,
    }));

    setExportProgress(80);
    
    exportToSimpleExcel(data, excelColumns, {
      filename: filenamePrefix,
      title: excelOptions?.title || `${filenamePrefix.replace(/_/g, ' ').toUpperCase()} Report`,
      includeTimestamp: true,
      sheetName: 'Export Data'
    });
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isExporting || disabled}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? `Exporting ${currentFormat?.toUpperCase()}...` : buttonText}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            <div className="flex flex-col">
              <span>Export as Excel</span>
              <span className="text-xs text-muted-foreground">
                Formatted spreadsheet with styling
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            <div className="flex flex-col">
              <span>Export as CSV</span>
              <span className="text-xs text-muted-foreground">
                Simple comma-separated values
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showProgress && isExporting && (
        <div className="space-y-1">
          <Progress value={exportProgress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Exporting as {currentFormat?.toUpperCase()}... {exportProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
