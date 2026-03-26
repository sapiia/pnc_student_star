import { useEffect, useMemo, useState } from "react";

import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
} from "../../../lib/api";
import type {
  AdminReportsTab,
  ApiCriteriaResponse,
  ApiReportUserRecord,
  CriterionNavItem,
  EvaluationRecord,
  FeedbackRecord,
  ReportNotice,
  StudentGenderFilter,
  StudentLevelFilter,
  StudentRecord,
} from "./adminReports.types";
import {
  CRITERIA_COLORS,
  buildCriteriaNav,
  formatPeriodLabel,
  getCriteriaList,
  getCriterionInsightLabel,
  getScoreLevel,
  getStudentReportTitle,
  parseGeneration,
  parsePeriodParts,
  toCriterionKey,
} from "./adminReports.utils";

type RawApiUserCollection = unknown;

const mapUserToReportRecord = (
  user: ApiReportUserRecord,
  fallbackName: string,
): StudentRecord | null => {
  const id = Number(user.id);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const resolvedName =
    String(user.name || "").trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    fallbackName;

  return {
    class: String(user.class || "").trim(),
    email: String(user.email || "").trim(),
    gender: String(user.gender || "").trim(),
    generation: user.generation ? String(user.generation).trim() : undefined,
    id,
    name: resolvedName,
    profileImage: resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR),
  };
};

const extractUsersByRole = (
  value: RawApiUserCollection,
  role: "student" | "teacher",
  fallbackName: string,
) => {
  if (!Array.isArray(value)) {
    return [] as StudentRecord[];
  }

  return value.flatMap((entry) => {
    const user = (entry || {}) as ApiReportUserRecord;
    if (
      String(user.role || "")
        .trim()
        .toLowerCase() !== role
    ) {
      return [];
    }

    const mappedUser = mapUserToReportRecord(user, fallbackName);
    return mappedUser ? [mappedUser] : [];
  });
};

