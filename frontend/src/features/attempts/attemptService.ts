import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type {
  AttemptWithDetails,
  AttemptAnswerDetail,
  SaveAnswerPayload,
  StudentAnalyticsSummary,
  ScoreTrendPoint,
  SubjectAccuracyStat,
  WeakAreaItem,
} from './types';

const LOCAL_STORAGE_ATTEMPTS_KEY = 'lms_student_attempts_v2';

// ============================================================================
// ATTEMPTS & ANALYTICS DATA (Clean Production Startup - No Default Data)
// ============================================================================

export const SEED_ATTEMPTS: AttemptWithDetails[] = [];

// Offline Local Cache Helpers
function loadLocalAttempts(): AttemptWithDetails[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[attemptService] Failed to load local attempts:', err);
  }
  return [];
}

function saveLocalAttempts(items: AttemptWithDetails[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[attemptService] Failed to save local attempts:', err);
  }
}

// ============================================================================
// ATTEMPT LIFECYCLE SERVICE FUNCTIONS
// ============================================================================

/**
 * Starts a new assessment attempt for a student.
 * Creates an attempt row in PostgreSQL with status 'IN_PROGRESS'.
 */
export async function startAttempt(
  assessmentId: string,
  studentId: string,
  meta?: { assessmentTitle?: string; assessmentType?: string; totalMarks?: number; durationMinutes?: number; subjectName?: string }
): Promise<AttemptWithDetails> {
  const attemptId = uuidv4();
  const startedAt = new Date().toISOString();

  const newAttempt: AttemptWithDetails = {
    id: attemptId,
    assessment_id: assessmentId,
    student_id: studentId,
    started_at: startedAt,
    submitted_at: null,
    status: 'IN_PROGRESS',
    score: 0,
    accuracy: 0,
    assessmentTitle: meta?.assessmentTitle || 'Medical Assessment',
    assessmentType: meta?.assessmentType || 'MOCK_TEST',
    totalMarks: meta?.totalMarks || 20,
    durationMinutes: meta?.durationMinutes || 45,
    subjectName: meta?.subjectName || 'Medical',
    answers: [],
  };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('attempts').insert({
        id: attemptId,
        assessment_id: assessmentId,
        student_id: studentId,
        started_at: startedAt,
        status: 'IN_PROGRESS',
        score: 0,
        accuracy: 0,
      });

      if (error) {
        console.warn('[attemptService] Cloud startAttempt notice:', error.message);
      }
    } catch (err: any) {
      console.warn('[attemptService] Error starting attempt in cloud:', err.message);
    }
  }

  // Update local cache and guarantee only ONE active attempt exists at a time
  const local = loadLocalAttempts();
  const sanitized = local.map((a) => {
    if (a.student_id === studentId && a.status === 'IN_PROGRESS') {
      return { ...a, status: 'SUBMITTED' as const, submitted_at: startedAt };
    }
    return a;
  });
  saveLocalAttempts([newAttempt, ...sanitized]);

  return newAttempt;
}

/**
 * Saves or updates a student's answer in real-time during an active attempt.
 */
export async function saveAnswer(payload: SaveAnswerPayload): Promise<void> {
  const answerId = uuidv4();
  const answeredAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('attempt_answers').upsert({
        id: answerId,
        attempt_id: payload.attemptId,
        question_id: payload.questionId,
        selected_option_id: payload.selectedOptionId || null,
        is_correct: payload.isCorrect ?? null,
        marks_awarded: payload.marksAwarded || 0,
        answered_at: answeredAt,
      });
    } catch (err: any) {
      console.warn('[attemptService] Error recording answer in cloud:', err.message);
    }
  }

  // Update local cache
  const local = loadLocalAttempts();
  const attempt = local.find((a) => a.id === payload.attemptId);
  if (attempt) {
    attempt.answers = attempt.answers || [];
    const existingIdx = attempt.answers.findIndex((ans) => ans.questionId === payload.questionId);
    const detail: AttemptAnswerDetail = {
      id: answerId,
      attemptId: payload.attemptId,
      questionId: payload.questionId,
      selectedOptionId: payload.selectedOptionId,
      isCorrect: payload.isCorrect,
      marksAwarded: payload.marksAwarded,
      answeredAt,
    };

    if (existingIdx >= 0) {
      attempt.answers[existingIdx] = { ...attempt.answers[existingIdx], ...detail };
    } else {
      attempt.answers.push(detail);
    }
    saveLocalAttempts(local);
  }
}

