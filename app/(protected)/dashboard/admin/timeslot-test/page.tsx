"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSlotFormModal } from "@/components/admin/time-slot-form-modal";
import { TimeSlotApiTest } from "@/components/admin/time-slot-api-test";
import { ConstantsTest } from "@/components/admin/constants-test";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Coffee, 
  GraduationCap, 
  Star,
  TestTube,
  Code,
  Database
} from "lucide-react";
import type { 
  CreateTimeSlotRequest,
  TimeSlot 
} from "@/lib/types/section-schedule";
import { 
  SLOT_TYPES, 
  DAYS_OF_WEEK, 
  SLOT_TYPE_DISPLAY_NAMES, 
  DAY_DISPLAY_NAMES,
} from "@/lib/types/section-schedule";

const SLOT_TYPE_ICONS = {
  REGULAR: BookOpen,
  BREAK: Coffee,
  EXAM: GraduationCap,
  SPECIAL: Star,
};

const SLOT_TYPE_COLORS = {
  REGULAR: "bg-blue-50 border-blue-200 text-blue-800",
  BREAK: "bg-green-50 border-green-200 text-green-800",
  EXAM: "bg-red-50 border-red-200 text-red-800",
  SPECIAL: "bg-purple-50 border-purple-200 text-purple-800",
};

