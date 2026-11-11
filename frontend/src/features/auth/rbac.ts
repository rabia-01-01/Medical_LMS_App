import type { AccountStatus, AppUserRole, UserAccessPermissions } from './types';
import {
  type AccessModuleKey,
  FULL_USER_PERMISSIONS,
  EMPTY_USER_PERMISSIONS,
  normalizePermissions,
} from './accessControl';
import { getNavItemsForRole, type NavItem } from '../../config/navigation';

/**
 * Optimized Frontend Role-Based Access Control (RBAC) Engine
 *
 * Precomputes static O(1) role-capability Sets and centralized screen policies so
 * UI routes, tabs, and interactive actions share one deterministic source of truth.
 */

export type PermissionCapability =
  | 'dashboard:view'
  | 'users:manage'
  | 'users:approve'
  | 'users:add'
  | 'users:impersonate'
  | 'branch:view'
  | 'branch:manage'
  | 'courses:view'
  | 'courses:manage'
  | 'courses:enroll_others'
  | 'courses:self_enroll'
  | 'resources:view'
  | 'resources:upload'
  | 'resources:edit_notes'
  | 'resources:delete'
  | 'quizzes:view'
  | 'quizzes:take'
  | 'quizzes:create'
  | 'quizzes:manage'
  | 'submissions:view'
  | 'ai:mcq_generate'
  | 'ai:chatbot'
  | 'announcements:view'
  | 'announcements:publish'
  | 'calendar:manage'
  | 'notifications:view'
  | 'notifications:send'
  | 'community:view'
  | 'community:post'
  | 'community:reply'
  | 'community:moderate'
  | 'consultancy:student_portal'
  | 'consultancy:manage_pipeline'
  | 'consultancy:verify_docs'
  | 'analytics:view'
  | 'audit:view'
  | 'settings:manage'
  | 'docs:manage';

export interface RbacUserLike {
  id?: string;
  role?: AppUserRole | string;
  status?: AccountStatus;
  accessPermissions?: Partial<UserAccessPermissions> | null;
}

export interface ScreenRbacPolicy {
  allowedRoles: ReadonlySet<AppUserRole>;
  module?: AccessModuleKey;
  anyOfModules?: readonly AccessModuleKey[];
  capability?: PermissionCapability;
  anyOfCapabilities?: readonly PermissionCapability[];
  label: string;
}

export interface ScreenAccessDecision {
  allowed: boolean;
  reason: 'ok' | 'unauthenticated' | 'pending_or_suspended' | 'role_forbidden' | 'module_restricted' | 'missing_capability';
  label: string;
  deniedMessage?: string;
}

export interface RbacSnapshot {
  user: RbacUserLike | null | undefined;
  role: AppUserRole | null;
  isApproved: boolean;
  permissions: UserAccessPermissions;
  capabilities: ReadonlySet<PermissionCapability>;
  modules: Record<AccessModuleKey, boolean>;
  can: (capability: PermissionCapability) => boolean;
  canAny: (...capabilities: PermissionCapability[]) => boolean;
  hasModule: (moduleKey: AccessModuleKey) => boolean;
  canOpenScreen: (screenId: string) => ScreenAccessDecision;
  navItems: NavItem[];
  defaultScreen: string;
}

const VALID_ROLES: ReadonlySet<string> = new Set<AppUserRole>([
  'admin',
  'faculty',
  'student',
  'consultant',
]);

const ALL_ROLES = new Set<AppUserRole>(['admin', 'faculty', 'student', 'consultant']);
const ADMIN_ONLY = new Set<AppUserRole>(['admin']);
const FACULTY_ONLY = new Set<AppUserRole>(['faculty']);
const STUDENT_ONLY = new Set<AppUserRole>(['student']);
const FACULTY_OR_ADMIN = new Set<AppUserRole>(['faculty', 'admin']);
const STUDENT_OR_FACULTY = new Set<AppUserRole>(['student', 'faculty']);
const ACADEMIC_ROLES = new Set<AppUserRole>(['student', 'faculty', 'admin']);
const STAFF_OR_CONSULTANT = new Set<AppUserRole>(['faculty', 'admin', 'consultant']);

