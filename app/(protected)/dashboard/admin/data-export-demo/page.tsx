"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  Users, 
  Calendar,
  Building,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DataExportDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            Multi-Section Schedule Export
          </h1>
          <p className="text-muted-foreground mt-1">
            Export all section schedules to a single Excel workbook with multiple sheets
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          New Feature
        </Badge>
      </div>

      {/* Feature Overview */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">🎉 New Excel Export Features:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>Multi-Sheet Workbook</strong> - Each section gets its own sheet</li>
              <li>• <strong>Overview Sheet</strong> - Summary statistics for all sections</li>
              <li>• <strong>Color-Coded Slots</strong> - Visual distinction for different slot types</li>
              <li>• <strong>Progress Tracking</strong> - Real-time export progress</li>
              <li>• <strong>Flexible Options</strong> - Include/exclude empty slots, metadata, etc.</li>
              <li>• <strong>Single Section Export</strong> - Export individual sections too</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              Multi-Sheet Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Each section gets its own worksheet in a single Excel workbook. 
              Perfect for comprehensive schedule management.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Overview sheet with statistics</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Individual section sheets</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Proper sheet naming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Schedule Grid Layout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Weekly schedule displayed in a clear grid format with days as rows 
              and time slots as columns.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Days as rows</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Time slots as columns</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Color-coded slot types</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Flexible Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Choose which sections to export, with options for individual 
              section exports or bulk operations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Select all/none options</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Individual section export</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Progress tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Export Options Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Content Options:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Include empty time slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Include metadata & summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Color-code slot types</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Custom filename</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Export Features:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Real-time progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Error handling & recovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Automatic file download</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Excel format (.xlsx)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Output Preview */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Sample Excel Output Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <div className="space-y-1">
              <div className="font-bold">📊 All_Sections_Schedule_2024-01-15.xlsx</div>
              <div className="ml-4">├── 📊 Overview (Summary statistics)</div>
              <div className="ml-4">├── 📅 Section A (Weekly schedule grid)</div>
              <div className="ml-4">├── 📅 Section B (Weekly schedule grid)</div>
              <div className="ml-4">├── 📅 Section C (Weekly schedule grid)</div>
              <div className="ml-4">└── 📅 ... (More sections)</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Overview Sheet:</strong> Contains summary statistics, section counts, and slot type distributions.</p>
            <p><strong>Section Sheets:</strong> Each contains a weekly grid with metadata, schedule data, and summary statistics.</p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Ready to Export Schedules?</h3>
              <p className="text-sm text-muted-foreground">
                Try the new multi-section Excel export feature
              </p>
            </div>
            
            <Link href="/dashboard/admin/data-export">
              <Button size="lg" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Go to Data Export
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
