import { useState, useEffect, useCallback } from "react";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  toDisplayName,
  extractGeneration,
  extractClassNameLegacy,
  formatShortDateWithTime,
  getEvaluationSortValue,
  getStudentStatus,
  normalizeGender,
  resolveAvatarUrl,
} from "../../../lib/teacher/utils";
import type { Gender } from "../lib/teacher/types";

export interface StudentData {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  generation: string;
  className: string;
  gender: Gender;
  rating: number | null;
  status: "Healthy" | "Action Needed" | "No Data";
  lastEval: string;
}

export function useAttentionStudents(teacherId: number | null) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!teacherId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, evaluationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users/teachers/students/${teacherId}`),
        fetch(`${API_BASE_URL}/evaluations`),
      ]);

      let usersData = [];
      if (usersResponse.ok) {
        usersData = await usersResponse.json().catch(() => []);
      } else {
        const fallbackResponse = await fetch(`${API_BASE_URL}/users`);
        usersData = await fallbackResponse.json().catch(() => []);
      }

      const evaluationsData = evaluationsResponse.ok
        ? await evaluationsResponse.json().catch(() => [])
        : [];

      const studentIdSet = new Set(
        Array.isArray(usersData)
          ? usersData
              .filter(
                (user: any) =>
                  String(user.role || "")
                    .trim()
                    .toLowerCase() === "student",
              )
              .map((user: any) => Number(user.id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [],
      );

      const latestEvaluationByUser = new Map<number, any>();
      if (Array.isArray(evaluationsData)) {
        [...evaluationsData]
          .sort(
            (left: any, right: any) =>
              getEvaluationSortValue(right) - getEvaluationSortValue(left),
          )
          .forEach((evaluation: any) => {
            const userId = Number(evaluation.user_id);
            if (
              Number.isInteger(userId) &&
              userId > 0 &&
              studentIdSet.has(userId) &&
              !latestEvaluationByUser.has(userId)
            ) {
              latestEvaluationByUser.set(userId, evaluation);
            }
          });
      }

      const mappedStudents: StudentData[] = Array.isArray(usersData)
        ? (usersData as any[])
            .filter(
              (user: any) =>
                String(user.role || "")
                  .trim()
                  .toLowerCase() === "student",
            )
            .map((user: any) => {
              const latestEvaluation =
                latestEvaluationByUser.get(Number(user.id)) || null;
              const averageScore =
                latestEvaluation &&
                Number.isFinite(Number(latestEvaluation.average_score))
                  ? Number(latestEvaluation.average_score)
                  : null;
              const status = getStudentStatus(averageScore);
              return {
                id: Number(user.id),
                studentId:
                  String(
                    user.student_id || user.resolved_student_id || "",
                  ).trim() || `STU-${user.id}`,
                name: toDisplayName(user),
                avatar: resolveAvatarUrl(
                  String(user.profile_image || "").trim(),
                  DEFAULT_AVATAR,
                ),
                generation: extractGeneration(user),
                className: extractClassNameLegacy(user),
                gender: (normalizeGender(user.gender) as Gender) || "unknown",
                rating: averageScore,
                status: status,
                lastEval: latestEvaluation
                  ? formatShortDateWithTime(
                      latestEvaluation.submitted_at ||
                        latestEvaluation.created_at,
                    )
                  : "No Data",
              };
            })
            .filter((student) => student.status === "Action Needed")
            .sort((a, b) =>
              a.rating !== null && b.rating !== null
                ? a.rating - b.rating
                : a.name.localeCompare(b.name),
            )
        : [];
      setStudents(mappedStudents);
    } catch (err) {
      console.error("Failed to load attention students data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { students, isLoading, error };
}
