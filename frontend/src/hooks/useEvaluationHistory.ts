import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  EvaluationRecord,
  FeedbackRecord,
  HistoryItem,
  HistoryFilterState,
} from "../components/student/evaluation/history/types";
import type { TrendDataPoint } from "../components/student/evaluation/history/types";
import {
  formatLongDate,
  toPeriodTitle,
  buildNextDueDate,
} from "../lib/evaluationUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export function useEvaluationHistory(initialFilters: HistoryFilterState) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [cycleDays, setCycleDays] = useState(90);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student");
  const [studentId, setStudentId] = useState("");
  const [globalRatingScale, setGlobalRatingScale] = useState<number>(5);
  const [globalCriteria, setGlobalCriteria] = useState<any[]>([]);
  const [activeCriterionId, setActiveCriterionId] = useState<string>("overall");
  const [canEditAfterSubmit, setCanEditAfterSubmit] = useState(false);

  useEffect(() => {
    const loadEvaluationHistory = async () => {
      try {
        const raw = localStorage.getItem("auth_user");
        if (!raw) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }

        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        const localName = String(authUser?.name || "").trim();
        const localStudentId = String(authUser?.student_id || "").trim();

        if (localName) setStudentName(localName);
        if (localStudentId) setStudentId(localStudentId);

        if (!Number.isInteger(userId) || userId <= 0) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }

        const [
          userResponse,
          intervalResponse,
          evaluationsResponse,
          criteriaConfigResponse,
          editPermissionResponse,
          feedbackResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${userId}`),
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
          fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
          fetch(`${API_BASE_URL}/settings/key/student_can_edit_after_submit`),
          fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        ]);

        const userData = await userResponse.json().catch(() => ({}));
        const intervalData = await intervalResponse.json().catch(() => ({}));
        const evaluationsData = await evaluationsResponse
          .json()
          .catch(() => []);
        const criteriaConfigData = await criteriaConfigResponse
          .json()
          .catch(() => ({}));
        const editPermissionData = await editPermissionResponse
          .json()
          .catch(() => ({}));
        const feedbackData = await feedbackResponse.json().catch(() => []);

        const nextRatingScale = Math.max(
          1,
          Number(criteriaConfigData?.ratingScale || 5),
        );
        setGlobalRatingScale(nextRatingScale);
        setGlobalCriteria(
          Array.isArray(criteriaConfigData?.criteria)
            ? criteriaConfigData.criteria
            : [],
        );
        setCanEditAfterSubmit(
          !["false", "0"].includes(
            String(editPermissionData?.value || "false")
              .trim()
              .toLowerCase(),
          ),
        );

        const resolvedName =
          String(userData?.name || "").trim() ||
          [userData?.first_name, userData?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          localName ||
          "Student";
        const resolvedStudentId = String(
          userData?.student_id ||
            userData?.resolved_student_id ||
            localStudentId ||
            "",
        ).trim();
        const resolvedCycleDays = Math.min(
          365,
          Math.max(30, Number(intervalData?.value || 90)),
        );

        setStudentName(resolvedName);
        setStudentId(resolvedStudentId);
        setCycleDays(resolvedCycleDays);

        const sortedEvaluations = (
          Array.isArray(evaluationsData) ? evaluationsData : []
        ).sort(
          (a: EvaluationRecord, b: EvaluationRecord) =>
            new Date(String(b.submitted_at || b.created_at || "")).getTime() -
            new Date(String(a.submitted_at || a.created_at || "")).getTime(),
        );

        setEvaluations(sortedEvaluations);
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);

        const normalizedHistory = sortedEvaluations.map(
          (evaluation: EvaluationRecord) => {
            const completedDate = String(
              evaluation.submitted_at || evaluation.created_at || "",
            ).trim();
            const nextDueDate = buildNextDueDate(
              completedDate,
              resolvedCycleDays,
            );

            return {
              id: evaluation.id,
              title: toPeriodTitle(evaluation.period),
              period: String(evaluation.period || "").trim(),
              completedDate,
              completedLabel: formatLongDate(completedDate),
              nextDueDate,
              nextDueLabel: formatLongDate(nextDueDate),
              rating: Number(evaluation.average_score || 0),
              ratingScale: nextRatingScale,
            };
          },
        );
        setHistoryItems(normalizedHistory);
      } catch {
        setHistoryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluationHistory();
  }, []);

  const filteredHistoryItems = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const searchedItems = !normalizedQuery
      ? historyItems
      : historyItems.filter(
          (item) =>
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.period.toLowerCase().includes(normalizedQuery) ||
            item.completedLabel.toLowerCase().includes(normalizedQuery),
        );

    const sortedItems = [...searchedItems];
    sortedItems.sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.completedDate).getTime() -
          new Date(b.completedDate).getTime()
        );
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return a.title.localeCompare(b.title);
    });

    return sortedItems;
  }, [historyItems, searchQuery, sortBy]);

  const trendData = useMemo(() => {
    const feedbackByPeriod = new Map<string, Set<number>>();
    feedbacks.forEach((feedback) => {
      const rawPeriod = String(feedback.evaluation_period || "").trim();
      let label = "";
      if (rawPeriod) {
        label = toPeriodTitle(rawPeriod).replace(" Evaluation", "");
      } else if (feedback.created_at) {
        const date = new Date(String(feedback.created_at || ""));
        if (!Number.isNaN(date.getTime())) {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          label = `Q${quarter} ${date.getFullYear()}`;
        }
      }
      if (!label) return;
      const teacherId = Number(feedback.teacher_id);
      if (!Number.isInteger(teacherId) || teacherId <= 0) return;
      const set = feedbackByPeriod.get(label) || new Set<number>();
      set.add(teacherId);
      feedbackByPeriod.set(label, set);
    });

    const items = [...historyItems].reverse();
    return items.map((item) => ({
      name: item.title.replace(" Evaluation", ""),
      score: Number(item.rating.toFixed(2)),
      feedbackCount:
        feedbackByPeriod.get(item.title.replace(" Evaluation", ""))?.size || 0,
    }));
  }, [feedbacks, historyItems]);

  const maxFeedbackCount = useMemo(() => {
    if (trendData.length === 0) return 1;
    return Math.max(
      1,
      ...trendData.map((entry) => Number(entry.feedbackCount || 0)),
    );
  }, [trendData]);

  const evaluationSeries = useMemo(() => {
    const ordered = [...evaluations].sort(
      (a, b) =>
        new Date(String(a.submitted_at || a.created_at || "")).getTime() -
        new Date(String(b.submitted_at || b.created_at || "")).getTime(),
    );
    return ordered.map((evaluation) => ({
      evaluation,
      label: toPeriodTitle(evaluation.period).replace(" Evaluation", ""),
    }));
  }, [evaluations]);

  const criteriaNav = useMemo(() => {
    const activeCriteria = globalCriteria.filter(
      (c) => String(c.status).toLowerCase() === "active",
    );
    return activeCriteria.map((criterion: any, idx: number) => ({
      id: String(criterion.id || `criterion-${idx}`),
      name: String(criterion.name || `Criterion ${idx + 1}`),
    }));
  }, [globalCriteria]);

  const activeCriterionProgress = useMemo(() => {
    if (activeCriterionId === "overall") return [];
    const activeCriterion = criteriaNav.find(
      (criterion) => criterion.id === activeCriterionId,
    );
    if (!activeCriterion) return [];
    return evaluationSeries.map(({ evaluation, label }) => {
      const response = (evaluation.responses || []).find(
        (r: any) =>
          String(r.criterion_key || "").trim() ===
            String(activeCriterion.id || "").trim() ||
          String(r.criterion_name || "")
            .trim()
            .toLowerCase() === String(activeCriterion.name || "").toLowerCase(),
      );
      return {
        name: label,
        score: response ? Number(response.star_value || 0) : 0,
      };
    });
  }, [activeCriterionId, criteriaNav, evaluationSeries]);

  const activeTrendData = useMemo(() => {
    if (activeCriterionId === "overall") return trendData;
    return activeCriterionProgress;
  }, [activeCriterionId, trendData, activeCriterionProgress]);

  const highestRating = historyItems.reduce(
    (max, item) => Math.max(max, item.rating),
    0,
  );
  const latestEvaluation = historyItems[0];
  const nextDueLabel = latestEvaluation?.nextDueLabel || "No evaluation yet";

  return {
    // State
    historyItems,
    filteredHistoryItems,
    trendData,
    activeTrendData,
    isLoading,
    studentName,
    studentId,
    cycleDays,
    globalRatingScale,
    globalCriteria,
    activeCriterionId,
    canEditAfterSubmit,
    criteriaNav,
    maxFeedbackCount,
    highestRating,
    nextDueLabel,
    latestEvaluation,
    // Actions
    onSearchChange: setSearchQuery,
    onSortChange: setSortBy,
    onCriterionChange: setActiveCriterionId,
    onEditEvaluation: (id: number) => navigate(`/evaluate?edit=${id}`),
    onViewReport: (id: number) =>
      navigate("/results", { state: { evaluationId: id } }),
  };
}
