import { useState, useEffect, useCallback } from 'react';
import type {
  AssessmentWithQuestions,
  AssessmentFilter,
  CreateAssessmentInput,
} from './types';
import * as assessmentService from './assessmentService';
import { useAuth } from '../../context/AuthContext';

export function useAssessments(initialFilter?: AssessmentFilter) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentWithQuestions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<AssessmentFilter>(initialFilter || {});

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assessmentService.fetchAssessments(filter);
      setAssessments(data);
    } catch (err: any) {
      console.error('[useAssessments] Failed to load assessments:', err);
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const setFilter = useCallback((newFilter: Partial<AssessmentFilter>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const createAssessment = useCallback(
    async (input: CreateAssessmentInput): Promise<AssessmentWithQuestions> => {
      try {
        const creatorId = user?.id || 'anonymous';
        const creatorName = user?.name || 'Faculty';
        const created = await assessmentService.createAssessment(input, creatorId, creatorName);
        setAssessments((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        console.error('[useAssessments] Create failed:', err);
        throw err;
      }
    },
    [user]
  );

  const deleteAssessment = useCallback(
    async (assessmentId: string) => {
      try {
        await assessmentService.deleteAssessment(assessmentId);
        setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
      } catch (err: any) {
        console.error('[useAssessments] Delete failed:', err);
        throw err;
      }
    },
    []
  );

  return {
    assessments,
    loading,
    error,
    filter,
    setFilter,
    refetch: loadAssessments,
    createAssessment,
    deleteAssessment,
  };
}

export function useAssessmentDetail(assessmentId?: string) {
  const [assessment, setAssessment] = useState<AssessmentWithQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!assessmentId) {
      setAssessment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const found = await assessmentService.getAssessmentById(assessmentId);
      setAssessment(found);
    } catch (err: any) {
      console.error('[useAssessmentDetail] Error loading detail:', err);
      setError(err.message || 'Failed to load assessment detail');
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return {
    assessment,
    loading,
    error,
    refetch: loadDetail,
  };
}
