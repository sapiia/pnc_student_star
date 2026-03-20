import { useEffect, useMemo, useState } from 'react';
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  buildRadarData,
  extractClassName,
  extractGeneration,
  getEvaluationSortValue,
  normalizeGender,
  resolveAvatarUrl,
  toDisplayName,
} from '../lib/teacher/utils';
import type { ApiUser, EvaluationRecord, StudentRecord } from '../lib/teacher/types';

const GENERATION_HINTS = ['Gen 2026', 'Gen 2027'];
const DEFAULT_MAX_FEEDBACK_CHARACTERS = 1000;
const DEFAULT_GENERATION = 'All Generations';
const DEFAULT_CLASS = 'All Classes';
const DEFAULT_GENDER = 'All Gender';

type CriteriaConfig = {
  id?: number | string;
  name?: string;
  status?: string;
};

export function useTeacherStudentListData() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(DEFAULT_GENERATION);
  const [selectedClass, setSelectedClass] = useState(DEFAULT_CLASS);
  const [selectedGender, setSelectedGender] = useState(DEFAULT_GENDER);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [teacherMaxFeedbackCharacters, setTeacherMaxFeedbackCharacters] = useState(DEFAULT_MAX_FEEDBACK_CHARACTERS);
  const [globalRatingScale, setGlobalRatingScale] = useState(5);
  const [globalCriteria, setGlobalCriteria] = useState<CriteriaConfig[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [usersResponse, evaluationsResponse, feedbackLimitResponse, criteriaConfigResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/evaluations`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
        ]);

        const usersData = await usersResponse.json().catch(() => []);
        const evaluationsData = await evaluationsResponse.json().catch(() => []);
        const feedbackLimitData = await feedbackLimitResponse.json().catch(() => ({}));
        const criteriaConfigData = await criteriaConfigResponse.json().catch(() => ({}));

        if (!usersResponse.ok) {
          throw new Error(usersData?.error || 'Failed to load students.');
        }
        if (!evaluationsResponse.ok) {
          throw new Error(evaluationsData?.error || 'Failed to load student evaluations.');
        }

        const configuredLimit = Number(feedbackLimitData?.value);
        setTeacherMaxFeedbackCharacters(
          Number.isFinite(configuredLimit) && configuredLimit > 0
            ? configuredLimit
            : DEFAULT_MAX_FEEDBACK_CHARACTERS,
        );

        const nextRatingScale = Math.max(1, Number(criteriaConfigData?.ratingScale || 5));
        setGlobalRatingScale(nextRatingScale);
        setGlobalCriteria(Array.isArray(criteriaConfigData?.criteria) ? criteriaConfigData.criteria : []);

        const latestEvaluationByUser = new Map<number, EvaluationRecord>();
        if (Array.isArray(evaluationsData)) {
          [...(evaluationsData as EvaluationRecord[])]
            .sort((left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left))
            .forEach((evaluation) => {
              const userId = Number(evaluation.user_id);
              if (Number.isInteger(userId) && userId > 0 && !latestEvaluationByUser.has(userId)) {
                latestEvaluationByUser.set(userId, evaluation);
              }
            });
        }

        const mappedStudentsRaw = Array.isArray(usersData)
          ? (usersData as ApiUser[])
              .filter((user) => String(user.role || '').trim().toLowerCase() === 'student')
              .map((user) => {
                const latestEvaluation = latestEvaluationByUser.get(Number(user.id)) || null;
                const averageScore = latestEvaluation && Number.isFinite(Number(latestEvaluation.average_score))
                  ? Number(latestEvaluation.average_score)
                  : null;

                return {
                  id: Number(user.id),
                  name: toDisplayName(user),
                  email: String(user.email || '').trim(),
                  studentId: String(user.student_id || user.resolved_student_id || '').trim() || `STU-${user.id}`,
                  generation: extractGeneration(user),
                  className: extractClassName(user),
                  gender: normalizeGender(user.gender),
                  avatar: resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR),
                  averageScore,
                  ratingScale: nextRatingScale,
                  latestEvaluation,
                } satisfies StudentRecord;
              })
          : [];

        const mappedStudents = Array.from(
          new Map(mappedStudentsRaw.map((student) => [student.id, student])).values(),
        );

        setStudents(mappedStudents);
        setSelectedId((currentSelectedId) => currentSelectedId ?? mappedStudents[0]?.id ?? null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load students.');
        setStudents([]);
        setSelectedId(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStudents();
  }, []);

  const generationOptions = useMemo(() => {
    const derivedGenerations = students.map((student) => student.generation).filter(Boolean);
    const uniqueGenerations = new Set([...derivedGenerations, ...GENERATION_HINTS]);
    return [DEFAULT_GENERATION, ...Array.from(uniqueGenerations).sort()];
  }, [students]);

  const classOptions = useMemo(() => {
    const scopedStudents = selectedGeneration === DEFAULT_GENERATION
      ? students
      : students.filter((student) => student.generation === selectedGeneration);

    return [DEFAULT_CLASS, ...Array.from(new Set(scopedStudents.map((student) => student.className))).sort()];
  }, [selectedGeneration, students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesGeneration =
        selectedGeneration === DEFAULT_GENERATION || student.generation === selectedGeneration;
      const matchesClass = selectedClass === DEFAULT_CLASS || student.className === selectedClass;
      const matchesGender =
        selectedGender === DEFAULT_GENDER ||
        (selectedGender === 'Male' && student.gender === 'male') ||
        (selectedGender === 'Female' && student.gender === 'female');
      const matchesSearch =
        !normalizedQuery ||
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.studentId.toLowerCase().includes(normalizedQuery) ||
        student.email.toLowerCase().includes(normalizedQuery);

      return matchesGeneration && matchesClass && matchesGender && matchesSearch;
    });
  }, [searchQuery, selectedClass, selectedGender, selectedGeneration, students]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setSelectedId(null);
      setIsPerformanceOpen(false);
      return;
    }

    const hasSelectedStudent = filteredStudents.some((student) => student.id === selectedId);
    if (!hasSelectedStudent) {
      setSelectedId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedId]);

  const selectedStudent = filteredStudents.find((student) => student.id === selectedId) || filteredStudents[0] || null;

  useEffect(() => {
    if (!selectedStudent) {
      setIsPerformanceOpen(false);
    }
  }, [selectedStudent]);

  const radarData = useMemo(
    () => buildRadarData(selectedStudent, globalCriteria, globalRatingScale),
    [selectedStudent, globalCriteria, globalRatingScale],
  );

  const selectedCriteria = selectedStudent?.latestEvaluation?.responses || [];

  const clearFilters = () => {
    setSelectedGeneration(DEFAULT_GENERATION);
    setSelectedClass(DEFAULT_CLASS);
    setSelectedGender(DEFAULT_GENDER);
    setSearchQuery('');
  };

  const updateGeneration = (value: string) => {
    setSelectedGeneration(value);
    setSelectedClass(DEFAULT_CLASS);
  };

  const openPerformanceForStudent = (studentId: number) => {
    setSelectedId(studentId);
    setIsPerformanceOpen(true);
  };

  return {
    students,
    filteredStudents,
    selectedStudent,
    selectedCriteria,
    radarData,
    generationOptions,
    classOptions,
    selectedGeneration,
    selectedClass,
    selectedGender,
    searchQuery,
    isLoading,
    loadError,
    isPerformanceOpen,
    teacherMaxFeedbackCharacters,
    globalRatingScale,
    globalCriteria,
    setSelectedId,
    setSelectedClass,
    setSelectedGender,
    setSearchQuery,
    setIsPerformanceOpen,
    clearFilters,
    updateGeneration,
    openPerformanceForStudent,
  };
}
