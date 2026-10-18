import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav } from './components/Navigation';
import { SplashScreen, LoginScreen } from './screens/AuthScreens';
import { StudentHome, StudentCourses, StudentResources, StudentCommunity, StudentProfile, NotificationsScreen, AnnouncementsScreen, AboutScreen, DepartmentsScreen, HelpScreen, CalendarScreen } from './screens/StudentScreens';
import { QuizList, QuizDetail, ActiveQuiz, QuizResults } from './screens/QuizScreens';
import { FacultyDashboard, FacultyCourses, UploadResource, CreateQuiz, FacultySubmissions, FacultyNotifications, FacultyProfile, StudentPreview } from './screens/FacultyScreens';
import { AdminDashboard, AdminUsers, AdminDepartments, AdminCourses, AdminResources, AdminNotifications, AuditLogs, AdminSettings, AdminCommunity } from './screens/AdminScreens';
import { ResourceViewer, CourseDetail } from './screens/ResourceScreens';

// Navigation configs per role
const studentNavItems = [
  { id: 'home', icon: 'fa-home', label: 'Home' },
  { id: 'courses', icon: 'fa-book', label: 'Courses' },
  { id: 'resources', icon: 'fa-folder', label: 'Resources' },
  { id: 'community', icon: 'fa-comments', label: 'Community' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

const facultyNavItems = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { id: 'courses', icon: 'fa-book', label: 'Courses' },
  { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Upload' },
  { id: 'create-quiz', icon: 'fa-clipboard-list', label: 'Quiz' },
  { id: 'profile', icon: 'fa-user', label: 'Profile' },
];

const adminNavItems = [
  { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { id: 'users', icon: 'fa-users', label: 'Users' },
  { id: 'courses', icon: 'fa-book-medical', label: 'Courses' },
  { id: 'notifications', icon: 'fa-bell', label: 'Alerts' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings' },
];

function AppContent() {
  const { user, isAuthenticated, isViewingAs, viewingAsUser, stopViewingAs } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [screenData, setScreenData] = useState<any>(null);
  const [screenHistory, setScreenHistory] = useState<string[]>([]);

  const handleNavigate = useCallback((screen: string, data?: any) => {
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
      const defaultScreen = user?.role === 'admin' ? 'dashboard' : user?.role === 'faculty' ? 'dashboard' : 'home';
      setCurrentScreen(defaultScreen);
    }
  }, [screenHistory, user]);

  const handleTabChange = useCallback((tab: string) => {
    setScreenHistory([]);
    setCurrentScreen(tab);
    setScreenData(null);
  }, []);

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Determine nav items
  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'faculty' ? facultyNavItems : studentNavItems;

  // Check if current screen is a "tab" screen
  const isTabScreen = navItems.some(item => item.id === currentScreen);
  const showBottomNav = isTabScreen || currentScreen === 'home';

  // Viewing-as banner
  const ViewingAsBanner = isViewingAs && (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between text-xs z-50">
      <span><i className="fas fa-user-tag mr-1" /> Viewing as: {viewingAsUser?.name} (Admin Session)</span>
      <button onClick={stopViewingAs} className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium">Exit</button>
    </div>
  );

  // Render current screen
  const renderScreen = () => {
    // Student screens
    if (user?.role === 'student') {
      switch (currentScreen) {
        case 'home': return <StudentHome onNavigate={handleNavigate} />;
        case 'courses': return <StudentCourses onNavigate={handleNavigate} />;
        case 'resources': return <StudentResources onNavigate={handleNavigate} />;
        case 'community': return <StudentCommunity />;
        case 'profile': return <StudentProfile onNavigate={handleNavigate} />;
        case 'notifications': return <NotificationsScreen onBack={handleBack} />;
        case 'announcements': return <AnnouncementsScreen onBack={handleBack} />;
        case 'about': return <AboutScreen onBack={handleBack} />;
        case 'departments': return <DepartmentsScreen onBack={handleBack} onNavigate={handleNavigate} />;
        case 'help': return <HelpScreen onBack={handleBack} />;
        case 'calendar': return <CalendarScreen onBack={handleBack} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'active-quiz': return <ActiveQuiz onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} />;
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
        case 'student-preview': return <StudentPreview onBack={handleBack} />;
        case 'help': return <HelpScreen onBack={handleBack} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} />;
        case 'resource-view': return <ResourceViewer onBack={handleBack} resource={screenData} />;
        case 'course-detail': return <CourseDetail onBack={handleBack} course={screenData} onNavigate={handleNavigate} />;
        default: return <FacultyDashboard onNavigate={handleNavigate} />;
      }
    }

    // Admin screens
    if (user?.role === 'admin') {
      switch (currentScreen) {
        case 'dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
        case 'users': return <AdminUsers onBack={handleBack} />;
        case 'departments': return <AdminDepartments onBack={handleBack} />;
        case 'courses': return <AdminCourses onBack={handleBack} />;
        case 'resources': return <AdminResources onBack={handleBack} />;
        case 'quizzes': return <QuizList onBack={handleBack} onNavigate={handleNavigate} />;
        case 'community': return <AdminCommunity onBack={handleBack} />;
        case 'notifications': return <AdminNotifications onBack={handleBack} />;
        case 'audit-logs': return <AuditLogs onBack={handleBack} />;
        case 'settings': return <AdminSettings onBack={handleBack} />;
        case 'quiz-detail': return <QuizDetail onBack={handleBack} onNavigate={handleNavigate} quiz={screenData} />;
        case 'quiz-results': return <QuizResults onBack={handleBack} />;
        default: return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    return null;
  };

  return (
    <div className="app-container">
      {ViewingAsBanner}
      <div className="screen-content">
        {renderScreen()}
      </div>
      {showBottomNav && (
        <BottomNav
          items={navItems}
          activeTab={currentScreen}
          onTabChange={handleTabChange}
          notificationCount={3}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
