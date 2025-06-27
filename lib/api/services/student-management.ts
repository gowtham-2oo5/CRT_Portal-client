import { ClientAuth } from "@/lib/auth/client";
import type { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest, 
  StudentFilters,
  CRTEligibilityRequest
} from "@/lib/types/student-management";

// Toggle for mock data during development
const USE_MOCK_DATA = true;

export class StudentManagementService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error("[StudentManagementService] Failed to create authenticated API:", error);
      throw new Error("Authentication required");
    }
  }

  // Get all students with optional filtering
  static async getStudents(filters?: StudentFilters): Promise<Student[]> {
    if (USE_MOCK_DATA) {
      return this.getMockStudents(filters);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.department && filters.department !== 'ALL') params.append('department', filters.department);
      if (filters?.batch && filters.batch !== 'ALL') params.append('batch', filters.batch);
      if (filters?.crtEligibility && filters.crtEligibility !== 'ALL') {
        params.append('crtEligibility', filters.crtEligibility === 'ELIGIBLE' ? 'true' : 'false');
      }

      const response = await api.get(`/students?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error fetching students:", error);
      throw error;
    }
  }

  // Get student by ID
  static async getStudentById(id: string): Promise<Student> {
    if (USE_MOCK_DATA) {
      const students = await this.getMockStudents();
      const student = students.find(s => s.id === id);
      if (!student) throw new Error('Student not found');
      return student;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error fetching student:", error);
      throw error;
    }
  }

  // Get student by email
  static async getStudentByEmail(email: string): Promise<Student> {
    if (USE_MOCK_DATA) {
      const students = await this.getMockStudents();
      const student = students.find(s => s.email === email);
      if (!student) throw new Error('Student not found');
      return student;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/students/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error fetching student by email:", error);
      throw error;
    }
  }

  // Get student by registration number
  static async getStudentByRegNum(regNum: string): Promise<Student> {
    if (USE_MOCK_DATA) {
      const students = await this.getMockStudents();
      const student = students.find(s => s.regNum === regNum);
      if (!student) throw new Error('Student not found');
      return student;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/students/regnum/${encodeURIComponent(regNum)}`);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error fetching student by regNum:", error);
      throw error;
    }
  }

  // Create new student
  static async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...studentData,
        crtEligibility: studentData.crtEligibility ?? true,
        attendancePercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newStudent;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error creating student:", error);
      throw error;
    }
  }

  // Update student
  static async updateStudent(id: string, studentData: UpdateStudentRequest): Promise<Student> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingStudent = await this.getStudentById(id);
      const updatedStudent: Student = {
        ...existingStudent,
        ...studentData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedStudent;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error("[StudentManagementService] Error updating student:", error);
      throw error;
    }
  }

  // Delete student
  static async deleteStudent(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.delete(`/students/${id}`);
    } catch (error) {
      console.error("[StudentManagementService] Error deleting student:", error);
      throw error;
    }
  }

  // Remove student from CRT
  static async removeFromCRT(id: string, reason: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.post(`/students/${id}/remove-from-crt?reason=${encodeURIComponent(reason)}`);
    } catch (error) {
      console.error("[StudentManagementService] Error removing student from CRT:", error);
      throw error;
    }
  }

  // Add student to CRT
  static async addToCRT(id: string, reason: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.post(`/students/${id}/add-to-crt?reason=${encodeURIComponent(reason)}`);
    } catch (error) {
      console.error("[StudentManagementService] Error adding student to CRT:", error);
      throw error;
    }
  }

  // Bulk delete students
  static async bulkDeleteStudents(studentIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.post('/students/bulk-delete', { studentIds });
    } catch (error) {
      console.error("[StudentManagementService] Error bulk deleting students:", error);
      throw error;
    }
  }

  // Mock data for development
  private static async getMockStudents(filters?: StudentFilters): Promise<Student[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@klu.ac.in',
        phone: '+91-9876543210',
        regNum: '21CSE001',
        department: 'Computer Science & Engineering',
        batch: '2021-2025',
        crtEligibility: true,
        feedback: 'Excellent student with strong programming skills',
        attendancePercentage: 92.5,
        createdAt: '2021-08-15T10:00:00Z',
        updatedAt: '2024-06-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Priya Patel',
        email: 'priya.patel@klu.ac.in',
        phone: '+91-9876543211',
        regNum: '22ECE045',
        department: 'Electronics & Communication Engineering',
        batch: '2022-2026',
        crtEligibility: true,
        feedback: 'Good academic performance, active in extracurriculars',
        attendancePercentage: 88.3,
        createdAt: '2022-08-10T09:00:00Z',
        updatedAt: '2024-06-25T11:15:00Z'
      },
      {
        id: '3',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@klu.ac.in',
        phone: '+91-9876543212',
        regNum: '21ME078',
        department: 'Mechanical Engineering',
        batch: '2021-2025',
        crtEligibility: false,
        feedback: 'Low attendance affecting academic performance',
        attendancePercentage: 65.2,
        createdAt: '2021-08-15T10:30:00Z',
        updatedAt: '2024-06-15T16:45:00Z'
      },
      {
        id: '4',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@klu.ac.in',
        phone: '+91-9876543213',
        regNum: '23CSE112',
        department: 'Computer Science & Engineering',
        batch: '2023-2027',
        crtEligibility: true,
        feedback: 'Outstanding performance in coding competitions',
        attendancePercentage: 95.8,
        createdAt: '2023-08-12T08:00:00Z',
        updatedAt: '2024-06-22T13:20:00Z'
      },
      {
        id: '5',
        name: 'Vikram Singh',
        email: 'vikram.singh@klu.ac.in',
        phone: '+91-9876543214',
        regNum: '22EEE089',
        department: 'Electrical & Electronics Engineering',
        batch: '2022-2026',
        crtEligibility: true,
        attendancePercentage: 79.4,
        createdAt: '2022-08-10T09:30:00Z',
        updatedAt: '2024-06-18T10:45:00Z'
      },
      {
        id: '6',
        name: 'Kavya Nair',
        email: 'kavya.nair@klu.ac.in',
        phone: '+91-9876543215',
        regNum: '21CE034',
        department: 'Civil Engineering',
        batch: '2021-2025',
        crtEligibility: false,
        feedback: 'Disciplinary issues affecting CRT eligibility',
        attendancePercentage: 72.1,
        createdAt: '2021-08-15T11:00:00Z',
        updatedAt: '2024-06-10T15:30:00Z'
      },
      {
        id: '7',
        name: 'Aditya Joshi',
        email: 'aditya.joshi@klu.ac.in',
        phone: '+91-9876543216',
        regNum: '24IT067',
        department: 'Information Technology',
        batch: '2024-2028',
        crtEligibility: true,
        attendancePercentage: 91.7,
        createdAt: '2024-08-10T07:30:00Z',
        updatedAt: '2024-06-26T09:15:00Z'
      },
      {
        id: '8',
        name: 'Riya Agarwal',
        email: 'riya.agarwal@klu.ac.in',
        phone: '+91-9876543217',
        regNum: '22CHE023',
        department: 'Chemical Engineering',
        batch: '2022-2026',
        crtEligibility: true,
        feedback: 'Strong analytical skills and leadership qualities',
        attendancePercentage: 87.9,
        createdAt: '2022-08-10T10:00:00Z',
        updatedAt: '2024-06-24T12:40:00Z'
      }
    ];

    // Apply filters
    let filteredStudents = mockStudents;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.regNum.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.department && filters.department !== 'ALL') {
      filteredStudents = filteredStudents.filter(student => 
        student.department === filters.department
      );
    }

    if (filters?.batch && filters.batch !== 'ALL') {
      filteredStudents = filteredStudents.filter(student => 
        student.batch === filters.batch
      );
    }

    if (filters?.crtEligibility && filters.crtEligibility !== 'ALL') {
      const isEligible = filters.crtEligibility === 'ELIGIBLE';
      filteredStudents = filteredStudents.filter(student => 
        student.crtEligibility === isEligible
      );
    }

    if (filters?.attendanceRange) {
      filteredStudents = filteredStudents.filter(student => 
        student.attendancePercentage >= filters.attendanceRange!.min &&
        student.attendancePercentage <= filters.attendanceRange!.max
      );
    }

    return filteredStudents;
  }
}
