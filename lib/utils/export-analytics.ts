/**
 * Export Analytics & History Tracking
 * Track export usage and provide insights
 */

export interface ExportHistoryEntry {
  id: string;
  type: string;
  timestamp: Date;
  recordCount: number;
  fileSize?: number;
  userId?: string;
  filters?: Record<string, any>;
  duration: number; // in milliseconds
  status: 'success' | 'error' | 'cancelled';
  errorMessage?: string;
}

export interface ExportAnalytics {
  totalExports: number;
  totalRecords: number;
  averageRecords: number;
  mostPopularType: string;
  recentExports: ExportHistoryEntry[];
  exportsByType: Record<string, number>;
  exportsByDate: Record<string, number>;
}

class ExportAnalyticsService {
  private readonly STORAGE_KEY = 'export_history';
  private readonly MAX_HISTORY_ENTRIES = 100;

  /**
   * Record a new export
   */
  recordExport(entry: Omit<ExportHistoryEntry, 'id' | 'timestamp'>): void {
    const history = this.getHistory();
    const newEntry: ExportHistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    history.unshift(newEntry);
    
    // Keep only the most recent entries
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history.splice(this.MAX_HISTORY_ENTRIES);
    }

    this.saveHistory(history);
  }

  /**
   * Get export history
   */
  getHistory(): ExportHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load export history:', error);
      return [];
    }
  }

  /**
   * Get export analytics
   */
  getAnalytics(): ExportAnalytics {
    const history = this.getHistory();
    const successfulExports = history.filter(entry => entry.status === 'success');

    if (successfulExports.length === 0) {
      return {
        totalExports: 0,
        totalRecords: 0,
        averageRecords: 0,
        mostPopularType: '',
        recentExports: [],
        exportsByType: {},
        exportsByDate: {},
      };
    }

    const totalRecords = successfulExports.reduce((sum, entry) => sum + entry.recordCount, 0);
    const exportsByType = successfulExports.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const exportsByDate = successfulExports.reduce((acc, entry) => {
      const date = entry.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularType = Object.entries(exportsByType)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalExports: successfulExports.length,
      totalRecords,
      averageRecords: Math.round(totalRecords / successfulExports.length),
      mostPopularType,
      recentExports: history.slice(0, 10),
      exportsByType,
      exportsByDate,
    };
  }

  /**
   * Clear export history
   */
  clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get export statistics for a specific type
   */
  getTypeStatistics(type: string): {
    count: number;
    totalRecords: number;
    averageRecords: number;
    lastExport?: Date;
  } {
    const history = this.getHistory();
    const typeExports = history.filter(entry => entry.type === type && entry.status === 'success');

    if (typeExports.length === 0) {
      return {
        count: 0,
        totalRecords: 0,
        averageRecords: 0,
      };
    }

    const totalRecords = typeExports.reduce((sum, entry) => sum + entry.recordCount, 0);

    return {
      count: typeExports.length,
      totalRecords,
      averageRecords: Math.round(totalRecords / typeExports.length),
      lastExport: typeExports[0]?.timestamp,
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveHistory(history: ExportHistoryEntry[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save export history:', error);
      }
    }
  }
}

export const exportAnalytics = new ExportAnalyticsService();

/**
 * Hook for tracking export performance
 */
export function useExportTracking() {
  const startExport = (type: string, filters?: Record<string, any>) => {
    const startTime = Date.now();
    
    return {
      complete: (recordCount: number, fileSize?: number) => {
        const duration = Date.now() - startTime;
        exportAnalytics.recordExport({
          type,
          recordCount,
          fileSize,
          filters,
          duration,
          status: 'success',
        });
      },
      
      error: (errorMessage: string) => {
        const duration = Date.now() - startTime;
        exportAnalytics.recordExport({
          type,
          recordCount: 0,
          filters,
          duration,
          status: 'error',
          errorMessage,
        });
      },
      
      cancel: () => {
        const duration = Date.now() - startTime;
        exportAnalytics.recordExport({
          type,
          recordCount: 0,
          filters,
          duration,
          status: 'cancelled',
        });
      },
    };
  };

  return { startExport };
}
