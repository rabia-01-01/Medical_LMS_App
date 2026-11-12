import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData, hasResourceAccess } from './context/DataContext';
import { BottomNav, AccessRestrictedScreen } from './components/Navigation';
import { SplashScreen, LoginScreen, PendingApprovalScreen } from './screens/AuthScreens';
import { SCREEN_MODULE_MAP, getRoleDefaultScreen } from './features/auth';
import { useRbac } from './hooks/useRbac';
import {
  studentNavItems,
  facultyNavItems,
  adminNavItems,
  consultantNavItems,
} from './config/navigation';
import { StudentHome, StudentCourses, StudentResources, StudentCommunity, StudentProfile, NotificationsScreen, AnnouncementsScreen, AboutScreen, DepartmentsScreen, HelpScreen, CalendarScreen, AnalyticsScreen } from './screens/StudentScreens';
import { QuizList, QuizDetail, ActiveQuiz, QuizResults } from './screens/QuizScreens';
import { FacultyDashboard, FacultyCourses, UploadResource, CreateQuiz, FacultySubmissions, FacultyNotifications, FacultyProfile, FacultyAnnouncements, FacultyCommunity, FacultyResources } from './screens/FacultyScreens';
import { AdminDashboard, AdminUsers, AdminDepartments, AdminCourses, AdminResources, AdminNotifications, AuditLogs, AdminSettings, AdminCommunity, AdminAnnouncements, AddUser, SendAnnouncement, SendNotification } from './screens/AdminScreens';
import { ConsultantDashboard, ConsultantProfile } from './screens/ConsultantScreens';
import { ResourceViewer, CourseDetail } from './screens/ResourceScreens';
import { FullscreenControl, DisplayMode } from './components/FullscreenControl';
import { SecurityShield } from './components/SecurityShield';
import { StudentAIChatbot } from './components/StudentAIChatbot';

const SCREEN_PERMISSION_MAP = SCREEN_MODULE_MAP;

