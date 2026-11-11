import type { AppUserRole } from '../features/auth/types';
import type { AccessModuleKey } from '../features/auth/accessControl';

/**
 * Application Navigation Configuration
 * Defines bottom navigation tabs and optional module permission bindings for each role.
 */

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  module?: AccessModuleKey;
  locked?: boolean;
}

export const studentNavItems: NavItem[] = [
  { id: 'home', icon: 'fa-home', label: 'Home' },
  { id: 'courses', icon: 'fa-book', label: 'Courses', module: 'courses' },
  { id: 'resources', icon: 'fa-folder', label: 'Resources', module: 'resources' },
  { id: 'community', icon: 'fa-comments', label: 'Community' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

export const facultyNavItems: NavItem[] = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'courses', icon: 'fa-layer-group', label: 'Curriculum', module: 'courses' },
  { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload', module: 'resources' },
  { id: 'create-quiz', icon: 'fa-clipboard-list', label: 'Quiz', module: 'quizzes' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'users', icon: 'fa-users', label: 'Users' },
  { id: 'courses', icon: 'fa-book-medical', label: 'Courses' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

export const consultantNavItems: NavItem[] = [
  { id: 'dashboard', icon: 'fa-tasks', label: 'Pipeline' },
  { id: 'community', icon: 'fa-comments', label: 'Channel' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts', module: 'notifications' },
  { id: 'profile', icon: 'fa-user-tie', label: 'Profile' },
];

export const ROLE_NAV_ITEMS: Record<AppUserRole, NavItem[]> = {
  student: studentNavItems,
  faculty: facultyNavItems,
  admin: adminNavItems,
  consultant: consultantNavItems,
};

export function getNavItemsForRole(role?: string | null): NavItem[] {
  if (role === 'admin') return ROLE_NAV_ITEMS.admin;
  if (role === 'faculty') return ROLE_NAV_ITEMS.faculty;
  if (role === 'consultant') return ROLE_NAV_ITEMS.consultant;
  return ROLE_NAV_ITEMS.student;
}
