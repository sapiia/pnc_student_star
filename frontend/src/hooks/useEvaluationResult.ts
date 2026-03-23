import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { CRITERION_STYLES } from '../components/student/evaluation/constants';
import type {
  CriterionView,
  EvaluationRecord,
  EvaluationResponse,
  EvaluationResultLocationState,
  FeedbackItem,
  ResultRadarDatum,
  ResultRadarKey,
} from '../components/student/evaluation/result/types';
import { formatLongDate, formatPeriodInput } from '../lib/evaluationUtils';
import { getRealtimeSocket } from '../lib/realtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_RATING_SCALE = 5;
const TOAST_DURATION_MS = 5000;

type StoredAuthUser = {
  id?: number | string;
};

type EvaluationCriterionConfig = {
  id?: string;
  name?: string;
  icon?: string;
  status?: string;
};

const toCriterionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const parseStoredAuthUser = (): StoredAuthUser | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const formatPeriodLabel = (value: string) => formatPeriodInput(value) || 'Current';

const getEvaluationDate = (evaluation?: EvaluationRecord | null) =>
  String(evaluation?.submitted_at || evaluation?.created_at || '');

const getKeyToIdMap = (criteria: EvaluationCriterionConfig[]) => {
  const keyToIdMap = new Map<string, string>();

  criteria.forEach((criterion) => {
    const criterionId = String(criterion.id || '').trim();
    if (!criterionId) return;

    const criterionKey = toCriterionKey(String(criterion.name || ''));
    if (criterionKey) keyToIdMap.set(criterionKey, criterionId);
    keyToIdMap.set(criterionId, criterionId);
  });

  return keyToIdMap;
};

const findMatchingResponse = (
  responses: EvaluationResponse[],
  criterion: EvaluationCriterionConfig,
  keyToIdMap: Map<string, string>,
) => {
  const criterionId = String(criterion.id || '').trim();
  const criterionName = String(criterion.name || '').trim().toLowerCase();

  return responses.find((response) => {
    const responseKey = String(response.criterion_key || '').trim();
    const responseId = String(response.criterion_id || '').trim();
    const responseName = String(response.criterion_name || '').trim().toLowerCase();

    return (
      responseId === criterionId ||
      keyToIdMap.get(responseKey) === criterionId ||
      responseName === criterionName
    );
  });
};

const findCriterionResponse = (
  responses: EvaluationResponse[],
  criterion: CriterionView,
) => {
  const criterionNameKey = toCriterionKey(criterion.label);

  return responses.find((response) => {
    const responseId = String(response.criterion_id || '').trim();
    const responseKey = String(response.criterion_key || '').trim();
    const responseNameKey = toCriterionKey(String(response.criterion_name || ''));

    return (
      responseId === criterion.key ||
      responseKey === criterion.key ||
      responseNameKey === criterionNameKey
    );
  });
};

