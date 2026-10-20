// ============================================================================
// SUPABASE DATABASE TYPE DEFINITIONS
// Generated to match src/db/db.sql
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database ENUMs
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ResourceType = 'NOTE' | 'BOOK' | 'DPP' | 'PYQ' | 'VIDEO';
export type AssessmentType = 'DPP' | 'PYQ' | 'MOCK_TEST' | 'TEST_SERIES';
export type QuestionType = 'MCQ' | 'MULTIPLE_SELECT' | 'NUMERICAL' | 'ASSERTION_REASON';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED' | 'TIMED_OUT';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          academic_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          academic_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          academic_year?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      batches: {
        Row: {
          id: string;
          name: string;
          class_id: string;
          exam_id: string;
          start_date: string | null;
          end_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          class_id: string;
          exam_id: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          class_id?: string;
          exam_id?: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          class_id: string | null;
          batch_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          class_id?: string | null;
          batch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          class_id?: string | null;
          batch_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      faculty: {
        Row: {
          id: string;
          profile_id: string;
          department_id: string | null;
          designation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          department_id?: string | null;
          designation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          department_id?: string | null;
          designation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          chapter_id: string;
          name: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          name: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_exams: {
        Row: {
          student_id: string;
          exam_id: string;
        };
        Insert: {
          student_id: string;
          exam_id: string;
        };
        Update: {
          student_id?: string;
          exam_id?: string;
        };
      };
      student_subjects: {
        Row: {
          student_id: string;
          subject_id: string;
        };
        Insert: {
          student_id: string;
          subject_id: string;
        };
        Update: {
          student_id?: string;
          subject_id?: string;
        };
      };
      faculty_subjects: {
        Row: {
          faculty_id: string;
          subject_id: string;
        };
        Insert: {
          faculty_id: string;
          subject_id: string;
        };
        Update: {
          faculty_id?: string;
          subject_id?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          resource_type: ResourceType;
          subject_id: string;
          chapter_id: string | null;
          topic_id: string | null;
          created_by: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          resource_type: ResourceType;
          subject_id: string;
          chapter_id?: string | null;
          topic_id?: string | null;
          created_by: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          resource_type?: ResourceType;
          subject_id?: string;
          chapter_id?: string | null;
          topic_id?: string | null;
          created_by?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      resource_files: {
        Row: {
          id: string;
          resource_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          file_size?: number;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          subject_id: string | null;
          chapter_id: string | null;
          topic_id: string | null;
          question_text: string;
          question_type: QuestionType;
          marks: number;
          negative_marks: number;
          explanation: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id?: string | null;
          chapter_id?: string | null;
          topic_id?: string | null;
          question_text: string;
          question_type?: QuestionType;
          marks?: number;
          negative_marks?: number;
          explanation?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string | null;
          chapter_id?: string | null;
          topic_id?: string | null;
          question_text?: string;
          question_type?: QuestionType;
          marks?: number;
          negative_marks?: number;
          explanation?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          option_order: number;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          option_order?: number;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
          option_order?: number;
        };
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assessment_type: AssessmentType;
          subject_id: string;
          chapter_id: string | null;
          duration_minutes: number;
          total_marks: number;
          negative_marks: number;
          allow_retake: boolean;
          created_by: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          assessment_type: AssessmentType;
          subject_id: string;
          chapter_id?: string | null;
          duration_minutes?: number;
          total_marks?: number;
          negative_marks?: number;
          allow_retake?: boolean;
          created_by: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          assessment_type?: AssessmentType;
          subject_id?: string;
          chapter_id?: string | null;
          duration_minutes?: number;
          total_marks?: number;
          negative_marks?: number;
          allow_retake?: boolean;
          created_by?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_questions: {
        Row: {
          assessment_id: string;
          question_id: string;
          question_order: number;
        };
        Insert: {
          assessment_id: string;
          question_id: string;
          question_order?: number;
        };
        Update: {
          assessment_id?: string;
          question_id?: string;
          question_order?: number;
        };
      };
      attempts: {
        Row: {
          id: string;
          assessment_id: string;
          student_id: string;
          started_at: string;
          submitted_at: string | null;
          status: AttemptStatus;
          score: number | null;
          accuracy: number | null;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          student_id: string;
          started_at?: string;
          submitted_at?: string | null;
          status?: AttemptStatus;
          score?: number | null;
          accuracy?: number | null;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          student_id?: string;
          started_at?: string;
          submitted_at?: string | null;
          status?: AttemptStatus;
          score?: number | null;
          accuracy?: number | null;
        };
      };
      attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string | null;
          is_correct: boolean | null;
          marks_awarded: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option_id?: string | null;
          is_correct?: boolean | null;
          marks_awarded?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option_id?: string | null;
          is_correct?: boolean | null;
          marks_awarded?: number;
          answered_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      resource_type: ResourceType;
      assessment_type: AssessmentType;
      question_type: QuestionType;
      attempt_status: AttemptStatus;
    };
  };
}

// Convenient Model Type Aliases for Frontend Usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Department = Database['public']['Tables']['departments']['Row'];
export type Exam = Database['public']['Tables']['exams']['Row'];
export type ClassGrade = Database['public']['Tables']['classes']['Row'];
export type Batch = Database['public']['Tables']['batches']['Row'];

export type Student = Database['public']['Tables']['students']['Row'];
export type Faculty = Database['public']['Tables']['faculty']['Row'];

export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Chapter = Database['public']['Tables']['chapters']['Row'];
export type Topic = Database['public']['Tables']['topics']['Row'];

export type LearningResource = Database['public']['Tables']['resources']['Row'];
export type LearningResourceInsert = Database['public']['Tables']['resources']['Insert'];
export type ResourceFile = Database['public']['Tables']['resource_files']['Row'];

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionOption = Database['public']['Tables']['question_options']['Row'];
export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];

export type Attempt = Database['public']['Tables']['attempts']['Row'];
export type AttemptInsert = Database['public']['Tables']['attempts']['Insert'];
export type AttemptAnswer = Database['public']['Tables']['attempt_answers']['Row'];
export type AttemptAnswerInsert = Database['public']['Tables']['attempt_answers']['Insert'];

export type AuditLogEntry = Database['public']['Tables']['audit_logs']['Row'];