/**
 * Static O(1) capability sets per role.
 * Admin retains governance/moderation, Student retains learning/take-quiz/consultancy opt-in,
 * Faculty retains curriculum/upload/quiz-authoring/grading without student-enrollment or deletion rights,
 * Consultant retains consular pipeline/verification/alerts/community.
 */
export const ROLE_CAPABILITIES: Record<AppUserRole, ReadonlySet<PermissionCapability>> = {
  admin: new Set<PermissionCapability>([
    'dashboard:view',
    'users:manage',
    'users:approve',
    'users:add',
    'users:impersonate',
    'branch:view',
    'branch:manage',
    'courses:view',
    'courses:manage',
    'courses:enroll_others',
    'resources:view',
    'resources:upload',
    'resources:edit_notes',
    'resources:delete',
    'quizzes:view',
    'quizzes:manage',
    'submissions:view',
    'ai:mcq_generate',
    'ai:chatbot',
    'announcements:view',
    'announcements:publish',
    'calendar:manage',
    'notifications:view',
    'notifications:send',
    'community:view',
    'community:post',
    'community:reply',
    'community:moderate',
    'consultancy:verify_docs',
    'analytics:view',
    'audit:view',
    'settings:manage',
    'docs:manage',
  ]),
  faculty: new Set<PermissionCapability>([
    'dashboard:view',
    'branch:view',
    'courses:view',
    'resources:view',
    'resources:upload',
    'resources:edit_notes',
    'quizzes:view',
    'quizzes:create',
    'quizzes:manage',
    'submissions:view',
    'ai:mcq_generate',
    'announcements:view',
    'announcements:publish',
    'calendar:manage',
    'notifications:view',
    'community:view',
    'community:post',
    'community:reply',
    'analytics:view',
  ]),
  student: new Set<PermissionCapability>([
    'dashboard:view',
    'branch:view',
    'courses:view',
    'courses:self_enroll',
    'resources:view',
    'quizzes:view',
    'quizzes:take',
    'ai:chatbot',
    'announcements:view',
    'notifications:view',
    'community:view',
    'community:post',
    'community:reply',
    'consultancy:student_portal',
    'analytics:view',
  ]),
  consultant: new Set<PermissionCapability>([
    'dashboard:view',
    'notifications:view',
    'community:view',
    'community:post',
    'community:reply',
    'consultancy:manage_pipeline',
    'consultancy:verify_docs',
    'docs:manage',
    'ai:chatbot',
  ]),
};

/**
 * Links granular capabilities to Admin-granted user module gates (`UserAccessPermissions`).
 */
export const CAPABILITY_MODULE_REQUIREMENT: Partial<Record<PermissionCapability, AccessModuleKey>> = {
  'branch:view': 'branch',
  'courses:view': 'courses',
  'courses:self_enroll': 'courses',
  'resources:view': 'resources',
  'resources:upload': 'resources',
  'quizzes:view': 'quizzes',
  'quizzes:take': 'quizzes',
  'quizzes:create': 'quizzes',
  'submissions:view': 'quizzes',
  'announcements:view': 'announcements',
  'announcements:publish': 'announcements',
  'calendar:manage': 'announcements',
  'notifications:view': 'notifications',
  'notifications:send': 'notifications',
};

/**
 * Single authoritative screen route policy registry.
 * Prevents cross-role route leakage AND enforces per-module permissions in O(1) lookup time.
 */