export function useAdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview" as AdminReportsTab);
  const [selectedGen, setSelectedGen] = useState("All" as string | "All");
  const [selectedClass, setSelectedClass] = useState("All" as string | "All");
  const [selectedGender, setSelectedGender] = useState(
    "All" as StudentGenderFilter,
  );
  const [selectedLevel, setSelectedLevel] = useState(
    "All" as StudentLevelFilter,
  );
  const [selectedTeacherQuarter, setSelectedTeacherQuarter] = useState(
    "All" as string,
  );
  const [students, setStudents] = useState([] as StudentRecord[]);
  const [teachers, setTeachers] = useState([] as StudentRecord[]);
  const [evaluations, setEvaluations] = useState([] as EvaluationRecord[]);
  const [feedbacks, setFeedbacks] = useState([] as FeedbackRecord[]);
  const [criteriaNav, setCriteriaNav] = useState([] as CriterionNavItem[]);
  const [activeCriterionKey, setActiveCriterionKey] = useState("overall");
  const [ratingScale, setRatingScale] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null as ReportNotice | null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, evalsRes, criteriaRes, feedbackRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/evaluations`),
            fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
            fetch(`${API_BASE_URL}/feedbacks`),
          ]);

        if (!usersRes.ok) {
          throw new Error("Failed to load users.");
        }

        if (!evalsRes.ok) {
          throw new Error("Failed to load evaluations.");
        }

        const usersData = (await usersRes.json()) as RawApiUserCollection;
        const evalsData = await evalsRes.json();
        const criteriaData = (await criteriaRes
          .json()
          .catch(() => ({}))) as ApiCriteriaResponse | null;
        const feedbackData = await feedbackRes.json().catch(() => []);

        setStudents(extractUsersByRole(usersData, "student", "Student"));
        setTeachers(extractUsersByRole(usersData, "teacher", "Teacher"));
        setEvaluations(Array.isArray(evalsData) ? evalsData : []);
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
        setCriteriaNav(buildCriteriaNav(criteriaData));
        setRatingScale(Math.max(1, Number(criteriaData?.ratingScale || 5)));
      } catch (fetchError: unknown) {
        console.error(fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load report data.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  useEffect(() => {
    if (
      activeCriterionKey !== "overall" &&
      criteriaNav.every((criterion) => criterion.key !== activeCriterionKey)
    ) {
      setActiveCriterionKey("overall");
    }
  }, [activeCriterionKey, criteriaNav]);

  const generations = useMemo(() => {
    const uniqueGenerations = new Set<string>();
    students.forEach((student) => {
      const generation = parseGeneration(student);
      if (generation) {
        uniqueGenerations.add(generation);
      }
    });

    return Array.from(uniqueGenerations).sort();
  }, [students]);

  const studentAverageMap = useMemo(() => {
    const totals = new Map<number, { count: number; total: number }>();

    evaluations.forEach((evaluation) => {
      const userId = Number(evaluation.user_id);
      const score = Number(evaluation.average_score || 0);
      if (!Number.isInteger(userId) || !Number.isFinite(score)) {
        return;
      }

      const entry = totals.get(userId) || { count: 0, total: 0 };
      entry.count += 1;
      entry.total += score;
      totals.set(userId, entry);
    });

    const averages = new Map<number, number>();
    totals.forEach((entry, userId) => {
      if (entry.count > 0) {
        averages.set(userId, Number((entry.total / entry.count).toFixed(2)));
      }
    });

    return averages;
  }, [evaluations]);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        if (selectedGen !== "All" && parseGeneration(student) !== selectedGen) {
          return false;
        }

        if (selectedClass !== "All" && student.class !== selectedClass) {
          return false;
        }

        if (selectedLevel !== "All") {
          const level = getScoreLevel(studentAverageMap.get(student.id));
          if (!level || level !== selectedLevel) {
            return false;
          }
        }

        return true;
      }),
    [selectedClass, selectedGen, selectedLevel, studentAverageMap, students],
  );

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();

    students.forEach((student) => {
      if (selectedGen === "All" || parseGeneration(student) === selectedGen) {
        if (student.class) {
          classSet.add(student.class);
        }
      }
    });

    return Array.from(classSet).sort();
  }, [selectedGen, students]);

  const filteredEvaluations = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((student) => student.id));
    let filtered = evaluations.filter((evaluation) =>
      studentIds.has(Number(evaluation.user_id)),
    );

    if (selectedGender !== "All") {
      const normalizedGender = selectedGender.toLowerCase();
      const genderIds = new Set(
        filteredStudents
          .filter(
            (student) =>
              String(student.gender || "")
                .trim()
                .toLowerCase() === normalizedGender,
          )
          .map((student) => student.id),
      );

      filtered = filtered.filter((evaluation) =>
        genderIds.has(Number(evaluation.user_id)),
      );
    }

    return filtered;
  }, [evaluations, filteredStudents, selectedGender]);

  const criteriaList = useMemo(
    () => getCriteriaList(criteriaNav),
    [criteriaNav],
  );

  const criteriaColorMap = useMemo(() => {
    const colorMap = new Map<string, string>();

    criteriaList.forEach((criterion, index) => {
      const color = CRITERIA_COLORS[index % CRITERIA_COLORS.length];
      colorMap.set(criterion.key, color);
      colorMap.set(toCriterionKey(criterion.label), color);
    });

    return colorMap;
  }, [criteriaList]);

  const currentReportData = useMemo(() => {
    const totals = new Map<
      string,
      { count: number; label: string; total: number }
    >();
    const lookup = new Map<string, string>();

    criteriaList.forEach((criterion) => {
      totals.set(criterion.key, {
        count: 0,
        label: criterion.label,
        total: 0,
      });
      lookup.set(toCriterionKey(criterion.key), criterion.key);
      lookup.set(toCriterionKey(criterion.label), criterion.key);
    });

    filteredEvaluations.forEach((evaluation) => {
      (evaluation.responses || []).forEach((response) => {
        const canonicalKey =
          lookup.get(toCriterionKey(String(response.criterion_key || ""))) ||
          lookup.get(toCriterionKey(String(response.criterion_name || "")));

        if (!canonicalKey) {
          return;
        }

        const entry = totals.get(canonicalKey);
        if (!entry) {
          return;
        }

        entry.count += 1;
        entry.total += Number(response.star_value || 0);
      });
    });

    return criteriaList.map((criterion) => {
      const entry = totals.get(criterion.key);
      return {
        color: criteriaColorMap.get(criterion.key) || "#5d5fef",
        fullMark: ratingScale,
        score:
          entry && entry.count > 0
            ? Number((entry.total / entry.count).toFixed(2))
            : 0,
        subject: criterion.label,
      };
    });
  }, [criteriaColorMap, criteriaList, filteredEvaluations, ratingScale]);

  const radarData = useMemo(
    () =>
      currentReportData.map((item) => ({
        curr: Math.max(0, item.score),
        subject: item.subject,
      })),
    [currentReportData],
  );

  const radarKeys = useMemo(
    () => [
      {
        color: "#4f46e5",
        fill: "#818cf8",
        key: "curr",
        name:
          selectedGender === "All" ? "Student Avg" : `${selectedGender} Avg`,
      },
    ],
    [selectedGender],
  );

  const strongestArea = useMemo(
    () => getCriterionInsightLabel(currentReportData, "highest"),
    [currentReportData],
  );

  const weakestArea = useMemo(
    () => getCriterionInsightLabel(currentReportData, "lowest"),
    [currentReportData],
  );

  const studentChartTitle = useMemo(
    () => getStudentReportTitle(selectedClass, selectedGen),
    [selectedClass, selectedGen],
  );

  const overallStats = useMemo(() => {
    const studentIds = new Set(students.map((student) => student.id));
    const studentEvaluations = evaluations.filter((evaluation) =>
      studentIds.has(Number(evaluation.user_id)),
    );
    const totalStudents = students.length;
    const evaluatedStudents = new Set(
      studentEvaluations.map((evaluation) => Number(evaluation.user_id)),
    ).size;
    const completionRate =
      totalStudents > 0
        ? Math.round((evaluatedStudents / totalStudents) * 100)
        : 0;
    const pendingEvaluations = Math.max(0, totalStudents - evaluatedStudents);
    const avgScore =
      studentEvaluations.length > 0
        ? Number(
            (
              studentEvaluations.reduce(
                (sum, evaluation) =>
                  sum + Number(evaluation.average_score || 0),
                0,
              ) / studentEvaluations.length
            ).toFixed(2),
          )
        : 0;

    return {
      avgScore,
      completionRate,
      evaluatedStudents,
      pendingEvaluations,
      totalStudents,
    };
  }, [evaluations, students]);

  const evaluationMap = useMemo(() => {
    const nextMap = new Map<number, EvaluationRecord>();
    evaluations.forEach((evaluation) => {
      nextMap.set(Number(evaluation.id), evaluation);
    });
    return nextMap;
  }, [evaluations]);

  const teacherQuarterOptions = useMemo(() => {
    const periods = new Map<string, { quarter: number; year: number }>();

    evaluations.forEach((evaluation) => {
      let period = parsePeriodParts(evaluation.period);
      if (!period) {
        const dateValue = evaluation.submitted_at || evaluation.created_at;
        if (dateValue) {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            period = {
              quarter: Math.floor(date.getUTCMonth() / 3) + 1,
              year: date.getUTCFullYear(),
            };
          }
        }
      }

      if (!period) {
        return;
      }

      periods.set(`${period.year}-Q${period.quarter}`, period);
    });

    const sortedPeriods = Array.from(periods.values()).sort((left, right) => {
      if (left.year !== right.year) {
        return left.year - right.year;
      }

      return left.quarter - right.quarter;
    });

    if (sortedPeriods.length === 0) {
      const currentYear = new Date().getFullYear();
      return [1, 2, 3, 4].map((quarter) =>
        formatPeriodLabel(currentYear, quarter),
      );
    }

    const minYear = sortedPeriods[0].year;
    const maxYear = sortedPeriods[sortedPeriods.length - 1].year;
    const allOptions: string[] = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      for (let quarter = 1; quarter <= 4; quarter += 1) {
        allOptions.push(formatPeriodLabel(year, quarter));
      }
    }

    return allOptions;
  }, [evaluations]);

  const filteredTeacherFeedbacks = useMemo(() => {
    if (selectedTeacherQuarter === "All") {
      return feedbacks;
    }

    return feedbacks.filter((feedback) => {
      const evaluationId = Number(feedback.evaluation_id || 0);
      if (!evaluationId) {
        return false;
      }

      const evaluation = evaluationMap.get(evaluationId);
      if (!evaluation) {
        return false;
      }

      let period = parsePeriodParts(evaluation.period);
      if (!period) {
        const dateValue = evaluation.submitted_at || evaluation.created_at;
        if (dateValue) {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            period = {
              quarter: Math.floor(date.getUTCMonth() / 3) + 1,
              year: date.getUTCFullYear(),
            };
          }
        }
      }

      return period
        ? formatPeriodLabel(period.year, period.quarter) ===
            selectedTeacherQuarter
        : false;
    });
  }, [evaluationMap, feedbacks, selectedTeacherQuarter]);

  const teacherPerformance = useMemo(() => {
    const feedbackByTeacher = new Map<number, FeedbackRecord[]>();

    filteredTeacherFeedbacks.forEach((feedback) => {
      const teacherId = Number(feedback.teacher_id);
      if (!Number.isInteger(teacherId) || teacherId <= 0) {
        return;
      }

      const list = feedbackByTeacher.get(teacherId) || [];
      list.push(feedback);
      feedbackByTeacher.set(teacherId, list);
    });

    return teachers
      .map((teacher) => {
        const teacherId = Number(teacher.id);
        const teacherFeedbacks = feedbackByTeacher.get(teacherId) || [];
        const uniqueStudents = new Set(
          teacherFeedbacks
            .map((feedback) => Number(feedback.student_id))
            .filter((id) => Number.isInteger(id) && id > 0),
        );
        const evaluationScores = teacherFeedbacks
          .map((feedback) => {
            const evaluationId = Number(feedback.evaluation_id || 0);
            if (!evaluationId) {
              return null;
            }

            const evaluation = evaluationMap.get(evaluationId);
            return evaluation ? Number(evaluation.average_score || 0) : null;
          })
          .filter((score): score is number => typeof score === "number");

        const avgScore =
          evaluationScores.length > 0
            ? Number(
                (
                  evaluationScores.reduce((sum, score) => sum + score, 0) /
                  evaluationScores.length
                ).toFixed(1),
              )
            : 0;

        return {
          avgScore,
          dept: teacher.class || "Teaching Staff",
          id: teacherId,
          name: teacher.name || `Teacher #${teacherId}`,
          profileImage: teacher.profileImage,
          studentCount: uniqueStudents.size,
        };
      })
      .sort(
        (left, right) =>
          right.studentCount - left.studentCount ||
          right.avgScore - left.avgScore,
      );
  }, [evaluationMap, filteredTeacherFeedbacks, teachers]);

  const feedbackStatusData = useMemo(() => {
    const studentWithFeedback = new Set(
      filteredTeacherFeedbacks
        .map((feedback) => Number(feedback.student_id))
        .filter((id) => Number.isInteger(id) && id > 0),
    );
    const completed = studentWithFeedback.size;
    const pending = Math.max(0, students.length - completed);

    return {
      completed,
      data: [
        { color: "#5d5fef", name: "With Feedback", value: completed },
        { color: "#fbbf24", name: "Pending", value: pending },
      ],
      pending,
    };
  }, [filteredTeacherFeedbacks, students.length]);

  const performanceTrendData = useMemo(() => {
    const studentIds = new Set(students.map((student) => student.id));
    const studentEvaluations = evaluations.filter((evaluation) =>
      studentIds.has(Number(evaluation.user_id)),
    );
    const buckets = new Map<
      string,
      {
        count: number;
        quarter: number;
        studentIds: Set<number>;
        total: number;
        year: number;
      }
    >();

    studentEvaluations.forEach((evaluation) => {
      let period = parsePeriodParts(evaluation.period);
      if (!period) {
        const dateValue = evaluation.submitted_at || evaluation.created_at;
        if (dateValue) {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            period = {
              quarter: Math.floor(date.getUTCMonth() / 3) + 1,
              year: date.getUTCFullYear(),
            };
          }
        }
      }

      if (!period) {
        return;
      }

      const bucketKey = `${period.year}-Q${period.quarter}`;
      const entry = buckets.get(bucketKey) || {
        count: 0,
        quarter: period.quarter,
        studentIds: new Set<number>(),
        total: 0,
        year: period.year,
      };
      entry.studentIds.add(Number(evaluation.user_id));

      if (activeCriterionKey === "overall") {
        entry.count += 1;
        entry.total += Number(evaluation.average_score || 0);
      } else {
        const normalizedActiveKey = toCriterionKey(activeCriterionKey);
        const matchedResponse = (
          Array.isArray(evaluation.responses) ? evaluation.responses : []
        ).find((response) => {
          const keyCandidate = toCriterionKey(
            String(response.criterion_key || ""),
          );
          const nameCandidate = toCriterionKey(
            String(response.criterion_name || ""),
          );
          return (
            keyCandidate === normalizedActiveKey ||
            nameCandidate === normalizedActiveKey
          );
        });

        if (matchedResponse) {
          entry.count += 1;
          entry.total += Number(matchedResponse.star_value || 0);
        }
      }

      buckets.set(bucketKey, entry);
    });

    return Array.from(buckets.values())
      .sort((left, right) => {
        if (left.year !== right.year) {
          return left.year - right.year;
        }

        return left.quarter - right.quarter;
      })
      .map((entry) => ({
        completion: entry.studentIds.size,
        label: formatPeriodLabel(entry.year, entry.quarter),
        studentAvg:
          entry.count > 0 ? Number((entry.total / entry.count).toFixed(1)) : 0,
      }));
  }, [activeCriterionKey, evaluations, students]);

  const activeCriterionColor = useMemo(() => {
    if (activeCriterionKey === "overall") {
      return "#5d5fef";
    }

    return criteriaColorMap.get(activeCriterionKey) || "#5d5fef";
  }, [activeCriterionKey, criteriaColorMap]);

  const activeCriterionLabel = useMemo(() => {
    if (activeCriterionKey === "overall") {
      return "Student Avg";
    }

    return (
      criteriaNav.find((criterion) => criterion.key === activeCriterionKey)
        ?.label || "Criteria Avg"
    );
  }, [activeCriterionKey, criteriaNav]);

  const handleGenerationChange = (value: string | "All") => {
    setSelectedGen(value);
    setSelectedClass("All");
    setSelectedGender("All");
  };

  const handleClassChange = (value: string | "All") => {
    setSelectedClass(value);
    setSelectedGender("All");
  };

  const handleResetStudentFilters = () => {
    setSelectedGen("All");
    setSelectedClass("All");
    setSelectedGender("All");
    setSelectedLevel("All");
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportNotice(null);

      const params = new URLSearchParams();
      params.append("scope", activeTab);

      if (activeTab === "students") {
        if (selectedClass !== "All") params.append("class", selectedClass);
        if (selectedGen !== "All") params.append("generation", selectedGen);
        if (selectedGender !== "All") params.append("gender", selectedGender);
        if (selectedLevel !== "All") params.append("level", selectedLevel);
      }

      if (activeTab === "teachers" && selectedTeacherQuarter !== "All") {
        params.append("quarter", selectedTeacherQuarter);
      }

      const response = await fetch(
        `${API_BASE_URL}/evaluations/report/export?${params.toString()}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("spreadsheet")) {
        throw new Error("Invalid response format. Expected Excel file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const exportLabel =
        activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

      link.href = url;
      link.download = `Admin_${exportLabel}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setExportNotice({
        message: "Export completed. Your Excel file is downloading.",
        type: "success",
      });
    } catch (exportError: unknown) {
      console.error(exportError);
      setExportNotice({
        message:
          exportError instanceof Error
            ? exportError.message
            : "Failed to export report.",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    activeTab,
    error,
    exportNotice,
    exporting,
    handleExport,
    loading,
    overview: {
      activeCriterionColor,
      activeCriterionKey,
      activeCriterionLabel,
      criteriaColorMap,
      criteriaNav,
      onCriterionChange: setActiveCriterionKey,
      overallStats,
      performanceTrendData,
      ratingScale,
      studentCount: students.length,
    },
    setActiveTab,
    setExportNotice,
    students: {
      availableClasses,
      currentReportData,
      generations,
      onClassChange: handleClassChange,
      onGenderChange: setSelectedGender,
      onGenerationChange: handleGenerationChange,
      onLevelChange: setSelectedLevel,
      onResetFilters: handleResetStudentFilters,
      radarData,
      radarKeys,
      ratingScale,
      selectedClass,
      selectedGender,
      selectedGen,
      selectedLevel,
      strongestArea,
      title: studentChartTitle,
      weakestArea,
    },
    teachers: {
      feedbackStatusData,
      onQuarterChange: setSelectedTeacherQuarter,
      quarterOptions: teacherQuarterOptions,
      selectedQuarter: selectedTeacherQuarter,
      teacherPerformance,
    },
  };
}
