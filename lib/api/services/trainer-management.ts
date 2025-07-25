import { apiClient } from "@/lib/api/client";
import type {
  Trainer,
  CreateTrainerRequest,
  UpdateTrainerRequest,
  TrainerFilters,
} from "@/lib/types/trainer-management";

// Toggle for mock data during development
const USE_MOCK_DATA = false;

export class TrainerManagementService {
  //     console.error(
  //       "[TrainerManagementService] Failed to create authenticated API:",
  //       error
  //     );
  //     throw new Error("Authentication required");
  //   }
  // }

  // Get all trainers with optional filtering
  static async getTrainers(filters?: TrainerFilters): Promise<Trainer[]> {
    if (USE_MOCK_DATA) {
      return this.getMockTrainers(filters);
    }

    try {
      // Using apiClient
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);

      const response = await apiClient.get(`/trainings?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error fetching trainers:",
        error
      );
      throw error;
    }
  }

  // Get trainer by ID
  static async getTrainerById(id: string): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      const trainers = await this.getMockTrainers();
      const trainer = trainers.find((t) => t.id === id);
      if (!trainer) throw new Error("Trainer not found");
      return trainer;
    }

    try {
      // Using apiClient
      const response = await apiClient.get(`/trainings/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error fetching trainer:",
        error
      );
      throw error;
    }
  }

  // Get trainer by Short Name (sn)
  static async getTrainerBySN(sn: string): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      const trainers = await this.getMockTrainers();
      const trainer = trainers.find((t) => t.sn === sn);
      if (!trainer) throw new Error("Trainer not found");
      return trainer;
    }

    try {
      // Using apiClient
      const response = await apiClient.get(
        `/trainings/sn/${encodeURIComponent(sn)}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error fetching trainer by SN:",
        error
      );
      throw error;
    }
  }

  // Create new trainer
  static async createTrainer(
    trainerData: CreateTrainerRequest
  ): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTrainer: Trainer = {
        id: `trainer-${Date.now()}`,
        ...trainerData,
      };

      return newTrainer;
    }

    try {
      // Using apiClient
      console.log("Going with: ", trainerData);
      const response = await apiClient.post("/trainings", trainerData);
      return response.data;
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error creating trainer:",
        error
      );
      throw error;
    }
  }

  // Update trainer
  static async updateTrainer(
    id: string,
    trainerData: UpdateTrainerRequest
  ): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const existingTrainer = await this.getTrainerById(id);
      const updatedTrainer: Trainer = {
        ...existingTrainer,
        ...trainerData,
        updatedAt: new Date().toISOString(),
      };

      return updatedTrainer;
    }

    try {
      // Using apiClient
      const response = await apiClient.put(`/trainings/${id}`, trainerData);
      return response.data;
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error updating trainer:",
        error
      );
      throw error;
    }
  }

  // Delete trainer
  static async deleteTrainer(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    try {
      // Using apiClient
      await apiClient.delete(`/trainings/${id}`);
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error deleting trainer:",
        error
      );
      throw error;
    }
  }

  // Bulk delete trainers
  static async bulkDeleteTrainers(TrainingIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return;
    }

    try {
      // Using apiClient
      await apiClient.post("/trainings/bulk-delete", { TrainingIds });
    } catch (error) {
      console.error(
        "[TrainerManagementService] Error bulk deleting trainers:",
        error
      );
      throw error;
    }
  }

  // Mock data for development
  private static async getMockTrainers(
    filters?: TrainerFilters
  ): Promise<Trainer[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const mockTrainers: Trainer[] = [
      {
        id: "1",
        name: "Dr. Rajesh Kumar",
        sn: "RK001",
        sections: 3,
        createdAt: "2023-01-15T10:00:00Z",
        updatedAt: "2024-06-20T14:30:00Z",
      },
      {
        id: "2",
        name: "Prof. Anita Sharma",
        sn: "AS002",
        sections: 4,
        createdAt: "2022-08-10T09:00:00Z",
        updatedAt: "2024-06-25T11:15:00Z",
      },
      {
        id: "3",
        name: "Mr. Vikram Singh",
        sn: "VS003",
        sections: 0,
        createdAt: "2023-03-05T09:00:00Z",
        updatedAt: "2024-06-15T16:45:00Z",
      },
      {
        id: "4",
        name: "Ms. Priya Patel",
        sn: "PP004",
        sections: 2,
        createdAt: "2023-06-12T08:00:00Z",
        updatedAt: "2024-06-22T13:20:00Z",
      },
      {
        id: "5",
        name: "Dr. Suresh Reddy",
        sn: "SR005",
        sections: 5,
        createdAt: "2021-09-20T07:30:00Z",
        updatedAt: "2024-06-26T09:15:00Z",
      },
      {
        id: "6",
        name: "Ms. Kavya Nair",
        sn: "KN006",
        sections: 6,
        createdAt: "2023-11-10T10:00:00Z",
        updatedAt: "2024-06-24T12:40:00Z",
      },
      {
        id: "7",
        name: "Mr. Arun Kumar",
        sn: "AK007",
        sections: 3,
        createdAt: "2022-12-05T09:30:00Z",
        updatedAt: "2024-06-23T15:10:00Z",
      },
      {
        id: "8",
        name: "Dr. Meera Gupta",
        sn: "MG008",
        sections: 4,
        createdAt: "2021-05-18T08:45:00Z",
        updatedAt: "2024-06-21T14:25:00Z",
      },
    ];

    let filteredTrainers = mockTrainers;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTrainers = filteredTrainers.filter(
        (trainer) =>
          trainer.name.toLowerCase().includes(searchTerm) ||
          trainer.sn.toLowerCase().includes(searchTerm)
      );
    }

    return filteredTrainers;
  }
}
