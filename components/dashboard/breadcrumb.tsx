'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

// Route label mappings for better display names
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  admin: 'Admin',
  faculty: 'Faculty',
  users: 'User Management',
  students: 'Student Management',
  trainers: 'Trainer Management',
  attendance: 'Attendance',
  reports: 'Reports',
  timetable: 'Timetable',
  rooms: 'Room Management',
  sections: 'Section Management',
  'time-slots': 'Time Slots',
  'bulk-operations': 'Bulk Operations',
  settings: 'Settings',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the first 'dashboard' segment as we already added it
    if (segment === 'dashboard') return;
    
    const isLast = index === segments.length - 1;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      isCurrentPage: isLast,
    });
  });

  return breadcrumbs;
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                {item.label}
              </Link>
            ) : (
              <span 
                className={cn(
                  "font-medium",
                  item.isCurrentPage ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={item.isCurrentPage ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Optional: Page header component that includes breadcrumb
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <DashboardBreadcrumb />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