/**
 * Finalizes and submits an assessment attempt with official scoring and accuracy.
 */
export async function submitAttempt(
  attemptId: string,
  score: number,
  accuracy: number,
  answersList?: AttemptAnswerDetail[]
): Promise<AttemptWithDetails | null> {
  const submittedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('attempts')
        .update({
          status: 'SUBMITTED',
          submitted_at: submittedAt,
          score,
          accuracy,
        })
        .eq('id', attemptId);

      if (error) {
        console.warn('[attemptService] Cloud submitAttempt notice:', error.message);
      }

      // Upsert answers
      if (answersList && answersList.length > 0) {
        for (const ans of answersList) {
          await supabase.from('attempt_answers').upsert({
            id: ans.id || uuidv4(),
            attempt_id: attemptId,
            question_id: ans.questionId,
            selected_option_id: ans.selectedOptionId || null,
            is_correct: ans.isCorrect ?? null,
            marks_awarded: ans.marksAwarded || 0,
            answered_at: ans.answeredAt || submittedAt,
          });
        }
      }
    } catch (err: any) {
      console.warn('[attemptService] Error submitting attempt to cloud:', err.message);
    }
  }

  // Update local cache
  const local = loadLocalAttempts();
  const attempt = local.find((a) => a.id === attemptId);
  if (attempt) {
    attempt.status = 'SUBMITTED';
    attempt.submitted_at = submittedAt;
    attempt.score = score;
    attempt.accuracy = accuracy;
    if (answersList) {
      attempt.answers = answersList;
    }
    saveLocalAttempts(local);
    return attempt;
  }

  return null;
}

/**
 * Fetches all examination attempts for a student.
 */
export async function fetchStudentAttempts(studentId?: string): Promise<AttemptWithDetails[]> {
  if (isSupabaseConfigured() && studentId) {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .select(`
          id,
          assessment_id,
          student_id,
          started_at,
          submitted_at,
          status,
          score,
          accuracy,
          assessments (
            title,
            assessment_type,
            total_marks,
            duration_minutes,
            subjects (name),
            chapters (name)
          ),
          attempt_answers (
            id,
            attempt_id,
            question_id,
            selected_option_id,
            is_correct,
            marks_awarded,
            answered_at
          )
        `)
        .eq('student_id', studentId)
        .order('started_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: AttemptWithDetails[] = data.map((row: any) => {
          const asmt = row.assessments;
          const answers: AttemptAnswerDetail[] = (row.attempt_answers || []).map((ans: any) => ({
            id: ans.id,
            attemptId: ans.attempt_id,
            questionId: ans.question_id,
            selectedOptionId: ans.selected_option_id,
            isCorrect: ans.is_correct,
            marksAwarded: Number(ans.marks_awarded) || 0,
            answeredAt: ans.answered_at,
          }));

          return {
            id: row.id,
            assessment_id: row.assessment_id,
            student_id: row.student_id,
            started_at: row.started_at,
            submitted_at: row.submitted_at,
            status: row.status,
            score: Number(row.score) || 0,
            accuracy: Number(row.accuracy) || 0,
            assessmentTitle: asmt?.title || 'Assessment',
            assessmentType: asmt?.assessment_type || 'MOCK_TEST',
            totalMarks: Number(asmt?.total_marks) || 20,
            durationMinutes: asmt?.duration_minutes || 45,
            subjectName: asmt?.subjects?.name || 'General',
            chapterName: asmt?.chapters?.name,
            answers,
          };
        });

        return mapped;
      }
    } catch (err: any) {
      console.warn('[attemptService] Cloud fetch attempts failed, using local cache:', err.message);
    }
  }

  // Fallback: Local offline cache
  const local = loadLocalAttempts();
  if (studentId) {
    return local.filter((a) => a.student_id === studentId || !a.student_id);
  }
  return local;
}

