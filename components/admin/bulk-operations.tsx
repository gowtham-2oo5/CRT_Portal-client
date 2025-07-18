"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  bulkUploadStudents,
  bulkCreateRoomsSimple,
  bulkUploadTrainings,
  bulkUploadSections,
  registerStudentsToSections,
} from "@/lib/api/services/bulk-operations";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

type OperationType = 
  | "students" 
  | "rooms" 
  | "trainings" 
  | "sections" 
  | "register";

interface OperationConfig {
  title: string;
  description: string;
  handler: (file: File) => Promise<any>;
  successMessage: string;
  endpoint: string;
}

export function BulkOperations() {
  const [selectedOperation, setSelectedOperation] = useState<OperationType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operationConfigs: Record<OperationType, OperationConfig> = {
    students: {
      title: "Bulk Upload Students",
      description: "Upload a CSV file containing student information",
      handler: bulkUploadStudents,
      successMessage: "Students uploaded successfully",
      endpoint: "/bulk/students/upload"
    },
    rooms: {
      title: "Bulk Create Rooms",
      description: "Upload a CSV file containing room information",
      handler: bulkCreateRoomsSimple,
      successMessage: "Rooms created successfully",
      endpoint: "/bulk/simple-room/upload"
    },
    trainings: {
      title: "Bulk Upload Trainings",
      description: "Upload a CSV file containing training information",
      handler: bulkUploadTrainings,
      successMessage: "Trainings uploaded successfully",
      endpoint: "/bulk/Trainings/upload" // Note the capital T
    },
    sections: {
      title: "Bulk Upload Sections",
      description: "Upload a CSV file containing section information",
      handler: bulkUploadSections,
      successMessage: "Sections uploaded successfully",
      endpoint: "/bulk/section/upload"
    },
    register: {
      title: "Register Students to Sections",
      description: "Upload a CSV file to register students to sections",
      handler: registerStudentsToSections,
      successMessage: "Students registered successfully",
      endpoint: "/bulk/register-students"
    }
  };

  const handleFileUpload = async () => {
    if (!selectedOperation) {
      toast.error("Please select an operation type");
      return;
    }

    if (!file) {
      toast.error("No file selected");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Check if auth token exists
    const token = sessionStorage.getItem("auth-token");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const config = operationConfigs[selectedOperation];
      const response = await config.handler(file);
      toast.success(config.successMessage);
      console.log("Response:", response);
    } catch (error: any) {
      console.error("Error in bulk operation:", error);
      
      // Extract error message
      let errorMessage = "An unknown error occurred";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOperationChange = (value: string) => {
    setSelectedOperation(value as OperationType);
    setFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const currentConfig = selectedOperation ? operationConfigs[selectedOperation] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">1. Select Operation Type</label>
            <Select onValueChange={handleOperationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Upload Students</SelectItem>
                <SelectItem value="rooms">Create Rooms</SelectItem>
                <SelectItem value="trainings">Upload Trainings</SelectItem>
                <SelectItem value="sections">Upload Sections</SelectItem>
                <SelectItem value="register">Register Students to Sections</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedOperation && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">2. Upload CSV File</label>
                <div className="space-y-2">
                  {currentConfig && (
                    <Alert variant="default" className="bg-muted/50">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        {currentConfig.description}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Button 
                  onClick={handleFileUpload} 
                  disabled={isLoading || !file}
                  className="w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : "Upload"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
