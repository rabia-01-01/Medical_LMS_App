import type { UserAccessPermissions, AccountStatus } from './types';

export type AccessModuleKey = keyof UserAccessPermissions;

export const FULL_USER_PERMISSIONS: UserAccessPermissions = {
  resources: true,
  branch: true,
  courses: true,
  quizzes: true,
  announcements: true,
  notifications: true,
};

export const EMPTY_USER_PERMISSIONS: UserAccessPermissions = {
  resources: false,
  branch: false,
  courses: false,
  quizzes: false,
  announcements: false,
  notifications: false,
};

export const RESOURCE_ACCESS_MODULES: {
  key: AccessModuleKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}[] = [
  {
    key: 'resources',
    label: 'Learning Resources',
    shortLabel: 'Resources',
    description: 'Notes, PDFs, DPPs, PYQs & video materials',
    icon: 'fa-folder-open',
  },
  {
    key: 'branch',
    label: 'Branch / Batches',
    shortLabel: 'Branch',
    description: 'Academic cohort batches & branch schedules',
    icon: 'fa-layer-group',
  },
  {
    key: 'courses',
    label: 'Courses & Curriculum',
    shortLabel: 'Courses',
    description: 'Courses & 7-subject syllabus hierarchy',
    icon: 'fa-book-medical',
  },
  {
    key: 'quizzes',
    label: 'Quizzes & Examinations',
    shortLabel: 'Quizzes',
    description: 'Assessments, mock tests, DPPs & results',
    icon: 'fa-clipboard-check',
  },
  {
    key: 'announcements',
    label: 'Announcements & Calendar',
    shortLabel: 'Announcements',
    description: 'Official broadcasts & academic calendar events',
    icon: 'fa-bullhorn',
  },
  {
    key: 'notifications',
    label: 'Notifications & Alerts',
    shortLabel: 'Notifications',
    description: 'Real-time alerts & system notifications',
    icon: 'fa-bell',
  },
];

export function normalizePermissions(
  perms?: Partial<UserAccessPermissions> | null,
  fallbackAllowed = false
): UserAccessPermissions {
  if (!perms) {
    return fallbackAllowed ? { ...FULL_USER_PERMISSIONS } : { ...EMPTY_USER_PERMISSIONS };
  }
  return {
    resources: perms.resources ?? fallbackAllowed,
    branch: perms.branch ?? fallbackAllowed,
    courses: perms.courses ?? fallbackAllowed,
    quizzes: perms.quizzes ?? fallbackAllowed,
    announcements: perms.announcements ?? fallbackAllowed,
    notifications: perms.notifications ?? fallbackAllowed,
  };
}

export function isUserApproved(
  user?: { role?: string; status?: AccountStatus } | null
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.status === 'active';
}

export function hasResourceAccess(
  user: {
    role?: string;
    status?: AccountStatus;
    accessPermissions?: Partial<UserAccessPermissions> | null;
  } | null | undefined,
  moduleKey: AccessModuleKey
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.status !== 'active') return false;
  if (!user.accessPermissions) return true;
  return Boolean(user.accessPermissions[moduleKey]);
}

export function hasAnyPermissionEnabled(
  perms?: Partial<UserAccessPermissions> | null
): boolean {
  if (!perms) return false;
  return RESOURCE_ACCESS_MODULES.some((m) => Boolean(perms[m.key]));
}

