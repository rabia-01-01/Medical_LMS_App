import { useState, useEffect, useCallback } from 'react';
import { adminService } from './adminService';
import { AdminSystemMetrics, AdminAuditRecord } from './types';
import { useData } from '../../context/DataContext';

export function useAdmin() {
  const { users, courses, resources, quizzes, auditLogs: contextAuditLogs } = useData();

  const [metrics, setMetrics] = useState<AdminSystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([]);

  const refreshMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getSystemMetrics({
        users,
        courses,
        resources,
        quizzes,
        localAuditLogsCount: contextAuditLogs.length,
      });
      setMetrics(result);
    } catch (e) {
      console.warn('[useAdmin] Error refreshing metrics:', e);
    } finally {
      setLoading(false);
    }
  }, [users, courses, resources, quizzes, contextAuditLogs]);

  const loadAuditLogs = useCallback(async (actionFilter?: string, search?: string) => {
    try {
      const list = await adminService.fetchAuditLogs({ actionFilter, search });
      setAuditLogs(list);
    } catch (e) {
      console.warn('[useAdmin] Error loading audit logs:', e);
    }
  }, []);

  useEffect(() => {
    refreshMetrics();
    loadAuditLogs();
  }, [refreshMetrics, loadAuditLogs]);

  return {
    metrics,
    loading,
    refreshMetrics,
    auditLogs,
    loadAuditLogs,
    moderateResource: adminService.moderateResource.bind(adminService),
    exportAuditLogs: adminService.exportAuditLogs.bind(adminService),
  };
}
