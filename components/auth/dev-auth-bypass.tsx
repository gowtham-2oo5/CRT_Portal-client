"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Shield, GraduationCap } from 'lucide-react';
import type { User as UserType } from '@/lib/auth/types';

interface DevAuthBypassProps {
  onSelectUser: (user: UserType) => void;
}

const mockUsers: UserType[] = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@klu.ac.in',
    userId: 'FAC001',
    sub: 'faculty-001',
    role: 'FACULTY',
    isFirstLogin: false,
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@klu.ac.in',
    userId: 'FAC002',
    sub: 'faculty-002',
    role: 'FACULTY',
    isFirstLogin: true,
  },
  {
    name: 'Admin User',
    email: 'admin@klu.ac.in',
    userId: 'ADM001',
    sub: 'admin-001',
    role: 'ADMIN',
    isFirstLogin: false,
  },
];

export function DevAuthBypass({ onSelectUser }: DevAuthBypassProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            🚀 Development Mode
          </CardTitle>
          <p className="text-muted-foreground">
            Select a user to bypass authentication and test the UI
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <Card 
                key={user.userId}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        {user.role === 'FACULTY' ? (
                          <GraduationCap className="h-6 w-6 text-primary" />
                        ) : (
                          <Shield className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.userId}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant={user.role === 'FACULTY' ? 'default' : 'secondary'}
                      >
                        {user.role}
                      </Badge>
                      {user.isFirstLogin && (
                        <Badge variant="outline" className="text-xs">
                          First Login
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-600 dark:text-yellow-400">⚠️</div>
              <div className="text-sm">
                <div className="font-semibold text-yellow-800 dark:text-yellow-200">Development Mode Active</div>
                <div className="text-yellow-700 dark:text-yellow-300">
                  This bypass is only for testing the UI. Make sure to disable this in production!
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
