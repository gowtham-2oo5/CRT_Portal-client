"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkEmailModal } from "./bulk-email-modal";
import { ExportAbsenteesCSV } from "./export-absentees-csv";
import { Absentee } from "@/lib/types/attendance";

interface AllAbsenteesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absenteeEmails: string[];
  absentees?: Absentee[]; // Optional full absentee data
}

export function AllAbsenteesModal({
  open,
  onOpenChange,
  absenteeEmails,
  absentees,
}: AllAbsenteesModalProps) {
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>All Absentees ({absenteeEmails.length})</DialogTitle>
          <DialogDescription>
            List of all unique absentee email IDs from the filtered time slots.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {absenteeEmails.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No absentees found for the selected filters.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absenteeEmails.map((email, index) => (
                  <TableRow key={index}>
                    <TableCell>{email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            {/* Add Export CSV Button */}
            {absentees && absentees.length > 0 && (
              <ExportAbsenteesCSV absentees={absentees} />
            )}
            <Button
              onClick={() => {
                setShowBulkEmailModal(true);
                onOpenChange(false); // Close AllAbsenteesModal when opening BulkEmailModal
              }}
              disabled={absenteeEmails.length === 0}
            >
              Send Bulk Email
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <BulkEmailModal
        open={showBulkEmailModal}
        onOpenChange={setShowBulkEmailModal}
        emailIds={absenteeEmails}
      />
    </Dialog>
  );
}
