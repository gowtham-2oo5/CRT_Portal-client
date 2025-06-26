'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth/auth-guard';

export function FacultyHeader() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and current time */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CRT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Faculty Portal</h1>
            </div>
          </div>

          {/* Current Date & Time */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="text-xs">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Right side - User info and controls */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-muted-foreground text-xs">Faculty</div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'F'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Mobile date/time */}
      <div className="md:hidden mt-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{formatDate(currentTime)}</span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
    </header>
  );
}
