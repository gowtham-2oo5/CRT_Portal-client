"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { SectionManagementService } from "@/lib/api/services/section-management";
import { RoomManagementService } from "@/lib/api/services/room-management";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { SectionScheduleComponent } from "./section-schedule";
import { ScheduleInitModal } from "./schedule-init-modal";
import { toast } from "sonner";
import type { Section } from "@/lib/types/section-management";
import type { Room } from "@/lib/types/room-management";
import type { SectionSchedule } from "@/lib/types/section-schedule";

interface SectionWithSchedule extends Section {
  hasSchedule: boolean;
  schedule?: SectionSchedule;
  assignedRoom?: Room;
}

export function ScheduleManagement() {
  const [sections, setSections] = useState<SectionWithSchedule[]>([]);
  const [filteredSections, setFilteredSections] = useState<SectionWithSchedule[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [managingScheduleSection, setManagingScheduleSection] = useState<Section | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    hasSchedule: "all", // "all", "scheduled", "unscheduled"
  });

  // Load sections and check for existing schedules
  const loadSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [sectionsData, roomsData] = await Promise.all([
        SectionManagementService.getSections(),
        RoomManagementService.getRooms(),
      ]);

      setRooms(roomsData);

      // Check each section for existing schedules
      const sectionsWithSchedules = await Promise.all(
        sectionsData.map(async (section) => {
          try {
            const schedule = await SectionScheduleService.getScheduleBySection(section.id);
            const assignedRoom = schedule ? roomsData.find(r => r.id === schedule.roomId) : undefined;
            
            return {
              ...section,
              hasSchedule: !!schedule,
              schedule,
              assignedRoom,
            };
          } catch (error: any) {
            // Log the error but don't fail the entire load
            console.warn(`Failed to load schedule for section ${section.id}:`, error);
            return {
              ...section,
              hasSchedule: false,
            };
          }
        })
      );

      setSections(sectionsWithSchedules);
      setFilteredSections(sectionsWithSchedules);
    } catch (error: any) {
      console.error("Error loading sections:", error);
      setError(error.message || "Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = sections;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (section) =>
          section.name.toLowerCase().includes(search) ||
          section.training?.name?.toLowerCase().includes(search) ||
          section.assignedRoom?.roomString?.toLowerCase().includes(search)
      );
    }

    if (filters.hasSchedule !== "all") {
      filtered = filtered.filter((section) => 
        filters.hasSchedule === "scheduled" ? section.hasSchedule : !section.hasSchedule
      );
    }

    setFilteredSections(filtered);
  }, [filters, sections]);

  // Handle schedule initialization
  const handleInitializeSchedule = async (sectionId: string, roomId: string) => {
    try {
      const newSchedule = await SectionScheduleService.createSectionSchedule({
        sectionId,
        roomId,
      });
      
      toast.success("Schedule initialized successfully! Now add time slots.");
      setShowInitDialog(false);
      setSelectedSection(null);
      
      // Refresh the list
      await loadSections();
      
      // Automatically open the schedule management for the newly created schedule
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        setManagingScheduleSection(section);
      }
    } catch (error: any) {
      console.error("Error initializing schedule:", error);
      toast.error(error.message || "Failed to initialize schedule");
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show schedule management view if a section is selected for management
  if (managingScheduleSection) {
    return (
      <SectionScheduleComponent
        section={managingScheduleSection}
        onBack={() => setManagingScheduleSection(null)}
      />
    );
  }

  const scheduledCount = sections.filter(s => s.hasSchedule).length;
  const unscheduledCount = sections.filter(s => !s.hasSchedule).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">
            Initialize and manage section schedules with room assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSections}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{scheduledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unscheduled</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unscheduledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search sections, trainings, or rooms..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.hasSchedule}
              onValueChange={(value) =>
                setFilters({ ...filters, hasSchedule: value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="scheduled">Scheduled Only</SelectItem>
                <SelectItem value="unscheduled">Unscheduled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sections ({filteredSections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Assigned Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Slots</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">
                      {section.name}
                    </TableCell>
                    <TableCell>
                      {section.training?.name || "No Training"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {section.strength} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {section.assignedRoom ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{section.assignedRoom.roomString}</span>
                          <Badge variant="outline" className="text-xs">
                            Cap: {section.assignedRoom.capacity}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {section.hasSchedule ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unscheduled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {section.schedule ? (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {section.schedule.timeSlots.length} slots
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {section.hasSchedule ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => setManagingScheduleSection(section)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // View-only schedule (you can implement this later)
                                  toast.info("View-only schedule coming soon");
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                View Schedule
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSection(section);
                                setShowInitDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Initialize Schedule
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Initialize Schedule Modal */}
      <ScheduleInitModal
        open={showInitDialog}
        onOpenChange={setShowInitDialog}
        onSubmit={handleInitializeSchedule}
        section={selectedSection}
        rooms={rooms}
      />
    </div>
  );
}
