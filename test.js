const fs = require("fs");
const path = require("path");

// List of all TypeScript files
const allFiles = [
  "./app/(protected)/dashboard/admin/attendance/page.tsx",
  "./app/(protected)/dashboard/admin/bulk-operations/page.tsx",
  "./app/(protected)/dashboard/admin/page.tsx",
  "./app/(protected)/dashboard/admin/reports/page.tsx",
  "./app/(protected)/dashboard/admin/rooms/page.tsx",
  "./app/(protected)/dashboard/admin/schedule-management/page.tsx",
  "./app/(protected)/dashboard/admin/sections/page.tsx",
  "./app/(protected)/dashboard/admin/settings/page.tsx",
  "./app/(protected)/dashboard/admin/students/page.tsx",
  "./app/(protected)/dashboard/admin/trainers/page.tsx",
  "./app/(protected)/dashboard/admin/users/page.tsx",
  "./app/(protected)/dashboard/diagnostics/page.tsx",
  "./app/(protected)/dashboard/faculty/attendance/[timeSlotId]/page.tsx",
  "./app/(protected)/dashboard/faculty/attendance/mark/page.tsx",
  "./app/(protected)/dashboard/faculty/attendance/page.tsx",
  "./app/(protected)/dashboard/faculty/page.tsx",
  "./app/(protected)/dashboard/faculty/reports/page.tsx",
  "./app/(protected)/dashboard/faculty/timetable/page.tsx",
  "./app/(protected)/dashboard/page.tsx",
  "./app/(protected)/dashboard/websocket-test/page.tsx",
  "./app/(protected)/layout.tsx",
  "./app/error.tsx",
  "./app/forgot-password/page.tsx",
  "./app/layout.tsx",
  "./app/not-found.tsx",
  "./app/page.tsx",
  "./app/unauthorized/page.tsx",
  "./components/admin/admin-dashboard.tsx",
  "./components/admin/crt-eligibility-modal.tsx",
  "./components/admin/room-form-modal.tsx",
  "./components/admin/room-management.tsx",
  "./components/admin/schedule-init-modal.tsx",
  "./components/admin/schedule-management.tsx",
  "./components/admin/schedule-view-modal.tsx",
  "./components/admin/section-form-modal.tsx",
  "./components/admin/section-management.tsx",
  "./components/admin/section-schedule.tsx",
  "./components/admin/student-form-modal.tsx",
  "./components/admin/student-management.tsx",
  "./components/admin/time-slot-form-modal.tsx",
  "./components/admin/trainer-form-modal.tsx",
  "./components/admin/trainer-management.tsx",
  "./components/admin/user-form-modal.tsx",
  "./components/admin/user-management.tsx",
  "./components/auth/auth-guard.tsx",
  "./components/auth/client-auth-guard.tsx",
  "./components/auth/dev-auth-bypass.tsx",
  "./components/auth/login-form.tsx",
  "./components/auth/otp-dialog.tsx",
  "./components/auth/password-reset-modal.tsx",
  "./components/dashboard/breadcrumb.tsx",
  "./components/dashboard/dashboard-header.tsx",
  "./components/dashboard/dashboard-loader.tsx",
  "./components/dashboard/dashboard-nav.tsx",
  "./components/dashboard/dashboard-stats.tsx",
  "./components/dashboard/recent-activity.tsx",
  "./components/dashboard/user-menu.tsx",
  "./components/diagnostics/api-connection-test.tsx",
  "./components/faculty/analytics/AttendanceTrends.tsx",
  "./components/faculty/analytics/ExportButtons.tsx",
  "./components/faculty/analytics/PerformanceCharts.tsx",
  "./components/faculty/analytics/WeeklyTimetable.tsx",
  "./components/faculty/analytics/index.ts",
  "./components/faculty/attendance/AttendanceSubmissionForm.tsx",
  "./components/faculty/attendance/StudentAttendanceRow.tsx",
  "./components/faculty/attendance/StudentListCard.tsx",
  "./components/faculty/attendance/index.ts",
  "./components/faculty/consistent-faculty-dashboard.tsx",
  "./components/faculty/faculty-header.tsx",
  "./components/faculty/faculty-layout.tsx",
  "./components/faculty/faculty-nav.tsx",
  "./components/faculty/reports/AttendanceReportTable.tsx",
  "./components/faculty/reports/DateRangeFilter.tsx",
  "./components/faculty/reports/SectionAnalytics.tsx",
  "./components/faculty/reports/StudentDetailReport.tsx",
  "./components/faculty/reports/index.ts",
  "./components/faculty/session-management/CurrentSessionCard.tsx",
  "./components/faculty/session-management/NextSessionCard.tsx",
  "./components/faculty/session-management/SessionStatusBadge.tsx",
  "./components/faculty/session-management/SessionTimer.tsx",
  "./components/faculty/session-management/index.ts",
  "./components/faculty/websocket-faculty-dashboard-fixed.tsx",
  "./components/faculty/websocket-faculty-dashboard.tsx",
  "./components/theme-provider.tsx",
  "./components/theme-toggle.tsx",
  "./components/ui/alert.tsx",
  "./components/ui/avatar.tsx",
  "./components/ui/badge.tsx",
  "./components/ui/button.tsx",
  "./components/ui/card.tsx",
  "./components/ui/checkbox.tsx",
  "./components/ui/command.tsx",
  "./components/ui/dialog.tsx",
  "./components/ui/dropdown-menu.tsx",
  "./components/ui/form.tsx",
  "./components/ui/input.tsx",
  "./components/ui/label.tsx",
  "./components/ui/loading-spinner.tsx",
  "./components/ui/popover.tsx",
  "./components/ui/progress.tsx",
  "./components/ui/scroll-area.tsx",
  "./components/ui/select.tsx",
  "./components/ui/sonner.tsx",
  "./components/ui/switch.tsx",
  "./components/ui/table.tsx",
  "./components/ui/textarea.tsx",
  "./components/websocket/websocket-event-tester.tsx",
  "./components/websocket/websocket-test.tsx",
  "./lib/api/client.ts",
  "./lib/api/config.ts",
  "./lib/api/server.ts",
  "./lib/api/services/admin-mock.ts",
  "./lib/api/services/admin.ts",
  "./lib/api/services/attendance-reports.ts",
  "./lib/api/services/attendance.ts",
  "./lib/api/services/auth.ts",
  "./lib/api/services/faculty-attendance.ts",
  "./lib/api/services/room-management.ts",
  "./lib/api/services/section-management.ts",
  "./lib/api/services/section-schedule.ts",
  "./lib/api/services/student-management.ts",
  "./lib/api/services/trainer-management.ts",
  "./lib/api/services/user-management.ts",
  "./lib/api/utils.ts",
  "./lib/auth/client.ts",
  "./lib/auth/server-auth.ts",
  "./lib/auth/server-only.ts",
  "./lib/auth/server.ts",
  "./lib/auth/types.ts",
  "./lib/mock/faculty-dashboard-mock.ts",
  "./lib/types/admin.ts",
  "./lib/types/attendance.ts",
  "./lib/types/faculty.ts",
  "./lib/types/room-management.ts",
  "./lib/types/section-management.ts",
  "./lib/types/section-schedule.ts",
  "./lib/types/student-management.ts",
  "./lib/types/trainer-management.ts",
  "./lib/types/user-management.ts",
  "./lib/utils.ts",
  "./lib/utils/attendance-validation.ts",
  "./lib/websocket/websocket-service.ts",
  "./middleware.ts",
  "./tailwind.config.ts",
];

