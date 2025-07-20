"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { TimeSlotTemplateService } from "@/lib/api/services/timeslot-template";
import type {
  CreateTimeSlotTemplateRequest,
  TimeSlotTemplate,
} from "@/lib/types/timeslot-template";
import { TimeSlotTemplateFormModal } from "./time-slot-template-form-modal";

export function TimeSlotManagement() {
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("09:50");
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<TimeSlotTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await TimeSlotTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates", error);
      toast.error("Could not load time slot templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleAddTemplate = async (data: CreateTimeSlotTemplateRequest) => {
    try {
      const newTemplate = await TimeSlotTemplateService.createTemplate(data);
      setTemplates([...templates, newTemplate]);
      toast.success(`Template "${newTemplate.name}" added.`);
      setShowFormModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add template.");
    }
  };

  const handleUpdateTemplate = async (data: CreateTimeSlotTemplateRequest) => {
    if (!editingTemplate) return;
    try {
      const updatedTemplate = await TimeSlotTemplateService.updateTemplate(
        editingTemplate.name,
        data
      );
      setTemplates(
        templates.map((t) =>
          t.name === updatedTemplate.name ? updatedTemplate : t
        )
      );
      toast.success(`Template "${updatedTemplate.name}" updated.`);
      setShowFormModal(false);
      setEditingTemplate(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update template.");
    }
  };

  const handleDeleteTemplate = async (name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete the "${name}" template?`)
    ) {
      return;
    }
    try {
      await TimeSlotTemplateService.deleteTemplate(name);
      setTemplates(templates.filter((t) => t.name !== name));
      toast.success(`Template "${name}" deleted.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete template.");
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setShowFormModal(true);
  };

  const openEditModal = (template: TimeSlotTemplate) => {
    setEditingTemplate(template);
    setShowFormModal(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Slot Template Management</CardTitle>
        <CardDescription>
          Define reusable time slot templates for class sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex justify-end">
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Template
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Saved Templates</h3>
          {isLoading ? (
            <p>Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates defined yet.
            </p>
          ) : (
            <div className="border rounded-lg">
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 font-medium border-b">
                <div>Name</div>
                <div>Start Time</div>
                <div>End Time</div>
                <div className="w-10"></div>
              </div>
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 p-4 items-center border-b last:border-b-0"
                >
                  <div className="font-semibold">{template.name}</div>
                  <div>{template.startTime}</div>
                  <div>{template.endTime}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(template)}
                      className="text-muted-foreground hover:text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.name)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <TimeSlotTemplateFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleAddTemplate}
        initialData={editingTemplate}
        mode={editingTemplate ? "edit" : "create"}
      />
    </Card>
  );
}
