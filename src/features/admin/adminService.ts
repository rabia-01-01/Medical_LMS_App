import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AdminSystemMetrics, AdminAuditRecord, AuditSeverity } from './types';
import { User, Course, Resource, Quiz } from '../../context/DataContext';

const LOCAL_AUDIT_LOGS_KEY = 'lms_admin_audit_logs_v1';

export class AdminService {
  /**
   * Helper to retrieve persistent local audit logs
   */
  private getLocalAuditLogs(): AdminAuditRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_AUDIT_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Helper to persist audit logs locally
   */
  private saveLocalAuditLogs(logs: AdminAuditRecord[]): void {
    try {
      localStorage.setItem(LOCAL_AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
    } catch (e) {
      console.warn('[AdminService] Failed to save local audit logs:', e);
    }
  }

  /**
   * Ping database and aggregate platform operational metrics
   */
  async getSystemMetrics(context: {
    users: User[];
    courses: Course[];
    resources: Resource[];
    quizzes: Quiz[];
    localAuditLogsCount: number;
  }): Promise<AdminSystemMetrics> {
    const startTime = performance.now();
    let dbConnected = false;
    let latencyMs = 0;

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        latencyMs = Math.round(performance.now() - startTime);
        dbConnected = !error;
      } catch {
        dbConnected = false;
        latencyMs = Math.round(performance.now() - startTime);
      }
    }

    const { users, courses, resources, quizzes } = context;

    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalFaculty = users.filter(u => u.role === 'faculty').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const suspendedUsers = users.filter(u => u.status !== 'active').length;

    const publishedResources = resources.filter(r => r.status === 'published').length;
    const draftResources = resources.filter(r => r.status === 'draft').length;
    const archivedResources = (resources as any[]).filter(r => r.status === 'archived').length;

    // Estimate attempts & accuracy from local storage records
    let totalAttempts = 0;
    let accuracySum = 0;
    try {
      const rawAttempts = localStorage.getItem('lms_attempts_history_v1');
      if (rawAttempts) {
        const list = JSON.parse(rawAttempts);
        totalAttempts = list.length;
        list.forEach((item: any) => {
          if (item.accuracy != null) accuracySum += Number(item.accuracy);
        });
      }
    } catch {
      // Fallback
    }

    const avgAccuracy = totalAttempts > 0 ? Math.round(accuracySum / totalAttempts) : 78;

    return {
      totalUsers: users.length,
      totalStudents,
      totalFaculty,
      totalAdmins,
      activeUsers,
      suspendedUsers,
      totalCourses: courses.length,
      totalDepartments: 6,
      totalResources: resources.length,
      publishedResources,
      draftResources,
      archivedResources,
      totalAssessments: quizzes.length,
      totalAttempts,
      averageAccuracy: avgAccuracy,
      dbConnected,
      dbLatencyMs: latencyMs,
      systemStatus: dbConnected ? 'HEALTHY' : 'DEGRADED',
      lastChecked: new Date().toLocaleTimeString(),
    };
  }

  /**
   * Record an administrative audit log in PostgreSQL and local fallback
   */
  async recordAuditLog(
    entry: Omit<AdminAuditRecord, 'id' | 'timestamp'>
  ): Promise<AdminAuditRecord> {
    const newRecord: AdminAuditRecord = {
      ...entry,
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    // 1. Try Supabase audit_logs table
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('audit_logs').insert([{
          action: entry.action,
          entity_type: entry.entityType || 'SYSTEM',
          entity_id: entry.entityId,
          metadata: {
            details: entry.details,
            userId: entry.userId,
            userName: entry.userName,
            severity: entry.severity,
            ...(entry.metadata || {}),
          },
        }]);
      } catch (err) {
        console.warn('[AdminService] Supabase audit log insert fallback:', err);
      }
    }

    // 2. Persist locally
    const current = this.getLocalAuditLogs();
    const updated = [newRecord, ...current];
    this.saveLocalAuditLogs(updated);

    return newRecord;
  }

  /**
   * Fetch audit logs with filtering capability
   */
  async fetchAuditLogs(options?: {
    actionFilter?: string;
    search?: string;
    limit?: number;
  }): Promise<AdminAuditRecord[]> {
    let logs = this.getLocalAuditLogs();

    // Query Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(options?.limit || 100);

        if (!error && data && data.length > 0) {
          const mapped: AdminAuditRecord[] = data.map(row => {
            const meta = (row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
              ? row.metadata
              : {}) as Record<string, any>;

            return {
              id: row.id,
              action: row.action,
              entityType: row.entity_type,
              entityId: row.entity_id,
              userId: meta.userId || row.actor_id || 'system',
              userName: meta.userName || 'Platform System',
              details: meta.details || row.action,
              timestamp: row.created_at,
              severity: (meta.severity as AuditSeverity) || 'info',
              metadata: meta,
            };
          });
          logs = mapped;
        }
      } catch (e) {
        // Fall back to local logs
      }
    }

    if (options?.actionFilter && options.actionFilter !== 'all') {
      const f = options.actionFilter.toLowerCase();
      logs = logs.filter(l => l.action.toLowerCase().includes(f));
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q)
      );
    }

    return logs;
  }

  /**
   * Content governance: update resource status (PUBLISHED, DRAFT, ARCHIVED)
   */
  async moderateResource(
    resourceId: string,
    status: 'published' | 'draft' | 'archived',
    moderatedBy: { id: string; name: string },
    note?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (isSupabaseConfigured()) {
        const dbStatus = status === 'published' ? 'PUBLISHED' : status === 'draft' ? 'DRAFT' : 'ARCHIVED';
        await supabase
          .from('resources')
          .update({ status: dbStatus })
          .eq('id', resourceId);
      }

      await this.recordAuditLog({
        action: `Resource ${status.toUpperCase()}`,
        entityType: 'RESOURCE',
        entityId: resourceId,
        userId: moderatedBy.id,
        userName: moderatedBy.name,
        details: `Resource ${resourceId} status changed to ${status}${note ? ` (Note: ${note})` : ''}`,
        severity: status === 'archived' ? 'warning' : 'info',
      });

      return { success: true, message: `Resource marked as ${status}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to moderate resource' };
    }
  }

  /**
   * Export all audit logs to a JSON file download for compliance
   */
  exportAuditLogs(logs: AdminAuditRecord[]): void {
    try {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sultanat-medica-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[AdminService] Export audit logs failed:', e);
    }
  }
}

export const adminService = new AdminService();
