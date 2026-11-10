import React, { useState, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData, hasResourceAccess } from './context/DataContext';
import { BottomNav, AccessRestrictedScreen } from './components/Navigation';
import { SplashScreen, LoginScreen, PendingApprovalScreen } from './screens/AuthScreens';
import type { AccessModuleKey } from './features/auth';
import { StudentHome, StudentCourses, StudentResources, StudentCommunity, StudentProfile, NotificationsScreen, AnnouncementsScreen, AboutScreen, DepartmentsScreen, HelpScreen, CalendarScreen, AnalyticsScreen } from './screens/StudentScreens';
import { QuizList, QuizDetail, ActiveQuiz, QuizResults } from './screens/QuizScreens';
import { FacultyDashboard, FacultyCourses, UploadResource, CreateQuiz, FacultySubmissions, FacultyNotifications, FacultyProfile, FacultyAnnouncements, FacultyCommunity, FacultyResources } from './screens/FacultyScreens';
import { AdminDashboard, AdminUsers, AdminDepartments, AdminCourses, AdminResources, AdminNotifications, AuditLogs, AdminSettings, AdminCommunity, AdminAnnouncements, AddUser, SendAnnouncement, SendNotification } from './screens/AdminScreens';
import { ConsultantDashboard, ConsultantProfile } from './screens/ConsultantScreens';
import { ResourceViewer, CourseDetail } from './screens/ResourceScreens';
import { FullscreenControl, DisplayMode } from './components/FullscreenControl';
import { SecurityShield } from './components/SecurityShield';
import { StudentAIChatbot } from './components/StudentAIChatbot';

