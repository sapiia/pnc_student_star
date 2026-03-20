import { useEffect, useMemo, useState } from 'react';

import { CRITERIA } from '../constants';
import {
  API_BASE_URL,
  normalizeGender,
  toDisplayName,
} from '../lib/teacher/utils';
import {
  buildReportAuthHeaders,
  formatReportPeriodLabel,
  mapTeacherReportStudent,
  normalizeReportGenerationValue,
  parseReportGeneration,
  parseReportPeriodParts,
  REPORT_CRITERIA_COLORS,
  REPORT_DEFAULT_CLASS_FALLBACK,
  REPORT_GENERATION_HINTS,
  toCriterionKey,
  type TeacherReportCriterionNavItem,
  type TeacherReportEvaluation,
  type TeacherReportGenderOption,
  type TeacherReportNotice,
  type TeacherReportProcessedData,
  type TeacherReportStudent,
} from '../lib/teacher/reporting';

type CriteriaApiResponse = {
  criteria?: Array<Record<string, unknown>>;
  ratingScale?: number;
};

export function useTeacherReportsData(teacherId: number | null) {
  const [selectedGeneration, setSelectedGeneration] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedGender, setSelectedGender] = useState(
    'All' as TeacherReportGenderOption,
  );
  const [students, setStudents] = useState([] as TeacherReportStudent[]);
  const [evaluations, setEvaluations] = useState(
    [] as TeacherReportEvaluation[],
  );
  const [criteriaNav, setCriteriaNav] = useState(
    [] as TeacherReportCriterionNavItem[],
  );
  const [activeCriterionKey, setActiveCriterionKey] = useState('overall');
  const [ratingScale, setRatingScale] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(
    null as TeacherReportNotice | null,
  );

  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const authHeaders = buildReportAuthHeaders();
        const [usersResponse, evaluationsResponse, criteriaResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/users/teachers/students/${teacherId}`, {
              headers: authHeaders,
            }),
            fetch(`${API_BASE_URL}/evaluations`, { headers: authHeaders }),
            fetch(`${API_BASE_URL}/settings/evaluation-criteria`, {
              headers: authHeaders,
            }),
          ]);

        let usersPayload: Array<Record<string, unknown>> = [];
        if (usersResponse.ok) {
          usersPayload = await usersResponse.json();
        } else {
          const fallbackResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: authHeaders,
          });
          usersPayload = await fallbackResponse.json();
        }

        const evaluationsPayload = await evaluationsResponse.json();
        const criteriaPayload = (await criteriaResponse
          .json()
          .catch(() => ({}))) as CriteriaApiResponse;

        if (Array.isArray(usersPayload)) {
          const mappedStudents = usersPayload
            .filter(
              (user) =>
                String(user.role || '').toLowerCase() === 'student',
            )
            .map((user) =>
              mapTeacherReportStudent(user, toDisplayName, normalizeGender),
            );

          setStudents(mappedStudents);
        }

        if (Array.isArray(evaluationsPayload)) {
          setEvaluations(evaluationsPayload as TeacherReportEvaluation[]);
        }

        const activeCriteria = Array.isArray(criteriaPayload.criteria)
          ? criteriaPayload.criteria.filter(
              (criterion) =>
                String(criterion.status || '').toLowerCase() === 'active',
            )
          : [];

        setRatingScale(Math.max(1, Number(criteriaPayload.ratingScale || 5)));

        const mappedCriteria =
          activeCriteria.length > 0
            ? activeCriteria.map((criterion, index) => {
                const label = String(
                  criterion.name || `Criterion ${index + 1}`,
                ).trim();
                const rawKey = String(
                  criterion.key || label || criterion.id || `criterion${index + 1}`,
                );

                return {
                  id: String(
                    criterion.id ||
                      `CRIT-${String(index + 1).padStart(3, '0')}`,
                  ),
                  label,
                  key: toCriterionKey(rawKey),
                };
              })
            : CRITERIA.map((criterion) => ({
                id: criterion.key,
                label: criterion.label,
                key: toCriterionKey(criterion.key),
              }));

        setCriteriaNav(mappedCriteria);
      } catch (fetchError) {
        console.error('Error fetching report data:', fetchError);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  useEffect(() => {
    if (
      activeCriterionKey !== 'overall' &&
      criteriaNav.every((criterion) => criterion.key !== activeCriterionKey)
    ) {
      setActiveCriterionKey('overall');
    }
  }, [activeCriterionKey, criteriaNav]);

  const generations = useMemo(() => {
    const uniqueGenerations = new Set(
      students
        .map((student) =>
          normalizeReportGenerationValue(parseReportGeneration(student)),
        )
        .filter(Boolean),
    );

    return Array.from(
      new Set([...uniqueGenerations, ...REPORT_GENERATION_HINTS]),
    ).sort();
  }, [students]);

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();

    students.forEach((student) => {
      const matchesGeneration =
        selectedGeneration === 'All' ||
        normalizeReportGenerationValue(parseReportGeneration(student)) ===
          selectedGeneration;

      if (matchesGeneration && student.className) {
        classSet.add(student.className);
      }
    });

    const classes = Array.from(classSet).sort();
    return classes.length > 0 ? classes : REPORT_DEFAULT_CLASS_FALLBACK;
  }, [selectedGeneration, students]);

  const criteriaList = useMemo(() => {
    if (criteriaNav.length > 0) {
      return criteriaNav.map((criterion) => ({
        label: criterion.label,
        key: criterion.key,
      }));
    }

    return CRITERIA.map((criterion) => ({
      label: criterion.label,
      key: toCriterionKey(criterion.key),
    }));
  }, [criteriaNav]);

  const criteriaColorMap = useMemo(() => {
    const map = new Map<string, string>();

    criteriaList.forEach((criterion, index) => {
      const color =
        REPORT_CRITERIA_COLORS[index % REPORT_CRITERIA_COLORS.length];

      map.set(criterion.key, color);
      map.set(toCriterionKey(criterion.label), color);
    });

    return map;
  }, [criteriaList]);

  const activeCriterionColor = useMemo(() => {
    if (activeCriterionKey === 'overall') return '#5d5fef';
    return criteriaColorMap.get(activeCriterionKey) || '#5d5fef';
  }, [activeCriterionKey, criteriaColorMap]);

  const activeCriterionLabel = useMemo(() => {
    if (activeCriterionKey === 'overall') return 'Avg Stars';

    const label =
      criteriaNav.find((criterion) => criterion.key === activeCriterionKey)
        ?.label || 'Criteria Avg';

    return `${label} Avg`;
  }, [activeCriterionKey, criteriaNav]);

  const processedData = useMemo((): TeacherReportProcessedData => {
    let filteredStudents = students;

    if (selectedGeneration !== 'All') {
      filteredStudents = filteredStudents.filter(
        (student) =>
          normalizeReportGenerationValue(parseReportGeneration(student)) ===
          selectedGeneration,
      );
    }

    if (selectedClass !== 'All') {
      filteredStudents = filteredStudents.filter(
        (student) => student.className === selectedClass,
      );
    }

    if (selectedGender !== 'All') {
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.gender?.toLowerCase() === selectedGender.toLowerCase(),
      );
    }

    const filteredStudentIds = new Set(filteredStudents.map((student) => student.id));
    const filteredEvaluations = evaluations.filter((evaluation) =>
      filteredStudentIds.has(evaluation.user_id),
    );

    const totals = new Map<
      string,
      { total: number; count: number; label: string }
    >();
    const criterionLookup = new Map<string, string>();

    criteriaList.forEach((criterion) => {
      totals.set(criterion.key, {
        total: 0,
        count: 0,
        label: criterion.label,
      });
      criterionLookup.set(toCriterionKey(criterion.key), criterion.key);
      criterionLookup.set(toCriterionKey(criterion.label), criterion.key);
    });

    filteredEvaluations.forEach((evaluation) => {
      (evaluation.responses || []).forEach((response) => {
        const normalizedKey = toCriterionKey(
          String(response.criterion_key || ''),
        );
        const normalizedName = toCriterionKey(
          String(response.criterion_name || ''),
        );
        const canonicalKey =
          criterionLookup.get(normalizedKey) ||
          criterionLookup.get(normalizedName);

        if (!canonicalKey) return;

        const entry = totals.get(canonicalKey);
        if (!entry) return;

        entry.total += Number(response.star_value || 0);
        entry.count += 1;
      });
    });

    const criteria = criteriaList.map((criterion) => {
      const entry = totals.get(criterion.key);
      const color = criteriaColorMap.get(criterion.key) || '#94a3b8';

      return {
        name: criterion.label,
        value:
          entry && entry.count > 0
            ? Number((entry.total / entry.count).toFixed(1))
            : 0,
        fill: color,
        color,
      };
    });

    if (filteredEvaluations.length === 0) {
      return {
        trend: [],
        criteria,
        engagement: [],
        stats: {
          totalStudents: filteredStudents.length,
          avgScore: 0,
          completionRate: 0,
        },
      };
    }

    const totalStudents = filteredStudents.length;
    const evaluatedStudents = new Set(
      filteredEvaluations.map((evaluation) => Number(evaluation.user_id)),
    ).size;
    const completionRate =
      totalStudents > 0
        ? Math.round((evaluatedStudents / totalStudents) * 100)
        : 0;

    const engagement = [
      { name: 'Completed', value: completionRate, fill: '#5d5fef' },
      {
        name: 'Pending',
        value: Math.max(0, 100 - completionRate),
        fill: '#94a3b8',
      },
      { name: 'Overdue', value: 0, fill: '#ef4444' },
    ];

    const avgScore = Number(
      (
        filteredEvaluations.reduce(
          (sum, evaluation) => sum + Number(evaluation.average_score || 0),
          0,
        ) / filteredEvaluations.length
      ).toFixed(2),
    );

    const buckets = new Map<
      string,
      {
        totalScore: number;
        count: number;
        year: number;
        quarter: number;
        studentIds: Set<number>;
      }
    >();

    filteredEvaluations.forEach((evaluation) => {
      let period = parseReportPeriodParts(evaluation.period);

      if (!period) {
        const dateValue = evaluation.submitted_at || evaluation.created_at;
        if (dateValue) {
          const date = new Date(dateValue);
          if (!Number.isNaN(date.getTime())) {
            period = {
              year: date.getUTCFullYear(),
              quarter: Math.floor(date.getUTCMonth() / 3) + 1,
            };
          }
        }
      }

      if (!period) return;

      const bucketKey = `${period.year}-Q${period.quarter}`;
      const entry = buckets.get(bucketKey) || {
        totalScore: 0,
        count: 0,
        year: period.year,
        quarter: period.quarter,
        studentIds: new Set<number>(),
      };

      entry.studentIds.add(Number(evaluation.user_id));

      let scoreValue = Number(evaluation.average_score || 0);
      if (activeCriterionKey !== 'overall') {
        const normalizedActiveCriterionKey = toCriterionKey(activeCriterionKey);
        const matchedResponse = (evaluation.responses || []).find((response) => {
          const responseKey = toCriterionKey(
            String(response.criterion_key || ''),
          );
          const responseName = toCriterionKey(
            String(response.criterion_name || ''),
          );

          return (
            normalizedActiveCriterionKey === responseKey ||
            normalizedActiveCriterionKey === responseName
          );
        });

        if (matchedResponse) {
          scoreValue = Number(matchedResponse.star_value || 0);
        }
      }

      entry.totalScore += scoreValue;
      entry.count += 1;
      buckets.set(bucketKey, entry);
    });

    const trend = Array.from(buckets.values())
      .sort((left, right) => {
        if (left.year !== right.year) return left.year - right.year;
        return left.quarter - right.quarter;
      })
      .map((entry) => ({
        name: formatReportPeriodLabel(entry.year, entry.quarter),
        avg:
          entry.count > 0
            ? Number((entry.totalScore / entry.count).toFixed(1))
            : 0,
        completion: entry.studentIds.size,
      }));

    return {
      trend,
      criteria,
      engagement,
      stats: {
        totalStudents,
        avgScore,
        completionRate,
      },
    };
  }, [
    activeCriterionKey,
    criteriaColorMap,
    criteriaList,
    evaluations,
    selectedClass,
    selectedGender,
    selectedGeneration,
    students,
  ]);

  const handleGenerationChange = (value: string) => {
    setSelectedGeneration(value);
    setSelectedClass('All');
    setSelectedGender('All');
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedGender('All');
  };

  const handleGenderChange = (value: TeacherReportGenderOption) => {
    setSelectedGender(value);
  };

  const dismissExportNotice = () => {
    setExportNotice(null);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportNotice(null);

      const authHeaders = buildReportAuthHeaders();
      const params = new URLSearchParams({ scope: 'students' });

      if (selectedClass !== 'All') params.append('class', selectedClass);
      if (selectedGender !== 'All') params.append('gender', selectedGender);
      if (selectedGeneration !== 'All') {
        params.append('generation', selectedGeneration);
      }

      const response = await fetch(
        `${API_BASE_URL}/evaluations/report/export?${params.toString()}`,
        {
          method: 'GET',
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('spreadsheet')) {
        throw new Error('Invalid response format. Expected Excel file.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = `Teacher_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      setExportNotice({
        type: 'success',
        message: 'Export completed. Your Excel file is downloading.',
      });
    } catch (exportError) {
      console.error('Export error:', exportError);
      setExportNotice({
        type: 'error',
        message:
          exportError instanceof Error
            ? exportError.message
            : 'Failed to export report.',
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    activeCriterionColor,
    activeCriterionKey,
    activeCriterionLabel,
    availableClasses,
    criteria: processedData.criteria,
    criteriaColorMap,
    criteriaNav,
    engagement: processedData.engagement,
    error,
    exporting,
    exportNotice,
    generations,
    handleClassChange,
    handleExport,
    handleGenderChange,
    handleGenerationChange,
    loading,
    ratingScale,
    selectedClass,
    selectedGender,
    selectedGeneration,
    setActiveCriterionKey,
    stats: processedData.stats,
    trend: processedData.trend,
    dismissExportNotice,
  };
}
