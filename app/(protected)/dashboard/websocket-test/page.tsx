"use client";

import { WebSocketTest } from "@/components/websocket/websocket-test";
import { WebSocketEventTester } from "@/components/websocket/websocket-event-tester";
import { PageHeader } from "@/components/dashboard/breadcrumb";

export default function WebSocketTestPage() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <h1 className="text-3xl font-bold">WebSocket Testing & Debugging</h1>
        <p className="text-muted-foreground">
          Test WebSocket connectivity and real-time events
        </p>
      </PageHeader>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <WebSocketTest />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Event Tester</h2>
          <WebSocketEventTester />
        </div>
      </div>
    </div>
  );
}
