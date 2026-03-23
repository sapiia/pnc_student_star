import { useEffect, useState } from "react";
import {
  CRITERION_STYLES,
  DEFAULT_RATING_SCALE,
  type EvaluationCriterion,
} from "../components/student/evaluation/constants";
import { CRITERIA } from "../constants";
import type { Criterion } from "../components/student/dashboard/types";

export function useEvaluationCriteria() {
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>(
    CRITERIA.map((criterion, index) => ({
      ...criterion,
      description: `Reflect on your ${criterion.label.toLowerCase()} this quarter. What is going well? What could be improved?`,
      starDescriptions: Array.from(
        { length: DEFAULT_RATING_SCALE },
        (_, starIndex) =>
          `Describe why ${starIndex + 1} star${starIndex === 0 ? "" : "s"} fits your ${criterion.label.toLowerCase()} this quarter.`,
      ),
      ...CRITERION_STYLES[index % CRITERION_STYLES.length],
    })),
  );
  const [ratingScale, setRatingScale] = useState(DEFAULT_RATING_SCALE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCriteriaConfig = async () => {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
        const response = await fetch(
          `${API_BASE_URL}/settings/evaluation-criteria`,
        );
        const data = await response.json();
        if (
          !response.ok ||
          !Array.isArray(data?.criteria) ||
          data.criteria.length === 0
        ) {
          return;
        }

        const activeCriteria = data.criteria.filter(
          (c: any) => String(c.status).toLowerCase() === "active",
        );
        if (activeCriteria.length === 0) return;

        const nextRatingScale = Math.max(
          1,
          Number(data?.ratingScale || DEFAULT_RATING_SCALE),
        );
        setRatingScale(nextRatingScale);

        const mappedCriteria = activeCriteria.map((c: any, index: number) => {
          const style = CRITERION_STYLES[index % CRITERION_STYLES.length];
          return {
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
            color: style.color,
            bgColor: style.bgColor,
          } as EvaluationCriterion;
        });

        setCriteria(mappedCriteria);
      } catch {
        // fallback already set
      } finally {
        setIsLoading(false);
      }
    };

    loadCriteriaConfig();
  }, []);

  return { criteria, ratingScale, isLoading };
}
