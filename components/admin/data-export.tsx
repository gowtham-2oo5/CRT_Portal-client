"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Building,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  FileText,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { SectionScheduleService } from "@/lib/api/services/section-schedule";
import { SectionManagementService } from "@/lib/api/services/section-management";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import {
  ScheduleExcelExporter,
  type SectionScheduleData,
} from "@/lib/services/excel-export";
import type { Section } from "@/lib/types/section-management";
import type { TimeSlotTemplate } from "@/lib/types/timeslot-template";
import type { SectionSchedule } from "@/lib/types/section-schedule";

interface ExportProgress {
  current: number;
  total: number;
  currentSection: string;
  status:
    | "preparing"
    | "fetching"
    | "processing"
    | "generating"
    | "complete"
    | "error";
}

export function DataExport() {
  const [sections, setSections] = useState<Section[]>([]);
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );

  // Export options
  const [exportOptions, setExportOptions] = useState({
    includeEmptySlots: true,
    includeMetadata: true,
    colorCode: true,
    filename: `All_Sections_Schedule_${
      new Date().toISOString().split("T")[0]
    }.xlsx`,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const [sectionsData, templatesData] = await Promise.all([
        SectionManagementService.getSections(),
        TimeSlotTemplateService.getTemplates(),
      ]);

      setSections(sectionsData);
      setTemplates(templatesData);

      // Select all sections by default
      setSelectedSections(sectionsData.map((s) => s.id));
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load sections and templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections((prev) => [...prev, sectionId]);
    } else {
      setSelectedSections((prev) => prev.filter((id) => id !== sectionId));
    }
  };

  const handleSelectAll = () => {
    setSelectedSections(sections.map((s) => s.id));
  };

  const handleSelectNone = () => {
    setSelectedSections([]);
  };

  const handleExportAllSections = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select at least one section to export");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress({
        current: 0,
        total: selectedSections.length,
        currentSection: "",
        status: "preparing",
      });

      // Prepare sections data with actual schedule information
      const sectionsData: SectionScheduleData[] = [];

      for (let i = 0; i < selectedSections.length; i++) {
        const sectionId = selectedSections[i];
        const section = sections.find((s) => s.id === sectionId);

        if (!section) continue;

        setExportProgress((prev) =>
          prev
            ? {
                ...prev,
                current: i,
                currentSection: section.name,
                status: "fetching",
              }
            : null
        );

        try {
          // Fetch actual schedule data for this section
          console.log(
            `🔄 Fetching schedule for section: ${section.name} (${sectionId})`
          );

          const schedule = await SectionScheduleService.getScheduleBySection(
            sectionId
          );

          console.log(`✅ Schedule loaded for ${section.name}:`, schedule);

          // Get room information
          let roomName = "No Room Assigned";
          if (schedule?.room?.roomString) {
            roomName = schedule.room.roomString;
          } else if (schedule?.roomId) {
            // If we have roomId but no room object, we could fetch room details
            roomName = `Room ID: ${schedule.roomId}`;
          }

          sectionsData.push({
            sectionId: section.id,
            sectionName: section.name,
            roomName: roomName,
            timeSlots: schedule?.timeSlots || [],
            templates: templates,
            // Additional section metadata
            sectionStrength: section.strength,
            trainingName: section.training?.name || "No Training",
            hasSchedule: !!schedule && schedule.timeSlots.length > 0,
          });

          console.log(
            `📊 Added section data for ${section.name}: ${
              schedule?.timeSlots?.length || 0
            } time slots`
          );
        } catch (error) {
          console.warn(
            `⚠️ Failed to load schedule for section ${section.name}:`,
            error
          );

          // Add section with empty schedule
          sectionsData.push({
            sectionId: section.id,
            sectionName: section.name,
            roomName: "No Room Assigned",
            timeSlots: [],
            templates: templates,
            sectionStrength: section.strength,
            trainingName: section.training?.name || "No Training",
            hasSchedule: false,
          });
        }
      }

      setExportProgress((prev) =>
        prev
          ? {
              ...prev,
              status: "generating",
              currentSection: "Generating Excel file...",
            }
          : null
      );

      console.log(`📋 Final sections data for export:`, sectionsData);
      console.log(
        `📊 Total sections: ${
          sectionsData.length
        }, Total time slots: ${sectionsData.reduce(
          (sum, s) => sum + s.timeSlots.length,
          0
        )}`
      );

      // Generate and download Excel file
      await ScheduleExcelExporter.exportAllSectionsSchedule(
        sectionsData,
        exportOptions
      );

      setExportProgress((prev) =>
        prev
          ? {
              ...prev,
              status: "complete",
              current: selectedSections.length,
              currentSection: "Export completed!",
            }
          : null
      );

      toast.success(
        `Successfully exported schedules for ${selectedSections.length} sections!`,
        {
          description: `Total time slots: ${sectionsData.reduce(
            (sum, s) => sum + s.timeSlots.length,
            0
          )}`,
        }
      );

      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress(null);
      }, 3000);
    } catch (error: any) {
      console.error("Export error:", error);
      setExportProgress((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              currentSection: "Export failed",
            }
          : null
      );
      toast.error(error.message || "Failed to export schedules");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingleSection = async (section: Section) => {
    try {
      setIsExporting(true);

      console.log(`🔄 Exporting single section: ${section.name}`);

      const schedule = await SectionScheduleService.getScheduleBySection(
        section.id
      );

      console.log(`✅ Schedule loaded for ${section.name}:`, schedule);

      let roomName = "No Room Assigned";
      if (schedule?.room?.roomString) {
        roomName = schedule.room.roomString;
      } else if (schedule?.roomId) {
        roomName = `Room ID: ${schedule.roomId}`;
      }

      const sectionData: SectionScheduleData = {
        sectionId: section.id,
        sectionName: section.name,
        roomName: roomName,
        timeSlots: schedule?.timeSlots || [],
        templates: templates,
        sectionStrength: section.strength,
        trainingName: section.training?.name || "No Training",
        hasSchedule: !!schedule && schedule.timeSlots.length > 0,
      };

      await ScheduleExcelExporter.exportSingleSectionSchedule(sectionData, {
        ...exportOptions,
        filename: `${section.name}_Schedule_${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
      });

      toast.success(`Successfully exported schedule for ${section.name}!`, {
        description: `${schedule?.timeSlots?.length || 0} time slots exported`,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(
        error.message || `Failed to export schedule for ${section.name}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading sections and templates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedSectionsData = sections.filter((s) =>
    selectedSections.includes(s.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            Schedule Data Export
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Export section schedules with complete time slot information to
            Excel workbooks
          </p>
        </CardHeader>
      </Card>

      {/* Export Progress */}
      {exportProgress && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Export Progress</h3>
                <Badge
                  variant={
                    exportProgress.status === "complete"
                      ? "default"
                      : "secondary"
                  }
                >
                  {exportProgress.status === "complete" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : exportProgress.status === "error" ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  {exportProgress.status}
                </Badge>
              </div>

              <Progress
                value={(exportProgress.current / exportProgress.total) * 100}
                className="w-full"
              />

              <p className="text-sm text-muted-foreground">
                {exportProgress.currentSection} ({exportProgress.current}/
                {exportProgress.total})
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Section Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Sections ({selectedSections.length}/{sections.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                  >
                    Select None
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={(checked) =>
                        handleSectionToggle(section.id, checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={section.id}
                        className="font-medium cursor-pointer"
                      >
                        {section.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {section.training?.name || "No training"} •{" "}
                        {section.strength} students
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportSingleSection(section)}
                      disabled={isExporting}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Single
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options & Actions */}
        <div className="space-y-6">
          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeEmpty"
                    checked={exportOptions.includeEmptySlots}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeEmptySlots: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="includeEmpty" className="text-sm">
                    Include empty time slots
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeMetadata: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="includeMetadata" className="text-sm">
                    Include metadata & summary
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="colorCode"
                    checked={exportOptions.colorCode}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        colorCode: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="colorCode" className="text-sm">
                    Color-code slot types
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filename" className="text-sm">
                  Filename
                </Label>
                <Input
                  id="filename"
                  value={exportOptions.filename}
                  onChange={(e) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      filename: e.target.value,
                    }))
                  }
                  placeholder="Enter filename..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Export Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Selected Sections:
                  </span>
                  <Badge variant="outline">{selectedSections.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Time Templates:
                  </span>
                  <Badge variant="outline">{templates.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Export Format:
                  </span>
                  <Badge variant="outline">Excel (.xlsx)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  onClick={handleExportAllSections}
                  disabled={selectedSections.length === 0 || isExporting}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  Export All Selected Sections
                </Button>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Each section will be exported as a separate sheet with
                    complete time slot information. An overview sheet will be
                    included with summary statistics.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
