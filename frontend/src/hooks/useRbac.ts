import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildRbacSnapshot, type RbacSnapshot, type RbacUserLike } from '../features/auth/rbac';

/**
 * Memoized React hook returning an O(1) RBAC snapshot for the active user
 * (respecting Admin "View As" impersonation automatically via useAuth()).
 */
export function useRbac(userOverride?: RbacUserLike | null): RbacSnapshot {
  const { user } = useAuth();
  const targetUser = userOverride !== undefined ? userOverride : user;

  const id = targetUser?.id || '';
  const role = targetUser?.role || '';
  const status = targetUser?.status || '';
  const p = targetUser?.accessPermissions;
  const pResources = p?.resources;
  const pBranch = p?.branch;
  const pCourses = p?.courses;
  const pQuizzes = p?.quizzes;
  const pAnnouncements = p?.announcements;
  const pNotifications = p?.notifications;

  return useMemo(
    () => buildRbacSnapshot(targetUser),
    // Depend only on primitive RBAC-determining fields so unrelated object churn stays O(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, role, status, pResources, pBranch, pCourses, pQuizzes, pAnnouncements, pNotifications]
  );
}

