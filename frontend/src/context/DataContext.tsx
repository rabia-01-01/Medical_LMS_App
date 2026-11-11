import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { format } from 'date-fns';
import { DEFAULT_CURRICULUM } from '../features/curriculum/curriculumService';
import {
  type AccountStatus,
  type UserAccessPermissions,
  type AccessModuleKey,
  type PermissionCapability,
  FULL_USER_PERMISSIONS,
  EMPTY_USER_PERMISSIONS,
  RESOURCE_ACCESS_MODULES,
  SCREEN_MODULE_MAP,
  normalizePermissions,
  hasResourceAccess,
  hasCapability,
  canAccessScreen,
  evaluateScreenAccess,
  buildRbacSnapshot,
  isUserApproved,
} from '../features/auth';
import {
  fetchBackendUsers,
  createBackendUserAsAdmin,
  updateBackendUserAccess,
  allowAllBackendUsers,
  deleteBackendUser,
} from '../services/userAccessApi';
import {
  ConsultancyChecklistItem,
  ConsultancyChecklistSubItem,
  StudentConsultancyDossier,
  ChecklistItemStatus,
  DossierOverallStatus,
  createDefaultChecklist,
  createNewApplicantChecklist,
} from '../features/consultancy/types';

export {
  type AccountStatus,
  type UserAccessPermissions,
  type AccessModuleKey,
  type PermissionCapability,
  FULL_USER_PERMISSIONS,
  EMPTY_USER_PERMISSIONS,
  RESOURCE_ACCESS_MODULES,
  SCREEN_MODULE_MAP,
  normalizePermissions,
  hasResourceAccess,
  hasCapability,
  canAccessScreen,
  evaluateScreenAccess,
  buildRbacSnapshot,
  isUserApproved,
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'faculty' | 'student' | 'consultant';
  avatar: string;
  department?: string;
  batch?: string; // 'Batch 1 (Dec)' | 'Batch 2 (May/June)'
  status: AccountStatus;
  accessPermissions?: UserAccessPermissions;
  selfRegisteredAdmin?: boolean;
  createdAt: string;
  targetExam?: string;
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  description: string;
  subjects: string[];
  batches?: string[]; // 'Batch 1 (Dec)', 'Batch 2 (May/June)'
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  subjects: string[];
  facultyIds: string[];
  studentIds: string[];
  batch?: string; // 'Batch 1 (Dec)' | 'Batch 2 (May/June)' | 'All'
  duration: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  subject: string;
  courseId: string;
  uploaderId: string;
  uploaderName: string;
  date: string;
  size: string;
  status: 'published' | 'draft';
  examCategory: string;
  fileName: string;
  fileData?: string; // Base64 encoded file data
  mimeType?: string;
  storagePath?: string; // Supabase Storage bucket path
  signedUrl?: string; // Pre-signed temporary URL for viewing/download
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  batch?: string; // 'Batch 1 (Dec)' | 'Batch 2 (May/June)' | 'All'
  readingContent?: string; // Specific content for Document Reading Section
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  time?: string;
  timestamp?: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. 10:30 AM
  timestamp?: string;
  type: 'announcement' | 'exam' | 'lecture' | 'deadline';
  authorName?: string;
  authorRole?: string;
}

export interface CommunityReply {
  id: string;
  parentId: string;
  parentReplyId?: string;
  replyToAuthor?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  message: string;
  time: string;
  timestamp?: string;
  likes: number;
}

export interface CommunityMessage {
  id: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  message: string;
  time: string;
  timestamp?: string;
  likes: number;
  replies: number;
  repliesList?: CommunityReply[];
  pinned: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  courseId: string;
  questions: QuizQuestion[];
  duration: number;
  marks: number;
  negativeMarking: number;
  status: 'active' | 'upcoming' | 'completed';
  createdById: string;
  createdByName: string;
  startDate: string;
  endDate: string;
  batch?: string; // 'Batch 1 (Dec)' | 'Batch 2 (May/June)' | 'All'
  readingContent?: string; // Specific content for Document Reading Section
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  targetRole: string;
  targetCourseId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  category: 'Identity' | 'Academic' | 'Attestation' | 'Scholarship' | 'Enrolment' | 'Registration' | 'Examination' | 'Medical' | 'Financial';
  status: 'Pending' | 'Verified' | 'Not Verified' | 'In Review/In Progress' | 'Rejected';
  stageNumber?: number;
  stageKey?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  submissionSource?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string; // 'Admin' | 'Agent' | 'Dr. Marco Rossi (Consultant Agent)'
  remarks?: string;
  subItems?: { id: string; title: string; status: 'pending' | 'verified' | 'rejected'; notes?: string }[];
}

export interface CompletedTopicDetail {
  id: string;
  name: string;
  chapterId?: string;
  chapterName?: string;
  subjectId?: string;
  subjectName?: string;
}

export interface StudentCurriculumProgress {
  studentId: string;
  studentName: string;
  studentBatch: string;
  avatar?: string;
  completedChapters: string[]; // chapter IDs
  completedTopics: string[];   // topic IDs
  completedTopicDetails?: CompletedTopicDetail[];
  lastUpdated: string;
}

export interface CohortBatch {
  id: string;
  name: string;
  session: string;
  season?: string;
  badge?: string;
  color?: string;
  tag?: string;
  targetCourse?: string; // Target user / Target course (e.g. NEET-UG Aspirants, IMAT Aspirants)
  description?: string;
  maxStudents?: number;
  createdAt?: string;
}

// Cohort batches start empty on deployment; Admin creates batches dynamically (supports cohorts like 'Batch 1 (Dec)', 'Batch 2 (May/June)', etc.)
export const DEFAULT_COHORT_BATCHES: CohortBatch[] = [];

interface DataContextType {
  // Users (Admin Only Management)
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'> & { id?: string }, actorRole?: string, actorEmail?: string) => void;
  updateUser: (id: string, data: Partial<User>, actorRole?: string, actorEmail?: string) => void;
  deleteUser: (id: string, actorRole?: string, actorEmail?: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];
  allowAllUsersAccess: (actorRole?: string, actorEmail?: string, onlyPending?: boolean) => number;
  refreshUsersFromBackend: () => Promise<User[]>;
  canRegisterAdmin: boolean;

