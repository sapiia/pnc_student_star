import { useEffect, useState } from "react";
import type { EligibilityState } from "../components/student/evaluation/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export function useEvaluationEligibility(isEditMode: boolean) {
  const [state, setState] = useState<EligibilityState>({
    isLoading: true,
    canEvaluate: true,
    daysUntilAvailable: 0,
    nextAvailableLabel: "",
    evaluationsUsed: 0,
    maxEvaluationsPerCycle: 1,
  });

  useEffect(() => {
    if (isEditMode) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const loadEligibility = async () => {
      try {
        const raw = localStorage.getItem("auth_user");
        const authUser = raw ? JSON.parse(raw) : null;
        const userId = Number(authUser?.id);

        if (!Number.isInteger(userId) || userId <= 0) {
          setState((prev) => ({
            ...prev,
            canEvaluate: false,
            isLoading: false,
          }));
          return;
        }

        const [
          intervalResponse,
          maxEvalResponse,
          maxReflectionResponse,
          evaluationsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
          fetch(
            `${API_BASE_URL}/settings/key/student_max_evaluations_per_cycle`,
          ),
          fetch(
            `${API_BASE_URL}/settings/key/student_max_reflection_characters`,
          ),
          fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
        ]);

        const intervalData = await intervalResponse.json().catch(() => ({}));
        const maxEvalData = await maxEvalResponse.json().catch(() => ({}));
        const maxReflectionData = await maxReflectionResponse
          .json()
          .catch(() => ({}));
        const evaluations = await evaluationsResponse.json().catch(() => []);

        const intervalDays = Math.min(
          365,
          Math.max(30, Number(intervalData?.value || 90)),
        );
        const maxPerCycle = Math.min(
          12,
          Math.max(1, Number(maxEvalData?.value || 1)),
        );

        if (!Array.isArray(evaluations) || evaluations.length === 0) {
          setState({
            isLoading: false,
            canEvaluate: true,
            daysUntilAvailable: 0,
            nextAvailableLabel: "",
            evaluationsUsed: 0,
            maxEvaluationsPerCycle: maxPerCycle,
          });
          return;
        }

        const now = Date.now();
        const windowStart = now - intervalDays * 24 * 60 * 60 * 1000;
        const evaluationsInWindow = evaluations.filter((evaluation: any) => {
          const submittedAt = String(
            evaluation?.submitted_at || evaluation?.created_at || "",
          ).trim();
          const timestamp = new Date(submittedAt).getTime();
          return Number.isFinite(timestamp) && timestamp >= windowStart;
        });

        const usedCount = evaluationsInWindow.length;

        if (usedCount < maxPerCycle) {
          setState({
            isLoading: false,
            canEvaluate: true,
            daysUntilAvailable: 0,
            nextAvailableLabel: "",
            evaluationsUsed: usedCount,
            maxEvaluationsPerCycle: maxPerCycle,
          });
          return;
        }

        const earliestTimestamp = evaluationsInWindow.reduce(
          (min: number, evaluation: any) => {
            const submittedAt = String(
              evaluation?.submitted_at || evaluation?.created_at || "",
            ).trim();
            const timestamp = new Date(submittedAt).getTime();
            if (!Number.isFinite(timestamp)) return min;
            return Math.min(min, timestamp);
          },
          Number.POSITIVE_INFINITY,
        );

        if (!Number.isFinite(earliestTimestamp)) {
          setState({
            isLoading: false,
            canEvaluate: true,
            daysUntilAvailable: 0,
            nextAvailableLabel: "",
            evaluationsUsed: usedCount,
            maxEvaluationsPerCycle: maxPerCycle,
          });
          return;
        }

        const nextAvailableDate = new Date(earliestTimestamp);
        nextAvailableDate.setDate(nextAvailableDate.getDate() + intervalDays);
        const remainingDays = Math.max(
          0,
          Math.ceil(
            (nextAvailableDate.getTime() - now) / (1000 * 60 * 60 * 24),
          ),
        );

        const nextLabel = new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(nextAvailableDate);

        setState({
          isLoading: false,
          canEvaluate: remainingDays === 0,
          daysUntilAvailable: remainingDays,
          nextAvailableLabel: nextLabel,
          evaluationsUsed: usedCount,
          maxEvaluationsPerCycle: maxPerCycle,
        });
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, canEvaluate: true }));
      }
    };

    loadEligibility();

    const handleSettingsUpdate = () => {
      loadEligibility();
    };

    window.addEventListener("student-settings-updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener(
        "student-settings-updated",
        handleSettingsUpdate,
      );
    };
  }, [isEditMode]);

  return state;
}
