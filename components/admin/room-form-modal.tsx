"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Room, CreateRoomRequest } from "@/lib/types/room-management";

interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoomRequest) => Promise<void>;
  initialData?: Room | null;
  mode: "create" | "edit";
}

export function RoomFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: RoomFormModalProps) {
  const [formData, setFormData] = useState<CreateRoomRequest>({
    block: "",
    floor: "",
    roomNumber: "",
    subRoom: "",
    roomType: "LECTURE_ROOM",
    capacity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setFormData({
          block: initialData.block,
          floor: initialData.floor,
          roomNumber: initialData.roomNumber,
          subRoom: initialData.subRoom || "",
          roomType: initialData.roomType,
          capacity: initialData.capacity,
        });
      } else {
        setFormData({
          block: "",
          floor: "",
          roomNumber: "",
          subRoom: "",
          roomType: "LECTURE_ROOM",
          capacity: 1,
        });
      }
      setError(null);
    }
  }, [open, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.block.trim()) {
      setError("Block is required");
      return;
    }
    if (!formData.floor.trim()) {
      setError("Floor is required");
      return;
    }
    if (!formData.roomNumber.trim()) {
      setError("Room number is required");
      return;
    }
    if (!formData.roomType) {
      setError("Room type is required");
      return;
    }
    if (formData.capacity < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Clean up the data before submitting
      const submitData: CreateRoomRequest = {
        block: formData.block.trim(),
        floor: formData.floor.trim(),
        roomNumber: formData.roomNumber.trim(),
        subRoom: formData.subRoom?.trim() || undefined,
        roomType: formData.roomType,
        capacity: formData.capacity,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting room form:", error);
      setError(error.message || "Failed to save room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateRoomRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Room" : "Edit Room"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new room in the system."
              : "Update the room information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="block">Block *</Label>
              <Input
                id="block"
                value={formData.block}
                onChange={(e) => handleInputChange("block", e.target.value)}
                placeholder="e.g., R, A, B"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleInputChange("floor", e.target.value)}
                placeholder="e.g., 1, 2, 3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number *</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                placeholder="e.g., 01, 02, 15"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subRoom">Sub Room</Label>
              <Input
                id="subRoom"
                value={formData.subRoom}
                onChange={(e) => handleInputChange("subRoom", e.target.value)}
                placeholder="e.g., A, B (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type *</Label>
            <Select
              value={formData.roomType}
              onValueChange={(value) => handleInputChange("roomType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LAB">Lab</SelectItem>
                <SelectItem value="LECTURE_ROOM">Lecture Room</SelectItem>
                <SelectItem value="SEMINAR_HALL">Seminar Hall</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 1)}
              placeholder="e.g., 50, 100"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Room"
                : "Update Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
