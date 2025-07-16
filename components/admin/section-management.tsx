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
import { Checkbox } from "@/components/ui/checkbox";
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
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  Calendar,
  ClipboardList,
  BarChart,
} from "lucide-react";
import { SectionManagementService } from "@/lib/api/services/section-management";
import { TrainerManagementService } from "@/lib/api/services/trainer-management";
import { SectionFormModal } from "@/components/admin/section-form-modal";
import { SectionScheduleComponent } from "@/components/admin/section-schedule";
import { SectionAttendanceRecords } from "@/components/admin/section-attendance-records";
import { SectionStudentsList } from "@/components/admin/section-students-list";
import { toast } from "sonner";
import type { Section, SectionFilters } from "@/lib/types/section-management";
import type { Trainer } from "@/lib/types/trainer-management";

export function SectionManagement() {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [trainings, setTrainings] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [viewingScheduleSection, setViewingScheduleSection] =
    useState<Section | null>(null);
  const [viewingAttendanceSection, setViewingAttendanceSection] =
    useState<Section | null>(null);
  const [viewingStudentsSection, setViewingStudentsSection] =
    useState<Section | null>(null);

  // Filters
  const [filters, setFilters] = useState<SectionFilters>({
    search: "",
    trainerId: undefined,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load sections and trainers
  const loadSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sectionData = await SectionManagementService.getSections(filters);
      console.log("🔍 Raw section data from API:", sectionData);
      console.log("🔍 First section structure:", sectionData[0]);
      if (sectionData[0]) {
        console.log("🔍 First section trainer field:", sectionData[0].training);
        console.log("🔍 Trainer field type:", typeof sectionData[0].training);
        console.log(
          "🔍 training field keys:",
          Object.keys(sectionData[0].training || {})
        );
      }
      setSections(sectionData);
      setFilteredSections(sectionData);
    } catch (error: any) {
      console.error("Error loading sections:", error);
      setError(error.message || "Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrainings = async () => {
    try {
      const trainingData = await TrainerManagementService.getTrainers();
      setTrainings(trainingData);
    } catch (error: any) {
      console.error("Error loading trainings:", error);
    }
  };

  useEffect(() => {
    loadSections();
    loadTrainings();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = sections;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (section) =>
          section.name.toLowerCase().includes(search) ||
          (section.training?.name &&
            section.training.name.toLowerCase().includes(search))
      );
    }

    if (filters.trainerId) {
      filtered = filtered.filter(
        (section) => section.training?.id === filters.trainerId
      );
    }

    setFilteredSections(filtered);
    setCurrentPage(1);
  }, [filters, sections]);

  // Pagination
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSections = filteredSections.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle section creation
  const handleCreateSection = async (sectionData: any) => {
    try {
      await SectionManagementService.createSection(sectionData);
      toast.success("Section created successfully");
      setShowCreateDialog(false);
      loadSections();
    } catch (error: any) {
      console.error("Error creating section:", error);
      toast.error(error.message || "Failed to create section");
    }
  };

  // Handle section update
  const handleUpdateSection = async (sectionData: any) => {
    if (!editingSection) return;

    try {
      await SectionManagementService.updateSection(
        editingSection.id,
        sectionData
      );
      toast.success("Section updated successfully");
      setEditingSection(null);
      loadSections();
    } catch (error: any) {
      console.error("Error updating section:", error);
      toast.error(error.message || "Failed to update section");
    }
  };

  // Handle section deletion
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await SectionManagementService.deleteSection(sectionId);
      toast.success("Section deleted successfully");
      loadSections();
    } catch (error: any) {
      console.error("Error deleting section:", error);
      toast.error(error.message || "Failed to delete section");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSections.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedSections.length} sections?`
      )
    )
      return;

    try {
      await SectionManagementService.bulkDeleteSections(selectedSections);
      toast.success(`${selectedSections.length} sections deleted successfully`);
      setSelectedSections([]);
      loadSections();
    } catch (error: any) {
      console.error("Error bulk deleting sections:", error);
      toast.error(error.message || "Failed to delete sections");
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSections(paginatedSections.map((section) => section.id));
    } else {
      setSelectedSections([]);
    }
  };

  // Handle individual selection
  const handleSelectSection = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections([...selectedSections, sectionId]);
    } else {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    }
  };

  // Handle file upload for student registration
  const handleStudentRegistration = async (sectionId: string, file: File) => {
    try {
      await SectionManagementService.registerStudents(sectionId, file);
      toast.success("Students registered successfully");
      loadSections();
    } catch (error: any) {
      console.error("Error registering students:", error);
      toast.error(error.message || "Failed to register students");
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

  // Show schedule view if a section is selected for viewing
  if (viewingScheduleSection) {
    return (
      <SectionScheduleComponent
        section={viewingScheduleSection}
        onBack={() => setViewingScheduleSection(null)}
      />
    );
  }

  // Show attendance records view if a section is selected for viewing
  if (viewingAttendanceSection) {
    return (
      <SectionAttendanceRecords
        section={viewingAttendanceSection}
        onBack={() => setViewingAttendanceSection(null)}
      />
    );
  }

  // Show students list view if a section is selected for viewing
  if (viewingStudentsSection) {
    return (
      <SectionStudentsList
        section={viewingStudentsSection}
        onBack={() => setViewingStudentsSection(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Section Management
          </h1>
          <p className="text-muted-foreground">
            Manage training sections and student assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSections}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sections.reduce((sum, section) => sum + section.strength, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Trainings
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(
                  sections
                    .filter((s) => s.training && s.training.id)
                    .map((s) => s.training.id)
                ).size
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Section Size
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sections.length > 0
                ? Math.round(
                    sections.reduce(
                      (sum, section) => sum + section.strength,
                      0
                    ) / sections.length
                  )
                : 0}
            </div>
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
                  placeholder="Search sections or trainings..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.trainerId || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  trainerId: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Training" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainings</SelectItem>
                {trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSections.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSections.length} section(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          paginatedSections.length > 0 &&
                          paginatedSections.every((section) =>
                            selectedSections.includes(section.id)
                          )
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={(checked) =>
                            handleSelectSection(section.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {section.name}
                      </TableCell>
                      <TableCell>
                        {section.training?.name || "No Training Assigned"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {section.students.length} enrolled
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{section.strength}</Badge>
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
                            <DropdownMenuItem
                              onClick={() => setViewingScheduleSection(section)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              View Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setViewingStudentsSection(section)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Get Students List
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setViewingAttendanceSection(section)
                              }
                            >
                              <BarChart className="h-4 w-4 mr-2" />
                              View Attendance Records
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setEditingSection(section)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = ".csv,.xlsx,.xls";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0];
                                  if (file) {
                                    handleStudentRegistration(section.id, file);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Students
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteSection(section.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredSections.length
                    )}{" "}
                    of {filteredSections.length} sections
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Section Modal */}
      <SectionFormModal
        open={showCreateDialog || !!editingSection}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingSection(null);
          }
        }}
        onSubmit={editingSection ? handleUpdateSection : handleCreateSection}
        initialData={editingSection}
        trainers={trainings}
        mode={editingSection ? "edit" : "create"}
      />
    </div>
  );
}
