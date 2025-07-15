// 🧪 WebSocket Event Tester - Test real-time events manually

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Send, TestTube } from "lucide-react";
import webSocketService from "@/lib/websocket/websocket-service";

export function WebSocketEventTester() {
  const [eventType, setEventType] = useState<string>('faculty_session_started');
  const [sessionId, setSessionId] = useState('test-session-123');
  const [sectionName, setSectionName] = useState('SEC-14');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [room, setRoom] = useState('C425 (SEMINAR_HALL)');
  const [timeRemaining, setTimeRemaining] = useState(60);

  const eventTypes = [
    { value: 'faculty_session_started', label: 'Faculty Session Started' },
    { value: 'faculty_session_ended', label: 'Faculty Session Ended' },
    { value: 'faculty_session_updated', label: 'Faculty Session Updated' },
    { value: 'faculty_next_session', label: 'Faculty Next Session Warning' },
    { value: 'attendance_session_started', label: 'Attendance Session Started' },
    { value: 'student_marked_present', label: 'Student Marked Present' },
    { value: 'attendance_session_completed', label: 'Attendance Session Completed' },
    { value: 'attendance_stats_updated', label: 'Attendance Stats Updated' },
  ];

  const sendTestEvent = () => {
    const eventData = {
      sessionId,
      sectionName,
      startTime,
      endTime,
      room,
      timeRemaining: parseInt(timeRemaining.toString()),
      timeUntilStart: 15, // For next session warnings
      // Attendance specific data
      sectionId: 'test-section-456',
      studentId: 'test-student-789',
      presentCount: 25,
      totalStudents: 30,
      attendancePercentage: 83.3,
      todayCount: 3,
      weeklyCount: 12
    };

    console.log(`🧪 Sending test event: ${eventType}`, eventData);
    
    // Emit the event directly to test the handlers
    webSocketService.emit(eventType, eventData);
  };

  const sendServerMessage = () => {
    if (!webSocketService.isWebSocketConnected()) {
      alert('WebSocket is not connected. Please connect first.');
      return;
    }

    // This would simulate what your server should send
    const message = {
      event: eventType,
      data: {
        sessionId,
        sectionName,
        startTime,
        endTime,
        room,
        timeRemaining: parseInt(timeRemaining.toString())
      },
      timestamp: new Date().toISOString()
    };

    console.log('📤 Simulating server message:', message);
    
    // In a real scenario, your server would send this message
    // For testing, we'll emit it directly
    webSocketService.emit(eventType, message.data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            WebSocket Event Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Data Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="test-session-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionName">Section Name</Label>
              <Input
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="SEC-14"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="11:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="C425 (SEMINAR_HALL)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeRemaining">Time Remaining (minutes)</Label>
              <Input
                id="timeRemaining"
                type="number"
                value={timeRemaining}
                onChange={(e) => setTimeRemaining(parseInt(e.target.value) || 0)}
                placeholder="60"
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={sendTestEvent} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Send Test Event (Client-side)
            </Button>
            <Button onClick={sendServerMessage} variant="outline" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Simulate Server Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <TestTube className="h-4 w-4" />
        <AlertDescription>
          <strong>How to test WebSocket events:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li><strong>Client-side test:</strong> Click "Send Test Event" to trigger event handlers directly</li>
            <li><strong>Server simulation:</strong> Click "Simulate Server Message" to test as if server sent it</li>
            <li><strong>Real server test:</strong> Use your server admin panel to trigger actual events</li>
            <li><strong>Check console:</strong> Watch browser console for event logs</li>
            <li><strong>Watch dashboard:</strong> Go to faculty dashboard to see real-time updates</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Event Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Server Message Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Faculty Session Started:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`// Your server should send to: /user/queue/messages or /topic/faculty_{facultyId}
{
  "event": "faculty_session_started",
  "data": {
    "sessionId": "123",
    "sectionName": "SEC-14",
    "startTime": "10:00",
    "endTime": "11:00",
    "room": "C425 (SEMINAR_HALL)",
    "timeRemaining": 60
  },
  "timestamp": "2025-07-15T10:00:00Z"
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Attendance Stats Updated:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`// Your server should send to: /topic/section_{sectionId}
{
  "event": "attendance_stats_updated",
  "data": {
    "sectionId": "456",
    "presentCount": 25,
    "totalStudents": 30,
    "attendancePercentage": 83.3,
    "todayCount": 3,
    "weeklyCount": 12
  },
  "timestamp": "2025-07-15T10:30:00Z"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