export function useEvaluationResult() {
  const location = useLocation();
  const locationState = (location.state || {}) as EvaluationResultLocationState;

  const [evaluation, setEvaluation] = useState(null as EvaluationRecord | null);
  const [previousEvaluation, setPreviousEvaluation] = useState(
    null as EvaluationRecord | null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(locationState.evaluationId));
  const [quarterFeedback, setQuarterFeedback] = useState([] as FeedbackItem[]);
  const [activeCriterion, setActiveCriterion] = useState(
    null as CriterionView | null,
  );
  const [globalRatingScale, setGlobalRatingScale] = useState(DEFAULT_RATING_SCALE);
  const [globalCriteria, setGlobalCriteria] = useState(
    [] as EvaluationCriterionConfig[],
  );
  const [toastMessage, setToastMessage] = useState(null as string | null);
  const [feedbackReloadKey, setFeedbackReloadKey] = useState(0);
  const [configReloadKey, setConfigReloadKey] = useState(0);
  const toastTimerRef = useRef(null as ReturnType<typeof setTimeout> | null);

  const showToast = useEffectEvent((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  });

  const refreshFeedback = useEffectEvent(() => {
    setFeedbackReloadKey((current) => current + 1);
  });

  const refreshConfiguration = useEffectEvent(() => {
    setConfigReloadKey((current) => current + 1);
  });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadEvaluationResult = async () => {
      setIsLoading(Boolean(locationState.evaluationId));

      try {
        const criteriaResponse = await fetch(`${API_BASE_URL}/settings/evaluation-criteria`);
        const criteriaData = await criteriaResponse.json().catch(() => ({}));

        if (!isActive) return;

        if (criteriaResponse.ok && criteriaData?.ratingScale) {
          setGlobalRatingScale(Math.max(1, Number(criteriaData.ratingScale)));
        }

        if (criteriaResponse.ok && Array.isArray(criteriaData?.criteria)) {
          setGlobalCriteria(criteriaData.criteria);
        } else {
          setGlobalCriteria([]);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Error loading evaluation settings:', error);
        setGlobalCriteria([]);
      }

      if (!locationState.evaluationId) {
        if (!isActive) return;
        setEvaluation(null);
        setPreviousEvaluation(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/evaluations/${locationState.evaluationId}`,
        );
        const evaluationData = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(evaluationData?.error || 'Failed to load evaluation result.');
        }

        if (!isActive) return;

        const nextEvaluation = evaluationData as EvaluationRecord;
        setEvaluation(nextEvaluation);

        const userId = Number(nextEvaluation.user_id);
        if (!Number.isInteger(userId) || userId <= 0) {
          setPreviousEvaluation(null);
          return;
        }

        const historyResponse = await fetch(`${API_BASE_URL}/evaluations/user/${userId}`);
        const historyData = await historyResponse.json().catch(() => []);

        if (!isActive) return;

        const sortedHistory = Array.isArray(historyData)
          ? [...historyData].sort(
              (left: EvaluationRecord, right: EvaluationRecord) =>
                new Date(getEvaluationDate(right)).getTime() -
                new Date(getEvaluationDate(left)).getTime(),
            )
          : [];

        const currentIndex = sortedHistory.findIndex(
          (item) => Number(item.id) === Number(locationState.evaluationId),
        );

        if (currentIndex !== -1 && currentIndex < sortedHistory.length - 1) {
          setPreviousEvaluation(sortedHistory[currentIndex + 1] as EvaluationRecord);
        } else {
          setPreviousEvaluation(null);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Error loading evaluation result:', error);
        setEvaluation(null);
        setPreviousEvaluation(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadEvaluationResult();

    return () => {
      isActive = false;
    };
  }, [configReloadKey, locationState.evaluationId]);

  useEffect(() => {
    let isActive = true;

    const loadQuarterFeedback = async () => {
      if (!evaluation?.id) {
        setQuarterFeedback([]);
        return;
      }

      try {
        const authUser = parseStoredAuthUser();
        const fallbackUserId = Number(authUser?.id);
        const userId = Number(evaluation.user_id || fallbackUserId);

        if (!Number.isInteger(userId) || userId <= 0) {
          if (isActive) setQuarterFeedback([]);
          return;
        }

        const [visibilityResponse, feedbackResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
          fetch(`${API_BASE_URL}/feedbacks/student/${userId}`),
        ]);

        const visibilityData = await visibilityResponse.json().catch(() => ({}));
        const feedbackData = await feedbackResponse.json().catch(() => []);
        const canViewFeedback = !['false', '0'].includes(
          String(visibilityData?.value || 'true').trim().toLowerCase(),
        );

        if (!isActive) return;

        if (!canViewFeedback || !feedbackResponse.ok || !Array.isArray(feedbackData)) {
          setQuarterFeedback([]);
          return;
        }

        const matchedFeedback = (feedbackData as FeedbackItem[])
          .filter((item) => Number(item.evaluation_id) === Number(evaluation.id))
          .sort(
            (left, right) =>
              new Date(String(left.created_at || '')).getTime() -
              new Date(String(right.created_at || '')).getTime(),
          );

        setQuarterFeedback(matchedFeedback);
      } catch {
        if (isActive) setQuarterFeedback([]);
      }
    };

    loadQuarterFeedback();

    return () => {
      isActive = false;
    };
  }, [evaluation?.id, evaluation?.user_id, feedbackReloadKey]);

  useEffect(() => {
    const authUser = parseStoredAuthUser();
    const userId = Number(authUser?.id);

    if (!Number.isInteger(userId) || userId <= 0) return;

    const socket = getRealtimeSocket();

    const handleFeedbackCreated = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('Your teacher just sent you new feedback!');
      refreshFeedback();
    };

    const handleFeedbackUpdated = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('A teacher updated their feedback for you.');
      refreshFeedback();
    };

    const handleFeedbackDeleted = (payload: { studentId?: number }) => {
      if (Number(payload?.studentId) !== userId) return;
      showToast('A feedback message was removed.');
      refreshFeedback();
    };

    const handleNotificationCreated = (payload: {
      userId?: number;
      notification?: { message?: string };
    }) => {
      if (Number(payload?.userId) !== userId) return;

      const message = String(payload?.notification?.message || '');
      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes('evaluation') ||
        normalizedMessage.includes('criteria')
      ) {
        showToast(
          'Admin updated evaluation settings. Your results may reflect the latest criteria.',
        );
        refreshConfiguration();
        return;
      }

      if (
        normalizedMessage.includes('profile') ||
        normalizedMessage.includes('class') ||
        normalizedMessage.includes('student id')
      ) {
        showToast('An admin updated your profile information.');
        return;
      }

      if (message) {
        showToast(message);
      }
    };

    socket.emit('feedback:subscribe', { studentId: userId });
    socket.on('feedback:created', handleFeedbackCreated);
    socket.on('feedback:updated', handleFeedbackUpdated);
    socket.on('feedback:deleted', handleFeedbackDeleted);
    socket.on('notification:created', handleNotificationCreated);

    return () => {
      socket.emit('feedback:unsubscribe', { studentId: userId });
      socket.off('feedback:created', handleFeedbackCreated);
      socket.off('feedback:updated', handleFeedbackUpdated);
      socket.off('feedback:deleted', handleFeedbackDeleted);
      socket.off('notification:created', handleNotificationCreated);
    };
  }, [refreshConfiguration, refreshFeedback, showToast]);

  const criteriaData: CriterionView[] = useMemo(() => {
    const activeGlobalCriteria = globalCriteria.filter(
      (criterion) => String(criterion.status || '').toLowerCase() === 'active',
    );

    if (activeGlobalCriteria.length > 0) {
      const keyToIdMap = getKeyToIdMap(activeGlobalCriteria);

      return activeGlobalCriteria.map((criterion, index) => {
        const response = findMatchingResponse(
          evaluation?.responses || [],
          criterion,
          keyToIdMap,
        );

        return {
          key: String(criterion.id || criterion.name || `criterion-${index}`),
          label: String(criterion.name || 'Unnamed Criterion'),
          icon: String(criterion.icon || 'Star'),
          score: response ? Number(response.star_value || 0) : 0,
          reflection: response ? String(response.reflection || '').trim() : '',
          tip: response ? String(response.tip_snapshot || '').trim() : '',
          ...CRITERION_STYLES[index % CRITERION_STYLES.length],
        };
      });
    }

    if (evaluation?.responses?.length) {
      return evaluation.responses.map((response, index) => ({
        key:
          response.criterion_key ||
          toCriterionKey(response.criterion_name || `criterion${index + 1}`),
        label: response.criterion_name || `Criterion ${index + 1}`,
        icon: String(response.criterion_icon || 'Star'),
        score: Number(response.star_value || 0),
        reflection: String(response.reflection || '').trim(),
        tip: String(response.tip_snapshot || '').trim(),
        ...CRITERION_STYLES[index % CRITERION_STYLES.length],
      }));
    }

    const fallbackScores = locationState.scores || {};
    const fallbackReflections = locationState.reflections || {};

    return Object.keys(fallbackScores).map((key, index) => ({
      key,
      label: key,
      icon: 'Star',
      score: Number(fallbackScores[key] || 0),
      reflection: String(fallbackReflections[key] || '').trim(),
      tip: '',
      ...CRITERION_STYLES[index % CRITERION_STYLES.length],
    }));
  }, [evaluation, globalCriteria, locationState.reflections, locationState.scores]);

  useEffect(() => {
    if (!activeCriterion) return;

    const nextActiveCriterion = criteriaData.find(
      (criterion) => criterion.key === activeCriterion.key,
    );

    if (!nextActiveCriterion) {
      setActiveCriterion(null);
      return;
    }

    if (
      nextActiveCriterion.score !== activeCriterion.score ||
      nextActiveCriterion.label !== activeCriterion.label ||
      nextActiveCriterion.icon !== activeCriterion.icon ||
      nextActiveCriterion.reflection !== activeCriterion.reflection ||
      nextActiveCriterion.tip !== activeCriterion.tip
    ) {
      setActiveCriterion(nextActiveCriterion);
    }
  }, [activeCriterion, criteriaData]);

  const ratingScale = globalRatingScale;

  const averageScore =
    criteriaData.length > 0
      ? criteriaData.reduce((sum, criterion) => sum + criterion.score, 0) /
        criteriaData.length
      : Number(evaluation?.average_score || 0);

  const strongestCriterion = criteriaData.reduce<CriterionView | null>(
    (currentBest, criterion) =>
      currentBest === null || criterion.score > currentBest.score
        ? criterion
        : currentBest,
    null,
  );

  const focusCriterion = criteriaData.reduce<CriterionView | null>(
    (currentLowest, criterion) =>
      currentLowest === null || criterion.score < currentLowest.score
        ? criterion
        : currentLowest,
    null,
  );

  const radarData: ResultRadarDatum[] = useMemo(
    () =>
      criteriaData.map((criterion) => {
        const previousResponse = findCriterionResponse(
          previousEvaluation?.responses || [],
          criterion,
        );

        return {
          subject: criterion.label,
          prev: Math.max(0, Number(previousResponse?.star_value || 0)),
          curr: Math.max(0, criterion.score),
        };
      }),
    [criteriaData, previousEvaluation?.responses],
  );

  const periodLabel = formatPeriodLabel(evaluation?.period || '');

  const radarKeys: ResultRadarKey[] = useMemo(
    () => [
      {
        key: 'prev',
        name: previousEvaluation ? formatPeriodLabel(previousEvaluation.period) : 'Baseline',
        color: '#cbd5e1',
        fill: '#cbd5e1',
      },
      {
        key: 'curr',
        name: periodLabel,
        color: '#5d5fef',
        fill: '#5d5fef',
      },
    ],
    [periodLabel, previousEvaluation],
  );

  const completedLabel = formatLongDate(
    getEvaluationDate(evaluation) || new Date().toISOString(),
  );

  return {
    activeCriterion,
    averageScore,
    closeCriterion: () => setActiveCriterion(null),
    completedLabel,
    criteriaData,
    dismissToast: () => setToastMessage(null),
    evaluation,
    focusCriterion,
    isLoading,
    openCriterion: (criterion: CriterionView) => setActiveCriterion(criterion),
    periodLabel,
    quarterFeedback,
    radarData,
    radarKeys,
    ratingScale,
    strongestCriterion,
    toastMessage,
  };
}
