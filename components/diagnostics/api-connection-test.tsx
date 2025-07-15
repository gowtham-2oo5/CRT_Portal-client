// 🔧 API Connection Diagnostic Tool
// Test API connectivity and debug network issues

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Server,
  Globe
} from "lucide-react";
import { publicApi, createClientSecuredApi } from "@/lib/api/client";

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'testing';
  message: string;
  responseTime?: number;
  statusCode?: number;
  error?: any;
}

export function ApiConnectionTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

  const updateTestResult = (endpoint: string, result: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.endpoint === endpoint);
      if (existing) {
        return prev.map(r => r.endpoint === endpoint ? { ...r, ...result } : r);
      } else {
        return [...prev, { endpoint, status: 'testing', message: '', ...result }];
      }
    });
  };

  const testEndpoint = async (endpoint: string, description: string, useAuth = false) => {
    const startTime = Date.now();
    updateTestResult(endpoint, { status: 'testing', message: `Testing ${description}...` });

    try {
      let response;
      
      if (useAuth) {
        // Test with authentication
        const token = sessionStorage.getItem('auth-token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const api = createClientSecuredApi(token);
        response = await api.get(endpoint);
      } else {
        // Test without authentication
        response = await publicApi.get(endpoint);
      }

      const responseTime = Date.now() - startTime;
      
      updateTestResult(endpoint, {
        status: 'success',
        message: `✅ ${description} - OK`,
        responseTime,
        statusCode: response.status
      });

      return true;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      updateTestResult(endpoint, {
        status: 'error',
        message: `❌ ${description} - ${error.message}`,
        responseTime,
        statusCode: error.response?.status || 0,
        error: error
      });

      return false;
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);
    setServerStatus('unknown');

    console.log('🔧 Starting API diagnostics...');

    // Test 1: Basic server connectivity
    const serverOnline = await testEndpoint('/', 'Server Health Check');
    setServerStatus(serverOnline ? 'online' : 'offline');

    // Test 2: Public endpoints
    await testEndpoint('/health', 'Health Endpoint');
    
    // Test 3: Auth endpoints
    await testEndpoint('/auth/status', 'Auth Status');

    // Test 4: Admin endpoints (with auth)
    await testEndpoint('/admin/dashboard/metrics', 'Admin Dashboard Metrics', true);
    await testEndpoint('/admin/dashboard/recent-actions?limit=5', 'Admin Recent Actions', true);

    // Test 5: Faculty endpoints (with auth)
    const userId = sessionStorage.getItem('user-id') || 'test-user-id';
    await testEndpoint(`/faculty/dashboard?id=${userId}`, 'Faculty Dashboard', true);
    await testEndpoint(`/faculty/current-session?id=${userId}`, 'Faculty Current Session', true);

    // Test 6: WebSocket connectivity
    await testWebSocketConnection();

    setIsRunning(false);
    console.log('🔧 API diagnostics completed');
  };

  const testWebSocketConnection = async () => {
    const wsUrl = 'ws://localhost:8080/ws';
    updateTestResult('websocket', { status: 'testing', message: 'Testing WebSocket connection...' });

    try {
      // Simple WebSocket connection test
      const ws = new WebSocket('ws://localhost:8080/ws-native');
      
      const timeout = setTimeout(() => {
        ws.close();
        updateTestResult('websocket', {
          status: 'error',
          message: '❌ WebSocket - Connection timeout'
        });
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        updateTestResult('websocket', {
          status: 'success',
          message: '✅ WebSocket - Connection successful'
        });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        updateTestResult('websocket', {
          status: 'error',
          message: '❌ WebSocket - Connection failed'
        });
      };

    } catch (error: any) {
      updateTestResult('websocket', {
        status: 'error',
        message: `❌ WebSocket - ${error.message}`
      });
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default: return <Globe className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Server Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            API Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className={
                  serverStatus === 'online' ? 'bg-green-100 text-green-800' :
                  serverStatus === 'offline' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {serverStatus === 'online' ? (
                  <><Wifi className="h-3 w-3 mr-1" /> Online</>
                ) : serverStatus === 'offline' ? (
                  <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
                ) : (
                  <><Globe className="h-3 w-3 mr-1" /> Unknown</>
                )}
              </Badge>
              <span className="text-sm text-muted-foreground">
                API Base URL: {API_BASE_URL}
              </span>
            </div>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Common Issues & Solutions:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>ERR_NETWORK (Status 0):</strong> Backend server is not running on localhost:8080</li>
            <li><strong>404 Not Found:</strong> API endpoint doesn't exist on server</li>
            <li><strong>401 Unauthorized:</strong> Authentication token is missing or invalid</li>
            <li><strong>CORS Error:</strong> Server needs to allow requests from localhost:3000</li>
            <li><strong>Timeout:</strong> Server is running but responding slowly</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Diagnostic Results</span>
              <Badge variant="outline">
                {testResults.filter(r => r.status === 'success').length} / {testResults.length} Passed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium text-sm">
                        {result.endpoint}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.responseTime && (
                      <span className="text-xs text-muted-foreground">
                        {result.responseTime}ms
                      </span>
                    )}
                    {result.statusCode !== undefined && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(result.status)}`}
                      >
                        {result.statusCode}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {testResults.some(r => r.status === 'error') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults
                .filter(r => r.status === 'error')
                .map((result, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-800 mb-2">
                      {result.endpoint}
                    </div>
                    {result.error && (
                      <pre className="text-xs bg-red-100 p-2 rounded overflow-x-auto text-red-700">
                        {JSON.stringify({
                          message: result.error.message,
                          code: result.error.code,
                          status: result.error.response?.status,
                          statusText: result.error.response?.statusText
                        }, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
