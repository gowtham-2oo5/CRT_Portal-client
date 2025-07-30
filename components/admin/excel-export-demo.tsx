"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, CheckCircle, Star, Zap } from "lucide-react";

export function ExcelExportDemo() {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-green-600" />
          <CardTitle className="text-green-800">Enhanced Excel Export</CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            New Feature
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Professional Excel exports with advanced formatting and multiple sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Excel Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Professional formatting with colors and borders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Auto-sized columns for optimal viewing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Summary sections with key statistics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Company branding and timestamps
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Multiple sheets support
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Export Options
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Choose between Excel (.xlsx) or CSV
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Progress tracking for large datasets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Data validation before export
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Automatic data transformation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Error handling and user feedback
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>💡 Pro Tip:</strong> Excel exports include formatted headers, alternating row colors, 
            summary statistics, and are optimized for printing and sharing with stakeholders.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
