// 🎯 CRT Portal Attendance System - Export Buttons
// Created: 2025-07-15 | Phase 4 - Task 4.2

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import type { AttendanceFilters } from '@/lib/types/attendance';

interface ExportButtonsProps {
  onExport: (format: 'csv' | 'excel' | 'pdf', options?: ExportOptions) => Promise<void>;
  filters?: AttendanceFilters;
  dataCount?: number;
  className?: string;
}

interface ExportOptions {
  includeDetails?: boolean;
  includeAnalytics?: boolean;
  includeCharts?: boolean;
  dateRange?: string;
}

export function ExportButtons({
  onExport,
  filters,
  dataCount = 0,
  className = ""
}: ExportButtonsProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{
    format: string;
    timestamp: Date;
    success: boolean;
  } | null>(null);

  // Handle export with loading state
  const handleExport = async (format: 'csv' | 'excel' | 'pdf', options: ExportOptions = {}) => {
    try {
      setExportingFormat(format);
      
      toast.loading(`Preparing ${format.toUpperCase()} export...`, {
        id: `export-${format}`
      });

      await onExport(format, options);
      
      setLastExport({
        format: format.toUpperCase(),
        timestamp: new Date(),
        success: true
      });

      toast.success(`${format.toUpperCase()} exported successfully!`, {
        id: `export-${format}`,
        description: `Downloaded ${dataCount} records`
      });

    } catch (error: any) {
      console.error(`Export failed for ${format}:`, error);
      
      setLastExport({
        format: format.toUpperCase(),
        timestamp: new Date(),
        success: false
      });

      toast.error(`Failed to export ${format.toUpperCase()}`, {
        id: `export-${format}`,
        description: error.message || 'Please try again'
      });
    } finally {
      setExportingFormat(null);
    }
  };

  // Get active filters summary
  const getFiltersDisplay = () => {
    if (!filters) return null;
    
    const activeFilters = [];
    if (filters.startDate) activeFilters.push(`From: ${new Date(filters.startDate).toLocaleDateString()}`);
    if (filters.endDate) activeFilters.push(`To: ${new Date(filters.endDate).toLocaleDateString()}`);
    if (filters.sectionId) activeFilters.push('Section filtered');
    if (filters.facultyId) activeFilters.push('Faculty filtered');
    if (filters.attendanceThreshold) activeFilters.push(`Min: ${filters.attendanceThreshold}%`);
    
    return activeFilters;
  };

  const activeFilters = getFiltersDisplay();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
            {dataCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {dataCount} records
              </Badge>
            )}
          </CardTitle>

          {/* Last Export Status */}
          {lastExport && (
            <div className="flex items-center gap-2 text-sm">
              {lastExport.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-muted-foreground">
                Last: {lastExport.format} at {lastExport.timestamp.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilters && activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* CSV Export */}
          <Button
            variant="outline"
            onClick={() => handleExport('csv', { includeDetails: true })}
            disabled={exportingFormat !== null || dataCount === 0}
            className="flex items-center gap-2 h-auto p-4"
          >
            {exportingFormat === 'csv' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileText className="h-5 w-5 text-green-600" />
            )}
            <div className="text-left">
              <div className="font-medium">CSV Export</div>
              <div className="text-xs text-muted-foreground">
                Raw data for analysis
              </div>
            </div>
          </Button>

          {/* Excel Export */}
          <Button
            variant="outline"
            onClick={() => handleExport('excel', { 
              includeDetails: true, 
              includeAnalytics: true,
              includeCharts: true 
            })}
            disabled={exportingFormat !== null || dataCount === 0}
            className="flex items-center gap-2 h-auto p-4"
          >
            {exportingFormat === 'excel' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            )}
            <div className="text-left">
              <div className="font-medium">Excel Export</div>
              <div className="text-xs text-muted-foreground">
                With charts & analytics
              </div>
            </div>
          </Button>

          {/* PDF Export */}
          <Button
            variant="outline"
            onClick={() => handleExport('pdf', { 
              includeDetails: true, 
              includeAnalytics: true 
            })}
            disabled={exportingFormat !== null || dataCount === 0}
            className="flex items-center gap-2 h-auto p-4"
          >
            {exportingFormat === 'pdf' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileImage className="h-5 w-5 text-red-600" />
            )}
            <div className="text-left">
              <div className="font-medium">PDF Report</div>
              <div className="text-xs text-muted-foreground">
                Formatted report
              </div>
            </div>
          </Button>
        </div>

        {/* Advanced Export Options */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Advanced Export Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Summary Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('pdf', { includeAnalytics: true })}
              disabled={exportingFormat !== null || dataCount === 0}
              className="justify-start"
            >
              <FileImage className="h-4 w-4 mr-2 text-purple-600" />
              Summary Report (PDF)
            </Button>

            {/* Data Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('csv', { includeDetails: false })}
              disabled={exportingFormat !== null || dataCount === 0}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2 text-gray-600" />
              Data Only (CSV)
            </Button>

            {/* Analytics Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('excel', { 
                includeDetails: false, 
                includeAnalytics: true,
                includeCharts: true 
              })}
              disabled={exportingFormat !== null || dataCount === 0}
              className="justify-start"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-600" />
              Analytics Only (Excel)
            </Button>

            {/* Custom Range */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const dateRange = filters?.startDate && filters?.endDate 
                  ? `${filters.startDate}_to_${filters.endDate}`
                  : 'custom_range';
                
                handleExport('excel', { 
                  includeDetails: true, 
                  includeAnalytics: true,
                  dateRange 
                });
              }}
              disabled={exportingFormat !== null || dataCount === 0}
              className="justify-start"
            >
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Custom Range (Excel)
            </Button>
          </div>
        </div>

        {/* Export Status */}
        {dataCount === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available for export</p>
            <p className="text-xs">Apply filters or check your data source</p>
          </div>
        )}

        {exportingFormat && (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">
              Preparing {exportingFormat.toUpperCase()} export...
            </p>
            <p className="text-xs text-muted-foreground">
              This may take a few moments for large datasets
            </p>
          </div>
        )}

        {/* Export Tips */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h5 className="font-medium text-sm mb-2">Export Tips:</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• CSV: Best for data analysis in other tools</li>
            <li>• Excel: Includes charts and formatted analytics</li>
            <li>• PDF: Professional reports for sharing</li>
            <li>• Large datasets may take longer to process</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
