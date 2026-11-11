/**
 * Application Navigation Configuration
 * Defines bottom navigation tabs for each user role.
 */

export interface NavItem {
  id: string;
  icon: string;
  label: string;
}

export const studentNavItems: NavItem[] = [
  { id: 'home', icon: 'fa-home', label: 'Home' },
  { id: 'courses', icon: 'fa-book', label: 'Courses' },
  { id: 'resources', icon: 'fa-folder', label: 'Resources' },
  { id: 'community', icon: 'fa-comments', label: 'Community' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

export const facultyNavItems: NavItem[] = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'courses', icon: 'fa-book', label: 'Courses' },
  { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload' },
  { id: 'create-quiz', icon: 'fa-clipboard-list', label: 'Quiz' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'users', icon: 'fa-users', label: 'Users' },
  { id: 'courses', icon: 'fa-book-medical', label: 'Courses' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

