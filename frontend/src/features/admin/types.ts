import { UserRole, ContentStatus } from '../../types/database';

export interface AdminSystemMetrics {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCourses: number;
  totalDepartments: number;
  totalResources: number;
  publishedResources: number;
  draftResources: number;
  archivedResources: number;
  totalAssessments: number;
  totalAttempts: number;
  averageAccuracy: number;
  dbConnected: boolean;
  dbLatencyMs: number;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  lastChecked: string;
}

export interface UserManagementFilter {
  search: string;
  role: 'all' | 'student' | 'faculty' | 'admin';
  status: 'all' | 'active' | 'suspended';
  targetExam?: string;
  department?: string;
}

export type AuditSeverity = 'info' | 'warning' | 'critical' | 'security';

export interface AdminAuditRecord {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string | null;
  userId: string;
  userName: string;
  userRole?: string;
  details: string;
  timestamp: string;
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}

export interface ContentGovernanceFilter {
  search: string;
  status: 'all' | 'published' | 'draft' | 'archived';
  type: string;
  uploaderId?: string;
}

export type DisplayLayoutMode = 'mobile' | 'wide' | 'fullscreen';
