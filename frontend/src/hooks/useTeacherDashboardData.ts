import { useState, useEffect, useCallback } from "react";
import { useTeacherIdentity } from "./useTeacherIdentity";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  toDisplayName,
  extractGeneration,
  extractClassNameLegacy,
  getEvaluationSortValue,
  formatShortDateWithTime,
  getStudentStatus,
  normalizeGender,
  resolveAvatarUrl,
} from "../lib/teacher/utils";
import type { GenderOption } from "../lib/teacher/types";

export interface StudentData {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  generation: string;
  class: string;
  gender: string | null;
  rating: number | null;
  status: "Healthy" | "Action Needed" | "No Data";
  lastEval: string;
}

interface UseTeacherDashboardDataReturn {
  students: StudentData[];
  evaluations: any[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useTeacherDashboardData(): UseTeacherDashboardDataReturn {
  const { teacherId } = useTeacherIdentity();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!teacherId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
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
      setEvaluations(Array.isArray(evaluationsData) ? evaluationsData : []);

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
              .filter(
                (id: number): id is number => Number.isInteger(id) && id > 0,
              )
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
                class: extractClassNameLegacy(user),
                gender: (() => {
                  const normalized = normalizeGender(user.gender);
                  return normalized === "unknown" ? null : normalized;
                })(),
                rating: averageScore,
                status: status as StudentData["status"],
                lastEval: latestEvaluation
                  ? formatShortDateWithTime(
                      latestEvaluation.submitted_at ||
                        latestEvaluation.created_at,
                    )
                  : "No Data",
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      setStudents(mappedStudents);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    students,
    evaluations,
    loading,
    refetch: loadDashboardData,
  };
}
