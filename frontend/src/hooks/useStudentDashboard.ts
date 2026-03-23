import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReducedMotion, type Transition } from 'motion/react';
import type {
  CriterionDetail,
  EvaluationRecord,
  FeedbackItem,
  GlobalCriterion,
  NotificationItem,
} from '../components/student/dashboard/types';
import {
  API_BASE_URL,
  buildCurrentStatusCriteria,
  buildHistoricalComparison,
  formatLongDate,
  getCurrentPeriodLabel,
  getEvaluationSortValue,
  isSettingEnabled,
  normalizeFeedbackItems,
} from '../components/student/dashboard/utils';
import {
  getRealtimeSocket,
  type FeedbackRealtimePayload,
} from '../lib/realtime';

type AuthUser = {
  id?: number | string;
  name?: string;
  student_id?: string;
};

type StudentPreference = {
  remindersEnabled?: boolean;
};

type UserResponse = {
  name?: string;
  first_name?: string;
  last_name?: string;
  student_id?: string;
  resolved_student_id?: string;
};

type SettingResponse = {
  value?: string | number | boolean;
};

type CriteriaConfigResponse = {
  ratingScale?: number;
  criteria?: GlobalCriterion[];
};

const DEFAULT_CYCLE_DAYS = 90;
const DEFAULT_MAX_EVALUATIONS = 1;
const DEFAULT_RATING_SCALE = 5;

