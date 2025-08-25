// 🚀 CRT Portal WebSocket Service - FIXED
// Integrates with your WebSocket implementation

import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketEvent {
  event: string;
  data: any;
  timestamp: string;
  facultyId?: string;
  sectionId?: string;
}

export interface FacultySessionEvent {
  event: 'faculty_session_started' | 'faculty_session_ended' | 'faculty_session_updated' | 'faculty_next_session';
  data: {
    sessionId: string;
    sectionName: string;
    startTime: string;
    endTime: string;
    room: string;
    timeRemaining?: number;
    timeUntilStart?: number;
  };
}

export interface AttendanceEvent {
  event: 'attendance_session_started' | 'student_marked_present' | 'attendance_session_completed' | 'attendance_stats_updated';
  data: {
    sessionId: string;
    sectionId: string;
    studentId?: string;
    presentCount?: number;
    totalStudents?: number;
    attendancePercentage?: number;
  };
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private subscriptions: Map<string, any> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  // WebSocket connection URLs from your implementation
  private readonly WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';
  private readonly WS_NATIVE_URL = process.env.NEXT_PUBLIC_WS_NATIVE_URL || 'ws://localhost:8080/ws-native';

  constructor() {
    this.setupClient();
  }

  private setupClient() {
    this.client = new Client({
      // Use SockJS for better compatibility (matches your implementation)
      webSocketFactory: () => new SockJS(this.WS_URL),
      
      // Fallback to native WebSocket if needed
      // webSocketFactory: () => new WebSocket(this.WS_NATIVE_URL),
      
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 WebSocket:', str);
        }
      },
      
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame) => {
        console.log('✅ WebSocket Connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_established', { connected: true });
      },
      
      onDisconnect: (frame) => {
        console.log('❌ WebSocket Disconnected:', frame);
        this.isConnected = false;
        this.emit('connection_lost', { connected: false });
      },
      
      onStompError: (frame) => {
        console.error('🚨 WebSocket STOMP Error:', frame);
        this.handleReconnect();
      },
      
      onWebSocketError: (error) => {
        console.error('🚨 WebSocket Error:', error);
        this.handleReconnect();
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('connection_failed', { error: 'Max reconnection attempts reached' });
    }
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      if (!this.client) {
        this.setupClient();
      }

      // Set up one-time connection handlers
      const originalOnConnect = this.client!.onConnect;
      const originalOnStompError = this.client!.onStompError;

      this.client!.onConnect = (frame) => {
        // Call original handler
        if (originalOnConnect) {
          originalOnConnect(frame);
        }
        resolve();
      };

      this.client!.onStompError = (frame) => {
        // Call original handler
        if (originalOnStompError) {
          originalOnStompError(frame);
        }
        reject(new Error(`STOMP Error: ${frame.headers?.message || 'Connection failed'}`));
      };

      // Handle WebSocket errors
      this.client!.onWebSocketError = (error) => {
        console.error('🚨 WebSocket connection error:', error);
        reject(new Error(`WebSocket Error: ${error}`));
      };
      
      try {
        this.client!.activate();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  // Join faculty personal room (matches your /app/faculty/join endpoint)
  joinFacultyRoom(facultyId: string) {
    if (!this.isConnected || !this.client) {
      console.warn('⚠️ WebSocket not connected, cannot join faculty room');
      return;
    }

    console.log('🏠 Joining faculty room:', facultyId);
    
    // Send join message to your /app/faculty/join endpoint
    this.client.publish({
      destination: '/app/faculty/join',
      body: JSON.stringify({ facultyId })
    });

    // Subscribe to personal faculty updates
    this.subscribeToTopic(`/user/queue/messages`, (message) => {
      const event: WebSocketEvent = JSON.parse(message.body);
      console.log('📨 Faculty event received:', event);
      this.emit(event.event, event.data);
    });

    // Subscribe to faculty-specific topic
    this.subscribeToTopic(`/topic/faculty_${facultyId}`, (message) => {
      const event: WebSocketEvent = JSON.parse(message.body);
      console.log('📨 Faculty-specific event:', event);
      this.emit(event.event, event.data);
    });
  }

  // Join attendance session (matches your /app/attendance/join endpoint)
  joinAttendanceSession(sessionId: string, sectionId: string) {
    if (!this.isConnected || !this.client) {
      console.warn('⚠️ WebSocket not connected, cannot join attendance session');
      return;
    }

    console.log('📝 Joining attendance session:', sessionId);
    
    this.client.publish({
      destination: '/app/attendance/join',
      body: JSON.stringify({ sessionId, sectionId })
    });

    // Subscribe to section-specific attendance updates
    this.subscribeToTopic(`/topic/section_${sectionId}`, (message) => {
      const event: AttendanceEvent = JSON.parse(message.body);
      console.log('📊 Attendance event received:', event);
      this.emit(event.event, event.data);
    });
  }

  // Subscribe to admin dashboard updates
  subscribeToAdminDashboard() {
    this.subscribeToTopic('/topic/admin_dashboard', (message) => {
      const event: WebSocketEvent = JSON.parse(message.body);
      console.log('📊 Admin dashboard event:', event);
      this.emit(event.event, event.data);
    });
  }

  // Subscribe to system alerts
  subscribeToSystemAlerts() {
    this.subscribeToTopic('/topic/system_alerts', (message) => {
      const event: WebSocketEvent = JSON.parse(message.body);
      console.log('🚨 System alert:', event);
      this.emit(event.event, event.data);
    });
  }

  // Send heartbeat ping (matches your /app/ping endpoint)
  sendHeartbeat() {
    if (this.isConnected && this.client) {
      this.client.publish({
        destination: '/app/ping',
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      });
    }
  }

  // Generic topic subscription
  private subscribeToTopic(topic: string, callback: (message: IMessage) => void) {
    if (!this.client || !this.isConnected) {
      console.warn(`⚠️ Cannot subscribe to ${topic} - not connected`);
      return;
    }

    if (this.subscriptions.has(topic)) {
      console.log(`📡 Already subscribed to ${topic}`);
      return;
    }

    const subscription = this.client.subscribe(topic, callback);
    this.subscriptions.set(topic, subscription);
    console.log(`📡 Subscribed to ${topic}`);
  }

  // Event handling system
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): string {
    return this.isConnected ? 'Connected' : 'Disconnected';
  }

  // Cleanup method
  cleanup() {
    this.eventHandlers.clear();
    this.disconnect();
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
