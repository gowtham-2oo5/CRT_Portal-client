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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StudentService } from "@/lib/api/services/student";

interface BulkEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailIds: string[];
}

export function BulkEmailModal({ open, onOpenChange, emailIds }: BulkEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required.");
      return;
    }
    try {
      setIsSending(true);
      await StudentService.sendBulkEmail(subject, body, emailIds);
      toast.success(`Email sent to ${emailIds.length} students.`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Bulk Email</DialogTitle>
          <DialogDescription>
            Compose and send an email to {emailIds.length} students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={10} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
