import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, SearchBar, EmptyState, StatusBadge } from '../components/Navigation';
import { courses, departments, resources, announcements, communityMessages, quizzes, notifications } from '../data/mockData';

// ==================== HOME SCREEN ====================
export function StudentHome({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const studentCourses = courses.filter(c => user?.enrolledCourses?.includes(c.name));

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Welcome back,</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Student'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">3</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-teal-500/30 flex items-center justify-center text-lg">
              {user?.avatar}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">{studentCourses.length}</p>
            <p className="text-gray-300 text-[10px]">Courses</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">2</p>
            <p className="text-gray-300 text-[10px]">Active Quizzes</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">78%</p>
            <p className="text-gray-300 text-[10px]">Avg Score</p>
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
          <div className="space-y-2">
            {studentCourses.slice(0, 3).map((course) => (
              <div key={course.id} onClick={() => onNavigate('course-detail')} className="card flex items-center gap-3 cursor-pointer active:bg-gray-50">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                  <i className={`fas ${course.icon}`} style={{ color: course.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.subjects.slice(0, 2).join(', ')}</p>
                </div>
                <i className="fas fa-chevron-right text-gray-300 text-xs" />
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">Announcements</h2>
            <button onClick={() => onNavigate('announcements')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          {announcements.filter(a => a.pinned).map((a) => (
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

        {/* Departments Quick Access */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">Departments</h2>
            <button onClick={() => onNavigate('departments')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {[
              { name: 'Anatomy', icon: 'fa-bone' },
              { name: 'Physiology', icon: 'fa-heart-pulse' },
              { name: 'Physics', icon: 'fa-atom' },
              { name: 'Chemistry', icon: 'fa-flask' },
              { name: 'Botany', icon: 'fa-leaf' },
              { name: 'Zoology', icon: 'fa-paw' },
            ].map((dept) => (
              <button key={dept.name} onClick={() => onNavigate('departments')} className="flex-shrink-0 w-16">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-1">
                  <i className={`fas ${dept.icon} text-teal-600 text-sm`} />
                </div>
                <p className="text-[9px] text-center text-gray-600 font-medium">{dept.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">Upcoming Quizzes</h2>
            <button onClick={() => onNavigate('quizzes')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          {quizzes.filter(q => q.status === 'active').slice(0, 2).map((q) => (
            <div key={q.id} onClick={() => onNavigate('quiz-detail')} className="card cursor-pointer active:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={q.status} />
                <span className="text-xs text-gray-500">{q.duration} min</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{q.title}</p>
              <p className="text-xs text-gray-500 mt-1">{q.questions} questions • {q.marks} marks</p>
            </div>
          ))}
        </div>

        {/* Community Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">Community</h2>
            <button onClick={() => onNavigate('community')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs">👨‍⚕️</div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Dr. Sharma</p>
                <p className="text-[10px] text-gray-400">2 hours ago</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{communityMessages[0].message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COURSES SCREEN ====================
export function StudentCourses({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const categories = ['All', 'NEET', 'IMAT', 'UCAT', 'MCAT'];
  
  const enrolledNames = user?.enrolledCourses || [];
  let filteredCourses = courses.filter(c => enrolledNames.includes(c.name));
  if (filter !== 'All') filteredCourses = filteredCourses.filter(c => c.category === filter);
  if (search) filteredCourses = filteredCourses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Header title="My Courses" subtitle={`${filteredCourses.length} courses enrolled`} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." />
      
      {/* Category Filter */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === cat ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
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
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{course.students}</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-book mr-1" />{course.subjects.length} subjects</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && <EmptyState icon="fa-book" title="No Courses" message="No courses match your filter" />}
      </div>
    </div>
  );
}

// ==================== RESOURCES SCREEN ====================
export function StudentResources({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const types = ['All', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment'];
  
  let filtered = resources;
  if (filter !== 'All') filtered = filtered.filter(r => r.type === filter);
  if (search) filtered = filtered.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const typeIcons: Record<string, string> = {
    PDF: 'fa-file-pdf text-red-500',
    Video: 'fa-play-circle text-blue-500',
    Notes: 'fa-sticky-note text-yellow-500',
    PYQ: 'fa-file-alt text-purple-500',
    Assignment: 'fa-tasks text-green-500',
  };

  return (
    <div>
      <Header title="Resources" subtitle={`${filtered.length} resources available`} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." />
      
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === type ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {type}
          </button>
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
              <p className="text-xs text-gray-500">{resource.subject} • {resource.course}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">{resource.size}</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">{resource.date}</span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-xs" />
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon="fa-folder-open" title="No Resources" message="No resources match your filter" />}
      </div>
    </div>
  );
}

// ==================== COMMUNITY SCREEN ====================
export function StudentCommunity() {
  const [newMessage, setNewMessage] = useState('');

  return (
    <div>
      <Header title="Community" subtitle="Connect with peers and faculty" />
      
      <div className="p-4 space-y-3">
        {communityMessages.map((msg) => (
          <div key={msg.id} className="card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">
                {msg.role === 'Faculty' ? '👨‍⚕️' : msg.role === 'Admin' ? '👨‍💼' : '👩‍🎓'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{msg.author}</p>
                  <span className={`badge text-[9px] ${msg.role === 'Faculty' ? 'badge-teal' : msg.role === 'Admin' ? 'badge-navy' : 'badge-green'}`}>
                    {msg.role}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">{msg.time}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{msg.message}</p>
            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
              <button className="flex items-center gap-1 text-gray-400 text-xs">
                <i className="fas fa-heart" /> {msg.likes}
              </button>
              <button className="flex items-center gap-1 text-gray-400 text-xs">
                <i className="fas fa-comment" /> {msg.replies}
              </button>
              <button className="flex items-center gap-1 text-gray-400 text-xs ml-auto">
                <i className="fas fa-flag" /> Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="fixed bottom-[70px] left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share with the community..."
            className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center">
            <i className="fas fa-paper-plane text-white text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PROFILE SCREEN ====================
export function StudentProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="gradient-header pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl backdrop-blur-sm border-2 border-white/30">
          {user?.avatar}
        </div>
        <h2 className="text-white text-lg font-bold">{user?.name}</h2>
        <p className="text-gray-300 text-xs">{user?.email}</p>
        {user?.studentId && <p className="text-teal-300 text-xs mt-1">ID: {user.studentId}</p>}
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">3</p>
            <p className="text-[10px] text-gray-500">Courses</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">12</p>
            <p className="text-[10px] text-gray-500">Quizzes</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">78%</p>
            <p className="text-[10px] text-gray-500">Avg Score</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-book', label: 'My Courses', screen: 'courses' },
            { icon: 'fa-clipboard-check', label: 'Quizzes', screen: 'quizzes' },
            { icon: 'fa-trophy', label: 'Quiz Results', screen: 'quiz-results' },
            { icon: 'fa-building', label: 'Departments', screen: 'departments' },
            { icon: 'fa-bullhorn', label: 'Announcements', screen: 'announcements' },
            { icon: 'fa-calendar', label: 'Academic Calendar', screen: 'calendar' },
            { icon: 'fa-question-circle', label: 'Help & Support', screen: 'help' },
            { icon: 'fa-info-circle', label: 'About', screen: 'about' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50"
            >
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <span className="text-sm text-gray-700 flex-1 text-left">{item.label}</span>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>

        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
          <i className="fas fa-sign-out-alt" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ==================== NOTIFICATIONS SCREEN ====================
export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`card flex items-start gap-3 ${!n.read ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type === 'quiz' ? 'bg-purple-100' : n.type === 'resource' ? 'bg-blue-100' : n.type === 'result' ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <i className={`fas ${
                n.type === 'quiz' ? 'fa-clipboard-check text-purple-500' : n.type === 'resource' ? 'fa-file text-blue-500' : n.type === 'result' ? 'fa-trophy text-green-500' : 'fa-bullhorn text-orange-500'
              } text-sm`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ANNOUNCEMENTS SCREEN ====================
export function AnnouncementsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Announcements" showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className={`card ${a.pinned ? 'border-l-4 border-teal-500' : ''}`}>
            <div className="flex items-start gap-2">
              {a.pinned && <i className="fas fa-thumbtack text-teal-500 text-xs mt-1" />}
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{a.title}</p>
                <p className="text-xs text-gray-600 mt-1">{a.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400">By {a.author}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400">{a.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ABOUT SCREEN ====================
export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="About" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-staff-snake text-2xl text-teal-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Sultanat e Italia Medica</h2>
          <p className="text-xs text-gray-500 mt-1">Your Gateway to Medical Education in India and Italy</p>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Our Mission</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sultanat e Italia Medica is dedicated to providing comprehensive medical entrance examination preparation for students aspiring to pursue medical education in India and Italy. We offer structured courses, expert faculty guidance, and extensive study resources.
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Exams We Prepare For</h3>
            <div className="grid grid-cols-2 gap-2">
              {['NEET (India)', 'IMAT (Italy)', 'UCAT (UK)', 'MCAT (USA/Canada)'].map((exam) => (
                <div key={exam} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <i className="fas fa-check-circle text-teal-500 text-xs" />
                  <span className="text-xs text-gray-700">{exam}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-bold text-gray-800 mb-2">What We Offer</h3>
            <ul className="space-y-2">
              {[
                'Expert faculty with medical education experience',
                'Comprehensive study materials and notes',
                'Video lectures and interactive sessions',
                'Regular mock tests and performance analysis',
                'Previous year question papers',
                'Personalized guidance and counseling',
                'Community support and peer learning',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <i className="fas fa-star text-yellow-400 text-[10px] mt-0.5" />
                  <span className="text-xs text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-gradient-to-r from-teal-50 to-blue-50">
            <h3 className="text-sm font-bold text-gray-800 mb-2">NEET Subjects</h3>
            <div className="flex flex-wrap gap-1">
              {['Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology'].map((s) => (
                <span key={s} className="badge badge-teal">{s}</span>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-50 to-teal-50">
            <h3 className="text-sm font-bold text-gray-800 mb-2">IMAT Subjects</h3>
            <div className="flex flex-wrap gap-1">
              {['Logical Reasoning', 'Biology', 'Chemistry', 'Physics', 'Mathematics'].map((s) => (
                <span key={s} className="badge badge-green">{s}</span>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-[10px] text-gray-400">Version 1.0.0 • Build 2024.12.15</p>
            <p className="text-[10px] text-gray-400 mt-1">© 2024 Sultanat e Italia Medica</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== DEPARTMENTS SCREEN ====================
export function DepartmentsScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  return (
    <div>
      <Header title="Departments" subtitle="9 academic departments" showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} onClick={() => onNavigate('department-detail')} className="card cursor-pointer active:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <i className={`fas ${dept.icon} text-teal-600`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{dept.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dept.subjects.slice(0, 3).map((s) => (
                    <span key={s} className="badge badge-teal text-[9px]">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{dept.faculty} Faculty</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-book mr-1" />{dept.courses} Courses</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== HELP SCREEN ====================
export function HelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Help & Support" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Frequently Asked Questions</h3>
          {[
            { q: 'How do I access course materials?', a: 'Go to the Resources tab to view all available materials for your enrolled courses.' },
            { q: 'How do I attempt a quiz?', a: 'Navigate to the Quizzes section from your home screen. Active quizzes will be available to attempt.' },
            { q: 'Can I download study materials?', a: 'Materials are viewable in-app for security. Contact admin for special access requests.' },
            { q: 'How are quiz results calculated?', a: 'Quizzes are scored server-side. Positive marks for correct answers, negative marking as configured per quiz.' },
          ].map((faq, i) => (
            <div key={i} className="py-3 border-b border-gray-100 last:border-0">
              <p className="text-xs font-semibold text-gray-800">{faq.q}</p>
              <p className="text-xs text-gray-500 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Contact Support</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <i className="fas fa-envelope text-teal-500" />
              <span className="text-xs text-gray-700">support@sultanatitalia.edu</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
              <i className="fas fa-phone text-teal-500" />
              <span className="text-xs text-gray-700">+91-XXX-XXX-XXXX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CALENDAR SCREEN ====================
export function CalendarScreen({ onBack }: { onBack: () => void }) {
  const events = [
    { date: 'Dec 20', title: 'NEET Biology Quiz', type: 'quiz', color: 'bg-purple-100 text-purple-700' },
    { date: 'Dec 22', title: 'Physics Mock Test', type: 'test', color: 'bg-blue-100 text-blue-700' },
    { date: 'Dec 25', title: 'Holiday - Christmas', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { date: 'Jan 1', title: 'Holiday - New Year', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { date: 'Jan 5', title: 'IMAT Logic Test', type: 'quiz', color: 'bg-purple-100 text-purple-700' },
    { date: 'Jan 10', title: 'NEET Full Mock', type: 'test', color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div>
      <Header title="Academic Calendar" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        {/* Mini Calendar */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <button className="text-gray-400"><i className="fas fa-chevron-left" /></button>
            <h3 className="text-sm font-bold text-gray-800">December 2024</h3>
            <button className="text-gray-400"><i className="fas fa-chevron-right" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] text-gray-400 font-medium py-1">{d}</span>
            ))}
            {Array.from({ length: 31 }, (_, i) => (
              <span key={i} className={`text-xs py-1.5 rounded-full ${i + 1 === 15 ? 'bg-teal-500 text-white font-bold' : 'text-gray-600'}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Events */}
        <h3 className="text-sm font-bold text-gray-800 mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events.map((event, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${event.color} flex flex-col items-center justify-center`}>
                <span className="text-[9px] font-medium">{event.date.split(' ')[0]}</span>
                <span className="text-sm font-bold">{event.date.split(' ')[1]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                <p className="text-[10px] text-gray-400 capitalize">{event.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