export const SCREEN_RBAC_POLICIES: Record<string, ScreenRbacPolicy> = {
  home: { allowedRoles: STUDENT_ONLY, label: 'Student Home' },
  dashboard: { allowedRoles: STAFF_OR_CONSULTANT, label: 'Dashboard' },
  profile: { allowedRoles: ALL_ROLES, label: 'Profile' },
  community: { allowedRoles: ALL_ROLES, capability: 'community:view', label: 'Community Forum' },
  help: { allowedRoles: ALL_ROLES, label: 'Help & Support' },
  about: { allowedRoles: ALL_ROLES, label: 'About Platform' },

  // Academic Curriculum & Courses
  departments: { allowedRoles: ACADEMIC_ROLES, module: 'branch', capability: 'branch:view', label: 'Branch / Batches' },
  courses: { allowedRoles: ACADEMIC_ROLES, module: 'courses', capability: 'courses:view', label: 'Courses & Curriculum' },
  'course-detail': { allowedRoles: ACADEMIC_ROLES, module: 'courses', capability: 'courses:view', label: 'Courses & Curriculum' },

  // Learning Resources
  resources: { allowedRoles: ACADEMIC_ROLES, module: 'resources', capability: 'resources:view', label: 'Learning Resources' },
  'resource-view': {
    allowedRoles: ACADEMIC_ROLES,
    anyOfModules: ['resources', 'courses'],
    anyOfCapabilities: ['resources:view', 'courses:view'],
    label: 'Learning Resources',
  },
  'faculty-resources': { allowedRoles: FACULTY_ONLY, module: 'resources', capability: 'resources:upload', label: 'Faculty Resources' },
  upload: { allowedRoles: FACULTY_OR_ADMIN, module: 'resources', capability: 'resources:upload', label: 'Upload Learning Resource' },

  // Examinations & Quizzes
  quizzes: { allowedRoles: ACADEMIC_ROLES, module: 'quizzes', capability: 'quizzes:view', label: 'Quizzes & Examinations' },
  'quiz-detail': { allowedRoles: STUDENT_OR_FACULTY, module: 'quizzes', capability: 'quizzes:view', label: 'Quizzes & Examinations' },
  'active-quiz': { allowedRoles: STUDENT_ONLY, module: 'quizzes', capability: 'quizzes:take', label: 'Active Assessment' },
  'quiz-results': { allowedRoles: STUDENT_OR_FACULTY, module: 'quizzes', capability: 'quizzes:view', label: 'Assessment Results' },
  'create-quiz': { allowedRoles: FACULTY_OR_ADMIN, module: 'quizzes', label: 'Create Assessment' },
  submissions: { allowedRoles: FACULTY_ONLY, module: 'quizzes', capability: 'submissions:view', label: 'Student Submissions' },
  'ai-mcq': { allowedRoles: FACULTY_OR_ADMIN, capability: 'ai:mcq_generate', label: 'AI MCQ Generator' },

  // Communications & Alerts
  announcements: { allowedRoles: ACADEMIC_ROLES, module: 'announcements', capability: 'announcements:view', label: 'Announcements' },
  calendar: { allowedRoles: ACADEMIC_ROLES, module: 'announcements', capability: 'announcements:view', label: 'Academic Calendar' },
  notifications: { allowedRoles: ALL_ROLES, module: 'notifications', capability: 'notifications:view', label: 'Notifications' },
  'send-announcement': { allowedRoles: ADMIN_ONLY, capability: 'announcements:publish', label: 'Send Announcement' },
  'send-notification': { allowedRoles: ADMIN_ONLY, capability: 'notifications:send', label: 'Send Notification' },

  // Student Progress & Analytics
  progress: { allowedRoles: STUDENT_ONLY, capability: 'analytics:view', label: 'Course Progress' },
  analytics: { allowedRoles: ACADEMIC_ROLES, capability: 'analytics:view', label: 'Performance Analytics' },

  // Admin Governance
  users: { allowedRoles: ADMIN_ONLY, capability: 'users:manage', label: 'User Management' },
  'add-user': { allowedRoles: ADMIN_ONLY, capability: 'users:add', label: 'Create User' },
  'audit-logs': { allowedRoles: ADMIN_ONLY, capability: 'audit:view', label: 'Audit Logs' },
  settings: { allowedRoles: ADMIN_ONLY, capability: 'settings:manage', label: 'System Settings' },
  'impersonation-history': { allowedRoles: ADMIN_ONLY, capability: 'users:impersonate', label: 'Impersonation History' },
};

