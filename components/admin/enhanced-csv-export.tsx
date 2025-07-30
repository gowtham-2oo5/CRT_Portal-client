"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { downloadCSV, generateFilename } from "@/lib/utils/csv-export";
import { Download, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportFilters {
  dateRange?: { start: string; end: string };
  department?: string;
  status?: string;
  [key: string]: any;
}

interface ExportProgress {
  current: number;
  total: number;
  status: 'idle' | 'preparing' | 'exporting' | 'complete' | 'error';
  message?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
}

interface EnhancedCSVExportProps<T extends Record<string, any>> {
  // Core functionality
  fetchData: (filters?: ExportFilters) => Promise<T[]>;
  headers: { key: keyof T; label: string }[];
  filenamePrefix: string;
  
  // Enhanced features
  validateData?: (data: T[]) => ValidationResult;
  transformData?: (data: T[]) => T[];
  chunkSize?: number; // For large datasets
  maxRecords?: number; // Safety limit
  
  // Filtering
  filters?: ExportFilters;
  showFilters?: boolean;
  
  // UI customization
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  
  // Progress tracking
  showProgress?: boolean;
  
  // Callbacks
  onExportStart?: () => void;
  onExportComplete?: (recordCount: number) => void;
  onExportError?: (error: Error) => void;
}

export function EnhancedCSVExport<T extends Record<string, any>>({
  fetchData,
  headers,
  filenamePrefix,
  validateData,
  transformData,
  chunkSize = 1000,
  maxRecords = 10000,
  filters,
  showFilters = false,
  buttonText = "Export CSV",
  variant = "outline",
  size = "default",
  disabled = false,
  showProgress = false,
  onExportStart,
  onExportComplete,
  onExportError,
}: EnhancedCSVExportProps<T>) {
  const [progress, setProgress] = useState<ExportProgress>({
    current: 0,
    total: 0,
    status: 'idle'
  });

  const handleExport = async () => {
    if (progress.status === 'exporting') return;
    
    try {
      setProgress({ current: 0, total: 0, status: 'preparing', message: 'Preparing export...' });
      onExportStart?.();

      // Fetch data
      const rawData = await fetchData(filters);
      
      if (!rawData || rawData.length === 0) {
        toast.warning("No data found to export");
        setProgress({ current: 0, total: 0, status: 'idle' });
        return;
      }

      // Check record limit
      if (rawData.length > maxRecords) {
        toast.error(`Export limit exceeded. Maximum ${maxRecords} records allowed.`);
        setProgress({ current: 0, total: 0, status: 'error' });
        return;
      }

      // Validate data if validator provided
      if (validateData) {
        const validation = validateData(rawData);
        if (!validation.isValid) {
          toast.error(`Data validation failed: ${validation.errors.join(', ')}`);
          setProgress({ current: 0, total: 0, status: 'error' });
          return;
        }
        if (validation.warnings.length > 0) {
          toast.warning(`Warnings: ${validation.warnings.join(', ')}`);
        }
      }

      setProgress({ 
        current: 0, 
        total: rawData.length, 
        status: 'exporting',
        message: 'Processing data...'
      });

      // Transform data if transformer provided
      const processedData = transformData ? transformData(rawData) : rawData;

      // Simulate progress for large datasets
      if (showProgress && processedData.length > chunkSize) {
        for (let i = 0; i < processedData.length; i += chunkSize) {
          setProgress(prev => ({
            ...prev,
            current: Math.min(i + chunkSize, processedData.length),
            message: `Processing ${Math.min(i + chunkSize, processedData.length)} of ${processedData.length} records...`
          }));
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Generate filename and download
      const filename = generateFilename(filenamePrefix);
      downloadCSV(processedData, filename, headers);
      
      setProgress({ 
        current: processedData.length, 
        total: processedData.length, 
        status: 'complete',
        message: 'Export completed successfully!'
      });

      toast.success(`${processedData.length} records exported successfully`);
      onExportComplete?.(processedData.length);

      // Reset progress after delay
      setTimeout(() => {
        setProgress({ current: 0, total: 0, status: 'idle' });
      }, 2000);

    } catch (error) {
      console.error("Export error:", error);
      const errorMessage = error instanceof Error ? error.message : "Export failed";
      toast.error(errorMessage);
      setProgress({ current: 0, total: 0, status: 'error', message: errorMessage });
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  const isExporting = progress.status === 'preparing' || progress.status === 'exporting';
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={isExporting || disabled}
      >
        {progress.status === 'error' ? (
          <AlertCircle className="h-4 w-4 mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? "Exporting..." : buttonText}
      </Button>
      
      {showProgress && isExporting && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-xs text-muted-foreground">
            {progress.message}
          </p>
        </div>
      )}
    </div>
  );
}
