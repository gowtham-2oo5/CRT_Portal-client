// 🧪 WebSocket Connection Test Component
// Use this to test your WebSocket implementation

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  MessageSquare 
} from "lucide-react";
import webSocketService from "@/lib/websocket/websocket-service";

interface TestMessage {
  id: string;
  event: string;
  data: any;
  timestamp: string;
}

export function WebSocketTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testFacultyId] = useState('test-faculty-123'); // Test faculty ID

  useEffect(() => {
    // Set up WebSocket event listeners for testing
    const setupTestListeners = () => {
      // Connection events
      webSocketService.on('connection_established', () => {
        setIsConnected(true);
        setConnectionStatus('Connected');
        addMessage('connection_established', { status: 'Connected successfully' });
      });

      webSocketService.on('connection_lost', () => {
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        addMessage('connection_lost', { status: 'Connection lost' });
      });

      webSocketService.on('connection_failed', () => {
        setIsConnected(false);
        setConnectionStatus('Failed');
        addMessage('connection_failed', { status: 'Connection failed' });
      });

      // Faculty session events
      webSocketService.on('faculty_session_started', (data) => {
        addMessage('faculty_session_started', data);
      });

      webSocketService.on('faculty_session_ended', (data) => {
        addMessage('faculty_session_ended', data);
      });

      webSocketService.on('faculty_session_updated', (data) => {
        addMessage('faculty_session_updated', data);
      });

      webSocketService.on('faculty_next_session', (data) => {
        addMessage('faculty_next_session', data);
      });

      // Attendance events
      webSocketService.on('attendance_session_started', (data) => {
        addMessage('attendance_session_started', data);
      });

      webSocketService.on('student_marked_present', (data) => {
        addMessage('student_marked_present', data);
      });

      webSocketService.on('attendance_session_completed', (data) => {
        addMessage('attendance_session_completed', data);
      });

      webSocketService.on('attendance_stats_updated', (data) => {
        addMessage('attendance_stats_updated', data);
      });

      // Heartbeat
      webSocketService.on('pong', (data) => {
        addMessage('pong', data);
      });

      // System events
      webSocketService.on('system_alert', (data) => {
        addMessage('system_alert', data);
      });

      webSocketService.on('dashboard_updated', (data) => {
        addMessage('dashboard_updated', data);
      });
    };

    setupTestListeners();

    return () => {
      webSocketService.cleanup();
    };
  }, []);

  const addMessage = (event: string, data: any) => {
    const message: TestMessage = {
      id: Date.now().toString(),
      event,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [message, ...prev.slice(0, 19)]); // Keep last 20 messages
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await webSocketService.connect();
      setIsConnected(true);
      setConnectionStatus('Connected');
      
      // Join faculty room for testing
      webSocketService.joinFacultyRoom(testFacultyId);
      
      addMessage('manual_connect', { action: 'Connected and joined faculty room' });
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('Failed');
      addMessage('manual_connect_error', { error: error.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    webSocketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('Disconnected');
    addMessage('manual_disconnect', { action: 'Manually disconnected' });
  };

  const handleSendHeartbeat = () => {
    webSocketService.sendHeartbeat();
    addMessage('manual_ping', { action: 'Heartbeat sent' });
  };

  const handleJoinFacultyRoom = () => {
    webSocketService.joinFacultyRoom(testFacultyId);
    addMessage('manual_join_faculty', { facultyId: testFacultyId });
  };

  const handleJoinAttendanceSession = () => {
    const testSessionId = 'test-session-456';
    const testSectionId = 'test-section-789';
    webSocketService.joinAttendanceSession(testSessionId, testSectionId);
    addMessage('manual_join_attendance', { sessionId: testSessionId, sectionId: testSectionId });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getEventBadgeColor = (event: string) => {
    if (event.includes('connection')) return 'bg-blue-100 text-blue-800';
    if (event.includes('faculty_session')) return 'bg-green-100 text-green-800';
    if (event.includes('attendance')) return 'bg-purple-100 text-purple-800';
    if (event.includes('pong') || event.includes('ping')) return 'bg-yellow-100 text-yellow-800';
    if (event.includes('system') || event.includes('alert')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            WebSocket Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              >
                {connectionStatus}
              </Badge>
              <span className="text-sm text-muted-foreground">
                WebSocket URL: ws://localhost:8080/ws
              </span>
            </div>
            <div className="flex gap-2">
              {!isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  size="sm"
                >
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Connect
                </Button>
              ) : (
                <Button 
                  onClick={handleDisconnect} 
                  variant="outline"
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          {/* Test Actions */}
          {isConnected && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={handleSendHeartbeat} variant="outline" size="sm">
                💓 Send Ping
              </Button>
              <Button onClick={handleJoinFacultyRoom} variant="outline" size="sm">
                🏠 Join Faculty Room
              </Button>
              <Button onClick={handleJoinAttendanceSession} variant="outline" size="sm">
                📝 Join Attendance
              </Button>
              <Button onClick={clearMessages} variant="outline" size="sm">
                🗑️ Clear Messages
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Make sure your WebSocket server is running on localhost:8080</li>
            <li>Click "Connect" to establish WebSocket connection</li>
            <li>Use test buttons to trigger different WebSocket events</li>
            <li>Watch the message log below for real-time events</li>
            <li>Test faculty session events from your server admin panel</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Message Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WebSocket Messages ({messages.length})
            </span>
            {messages.length > 0 && (
              <Button onClick={clearMessages} variant="outline" size="sm">
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No WebSocket messages received yet</p>
              <p className="text-sm">Connect and trigger some events to see messages here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0">
                    {message.event.includes('error') || message.event.includes('failed') ? (
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getEventBadgeColor(message.event)}`}
                      >
                        {message.event}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                      </span>
                    </div>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
