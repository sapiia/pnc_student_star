import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EvaluationCriterion } from "../components/student/evaluation/types";
import { DEFAULT_REFLECTION_MAX } from "../components/student/evaluation/constants";

interface EditEvaluationResult {
  isEditMode: boolean;
  editEvaluationId: number | null;
  editTitle: string;
  isEditLoading: boolean;
  editError: string;
  setEditTitle: (title: string) => void;
}

export function useEditEvaluation(
  criteria: EvaluationCriterion[],
  ratingScale: number,
  setCriteria: (criteria: EvaluationCriterion[]) => void,
  setRatingScale: (scale: number) => void,
  setScores: (scores: Record<string, number>) => void,
  setReflections: (reflections: Record<string, string>) => void,
  setMaxReflectionChars: (max: number) => void,
): EditEvaluationResult {
  const navigate = useNavigate();
  const [location, setLocation] = useState({ search: "", state: null as any });
  const [isEditModeLocal, setIsEditModeLocal] = useState(false);
  const [editEvaluationId, setEditEvaluationId] = useState<number | null>(null);
  const [editTitle, setEditTitleLocal] = useState("");
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // This hook needs to be used in a component with useLocation
  useEffect(() => {
    // Will be called from main page with actual location
  }, []);

  const initEdit = async (currentLocation: { search: string; state: any }) => {
    setLocation(currentLocation);
    const searchParams = new URLSearchParams(currentLocation.search);
    const id = Number(
      searchParams.get("edit") || currentLocation.state?.editEvaluationId,
    );
    const isEdit = Number.isInteger(id) && id > 0;

    setIsEditModeLocal(isEdit);
    if (!isEdit) return;

    setEditEvaluationId(id);
    setIsEditLoading(true);
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
      const raw = localStorage.getItem("auth_user");
      const authUser = raw ? JSON.parse(raw) : null;
      const userId = Number(authUser?.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        setEditError("Student account information is missing.");
        return;
      }

      const [permissionRes, evaluationRes, criteriaRes, reflectionMaxRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/student_can_edit_after_submit`),
          fetch(`${API_BASE_URL}/evaluations/${id}`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
          fetch(
            `${API_BASE_URL}/settings/key/student_max_reflection_characters`,
          ),
        ]);

      const permissionData = await permissionRes.json().catch(() => ({}));
      const canEdit = !["false", "0"].includes(
        String(permissionData?.value || "false")
          .trim()
          .toLowerCase(),
      );
      if (!canEdit) {
        setEditError("Editing after submit is currently disabled by admin.");
        return;
      }

      const evaluation = await evaluationRes.json().catch(() => ({}));
      if (!evaluationRes.ok) {
        setEditError(evaluation?.error || "Failed to load evaluation.");
        return;
      }

      setEditTitleLocal(String(evaluation?.period || ""));

      const criteriaData = await criteriaRes.json().catch(() => ({}));
      if (
        Array.isArray(criteriaData?.criteria) &&
        criteriaData.criteria.length > 0
      ) {
        const activeCriteria = criteriaData.criteria.filter(
          (c: any) => String(c.status).toLowerCase() === "active",
        );
        if (activeCriteria.length > 0) {
          const nextRatingScale = Math.max(
            1,
            Number(criteriaData?.ratingScale || ratingScale),
          );
          setRatingScale(nextRatingScale);
          const mappedCriteria = activeCriteria.map(
            (c: any, index: number) =>
              ({
                id: String(c.id || "").trim() || undefined,
                key: c.key || String(c.id || c.name || `criterion${index + 1}`),
                label: String(c.name || `Criterion ${index + 1}`),
                icon: String(c.icon || "Star"),
                description: String(c.description || "").trim(),
                starDescriptions: Array.from(
                  { length: nextRatingScale },
                  (_, starIndex) =>
                    String(c.starDescriptions?.[starIndex] || "").trim(),
                ),
                color: CRITERION_STYLES[index % CRITERION_STYLES.length].color,
                bgColor:
                  CRITERION_STYLES[index % CRITERION_STYLES.length].bgColor,
              }) as EvaluationCriterion,
          );
          setCriteria(mappedCriteria);

          // Apply evaluation data
          const scoresMap: Record<string, number> = {};
          const reflectionsMap: Record<string, string> = {};
          const responses = Array.isArray(evaluation?.responses)
            ? evaluation.responses
            : [];

          mappedCriteria.forEach((criterion) => {
            const response = responses.find(
              (r: any) =>
                String(r.criterion_key || "").trim() ===
                  String(criterion.key || "").trim() ||
                String(r.criterion_id || "").trim() ===
                  String(criterion.id || "").trim(),
            );
            scoresMap[criterion.key] = response
              ? Number(response.star_value || 0)
              : 0;
            reflectionsMap[criterion.key] = response
              ? String(response.reflection || "").trim()
              : "";
          });

          setScores(scoresMap);
          setReflections(reflectionsMap);
        }
      }

      const reflectionMaxData = await reflectionMaxRes.json().catch(() => ({}));
      const reflectionMax = Math.min(
        5000,
        Math.max(
          100,
          Number(reflectionMaxData?.value || DEFAULT_REFLECTION_MAX),
        ),
      );
      setMaxReflectionChars(reflectionMax);
    } catch (error) {
      setEditError("Failed to load evaluation.");
    } finally {
      setIsEditLoading(false);
    }
  };

  return {
    isEditMode: isEditModeLocal,
    editEvaluationId,
    editTitle,
    isEditLoading,
    editError,
    setEditTitle: setEditTitleLocal,
    initEdit,
  };
}