  // Departments & Batches
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>, actorRole?: string) => void;
  deleteDepartment: (id: string, actorRole?: string) => void;
  updateDepartment: (id: string, data: Partial<Department>, actorRole?: string) => void;
  cohortBatches: CohortBatch[];
  addCohortBatch: (batch: { name: string; session: string; season?: string; targetCourse?: string; description?: string; maxStudents?: number }) => void;
  deleteCohortBatch: (batchId: string, actorRole?: string) => void;

  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>, actorRole?: string) => void;
  deleteCourse: (id: string, actorRole?: string) => void;
  updateCourse: (id: string, data: Partial<Course>, actorRole?: string) => void;
  enrollStudents: (courseId: string, studentIds: string[], enrolledBy?: { id: string; name: string; role?: string }) => void;
  unenrollStudent: (courseId: string, studentId: string, removedBy?: { id: string; name: string; role?: string }) => void;

  // Resources (Admin Only Management)
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'date'> & { id?: string }, actorRole?: string) => void;
  deleteResource: (id: string, actorRole?: string) => void;
  updateResource: (id: string, data: Partial<Resource>, actorRole?: string) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;

  // Academic Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Community (Nested Replies & Threads; Admin Only Deletion)
  communityMessages: CommunityMessage[];
  addCommunityMessage: (msg: Omit<CommunityMessage, 'id' | 'time' | 'likes' | 'replies'>) => void;
  addCommunityReply: (
    parentId: string,
    reply: {
      authorId: string;
      authorName: string;
      authorRole: string;
      message: string;
      authorAvatar?: string;
      parentReplyId?: string;
      replyToAuthor?: string;
    }
  ) => void;
  deleteCommunityMessage: (id: string, actorRole?: string) => void;
  togglePinMessage: (id: string) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  deleteQuiz: (id: string) => void;
  updateQuiz: (id: string, data: Partial<Quiz>) => void;

  // Notifications (Admin Only Creation & Dispatch)
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'time' | 'read'>, actorRole?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;

  // Student Documentation (Agent + Admin Only Editing; Student View Only)
  studentDocuments: StudentDocument[];
  addStudentDocument: (doc: Omit<StudentDocument, 'id' | 'submittedAt'>, editorRole: 'admin' | 'agent') => boolean;
  updateStudentDocument: (id: string, updates: Partial<StudentDocument>, editorRole: 'admin' | 'agent') => boolean;
  deleteStudentDocument: (id: string, editorRole: 'admin' | 'agent') => boolean;

  // Student Curriculum Study Progress (Mark As Completed & Reflection)
  studentProgressList: StudentCurriculumProgress[];
  toggleChapterCompletion: (chapterId: string, studentId?: string, studentName?: string, studentBatch?: string, chapterName?: string) => boolean;
  toggleTopicCompletion: (
    topicId: string,
    studentId?: string,
    studentName?: string,
    studentBatch?: string,
    topicMeta?: { topicName?: string; chapterId?: string; chapterName?: string; subjectId?: string; subjectName?: string }
  ) => boolean;
  isChapterCompleted: (chapterId: string, studentId?: string) => boolean;
  isTopicCompleted: (topicId: string, studentId?: string) => boolean;
  getStudentProgress: (studentId?: string) => StudentCurriculumProgress | undefined;
  getChapterCompletions: (chapterId: string) => { studentId: string; studentName: string; studentBatch: string; avatar?: string }[];
  getTopicCompletions: (topicId: string) => { studentId: string; studentName: string; studentBatch: string; avatar?: string }[];

  // Consultancy Dossier & Checklist (Consultant Agent Role)
  consultancyDossiers: StudentConsultancyDossier[];
  updateChecklistItemStatus: (
    studentId: string,
    itemId: string,
    status: ChecklistItemStatus,
    consultantNotes?: string,
    subItemUpdates?: { id: string; status: 'pending' | 'verified' | 'rejected'; notes?: string }[]
  ) => void;
  addConsultancyDossier: (dossier: StudentConsultancyDossier) => void;
  updateConsultancyDossier: (studentId: string, updates: Partial<StudentConsultancyDossier>) => void;
  deleteConsultancyDossier: (studentId: string) => void;
  getStudentDossier: (studentId?: string) => StudentConsultancyDossier | undefined;
  isConsultancyOptedIn: (studentId?: string) => boolean;
  setConsultancyOptIn: (studentId: string, optIn: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

const CLEAN_SLATE_FLAG = 'sim_clean_slate_v1';

function ensureCleanSlateStorage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(CLEAN_SLATE_FLAG)) {
      const seededKeys = [
        'sim_departments',
        'sim_courses',
        'sim_resources',
        'sim_announcements',
        'sim_calendar_events',
        'sim_community',
        'sim_quizzes',
        'sim_notifications',
        'sim_audit',
        'sim_student_documents',
        'sim_cohort_batches',
        'sim_admin_batches',
        'sim_student_progress',
        'sim_consultancy_dossiers',
        'sim_consultancy_opt_in',
        'lms_resources_cache_v2',
        'lms_assessments_cache_v2',
        'lms_questions_cache_v2',
        'lms_student_attempts_v2',
      ];
      seededKeys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(CLEAN_SLATE_FLAG, 'true');
    }
  } catch (e) {
    console.warn('Clean slate initialization skipped:', e);
  }
}

ensureCleanSlateStorage();

// Canonical 8-stage document ID template keys (populated dynamically when a student opts in or is enrolled)
export const CONSULTANCY_DOC_STAGE_KEYS = [
  'sdoc-passport',
  'sdoc-12th-moi',
  'sdoc-hrd',
  'sdoc-apostille',
  'sdoc-scholarship',
  'sdoc-pre-enrolment',
  'sdoc-registration',
  'sdoc-examination',
] as const;

export const DEFAULT_STUDENT_DOCS: StudentDocument[] = [];

export const DEFAULT_STUDENT_PROGRESS: StudentCurriculumProgress[] = [];

export const DEFAULT_CONSULTANCY_DOSSIERS: StudentConsultancyDossier[] = [];

// Helper to verify if topic actually exists in the active 3-tier curriculum
export function isTopicInCurrentCurriculum(id: string, name?: string): boolean {
  if (!id && !name) return false;
  const tName = (name || '').trim().toLowerCase();
  const tId = (id || '').trim().toLowerCase();
  if (tName.includes('body fluids') || tName.includes('molecular basis of inheritance')) return false;
  if (tId.includes('body-fluids') || tId === 'top-bio-204') return false;

  for (const s of DEFAULT_CURRICULUM) {
    for (const c of s.chapters || []) {
      const match = (c.topics || []).some(
        (t) => t.id === id || (tName && t.name.toLowerCase() === tName)
      );
      if (match) return true;
    }
  }
  return false;
}

// Helper to resolve clean human-readable topic title and reject deprecated / removed topics
function resolveTopicHumanName(id: string, candidate?: string): string {
  const trimmed = (candidate || '').trim();
  if (trimmed.toLowerCase().includes('body fluids') || trimmed.toLowerCase().includes('molecular basis of inheritance')) {
    return '';
  }
  if (id === 'top-bio-204' || id.toLowerCase().includes('body-fluids')) {
    return '';
  }
  for (const s of DEFAULT_CURRICULUM) {
    for (const c of s.chapters || []) {
      const t = (c.topics || []).find((top: any) => top.id === id || (trimmed && top.name.toLowerCase() === trimmed.toLowerCase()));
      if (t) return t.name;
    }
  }
  return '';
}

// Canonical chapter resolver to eliminate duplicate IDs and duplicate names
export function getCanonicalChapterId(idOrName: string): string {
  if (!idOrName) return '';
  const trimmed = idOrName.trim();
  for (const s of DEFAULT_CURRICULUM) {
    for (const c of s.chapters || []) {
      if (c.id === trimmed || c.name.toLowerCase() === trimmed.toLowerCase()) {
        return c.id;
      }
    }
  }
  return trimmed;
}

