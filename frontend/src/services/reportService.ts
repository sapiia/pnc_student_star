const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pnc-student-star.onrender.com';

export interface OverviewStats {
  avgStudentScore: number;
  teacherCompletion: number;
  pendingEvaluations: number;
  trendData: Array<{ month: string; studentAvg: string }>;
}

export interface StudentReport {
  subject: string;
  score: number;
  fullMark: number;
}

export interface TeacherPerformance {
  id: number;
  name: string;
  department: string;
  rating: number;
  evaluations: number;
}

export interface TeacherReport {
  teacherPerformance: TeacherPerformance[];
  evaluationStatus: Array<{ name: string; value: number; color: string }>;
}

export interface FilterOptions {
  generations: string[];
  classesByGeneration: Record<string, string[]>;
}

export const reportService = {
  // Get overview statistics for dashboard
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await fetch(`${API_BASE_URL}/reports/overview`);
    if (!response.ok) {
      throw new Error('Failed to fetch overview stats');
    }
    return response.json();
  },

  // Get student performance reports
  async getStudentReports(params?: {
    generation?: string;
    className?: string;
    studentId?: string;
  }): Promise<StudentReport[]> {
    const url = new URL(`${API_BASE_URL}/reports/students`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch student reports');
    }
    return response.json();
  },

  // Get teacher performance reports
  async getTeacherReports(): Promise<TeacherReport> {
    const response = await fetch(`${API_BASE_URL}/reports/teachers`);
    if (!response.ok) {
      throw new Error('Failed to fetch teacher reports');
    }
    return response.json();
  },

  // Get filter options (generations, classes)
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${API_BASE_URL}/reports/filters`);
    if (!response.ok) {
      throw new Error('Failed to fetch filter options');
    }
    return response.json();
  }
};
