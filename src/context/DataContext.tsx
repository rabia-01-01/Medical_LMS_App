import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  avatar: string;
  department?: string;
  batch?: string; // 'Batch 1 (Dec)' | 'Batch 2 (May/June)'
  status: 'active' | 'suspended';
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
  category: 'Identity' | 'Academic' | 'Medical' | 'Financial';
  status: 'Pending' | 'Verified' | 'Rejected';
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string; // 'Admin' | 'Agent'
  remarks?: string;
}

interface DataContextType {
  // Users (Admin Only Management)
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>, actorRole?: string) => void;
  updateUser: (id: string, data: Partial<User>, actorRole?: string) => void;
  deleteUser: (id: string, actorRole?: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];

  // Departments & Batches
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>, actorRole?: string) => void;
  deleteDepartment: (id: string, actorRole?: string) => void;
  updateDepartment: (id: string, data: Partial<Department>, actorRole?: string) => void;

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
  addCommunityReply: (parentId: string, reply: { authorId: string; authorName: string; authorRole: string; message: string; authorAvatar?: string }) => void;
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

export const DEFAULT_STUDENT_DOCS: StudentDocument[] = [
  {
    id: 'sdoc-1',
    studentId: 'u-student-1',
    studentName: 'Mary',
    title: 'NEET-UG Admit Card & Verification Slip',
    category: 'Academic',
    status: 'Verified',
    submittedAt: '2026-10-10T10:00:00.000Z',
    verifiedAt: '2026-10-15',
    verifiedBy: 'Admin',
    remarks: 'Roll number and photograph authenticated with NTA records.',
  },
  {
    id: 'sdoc-2',
    studentId: 'u-student-1',
    studentName: 'Mary',
    title: '12th Standard Science Board Marksheet',
    category: 'Academic',
    status: 'Verified',
    submittedAt: '2026-10-11T12:00:00.000Z',
    verifiedAt: '2026-10-16',
    verifiedBy: 'Agent',
    remarks: 'Physics (92), Chemistry (95), Biology (98) verified via automated board API.',
  },
  {
    id: 'sdoc-3',
    studentId: 'u-student-1',
    studentName: 'Mary',
    title: 'National Identity Proof (Aadhaar / Passport)',
    category: 'Identity',
    status: 'Verified',
    submittedAt: '2026-10-12T14:30:00.000Z',
    verifiedAt: '2026-10-17',
    verifiedBy: 'Admin',
    remarks: 'Biometric identity match confirmed.',
  },
  {
    id: 'sdoc-4',
    studentId: 'u-student-1',
    studentName: 'Mary',
    title: 'Institutional Medical Fitness Certificate',
    category: 'Medical',
    status: 'Verified',
    submittedAt: '2026-10-14T09:15:00.000Z',
    verifiedAt: '2026-10-18',
    verifiedBy: 'Agent',
    remarks: 'Certified by Registered Medical Practitioner.',
  },
  {
    id: 'sdoc-5',
    studentId: 'u-student-1',
    studentName: 'Mary',
    title: 'Batch 1 (Dec) Registration & Tuition Fee Receipt',
    category: 'Financial',
    status: 'Verified',
    submittedAt: '2026-10-15T16:00:00.000Z',
    verifiedAt: '2026-10-20',
    verifiedBy: 'Admin',
    remarks: 'Tuition and laboratory deposit received in full for Batch 1 (Dec).',
  },
  {
    id: 'sdoc-6',
    studentId: 'u-student-2',
    studentName: 'Alex Rivera',
    title: 'IMAT Exam Registration Slip',
    category: 'Academic',
    status: 'Pending',
    submittedAt: '2026-10-25T11:00:00.000Z',
    remarks: 'Pending Universitaly portal validation.',
  },
];

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
          batch: 'Batch 1 (Dec)',
          status: 'active',
          createdAt: new Date().toISOString(),
          targetExam: 'NEET-UG',
        },
        {
          id: 'u-student-2',
          name: 'Alex Rivera',
          email: 'alex@medical.lms',
          phone: '+1 555-0103',
          password: 'password',
          role: 'student',
          avatar: '👨‍🎓',
          department: 'Pre-Clinical Sciences',
          batch: 'Batch 2 (May/June)',
          status: 'active',
          createdAt: new Date().toISOString(),
          targetExam: 'IMAT (Italy)',
        },
      ];
    }
    return stored.map((u, i) => ({
      ...u,
      batch: u.batch || (u.role === 'student' ? (i % 2 === 0 ? 'Batch 1 (Dec)' : 'Batch 2 (May/June)') : 'All'),
    }));
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const stored = loadFromStorage<Department[]>('sim_departments', []);
    if (!stored || stored.length === 0) {
      return [
        {
          id: 'dept-1',
          name: 'Pre-Clinical Sciences',
          icon: 'fa-dna',
          description: 'Foundations of Human Anatomy, Physiology, Cell Biology & Medical Biochemistry',
          subjects: ['Biology', 'Chemistry'],
          batches: ['Batch 1 (Dec)', 'Batch 2 (May/June)'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dept-2',
          name: 'Paraclinical & Quantitative Sciences',
          icon: 'fa-calculator',
          description: 'Pathology, Medical Physics, Biostatistics, Maths & Clinical Reasoning',
          subjects: ['Physics', 'Maths', 'Logical Reasoning'],
          batches: ['Batch 1 (Dec)', 'Batch 2 (May/June)'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dept-3',
          name: 'Clinical Medicine & Humanities',
          icon: 'fa-globe-americas',
          description: 'Internal Medicine, Healthcare GK, Bioethics & Scientific English',
          subjects: ['English', 'GK'],
          batches: ['Batch 1 (Dec)', 'Batch 2 (May/June)'],
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return stored.map((d) => ({
      ...d,
      batches: d.batches && d.batches.length > 0 ? d.batches : ['Batch 1 (Dec)', 'Batch 2 (May/June)'],
    }));
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = loadFromStorage<Course[]>('sim_courses', []);
    if (!stored || stored.length === 0) {
      return [
        {
          id: 'crs-1',
          name: 'NEET-UG Comprehensive Masterclass (Dec)',
          category: 'NEET-UG',
          description: 'Full syllabus intensive coverage with DPPs and mock drills for December cohort',
          subjects: ['Biology', 'Physics', 'Chemistry'],
          facultyIds: ['u-faculty-1'],
          studentIds: ['u-student-1'],
          batch: 'Batch 1 (Dec)',
          duration: '12 Months',
          icon: 'fa-heartbeat',
          color: 'bg-emerald-600',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'crs-2',
          name: 'Target NEET Super-Sprint (May/June)',
          category: 'NEET-UG',
          description: 'Accelerated revision and high-yield question series for May/June batch',
          subjects: ['Biology', 'Chemistry', 'Maths'],
          facultyIds: ['u-faculty-1'],
          studentIds: ['u-student-2'],
          batch: 'Batch 2 (May/June)',
          duration: '6 Months',
          icon: 'fa-stethoscope',
          color: 'bg-blue-600',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'crs-3',
          name: 'Clinical Aptitude & Reasoning Foundation',
          category: 'General',
          description: 'Logic, quantitative reasoning, and scientific English for medical entrance exams',
          subjects: ['Logical Reasoning', 'Maths', 'English', 'GK'],
          facultyIds: ['u-faculty-1'],
          studentIds: ['u-student-1'],
          batch: 'Batch 1 (Dec)',
          duration: '8 Months',
          icon: 'fa-brain',
          color: 'bg-purple-600',
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return stored.map((c, i) => ({
      ...c,
      batch: c.batch || (i % 2 === 0 ? 'Batch 1 (Dec)' : 'Batch 2 (May/June)'),
    }));
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const stored = loadFromStorage<Resource[]>('sim_resources', []);
    return stored.map((r, i) => ({
      ...r,
      batch: r.batch || (i % 2 === 0 ? 'Batch 1 (Dec)' : 'Batch 2 (May/June)'),
    }));
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('sim_announcements', []));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    return loadFromStorage('sim_calendar_events', [
      {
        id: 'cal-default-1',
        title: 'Comprehensive NEET-UG Diagnostic Mock 1',
        description: 'Full syllabus 200 questions timing drill with all-India percentile ranking.',
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        timestamp: new Date().toISOString(),
        type: 'exam',
        authorName: 'Academic Directorate',
        authorRole: 'Admin',
      },
      {
        id: 'cal-default-2',
        title: 'Clinical Case Discussion: Acid-Base Disorders',
        description: 'Interactive case study with Dr. Jenkins on arterial blood gas and renal compensation.',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '04:00 PM',
        timestamp: new Date(Date.now() + 86400000).toISOString(),
        type: 'lecture',
        authorName: 'Dr. Sarah Jenkins',
        authorRole: 'Faculty',
      },
    ]);
  });

  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(() => {
    const stored = loadFromStorage<CommunityMessage[]>('sim_community', []);
    if (!stored || stored.length === 0) {
      return [
        {
          id: 'comm-msg-1',
          authorId: 'u-faculty-1',
          authorName: 'Dr. Sarah Jenkins',
          authorRole: 'Faculty',
          message:
            'Welcome everyone! For this week’s Human Physiology module, please pay special attention to the Frank-Starling cardiac relationship and renal clearance mechanisms. Feel free to ask questions here!',
          time: format(new Date(Date.now() - 7200000), 'dd MMM yyyy, hh:mm a'),
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 12,
          replies: 2,
          pinned: true,
          repliesList: [
            {
              id: 'rep-1-1',
              parentId: 'comm-msg-1',
              authorId: 'u-student-1',
              authorName: 'Mary',
              authorRole: 'Student',
              message:
                'Thank you Dr. Jenkins! Does the length-tension curve in cardiac muscle peak at the same sarcomere length as skeletal muscle?',
              time: format(new Date(Date.now() - 5400000), 'dd MMM yyyy, hh:mm a'),
              timestamp: new Date(Date.now() - 5400000).toISOString(),
              likes: 4,
            },
            {
              id: 'rep-1-2',
              parentId: 'comm-msg-1',
              authorId: 'u-faculty-1',
              authorName: 'Dr. Sarah Jenkins',
              authorRole: 'Faculty',
              message:
                'Great question Mary! Cardiac muscle operates predominantly on the ascending limb of the Frank-Starling curve (~1.8 to 2.2 µm), giving it higher sensitivity to stretch.',
              time: format(new Date(Date.now() - 3600000), 'dd MMM yyyy, hh:mm a'),
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              likes: 7,
            },
          ],
        },
        {
          id: 'comm-msg-2',
          authorId: 'u-student-1',
          authorName: 'Mary',
          authorRole: 'Student',
          message:
            'Could someone clarify whether secondary active transport in renal tubules uses ATP directly or relies on the sodium-potassium ATPase electrochemical gradient?',
          time: format(new Date(Date.now() - 3600000), 'dd MMM yyyy, hh:mm a'),
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 5,
          replies: 1,
          pinned: false,
          repliesList: [
            {
              id: 'rep-2-1',
              parentId: 'comm-msg-2',
              authorId: 'u-faculty-1',
              authorName: 'Dr. Sarah Jenkins',
              authorRole: 'Faculty',
              message:
                'Secondary active transport (e.g. SGLT-2) relies on the Na+ gradient established by primary active Na+/K+ ATPase, consuming indirect metabolic energy.',
              time: format(new Date(Date.now() - 1800000), 'dd MMM yyyy, hh:mm a'),
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              likes: 6,
            },
          ],
        },
        {
          id: 'comm-msg-3',
          authorId: 'u-admin-1',
          authorName: 'Alice Kernel',
          authorRole: 'Admin',
          message:
            'All students: The upcoming NEET Diagnostic Drill 1 has been scheduled on the Academic Calendar. Please ensure you review your allocated topics in the Curriculum Browser.',
          time: format(new Date(Date.now() - 1800000), 'dd MMM yyyy, hh:mm a'),
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          likes: 8,
          replies: 0,
          pinned: false,
          repliesList: [],
        },
      ];
    }
    return stored.map((msg, idx) => {
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
    return stored.map((q, i) => ({
      ...q,
      batch: q.batch || (i % 2 === 0 ? 'Batch 1 (Dec)' : 'Batch 2 (May/June)'),
    }));
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('sim_notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('sim_audit', []));
  const [studentDocuments, setStudentDocuments] = useState<StudentDocument[]>(() =>
    loadFromStorage('sim_student_documents', DEFAULT_STUDENT_DOCS)
  );

  // Persist to localStorage
  useEffect(() => { saveToStorage('sim_users', users); }, [users]);
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

  // Users (Admin Only)
  const addUser = (user: Omit<User, 'id' | 'createdAt'>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can add users.');
      return;
    }
    const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({ action: 'User Created', userId: 'system', userName: 'Administrator', details: `Created user: ${user.name} (${user.role})` });
  };

  const updateUser = (id: string, data: Partial<User>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can update users.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Permission Denied: ONLY Admin can delete users.');
      return;
    }
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog({ action: 'User Deleted', userId: 'system', userName: 'Administrator', details: `Deleted user: ${user?.name}` });
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUsersByRole = (role: string) => users.filter(u => u.role === role);

  // Departments
  const addDepartment = (dept: Omit<Department, 'id' | 'createdAt'>, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') return;
    const newDept: Department = {
      ...dept,
      id: generateId(),
      batches: dept.batches || ['Batch 1 (Dec)', 'Batch 2 (May/June)'],
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

  // Resources (ONLY Admin Can Add / Delete)
  const addResource = (resource: Omit<Resource, 'id' | 'date'> & { id?: string }, actorRole?: string) => {
    if (actorRole && actorRole !== 'admin') {
      console.warn('[DataContext] Security: ONLY Admin can add resources.');
      return;
    }
    const resourceId = resource.id || generateId();
    const newResource: Resource = {
      ...resource,
      id: resourceId,
      date: new Date().toISOString().split('T')[0],
      batch: resource.batch || 'Batch 1 (Dec)',
    };
    setResources(prev => {
      if (prev.some(r => r.id === resourceId)) {
        return prev.map(r => r.id === resourceId ? newResource : r);
      }
      return [...prev, newResource];
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
    reply: { authorId: string; authorName: string; authorRole: string; message: string; authorAvatar?: string }
  ) => {
    const now = new Date();
    const formattedDate = format(now, 'dd MMM yyyy, hh:mm a');
    const newReply: CommunityReply = {
      id: generateId(),
      parentId,
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
      details: `Replied to thread ${parentId}`
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

  return (
    <DataContext.Provider value={{
      users, addUser, updateUser, deleteUser, getUserById, getUsersByRole,
      departments, addDepartment, deleteDepartment, updateDepartment,
      courses, addCourse, deleteCourse, updateCourse, enrollStudents, unenrollStudent,
      resources, addResource, deleteResource, updateResource,
      announcements, addAnnouncement, deleteAnnouncement, updateAnnouncement,
      calendarEvents, addCalendarEvent, deleteCalendarEvent,
      communityMessages, addCommunityMessage, addCommunityReply, deleteCommunityMessage, togglePinMessage,
      quizzes, addQuiz, deleteQuiz, updateQuiz,
      notifications, addNotification, markNotificationRead, markAllRead,
      auditLogs, addAuditLog,
      studentDocuments, addStudentDocument, updateStudentDocument, deleteStudentDocument,
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
