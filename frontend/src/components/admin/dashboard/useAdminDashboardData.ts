import { useEffect, useState } from "react";

import { API_BASE_URL } from "../../../lib/api";

import type {
  ApiUserRecord,
  DashboardSortBy,
  DashboardSortOrder,
  DashboardSummary,
} from "./adminDashboard.types";
import {
  EMPTY_DASHBOARD_SUMMARY,
  mapUsersToDashboardSummary,
} from "./adminDashboard.utils";

export function useAdminDashboardData(
  sortBy: DashboardSortBy,
  sortOrder: DashboardSortOrder,
) {
  const [dashboardData, setDashboardData] = useState(
    null as DashboardSummary | null,
  );

  const refreshDashboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users?sortBy=${sortBy}&sortOrder=${sortOrder}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setDashboardData(mapUsersToDashboardSummary(data as ApiUserRecord[]));
        return;
      }

      setDashboardData(EMPTY_DASHBOARD_SUMMARY);
    } catch (error) {
      console.error(error);
      setDashboardData((current) => current ?? EMPTY_DASHBOARD_SUMMARY);
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, [sortBy, sortOrder]);

  return {
    dashboardData,
    refreshDashboard,
  };
}
