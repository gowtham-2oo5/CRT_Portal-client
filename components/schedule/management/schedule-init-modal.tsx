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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MapPin, Users } from "lucide-react";
import type { Section } from "@/lib/types/section-management";
import type { Room } from "@/lib/types/room-management";

interface ScheduleInitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sectionId: string, roomId: string) => Promise<void>;
  section: Section | null;
  rooms: Room[];
}

export function ScheduleInitModal({
  open,
  onOpenChange,
  onSubmit,
  section,
  rooms,
}: ScheduleInitModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedRoomId("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!section) {
      setError("No section selected");
      return;
    }

    if (!selectedRoomId) {
      setError("Please select a room");
      return;
    }

    // Check room capacity vs section strength
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    if (selectedRoom && section.strength > selectedRoom.capacity) {
      setError(
        `Room capacity (${selectedRoom.capacity}) is insufficient for section strength (${section.strength})`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(section.id, selectedRoomId);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error initializing schedule:", error);
      setError(error.message || "Failed to initialize schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter rooms that have sufficient capacity
  const suitableRooms = rooms.filter(room => 
    !section || room.capacity >= section.strength
  );

  const insufficientRooms = rooms.filter(room => 
    section && room.capacity < section.strength
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Initialize Schedule</DialogTitle>
          <DialogDescription>
            Create a new schedule for <strong>{section?.name}</strong> by assigning a room.
            You can add time slots after initialization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Section Info */}
          {section && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Section Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{section.strength} students</span>
                </div>
                <div>Training: {section.training?.name || "No training assigned"}</div>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div className="space-y-2">
            <Label>Select Room *</Label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room..." />
              </SelectTrigger>
              <SelectContent>
                {suitableRooms.map((room) => {
                  const roomName = room.roomString || `${room.block}${room.floor}${room.roomNumber}`;
                  return (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{roomName}</span>
                        <span className="text-muted-foreground">
                          - {room.roomType} (Cap: {room.capacity})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
                {insufficientRooms.length > 0 && (
                  <>
                    {insufficientRooms.map((room) => {
                      const roomName = room.roomString || `${room.block}${room.floor}${room.roomNumber}`;
                      return (
                        <SelectItem key={room.id} value={room.id} disabled>
                          <div className="flex items-center gap-2 opacity-50">
                            <MapPin className="h-4 w-4" />
                            <span>{roomName}</span>
                            <span className="text-muted-foreground">
                              - {room.roomType} (Cap: {room.capacity}) - Insufficient
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </>
                )}
              </SelectContent>
            </Select>
            {section && (
              <p className="text-sm text-muted-foreground">
                Room must have capacity for at least {section.strength} students
              </p>
            )}
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
            <Button type="submit" disabled={isSubmitting || !selectedRoomId}>
              {isSubmitting ? "Initializing..." : "Initialize Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
