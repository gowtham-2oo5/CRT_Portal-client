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
  Building,
  MapPin,
  Users,
  Hash,
} from "lucide-react";
import { RoomManagementService } from "@/lib/api/services/room-management";
import { RoomFormModal } from "./room-form-modal";
import { toast } from "sonner";
import type { Room, RoomFilters } from "@/lib/types/room-management";

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Filters
  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    roomType: undefined,
    block: undefined,
    floor: undefined,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load rooms
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const roomData = await RoomManagementService.getRooms(filters);
      setRooms(roomData);
      setFilteredRooms(roomData);
    } catch (error: any) {
      console.error("Error loading rooms:", error);
      setError(error.message || "Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = rooms;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.block.toLowerCase().includes(search) ||
          room.floor.toLowerCase().includes(search) ||
          room.roomNumber.toLowerCase().includes(search) ||
          room.roomString?.toLowerCase().includes(search)
      );
    }

    if (filters.roomType) {
      filtered = filtered.filter((room) => room.roomType === filters.roomType);
    }

    if (filters.block) {
      filtered = filtered.filter((room) => room.block === filters.block);
    }

    if (filters.floor) {
      filtered = filtered.filter((room) => room.floor === filters.floor);
    }

    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [filters, rooms]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle room creation
  const handleCreateRoom = async (roomData: any) => {
    try {
      await RoomManagementService.createRoom(roomData);
      toast.success("Room created successfully");
      setShowCreateDialog(false);
      loadRooms();
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error(error.message || "Failed to create room");
    }
  };

  // Handle room update
  const handleUpdateRoom = async (roomData: any) => {
    if (!editingRoom) return;

    try {
      await RoomManagementService.updateRoom(editingRoom.id, roomData);
      toast.success("Room updated successfully");
      setEditingRoom(null);
      loadRooms();
    } catch (error: any) {
      console.error("Error updating room:", error);
      toast.error(error.message || "Failed to update room");
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await RoomManagementService.deleteRoom(roomId);
      toast.success("Room deleted successfully");
      loadRooms();
    } catch (error: any) {
      console.error("Error deleting room:", error);
      toast.error(error.message || "Failed to delete room");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRooms.length === 0) return;
    if (
      !confirm(`Are you sure you want to delete ${selectedRooms.length} rooms?`)
    )
      return;

    try {
      await RoomManagementService.bulkDeleteRooms(selectedRooms);
      toast.success(`${selectedRooms.length} rooms deleted successfully`);
      setSelectedRooms([]);
      loadRooms();
    } catch (error: any) {
      console.error("Error bulk deleting rooms:", error);
      toast.error(error.message || "Failed to delete rooms");
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRooms(paginatedRooms.map((room) => room.id));
    } else {
      setSelectedRooms([]);
    }
  };

  // Handle individual selection
  const handleSelectRoom = (roomId: string, checked: boolean) => {
    if (checked) {
      setSelectedRooms([...selectedRooms, roomId]);
    } else {
      setSelectedRooms(selectedRooms.filter((id) => id !== roomId));
    }
  };

  // Get room type badge color
  const getRoomTypeBadge = (roomType: string) => {
    switch (roomType) {
      case "LAB":
        return <Badge variant="default">Lab</Badge>;
      case "LECTURE_ROOM":
        return <Badge variant="secondary">Lecture Room</Badge>;
      case "SEMINAR_HALL":
        return <Badge variant="outline">Seminar Hall</Badge>;
      default:
        return <Badge variant="secondary">{roomType}</Badge>;
    }
  };

  // Get unique values for filters
  const uniqueBlocks = [...new Set(rooms.map((room) => room.block))];
  const uniqueFloors = [...new Set(rooms.map((room) => room.floor))];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">
            Manage rooms, capacity, and room types
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadRooms}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labs</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.roomType === "LAB").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecture Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.roomType === "LECTURE_ROOM").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, room) => sum + room.capacity, 0)}
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
                  placeholder="Search rooms..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.roomType || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  roomType:
                    value === "all"
                      ? undefined
                      : (value as "LAB" | "LECTURE_ROOM" | "SEMINAR_HALL"),
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="LAB">Lab</SelectItem>
                <SelectItem value="LECTURE_ROOM">Lecture Room</SelectItem>
                <SelectItem value="SEMINAR_HALL">Seminar Hall</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.block || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  block: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {uniqueBlocks.map((block) => (
                  <SelectItem key={block} value={block}>
                    {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.floor || ""}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  floor: value || undefined,
                })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {uniqueFloors.map((floor) => (
                  <SelectItem key={floor} value={floor}>
                    {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRooms.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedRooms.length} room(s) selected
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

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
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
                          paginatedRooms.length > 0 &&
                          paginatedRooms.every((room) =>
                            selectedRooms.includes(room.id)
                          )
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Sub Room</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRoom(room.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {room.roomString ||
                          `${room.block}${room.floor}${room.roomNumber}${
                            room.subRoom || ""
                          }`}
                      </TableCell>
                      <TableCell>{room.block}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{getRoomTypeBadge(room.roomType)}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.subRoom || "-"}</TableCell>
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
                              onClick={() => setEditingRoom(room)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRoom(room.id)}
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
                    {Math.min(startIndex + itemsPerPage, filteredRooms.length)}{" "}
                    of {filteredRooms.length} rooms
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

      {/* Create/Edit Room Modal */}
      <RoomFormModal
        open={showCreateDialog || !!editingRoom}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingRoom(null);
          }
        }}
        onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}
        initialData={editingRoom}
        mode={editingRoom ? "edit" : "create"}
      />
    </div>
  );
}
