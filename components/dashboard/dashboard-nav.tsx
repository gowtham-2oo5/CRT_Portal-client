"use client;";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
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
  ChevronLeft,
  FileBarChart,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth/auth-guard";

interface NavItem {
  name: string;
  icon: any; // Lucide icon component
  href?: string; // Only for type 'link'
  type: "link" | "group";
  children?: NavItem[]; // Only for type 'group'
}

const adminNavigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    type: "link",
  },
  {
    name: "People",
    icon: Users,
    type: "group",
    children: [
      {
        name: "Users",
        href: "/dashboard/admin/users",
        icon: Users,
        type: "link",
      },
      {
        name: "Students",
        href: "/dashboard/admin/students",
        icon: GraduationCap,
        type: "link",
      },
      {
        name: "Trainers",
        href: "/dashboard/admin/trainers",
        icon: UserCheck,
        type: "link",
      },
    ],
  },
  {
    name: "Academics",
    icon: BookOpen,
    type: "group",
    children: [
      {
        name: "Rooms",
        href: "/dashboard/admin/rooms",
        icon: Building2,
        type: "link",
      },
      {
        name: "Sections",
        href: "/dashboard/admin/sections",
        icon: BookOpen,
        type: "link",
      },
      {
        name: "Schedule Management",
        href: "/dashboard/admin/schedule-management",
        icon: Clock,
        type: "link",
      },
      {
        name: "Time Slots",
        href: "/dashboard/admin/timeslot-management",
        icon: Timer,
        type: "link",
      },
    ],
  },
  {
    name: "Operations",
    icon: BarChart3,
    type: "group",
    children: [
      {
        name: "Attendance",
        href: "/dashboard/admin/attendance",
        icon: BarChart3,
        type: "link",
      },
      {
        name: "Bulk Operations",
        href: "/dashboard/admin/bulk-operations",
        icon: Upload,
        type: "link",
      },
      {
        name: "View Reports",
        href: "/dashboard/admin/reports",
        icon: FileBarChart,
        type: "link",
      },
    ],
  },
  {
    name: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
    type: "link",
  },
];

function NavGroup({
  item,
  isCollapsed,
  pathname,
  activeGroup,
  setActiveGroup,
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
  activeGroup: string | null;
  setActiveGroup: (groupName: string | null) => void;
}) {
  const Icon = item.icon;
  const isOpen = activeGroup === item.name;

  const handleToggle = () => {
    setActiveGroup(isOpen ? null : item.name);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle} className="space-y-1">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium group",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            isOpen && "bg-muted text-foreground"
          )}
        >
          <Icon
            className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3")}
          />
          {!isCollapsed && (
            <span className="flex-1 text-left">{item.name}</span>
          )}
          {!isCollapsed && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-4">
        {item.children?.map((child) => {
          const ChildIcon = child.icon;
          const isActive =
            pathname === child.href ||
            (child.href !== undefined && pathname.startsWith(child.href));
          return (
            <Link
              key={child.name}
              href={child.href || "#"}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium group",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <ChildIcon
                className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3")}
              />
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{child.name}</div>
                </div>
              )}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DashboardNav() {
  const pathname = useusePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null); // State to manage active group

  useEffect(() => {
    // Determine initial active group based on current pathname
    let initialActiveGroup: string | null = null;
    for (const item of adminNavigation) {
      if (item.type === "group") {
        if (item.children?.some(child => pathname.startsWith(child.href || ""))) {
          initialActiveGroup = item.name;
          break;
        }
      }
    }
    setActiveGroup(initialActiveGroup);
  }, [pathname]); // Recalculate when pathname changes

  if (user?.role === "FACULTY") {
    return null;
  }

  return (
    <nav
      className={cn(
        "bg-card border-r border-border transition-all duration-100",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">
              Admin Panel
            </h2>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (!isCollapsed) {
                setActiveGroup(null); // Close all groups when collapsing
              }
            }}
            className="p-1 rounded-md hover: border transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-1">
          {adminNavigation.map((item) => {
            if (item.type === "link") {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== undefined && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      !isCollapsed && "mr-3"
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                    </div>
                  )}
                </Link>
              );
            } else {
              return (
                <NavGroup
                  key={item.name}
                  item={item}
                  isCollapsed={isCollapsed}
                  pathname={pathname}
                  activeGroup={activeGroup}
                  setActiveGroup={setActiveGroup}
                />
              );
            }
          })}
        </div>
      </div>
    </nav>
  );
}