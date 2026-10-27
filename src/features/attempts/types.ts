import type {
  Attempt,
  AttemptInsert,
  AttemptAnswer,
  AttemptAnswerInsert,
  AttemptStatus,
} from '../../types/database';

export type { Attempt, AttemptInsert, AttemptAnswer, AttemptAnswerInsert, AttemptStatus };

export interface AttemptWithDetails extends Attempt {
  assessmentTitle?: string;
  assessmentType?: string;
  subjectName?: string;
  chapterName?: string;
  totalMarks?: number;
  durationMinutes?: number;
  answers?: AttemptAnswerDetail[];
}

export interface AttemptAnswerDetail {
  id: string;
  attemptId: string;
  questionId: string;
  questionText?: string;
  selectedOptionId?: string | null;
  selectedOptionText?: string | null;
  correctOptionText?: string;
  isCorrect?: boolean | null;
  marksAwarded: number;
  answeredAt: string;
  explanation?: string | null;
}

export interface SaveAnswerPayload {
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  isCorrect?: boolean | null;
  marksAwarded: number;
}

export interface ScoreTrendPoint {
  date: string;
  title: string;
  score: number;
  maxScore: number;
  accuracy: number;
}

export interface SubjectAccuracyStat {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
  color: string;
}

export interface WeakAreaItem {
  subject: string;
  topicOrChapter: string;
  accuracy: number;
  attemptsCount: number;
  recommendedAction: string;
}

export interface StudentAnalyticsSummary {
  studentId: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  bestScore: number;
  totalQuestionsAnswered: number;
  scoreHistory: ScoreTrendPoint[];
  subjectAccuracy: SubjectAccuracyStat[];
  weakAreas: WeakAreaItem[];
  recentAttempts: AttemptWithDetails[];
}
