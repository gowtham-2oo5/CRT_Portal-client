import { ClientAuth } from "@/lib/auth/client";
import type {
  Section,
  CreateSectionRequest,
  UpdateSectionRequest,
  SectionFilters,
  RegisterStudentsRequest,
  UpdateStudentSectionRequest,
} from "@/lib/types/section-management";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class SectionManagementService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error(
        "[SectionManagementService] Failed to create authenticated API:",
        error
      );
      throw new Error("Authentication required");
    }
  }

  // Get all sections with optional filtering
  static async getSections(filters?: SectionFilters): Promise<Section[]> {
    if (USE_MOCK_DATA) {
      return this.getMockSections(filters);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.trainerId) params.append("trainerId", filters.trainerId);

      const response = await api.get(`/sections?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(
        "[SectionManagementService] Error fetching sections:",
        error
      );
      throw error;
    }
  }

  // Get section by ID
  static async getSectionById(id: string): Promise<Section> {
    if (USE_MOCK_DATA) {
      const sections = await this.getMockSections();
      const section = sections.find((s) => s.id === id);
      if (!section) throw new Error("Section not found");
      return section;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/sections/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error fetching section ${id}:`,
        error
      );
      throw error;
    }
  }

  // Get sections by trainer ID
  static async getSectionsByTrainer(trainerId: string): Promise<Section[]> {
    if (USE_MOCK_DATA) {
      const sections = await this.getMockSections();
      return sections.filter((s) => s.training.id === trainerId);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/sections/trainer/${trainerId}`);
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error fetching sections for trainer ${trainerId}:`,
        error
      );
      throw error;
    }
  }

  // Create new section
  static async createSection(
    sectionData: CreateSectionRequest
  ): Promise<Section> {
    if (USE_MOCK_DATA) {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        name: sectionData.sectionName,
        training: {
          id: sectionData.trainerId,
          name: "Mock Training",
          sn: "MT",
          sections: 1,
        },
        students: [],
        strength: 0,
      };
      return newSection;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post("/sections", sectionData);
      return response.data;
    } catch (error) {
      console.error(
        "[SectionManagementService] Error creating section:",
        error
      );
      throw error;
    }
  }

  // Update section
  static async updateSection(
    id: string,
    sectionData: UpdateSectionRequest
  ): Promise<Section> {
    if (USE_MOCK_DATA) {
      const sections = await this.getMockSections();
      const existingSection = sections.find((s) => s.id === id);
      if (!existingSection) throw new Error("Section not found");

      return {
        ...existingSection,
        name: sectionData.sectionName || existingSection.name,
        training: sectionData.trainerId
          ? {
              id: sectionData.trainerId,
              name: "Updated Training",
              sn: "UT",
              sections: 1,
            }
          : existingSection.training,
      };
    }

    try {
      const api = await this.getAuthenticatedApi();
      const requestData = {
        trainerId: sectionData.trainerId,
        sectionName: sectionData.sectionName,
      };
      const response = await api.put(`/sections/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error updating section ${id}:`,
        error
      );
      throw error;
    }
  }

  // Delete section
  static async deleteSection(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Deleting section ${id}`);
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.delete(`/sections/${id}`);
    } catch (error) {
      console.error(
        `[SectionManagementService] Error deleting section ${id}:`,
        error
      );
      throw error;
    }
  }

  // Register students to section via file upload
  static async registerStudents(sectionId: string, file: File): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log(
        `Mock: Registering students to section ${sectionId} via file`
      );
      return { message: "Students registered successfully" };
    }

    try {
      const api = await this.getAuthenticatedApi();
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        `/sections/${sectionId}/students`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error registering students to section ${sectionId}:`,
        error
      );
      throw error;
    }
  }

  // Update student's section
  static async updateStudentSection(
    studentId: string,
    sectionId: string
  ): Promise<Section> {
    if (USE_MOCK_DATA) {
      const sections = await this.getMockSections();
      const section = sections.find((s) => s.id === sectionId);
      if (!section) throw new Error("Section not found");
      return section;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(
        `/sections/student/${studentId}/section/${sectionId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error updating student ${studentId} section to ${sectionId}:`,
        error
      );
      throw error;
    }
  }

  // Bulk delete sections
  static async bulkDeleteSections(sectionIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(`Mock: Bulk deleting sections:`, sectionIds);
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await Promise.all(sectionIds.map((id) => api.delete(`/sections/${id}`)));
    } catch (error) {
      console.error(
        "[SectionManagementService] Error bulk deleting sections:",
        error
      );
      throw error;
    }
  }

  // Mock data for development
  private static async getMockSections(
    filters?: SectionFilters
  ): Promise<Section[]> {
    const mockSections: Section[] = [
      {
        id: "1",
        name: "Section A",
        training: {
          id: "training-1",
          name: "John Doe Training",
          sn: "JDT",
          sections: 2,
        },
        students: [
          {
            id: "student-1",
            name: "Alice Smith",
            email: "alice@example.com",
            phone: "1234567890",
            rollNumber: "21CS001",
            regNum: "REG001",
            department: "Computer Science",
            section: "A",
            batch: "Y22",
            crtEligibility: true,
            attendancePercentage: 85.5,
          },
        ],
        strength: 1,
      },
      {
        id: "2",
        name: "Section B",
        training: {
          id: "training-2",
          name: "Jane Wilson Training",
          sn: "JWT",
          sections: 1,
        },
        students: [],
        strength: 0,
      },
    ];

    let filteredSections = mockSections;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredSections = filteredSections.filter(
        (section) =>
          section.name.toLowerCase().includes(search) ||
          section.training.name.toLowerCase().includes(search)
      );
    }

    if (filters?.trainerId) {
      filteredSections = filteredSections.filter(
        (section) => section.training.id === filters.trainerId
      );
    }

    return filteredSections;
  }
}
