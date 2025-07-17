// Trainer Management Types based on your actual API schema

export interface Trainer {
  id: string;
  name: string;
  sn: string; // Short Name/short form
  sections?: number; // Derived from sections relationship
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainerRequest {
  name: string;
  sn: string;
}

export interface UpdateTrainerRequest {
  name?: string;
  email?: string;
  sn?: string;
}

export interface TrainerFilters {
  search?: string; // Search by name, email, or sn
}

export interface BulkTrainerOperation {
  TrainingIds: string[];
  operation: "DELETE";
}
