"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  bulkUploadStudents,
  bulkCreateSimpleRooms,
  bulkUploadTrainings,
  bulkUploadSections,
  bulkRegisterStudentsToSections,
  bulkUploadFaculties,
  bulkUploadTimetable,
} from "@/lib/api/services/bulk-operations";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

type OperationType =
  | "students"
  | "rooms"
  | "trainings"
  | "sections"
  | "register"
  | "faculties"
  | "timetable";

interface OperationConfig {
  title: string;
  description: string;
  handler: (file: File) => Promise<any>;
  successMessage: string;
  endpoint: string;
}

export function BulkOperations() {
  const [selectedOperation, setSelectedOperation] =
    useState<OperationType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operationConfigs: Record<OperationType, OperationConfig> = {
    students: {
      title: "Bulk Upload Students",
      description: "Upload a CSV file containing student information",
      handler: bulkUploadStudents,
      successMessage: "Students uploaded successfully",
      endpoint: "/bulk/students/upload",
    },
    rooms: {
      title: "Bulk Create Rooms",
      description: "Upload a CSV file containing room information",
      handler: bulkCreateSimpleRooms,
      successMessage: "Rooms created successfully",
      endpoint: "/bulk/simple-room/upload",
    },
    trainings: {
      title: "Bulk Upload Trainings",
      description: "Upload a CSV file containing training information",
      handler: bulkUploadTrainings,
      successMessage: "Trainings uploaded successfully",
      endpoint: "/bulk/Trainings/upload", // Note the capital T
    },
    sections: {
      title: "Bulk Upload Sections",
      description: "Upload a CSV file containing section information",
      handler: bulkUploadSections,
      successMessage: "Sections uploaded successfully",
      endpoint: "/bulk/section/upload",
    },
    register: {
      title: "Register Students to Sections",
      description: "Upload a CSV file to register students to sections",
      handler: bulkRegisterStudentsToSections,
      successMessage: "Students registered successfully",
      endpoint: "/bulk/register-students",
    },
    faculties: {
      title: "Bulk upload faculties",
      description: "Upload a CSV File to bulk upload faculties",
      handler: bulkUploadFaculties,
      successMessage: "Faculties created successfully",
      endpoint: "/bulk/faculties",
    },
    timetable: {
      title: "Upload TimeTable",
      description: "Upload time table csv file",
      handler: bulkUploadTimetable,
      successMessage: "Time Table uploaded successfully",
      endpoint: "/bulk/timetable/upload",
    },
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

    try {
      const config = operationConfigs[selectedOperation];
      const response = await config.handler(file);
      toast.success(config.successMessage);
      console.log("Response:", response);
    } catch (error: any) {
      console.error("Error in bulk operation:", error);

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

  const currentConfig = selectedOperation
    ? operationConfigs[selectedOperation]
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Operation Type
              </label>
              <Select onValueChange={handleOperationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Upload Students</SelectItem>
                  <SelectItem value="rooms">Create Rooms</SelectItem>
                  <SelectItem value="trainings">Upload Trainings</SelectItem>
                  <SelectItem value="sections">Upload Sections</SelectItem>
                  <SelectItem value="register">
                    Register Students to Sections
                  </SelectItem>
                  <SelectItem value="faculties">Upload Faculties</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentConfig && (
              <>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    {currentConfig.description}
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload CSV File
                  </label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Endpoint: {currentConfig.endpoint}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleFileUpload}
                  disabled={!file || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