// Deduplicate completed chapters so 1 physical chapter is counted as exactly 1
export function deduplicateCompletedChapters(chapters: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  (chapters || []).forEach(ch => {
    if (!ch || ch.toLowerCase().includes('body fluids')) return;
    const canonical = getCanonicalChapterId(ch);
    if (!seen.has(canonical.toLowerCase())) {
      seen.add(canonical.toLowerCase());
      result.push(canonical);
    }
  });
  return result;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = loadFromStorage<User[]>('sim_users', []);
    if (!stored || stored.length === 0) {
      return [
        {
          id: 'u-admin-1',
          name: 'Alice Kernel',
          email: 'admin@medical.lms',
          phone: '+1 555-0100',
          password: 'password',
          role: 'admin',
          avatar: '👩‍💼',
          department: 'Academic Directorate',
          batch: 'All',
          status: 'active',
          accessPermissions: { ...FULL_USER_PERMISSIONS },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u-faculty-1',
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.jenkins@medical.lms',
          phone: '+1 555-0101',
          password: 'password',
          role: 'faculty',
          avatar: '👩‍⚕️',
          department: 'Pre-Clinical Sciences',
          batch: 'All',
          status: 'active',
          accessPermissions: { ...FULL_USER_PERMISSIONS },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'u-student-1',
          name: 'Mary',
          email: 'mary@medical.lms',
          phone: '+1 555-0102',
          password: 'password',
          role: 'student',
          avatar: '👩‍🎓',
          department: 'Pre-Clinical Sciences',
          batch: '',
          status: 'active',
          accessPermissions: { ...FULL_USER_PERMISSIONS },
          createdAt: new Date().toISOString(),
          targetExam: 'NEET-UG',
        },
        {
          id: 'u-consultant-1',
          name: 'Dr. Marco Rossi',
          email: 'consultant@italia.medica',
          phone: '+39 06 6987 1234',
          password: 'password',
          role: 'consultant',
          avatar: '💼',
          department: 'Overseas Admissions & Consular Directorate',
          batch: 'All',
          status: 'active',
          accessPermissions: { ...FULL_USER_PERMISSIONS },
          createdAt: new Date().toISOString(),
          targetExam: 'IMAT & Study in Italy Admissions',
        },
      ];
    }
    const filtered = (stored || []).filter(u => u.name !== 'Alex Rivera' && u.id !== 'u-student-2' && u.email !== 'alex@medical.lms');
    if (!filtered.some(u => u.role === 'consultant' || u.id === 'u-consultant-1')) {
      filtered.push({
        id: 'u-consultant-1',
        name: 'Dr. Marco Rossi',
        email: 'consultant@italia.medica',
        phone: '+39 06 6987 1234',
        password: 'password',
        role: 'consultant',
        avatar: '💼',
        department: 'Overseas Admissions & Consular Directorate',
        batch: 'All',
        status: 'active',
        accessPermissions: { ...FULL_USER_PERMISSIONS },
        createdAt: new Date().toISOString(),
        targetExam: 'IMAT & Study in Italy Admissions',
      });
    }
    try {
      localStorage.setItem('sim_users', JSON.stringify(filtered));
    } catch {}
    return filtered.map((u) => {
      const normalizedStatus: AccountStatus =
        u.role === 'admin'
          ? 'active'
          : u.status === 'pending' || u.status === 'suspended' || u.status === 'active'
            ? u.status
            : 'active';
      return {
        ...u,
        batch: u.batch || (u.role === 'student' ? '' : 'All'),
        status: normalizedStatus,
        accessPermissions:
          u.role === 'admin'
            ? { ...FULL_USER_PERMISSIONS }
            : normalizePermissions(u.accessPermissions, normalizedStatus === 'active'),
      };
    });
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    return loadFromStorage<Department[]>('sim_departments', []);
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = loadFromStorage<Course[]>('sim_courses', []);
    return (stored || []).map((c) => ({
      ...c,
      studentIds: (c.studentIds || []).filter(id => id !== 'u-student-2'),
      batch: c.batch || 'All',
    }));
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const stored = loadFromStorage<Resource[]>('sim_resources', []);
    const deduplicated: Resource[] = [];
    for (const r of stored) {
      const rTitle = (r.title || '').trim().toLowerCase();
      const rFile = (r.fileName || r.storagePath || '').replace(/^.*[\\\/]/, '').replace(/^\d+_/, '').trim().toLowerCase();
      const match = deduplicated.find(d => {
        if (d.id === r.id) return true;
        if (d.storagePath && r.storagePath && d.storagePath === r.storagePath) return true;
        const dTitle = (d.title || '').trim().toLowerCase();
        const dFile = (d.fileName || d.storagePath || '').replace(/^.*[\\\/]/, '').replace(/^\d+_/, '').trim().toLowerCase();
        return dTitle === rTitle && (dFile === rFile || d.fileName === r.fileName);
      });
      if (match) {
        if ((!match.subject || match.subject === 'General') && r.subject && r.subject !== 'General') {
          match.subject = r.subject;
        }
        if (!match.readingContent && r.readingContent) {
          match.readingContent = r.readingContent;
        }
      } else {
        deduplicated.push({
          ...r,
          batch: r.batch || 'All',
        });
      }
    }
    try {
      localStorage.setItem('sim_resources', JSON.stringify(deduplicated));
    } catch {}
    return deduplicated;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('sim_announcements', []));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    return loadFromStorage<CalendarEvent[]>('sim_calendar_events', []);
  });

  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(() => {
    const stored = loadFromStorage<CommunityMessage[]>('sim_community', []);
    return (stored || []).map((msg, idx) => {
      const msgDate = msg.timestamp ? new Date(msg.timestamp) : new Date(Date.now() - (idx + 1) * 3600000);
      return {
        ...msg,
        time: msg.time && msg.time !== 'Just now' ? msg.time : format(msgDate, 'dd MMM yyyy, hh:mm a'),
        timestamp: msg.timestamp || msgDate.toISOString(),
        repliesList: msg.repliesList || [],
      };
    });
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const stored = loadFromStorage<Quiz[]>('sim_quizzes', []);
    return (stored || []).map((q) => ({
      ...q,
      batch: q.batch || 'All',
    }));
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('sim_notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('sim_audit', []));
  const [studentDocuments, setStudentDocuments] = useState<StudentDocument[]>(() => {
    const stored = loadFromStorage<StudentDocument[]>('sim_student_documents', []);
    const filtered = (stored || []).filter(d => d.studentId !== 'u-student-2' && d.studentName !== 'Alex Rivera');

    // Deduplicate by stage number (1 through 8) per student
    const stageMap = new Map<string, StudentDocument>();
    filtered.forEach(d => {
      const studentKey = d.studentId || 'u-student-1';
      const stageKey = d.stageNumber ? `stage-${d.stageNumber}` : (d.stageKey || d.title);
      const compositeKey = `${studentKey}-${stageKey}`;
      if (!stageMap.has(compositeKey)) {
        stageMap.set(compositeKey, d);
      }
    });

    const deduplicated = Array.from(stageMap.values());
    saveToStorage('sim_student_documents', deduplicated);
    return deduplicated;
  });

  const [cohortBatches, setCohortBatches] = useState<CohortBatch[]>(() => {
    try {
      const stored = localStorage.getItem('sim_cohort_batches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      const legacyAdmin = localStorage.getItem('sim_admin_batches');
      if (legacyAdmin) {
        const parsed = JSON.parse(legacyAdmin);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cb: any) => ({
            id: cb.id || Date.now().toString(36),
            name: cb.name,
            session: cb.session || 'Academic Cohort Session',
            season: cb.season || 'Academic Cohort',
            badge: cb.badge || 'Active Cohort',
            color: cb.color || 'blue',
            tag: cb.name,
            targetCourse: cb.targetCourse || 'NEET & IMAT Aspirants',
            maxStudents: cb.maxStudents || 25,
            description: cb.description || `Academic entrance cohort for ${cb.name} covering all core subjects.`,
          }));
        }
      }
    } catch (e) {
      console.error('Error loading cohort batches:', e);
    }
    return [];
  });

  const addCohortBatch = (batch: { name: string; session: string; season?: string; targetCourse?: string; description?: string; maxStudents?: number }) => {
    const newBatch: CohortBatch = {
      id: Date.now().toString(36),
      name: batch.name.trim(),
      session: batch.session.trim() || 'Academic Cohort Session',
      season: batch.season || 'Academic Cohort',
      badge: 'Active Cohort',
      color: 'blue',
      tag: batch.name.trim(),
      targetCourse: batch.targetCourse?.trim() || 'NEET & IMAT Aspirants',
      maxStudents: batch.maxStudents && batch.maxStudents > 0 ? batch.maxStudents : 25,
      description: batch.description || `Academic entrance cohort for ${batch.name.trim()} covering all core subjects.`,
    };
    setCohortBatches(prev => {
      const updated = [...prev, newBatch];
      try {
        localStorage.setItem('sim_cohort_batches', JSON.stringify(updated));
        const customOnly = updated.filter(b => b.id !== 'batch-1' && b.id !== 'batch-2');
        localStorage.setItem('sim_admin_batches', JSON.stringify(customOnly));
      } catch {}
      return updated;
    });
  };

  const deleteCohortBatch = (batchId: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can delete batches.');
      return;
    }
    setCohortBatches(prev => {
      const toDelete = prev.find(b => b.id === batchId || b.name === batchId);
      const updated = prev.filter(b => b.id !== batchId && b.name !== batchId);
      try {
        localStorage.setItem('sim_cohort_batches', JSON.stringify(updated));
        const customOnly = updated.filter(b => b.id !== 'batch-1' && b.id !== 'batch-2');
        localStorage.setItem('sim_admin_batches', JSON.stringify(customOnly));
      } catch {}
      if (toDelete) {
        addAuditLog({
          action: 'Batch Deleted',
          userId: 'admin',
          userName: 'Administrator',
          details: `Admin deleted cohort batch: ${toDelete.name}`
        });
      }
      return updated;
    });
  };

  const [studentProgressList, setStudentProgressList] = useState<StudentCurriculumProgress[]>(() => {
    const raw = loadFromStorage<StudentCurriculumProgress[]>('sim_student_progress', []);
    const cleaned = (raw || [])
      .filter((p: StudentCurriculumProgress) => p.studentId !== 'u-student-2' && p.studentName !== 'Alex Rivera')
      .map((p: StudentCurriculumProgress) => {
      const details = p.completedTopicDetails || [];
      const validDetails: CompletedTopicDetail[] = [];
      const validTopics: string[] = [];

      details.forEach((d) => {
        if (!d.id) return;
        // Purge defaulted "Body Fluids", "Molecular Basis of Inheritance", and legacy mock IDs
        if (!isTopicInCurrentCurriculum(d.id, d.name)) return;
        const resolved = resolveTopicHumanName(d.id, d.name);
        if (!resolved) return;
        if (!validTopics.includes(d.id)) {
          validTopics.push(d.id);
          validDetails.push({
            ...d,
            name: resolved,
          });
        }
      });

      // Filter raw completedTopics strings as well
      const validTopicStrings = (p.completedTopics || []).filter(tId => isTopicInCurrentCurriculum(tId));
      validTopicStrings.forEach(tId => {
        if (!validTopics.includes(tId)) {
          const resolved = resolveTopicHumanName(tId);
          if (resolved) {
            validTopics.push(tId);
            validDetails.push({
              id: tId,
              name: resolved,
            });
          }
        }
      });

      // Deduplicate completedChapters
      const validChapters = deduplicateCompletedChapters(p.completedChapters || []);

      return {
        ...p,
        completedChapters: validChapters,
        completedTopics: validTopics,
        completedTopicDetails: validDetails,
      };
    });

    try {
      localStorage.setItem('sim_student_progress', JSON.stringify(cleaned));
    } catch {}
    return cleaned;
  });

  const [consultancyDossiers, setConsultancyDossiers] = useState<StudentConsultancyDossier[]>(() => {
    return loadFromStorage<StudentConsultancyDossier[]>('sim_consultancy_dossiers', []);
  });

  const [consultancyOptInMap, setConsultancyOptInMap] = useState<Record<string, boolean>>(() => {
    return loadFromStorage<Record<string, boolean>>('sim_consultancy_opt_in', {});
  });

  // Persist to localStorage
  useEffect(() => {
    saveToStorage('sim_users', users);
    try {
      window.dispatchEvent(new Event('lms-users-updated'));
    } catch {}
  }, [users]);
  useEffect(() => { saveToStorage('sim_departments', departments); }, [departments]);
  useEffect(() => { saveToStorage('sim_courses', courses); }, [courses]);
  useEffect(() => { saveToStorage('sim_resources', resources); }, [resources]);
  useEffect(() => { saveToStorage('sim_announcements', announcements); }, [announcements]);
  useEffect(() => { saveToStorage('sim_calendar_events', calendarEvents); }, [calendarEvents]);
  useEffect(() => { saveToStorage('sim_community', communityMessages); }, [communityMessages]);
  useEffect(() => { saveToStorage('sim_quizzes', quizzes); }, [quizzes]);
  useEffect(() => { saveToStorage('sim_notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('sim_audit', auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage('sim_student_documents', studentDocuments); }, [studentDocuments]);
  useEffect(() => { saveToStorage('sim_student_progress', studentProgressList); }, [studentProgressList]);
  useEffect(() => { saveToStorage('sim_consultancy_dossiers', consultancyDossiers); }, [consultancyDossiers]);
  useEffect(() => { saveToStorage('sim_consultancy_opt_in', consultancyOptInMap); }, [consultancyOptInMap]);

  const mergeWithBackendUsers = useCallback((remoteUsers: any[], currentLocal: User[]): User[] => {
    const byEmail = new Map<string, User>();
    currentLocal.forEach((u) => {
      byEmail.set(u.email.toLowerCase(), u);
    });
    const merged: User[] = remoteUsers.map((r) => {
      const localMatch = byEmail.get(r.email.toLowerCase()) || currentLocal.find((u) => u.id === r.id);
      const status: AccountStatus = r.role === 'admin' ? 'active' : (r.status || 'pending');
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        password: localMatch?.password || '',
        role: r.role,
        avatar: r.avatar || localMatch?.avatar || '👤',
        department: r.department,
        batch: typeof r.batch === 'string' ? r.batch : (localMatch?.batch ?? ''),
        targetExam: r.targetExam,
        status,
        accessPermissions: normalizePermissions(r.accessPermissions, status === 'active'),
        ...(r.selfRegisteredAdmin ? { selfRegisteredAdmin: true } : {}),
        createdAt: r.createdAt || localMatch?.createdAt || new Date().toISOString(),
      };
    });
    const remoteEmails = new Set(remoteUsers.map((r) => r.email.toLowerCase()));
    currentLocal.forEach((u) => {
      if (!remoteEmails.has(u.email.toLowerCase())) {
        merged.push(u);
      }
    });
    return merged;
  }, []);

  const refreshUsersFromBackend = useCallback(async (): Promise<User[]> => {
    const remote = await fetchBackendUsers();
    if (!remote) return users;
    let nextList: User[] = users;
    setUsers((prev) => {
      nextList = mergeWithBackendUsers(remote, prev);
      return nextList;
    });
    return nextList;
  }, [mergeWithBackendUsers, users]);

  useEffect(() => {
    fetchBackendUsers().then((remote) => {
      if (!remote) return;
      setUsers((prev) => mergeWithBackendUsers(remote, prev));
    });
  }, [mergeWithBackendUsers]);

  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'sim_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setUsers(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const canRegisterAdmin = React.useMemo(() => {
    try {
      if (localStorage.getItem('sim_first_admin_registered_v1') === 'true') return false;
    } catch {}
    return !users.some(
      (u) => u.role === 'admin' && Boolean(u.selfRegisteredAdmin)
    );
  }, [users]);

  useEffect(() => {
    if (users.some((u) => u.role === 'admin' && Boolean(u.selfRegisteredAdmin))) {
      try {
        localStorage.setItem('sim_first_admin_registered_v1', 'true');
      } catch {}
    }
  }, [users]);

  // Users (Admin Only Management & Controlled Self-Registration)
  const addUser = (user: Omit<User, 'id' | 'createdAt'> & { id?: string }, actorRole?: string, actorEmail?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can add users.');
      return;
    }
    if (!actorRole && user.role === 'admin' && !canRegisterAdmin) {
      console.warn('[DataContext] Permission Denied: First-time Admin registration is already closed.');
      return;
    }
    const status: AccountStatus = user.role === 'admin' ? 'active' : (user.status || 'pending');
    const accessPermissions =
      user.role === 'admin'
        ? { ...FULL_USER_PERMISSIONS }
        : normalizePermissions(user.accessPermissions, status === 'active');

    const isSelfAdmin = !actorRole && user.role === 'admin';
    const newUser: User = {
      ...user,
      id: user.id || generateId(),
      status,
      accessPermissions,
      ...(isSelfAdmin ? { selfRegisteredAdmin: true, batch: 'All' } : {}),
      createdAt: new Date().toISOString(),
    };
    if (isSelfAdmin) {
      try {
        localStorage.setItem('sim_first_admin_registered_v1', 'true');
      } catch {}
    }
    setUsers(prev => {
      const idx = prev.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newUser, id: copy[idx].id };
        return copy;
      }
      return [...prev, newUser];
    });
    if (actorRole === 'admin') {
      createBackendUserAsAdmin(newUser, { adminEmail: actorEmail }).catch(() => {});
    }
    addAuditLog({ action: 'User Created', userId: 'system', userName: actorRole === 'admin' ? 'Administrator' : newUser.name, details: `Created user: ${user.name} (${user.role}) [${status}]` });
  };

  const computeUpdatedUser = (u: User, data: Partial<User>): User => {
    const nextStatus: AccountStatus = u.role === 'admin' ? 'active' : (data.status || u.status);
    let nextPermissions = u.accessPermissions
      ? normalizePermissions(u.accessPermissions, u.status === 'active')
      : normalizePermissions(null, u.status === 'active');

    if (data.accessPermissions) {
      nextPermissions = normalizePermissions(data.accessPermissions, nextStatus === 'active');
    } else if (nextStatus === 'active' && u.status !== 'active') {
      const anyEnabled = Object.values(nextPermissions).some(Boolean);
      if (!anyEnabled) nextPermissions = { ...FULL_USER_PERMISSIONS };
    } else if (nextStatus === 'pending') {
      nextPermissions = { ...EMPTY_USER_PERMISSIONS };
    }

    return {
      ...u,
      ...data,
      status: nextStatus,
      accessPermissions: u.role === 'admin' ? { ...FULL_USER_PERMISSIONS } : nextPermissions,
    };
  };

  const updateUser = (id: string, data: Partial<User>, actorRole?: string, actorEmail?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can update users.');
      return;
    }
    const existingTarget = users.find(u => u.id === id);
    if (existingTarget) {
      const updated = computeUpdatedUser(existingTarget, data);
      updateBackendUserAccess(
        id,
        {
          email: existingTarget.email,
          status: updated.status,
          batch: updated.batch,
          accessPermissions: updated.accessPermissions,
          role: updated.role,
          department: updated.department,
          targetExam: updated.targetExam,
        },
        { adminEmail: actorEmail }
      ).catch(() => {});
    }
    setUsers(prev => prev.map(u => (u.id === id ? computeUpdatedUser(u, data) : u)));
  };

  const deleteUser = (id: string, actorRole?: string, actorEmail?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can delete users.');
      return;
    }
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    deleteBackendUser(id, { adminEmail: actorEmail }).catch(() => {});
    addAuditLog({ action: 'User Deleted', userId: 'system', userName: 'Administrator', details: `Deleted user: ${user?.name}` });
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUsersByRole = (role: string) => users.filter(u => u.role === role);

  const allowAllUsersAccess = (actorRole?: string, actorEmail?: string, onlyPending = false): number => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can allow users.');
      return 0;
    }
    const matchingCount = users.filter((u) => {
      if (u.role === 'admin') return false;
      if (onlyPending) return u.status === 'pending';
      return u.status !== 'active' || Object.values(normalizePermissions(u.accessPermissions, u.status === 'active')).some(v => !v);
    }).length;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === 'admin') return u;
        if (onlyPending && u.status !== 'pending') return u;
        return {
          ...u,
          status: 'active',
          accessPermissions: { ...FULL_USER_PERMISSIONS },
        };
      })
    );
    allowAllBackendUsers(onlyPending, { adminEmail: actorEmail }).catch(() => {});
    addAuditLog({
      action: onlyPending ? 'Allowed All Pending Users' : 'Allowed All Users Full Resource Access',
      userId: 'system',
      userName: actorEmail || 'Administrator',
      details: `Granted full resource access (${matchingCount} accounts updated)`,
    });
    return matchingCount;
  };

  // Departments
  const addDepartment = (dept: Omit<Department, 'id' | 'createdAt'>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') return;
    const newDept: Department = {
      ...dept,
      id: generateId(),
      batches: dept.batches || [],
      createdAt: new Date().toISOString(),
    };
    setDepartments(prev => [...prev, newDept]);
  };

  const deleteDepartment = (id: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') return;
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const updateDepartment = (id: string, data: Partial<Department>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') return;
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  // Courses
  const addCourse = (course: Omit<Course, 'id' | 'createdAt'>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can add courses.');
      return;
    }
    const newCourse: Course = { ...course, id: generateId(), createdAt: new Date().toISOString() };
    setCourses(prev => [...prev, newCourse]);
    addAuditLog({ action: 'Course Created', userId: 'admin', userName: 'Administrator', details: `Created course: ${course.name}` });
  };

  const deleteCourse = (id: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can delete courses.');
      return;
    }
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, data: Partial<Course>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can update courses.');
      return;
    }
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const enrollStudents = (courseId: string, studentIdsToAdd: string[], enrolledBy?: { id: string; name: string; role?: string }) => {
    if (enrolledBy?.role && enrolledBy.role !== 'admin') {
      console.warn('[DataContext] Permission Denied: Faculty cannot enroll students. ONLY Admin has student enrollment rights.');
      return;
    }
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const existing = c.studentIds || [];
      const merged = Array.from(new Set([...existing, ...studentIdsToAdd]));
      return { ...c, studentIds: merged };
    }));
    const targetCourse = courses.find(c => c.id === courseId);
    addAuditLog({
      action: 'Students Enrolled',
      userId: enrolledBy?.id || 'admin',
      userName: enrolledBy?.name || 'Administrator',
      details: `Enrolled ${studentIdsToAdd.length} student(s) into course "${targetCourse?.name || courseId}"`
    });
  };

  const unenrollStudent = (courseId: string, studentIdToRemove: string, removedBy?: { id: string; name: string; role?: string }) => {
    if (removedBy?.role && removedBy.role !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can unenroll students.');
      return;
    }
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return { ...c, studentIds: (c.studentIds || []).filter(id => id !== studentIdToRemove) };
    }));
  };

  // Resources (Admin and Faculty Can Add)
  const addResource = (resource: Omit<Resource, 'id' | 'date'> & { id?: string }, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin' && actorRole !== 'faculty') {
      console.warn('[DataContext] Security: ONLY Admin and Faculty can add resources.');
      return;
    }
    const resourceId = resource.id || generateId();
    const newResource: Resource = {
      ...resource,
      id: resourceId,
      date: new Date().toISOString().split('T')[0],
      batch: resource.batch || 'All',
    };
    setResources(prev => {
      const rTitle = (newResource.title || '').trim().toLowerCase();
      const rFile = (newResource.fileName || newResource.storagePath || '').replace(/^.*[\\\/]/, '').replace(/^\d+_/, '').trim().toLowerCase();
      const existingIdx = prev.findIndex(d => {
        if (d.id === resourceId) return true;
        if (d.storagePath && newResource.storagePath && d.storagePath === newResource.storagePath) return true;
        const dTitle = (d.title || '').trim().toLowerCase();
        const dFile = (d.fileName || d.storagePath || '').replace(/^.*[\\\/]/, '').replace(/^\d+_/, '').trim().toLowerCase();
        return dTitle === rTitle && (dFile === rFile || d.fileName === newResource.fileName);
      });
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newResource };
        return copy;
      }
      return [newResource, ...prev];
    });
    addAuditLog({ action: 'Resource Uploaded', userId: resource.uploaderId, userName: resource.uploaderName, details: `Uploaded: ${resource.title}` });
  };

  const deleteResource = (id: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Security: ONLY Admin can delete resources.');
      return;
    }
    const resource = resources.find(r => r.id === id);
    setResources(prev => prev.filter(r => r.id !== id));
    addAuditLog({ action: 'Resource Deleted', userId: 'admin', userName: 'Administrator', details: `Deleted resource: ${resource?.title}` });
  };

  const updateResource = (id: string, data: Partial<Resource>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin' && actorRole !== 'faculty') {
      console.warn('[DataContext] Security: ONLY Admin and Faculty can update resources.');
      return;
    }
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeFormatted = format(now, 'hh:mm a');
    const newAnn: Announcement = {
      ...ann,
      id: generateId(),
      date: dateStr,
      time: timeFormatted,
      timestamp: now.toISOString(),
    };
    setAnnouncements(prev => [...prev, newAnn]);

    // Automatically sync into Academic Calendar!
    const newCalEvent: CalendarEvent = {
      id: `cal-ann-${newAnn.id}`,
      title: `[Announcement] ${ann.title}`,
      description: ann.content,
      date: dateStr,
      time: timeFormatted,
      timestamp: now.toISOString(),
      type: 'announcement',
      authorName: ann.authorName,
      authorRole: ann.authorRole,
    };
    setCalendarEvents(prev => [newCalEvent, ...prev]);

    addAuditLog({
      action: 'Announcement Created',
      userId: ann.authorId,
      userName: ann.authorName,
      details: `Created announcement: ${ann.title} (synced to Academic Calendar)`
    });
  };

  const deleteAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.id !== `cal-ann-${id}`));
    addAuditLog({ action: 'Announcement Deleted', userId: 'system', userName: 'System', details: `Deleted announcement: ${ann?.title}` });
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  // Calendar Events
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    setCalendarEvents(prev => [newEvent, ...prev]);
    addAuditLog({
      action: 'Calendar Event Scheduled',
      userId: 'system',
      userName: event.authorName || 'Academic Directorate',
      details: `Scheduled event: ${event.title} on ${event.date} at ${event.time || 'TBD'}`
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Community (Nested Replies & Threads; Admin Only Deletion)
  const addCommunityMessage = (msg: Omit<CommunityMessage, 'id' | 'time' | 'likes' | 'replies'>) => {
    const now = new Date();
    const formattedDate = format(now, 'dd MMM yyyy, hh:mm a');
    const newMsg: CommunityMessage = {
      ...msg,
      id: generateId(),
      time: formattedDate,
      timestamp: now.toISOString(),
      likes: 0,
      replies: 0,
      repliesList: [],
    };
    setCommunityMessages(prev => [newMsg, ...prev]);
  };

  const addCommunityReply = (
    parentId: string,
    reply: {
      authorId: string;
      authorName: string;
      authorRole: string;
      message: string;
      authorAvatar?: string;
      parentReplyId?: string;
      replyToAuthor?: string;
    }
  ) => {
    const now = new Date();
    const formattedDate = format(now, 'dd MMM yyyy, hh:mm a');
    const newReply: CommunityReply = {
      id: generateId(),
      parentId,
      parentReplyId: reply.parentReplyId,
      replyToAuthor: reply.replyToAuthor,
      authorId: reply.authorId,
      authorName: reply.authorName,
      authorRole: reply.authorRole,
      authorAvatar: reply.authorAvatar,
      message: reply.message,
      time: formattedDate,
      timestamp: now.toISOString(),
      likes: 0,
    };

    setCommunityMessages(prev =>
      prev.map(msg => {
        if (msg.id !== parentId) return msg;
        const currentReplies = msg.repliesList || [];
        return {
          ...msg,
          replies: (msg.replies || 0) + 1,
          repliesList: [...currentReplies, newReply],
        };
      })
    );

    addAuditLog({
      action: 'Community Reply Added',
      userId: reply.authorId,
      userName: reply.authorName,
      details: `Replied to thread ${parentId}${reply.replyToAuthor ? ` (@${reply.replyToAuthor})` : ''}`
    });
  };

  const deleteCommunityMessage = (id: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] ONLY Admin can delete community messages.');
      return;
    }
    setCommunityMessages(prev => prev.filter(m => m.id !== id));
  };

  const togglePinMessage = (id: string) => {
    setCommunityMessages(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  // Quizzes
  const addQuiz = (quiz: Omit<Quiz, 'id'>) => {
    const newQuiz: Quiz = { ...quiz, id: generateId() };
    setQuizzes(prev => [...prev, newQuiz]);
    addAuditLog({ action: 'Quiz Created', userId: quiz.createdById, userName: quiz.createdByName, details: `Created quiz: ${quiz.title}` });
  };

  const deleteQuiz = (id: string) => {
    const quiz = quizzes.find(q => q.id === id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
    addAuditLog({ action: 'Quiz Deleted', userId: 'system', userName: 'System', details: `Deleted quiz: ${quiz?.title}` });
  };

  const updateQuiz = (id: string, data: Partial<Quiz>) => {
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
  };

  // Notifications (Admin Only Dispatch)
  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] ONLY Admin can dispatch notifications.');
      return;
    }
    const now = new Date();
    const newNotif: Notification = {
      ...notif,
      id: generateId(),
      time: format(now, 'dd MMM, hh:mm a'),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = (userId: string) => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Audit
  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = { ...log, id: generateId(), timestamp: new Date().toISOString() };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Student Documentation (Agent + Admin Only)
  const addStudentDocument = (doc: Omit<StudentDocument, 'id' | 'submittedAt'>, editorRole: 'admin' | 'agent'): boolean => {
    if (editorRole !== 'admin' && editorRole !== 'agent') {
      console.warn('[DataContext] Security: ONLY Admin and Agent can modify documentation lists.');
      return false;
    }
    const newDoc: StudentDocument = {
      ...doc,
      id: generateId(),
      submittedAt: new Date().toISOString(),
    };
    setStudentDocuments(prev => [newDoc, ...prev]);
    addAuditLog({
      action: 'Student Document Added',
      userId: editorRole,
      userName: editorRole === 'admin' ? 'Administrator' : 'AI Agent',
      details: `Added document: "${doc.title}" for ${doc.studentName}`
    });
    return true;
  };

  const updateStudentDocument = (id: string, updates: Partial<StudentDocument>, editorRole: 'admin' | 'agent'): boolean => {
    if (editorRole !== 'admin' && editorRole !== 'agent') {
      console.warn('[DataContext] Security: ONLY Admin and Agent can modify documentation lists.');
      return false;
    }
    setStudentDocuments(prev => prev.map(d => {
      if (d.id !== id) return d;
      const isNowVerified = updates.status === 'Verified';
      return {
        ...d,
        ...updates,
        verifiedAt: isNowVerified ? (updates.verifiedAt || new Date().toISOString().split('T')[0]) : d.verifiedAt,
        verifiedBy: isNowVerified ? (editorRole === 'admin' ? 'Admin' : 'Agent') : d.verifiedBy,
      };
    }));
    addAuditLog({
      action: 'Student Document Status Updated',
      userId: editorRole,
      userName: editorRole === 'admin' ? 'Administrator' : 'AI Agent',
      details: `Updated document ${id} to ${updates.status || 'updated'}`
    });
    return true;
  };

  const deleteStudentDocument = (id: string, editorRole: 'admin' | 'agent'): boolean => {
    if (editorRole !== 'admin' && editorRole !== 'agent') {
      console.warn('[DataContext] Security: ONLY Admin and Agent can modify documentation lists.');
      return false;
    }
    setStudentDocuments(prev => prev.filter(d => d.id !== id));
    addAuditLog({
      action: 'Student Document Removed',
      userId: editorRole,
      userName: editorRole === 'admin' ? 'Administrator' : 'AI Agent',
      details: `Removed document ${id}`
    });
    return true;
  };

  // Student Curriculum Study Progress
  const toggleChapterCompletion = (chapterId: string, studentId?: string, studentName?: string, studentBatch?: string, chapterName?: string): boolean => {
    const sId = studentId || 'u-student-1';
    let isNowCompleted = false;
    const canonicalId = getCanonicalChapterId(chapterId) || chapterId;
    const cName = chapterName || '';

    // Find all topics belonging to this chapter across curriculum
    let targetTopics: { id: string; name: string; chapterId: string; chapterName: string; subjectId?: string; subjectName?: string }[] = [];
    for (const s of DEFAULT_CURRICULUM) {
      for (const c of s.chapters || []) {
        if (
          c.id === canonicalId ||
          c.id === chapterId ||
          (cName && c.name.toLowerCase() === cName.toLowerCase()) ||
          c.name.toLowerCase() === canonicalId.toLowerCase()
        ) {
          targetTopics = (c.topics || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            chapterId: c.id,
            chapterName: c.name,
            subjectId: s.id,
            subjectName: s.name,
          }));
          break;
        }
      }
      if (targetTopics.length > 0) break;
    }

    setStudentProgressList(prev => {
      const existing = prev.find(p => p.studentId === sId);
      if (existing) {
        const canonicalList = deduplicateCompletedChapters(existing.completedChapters || []);
        const isCompleted = canonicalList.includes(canonicalId) ||
          (cName ? canonicalList.includes(getCanonicalChapterId(cName)) : false);
        isNowCompleted = !isCompleted;
        let nextChapters: string[];
        let nextTopics = [...(existing.completedTopics || [])];
        let nextDetails = [...(existing.completedTopicDetails || [])];

        if (isCompleted) {
          // Unmarking chapter -> remove chapter and unmark its topics
          nextChapters = canonicalList.filter(id => id !== canonicalId && (!cName || id !== getCanonicalChapterId(cName)));
          const topicIdsToRemove = new Set(targetTopics.map(t => t.id));
          const topicNamesToRemove = new Set(targetTopics.map(t => t.name.toLowerCase()));
          nextTopics = nextTopics.filter(id => !topicIdsToRemove.has(id));
          nextDetails = nextDetails.filter(d => !topicIdsToRemove.has(d.id) && !topicNamesToRemove.has((d.name || '').toLowerCase()));
        } else {
          // Marking chapter completed -> AUTOMATICALLY MARK WHOLE TOPICS AS COMPLETED!
          nextChapters = [...canonicalList, canonicalId];
          targetTopics.forEach(t => {
            if (!nextTopics.includes(t.id)) {
              nextTopics.push(t.id);
            }
            const alreadyInDetails = nextDetails.some(d => d.id === t.id || (d.name && d.name.toLowerCase() === t.name.toLowerCase()));
            if (!alreadyInDetails) {
              nextDetails.push({
                id: t.id,
                name: t.name,
                chapterId: t.chapterId,
                chapterName: t.chapterName,
                subjectId: t.subjectId,
                subjectName: t.subjectName,
              });
            }
          });
        }
        return prev.map(p => p.studentId === sId ? {
          ...p,
          completedChapters: nextChapters,
          completedTopics: nextTopics,
          completedTopicDetails: nextDetails,
          lastUpdated: new Date().toISOString(),
        } : p);
      } else {
        isNowCompleted = true;
        const initialChapters = [canonicalId];
        const initialTopics = targetTopics.map(t => t.id);
        const initialDetails: CompletedTopicDetail[] = targetTopics.map(t => ({
          id: t.id,
          name: t.name,
          chapterId: t.chapterId,
          chapterName: t.chapterName,
          subjectId: t.subjectId,
          subjectName: t.subjectName,
        }));
        const newRecord: StudentCurriculumProgress = {
          studentId: sId,
          studentName: studentName || 'Student',
          studentBatch: studentBatch || 'Unassigned',
          completedChapters: initialChapters,
          completedTopics: initialTopics,
          completedTopicDetails: initialDetails,
          lastUpdated: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });

    addAuditLog({
      action: isNowCompleted ? 'Chapter & All Topics Marked Completed' : 'Chapter Marked Incomplete',
      userId: sId,
      userName: studentName || 'Student',
      details: `Student toggled chapter ${cName || chapterId} (${targetTopics.length} topics updated)`
    });
    return isNowCompleted;
  };

  const toggleTopicCompletion = (
    topicId: string,
    studentId?: string,
    studentName?: string,
    studentBatch?: string,
    topicMeta?: { topicName?: string; chapterId?: string; chapterName?: string; subjectId?: string; subjectName?: string }
  ): boolean => {
    const sId = studentId || 'u-student-1';
    let isNowCompleted = false;
    const tName = topicMeta?.topicName || '';

    setStudentProgressList(prev => {
      const existing = prev.find(p => p.studentId === sId);
      if (existing) {
        const isCompleted = existing.completedTopics.includes(topicId) ||
          (existing.completedTopicDetails || []).some(d => d.id === topicId || (tName && d.name && d.name.toLowerCase() === tName.toLowerCase()));
        isNowCompleted = !isCompleted;

        let nextTopics: string[];
        let nextDetails: CompletedTopicDetail[];

        if (isCompleted) {
          nextTopics = existing.completedTopics.filter(id => id !== topicId && (!tName || id !== tName));
          nextDetails = (existing.completedTopicDetails || []).filter(d => d.id !== topicId && (!tName || d.name?.toLowerCase() !== tName.toLowerCase()));
          nextTopics = nextDetails.map(d => d.id);
        } else {
          const cleanName = resolveTopicHumanName(topicId, tName);
          const detailEntry: CompletedTopicDetail = {
            id: topicId,
            name: cleanName,
            chapterId: topicMeta?.chapterId,
            chapterName: topicMeta?.chapterName,
            subjectId: topicMeta?.subjectId,
            subjectName: topicMeta?.subjectName,
          };
          nextDetails = [
            ...(existing.completedTopicDetails || []).filter(d => d.id !== topicId && (!tName || d.name?.toLowerCase() !== tName.toLowerCase())),
            detailEntry,
          ];
          nextTopics = nextDetails.map(d => d.id);
        }

        // Check if all topics of this chapter are completed
        let chapId = topicMeta?.chapterId;
        let chapTopics: { id: string; name: string }[] = [];
        for (const s of DEFAULT_CURRICULUM) {
          for (const c of s.chapters || []) {
            if (chapId ? (c.id === chapId || c.name.toLowerCase() === (topicMeta?.chapterName || '').toLowerCase()) : (c.topics || []).some((t: any) => t.id === topicId || (tName && t.name.toLowerCase() === tName.toLowerCase()))) {
              chapId = c.id;
              chapTopics = (c.topics || []).map((t: any) => ({ id: t.id, name: t.name }));
              break;
            }
          }
          if (chapId && chapTopics.length > 0) break;
        }

        let nextChapters = deduplicateCompletedChapters(existing.completedChapters || []);
        if (chapId && chapTopics.length > 0) {
          const allTopicsDone = chapTopics.every(t =>
            nextTopics.includes(t.id) ||
            nextDetails.some(d => d.id === t.id || (d.name && d.name.toLowerCase() === t.name.toLowerCase()))
          );
          const canonicalChap = getCanonicalChapterId(chapId);
          if (allTopicsDone) {
            // DIRECTLY MARK CHAPTER AS COMPLETED
            if (!nextChapters.includes(canonicalChap)) {
              nextChapters.push(canonicalChap);
            }
          } else {
            // UNMARK CHAPTER IF NOT ALL TOPICS COMPLETED
            nextChapters = nextChapters.filter(id => id !== canonicalChap && id !== chapId && id !== topicMeta?.chapterName);
          }
        }

        return prev.map(p => p.studentId === sId ? {
          ...p,
          completedChapters: nextChapters,
          completedTopics: nextTopics,
          completedTopicDetails: nextDetails,
          lastUpdated: new Date().toISOString(),
        } : p);
      } else {
        isNowCompleted = true;
        const cleanName = resolveTopicHumanName(topicId, tName);
        const initialDetails: CompletedTopicDetail[] = [{
          id: topicId,
          name: cleanName,
          chapterId: topicMeta?.chapterId,
          chapterName: topicMeta?.chapterName,
          subjectId: topicMeta?.subjectId,
          subjectName: topicMeta?.subjectName,
        }];
        const newRecord: StudentCurriculumProgress = {
          studentId: sId,
          studentName: studentName || 'Student',
          studentBatch: studentBatch || 'Unassigned',
          completedChapters: [],
          completedTopics: [topicId],
          completedTopicDetails: initialDetails,
          lastUpdated: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });

    addAuditLog({
      action: isNowCompleted ? 'Topic Marked Completed' : 'Topic Marked Incomplete',
      userId: sId,
      userName: studentName || 'Student',
      details: `Student toggled topic ${tName || topicId}`
    });
    return isNowCompleted;
  };

  const isChapterCompleted = (chapterIdOrName: string, studentId?: string): boolean => {
    if (!chapterIdOrName) return false;
    if (chapterIdOrName.toLowerCase().includes('body fluids')) return false;
    const sId = studentId || 'u-student-1';
    const rec = studentProgressList.find(p => p.studentId === sId);
    if (!rec) return false;
    const targetCanon = getCanonicalChapterId(chapterIdOrName).toLowerCase();
    const targetLower = chapterIdOrName.toLowerCase();
    return (rec.completedChapters || []).some(c => {
      const cLower = c.toLowerCase();
      const cCanon = getCanonicalChapterId(c).toLowerCase();
      return cLower === targetLower || cCanon === targetCanon || cLower === targetCanon || cCanon === targetLower;
    });
  };

  const isTopicCompleted = (topicIdOrName: string, studentId?: string): boolean => {
    if (!topicIdOrName) return false;
    const lower = topicIdOrName.toLowerCase();
    if (lower.includes('body fluids') || lower.includes('molecular basis of inheritance') || lower === 'top-bio-204') return false;
    if (!isTopicInCurrentCurriculum(topicIdOrName, topicIdOrName)) return false;
    const sId = studentId || 'u-student-1';
    const rec = studentProgressList.find(p => p.studentId === sId);
    if (!rec) return false;
    if (rec.completedTopics.includes(topicIdOrName)) return true;
    if (rec.completedTopicDetails?.some(d => d.id === topicIdOrName || (d.name && d.name.toLowerCase() === lower))) {
      return true;
    }
    return false;
  };

  const getStudentProgress = (studentId?: string): StudentCurriculumProgress | undefined => {
    const sId = studentId || 'u-student-1';
    return studentProgressList.find(p => p.studentId === sId);
  };

  const getChapterCompletions = (chapterId: string) => {
    return studentProgressList
      .filter(p => p.completedChapters.includes(chapterId) || p.completedChapters.some(c => c.toLowerCase() === chapterId.toLowerCase()))
      .map(p => ({ studentId: p.studentId, studentName: p.studentName, studentBatch: p.studentBatch, avatar: p.avatar }));
  };

  const getTopicCompletions = (topicId: string) => {
    if (!topicId || topicId === 'top-bio-204' || topicId.toLowerCase().includes('molecular basis of inheritance')) return [];
    if (!isTopicInCurrentCurriculum(topicId)) return [];
    return studentProgressList
      .filter(p => p.completedTopics.includes(topicId) || p.completedTopics.some(t => t.toLowerCase() === topicId.toLowerCase()) || p.completedTopicDetails?.some(d => d.id === topicId || d.name?.toLowerCase() === topicId.toLowerCase()))
      .map(p => ({ studentId: p.studentId, studentName: p.studentName, studentBatch: p.studentBatch, avatar: p.avatar }));
  };

  // Consultancy Management Methods
  const addConsultancyDossier = (dossier: StudentConsultancyDossier) => {
    setConsultancyDossiers(prev => [
      ...prev.filter(d => d.studentId !== dossier.studentId),
      dossier
    ]);
    // Also ensure the 8 documents for this student exist in studentDocuments
    setStudentDocuments(prev => {
      const studentDocs: StudentDocument[] = dossier.checklist.map(item => ({
        id: `sdoc-${dossier.studentId}-${item.key}`,
        studentId: dossier.studentId,
        studentName: dossier.studentName,
        stageNumber: item.stageNumber,
        stageKey: item.key,
        title: `${item.stageNumber}. ${item.title}`,
        category: item.category,
        status: item.status === 'verified'
          ? 'Verified'
          : item.status === 'rejected'
            ? 'Not Verified'
            : item.status === 'pending'
              ? 'Pending'
              : 'In Review/In Progress',
        fileName: item.uploadedFile?.fileName,
        fileSize: item.uploadedFile?.fileSize,
        submittedAt: item.uploadedFile?.uploadedAt || new Date().toISOString(),
        verifiedAt: item.verifiedAt ? item.verifiedAt.split('T')[0] : undefined,
        verifiedBy: item.verifiedBy,
        remarks: item.consultantNotes,
        subItems: item.subItems?.map((sub) => ({
          id: sub.id,
          title: sub.title,
          status: sub.status,
          notes: sub.notes,
        })),
      }));
      return [...prev.filter(d => d.studentId !== dossier.studentId), ...studentDocs];
    });
    addAuditLog({
      action: 'Consultancy Dossier Created',
      userId: dossier.consultantId || 'system',
      userName: dossier.consultantName || 'Consultant Agent',
      details: `Created study abroad admissions dossier for ${dossier.studentName} (${dossier.targetCountry})`
    });
  };

  const updateConsultancyDossier = (studentId: string, updates: Partial<StudentConsultancyDossier>) => {
    setConsultancyDossiers(prev => prev.map(d => {
      if (d.studentId === studentId) {
        return {
          ...d,
          ...updates,
          lastUpdated: new Date().toISOString()
        };
      }
      return d;
    }));
  };

  const deleteConsultancyDossier = (studentId: string) => {
    setConsultancyDossiers(prev => prev.filter(d => d.studentId !== studentId));
    setConsultancyOptInMap(prev => ({ ...prev, [studentId]: false }));
    setStudentDocuments(prev => prev.filter(d => d.studentId !== studentId));
    addAuditLog({
      action: 'Consultancy Dossier Removed',
      userId: 'system',
      userName: 'Consultant Agent',
      details: `Removed consultancy facility & verification dossier for student ID ${studentId}`
    });
  };

  const getStudentDossier = (studentId?: string): StudentConsultancyDossier | undefined => {
    const sId = studentId || 'u-student-1';
    return consultancyDossiers.find(d => d.studentId === sId);
  };

  const isConsultancyOptedIn = (studentId?: string): boolean => {
    const sId = studentId || 'u-student-1';
    if (consultancyOptInMap[sId] !== undefined) {
      return consultancyOptInMap[sId];
    }
    return consultancyDossiers.some(d => d.studentId === sId);
  };

  const setConsultancyOptIn = (studentId: string, optIn: boolean) => {
    setConsultancyOptInMap(prev => ({ ...prev, [studentId]: optIn }));

    if (optIn) {
      const studentUser = users.find(u => u.id === studentId);
      const studentName = studentUser?.name || 'Student';
      const studentEmail = studentUser?.email || '';
      const studentBatch = studentUser?.batch || 'Unassigned';

      // 1. Ensure consultancy dossier exists
      setConsultancyDossiers(prev => {
        const existing = prev.find(d => d.studentId === studentId);
        if (existing) return prev;

        const newDossier: StudentConsultancyDossier = {
          studentId,
          studentName,
          studentEmail,
          studentBatch,
          avatar: studentUser?.avatar || '👩‍🎓',
          targetCountry: 'Italy',
          targetCourse: 'Medicine and Surgery (Single-Cycle Degree / MD)',
          targetUniversities: [
            'Sapienza University of Rome (Medicine & Surgery)',
            'University of Milan (International Medical School - IMS)',
            'University of Bologna (School of Medicine)'
          ],
          consultantId: 'u-consultant-1',
          consultantName: 'Dr. Marco Rossi (Consultant Agent)',
          assignedAt: new Date().toISOString(),
          overallStatus: 'IN_PROGRESS',
          intake: '2026 / 2027 Academic Intake',
          priority: 'High',
          lastUpdated: new Date().toISOString(),
          notes: 'Aspirant opted in for Study Abroad Consular Assistance. Verification pipeline initiated.',
          checklist: createNewApplicantChecklist(),
        };
        return [newDossier, ...prev];
      });

      // 2. Ensure student documents for all 8 stages exist for this student (all starting in In Review status)
      setStudentDocuments(prev => {
        const hasDocs = prev.some(d => d.studentId === studentId);
        if (hasDocs) return prev;

        const seededDocs: StudentDocument[] = createNewApplicantChecklist().map(item => ({
          id: `sdoc-${studentId}-${item.key}`,
          studentId,
          studentName,
          stageNumber: item.stageNumber,
          stageKey: item.key,
          title: `${item.stageNumber}. ${item.title}`,
          category: item.category,
          status: 'In Review/In Progress',
          submittedAt: new Date().toISOString(),
          remarks: item.consultantNotes,
          subItems: item.subItems?.map((sub) => ({
            id: sub.id,
            title: sub.title,
            status: sub.status,
            notes: sub.notes,
          })),
        }));
        return [...prev.filter(d => d.studentId !== studentId), ...seededDocs];
      });

      // 3. Dispatch notification to Consultant Agent
      const now = new Date();
      const notifTime = format(now, 'dd MMM, hh:mm a');
      const consultantNotif: Notification = {
        id: generateId(),
        title: 'New Consultancy Facility Request',
        message: `${studentName} (${studentBatch}) has opted in for Study Abroad Consultancy Assistance. Review and allow/activate consultancy facility.`,
        time: notifTime,
        read: false,
        type: 'enrollment',
        targetRole: 'consultant',
      };
      setNotifications(prev => [consultantNotif, ...prev]);

      addAuditLog({
        action: 'Consultancy Assistance Requested',
        userId: studentId,
        userName: studentName,
        details: `Student ${studentName} (${studentId}) opted in. Notification dispatched to Consultant Agent.`
      });
    } else {
      addAuditLog({
        action: 'Consultancy Assistance Opted Out',
        userId: studentId,
        userName: studentId,
        details: `Student ${studentId} updated consultancy assistance preference to Opted Out`
      });
    }
  };

  const updateChecklistItemStatus = (
    studentId: string,
    itemId: string,
    status: ChecklistItemStatus,
    consultantNotes?: string,
    subItemUpdates?: { id: string; status: 'pending' | 'verified' | 'rejected'; notes?: string }[]
  ) => {
    setConsultancyDossiers(prev => prev.map(dossier => {
      if (dossier.studentId !== studentId) return dossier;

      const updatedChecklist = dossier.checklist.map(item => {
        if (item.id !== itemId && item.key !== itemId) return item;

        let updatedSubItems = item.subItems;
        if (subItemUpdates && updatedSubItems) {
          updatedSubItems = updatedSubItems.map(sub => {
            const match = subItemUpdates.find(u => u.id === sub.id);
            if (match) {
              return {
                ...sub,
                status: match.status,
                notes: match.notes !== undefined ? match.notes : sub.notes
              };
            }
            return sub;
          });
        }

        const isVerified = status === 'verified';
        return {
          ...item,
          status,
          consultantNotes: consultantNotes !== undefined ? consultantNotes : item.consultantNotes,
          verifiedBy: isVerified ? (dossier.consultantName || 'Consultant Agent') : item.verifiedBy,
          verifiedAt: isVerified ? new Date().toISOString() : (status === 'pending' ? undefined : item.verifiedAt),
          subItems: updatedSubItems
        };
      });

      // Recalculate overall status
      const allVerified = updatedChecklist.every(i => i.status === 'verified');
      const verifiedCount = updatedChecklist.filter(i => i.status === 'verified').length;

      let overallStatus: DossierOverallStatus = dossier.overallStatus;
      if (allVerified) {
        overallStatus = 'COMPLETED';
      } else if (verifiedCount >= 7) {
        overallStatus = 'VISA_READY';
      } else if (verifiedCount >= 6) {
        overallStatus = 'PRE_ENROLLED';
      } else if (verifiedCount >= 5) {
        overallStatus = 'SCHOLARSHIP_READY';
      } else if (verifiedCount >= 4) {
        overallStatus = 'APOSTILLED';
      } else if (verifiedCount >= 3) {
        overallStatus = 'DOCS_VERIFIED';
      } else {
        overallStatus = 'IN_PROGRESS';
      }

      return {
        ...dossier,
        checklist: updatedChecklist,
        overallStatus,
        lastUpdated: new Date().toISOString()
      };
    }));

    // Synchronize with studentDocuments so Student Dashboard reflects Verified / Not Verified immediately
    setStudentDocuments(prev => {
      const keyWithoutChk = itemId.replace('chk-', '').toLowerCase();
      let docStatus: StudentDocument['status'] = 'Pending';
      if (status === 'verified') {
        docStatus = 'Verified';
      } else if (status === 'rejected') {
        docStatus = 'Not Verified';
      } else if (status === 'in_progress' || status === 'submitted') {
        docStatus = 'In Review/In Progress';
      } else {
        docStatus = 'Pending';
      }
      const isVerified = docStatus === 'Verified';

      return prev.map(doc => {
        const isStudentMatch = doc.studentId === studentId;
        if (!isStudentMatch) return doc;

        const isStageMatch =
          doc.stageKey?.toLowerCase() === keyWithoutChk ||
          doc.id === `sdoc-${keyWithoutChk}` ||
          doc.id === itemId ||
          doc.stageNumber === Number(itemId) ||
          (doc.title && doc.title.toLowerCase().includes(keyWithoutChk.replace(/_/g, ' ')));

        if (!isStageMatch) return doc;

        return {
          ...doc,
          status: docStatus,
          verifiedBy: isVerified ? 'Dr. Marco Rossi (Consultant Agent)' : undefined,
          verifiedAt: isVerified ? new Date().toISOString().split('T')[0] : undefined,
          remarks: consultantNotes !== undefined ? consultantNotes : doc.remarks,
        };
      });
    });

    addAuditLog({
      action: 'Checklist Item Updated',
      userId: 'consultant',
      userName: 'Consultant Agent',
      details: `Updated stage ${itemId} status to ${status} for student ID ${studentId}`
    });
  };

  return (
    <DataContext.Provider value={{
      users, addUser, updateUser, deleteUser, getUserById, getUsersByRole, allowAllUsersAccess, refreshUsersFromBackend, canRegisterAdmin,
      departments, addDepartment, deleteDepartment, updateDepartment,
      cohortBatches, addCohortBatch, deleteCohortBatch,
      courses, addCourse, deleteCourse, updateCourse, enrollStudents, unenrollStudent,
      resources, addResource, deleteResource, updateResource,
      announcements, addAnnouncement, deleteAnnouncement, updateAnnouncement,
      calendarEvents, addCalendarEvent, deleteCalendarEvent,
      communityMessages, addCommunityMessage, addCommunityReply, deleteCommunityMessage, togglePinMessage,
      quizzes, addQuiz, deleteQuiz, updateQuiz,
      notifications, addNotification, markNotificationRead, markAllRead,
      auditLogs, addAuditLog,
      studentDocuments, addStudentDocument, updateStudentDocument, deleteStudentDocument,
      studentProgressList,
      toggleChapterCompletion,
      toggleTopicCompletion,
      isChapterCompleted,
      isTopicCompleted,
      getStudentProgress,
      getChapterCompletions,
      getTopicCompletions,
      consultancyDossiers,
      updateChecklistItemStatus,
      addConsultancyDossier,
      updateConsultancyDossier,
      deleteConsultancyDossier,
      getStudentDossier,
      isConsultancyOptedIn,
      setConsultancyOptIn,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