function AppContent() {
  const { user, isAuthenticated, isLoading, isViewingAs, viewingAsUser, stopViewingAs, isPasswordRecovery, completePasswordRecovery, dismissPasswordRecovery } = useAuth();
  const { users } = useData();
  const [showSplash, setShowSplash] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('mobile');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirm, setRecoveryConfirm] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isUpdatingRecovery, setIsUpdatingRecovery] = useState(false);

  const handleRecoverySubmit = async () => {
    setRecoveryError('');
    if (recoveryPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters.');
      return;
    }
    if (recoveryPassword !== recoveryConfirm) {
      setRecoveryError('Passwords do not match.');
      return;
    }
    setIsUpdatingRecovery(true);
    try {
      const res = await completePasswordRecovery(recoveryPassword);
      if (!res.success) {
        setRecoveryError(res.error || 'Failed to update password.');
      } else {
        setRecoveryPassword('');
        setRecoveryConfirm('');
      }
    } finally {
      setIsUpdatingRecovery(false);
    }
  };

  const activeUser = useMemo(() => {
    if (!user) return null;
    const emailLower = user.email.toLowerCase();
    const liveMatch = users.find(
      (u) => u.id === user.id || u.email.toLowerCase() === emailLower
    );
    return liveMatch ? { ...user, ...liveMatch, password: '' } : user;
  }, [user, users]);

  const rbac = useRbac(activeUser);

  const handleDisplayModeChange = (mode: DisplayMode) => {
    // Strictly lock display mode to mobile device aspect ratio
    setDisplayMode('mobile');
    try {
      localStorage.setItem('lms_display_mode', 'mobile');
    } catch {}
  };

  const [currentScreen, setCurrentScreen] = useState(() => getRoleDefaultScreen(user?.role));
  const [screenData, setScreenData] = useState<any>(null);
  const [screenHistory, setScreenHistory] = useState<string[]>([]);
  const screenContentRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll back to the top when switching between screens (e.g., courses & curriculum)
  useEffect(() => {
    const el = screenContentRef.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentScreen]);

  // Automatically reset to role-specific entry screen upon authentication or role switch
  React.useEffect(() => {
    setCurrentScreen(getRoleDefaultScreen(user?.role));
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
      setCurrentScreen(getRoleDefaultScreen(user?.role));
    }
  }, [screenHistory, user?.role]);

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

  const baseNavItems = activeUser.role === 'admin'
    ? adminNavItems
    : activeUser.role === 'faculty'
    ? facultyNavItems
    : activeUser.role === 'consultant'
    ? consultantNavItems
    : studentNavItems;
  const navItems = rbac.navItems.length > 0 ? rbac.navItems : baseNavItems;
  const isTabScreen = navItems.some(item => item.id === currentScreen);
  const showBottomNav = isTabScreen && !isAccountBlocked;

  const ViewingAsBanner = isViewingAs && (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between text-xs z-50">
      <span><i className="fas fa-user-tag mr-1" /> Viewing as: {viewingAsUser?.name}</span>
      <button onClick={stopViewingAs} className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium">Exit</button>
    </div>
  );

  const renderScreen = () => {
    const rbacDecision = rbac.canOpenScreen(currentScreen);
    if (!rbacDecision.allowed) {
      return (
        <AccessRestrictedScreen
          moduleName={rbacDecision.label}
          onBack={handleBack}
          message={rbacDecision.deniedMessage}
        />
      );
    }

    const permReq = SCREEN_PERMISSION_MAP[currentScreen];
    if (permReq && !hasResourceAccess(activeUser, permReq.module)) {
      return <AccessRestrictedScreen moduleName={permReq.label} onBack={handleBack} />;
    }

    // Role-specific views scoped by active role after unified RBAC validation
    if (user?.role === 'student') {
      switch (currentScreen) {
        case 'home': return <StudentHome onNavigate={handleNavigate} />;
        case 'courses': return <StudentCourses onNavigate={handleNavigate} />;
        case 'resources': return <StudentResources onNavigate={handleNavigate} />;
        case 'community': return <StudentCommunity onNavigate={handleNavigate} />;
        case 'profile': return <StudentProfile onNavigate={handleNavigate} />;
        case 'notifications': return <NotificationsScreen onBack={handleBack} />;
        case 'announcements': return <AnnouncementsScreen onBack={handleBack} />;
        case 'departments': return <DepartmentsScreen onBack={handleBack} />;
        case 'calendar': return <CalendarScreen onBack={handleBack} />;
        default: break;
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
        case 'announcements': return <FacultyAnnouncements onBack={handleBack} />;
        case 'community': return <FacultyCommunity onBack={handleBack} />;
        case 'faculty-resources': return <FacultyResources onBack={handleBack} onNavigate={handleNavigate} />;
        case 'departments': return <DepartmentsScreen onBack={handleBack} />;
        case 'calendar': return <CalendarScreen onBack={handleBack} />;
        default: break;
      }
    }

    // Admin and Consultant views + unified policy-guarded shared screens
    if (user?.role === 'admin') {
      switch (currentScreen) {
        case 'dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
        case 'users': return <AdminUsers onBack={handleBack} onNavigate={handleNavigate} />;
        case 'add-user': return <AddUser onBack={handleBack} />;
        case 'departments': return <AdminDepartments onBack={handleBack} />;
        case 'courses': return <AdminCourses onBack={handleBack} onNavigate={handleNavigate} />;
        case 'resources': return <AdminResources onBack={handleBack} onNavigate={handleNavigate} />;
        case 'announcements': return <AdminAnnouncements onBack={handleBack} onNavigate={handleNavigate} />;
        case 'send-announcement': return <SendAnnouncement onBack={handleBack} />;
        case 'send-notification': return <SendNotification onBack={handleBack} />;
        case 'community': return <AdminCommunity onBack={handleBack} />;
        case 'notifications': return <AdminNotifications onBack={handleBack} onNavigate={handleNavigate} />;
        case 'audit-logs': return <AuditLogs onBack={handleBack} />;
        case 'settings': return <AdminSettings onBack={handleBack} onNavigate={handleNavigate} />;
        case 'calendar': return <CalendarScreen onBack={handleBack} />;
        default: break;
      }
    } else if (user?.role === 'consultant') {
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

    // Shared policy-guarded screens across academic roles
    switch (currentScreen) {
      case 'analytics': return <AnalyticsScreen onBack={handleBack} onNavigate={handleNavigate} />;
      case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
      case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
      case 'active-quiz': return <ActiveQuiz onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
      case 'quiz-results': return <QuizResults onBack={handleBack} onNavigate={handleNavigate} quizData={screenData} />;
      case 'resource-view': return <ResourceViewer onBack={handleBack} resource={screenData} />;
      case 'course-detail': return <CourseDetail onBack={handleBack} course={screenData} onNavigate={handleNavigate} />;
      case 'about': return <AboutScreen onBack={handleBack} />;
      case 'help': return <HelpScreen onBack={handleBack} />;
      default:
        if (rbac.role === 'admin') return <AdminDashboard onNavigate={handleNavigate} />;
        if (rbac.role === 'faculty') return <FacultyDashboard onNavigate={handleNavigate} />;
        if (rbac.role === 'consultant') return <ConsultantDashboard onNavigate={handleNavigate} onBack={handleBack} />;
        return <StudentHome onNavigate={handleNavigate} />;
    }
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
              <div ref={screenContentRef} className="screen-content smooth-scroll">{renderScreen()}</div>
              {rbac.can('ai:chatbot') && activeUser.role === 'student' && currentScreen !== 'community' && currentScreen !== 'announcements' && currentScreen !== 'active-quiz' && currentScreen !== 'quiz-results' && currentScreen !== 'quiz-detail' && currentScreen !== 'departments' && <StudentAIChatbot />}
              {showBottomNav && <BottomNav items={navItems} activeTab={currentScreen} onTabChange={handleTabChange} notificationCount={0} />}
            </>
          )}
        </SecurityShield>
      </div>
      {isPasswordRecovery && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-3">
            <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <i className="fas fa-key" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center">Set New Password</h3>
            <p className="text-xs text-gray-500 text-center">
              Your password recovery session is active. Enter a new password for your account.
            </p>
            <input
              type="password"
              value={recoveryPassword}
              onChange={(e) => setRecoveryPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="password"
              value={recoveryConfirm}
              onChange={(e) => setRecoveryConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {recoveryError && <p className="text-xs text-red-600">{recoveryError}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={dismissPasswordRecovery}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Later
              </button>
              <button
                type="button"
                disabled={isUpdatingRecovery}
                onClick={handleRecoverySubmit}
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isUpdatingRecovery ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      )}
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
