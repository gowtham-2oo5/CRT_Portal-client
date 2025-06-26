'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';
import {useAuth} from '@/components/auth/auth-guard';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    UserCheck,
    Building2,
    BookOpen,
    Clock,
    BarChart3,
    Upload,
    Settings,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import {useState} from 'react';
import {Button} from "@/components/ui/button";

const adminNavigation = [
    {
        name: 'Dashboard',
        href: '/dashboard/admin',
        icon: LayoutDashboard
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
        // description: 'Manage system users and roles'
    },
    {
        name: 'Students',
        href: '/admin/students',
        icon: GraduationCap,
        // description: 'Student management and CRT eligibility'
    },
    {
        name: 'Trainers',
        href: '/admin/trainers',
        icon: UserCheck,
        // description: 'Trainer management and assignments'
    },
    {
        name: 'Rooms',
        href: '/admin/rooms',
        icon: Building2,
        // description: 'Classroom and facility management'
    },
    {
        name: 'Sections',
        href: '/admin/sections',
        icon: BookOpen,
        // description: 'Section and class organization'
    },
    {
        name: 'Time Slots',
        href: '/admin/time-slots',
        icon: Clock,
        // description: 'Schedule and time slot management'
    },
    {
        name: 'Attendance',
        href: '/admin/attendance',
        icon: BarChart3,
        // description: 'Attendance monitoring and reports'
    },
    {
        name: 'Bulk Operations',
        href: '/admin/bulk-operations',
        icon: Upload,
        // description: 'Import/export and bulk operations'
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        // description: 'System configuration and preferences'
    },
];

export function DashboardNav() {
    const pathname = usePathname();
    const {user} = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Don't render if user is faculty (they have their own nav)
    if (user?.role === 'FACULTY') {
        return null;
    }

    return (
        <nav className={cn(
            "bg-card border-r border-border transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="p-4">
                {/* Collapse Toggle */}
                <div className="flex items-center justify-between mb-4">
                    {!isCollapsed && (
                        <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 rounded-md hover: border transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4"/>
                        ) : (
                            <ChevronLeft className="h-4 w-4"/>
                        )}
                    </Button>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                    {adminNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors group',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className={cn(
                                    "h-4 w-4 flex-shrink-0",
                                    !isCollapsed && "mr-3"
                                )}/>
                                {!isCollapsed && (
                                    <div className="flex-1">
                                        <div className="font-medium">{item.name}</div>

                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
