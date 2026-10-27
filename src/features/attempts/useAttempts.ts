import { useState, useEffect, useCallback } from 'react';
import type {
  AttemptWithDetails,
  StudentAnalyticsSummary,
  SaveAnswerPayload,
  AttemptAnswerDetail,
} from './types';
import * as attemptService from './attemptService';
import { useAuth } from '../../context/AuthContext';

export function useAttempts(customStudentId?: string) {
  const { user, authUser } = useAuth();
  const studentId = customStudentId || authUser?.studentId || user?.id || 'std-seed-1';

  const [attempts, setAttempts] = useState<AttemptWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttempts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attemptService.fetchStudentAttempts(studentId);
      setAttempts(data);
    } catch (err: any) {
      console.error('[useAttempts] Failed to load attempts:', err);
      setError(err.message || 'Failed to load attempts');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  const startAttempt = useCallback(
    async (
      assessmentId: string,
      meta?: { assessmentTitle?: string; assessmentType?: string; totalMarks?: number; durationMinutes?: number; subjectName?: string }
    ) => {
      const created = await attemptService.startAttempt(assessmentId, studentId, meta);
      setAttempts((prev) => [created, ...prev]);
      return created;
    },
    [studentId]
  );

  const saveAnswer = useCallback(async (payload: SaveAnswerPayload) => {
    await attemptService.saveAnswer(payload);
  }, []);

  const submitAttempt = useCallback(
    async (
      attemptId: string,
      score: number,
      accuracy: number,
      answersList?: AttemptAnswerDetail[]
    ) => {
      const updated = await attemptService.submitAttempt(attemptId, score, accuracy, answersList);
      if (updated) {
        setAttempts((prev) => prev.map((a) => (a.id === attemptId ? updated : a)));
      }
      return updated;
    },
    []
  );

  return {
    attempts,
    loading,
    error,
    refetch: loadAttempts,
    startAttempt,
    saveAnswer,
    submitAttempt,
  };
}

export function useStudentAnalytics(customStudentId?: string) {
  const { user, authUser } = useAuth();
  const studentId = customStudentId || authUser?.studentId || user?.id || 'std-seed-1';

  const [analytics, setAnalytics] = useState<StudentAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attemptService.getStudentAnalytics(studentId);
      setAnalytics(data);
    } catch (err: any) {
      console.error('[useStudentAnalytics] Failed to calculate analytics:', err);
      setError(err.message || 'Failed to calculate analytics');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: loadAnalytics,
  };
}