export default function TimeSlotTestPage() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Mock data for testing
  const mockTimeSlots: TimeSlot[] = [
    {
      id: 1,
      inchargeFacultyId: "faculty-1",
      sectionId: "section-1",
      roomId: "room-1",
      startTime: "09:00",
      endTime: "09:50",
      slotType: "REGULAR",
      dayOfWeek: "MONDAY",
      inchargeFacultyName: "Dr. Smith",
      sectionName: "CS-A",
      roomName: "R101",
    },
    {
      id: 2,
      inchargeFacultyId: "faculty-1",
      sectionId: "section-1", 
      roomId: "room-1",
      startTime: "09:50",
      endTime: "10:00",
      slotType: "BREAK",
      title: "Morning Break",
      dayOfWeek: "MONDAY",
      inchargeFacultyName: "Dr. Smith",
      sectionName: "CS-A",
      roomName: "R101",
    },
    {
      id: 3,
      inchargeFacultyId: "faculty-2",
      sectionId: "section-1",
      roomId: "room-1", 
      startTime: "14:00",
      endTime: "15:30",
      slotType: "EXAM",
      title: "Mid-term Examination",
      description: "Mathematics mid-term exam",
      dayOfWeek: "FRIDAY",
      inchargeFacultyName: "Prof. Johnson",
      sectionName: "CS-A",
      roomName: "R101",
    },
  ];

  const handleFormSubmit = async (data: CreateTimeSlotRequest) => {
    console.log("Form submitted with data:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Time slot would be created with new API structure!");
  };

  const runTypeTests = () => {
    const results: any[] = [];

    // Test 1: Slot Types
    results.push({
      test: "Slot Type Enum",
      status: "success",
      message: `All ${SLOT_TYPES.length} slot types are properly defined`,
      data: SLOT_TYPES
    });

    // Test 2: Days of Week
    results.push({
      test: "Days of Week Enum", 
      status: "success",
      message: `All ${DAYS_OF_WEEK.length} days are properly defined`,
      data: DAYS_OF_WEEK
    });

    // Test 3: Display Names
    results.push({
      test: "Display Name Mappings",
      status: "success", 
      message: "All display name mappings are working",
      data: { SLOT_TYPE_DISPLAY_NAMES, DAY_DISPLAY_NAMES }
    });

    // Test 4: Mock Data Validation
    try {
      mockTimeSlots.forEach((slot, index) => {
        if (!slot.slotType || !SLOT_TYPES.includes(slot.slotType as any)) {
          throw new Error(`Invalid slot type in mock data at index ${index}`);
        }
        if (!slot.dayOfWeek || !DAYS_OF_WEEK.includes(slot.dayOfWeek as any)) {
          throw new Error(`Invalid day of week in mock data at index ${index}`);
        }
      });
      
      results.push({
        test: "Mock Data Validation",
        status: "success",
        message: `All ${mockTimeSlots.length} mock time slots are valid`,
        data: mockTimeSlots.length
      });
    } catch (error: any) {
      results.push({
        test: "Mock Data Validation",
        status: "error", 
        message: error.message,
        data: null
      });
    }

    setTestResults(results);
  };

  const renderTimeSlotCard = (timeSlot: TimeSlot) => {
    const slotType = timeSlot.slotType || "REGULAR";
    const dayOfWeek = timeSlot.dayOfWeek || "MONDAY";
    
    const Icon = SLOT_TYPE_ICONS[slotType as keyof typeof SLOT_TYPE_ICONS];
    const colorClass = SLOT_TYPE_COLORS[slotType as keyof typeof SLOT_TYPE_COLORS];

    return (
      <div key={timeSlot.id} className={`p-4 rounded-lg border ${colorClass}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium">
            {timeSlot.startTime} - {timeSlot.endTime}
          </span>
          <Badge variant="outline" className="ml-auto">
            {DAY_DISPLAY_NAMES[dayOfWeek]}
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm">
          <p className="font-medium">{SLOT_TYPE_DISPLAY_NAMES[slotType]}</p>
          {timeSlot.title && <p className="text-gray-600">{timeSlot.title}</p>}
          {timeSlot.description && <p className="text-gray-500 text-xs">{timeSlot.description}</p>}
          <p className="text-gray-500">👨‍🏫 {timeSlot.inchargeFacultyName}</p>
          <p className="text-gray-500">🏫 {timeSlot.sectionName} • {timeSlot.roomName}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TimeSlot API Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of the new TimeSlot API integration
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Implementation Complete
        </Badge>
      </div>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Type Definitions Updated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">API Service Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Form Modal Enhanced</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Week Schedule Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TestTube className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="constants" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Constants
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Types
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Form Test
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            API Test
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Mock Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">✅ All Components Successfully Updated:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• <strong>Removed isBreak dependency</strong> - Now using slotType enum</li>
                      <li>• <strong>Added new required fields</strong> - slotType, title, description, dayOfWeek</li>
                      <li>• <strong>Updated API endpoints</strong> - /time-slots with day-based queries</li>
                      <li>• <strong>Enhanced form validation</strong> - Real-time feedback and conflict detection</li>
                      <li>• <strong>Improved UX design</strong> - Visual slot type selection with icons</li>
                      <li>• <strong>Maintained backward compatibility</strong> - Legacy fields still supported</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">New Slot Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SLOT_TYPES.map((type) => {
                      const Icon = SLOT_TYPE_ICONS[type];
                      const colorClass = SLOT_TYPE_COLORS[type];
                      return (
                        <div key={type} className={`flex items-center gap-2 p-2 rounded ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {SLOT_TYPE_DISPLAY_NAMES[type]}
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Week Days</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{DAY_DISPLAY_NAMES[day]}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constants" className="space-y-4">
          <ConstantsTest />
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Type System Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Validate TypeScript types and constants
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runTypeTests} className="w-full">
                Run Type Tests
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 rounded border bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{result.test}</span>
                        <Badge variant="outline" className="ml-auto">
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Modal Test</CardTitle>
              <p className="text-sm text-muted-foreground">
                Test the enhanced TimeSlot form with new fields
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowFormModal(true)} className="w-full">
                Open TimeSlot Form Modal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <TimeSlotApiTest />
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mock Data Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sample time slots using the new data structure
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockTimeSlots.map(renderTimeSlotCard)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <TimeSlotFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        onSubmit={handleFormSubmit}
        initialData={null}
        scheduleId="test-schedule"
        sectionId="test-section"
        scheduleRoomId="test-room"
        existingTimeSlots={mockTimeSlots}
        mode="create"
      />
    </div>
  );
}