/**
 * Aggregates and calculates student performance analytics:
 * - Score Trend Points (Line Chart)
 * - Subject-wise Accuracy (Bar Chart)
 * - Weak Area Diagnoser (accuracy < 50%)
 */
export async function getStudentAnalytics(studentId?: string): Promise<StudentAnalyticsSummary> {
  const attempts = await fetchStudentAttempts(studentId);
  const completed = attempts.filter((a) => a.status === 'SUBMITTED');

  // Summary Metrics
  const totalAttempts = attempts.length;
  const completedAttempts = completed.length;
  const totalScoreSum = completed.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
  const totalAccuracySum = completed.reduce((sum, a) => sum + (Number(a.accuracy) || 0), 0);
  const averageScore = completedAttempts > 0 ? Math.round((totalScoreSum / completedAttempts) * 10) / 10 : 0;
  const averageAccuracy = completedAttempts > 0 ? Math.round((totalAccuracySum / completedAttempts) * 10) / 10 : 0;
  const bestScore = completed.reduce((max, a) => Math.max(max, Number(a.score) || 0), 0);

  // Score History over time (for LineChart)
  const scoreHistory: ScoreTrendPoint[] = [...completed]
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .map((a, i) => {
      const d = new Date(a.started_at);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      return {
        date: label,
        title: a.assessmentTitle || `Test ${i + 1}`,
        score: Number(a.score) || 0,
        maxScore: a.totalMarks || 20,
        accuracy: Number(a.accuracy) || 0,
      };
    });

  // Subject-wise accuracy breakdown calculated strictly from completed attempts
  const subjectColors: Record<string, string> = {
    Biology: '#0d9488',
    Physics: '#0f2b46',
    Chemistry: '#14b8a6',
    Mathematics: '#3b82f6',
  };
  const subjectMap: Record<string, { correct: number; total: number; color: string }> = {};

  completed.forEach((a) => {
    const subj = a.subjectName || 'General';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { correct: 0, total: 0, color: subjectColors[subj] || '#0d9488' };
    }
    const answers = a.answers || [];
    if (answers.length > 0) {
      subjectMap[subj].correct += answers.filter((ans) => ans.isCorrect).length;
      subjectMap[subj].total += answers.length;
    } else {
      const acc = Number(a.accuracy) || 0;
      const estTotal = 5;
      const estCorrect = Math.round((acc / 100) * estTotal);
      subjectMap[subj].correct += estCorrect;
      subjectMap[subj].total += estTotal;
    }
  });

  const subjectAccuracy: SubjectAccuracyStat[] = Object.keys(subjectMap).map((subKey) => {
    const data = subjectMap[subKey];
    const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    return {
      subject: subKey,
      correct: data.correct,
      total: data.total,
      accuracy: acc,
      color: data.color,
    };
  });

  // Weak Area Diagnoser: Identify areas with accuracy < 50% from real attempts
  const weakAreas: WeakAreaItem[] = subjectAccuracy
    .filter((s) => s.accuracy < 50)
    .map((s) => ({
      subject: s.subject,
      topicOrChapter: s.subject,
      accuracy: s.accuracy,
      attemptsCount: completed.filter((a) => (a.subjectName || 'General') === s.subject).length,
      recommendedAction: `Review ${s.subject} study material and re-attempt practice drills.`,
    }));

  return {
    studentId: studentId || 'current-student',
    totalAttempts,
    completedAttempts,
    averageScore,
    averageAccuracy,
    bestScore,
    totalQuestionsAnswered: completed.reduce((sum, a) => sum + (a.answers?.length || 0), 0),
    scoreHistory,
    subjectAccuracy,
    weakAreas,
    recentAttempts: completed.slice(0, 5),
  };
}
