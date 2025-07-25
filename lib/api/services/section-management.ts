import { apiClient } from "@/lib/api/client";
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
  // Get all sections with optional filtering
  static async getSections(filters?: SectionFilters): Promise<Section[]> {
    if (USE_MOCK_DATA) {
      return this.getMockSections(filters);
    }

    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.TrainingId) params.append("trainingId", filters.TrainingId);

      const response = await apiClient.get(`/sections?${params.toString()}`);
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
      const response = await apiClient.get(`/sections/${id}`);
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
  static async getSectionsByTrainer(TrainingId: string): Promise<Section[]> {
    if (USE_MOCK_DATA) {
      const sections = await this.getMockSections();
      return sections.filter((s) => s.training?.id === TrainingId);
    }

    try {
      const response = await apiClient.get(`/sections/trainer/${TrainingId}`);
      return response.data;
    } catch (error) {
      console.error(
        `[SectionManagementService] Error fetching sections for trainer ${TrainingId}:`,
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
          id: sectionData.TrainingId,
          name: "Mock Training",
        },
        status: "ACTIVE",
        strength: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newSection;
    }

    try {
      const response = await apiClient.post("/sections", sectionData);
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
        ...sectionData,
        updatedAt: new Date().toISOString(),
      };
    }

    try {
      const response = await apiClient.put(`/sections/${id}`, sectionData);
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
      await apiClient.delete(`/sections/${id}`);
    } catch (error) {
      console.error(
        `[SectionManagementService] Error deleting section ${id}:`,
        error
      );
      throw error;
    }
  }

  // Register students to section
  static async registerStudents(
    sectionId: string,
    request: RegisterStudentsRequest
  ): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(
        `Mock: Registering ${request.studentIds.length} students to section ${sectionId}`
      );
      return;
    }

    try {
      await apiClient.post(`/sections/${sectionId}/register-students`, request);
    } catch (error) {
      console.error(
        `[SectionManagementService] Error registering students to section ${sectionId}:`,
        error
      );
      throw error;
    }
  }

  // Update student section
  static async updateStudentSection(
    studentId: string,
    request: UpdateStudentSectionRequest
  ): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(
        `Mock: Updating section for student ${studentId} to ${request.sectionId}`
      );
      return;
    }

    try {
      await apiClient.put(`/students/${studentId}/section`, request);
    } catch (error) {
      console.error(
        `[SectionManagementService] Error updating section for student ${studentId}:`,
        error
      );
      throw error;
    }
  }

  // Remove student from section
  static async removeStudentFromSection(
    sectionId: string,
    studentId: string
  ): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log(
        `Mock: Removing student ${studentId} from section ${sectionId}`
      );
      return;
    }

    try {
      await apiClient.delete(`/sections/${sectionId}/students/${studentId}`);
    } catch (error) {
      console.error(
        `[SectionManagementService] Error removing student ${studentId} from section ${sectionId}:`,
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
        name: "CSE-A",
        training: {
          id: "training-1",
          name: "Computer Science Engineering",
        },
        status: "ACTIVE",
        strength: 60,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "CSE-B",
        training: {
          id: "training-1",
          name: "Computer Science Engineering",
        },
        status: "ACTIVE",
        strength: 55,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "3",
        name: "ECE-A",
        training: {
          id: "training-2",
          name: "Electronics Engineering",
        },
        status: "INACTIVE",
        strength: 50,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
    ];

    let filteredSections = mockSections;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredSections = filteredSections.filter(
        (section) =>
          section.name.toLowerCase().includes(search) ||
          section.training?.name.toLowerCase().includes(search)
      );
    }

    if (filters?.TrainingId) {
      filteredSections = filteredSections.filter(
        (section) => section.training?.id === filters.TrainingId
      );
    }

    // if (filters?.status) {
    //   filteredSections = filteredSections.filter(
    //     (section) => section.status === filters.status
    //   );
    // }

    return filteredSections;
  }
}
