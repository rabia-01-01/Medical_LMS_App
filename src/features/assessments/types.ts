import type {
  Assessment,
  AssessmentInsert,
  Question,
  QuestionOption,
  AssessmentType,
  QuestionType,
  ContentStatus,
} from '../../types/database';

export type { AssessmentType, QuestionType, ContentStatus, Assessment, Question, QuestionOption };

export interface QuestionOptionItem {
  id?: string;
  questionId?: string;
  optionText: string;
  isCorrect: boolean;
  optionOrder: number;
}

export interface QuestionWithOptions extends Question {
  options: QuestionOptionItem[];
  subjectName?: string;
  chapterName?: string;
}

export interface AssessmentWithQuestions extends Assessment {
  questions: QuestionWithOptions[];
  subjectName?: string;
  chapterName?: string;
  creatorName?: string;
  questionCount?: number;
}

export interface AssessmentFilter {
  subjectId?: string;
  chapterId?: string;
  assessmentType?: AssessmentType | 'ALL';
  status?: ContentStatus | 'ALL';
  search?: string;
  createdBy?: string;
}

export interface CreateOptionPayload {
  optionText: string;
  isCorrect: boolean;
  optionOrder?: number;
}

export interface CreateQuestionInput {
  questionText: string;
  questionType?: QuestionType;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  marks?: number;
  negativeMarks?: number;
  explanation?: string | null;
  options: CreateOptionPayload[];
}

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  assessmentType: AssessmentType;
  subjectId: string;
  chapterId?: string | null;
  durationMinutes?: number;
  totalMarks?: number;
  negativeMarks?: number;
  allowRetake?: boolean;
  status?: ContentStatus;
  questions?: (CreateQuestionInput | string)[]; // can be new questions or existing question UUIDs
}

export interface AssessmentAnswerRecord {
  questionId: string;
  selectedOptionIndex?: number;
  selectedOptionId?: string;
  isMarkedForReview?: boolean;
}

export interface AssessmentResultSummary {
  assessmentId: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalScore: number;
  maxScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  breakdown: {
    questionId: string;
    questionText: string;
    selectedOptionText?: string;
    correctOptionText: string;
    isCorrect: boolean;
    marksAwarded: number;
    explanation?: string;
  }[];
}

/**
 * Normalizes legacy quiz types ('DPP', 'PYQ', 'Mock', 'Quiz', 'Test Series')
 * into the database AssessmentType enum ('DPP', 'PYQ', 'MOCK_TEST', 'TEST_SERIES').
 */
export function normalizeAssessmentType(rawType?: string): AssessmentType {
  const upper = (rawType || '').trim().toUpperCase();
  if (upper.includes('DPP') || upper.includes('DAILY') || upper.includes('PRACTICE')) return 'DPP';
  if (upper.includes('PYQ') || upper.includes('PAST') || upper.includes('YEAR')) return 'PYQ';
  if (upper.includes('SERIES')) return 'TEST_SERIES';
  return 'MOCK_TEST';
}

/**
 * Returns badge styling classes for an assessment type.
 */
export function getAssessmentBadgeColor(type: AssessmentType): { bg: string; text: string; label: string } {
  switch (type) {
    case 'DPP':
      return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'DPP Drill' };
    case 'PYQ':
      return { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Past Paper (PYQ)' };
    case 'MOCK_TEST':
      return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Full Mock Test' };
    case 'TEST_SERIES':
      return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Test Series' };
    default:
      return { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', label: 'Medical Assessment' };
  }
}
