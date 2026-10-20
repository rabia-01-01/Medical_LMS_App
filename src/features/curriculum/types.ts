import type {
  Exam as DbExam,
  Subject as DbSubject,
  Chapter as DbChapter,
  Topic as DbTopic,
  ClassGrade as DbClassGrade,
  Batch as DbBatch,
  Department as DbDepartment,
} from '../../types/database';

export type Exam = DbExam;
export type Subject = DbSubject;
export type Chapter = DbChapter;
export type Topic = DbTopic;
export type ClassGrade = DbClassGrade;
export type Batch = DbBatch;
export type Department = DbDepartment;

export interface TopicWithDetails extends Topic {
  resourceCount?: number;
  questionCount?: number;
}

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export interface SubjectWithChapters extends Subject {
  chapters: ChapterWithTopics[];
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  description?: string;
}

export interface CreateChapterPayload {
  subjectId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateTopicPayload {
  chapterId: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateExamPayload {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateBatchPayload {
  name: string;
  classId: string;
  examId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}
