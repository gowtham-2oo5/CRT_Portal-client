import { ClientAuth } from "@/lib/auth/client";
import type { 
  Trainer, 
  CreateTrainerRequest, 
  UpdateTrainerRequest, 
  TrainerFilters
} from "@/lib/types/trainer-management";

// Toggle for mock data during development
const USE_MOCK_DATA = true;

export class TrainerManagementService {
  private static async getAuthenticatedApi() {
    try {
      return ClientAuth.createAuthenticatedApi();
    } catch (error) {
      console.error("[TrainerManagementService] Failed to create authenticated API:", error);
      throw new Error("Authentication required");
    }
  }

  // Get all trainers with optional filtering
  static async getTrainers(filters?: TrainerFilters): Promise<Trainer[]> {
    if (USE_MOCK_DATA) {
      return this.getMockTrainers(filters);
    }

    try {
      const api = await this.getAuthenticatedApi();
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/trainers?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error fetching trainers:", error);
      throw error;
    }
  }

  // Get trainer by ID
  static async getTrainerById(id: string): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      const trainers = await this.getMockTrainers();
      const trainer = trainers.find(t => t.id === id);
      if (!trainer) throw new Error('Trainer not found');
      return trainer;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/trainers/${id}`);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error fetching trainer:", error);
      throw error;
    }
  }

  // Get trainer by email
  static async getTrainerByEmail(email: string): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      const trainers = await this.getMockTrainers();
      const trainer = trainers.find(t => t.email === email);
      if (!trainer) throw new Error('Trainer not found');
      return trainer;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/trainers/email/${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error fetching trainer by email:", error);
      throw error;
    }
  }

  // Get trainer by serial number (sn)
  static async getTrainerBySN(sn: string): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      const trainers = await this.getMockTrainers();
      const trainer = trainers.find(t => t.sn === sn);
      if (!trainer) throw new Error('Trainer not found');
      return trainer;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.get(`/trainers/sn/${encodeURIComponent(sn)}`);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error fetching trainer by SN:", error);
      throw error;
    }
  }

  // Create new trainer
  static async createTrainer(trainerData: CreateTrainerRequest): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTrainer: Trainer = {
        id: `trainer-${Date.now()}`,
        ...trainerData,
        sectionsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newTrainer;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.post('/trainers', trainerData);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error creating trainer:", error);
      throw error;
    }
  }

  // Update trainer
  static async updateTrainer(id: string, trainerData: UpdateTrainerRequest): Promise<Trainer> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingTrainer = await this.getTrainerById(id);
      const updatedTrainer: Trainer = {
        ...existingTrainer,
        ...trainerData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedTrainer;
    }

    try {
      const api = await this.getAuthenticatedApi();
      const response = await api.put(`/trainers/${id}`, trainerData);
      return response.data;
    } catch (error) {
      console.error("[TrainerManagementService] Error updating trainer:", error);
      throw error;
    }
  }

  // Delete trainer
  static async deleteTrainer(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.delete(`/trainers/${id}`);
    } catch (error) {
      console.error("[TrainerManagementService] Error deleting trainer:", error);
      throw error;
    }
  }

  // Bulk delete trainers
  static async bulkDeleteTrainers(trainerIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    try {
      const api = await this.getAuthenticatedApi();
      await api.post('/trainers/bulk-delete', { trainerIds });
    } catch (error) {
      console.error("[TrainerManagementService] Error bulk deleting trainers:", error);
      throw error;
    }
  }

  // Mock data for development
  private static async getMockTrainers(filters?: TrainerFilters): Promise<Trainer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const mockTrainers: Trainer[] = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@klu.ac.in',
        sn: 'RK001',
        sectionsCount: 3,
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-06-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Prof. Anita Sharma',
        email: 'anita.sharma@klu.ac.in',
        sn: 'AS002',
        sectionsCount: 4,
        createdAt: '2022-08-10T09:00:00Z',
        updatedAt: '2024-06-25T11:15:00Z'
      },
      {
        id: '3',
        name: 'Mr. Vikram Singh',
        email: 'vikram.singh@klu.ac.in',
        sn: 'VS003',
        sectionsCount: 0,
        createdAt: '2023-03-05T09:00:00Z',
        updatedAt: '2024-06-15T16:45:00Z'
      },
      {
        id: '4',
        name: 'Ms. Priya Patel',
        email: 'priya.patel@klu.ac.in',
        sn: 'PP004',
        sectionsCount: 2,
        createdAt: '2023-06-12T08:00:00Z',
        updatedAt: '2024-06-22T13:20:00Z'
      },
      {
        id: '5',
        name: 'Dr. Suresh Reddy',
        email: 'suresh.reddy@klu.ac.in',
        sn: 'SR005',
        sectionsCount: 5,
        createdAt: '2021-09-20T07:30:00Z',
        updatedAt: '2024-06-26T09:15:00Z'
      },
      {
        id: '6',
        name: 'Ms. Kavya Nair',
        email: 'kavya.nair@klu.ac.in',
        sn: 'KN006',
        sectionsCount: 6,
        createdAt: '2023-11-10T10:00:00Z',
        updatedAt: '2024-06-24T12:40:00Z'
      },
      {
        id: '7',
        name: 'Mr. Arun Kumar',
        email: 'arun.kumar@klu.ac.in',
        sn: 'AK007',
        sectionsCount: 3,
        createdAt: '2022-12-05T09:30:00Z',
        updatedAt: '2024-06-23T15:10:00Z'
      },
      {
        id: '8',
        name: 'Dr. Meera Gupta',
        email: 'meera.gupta@klu.ac.in',
        sn: 'MG008',
        sectionsCount: 4,
        createdAt: '2021-05-18T08:45:00Z',
        updatedAt: '2024-06-21T14:25:00Z'
      }
    ];

    // Apply filters
    let filteredTrainers = mockTrainers;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTrainers = filteredTrainers.filter(trainer => 
        trainer.name.toLowerCase().includes(searchTerm) ||
        trainer.email.toLowerCase().includes(searchTerm) ||
        trainer.sn.toLowerCase().includes(searchTerm)
      );
    }

    return filteredTrainers;
  }
}
