import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Header, BottomNav, SearchBar, EmptyState, StatusBadge } from '../components/Navigation';

// ==================== HOME SCREEN ====================
export function StudentHome({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses, announcements, communityMessages, quizzes, departments, notifications } = useData();
  const myCourses = courses.filter(c => c.studentIds.includes(user?.id || ''));
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Welcome back,</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Student'}</h1>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
              {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">{unreadNotifs}</span>}
            </button>
            <button onClick={() => onNavigate('profile')} className="w-9 h-9 rounded-full bg-teal-500/30 flex items-center justify-center text-lg">{user?.avatar}</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">{myCourses.length}</p>
            <p className="text-gray-300 text-[10px]">Courses</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">{quizzes.filter(q => q.status === 'active').length}</p>
            <p className="text-gray-300 text-[10px]">Active Quizzes</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">{departments.length}</p>
            <p className="text-gray-300 text-[10px]">Departments</p>
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-4">
        {/* Exam Preparation */}
        <div>
          <h2 className="text-gray-800 font-bold text-sm mb-3">Exam Preparation</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[
              { name: 'NEET', color: 'bg-teal-500', icon: 'fa-book-medical' },
              { name: 'IMAT', color: 'bg-blue-500', icon: 'fa-globe-europe' },
              { name: 'UCAT', color: 'bg-purple-500', icon: 'fa-stethoscope' },
              { name: 'MCAT', color: 'bg-indigo-500', icon: 'fa-user-md' },
            ].map((exam) => (
              <button key={exam.name} onClick={() => onNavigate('courses')} className="flex-shrink-0 w-20">
                <div className={`${exam.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-1`}>
                  <i className={`fas ${exam.icon} text-white`} />
                </div>
                <p className="text-xs text-center text-gray-600 font-medium">{exam.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">My Courses</h2>
            <button onClick={() => onNavigate('courses')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          {myCourses.length === 0 ? (
            <div className="card text-center py-6">
              <i className="fas fa-book text-2xl text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">No courses enrolled yet</p>
            </div>
          ) : (
            myCourses.slice(0, 3).map((course) => (
              <div key={course.id} onClick={() => onNavigate('course-detail', course)} className="card flex items-center gap-3 cursor-pointer active:bg-gray-50">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                  <i className={`fas ${course.icon}`} style={{ color: course.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.subjects.slice(0, 2).join(', ')}</p>
                </div>
                <i className="fas fa-chevron-right text-gray-300 text-xs" />
              </div>
            ))
          )}
        </div>

        {/* Departments */}
        {departments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-800 font-bold text-sm">Departments</h2>
              <button onClick={() => onNavigate('departments')} className="text-teal-600 text-xs font-medium">View All</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {departments.slice(0, 6).map((dept) => (
                <button key={dept.id} onClick={() => onNavigate('departments')} className="flex-shrink-0 w-16">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-1">
                    <i className={`fas ${dept.icon} text-teal-600 text-sm`} />
                  </div>
                  <p className="text-[9px] text-center text-gray-600 font-medium">{dept.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-800 font-bold text-sm">Announcements</h2>
              <button onClick={() => onNavigate('announcements')} className="text-teal-600 text-xs font-medium">View All</button>
            </div>
            {announcements.filter(a => a.pinned).slice(0, 2).map((a) => (
              <div key={a.id} className="card border-l-4 border-teal-500">
                <div className="flex items-start gap-2">
                  <i className="fas fa-bullhorn text-teal-500 text-sm mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{a.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Quizzes */}
        {quizzes.filter(q => q.status === 'active').length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-800 font-bold text-sm">Upcoming Quizzes</h2>
              <button onClick={() => onNavigate('quizzes')} className="text-teal-600 text-xs font-medium">View All</button>
            </div>
            {quizzes.filter(q => q.status === 'active').slice(0, 2).map((q) => (
              <div key={q.id} onClick={() => onNavigate('quiz-detail', q)} className="card cursor-pointer active:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={q.status} />
                  <span className="text-xs text-gray-500">{q.duration} min</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{q.title}</p>
                <p className="text-xs text-gray-500 mt-1">{q.questions.length} questions • {q.marks} marks</p>
              </div>
            ))}
          </div>
        )}

        {/* Community */}
        {communityMessages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-800 font-bold text-sm">Community</h2>
              <button onClick={() => onNavigate('community')} className="text-teal-600 text-xs font-medium">View All</button>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs">{communityMessages[0]?.authorRole === 'Faculty' ? '👨‍⚕️' : '👩‍🎓'}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{communityMessages[0]?.authorName}</p>
                  <p className="text-[10px] text-gray-400">{communityMessages[0]?.time}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{communityMessages[0]?.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COURSES SCREEN ====================
export function StudentCourses({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses } = useData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const categories = ['All', 'NEET', 'IMAT', 'UCAT', 'MCAT'];
  
  let filteredCourses = courses.filter(c => c.studentIds.includes(user?.id || ''));
  if (filter !== 'All') filteredCourses = filteredCourses.filter(c => c.category === filter);
  if (search) filteredCourses = filteredCourses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Header title="My Courses" subtitle={`${filteredCourses.length} courses enrolled`} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." />
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === cat ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
        ))}
      </div>
      <div className="px-4 space-y-3">
        {filteredCourses.map((course) => (
          <div key={course.id} onClick={() => onNavigate('course-detail', course)} className="card cursor-pointer active:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: course.color + '20' }}>
                <i className={`fas ${course.icon} text-lg`} style={{ color: course.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{course.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{course.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400"><i className="fas fa-clock mr-1" />{course.duration}</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{course.studentIds.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && <EmptyState icon="fa-book" title="No Courses" message="You haven't enrolled in any courses yet" />}
      </div>
    </div>
  );
}

// ==================== RESOURCES SCREEN ====================
export function StudentResources({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { resources, courses } = useData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const types = ['All', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Q.Paper', 'Practice'];
  
  // Show all published resources to students
  let filtered = resources.filter(r => r.status === 'published');
  if (filter !== 'All') filtered = filtered.filter(r => r.type === filter);
  if (search) filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const typeIcons: Record<string, string> = {
    PDF: 'fa-file-pdf text-red-500', Video: 'fa-play-circle text-blue-500', Notes: 'fa-sticky-note text-yellow-500',
    PYQ: 'fa-file-alt text-purple-500', Assignment: 'fa-tasks text-green-500',
  };

  return (
    <div>
      <Header title="Resources" subtitle={`${filtered.length} resources`} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." />
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {types.map((type) => (
          <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === type ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{type}</button>
        ))}
      </div>
      <div className="px-4 space-y-2">
        {filtered.map((resource) => (
          <div key={resource.id} onClick={() => onNavigate('resource-view', resource)} className="card flex items-center gap-3 cursor-pointer active:bg-gray-50">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <i className={`fas ${typeIcons[resource.type] || 'fa-file text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{resource.title}</p>
              <p className="text-xs text-gray-500">{resource.subject} • {resource.uploaderName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">{resource.size}</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">{resource.date}</span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-xs" />
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon="fa-folder-open" title="No Resources" message="No resources available for your courses" />}
      </div>
    </div>
  );
}

// ==================== COMMUNITY SCREEN ====================
export function StudentCommunity({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const { communityMessages, addCommunityMessage } = useData();
  const [newMessage, setNewMessage] = useState('');

  const handlePost = () => {
    if (!newMessage.trim() || !user) return;
    addCommunityMessage({
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      message: newMessage,
      pinned: false,
    });
    setNewMessage('');
  };

  return (
    <div>
      <Header title="Community" subtitle="Connect with peers and faculty" />
      <div className="p-4 space-y-3">
        {communityMessages.length === 0 ? (
          <EmptyState icon="fa-comments" title="No Messages" message="Be the first to post in the community!" />
        ) : (
          communityMessages.map((msg) => (
            <div key={msg.id} className={`card ${msg.pinned ? 'border-l-4 border-teal-500' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">
                  {msg.authorRole === 'Faculty' ? '👨‍⚕️' : msg.authorRole === 'Admin' ? '👨‍💼' : '👩‍🎓'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{msg.authorName}</p>
                    <span className={`badge text-[9px] ${msg.authorRole === 'Faculty' ? 'badge-teal' : msg.authorRole === 'Admin' ? 'badge-navy' : 'badge-green'}`}>{msg.authorRole}</span>
                    {msg.pinned && <i className="fas fa-thumbtack text-teal-500 text-[9px]" />}
                  </div>
                  <p className="text-[10px] text-gray-400">{msg.time}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                <button className="flex items-center gap-1 text-gray-400 text-xs"><i className="fas fa-heart" /> {msg.likes}</button>
                <button className="flex items-center gap-1 text-gray-400 text-xs"><i className="fas fa-comment" /> {msg.replies}</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-[70px] left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 p-3 z-40">
        <div className="flex items-center gap-2">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Share with the community..." className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" onKeyDown={(e) => e.key === 'Enter' && handlePost()} />
          <button onClick={handlePost} className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center"><i className="fas fa-paper-plane text-white text-sm" /></button>
        </div>
      </div>
    </div>
  );
}

// ==================== PROFILE SCREEN ====================
export function StudentProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();
  const { courses } = useData();
  const myCourses = courses.filter(c => c.studentIds.includes(user?.id || ''));

  return (
    <div>
      <div className="gradient-header pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl backdrop-blur-sm border-2 border-white/30">{user?.avatar}</div>
        <h2 className="text-white text-lg font-bold">{user?.name}</h2>
        <p className="text-gray-300 text-xs">{user?.email}</p>
        <p className="text-teal-300 text-xs mt-1">ID: {user?.id}</p>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center"><p className="text-lg font-bold text-teal-600">{myCourses.length}</p><p className="text-[10px] text-gray-500">Courses</p></div>
          <div className="card text-center"><p className="text-lg font-bold text-teal-600">0</p><p className="text-[10px] text-gray-500">Quizzes</p></div>
          <div className="card text-center"><p className="text-lg font-bold text-teal-600">—</p><p className="text-[10px] text-gray-500">Avg Score</p></div>
        </div>
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-book', label: 'My Courses', screen: 'courses' },
            { icon: 'fa-clipboard-check', label: 'Quizzes', screen: 'quizzes' },
            { icon: 'fa-building', label: 'Departments', screen: 'departments' },
            { icon: 'fa-bullhorn', label: 'Announcements', screen: 'announcements' },
            { icon: 'fa-calendar', label: 'Academic Calendar', screen: 'calendar' },
            { icon: 'fa-question-circle', label: 'Help & Support', screen: 'help' },
            { icon: 'fa-info-circle', label: 'About', screen: 'about' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.screen)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <span className="text-sm text-gray-700 flex-1 text-left">{item.label}</span>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>
        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
          <i className="fas fa-sign-out-alt" /> Sign Out
        </button>
        <button onClick={logout} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
          <i className="fas fa-exchange-alt" /> Switch Account / Sign In
        </button>
      </div>
    </div>
  );
}

// ==================== NOTIFICATIONS ====================
export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllRead } = useData();
  const myNotifs = notifications.filter(n => n.targetRole === 'all' || n.targetRole === user?.role);

  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} gradient={false} rightAction={
        <button onClick={() => markAllRead(user?.id || '')} className="text-teal-600 text-xs">Mark all read</button>
      } />
      <div className="p-4 space-y-2">
        {myNotifs.length === 0 ? (
          <EmptyState icon="fa-bell-slash" title="No Notifications" message="You're all caught up!" />
        ) : (
          myNotifs.map((n) => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`card flex items-start gap-3 cursor-pointer ${!n.read ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-bell text-teal-500 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== ANNOUNCEMENTS ====================
export function AnnouncementsScreen({ onBack }: { onBack: () => void }) {
  const { announcements } = useData();
  return (
    <div>
      <Header title="Announcements" showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {announcements.length === 0 ? (
          <EmptyState icon="fa-bullhorn" title="No Announcements" message="No announcements yet" />
        ) : (
          announcements.map((a) => (
            <div key={a.id} className={`card ${a.pinned ? 'border-l-4 border-teal-500' : ''}`}>
              <div className="flex items-start gap-2">
                {a.pinned && <i className="fas fa-thumbtack text-teal-500 text-xs mt-1" />}
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{a.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-gray-400">By {a.authorName}</span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-gray-400">{a.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== ABOUT ====================
export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="About Us" showBack onBack={onBack} gradient={false} />
      
      {/* Hero Section */}
      <div className="gradient-header pb-6 text-center">
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border-2 border-white/30">
            <i className="fas fa-staff-snake text-3xl text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">Sultanat e Italia Medica</h1>
          <p className="text-teal-200 text-xs mt-1 italic">"Your Gateway to Medical Education in India and Italy"</p>
          <div className="flex justify-center gap-1 mt-3">
            <div className="w-8 h-1 rounded bg-green-400" />
            <div className="w-8 h-1 rounded bg-white" />
            <div className="w-8 h-1 rounded bg-red-400" />
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-4">
        {/* Mission Card */}
        <div className="card bg-gradient-to-br from-teal-50 to-blue-50 border-l-4 border-teal-500">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-bullseye text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Our Mission</h3>
              <p className="text-xs text-gray-600 leading-relaxed">We bridge the gap between aspiring medical students and their dream careers by providing world-class preparation for medical entrance examinations across India, Italy, and beyond.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center py-3">
            <p className="text-lg font-bold text-teal-600">9+</p>
            <p className="text-[10px] text-gray-500">Departments</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg font-bold text-teal-600">15+</p>
            <p className="text-[10px] text-gray-500">Courses</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg font-bold text-teal-600">4</p>
            <p className="text-[10px] text-gray-500">Exams</p>
          </div>
        </div>

        {/* Exams We Prepare For */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-graduation-cap text-teal-500" /> Exams We Prepare For
          </h3>
          <div className="space-y-2">
            {[
              { name: 'NEET', country: 'India', icon: '🇮🇳', color: 'bg-orange-50 border-orange-200' },
              { name: 'IMAT', country: 'Italy', icon: '🇮🇹', color: 'bg-green-50 border-green-200' },
              { name: 'UCAT', country: 'United Kingdom', icon: '🇬🇧', color: 'bg-blue-50 border-blue-200' },
              { name: 'MCAT', country: 'USA / Canada', icon: '🌎', color: 'bg-purple-50 border-purple-200' },
            ].map((exam) => (
              <div key={exam.name} className={`flex items-center gap-3 p-3 rounded-lg border ${exam.color}`}>
                <span className="text-xl">{exam.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{exam.name}</p>
                  <p className="text-[10px] text-gray-500">{exam.country}</p>
                </div>
                <i className="fas fa-check-circle text-teal-500" />
              </div>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-star text-yellow-500" /> What We Offer
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: 'fa-video', label: 'Video Lectures', color: 'text-blue-500' },
              { icon: 'fa-file-pdf', label: 'Study Notes', color: 'text-red-500' },
              { icon: 'fa-clipboard-check', label: 'Mock Tests', color: 'text-green-500' },
              { icon: 'fa-file-alt', label: 'PYQ Papers', color: 'text-purple-500' },
              { icon: 'fa-users', label: 'Expert Faculty', color: 'text-teal-500' },
              { icon: 'fa-comments', label: 'Community', color: 'text-orange-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <i className={`fas ${item.icon} ${item.color} text-sm`} />
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEET & IMAT Subjects */}
        <div className="card bg-gradient-to-r from-orange-50 to-yellow-50">
          <h3 className="text-sm font-bold text-gray-800 mb-2">🇮🇳 NEET Subjects</h3>
          <div className="flex flex-wrap gap-1">
            {['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology'].map((s) => (
              <span key={s} className="badge bg-orange-100 text-orange-700 text-[10px]">{s}</span>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-teal-50">
          <h3 className="text-sm font-bold text-gray-800 mb-2">🇮🇹 IMAT Subjects</h3>
          <div className="flex flex-wrap gap-1">
            {['Logical Reasoning', 'Biology', 'Chemistry', 'Physics', 'Mathematics'].map((s) => (
              <span key={s} className="badge bg-green-100 text-green-700 text-[10px]">{s}</span>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-award text-teal-500" /> Why Choose Us?
          </h3>
          <div className="space-y-2">
            {[
              'Comprehensive curriculum aligned with exam patterns',
              'Expert faculty with years of teaching experience',
              'Regular mock tests with detailed performance analysis',
              'Previous year question papers with solutions',
              'Interactive community for peer learning',
              'Personalized guidance and doubt clearing',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <i className="fas fa-check text-teal-500 text-xs mt-0.5" />
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-gray-50 text-center">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Get in Touch</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <i className="fas fa-envelope text-teal-500 text-xs" />
              <span className="text-xs text-gray-600">support@sultanatitalia.edu</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <i className="fas fa-globe text-teal-500 text-xs" />
              <span className="text-xs text-gray-600">www.sultanatitalia.edu</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <div className="flex justify-center gap-1 mb-2">
            <div className="w-6 h-0.5 rounded bg-green-400" />
            <div className="w-6 h-0.5 rounded bg-gray-300" />
            <div className="w-6 h-0.5 rounded bg-red-400" />
          </div>
          <p className="text-[10px] text-gray-400">Version 1.0.0</p>
          <p className="text-[10px] text-gray-400 mt-0.5">© 2024 Sultanat e Italia Medica. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

// ==================== DEPARTMENTS ====================
export function DepartmentsScreen({ onBack }: { onBack: () => void }) {
  const { departments } = useData();
  return (
    <div>
      <Header title="Departments" subtitle={`${departments.length} departments`} showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {departments.length === 0 ? (
          <EmptyState icon="fa-building" title="No Departments" message="No departments have been created yet" />
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${dept.icon} text-teal-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{dept.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dept.subjects.slice(0, 3).map((s) => (<span key={s} className="badge badge-teal text-[9px]">{s}</span>))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== HELP ====================
export function HelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Help & Support" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Frequently Asked Questions</h3>
          {[
            { q: 'How do I access course materials?', a: 'Go to the Resources tab to view all available materials for your enrolled courses.' },
            { q: 'How do I attempt a quiz?', a: 'Navigate to the Quizzes section. Active quizzes will be available to attempt.' },
            { q: 'How are quiz results calculated?', a: 'Quizzes are scored server-side with positive and negative marking as configured.' },
          ].map((faq, i) => (
            <div key={i} className="py-3 border-b border-gray-100 last:border-0">
              <p className="text-xs font-semibold text-gray-800">{faq.q}</p>
              <p className="text-xs text-gray-500 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Contact Support</h3>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <i className="fas fa-envelope text-teal-500" /><span className="text-xs text-gray-700">support@sultanatitalia.edu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CALENDAR ====================
export function CalendarScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Academic Calendar" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <button className="text-gray-400"><i className="fas fa-chevron-left" /></button>
            <h3 className="text-sm font-bold text-gray-800">December 2024</h3>
            <button className="text-gray-400"><i className="fas fa-chevron-right" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (<span key={i} className="text-[10px] text-gray-400 font-medium py-1">{d}</span>))}
            {Array.from({ length: 31 }, (_, i) => (<span key={i} className={`text-xs py-1.5 rounded-full ${i + 1 === 15 ? 'bg-teal-500 text-white font-bold' : 'text-gray-600'}`}>{i + 1}</span>))}
          </div>
        </div>
        <EmptyState icon="fa-calendar" title="No Events" message="No upcoming events scheduled" />
      </div>
    </div>
  );
}
