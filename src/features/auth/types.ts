import type { UserRole as DbUserRole } from '../../types/database';

export type AppUserRole = 'admin' | 'faculty' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  avatar: string;
  department?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  targetExam?: string;
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
