"use client";

import { SmartScheduleGrid } from "@/components/schedule/calendar/smart-schedule-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Sparkles, Clock, Grid3X3 } from "lucide-react";

export default function SmartScheduleDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            Smart Schedule Grid Demo
          </h1>
          <p className="text-muted-foreground mt-1">
            Experience the new streamlined UX for time slot management
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          New UX Design
        </Badge>
      </div>

      {/* UX Improvements Alert */}
      <Alert>
        <Grid3X3 className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">🎉 UX Improvements:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>Auto-populated Room</strong> - No more manual room selection</li>
              <li>• <strong>Grid-based Interface</strong> - Visual time slot management</li>
              <li>• <strong>Quick Add</strong> - Click any empty cell to add a slot</li>
              <li>• <strong>Smart Defaults</strong> - Faculty and room pre-selected</li>
              <li>• <strong>One-click Copy</strong> - Duplicate slots across days</li>
              <li>• <strong>Inline Actions</strong> - Edit/delete without modals</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Smart Defaults
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Room and section are auto-populated from the schedule initialization. 
              Faculty defaults to the first available option.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-green-500" />
              Grid Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visual grid showing days vs time slots. Click any empty cell to 
              quickly add a time slot with minimal form fields.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Copy slots to other days, delete with confirmation, and edit 
              inline. No more heavy modal forms for simple operations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Grid */}
      <SmartScheduleGrid
        sectionId="demo-section"
        roomId="demo-room"
        sectionName="Demo Section A"
        roomName="Room R504"
        onScheduleUpdate={() => console.log("Schedule updated")}
      />
    </div>
  );
}
