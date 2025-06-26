'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Check, 
  FileBarChart, 
  Clock,
  LogOut
} from 'lucide-react';
import { ClientAuth } from '@/lib/auth/client';

const facultyNavigation = [
  { name: 'Dashboard', href: '/dashboard/faculty', icon: LayoutDashboard },
  { name: 'Timetable', href: '/faculty/timetable', icon: Calendar },
  { name: 'Submit Attendance', href: '/faculty/attendance', icon: Check },
  { name: 'View Reports', href: '/faculty/reports', icon: FileBarChart },
];

export function FacultyNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await ClientAuth.logout();
  };

  return (
    <nav className="w-64 bg-card border-r border-border p-4 flex flex-col h-full">
      <div className="space-y-2 flex-1">
        {facultyNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard/faculty' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </nav>
  );
}