// Files that are automatically used by Next.js (routes, layouts, etc.)
const nextJsSpecialFiles = [
  "page.tsx",
  "layout.tsx",
  "error.tsx",
  "not-found.tsx",
  "middleware.ts",
  "tailwind.config.ts",
];

function getRelativePath(filePath) {
  return filePath.replace("./", "");
}

function getImportName(filePath) {
  const relativePath = getRelativePath(filePath);
  return relativePath.replace(/\.(tsx?|js)$/, "");
}

function isNextJsSpecialFile(filePath) {
  const fileName = path.basename(filePath);
  return (
    nextJsSpecialFiles.includes(fileName) ||
    (filePath.includes("/app/") && fileName === "page.tsx")
  );
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return "";
  }
}

function findImportsInFile(content, targetFile) {
  const targetImportName = getImportName(targetFile);
  const targetFileName = path.basename(targetFile, path.extname(targetFile));

  // Various import patterns to check
  const importPatterns = [
    // Direct imports: import ... from './path'
    new RegExp(
      `import.*from\\s*['"\`]([^'"\`]*${targetFileName}[^'"\`]*)['"\`]`,
      "g"
    ),
    // Dynamic imports: import('./path')
    new RegExp(
      `import\\s*\\(\\s*['"\`]([^'"\`]*${targetFileName}[^'"\`]*)['"\`]\\s*\\)`,
      "g"
    ),
    // Require: require('./path')
    new RegExp(
      `require\\s*\\(\\s*['"\`]([^'"\`]*${targetFileName}[^'"\`]*)['"\`]\\s*\\)`,
      "g"
    ),
  ];

  for (const pattern of importPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }

  return false;
}

function analyzeUsage() {
  const usedFiles = new Set();
  const unusedFiles = [];

  // Mark Next.js special files as used
  allFiles.forEach((file) => {
    if (isNextJsSpecialFile(file)) {
      usedFiles.add(file);
    }
  });

  // Check each file for imports
  allFiles.forEach((sourceFile) => {
    const content = readFileContent(sourceFile);
    if (!content) return;

    allFiles.forEach((targetFile) => {
      if (sourceFile === targetFile) return;

      if (findImportsInFile(content, targetFile)) {
        usedFiles.add(targetFile);
      }
    });
  });

  // Find unused files
  allFiles.forEach((file) => {
    if (!usedFiles.has(file)) {
      unusedFiles.push(file);
    }
  });

  return {
    totalFiles: allFiles.length,
    usedFiles: Array.from(usedFiles),
    unusedFiles: unusedFiles,
  };
}

const result = analyzeUsage();

console.log("=== UNUSED TYPESCRIPT FILES ANALYSIS ===\n");
console.log(`Total TypeScript files: ${result.totalFiles}`);
console.log(`Used files: ${result.usedFiles.length}`);
console.log(`Potentially unused files: ${result.unusedFiles.length}\n`);

if (result.unusedFiles.length > 0) {
  console.log("POTENTIALLY UNUSED FILES:");
  console.log("========================");
  result.unusedFiles.forEach((file) => {
    console.log(getRelativePath(file));
  });
} else {
  console.log("No unused files found!");
}
