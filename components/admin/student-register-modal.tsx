"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface StudentRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (studentId: string) => Promise<void>;
  sectionName: string;
}

export function StudentRegisterModal({
  open,
  onOpenChange,
  onSubmit,
  sectionName,
}: StudentRegisterModalProps) {
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(studentId);
      setStudentId("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error registering student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Register Student</DialogTitle>
            <DialogDescription>
              Register a student to section {sectionName}. Enter the student ID below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student ID
              </Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="col-span-3"
                placeholder="Enter student ID"
                autoComplete="off"
              />
            </div>
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
              {isSubmitting ? "Registering..." : "Register Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
