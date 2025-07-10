#!/bin/bash
# Script to enable mock data for development

echo "Enabling mock data for all services..."

# Enable mock data in all service files
sed -i 's/const USE_MOCK_DATA = false;/const USE_MOCK_DATA = true;/g' lib/api/services/student-management.ts
sed -i 's/const USE_MOCK_DATA = false;/const USE_MOCK_DATA = true;/g' lib/api/services/user-management.ts  
sed -i 's/const USE_MOCK_DATA = false;/const USE_MOCK_DATA = true;/g' lib/api/services/trainer-management.ts
sed -i 's/const USE_MOCK_DATA = false;/const USE_MOCK_DATA = true;/g' lib/api/services/admin.ts

echo "Mock data enabled! Your UI will now work with sample data."
echo "Remember to disable this when your backend APIs are ready."
