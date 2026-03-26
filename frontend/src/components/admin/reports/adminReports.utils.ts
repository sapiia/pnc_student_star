import { CRITERIA } from "../../../constants";

import type {
  AdminReportsTab,
  ApiCriteriaResponse,
  CriterionNavItem,
  ReportChartDatum,
  ReportCriterion,
  StudentLevel,
  StudentRecord,
} from "./adminReports.types";

export const REPORT_TABS: readonly AdminReportsTab[] = [
  "overview",
  "students",
  "teachers",
];

export const REPORT_TAB_CONTENT_IDS: Record<AdminReportsTab, string> = {
  overview: "overview-content",
  students: "student-content",
  teachers: "teacher-content",
};

export const CRITERIA_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
  "#22C55E",
  "#0EA5E9",
  "#EF4444",
];

export const parseGeneration = (student: StudentRecord) => {
  const direct = String(student.generation || "").trim();
  if (direct) return direct;

  const match = String(student.class || "").match(/gen\s*(\d{4})/i);
  return match?.[1] || "";
};

export const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_match, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

export const parsePeriodParts = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const yearQuarterMatch = trimmed.match(/^(\d{4})\s*[-/ ]\s*Q([1-4])$/i);
  if (yearQuarterMatch) {
    return {
      quarter: Number(yearQuarterMatch[2]),
      year: Number(yearQuarterMatch[1]),
    };
  }

  const quarterYearMatch = trimmed.match(/^Q([1-4])\s*[-/ ]?\s*(\d{4})$/i);
  if (quarterYearMatch) {
    return {
      quarter: Number(quarterYearMatch[1]),
      year: Number(quarterYearMatch[2]),
    };
  }

  return null;
};

export const formatPeriodLabel = (year: number, quarter: number) =>
  `Q${quarter} ${year}`;

export const getScoreLevel = (
  score?: number | null,
): StudentLevel | null => {
  if (score == null || Number.isNaN(score)) return null;
  if (score < 3) return "Low";
  if (score < 4) return "Medium";
  return "High";
};

export const buildCriteriaNav = (
  criteriaData?: ApiCriteriaResponse | null,
): CriterionNavItem[] => {
  const activeCriteria = Array.isArray(criteriaData?.criteria)
    ? criteriaData.criteria.filter(
        (criterion) =>
          String(criterion?.status || "").trim().toLowerCase() === "active",
      )
    : [];

  if (activeCriteria.length > 0) {
    return activeCriteria.map((criterion, index) => {
      const label = String(
        criterion.name || `Criterion ${index + 1}`,
      ).trim();
      const rawKey = String(
        criterion.key || label || criterion.id || `criterion${index + 1}`,
      );

      return {
        id: String(
          criterion.id || `CRIT-${String(index + 1).padStart(3, "0")}`,
        ),
        key: toCriterionKey(rawKey),
        label,
      };
    });
  }

  return CRITERIA.map((criterion) => ({
    id: criterion.key,
    key: toCriterionKey(criterion.key),
    label: criterion.label,
  }));
};

export const getCriteriaList = (
  criteriaNav: CriterionNavItem[],
): ReportCriterion[] =>
  criteriaNav.length > 0
    ? criteriaNav.map((criterion) => ({
        key: criterion.key,
        label: criterion.label,
      }))
    : CRITERIA.map((criterion) => ({
        key: toCriterionKey(criterion.key),
        label: criterion.label,
      }));

export const getStudentReportTitle = (
  selectedClass: string | "All",
  selectedGen: string | "All",
) => {
  if (selectedClass !== "All") {
    return `Class ${selectedClass} Performance`;
  }

  if (selectedGen !== "All") {
    return `${selectedGen} Performance`;
  }

  return "Overall Student Performance";
};

export const getCriterionInsightLabel = (
  reportData: ReportChartDatum[],
  mode: "highest" | "lowest",
) => {
  if (reportData.every((item) => item.score === 0)) {
    return "No data yet";
  }

  return reportData.reduce((best, current) => {
    if (mode === "highest") {
      return best.score > current.score ? best : current;
    }

    return best.score < current.score ? best : current;
  }).subject;
};
