import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { EvaluationCriterion } from "../components/student/evaluation/types";
import type { EligibilityState } from "../components/student/evaluation/types";
import {
  normalizePeriodInput,
  formatPeriodInput,
} from "../lib/evaluationUtils";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

interface UseEvaluationFormStateProps {
  criteria: EvaluationCriterion[];
  ratingScale: number;
  maxReflectionChars: number;
  eligibility: EligibilityState;
}

export function useEvaluationFormState({
  criteria,
  ratingScale,
  maxReflectionChars,
  eligibility,
}: UseEvaluationFormStateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const editEvaluationId = Number(
    searchParams.get("edit") ||
      (location.state as { editEvaluationId?: number } | null)
        ?.editEvaluationId,
  );
  const isEditMode = Number.isInteger(editEvaluationId) && editEvaluationId > 0;

  const criterion =
    currentStep >= 0 && currentStep < criteria.length
      ? criteria[currentStep]
      : null;
  const selectedRating = criterion ? scores[criterion.key] || 0 : 0;

  const updateScore = useCallback((key: string, rating: number) => {
    setScores((prev) => ({ ...prev, [key]: rating }));
  }, []);

  const updateReflection = useCallback(
    (key: string, value: string) => {
      const limitedValue = value.slice(0, maxReflectionChars);
      setReflections((prev) => ({ ...prev, [key]: limitedValue }));
    },
    [maxReflectionChars],
  );

  const handleNext = useCallback(() => {
    if (currentStep < criteria.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, criteria.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/dashboard");
    }
  }, [currentStep, navigate]);

  const handleFinish = useCallback(() => {
    setSubmitError("");
    setShowConfirm(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!eligibility.canEvaluate) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const raw = localStorage.getItem("auth_user");
      const authUser = raw ? JSON.parse(raw) : null;
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error("Student account information is missing.");
      }

      const responses = criteria.map((item) => ({
        criterion_id: item.id,
        criterion_key: item.key,
        criterion_name: item.label,
        criterion_icon: item.icon,
        star_value: scores[item.key] || 0,
        reflection: reflections[item.key] || "",
        tip_snapshot:
          (scores[item.key] || 0) > 0
            ? item.starDescriptions[(scores[item.key] || 0) - 1] || ""
            : "",
      }));

      const payload = {
        user_id: userId,
        ...(isEditMode && { period: normalizePeriodInput(editTitle) }),
        rating_scale: ratingScale,
        responses,
      };

      const url = isEditMode
        ? `${API_BASE_URL}/evaluations/${editEvaluationId}`
        : `${API_BASE_URL}/evaluations`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit evaluation.");
      }

      localStorage.setItem(
        `last_evaluation_submitted_at_${userId}`,
        new Date().toISOString(),
      );

      const targetRoute = isEditMode ? "/history" : "/results";
      navigate(
        targetRoute,
        isEditMode
          ? {}
          : {
              state: { scores, reflections, evaluationId: data?.evaluationId },
            },
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit evaluation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    criteria,
    scores,
    reflections,
    ratingScale,
    eligibility.canEvaluate,
    isEditMode,
    editTitle,
    editEvaluationId,
    navigate,
    normalizePeriodInput,
  ]);

  return {
    currentStep,
    scores,
    reflections,
    editTitle,
    showConfirm,
    isSubmitting,
    submitError,
    isEditMode,
    criterion,
    selectedRating,
    handleNext,
    handleBack,
    handleFinish,
    handleSubmit,
    updateScore,
    updateReflection,
    setEditTitle,
    setShowConfirm,
    normalizePeriodInput,
    formatPeriodInput,
  };
}
