import type { UserRole as DbUserRole } from '../../types/database';

export type AppUserRole = 'admin' | 'faculty' | 'student' | 'consultant';

export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface UserAccessPermissions {
  resources: boolean;
  branch: boolean;
  courses: boolean;
  quizzes: boolean;
  announcements: boolean;
  notifications: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  avatar: string;
  department?: string;
  status: AccountStatus;
  accessPermissions?: UserAccessPermissions;
  createdAt: string;
  targetExam?: string;
  batch?: string;
  dbRole?: DbUserRole;
  studentId?: string;
  facultyId?: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: AppUserRole;
  department?: string;
  targetExam?: string;
  batch?: string;
  status?: AccountStatus;
  accessPermissions?: UserAccessPermissions;
  autoLogin?: boolean;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
