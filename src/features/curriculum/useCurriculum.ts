import { useState, useEffect, useCallback } from 'react';
import type {
  Exam,
  Subject,
  ChapterWithTopics,
  SubjectWithChapters,
  CreateChapterPayload,
  CreateTopicPayload,
} from './types';
import {
  getExams,
  getSubjects,
  getFullCurriculum,
  createChapter,
  createTopic,
  deleteChapter,
  deleteTopic,
  seedCurriculumIfEmpty,
} from './curriculumService';

/**
 * Hook to load medical exams.
 */
export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getExams();
      setExams(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return { exams, isLoading, error, refresh: loadExams };
}

/**
 * Hook to load and interact with the 3-tier curriculum hierarchy (Subject -> Chapter -> Topic).
 */
export function useCurriculum(initialSubjectId?: string) {
  const [curriculum, setCurriculum] = useState<SubjectWithChapters[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>(initialSubjectId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCurriculum = useCallback(async () => {
    setIsLoading(true);
    try {
      // Auto-seed if database is completely empty
      await seedCurriculumIfEmpty().catch(() => {});

      const data = await getFullCurriculum();
      setCurriculum(data);
      if (!activeSubjectId && data.length > 0) {
        setActiveSubjectId(data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setIsLoading(false);
    }
  }, [activeSubjectId]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const activeSubject = curriculum.find(
    (s) => s.id === activeSubjectId || s.code.toLowerCase() === activeSubjectId.toLowerCase()
  ) || curriculum[0] || null;

  const chapters: ChapterWithTopics[] = activeSubject ? activeSubject.chapters : [];

  const addChapter = async (payload: Omit<CreateChapterPayload, 'subjectId'>) => {
    if (!activeSubject) return null;
    const res = await createChapter({
      subjectId: activeSubject.id,
      ...payload,
    });
    if (res) {
      await loadCurriculum();
    }
    return res;
  };

  const addTopic = async (payload: CreateTopicPayload) => {
    const res = await createTopic(payload);
    if (res) {
      await loadCurriculum();
    }
    return res;
  };

  const removeChapter = async (chapterId: string) => {
    const success = await deleteChapter(chapterId);
    if (success) {
      await loadCurriculum();
    }
    return success;
  };

  const removeTopic = async (topicId: string) => {
    const success = await deleteTopic(topicId);
    if (success) {
      await loadCurriculum();
    }
    return success;
  };

  return {
    curriculum,
    subjects: curriculum.map(({ chapters, ...s }) => s),
    activeSubject,
    activeSubjectId,
    setActiveSubjectId,
    chapters,
    isLoading,
    error,
    refresh: loadCurriculum,
    addChapter,
    addTopic,
    removeChapter,
    removeTopic,
  };
}

/**
 * Convenient hook to access curriculum subjects.
 */
export function useSubjects() {
  const { subjects, isLoading, error, refresh } = useCurriculum();
  return { subjects, isLoading, error, refresh };
}

/**
 * Convenient hook to access chapters for a given subject.
 */
export function useChapters(subjectId?: string) {
  const { chapters, isLoading, error, refresh } = useCurriculum(subjectId);
  return { chapters, isLoading, error, refresh };
}

