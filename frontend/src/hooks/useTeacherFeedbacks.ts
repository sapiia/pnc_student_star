import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getRealtimeSocket, type FeedbackRealtimePayload } from '../lib/realtime';
import { API_BASE_URL } from '../lib/teacher/utils';
import type { FeedbackRecord } from '../lib/teacher/types';

type UseTeacherFeedbacksOptions = {
  enabled?: boolean;
};

type UseTeacherFeedbacksResult = {
  feedbacks: FeedbackRecord[];
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  setFeedbacks: Dispatch<SetStateAction<FeedbackRecord[]>>;
};

export function useTeacherFeedbacks(
  teacherId: number | null,
  options: UseTeacherFeedbacksOptions = {},
): UseTeacherFeedbacksResult {
  const { enabled = true } = options;
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFeedbacks = useCallback(async () => {
    if (!teacherId) {
      setFeedbacks([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/teacher/${teacherId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data?.error || 'Failed to load teacher feedback.');
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher feedback.');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (!enabled) return;
    void loadFeedbacks();
  }, [enabled, loadFeedbacks]);

  useEffect(() => {
    if (!enabled || !teacherId) return;
    const socket = getRealtimeSocket();
    const subscription = { teacherId };
    const handleFeedbackEvent = (payload: FeedbackRealtimePayload = {}) => {
      if (Number(payload.teacherId) !== teacherId) return;
      void loadFeedbacks();
    };

    socket.emit('feedback:subscribe', subscription);
    socket.on('feedback:created', handleFeedbackEvent);
    socket.on('feedback:updated', handleFeedbackEvent);
    socket.on('feedback:deleted', handleFeedbackEvent);

    return () => {
      socket.emit('feedback:unsubscribe', subscription);
      socket.off('feedback:created', handleFeedbackEvent);
      socket.off('feedback:updated', handleFeedbackEvent);
      socket.off('feedback:deleted', handleFeedbackEvent);
    };
  }, [enabled, loadFeedbacks, teacherId]);

  return { feedbacks, isLoading, error, reload: loadFeedbacks, setFeedbacks };
}