const studentNavItems = [
  { id: 'home', icon: 'fa-home', label: 'Home' },
  { id: 'courses', icon: 'fa-book', label: 'Courses' },
  { id: 'resources', icon: 'fa-folder', label: 'Resources' },
  { id: 'community', icon: 'fa-comments', label: 'Community' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

const facultyNavItems = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'courses', icon: 'fa-layer-group', label: 'Curriculum' },
  { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload' },
  { id: 'create-quiz', icon: 'fa-clipboard-list', label: 'Quiz' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

const adminNavItems = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Home' },
  { id: 'users', icon: 'fa-users', label: 'Users' },
  { id: 'courses', icon: 'fa-book-medical', label: 'Courses' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

const consultantNavItems = [
  { id: 'dashboard', icon: 'fa-tasks', label: 'Pipeline' },
  { id: 'community', icon: 'fa-comments', label: 'Channel' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts' },
  { id: 'profile', icon: 'fa-user-tie', label: 'Profile' },
];

const SCREEN_PERMISSION_MAP: Record<string, { module: AccessModuleKey; label: string }> = {
  departments: { module: 'branch', label: 'Batches & Branches' },
  courses: { module: 'courses', label: 'Courses & Curriculum' },
  'course-detail': { module: 'courses', label: 'Courses & Curriculum' },
  resources: { module: 'resources', label: 'Learning Resources' },
  'faculty-resources': { module: 'resources', label: 'Learning Resources' },
  upload: { module: 'resources', label: 'Learning Resources' },
  quizzes: { module: 'quizzes', label: 'Quizzes & Examinations' },
  'quiz-detail': { module: 'quizzes', label: 'Quizzes & Examinations' },
  'active-quiz': { module: 'quizzes', label: 'Quizzes & Examinations' },
  'quiz-results': { module: 'quizzes', label: 'Quizzes & Examinations' },
  'create-quiz': { module: 'quizzes', label: 'Quizzes & Examinations' },
  submissions: { module: 'quizzes', label: 'Quizzes & Examinations' },
  announcements: { module: 'announcements', label: 'Announcements & Calendar' },
  calendar: { module: 'announcements', label: 'Announcements & Calendar' },
  notifications: { module: 'notifications', label: 'Notifications & Alerts' },
};

function AppContent() {
  const { user, isAuthenticated, isLoading, isViewingAs, viewingAsUser, stopViewingAs } = useAuth();
  const { users } = useData();
  const [showSplash, setShowSplash] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('mobile');

  const activeUser = useMemo(() => {
    if (!user) return null;
    const liveMatch = users.find(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );
    return liveMatch ? { ...user, ...liveMatch, password: '' } : user;
  }, [user, users]);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    // Strictly lock display mode to mobile device aspect ratio
    setDisplayMode('mobile');
    try {
      localStorage.setItem('lms_display_mode', 'mobile');
    } catch {}
  };

  const [currentScreen, setCurrentScreen] = useState(() => {
    return user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'consultant' ? 'dashboard' : 'home';
  });
  const [screenData, setScreenData] = useState<any>(null);
  const [screenHistory, setScreenHistory] = useState<string[]>([]);

  // Automatically reset to role-specific entry screen upon authentication or role switch
  React.useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'consultant') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('home');
    }
    setScreenHistory([]);
    setScreenData(null);
  }, [user?.role, user?.id]);

  const handleNavigate = useCallback((screen: string, data?: any) => {
    if (screen === 'quizzes') {
      // Returning to Assessments: prune any quiz-attempt screens from back stack so back leads to home
      setScreenHistory(prev => prev.filter(s => s !== 'active-quiz' && s !== 'quiz-results' && s !== 'quiz-detail' && s !== 'quizzes'));
      setCurrentScreen('quizzes');
      setScreenData(data || null);
      return;
    }
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
    if (data) setScreenData(data);
  }, [currentScreen]);

  const handleBack = useCallback(() => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(h => h.slice(0, -1));
      setCurrentScreen(prev);
      setScreenData(null);
    } else {
      const defaultScreen = user?.role === 'admin' || user?.role === 'faculty' || user?.role === 'consultant' ? 'dashboard' : 'home';
      setCurrentScreen(defaultScreen);
    }
  }, [screenHistory, user]);

  const handleTabChange = useCallback((tab: string) => {
    try {
      sessionStorage.removeItem('lms_curriculum_active_topic');
      sessionStorage.removeItem('lms_curriculum_active_subject');
    } catch {}
    setScreenHistory([]);
    setCurrentScreen(tab);
    setScreenData(null);
  }, []);

  if (showSplash || isLoading) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (!isAuthenticated || !activeUser) return <LoginScreen />;

  const isAccountBlocked = activeUser.role !== 'admin' && activeUser.status !== 'active';

  const navItems = activeUser.role === 'admin'
    ? adminNavItems
    : activeUser.role === 'faculty'
    ? facultyNavItems
    : activeUser.role === 'consultant'
    ? consultantNavItems
    : studentNavItems;
  const isTabScreen = navItems.some(item => item.id === currentScreen);
  const showBottomNav = isTabScreen && !isAccountBlocked;

  const ViewingAsBanner = isViewingAs && (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between text-xs z-50">
      <span><i className="fas fa-user-tag mr-1" /> Viewing as: {viewingAsUser?.name}</span>
      <button onClick={stopViewingAs} className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium">Exit</button>
    </div>
  );

  const renderScreen = () => {
    const permReq = SCREEN_PERMISSION_MAP[currentScreen];
    if (permReq && !hasResourceAccess(activeUser, permReq.module)) {
      return <AccessRestrictedScreen moduleName={permReq.label} onBack={handleBack} />;
    }
    if (
      currentScreen === 'resource-view' &&
      !hasResourceAccess(activeUser, 'resources') &&
      !hasResourceAccess(activeUser, 'courses')
    ) {
      return <AccessRestrictedScreen moduleName="Learning Resources" onBack={handleBack} />;
    }

    // Student screens
    if (user?.role === 'student') {
      switch (currentScreen) {
        case 'home': return <StudentHome onNavigate={handleNavigate} />;
        case 'courses': return <StudentCourses onNavigate={handleNavigate} />;
        case 'resources': return <StudentResources onNavigate={handleNavigate} />;
        case 'community': return <StudentCommunity onNavigate={handleNavigate} />;
        case 'profile': return <StudentProfile onNavigate={handleNavigate} />;
        case 'analytics': return <AnalyticsScreen onBack={handleBack} onNavigate={handleNavigate} />;
        case 'notifications': return <NotificationsScreen onBack={handleBack} />;
        case 'announcements': return <AnnouncementsScreen onBack={handleBack} />;
        case 'about': return <AboutScreen onBack={handleBack} />;
        case 'departments': return <DepartmentsScreen onBack={handleBack} />;
        case 'help': return <HelpScreen onBack={handleBack} />;
        case 'calendar': return <CalendarScreen onBack={handleBack} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'active-quiz': return <ActiveQuiz onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} onNavigate={handleNavigate} quizData={screenData} />;
        case 'resource-view': return <ResourceViewer onBack={handleBack} resource={screenData} />;
        case 'course-detail': return <CourseDetail onBack={handleBack} course={screenData} onNavigate={handleNavigate} />;
        default: return <StudentHome onNavigate={handleNavigate} />;
      }
    }

    // Faculty screens
    if (user?.role === 'faculty') {
      switch (currentScreen) {
        case 'dashboard': return <FacultyDashboard onNavigate={handleNavigate} />;
        case 'courses': return <FacultyCourses onNavigate={handleNavigate} />;
        case 'upload': return <UploadResource onBack={handleBack} />;
        case 'create-quiz': return <CreateQuiz onBack={handleBack} />;
        case 'submissions': return <FacultySubmissions onBack={handleBack} />;
        case 'notifications': return <FacultyNotifications onBack={handleBack} />;
        case 'profile': return <FacultyProfile onNavigate={handleNavigate} />;
        case 'analytics': return <AnalyticsScreen onBack={handleBack} onNavigate={handleNavigate} />;
        case 'announcements': return <FacultyAnnouncements onBack={handleBack} />;
        case 'community': return <FacultyCommunity onBack={handleBack} />;
        case 'help': return <HelpScreen onBack={handleBack} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'active-quiz': return <ActiveQuiz onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} onNavigate={handleNavigate} quizData={screenData} />;
        case 'resource-view': return <ResourceViewer onBack={handleBack} resource={screenData} />;
        case 'course-detail': return <CourseDetail onBack={handleBack} course={screenData} onNavigate={handleNavigate} />;
        case 'faculty-resources': return <FacultyResources onBack={handleBack} onNavigate={handleNavigate} />;
        case 'departments': return <AdminDepartments onBack={handleBack} />;
        default: return <FacultyDashboard onNavigate={handleNavigate} />;
      }
    }

    // Admin screens
    if (user?.role === 'admin') {
      switch (currentScreen) {
        case 'dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
        case 'users': return <AdminUsers onBack={handleBack} onNavigate={handleNavigate} />;
        case 'add-user': return <AddUser onBack={handleBack} />;
        case 'departments': return <AdminDepartments onBack={handleBack} />;
        case 'courses': return <AdminCourses onBack={handleBack} onNavigate={handleNavigate} />;
        case 'resources': return <AdminResources onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'analytics': return <AnalyticsScreen onBack={handleBack} onNavigate={handleNavigate} />;
        case 'announcements': return <AdminAnnouncements onBack={handleBack} onNavigate={handleNavigate} />;
        case 'send-announcement': return <SendAnnouncement onBack={handleBack} />;
        case 'send-notification': return <SendNotification onBack={handleBack} />;
        case 'community': return <AdminCommunity onBack={handleBack} />;
        case 'notifications': return <AdminNotifications onBack={handleBack} onNavigate={handleNavigate} />;
        case 'audit-logs': return <AuditLogs onBack={handleBack} />;
        case 'settings': return <AdminSettings onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'active-quiz': return <ActiveQuiz onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} onNavigate={handleNavigate} quizData={screenData} />;
        case 'resource-view': return <ResourceViewer onBack={handleBack} resource={screenData} />;
        case 'course-detail': return <CourseDetail onBack={handleBack} course={screenData} onNavigate={handleNavigate} />;
        default: return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    // Consultant Agent screens
    if (user?.role === 'consultant') {
      switch (currentScreen) {
        case 'dashboard': return <ConsultantDashboard onNavigate={handleNavigate} onBack={handleBack} />;
        case 'profile': return <ConsultantProfile onNavigate={handleNavigate} />;
        case 'community': return <FacultyCommunity onBack={handleBack} />;
        case 'announcements': return <AnnouncementsScreen onBack={handleBack} />;
        case 'notifications': return <FacultyNotifications onBack={handleBack} />;
        case 'help': return <HelpScreen onBack={handleBack} />;
        default: return <ConsultantDashboard onNavigate={handleNavigate} onBack={handleBack} />;
      }
    }

    return null;
  };

  const containerClass = `app-container ${
    displayMode === 'wide' ? 'app-wide' : displayMode === 'fullscreen' ? 'app-fullscreen' : ''
  }`;

  return (
    <>
      <FullscreenControl mode={displayMode} onModeChange={handleDisplayModeChange} />
      <div className={containerClass}>
        <SecurityShield>
          {ViewingAsBanner}
          {isAccountBlocked ? (
            <PendingApprovalScreen user={activeUser} />
          ) : (
            <>
              <div className="screen-content">{renderScreen()}</div>
              {activeUser.role === 'student' && currentScreen !== 'community' && currentScreen !== 'announcements' && currentScreen !== 'active-quiz' && currentScreen !== 'quiz-results' && currentScreen !== 'quiz-detail' && currentScreen !== 'departments' && <StudentAIChatbot />}
              {showBottomNav && <BottomNav items={navItems} activeTab={currentScreen} onTabChange={handleTabChange} notificationCount={0} />}
            </>
          )}
        </SecurityShield>
      </div>
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DataProvider>
  );
}
