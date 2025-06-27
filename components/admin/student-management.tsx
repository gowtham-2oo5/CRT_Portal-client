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
  GraduationCap,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone
} from 'lucide-react';
import { StudentManagementService } from '@/lib/api/services/student-management';
import { StudentFormModal } from './student-form-modal';
import { CRTEligibilityModal } from './crt-eligibility-modal';
import { DEPARTMENTS, BATCHES } from '@/lib/types/student-management';
import { toast } from 'sonner';
import type { Student, StudentFilters } from '@/lib/types/student-management';

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [crtModalStudent, setCrtModalStudent] = useState<Student | null>(null);
  const [crtModalAction, setCrtModalAction] = useState<'ADD' | 'REMOVE'>('ADD');
  
  // Filters
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    department: 'ALL',
    batch: 'ALL',
    crtEligibility: 'ALL'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load students
  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const studentData = await StudentManagementService.getStudents(filters);
      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (error: any) {
      console.error('Error loading students:', error);
      setError(error.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = students;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.regNum.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.department && filters.department !== 'ALL') {
      filtered = filtered.filter(student => student.department === filters.department);
    }

    if (filters.batch && filters.batch !== 'ALL') {
      filtered = filtered.filter(student => student.batch === filters.batch);
    }

    if (filters.crtEligibility && filters.crtEligibility !== 'ALL') {
      const isEligible = filters.crtEligibility === 'ELIGIBLE';
      filtered = filtered.filter(student => student.crtEligibility === isEligible);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, students]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // Handle student selection
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(paginatedStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle student actions
  const handleDeleteStudent = async (studentId: string) => {
    try {
      await StudentManagementService.deleteStudent(studentId);
      toast.success('Student deleted successfully');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      await StudentManagementService.bulkDeleteStudents(selectedStudents);
      toast.success(`${selectedStudents.length} students deleted successfully`);
      setSelectedStudents([]);
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete students');
    }
  };

  const handleCRTAction = (student: Student, action: 'ADD' | 'REMOVE') => {
    setCrtModalStudent(student);
    setCrtModalAction(action);
  };

  // Get CRT eligibility badge
  const getCRTBadge = (isEligible: boolean) => {
    return isEligible ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        Eligible
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400">
        <UserX className="h-3 w-3 mr-1" />
        Not Eligible
      </Badge>
    );
  };

  // Get attendance color
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">
            Manage students, CRT eligibility, and academic records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStudents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
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
              onClick={loadStudents}
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
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.crtEligibility).length}
                </div>
                <div className="text-sm text-muted-foreground">CRT Eligible</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Attendance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(students.map(s => s.department)).size}
                </div>
                <div className="text-sm text-muted-foreground">Departments</div>
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
                  placeholder="Search by name, email, registration number, or department..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={filters.department} 
              onValueChange={(value: any) => setFilters({ ...filters, department: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept.split(' ')[0]} {/* Show abbreviated name */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.batch} 
              onValueChange={(value: any) => setFilters({ ...filters, batch: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {BATCHES.map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {batch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.crtEligibility} 
              onValueChange={(value: any) => setFilters({ ...filters, crtEligibility: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="CRT Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                <SelectItem value="NOT_ELIGIBLE">Not Eligible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedStudents([])}>
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

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>CRT Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.regNum}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {student.department.split(' ')[0]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.batch}</Badge>
                    </TableCell>
                    <TableCell>
                      {getCRTBadge(student.crtEligibility)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getAttendanceColor(student.attendancePercentage)}`}>
                        {student.attendancePercentage.toFixed(1)}%
                      </span>
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
                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {student.crtEligibility ? (
                            <DropdownMenuItem 
                              onClick={() => handleCRTAction(student, 'REMOVE')}
                              className="text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Remove from CRT
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleCRTAction(student, 'ADD')}
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Add to CRT
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Student
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
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

      {/* Create Student Modal */}
      <StudentFormModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadStudents}
      />

      {/* Edit Student Modal */}
      <StudentFormModal
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
        student={editingStudent}
        onSuccess={loadStudents}
      />

      {/* CRT Eligibility Modal */}
      <CRTEligibilityModal
        open={!!crtModalStudent}
        onOpenChange={(open) => !open && setCrtModalStudent(null)}
        student={crtModalStudent}
        action={crtModalAction}
        onSuccess={loadStudents}
      />
    </div>
  );
}
