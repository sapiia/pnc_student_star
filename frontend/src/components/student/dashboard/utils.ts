import type {
  CriterionDetail,
  EvaluationRecord,
  EvaluationResponse,
  FeedbackItem,
  GlobalCriterion,
  HistoricalComparison,
} from './types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const STATUS_CARD_STYLES = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-sky-600', bgColor: 'bg-sky-100' },
] as const;

export const formatPeriodLabel = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);

  if (quarterMatch) {
    return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  }

  return trimmed || 'Current';
};

export const formatShortDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'No evaluation yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatLongDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);

export const getCurrentPeriodLabel = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `Q${quarter} ${now.getFullYear()}`;
};

const getPeriodSortValue = (period: string) => {
  const quarterMatch = String(period || '')
    .trim()
    .match(/^(\d{4})-Q([1-4])$/i);

  if (quarterMatch) {
    return Number(quarterMatch[1]) * 10 + Number(quarterMatch[2]);
  }

  return Number.MIN_SAFE_INTEGER;
};

export const getEvaluationSortValue = (evaluation: EvaluationRecord) => {
  const periodSortValue = getPeriodSortValue(evaluation.period);

  if (periodSortValue !== Number.MIN_SAFE_INTEGER) {
    return periodSortValue;
  }

  const dateValue = new Date(
    String(evaluation.submitted_at || evaluation.created_at || '')
  ).getTime();

  return Number.isNaN(dateValue) ? Number.MIN_SAFE_INTEGER : dateValue;
};

export const getRemainingDaysPercent = (daysLeft: number, cycleDays: number) =>
  Math.min(100, Math.max(0, (daysLeft / cycleDays) * 100));

export const isSettingEnabled = (value: unknown, fallback = true) => {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (!normalized) {
    return fallback;
  }

  return !['false', '0'].includes(normalized);
};

export const normalizeFeedbackItems = (feedbackItems: FeedbackItem[]) =>
  [...feedbackItems]
    .sort(
      (left, right) =>
        new Date(String(right.created_at || '')).getTime() -
        new Date(String(left.created_at || '')).getTime()
    )
    .slice(0, 3);

const toCriterionKey = (name: string) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const buildCriterionIdMap = (criteria: GlobalCriterion[]) => {
  const keyToIdMap = new Map<string, string>();

  criteria.forEach((criterion) => {
    if (!criterion.id) {
      return;
    }

    const criterionId = String(criterion.id);
    keyToIdMap.set(toCriterionKey(String(criterion.name || '')), criterionId);
    keyToIdMap.set(criterionId, criterionId);
  });

  return keyToIdMap;
};

const findMatchingResponse = (
  responses: EvaluationResponse[] = [],
  criterion: GlobalCriterion,
  keyToIdMap: Map<string, string>
) => {
  const criterionId = String(criterion.id || '').trim();
  const criterionName = String(criterion.name || '').trim().toLowerCase();

  return responses.find((response) => {
    const responseKey = String(response.criterion_key || '').trim();
    const responseId = String(response.criterion_id || '').trim();
    const responseName = String(response.criterion_name || '')
      .trim()
      .toLowerCase();

    return (
      responseId === criterionId ||
      keyToIdMap.get(responseKey) === criterionId ||
      responseName === criterionName
    );
  });
};

const getActiveCriteria = (criteria: GlobalCriterion[]) =>
  criteria.filter(
    (criterion) => String(criterion.status || '').toLowerCase() === 'active'
  );

export const buildCurrentStatusCriteria = (
  globalCriteria: GlobalCriterion[],
  latestEvaluation: EvaluationRecord | null
): CriterionDetail[] => {
  const activeCriteria = getActiveCriteria(globalCriteria);
  const keyToIdMap = buildCriterionIdMap(activeCriteria);

  return activeCriteria.map((criterion, index) => {
    const response = findMatchingResponse(
      latestEvaluation?.responses,
      criterion,
      keyToIdMap
    );

    return {
      key: String(criterion.id || criterion.name || `criterion-${index}`),
      label: String(criterion.name || 'Unnamed Criterion'),
      icon: String(criterion.icon || 'Star'),
      score: response ? Number(response.star_value || 0) : 0,
      reflection: response ? String(response.reflection || '').trim() : '',
      tip: response ? String(response.tip_snapshot || '').trim() : '',
      ...STATUS_CARD_STYLES[index % STATUS_CARD_STYLES.length],
    };
  });
};

export const buildHistoricalComparison = (
  evaluations: EvaluationRecord[],
  globalRatingScale: number,
  globalCriteria: GlobalCriterion[]
): HistoricalComparison => {
  const sortedEvaluations = [...evaluations].sort(
    (left, right) => getEvaluationSortValue(left) - getEvaluationSortValue(right)
  );

  if (sortedEvaluations.length === 0) {
    return {
      data: [],
      dataKeys: [],
      maxValue: globalRatingScale,
    };
  }

  const comparedEvaluations =
    sortedEvaluations.length === 1
      ? [sortedEvaluations[0]]
      : sortedEvaluations.slice(-2);
  const activeCriteria = getActiveCriteria(globalCriteria);
  const keyToIdMap = buildCriterionIdMap(activeCriteria);

  const data = activeCriteria.map((criterion, index) => {
    const row: Record<string, string | number> = {
      subject: String(criterion.name || `Criterion ${index + 1}`),
    };

    comparedEvaluations.forEach((evaluation, evaluationIndex) => {
      const chartKey =
        comparedEvaluations.length === 1
          ? 'current'
          : evaluationIndex === 0
            ? 'previous'
            : 'current';
      const response = findMatchingResponse(
        evaluation.responses,
        criterion,
        keyToIdMap
      );

      row[chartKey] = response
        ? Math.max(0, Number(response.star_value || 0))
        : 0;
    });

    return row;
  });

  const dataKeys = comparedEvaluations.map((evaluation, index) => ({
    key:
      comparedEvaluations.length === 1
        ? 'current'
        : index === 0
          ? 'previous'
          : 'current',
    name:
      index === 0 && comparedEvaluations.length > 1
        ? 'Baseline'
        : formatPeriodLabel(evaluation.period),
    color:
      comparedEvaluations.length === 1 ||
      index === comparedEvaluations.length - 1
        ? '#5d5fef'
        : '#cbd5e1',
    fill:
      comparedEvaluations.length === 1 ||
      index === comparedEvaluations.length - 1
        ? '#5d5fef'
        : '#cbd5e1',
  }));

  return {
    data,
    dataKeys,
    maxValue: globalRatingScale,
  };
};