/**
 * Derived module permission map for screens (keeps backwards compatibility without duplication).
 */
export const SCREEN_MODULE_MAP: Record<string, { module: AccessModuleKey; label: string }> = Object.fromEntries(
  Object.entries(SCREEN_RBAC_POLICIES)
    .filter((entry): entry is [string, ScreenRbacPolicy & { module: AccessModuleKey }] => Boolean(entry[1].module))
    .map(([screenId, policy]) => [screenId, { module: policy.module, label: policy.label }])
);

export function isValidRole(role?: string | null): role is AppUserRole {
  return Boolean(role && VALID_ROLES.has(role));
}

export function getRoleDefaultScreen(role?: string | null): string {
  return role === 'student' ? 'home' : 'dashboard';
}

/**
 * Computes effective UserAccessPermissions once per user state.
 */
export function resolveEffectivePermissions(user?: RbacUserLike | null): UserAccessPermissions {
  if (!user) return { ...EMPTY_USER_PERMISSIONS };
  if (user.role === 'admin') return { ...FULL_USER_PERMISSIONS };
  if (user.status !== 'active') return { ...EMPTY_USER_PERMISSIONS };
  if (!user.accessPermissions) return { ...FULL_USER_PERMISSIONS };
  return normalizePermissions(user.accessPermissions, true);
}

/**
 * Computes effective capability Set taking into account:
 * 1. Role capabilities
 * 2. Active account status (admin bypasses)
 * 3. Admin-granted module permissions for module-bound capabilities
 */
export function resolveCapabilitySet(
  user?: RbacUserLike | null,
  precomputedPermissions?: UserAccessPermissions
): ReadonlySet<PermissionCapability> {
  if (!user || !isValidRole(user.role)) return new Set<PermissionCapability>();
  if (user.role !== 'admin' && user.status !== 'active') return new Set<PermissionCapability>();

  const baseCaps = ROLE_CAPABILITIES[user.role];
  if (user.role === 'admin') return baseCaps;

  const perms = precomputedPermissions || resolveEffectivePermissions(user);
  const filtered = new Set<PermissionCapability>();

  for (const cap of baseCaps) {
    const reqModule = CAPABILITY_MODULE_REQUIREMENT[cap];
    if (!reqModule || perms[reqModule]) {
      filtered.add(cap);
    }
  }

  return filtered;
}

export function hasCapability(
  user: RbacUserLike | null | undefined,
  capability: PermissionCapability
): boolean {
  if (!user || !isValidRole(user.role)) return false;
  if (user.role === 'admin') return ROLE_CAPABILITIES.admin.has(capability);
  if (user.status !== 'active') return false;
  if (!ROLE_CAPABILITIES[user.role].has(capability)) return false;

  const reqModule = CAPABILITY_MODULE_REQUIREMENT[capability];
  if (!reqModule) return true;
  if (!user.accessPermissions) return true;
  return Boolean(user.accessPermissions[reqModule]);
}

export function hasAnyCapability(
  user: RbacUserLike | null | undefined,
  capabilities: readonly PermissionCapability[]
): boolean {
  return capabilities.some((cap) => hasCapability(user, cap));
}

