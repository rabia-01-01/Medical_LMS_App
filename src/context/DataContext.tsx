import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
  avatar: string;
  department?: string;
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
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  authorRole: string;
}

export interface CommunityMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  time: string;
  likes: number;
  replies: number;
  pinned: boolean;
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
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
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

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];

  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  deleteDepartment: (id: string) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;

  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  deleteCourse: (id: string) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;

  // Resources
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'date'>) => void;
  deleteResource: (id: string) => void;
  updateResource: (id: string, data: Partial<Resource>) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;

  // Community
  communityMessages: CommunityMessage[];
  addCommunityMessage: (msg: Omit<CommunityMessage, 'id' | 'time' | 'likes' | 'replies'>) => void;
  deleteCommunityMessage: (id: string) => void;
  togglePinMessage: (id: string) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  deleteQuiz: (id: string) => void;
  updateQuiz: (id: string, data: Partial<Quiz>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;

  // Audit
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('sim_users', []));
  const [departments, setDepartments] = useState<Department[]>(() => loadFromStorage('sim_departments', []));
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage('sim_courses', []));
  const [resources, setResources] = useState<Resource[]>(() => loadFromStorage('sim_resources', []));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage('sim_announcements', []));
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(() => loadFromStorage('sim_community', []));
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => loadFromStorage('sim_quizzes', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('sim_notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('sim_audit', []));

  // Persist to localStorage
  useEffect(() => { saveToStorage('sim_users', users); }, [users]);
  useEffect(() => { saveToStorage('sim_departments', departments); }, [departments]);
  useEffect(() => { saveToStorage('sim_courses', courses); }, [courses]);
  useEffect(() => { saveToStorage('sim_resources', resources); }, [resources]);
  useEffect(() => { saveToStorage('sim_announcements', announcements); }, [announcements]);
  useEffect(() => { saveToStorage('sim_community', communityMessages); }, [communityMessages]);
  useEffect(() => { saveToStorage('sim_quizzes', quizzes); }, [quizzes]);
  useEffect(() => { saveToStorage('sim_notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('sim_audit', auditLogs); }, [auditLogs]);

  // Users
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({ action: 'User Created', userId: 'system', userName: 'System', details: `Created user: ${user.name} (${user.role})` });
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog({ action: 'User Deleted', userId: 'system', userName: 'System', details: `Deleted user: ${user?.name}` });
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getUsersByRole = (role: string) => users.filter(u => u.role === role);

  // Departments
  const addDepartment = (dept: Omit<Department, 'id' | 'createdAt'>) => {
    const newDept: Department = { ...dept, id: generateId(), createdAt: new Date().toISOString() };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog({ action: 'Department Created', userId: 'system', userName: 'System', details: `Created department: ${dept.name}` });
  };

  const deleteDepartment = (id: string) => {
    const dept = departments.find(d => d.id === id);
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog({ action: 'Department Deleted', userId: 'system', userName: 'System', details: `Deleted department: ${dept?.name}` });
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  // Courses
  const addCourse = (course: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = { ...course, id: generateId(), createdAt: new Date().toISOString() };
    setCourses(prev => [...prev, newCourse]);
    addAuditLog({ action: 'Course Created', userId: 'system', userName: 'System', details: `Created course: ${course.name}` });
  };

  const deleteCourse = (id: string) => {
    const course = courses.find(c => c.id === id);
    setCourses(prev => prev.filter(c => c.id !== id));
    addAuditLog({ action: 'Course Deleted', userId: 'system', userName: 'System', details: `Deleted course: ${course?.name}` });
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  // Resources
  const addResource = (resource: Omit<Resource, 'id' | 'date'>) => {
    const newResource: Resource = { ...resource, id: generateId(), date: new Date().toISOString().split('T')[0] };
    setResources(prev => [...prev, newResource]);
    addAuditLog({ action: 'Resource Uploaded', userId: resource.uploaderId, userName: resource.uploaderName, details: `Uploaded: ${resource.title}` });
  };

  const deleteResource = (id: string) => {
    const resource = resources.find(r => r.id === id);
    setResources(prev => prev.filter(r => r.id !== id));
    addAuditLog({ action: 'Resource Deleted', userId: 'system', userName: 'System', details: `Deleted resource: ${resource?.title}` });
  };

  const updateResource = (id: string, data: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = { ...ann, id: generateId(), date: new Date().toISOString().split('T')[0] };
    setAnnouncements(prev => [...prev, newAnn]);
    addAuditLog({ action: 'Announcement Created', userId: ann.authorId, userName: ann.authorName, details: `Created announcement: ${ann.title}` });
  };

  const deleteAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addAuditLog({ action: 'Announcement Deleted', userId: 'system', userName: 'System', details: `Deleted announcement: ${ann?.title}` });
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  // Community
  const addCommunityMessage = (msg: Omit<CommunityMessage, 'id' | 'time' | 'likes' | 'replies'>) => {
    const newMsg: CommunityMessage = { ...msg, id: generateId(), time: 'Just now', likes: 0, replies: 0 };
    setCommunityMessages(prev => [newMsg, ...prev]);
  };

  const deleteCommunityMessage = (id: string) => {
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

  // Notifications
  const addNotification = (notif: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = { ...notif, id: generateId(), time: 'Just now', read: false };
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

  return (
    <DataContext.Provider value={{
      users, addUser, updateUser, deleteUser, getUserById, getUsersByRole,
      departments, addDepartment, deleteDepartment, updateDepartment,
      courses, addCourse, deleteCourse, updateCourse,
      resources, addResource, deleteResource, updateResource,
      announcements, addAnnouncement, deleteAnnouncement, updateAnnouncement,
      communityMessages, addCommunityMessage, deleteCommunityMessage, togglePinMessage,
      quizzes, addQuiz, deleteQuiz, updateQuiz,
      notifications, addNotification, markNotificationRead, markAllRead,
      auditLogs, addAuditLog,
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
