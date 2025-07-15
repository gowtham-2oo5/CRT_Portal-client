// 🎯 CRT Portal Attendance System - Main Attendance Service
// Created: 2025-07-15 | Phase 1 - Task 1.2

import { publicApi } from '../client';
import type {
  AttendanceSession,
  AttendanceRecord,
  AttendanceArchive,
  SubmitAttendanceRequest,
  AdminAttendanceRequest,
  BulkAttendanceUploadRequest,
  AttendanceFilters,
  AttendanceExportRequest,
  AttendanceApiResponse,
  SessionStudentsResponse,
  AttendanceSubmissionResponse,
  AttendanceValidation,
  BulkOperationResult,
} from '../../types/attendance';
import type { Student } from '../../types/section-management';

/**
 * Main Attendance Service
 * Handles core attendance management operations for both admin and faculty
 */
export class AttendanceService {
  
  // ============================================================================
  // ADMIN ATTENDANCE OPERATIONS
  // ============================================================================
  
  /**
   * Admin: Mark attendance for any section
   * Full access to all sections and time slots
   */
  static async markAttendanceAdmin(
    request: AdminAttendanceRequest
  ): Promise<AttendanceApiResponse<AttendanceSession>> {
    try {
      console.log('🔐 Admin marking attendance:', request);
      
      const response = await publicApi.post('/attendance/mark', request);
      
      console.log('✅ Admin attendance marked successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error marking admin attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
  
  /**
   * Admin: Get attendance for any section
   */
  static async getAttendanceBySection(
    sectionId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceSession[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.includeArchived) params.append('includeArchived', 'true');
      
      const response = await publicApi.get(`/attendance/section/${sectionId}?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching section attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
  
  /**
   * Admin: Get all attendance sessions with filters
   */
  static async getAllAttendance(
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceSession[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.sectionId) params.append('sectionId', filters.sectionId);
      if (filters?.facultyId) params.append('facultyId', filters.facultyId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.attendanceThreshold) {
        params.append('attendanceThreshold', filters.attendanceThreshold.toString());
      }
      
      const response = await publicApi.get(`/attendance/all?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching all attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
  
  // ============================================================================
  // ATTENDANCE SESSION MANAGEMENT
  // ============================================================================
  
  /**
   * Get attendance session by ID
   */
  static async getAttendanceSession(
    sessionId: string
  ): Promise<AttendanceApiResponse<AttendanceSession>> {
    try {
      const response = await publicApi.get(`/attendance/session/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching attendance session:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch session');
    }
  }
  
  /**
   * Update attendance session
   */
  static async updateAttendanceSession(
    sessionId: string,
    updates: Partial<AttendanceSession>
  ): Promise<AttendanceApiResponse<AttendanceSession>> {
    try {
      console.log('🔄 Updating attendance session:', sessionId, updates);
      
      const response = await publicApi.put(`/attendance/session/${sessionId}`, updates);
      
      console.log('✅ Attendance session updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating attendance session:', error);
      throw new Error(error.response?.data?.message || 'Failed to update session');
    }
  }
  
  /**
   * Delete attendance session
   */
  static async deleteAttendanceSession(
    sessionId: string
  ): Promise<AttendanceApiResponse<{ deleted: boolean }>> {
    try {
      console.log('🗑️ Deleting attendance session:', sessionId);
      
      const response = await publicApi.delete(`/attendance/session/${sessionId}`);
      
      console.log('✅ Attendance session deleted:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting attendance session:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete session');
    }
  }
  
  // ============================================================================
  // STUDENT ATTENDANCE RECORDS
  // ============================================================================
  
  /**
   * Get student attendance history
   */
  static async getStudentAttendance(
    studentId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceRecord[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.sectionId) params.append('sectionId', filters.sectionId);
      
      const response = await publicApi.get(`/attendance/student/${studentId}?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching student attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch student attendance');
    }
  }
  
  /**
   * Update individual student attendance record
   */
  static async updateStudentAttendance(
    recordId: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceApiResponse<AttendanceRecord>> {
    try {
      console.log('🔄 Updating student attendance record:', recordId, updates);
      
      const response = await publicApi.put(`/attendance/record/${recordId}`, updates);
      
      console.log('✅ Student attendance record updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating student attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to update attendance record');
    }
  }
  
  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================
  
  /**
   * Bulk attendance marking
   */
  static async bulkMarkAttendance(
    request: AdminAttendanceRequest
  ): Promise<AttendanceApiResponse<BulkOperationResult>> {
    try {
      console.log('📦 Bulk marking attendance:', request);
      
      const response = await publicApi.post('/bulk/attendance/mark', request);
      
      console.log('✅ Bulk attendance marked:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error in bulk attendance marking:', error);
      throw new Error(error.response?.data?.message || 'Failed to bulk mark attendance');
    }
  }
  
  /**
   * Bulk attendance upload via CSV
   */
  static async bulkUploadAttendance(
    request: BulkAttendanceUploadRequest
  ): Promise<AttendanceApiResponse<BulkOperationResult>> {
    try {
      console.log('📤 Uploading bulk attendance file:', request.file.name);
      
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('timeSlotId', request.timeSlotId);
      formData.append('dateTime', request.dateTime);
      formData.append('topicTaught', request.topicTaught);
      
      const response = await publicApi.post('/bulk/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Bulk attendance uploaded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error uploading bulk attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload attendance file');
    }
  }
  
  // ============================================================================
  // ATTENDANCE ARCHIVING
  // ============================================================================
  
  /**
   * Archive attendance records
   */
  static async archiveAttendance(
    year: number,
    month?: number
  ): Promise<AttendanceApiResponse<{ archivedCount: number }>> {
    try {
      console.log('🗄️ Archiving attendance records:', { year, month });
      
      const params = new URLSearchParams();
      params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      
      const response = await publicApi.post(`/attendance/archive?${params}`);
      
      console.log('✅ Attendance records archived:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error archiving attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to archive attendance');
    }
  }
  
  /**
   * Get archived attendance records
   */
  static async getArchivedAttendance(
    studentId?: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceApiResponse<AttendanceArchive[]>> {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('studentId', studentId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      
      const response = await publicApi.get(`/attendance/archived?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching archived attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch archived attendance');
    }
  }
  
  // ============================================================================
  // VALIDATION & UTILITIES
  // ============================================================================
  
  /**
   * Validate attendance submission
   */
  static async validateAttendanceSubmission(
    request: SubmitAttendanceRequest | AdminAttendanceRequest
  ): Promise<AttendanceApiResponse<AttendanceValidation>> {
    try {
      const response = await publicApi.post('/attendance/validate', request);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error validating attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate attendance');
    }
  }
  
  /**
   * Export attendance data
   */
  static async exportAttendance(
    request: AttendanceExportRequest
  ): Promise<Blob> {
    try {
      console.log('📊 Exporting attendance data:', request);
      
      const response = await publicApi.post('/attendance/export', request, {
        responseType: 'blob',
      });
      
      console.log('✅ Attendance data exported successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error exporting attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to export attendance');
    }
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Calculate attendance percentage
   */
  static calculateAttendancePercentage(
    presentCount: number,
    totalStudents: number
  ): number {
    if (totalStudents === 0) return 0;
    return Math.round((presentCount / totalStudents) * 100 * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Format attendance session for display
   */
  static formatAttendanceSession(session: AttendanceSession): string {
    const date = new Date(session.date).toLocaleDateString();
    const timeSlot = `${session.startTime}-${session.endTime}`;
    const percentage = session.attendancePercentage.toFixed(1);
    
    return `${date} | ${timeSlot} | ${session.presentCount}/${session.totalStudents} (${percentage}%)`;
  }
  
  /**
   * Check if user can access attendance for a section
   */
  static canAccessSection(
    userRole: 'ADMIN' | 'FACULTY',
    assignedSections: string[],
    sectionId: string
  ): boolean {
    if (userRole === 'ADMIN') return true;
    return assignedSections.includes(sectionId);
  }
}