export function evaluateScreenAccess(
  user: RbacUserLike | null | undefined,
  screenId: string,
  precomputedPermissions?: UserAccessPermissions,
  precomputedCapabilities?: ReadonlySet<PermissionCapability>
): ScreenAccessDecision {
  const policy = SCREEN_RBAC_POLICIES[screenId];
  const label = policy?.label || 'Requested Module';

  if (!user || !isValidRole(user.role)) {
    return {
      allowed: false,
      reason: 'unauthenticated',
      label,
      deniedMessage: 'Please sign in to access this page.',
    };
  }

  if (user.role !== 'admin' && user.status !== 'active') {
    return {
      allowed: false,
      reason: 'pending_or_suspended',
      label,
      deniedMessage: 'Your account awaits Administrator approval before accessing portal modules.',
    };
  }

  if (!policy) {
    return { allowed: true, reason: 'ok', label };
  }

  if (!policy.allowedRoles.has(user.role)) {
    return {
      allowed: false,
      reason: 'role_forbidden',
      label,
      deniedMessage: `This view (${label}) is not permitted for your ${user.role} role.`,
    };
  }

  if (user.role === 'admin') {
    if (policy.capability && !ROLE_CAPABILITIES.admin.has(policy.capability)) {
      return {
        allowed: false,
        reason: 'missing_capability',
        label,
        deniedMessage: `${label} requires a role capability not assigned to Administrators.`,
      };
    }
    return { allowed: true, reason: 'ok', label };
  }

  const perms = precomputedPermissions || resolveEffectivePermissions(user);

  if (policy.module && !perms[policy.module]) {
    return {
      allowed: false,
      reason: 'module_restricted',
      label,
      deniedMessage: `Your account does not currently have Administrator permission to access ${label}.`,
    };
  }

  if (policy.anyOfModules && !policy.anyOfModules.some((m) => perms[m])) {
    return {
      allowed: false,
      reason: 'module_restricted',
      label,
      deniedMessage: `Your account does not currently have Administrator permission to access ${label}.`,
    };
  }

  if (policy.capability) {
    const hasCap = precomputedCapabilities
      ? precomputedCapabilities.has(policy.capability)
      : hasCapability(user, policy.capability);
    if (!hasCap) {
      return {
        allowed: false,
        reason: 'missing_capability',
        label,
        deniedMessage: `You do not have sufficient permissions for ${label}.`,
      };
    }
  }

  if (policy.anyOfCapabilities && policy.anyOfCapabilities.length > 0) {
    const hasAnyCap = precomputedCapabilities
      ? policy.anyOfCapabilities.some((cap) => precomputedCapabilities.has(cap))
      : hasAnyCapability(user, policy.anyOfCapabilities);
    if (!hasAnyCap) {
      return {
        allowed: false,
        reason: 'missing_capability',
        label,
        deniedMessage: `You do not have sufficient permissions for ${label}.`,
      };
    }
  }

  return { allowed: true, reason: 'ok', label };
}

export function canAccessScreen(
  user: RbacUserLike | null | undefined,
  screenId: string
): boolean {
  return evaluateScreenAccess(user, screenId).allowed;
}

export function getAuthorizedNavItems(
  user?: RbacUserLike | null,
  precomputedPermissions?: UserAccessPermissions
): NavItem[] {
  const rawItems = getNavItemsForRole(user?.role);
  if (!user || user.role === 'admin') {
    return rawItems.map((item) => ({ ...item, locked: false }));
  }
  const perms = precomputedPermissions || resolveEffectivePermissions(user);
  return rawItems.map((item) => ({
    ...item,
    locked: Boolean(item.module && !perms[item.module]),
  }));
}

/**
 * Builds a memoizable O(1) RBAC snapshot for the active user session.
 */
export function buildRbacSnapshot(user?: RbacUserLike | null): RbacSnapshot {
  const role: AppUserRole | null = isValidRole(user?.role) ? user.role : null;
  const isApproved = role === 'admin' || user?.status === 'active';
  const permissions = resolveEffectivePermissions(user);
  const capabilities = resolveCapabilitySet(user, permissions);
  const defaultScreen = getRoleDefaultScreen(role);
  const navItems = getAuthorizedNavItems(user, permissions);

  return {
    user,
    role,
    isApproved,
    permissions,
    capabilities,
    modules: permissions,
    can: (capability: PermissionCapability) => capabilities.has(capability),
    canAny: (...caps: PermissionCapability[]) => caps.some((c) => capabilities.has(c)),
    hasModule: (moduleKey: AccessModuleKey) => Boolean(permissions[moduleKey]),
    canOpenScreen: (screenId: string) => evaluateScreenAccess(user, screenId, permissions, capabilities),
    navItems,
    defaultScreen,
  };
}
