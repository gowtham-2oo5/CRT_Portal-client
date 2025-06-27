"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react';
import { TrainerManagementService } from '@/lib/api/services/trainer-management';
import { TrainerFormModal } from './trainer-form-modal';
import { toast } from 'sonner';
import type { Trainer, TrainerFilters } from '@/lib/types/trainer-management';

export function TrainerManagement() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<TrainerFilters>({
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load trainers
  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const trainerData = await TrainerManagementService.getTrainers(filters);
      setTrainers(trainerData);
      setFilteredTrainers(trainerData);
    } catch (error: any) {
      console.error('Error loading trainers:', error);
      setError(error.message || 'Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = trainers;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(searchTerm) ||
        trainer.email.toLowerCase().includes(searchTerm) ||
        trainer.sn.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredTrainers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, trainers]);

  // Pagination
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrainers = filteredTrainers.slice(startIndex, startIndex + itemsPerPage);

  // Handle trainer selection
  const handleSelectTrainer = (trainerId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrainers([...selectedTrainers, trainerId]);
    } else {
      setSelectedTrainers(selectedTrainers.filter(id => id !== trainerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrainers(paginatedTrainers.map(trainer => trainer.id));
    } else {
      setSelectedTrainers([]);
    }
  };

  // Handle trainer actions
  const handleDeleteTrainer = async (trainerId: string) => {
    try {
      await TrainerManagementService.deleteTrainer(trainerId);
      toast.success('Trainer deleted successfully');
      loadTrainers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete trainer');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTrainers.length === 0) return;
    
    try {
      await TrainerManagementService.bulkDeleteTrainers(selectedTrainers);
      toast.success(`${selectedTrainers.length} trainers deleted successfully`);
      setSelectedTrainers([]);
      loadTrainers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete trainers');
    }
  };

  // Get sections color based on count
  const getSectionsColor = (count: number) => {
    if (count >= 5) return 'text-purple-600';
    if (count >= 3) return 'text-blue-600';
    if (count >= 1) return 'text-green-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Management</h1>
          <p className="text-muted-foreground">
            Manage trainers, assignments, and schedules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadTrainers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadTrainers}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{trainers.length}</div>
                <div className="text-sm text-muted-foreground">Total Trainers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trainers.reduce((acc, t) => acc + (t.sectionsCount || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(trainers.reduce((acc, t) => acc + (t.sectionsCount || 0), 0) / trainers.length) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {trainers.filter(t => (t.sectionsCount || 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Trainers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or serial number..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTrainers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {selectedTrainers.length} trainer{selectedTrainers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedTrainers([])}>
                  Clear Selection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trainers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trainers ({filteredTrainers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTrainers.length === paginatedTrainers.length && paginatedTrainers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrainers.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTrainers.includes(trainer.id)}
                        onCheckedChange={(checked) => handleSelectTrainer(trainer.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trainer.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {trainer.sn}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {trainer.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{trainer.sectionsCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingTrainer(trainer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Trainer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTrainer(trainer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Trainer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTrainers.length)} of {filteredTrainers.length} trainers
              </div>
              <div className="flex items-center space-x-2">
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
        </CardContent>
      </Card>

      {/* Create Trainer Modal */}
      <TrainerFormModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadTrainers}
      />

      {/* Edit Trainer Modal */}
      <TrainerFormModal
        open={!!editingTrainer}
        onOpenChange={(open) => !open && setEditingTrainer(null)}
        trainer={editingTrainer}
        onSuccess={loadTrainers}
      />
    </div>
  );
}
