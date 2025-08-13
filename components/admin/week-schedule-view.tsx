import { SmartScheduleGrid } from "@/components/admin/smart-schedule-grid";

interface WeekScheduleViewProps {
  sectionId: string;
  roomId: string;
  sectionName: string;
  roomName: string;
  onScheduleUpdate: () => void;
}

export function WeekScheduleView({
  sectionId,
  roomId,
  sectionName,
  roomName,
  onScheduleUpdate,
}: WeekScheduleViewProps) {
  return (
    <SmartScheduleGrid
      sectionId={sectionId}
      roomId={roomId || undefined} // Pass as optional
      sectionName={sectionName}
      roomName={roomName || undefined} // Pass as optional
      onScheduleUpdate={onScheduleUpdate}
    />
  );
}