export function useStudentDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const currentPeriodLabel = useMemo(() => getCurrentPeriodLabel(), []);

  const [daysLeft, setDaysLeft] = useState(0);
  const [cycleDays, setCycleDays] = useState(DEFAULT_CYCLE_DAYS);
  const [studentName, setStudentName] = useState('Student');
  const [studentId, setStudentId] = useState('');
  const [studentUserId, setStudentUserId] = useState(null as number | null);
  const [evaluations, setEvaluations] = useState([] as EvaluationRecord[]);
  const [recentFeedback, setRecentFeedback] = useState([] as FeedbackItem[]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [latestEvaluation, setLatestEvaluation] =
    useState(null as EvaluationRecord | null);
  const [activeCriterion, setActiveCriterion] =
    useState(null as CriterionDetail | null);
  const [globalRatingScale, setGlobalRatingScale] =
    useState(DEFAULT_RATING_SCALE);
  const [globalCriteria, setGlobalCriteria] = useState([] as GlobalCriterion[]);
  const [maxEvaluationsPerCycle, setMaxEvaluationsPerCycle] = useState(
    DEFAULT_MAX_EVALUATIONS
  );
  const [evaluationsUsed, setEvaluationsUsed] = useState(0);

  const canStartEvaluation = !latestEvaluation || daysLeft === 0;
  const showUrgentNotification = daysLeft <= 3;

  const currentStatusCriteria = useMemo(
    () => buildCurrentStatusCriteria(globalCriteria, latestEvaluation),
    [globalCriteria, latestEvaluation]
  );

  const historicalComparison = useMemo(
    () =>
      buildHistoricalComparison(evaluations, globalRatingScale, globalCriteria),
    [evaluations, globalCriteria, globalRatingScale]
  );

  const cardTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] };
  const listTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

  const resetDashboard = useCallback(() => {
    setDaysLeft(0);
    setCycleDays(DEFAULT_CYCLE_DAYS);
    setStudentName('Student');
    setStudentId('');
    setStudentUserId(null);
    setEvaluations([]);
    setRecentFeedback([]);
    setUnreadNotificationCount(0);
    setLatestEvaluation(null);
    setActiveCriterion(null);
    setGlobalRatingScale(DEFAULT_RATING_SCALE);
    setGlobalCriteria([]);
    setMaxEvaluationsPerCycle(DEFAULT_MAX_EVALUATIONS);
    setEvaluationsUsed(0);
  }, []);

  const loadRecentFeedback = useCallback(
    async (userId = studentUserId) => {
      if (!userId) {
        setRecentFeedback([]);
        return;
      }

      try {
        const [visibilityResponse, feedbackResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
          fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        ]);

        const visibilityData =
          ((await visibilityResponse.json().catch(() => ({}))) as SettingResponse) ||
          {};
        const feedbackData =
          ((await feedbackResponse.json().catch(() => [])) as FeedbackItem[]) || [];

        if (
          !isSettingEnabled(visibilityData.value) ||
          !feedbackResponse.ok ||
          !Array.isArray(feedbackData)
        ) {
          setRecentFeedback([]);
          return;
        }

        setRecentFeedback(normalizeFeedbackItems(feedbackData));
      } catch {
        setRecentFeedback([]);
      }
    },
    [studentUserId]
  );

  const loadIdentity = useCallback(async () => {
    try {
      const rawAuthUser = localStorage.getItem('auth_user');

      if (!rawAuthUser) {
        resetDashboard();
        return;
      }

      const authUser = JSON.parse(rawAuthUser) as AuthUser;
      const userId = Number(authUser?.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        resetDashboard();
        return;
      }

      setStudentUserId(userId);

      const localName = String(authUser?.name || '').trim();
      const localStudentId = String(authUser?.student_id || '').trim();

      if (localName) {
        setStudentName(localName);
      }

      if (localStudentId) {
        setStudentId(localStudentId);
      }

      const rawPreference = localStorage.getItem(`student_notify_${userId}`);
      const preference = rawPreference
        ? (JSON.parse(rawPreference) as StudentPreference)
        : null;
      const remindersEnabledPreference = preference?.remindersEnabled !== false;

      const [
        userResponse,
        intervalResponse,
        evaluationsResponse,
        feedbackVisibilityResponse,
        reminderNotificationResponse,
        feedbackResponse,
        notificationsResponse,
        criteriaConfigResponse,
        maxEvaluationsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/users/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
        fetch(`${API_BASE_URL}/evaluations/user/${userId}`),
        fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
        fetch(`${API_BASE_URL}/settings/key/student_receives_reminder_notifications`),
        fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        fetch(`${API_BASE_URL}/notifications/user/${userId}`),
        fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
        fetch(`${API_BASE_URL}/settings/key/student_max_evaluations_per_cycle`),
      ]);

      const userData =
        ((await userResponse.json().catch(() => ({}))) as UserResponse) || {};
      const intervalData =
        ((await intervalResponse.json().catch(() => ({}))) as SettingResponse) ||
        {};
      const evaluationsData =
        ((await evaluationsResponse.json().catch(() => [])) as EvaluationRecord[]) ||
        [];
      const feedbackVisibilityData =
        ((await feedbackVisibilityResponse.json().catch(() => ({}))) as SettingResponse) ||
        {};
      const reminderData =
        ((await reminderNotificationResponse.json().catch(() => ({}))) as SettingResponse) ||
        {};
      const feedbackData =
        ((await feedbackResponse.json().catch(() => [])) as FeedbackItem[]) || [];
      const notificationData =
        ((await notificationsResponse.json().catch(() => [])) as NotificationItem[]) ||
        [];
      const criteriaConfigData =
        ((await criteriaConfigResponse.json().catch(() => ({}))) as CriteriaConfigResponse) ||
        {};
      const maxEvaluationsData =
        ((await maxEvaluationsResponse.json().catch(() => ({}))) as SettingResponse) ||
        {};

      const nextRatingScale = Math.max(
        1,
        Number(criteriaConfigData?.ratingScale || DEFAULT_RATING_SCALE)
      );
      const nextGlobalCriteria = Array.isArray(criteriaConfigData?.criteria)
        ? criteriaConfigData.criteria
        : [];
      const nextMaxEvaluationsPerCycle = Math.min(
        12,
        Math.max(1, Number(maxEvaluationsData?.value || DEFAULT_MAX_EVALUATIONS))
      );
      const sortedEvaluations = Array.isArray(evaluationsData)
        ? [...evaluationsData].sort(
            (left, right) => getEvaluationSortValue(right) - getEvaluationSortValue(left)
          )
        : [];
      const nextLatestEvaluation = sortedEvaluations[0] || null;
      const nextNotifications = Array.isArray(notificationData)
        ? notificationData
        : [];
      const resolvedCycleDays = Math.min(
        365,
        Math.max(30, Number(intervalData?.value || DEFAULT_CYCLE_DAYS))
      );

      setGlobalRatingScale(nextRatingScale);
      setGlobalCriteria(nextGlobalCriteria);
      setMaxEvaluationsPerCycle(nextMaxEvaluationsPerCycle);
      setEvaluations(sortedEvaluations);
      setLatestEvaluation(nextLatestEvaluation);
      setCycleDays(resolvedCycleDays);
      setUnreadNotificationCount(
        nextNotifications.filter((notification) => Number(notification.is_read) !== 1)
          .length
      );

      const resolvedName =
        String(userData?.name || '').trim() ||
        [userData?.first_name, userData?.last_name].filter(Boolean).join(' ').trim() ||
        localName ||
        'Student';
      const resolvedStudentId = String(
        userData?.student_id || userData?.resolved_student_id || localStudentId || ''
      ).trim();

      setStudentName(resolvedName);
      setStudentId(resolvedStudentId);

      if (
        isSettingEnabled(feedbackVisibilityData.value) &&
        Array.isArray(feedbackData)
      ) {
        setRecentFeedback(normalizeFeedbackItems(feedbackData));
      } else {
        setRecentFeedback([]);
      }

      const now = Date.now();
      const evaluationWindowStart =
        now - resolvedCycleDays * 24 * 60 * 60 * 1000;
      const evaluationsInWindow = sortedEvaluations.filter((evaluation) => {
        const submittedAt = String(
          evaluation.submitted_at || evaluation.created_at || ''
        ).trim();
        const timestamp = new Date(submittedAt).getTime();

        return Number.isFinite(timestamp) && timestamp >= evaluationWindowStart;
      });

      const nextEvaluationsUsed = evaluationsInWindow.length;
      setEvaluationsUsed(nextEvaluationsUsed);

      let nextAvailableDate: Date | null = null;
      let nextDaysLeft = 0;

      if (nextEvaluationsUsed >= nextMaxEvaluationsPerCycle) {
        const earliestTimestamp = evaluationsInWindow.reduce((minimum, evaluation) => {
          const submittedAt = String(
            evaluation.submitted_at || evaluation.created_at || ''
          ).trim();
          const timestamp = new Date(submittedAt).getTime();

          if (!Number.isFinite(timestamp)) {
            return minimum;
          }

          return Math.min(minimum, timestamp);
        }, Number.POSITIVE_INFINITY);

        if (Number.isFinite(earliestTimestamp)) {
          nextAvailableDate = new Date(earliestTimestamp);
          nextAvailableDate.setDate(nextAvailableDate.getDate() + resolvedCycleDays);

          const remaining = nextAvailableDate.getTime() - now;
          nextDaysLeft = Math.max(
            0,
            Math.ceil(remaining / (1000 * 60 * 60 * 24))
          );
        }
      }

      setDaysLeft(nextDaysLeft);

      if (
        isSettingEnabled(reminderData.value) &&
        remindersEnabledPreference &&
        nextEvaluationsUsed >= nextMaxEvaluationsPerCycle &&
        nextDaysLeft === 3 &&
        nextAvailableDate
      ) {
        const message = `Reminder: your next evaluation opens in 3 days on ${formatLongDate(nextAvailableDate)}.`;
        const reminderExists = nextNotifications.some(
          (notification) => String(notification.message || '').trim() === message
        );

        if (!reminderExists) {
          const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              message,
              is_read: 0,
            }),
          });

          if (response.ok) {
            setUnreadNotificationCount((count) => count + 1);
            window.dispatchEvent(new Event('student-notifications-updated'));
          }
        }
      }
    } catch {
      resetDashboard();
    }
  }, [resetDashboard]);

  useEffect(() => {
    void loadIdentity();
  }, [loadIdentity]);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      void loadIdentity();
    };

    window.addEventListener('student-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('student-settings-updated', handleSettingsUpdate);
    };
  }, [loadIdentity]);

  useEffect(() => {
    if (!studentUserId) {
      return;
    }

    const socket = getRealtimeSocket();
    const subscription = { studentId: studentUserId };
    const handleFeedbackUpdate = (payload: FeedbackRealtimePayload = {}) => {
      if (Number(payload.studentId) !== studentUserId) {
        return;
      }

      void loadRecentFeedback(studentUserId);
    };

    socket.emit('feedback:subscribe', subscription);
    socket.on('feedback:created', handleFeedbackUpdate);
    socket.on('feedback:updated', handleFeedbackUpdate);
    socket.on('feedback:deleted', handleFeedbackUpdate);

    return () => {
      socket.emit('feedback:unsubscribe', subscription);
      socket.off('feedback:created', handleFeedbackUpdate);
      socket.off('feedback:updated', handleFeedbackUpdate);
      socket.off('feedback:deleted', handleFeedbackUpdate);
    };
  }, [loadRecentFeedback, studentUserId]);

  const openCriterion = useCallback((criterion: CriterionDetail) => {
    setActiveCriterion(criterion);
  }, []);

  const closeCriterion = useCallback(() => {
    setActiveCriterion(null);
  }, []);

  return {
    activeCriterion,
    canStartEvaluation,
    cardTransition,
    closeCriterion,
    currentPeriodLabel,
    currentStatusCriteria,
    cycleDays,
    daysLeft,
    evaluationsUsed,
    globalRatingScale,
    historicalComparison,
    latestEvaluation,
    listTransition,
    maxEvaluationsPerCycle,
    openCriterion,
    prefersReducedMotion,
    recentFeedback,
    showUrgentNotification,
    studentId,
    studentName,
    unreadNotificationCount,
  };
}
