import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, StatusBadge, EmptyState } from '../components/Navigation';
import { courses, departments, resources, users, auditLogs, notifications } from '../data/mockData';

// ==================== ADMIN DASHBOARD ====================
export function AdminDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Admin Panel</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Administrator'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">5</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center text-lg">{user?.avatar}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Users', value: '342', icon: 'fa-users' },
            { label: 'Courses', value: '15', icon: 'fa-book' },
            { label: 'Resources', value: '89', icon: 'fa-folder' },
            { label: 'Quizzes', value: '24', icon: 'fa-clipboard' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <i className={`fas ${stat.icon} text-teal-300 text-sm mb-1`} />
              <p className="text-white text-sm font-bold">{stat.value}</p>
              <p className="text-gray-400 text-[9px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'fa-user-plus', label: 'Add User', color: 'bg-teal-50 text-teal-600' },
            { icon: 'fa-bullhorn', label: 'Announce', color: 'bg-orange-50 text-orange-600' },
            { icon: 'fa-paper-plane', label: 'Notify', color: 'bg-blue-50 text-blue-600' },
          ].map((action) => (
            <button key={action.label} className={`card flex flex-col items-center py-3 ${action.color}`}>
              <i className={`fas ${action.icon} text-lg mb-1`} />
              <span className="text-[10px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Management Sections */}
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-users', label: 'Manage Users', desc: 'Students, Faculty, Admins', screen: 'users', count: '342' },
            { icon: 'fa-building', label: 'Departments', desc: '9 departments configured', screen: 'departments', count: '9' },
            { icon: 'fa-book-medical', label: 'Courses', desc: '15 active courses', screen: 'courses', count: '15' },
            { icon: 'fa-folder-open', label: 'Resources', desc: '89 uploaded resources', screen: 'resources', count: '89' },
            { icon: 'fa-clipboard-check', label: 'Quizzes', desc: '24 quizzes created', screen: 'quizzes', count: '24' },
            { icon: 'fa-comments', label: 'Community', desc: 'Moderate messages', screen: 'community', count: '' },
            { icon: 'fa-bell', label: 'Notifications', desc: 'Send & manage', screen: 'notifications', count: '' },
            { icon: 'fa-history', label: 'Audit Logs', desc: 'Security & access logs', screen: 'audit-logs', count: '' },
            { icon: 'fa-cog', label: 'Settings', desc: 'App configuration', screen: 'settings', count: '' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <i className={`fas ${item.icon} text-gray-600 text-sm`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
              {item.count && <span className="badge badge-teal">{item.count}</span>}
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN USERS ====================
export function AdminUsers({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState('All');
  const roles = ['All', 'Students', 'Faculty', 'Admins'];
  
  const allUsers = [
    { name: 'Ayesha Khan', role: 'Student', email: 'ayesha@student.edu', status: 'Active', id: 'SIM-0042' },
    { name: 'Rahul Kumar', role: 'Student', email: 'rahul@student.edu', status: 'Active', id: 'SIM-0038' },
    { name: 'Priya Singh', role: 'Student', email: 'priya@student.edu', status: 'Active', id: 'SIM-0055' },
    { name: 'Dr. Sharma', role: 'Faculty', email: 'sharma@edu.com', status: 'Active', id: 'FAC-001' },
    { name: 'Dr. Rossi', role: 'Faculty', email: 'rossi@edu.com', status: 'Active', id: 'FAC-002' },
    { name: 'Dr. Verma', role: 'Faculty', email: 'verma@edu.com', status: 'Active', id: 'FAC-003' },
    { name: 'Admin', role: 'Admin', email: 'admin@edu.com', status: 'Active', id: 'ADM-001' },
  ];

  let filtered = allUsers;
  if (filter === 'Students') filtered = allUsers.filter(u => u.role === 'Student');
  if (filter === 'Faculty') filtered = allUsers.filter(u => u.role === 'Faculty');
  if (filter === 'Admins') filtered = allUsers.filter(u => u.role === 'Admin');

  return (
    <div>
      <Header title="Users" subtitle={`${filtered.length} users`} showBack onBack={onBack} />
      
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              filter === r ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {filtered.map((u, i) => (
          <div key={i} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
              u.role === 'Student' ? 'bg-teal-100' : u.role === 'Faculty' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>
              {u.role === 'Student' ? '👩‍🎓' : u.role === 'Faculty' ? '👨‍⚕️' : '👨‍💼'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{u.name}</p>
              <p className="text-[10px] text-gray-400">{u.email} • {u.id}</p>
            </div>
            <div className="text-right">
              <span className={`badge ${u.role === 'Student' ? 'badge-teal' : u.role === 'Faculty' ? 'badge-navy' : 'badge-green'}`}>{u.role}</span>
              <p className="text-[10px] text-green-500 mt-1">{u.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-20 right-4 max-w-[430px]">
        <button className="w-12 h-12 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center">
          <i className="fas fa-plus" />
        </button>
      </div>
    </div>
  );
}

// ==================== ADMIN DEPARTMENTS ====================
export function AdminDepartments({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Departments" subtitle={`${departments.length} departments`} showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {departments.map((dept) => (
          <div key={dept.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                <i className={`fas ${dept.icon} text-teal-600`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">{dept.name}</p>
                  <button className="text-gray-400"><i className="fas fa-ellipsis-v" /></button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{dept.faculty} Faculty</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-book mr-1" />{dept.courses} Courses</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-tag mr-1" />{dept.subjects.length} Subjects</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN COURSES ====================
export function AdminCourses({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Courses" subtitle={`${courses.length} courses`} showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                <i className={`fas ${course.icon}`} style={{ color: course.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">{course.name}</p>
                  <span className="badge badge-teal">{course.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{course.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{course.students}</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-clock mr-1" />{course.duration}</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-chalkboard-teacher mr-1" />{course.faculty.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN RESOURCES ====================
export function AdminResources({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Resources" subtitle={`${resources.length} resources`} showBack onBack={onBack} />
      <div className="p-4 space-y-2">
        {resources.map((r) => (
          <div key={r.id} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <i className={`fas ${r.type === 'Video' ? 'fa-play text-blue-500' : 'fa-file-pdf text-red-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{r.title}</p>
              <p className="text-[10px] text-gray-400">{r.uploader} • {r.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              <button className="text-gray-400"><i className="fas fa-ellipsis-v text-xs" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN NOTIFICATIONS ====================
export function AdminNotifications({ onBack }: { onBack: () => void }) {
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} rightAction={
        <button onClick={() => setShowCompose(true)} className="text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      
      <div className="p-4">
        {/* Send Options */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="card text-center py-3 active:bg-gray-50">
            <i className="fas fa-users text-teal-500 mb-1" />
            <p className="text-[10px] font-medium text-gray-700">All Members</p>
          </button>
          <button className="card text-center py-3 active:bg-gray-50">
            <i className="fas fa-graduation-cap text-blue-500 mb-1" />
            <p className="text-[10px] font-medium text-gray-700">All Students</p>
          </button>
          <button className="card text-center py-3 active:bg-gray-50">
            <i className="fas fa-chalkboard-teacher text-purple-500 mb-1" />
            <p className="text-[10px] font-medium text-gray-700">All Faculty</p>
          </button>
          <button className="card text-center py-3 active:bg-gray-50">
            <i className="fas fa-book text-orange-500 mb-1" />
            <p className="text-[10px] font-medium text-gray-700">Select Course</p>
          </button>
        </div>

        {/* Notification History */}
        <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Notifications</h3>
        <div className="space-y-2">
          {[
            { title: 'NEET 2025 Registration', recipients: 'All Students', time: '2 hours ago', read: 245 },
            { title: 'New Study Materials', recipients: 'All Members', time: '1 day ago', read: 312 },
            { title: 'Holiday Schedule', recipients: 'All Members', time: '2 days ago', read: 298 },
            { title: 'Quiz Results Published', recipients: 'NEET Biology', time: '3 days ago', read: 89 },
          ].map((n, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-gray-500">To: {n.recipients}</span>
                <span className="text-[10px] text-teal-600"><i className="fas fa-eye mr-1" />{n.read} read</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Send Notification</h3>
              <button onClick={() => setShowCompose(false)}><i className="fas fa-times text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Notification Title" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              <textarea placeholder="Message content..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" />
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option>All Members</option>
                <option>All Students</option>
                <option>All Faculty</option>
                <option>NEET Foundation</option>
                <option>IMAT Foundation</option>
              </select>
              <button onClick={() => setShowCompose(false)} className="btn-primary">Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== AUDIT LOGS ====================
export function AuditLogs({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Audit Logs" subtitle="Security & access tracking" showBack onBack={onBack} />
      <div className="p-4 space-y-2">
        {auditLogs.map((log) => (
          <div key={log.id} className="card">
            <div className="flex items-center justify-between mb-1">
              <span className="badge badge-navy">{log.action}</span>
              <span className="text-[10px] text-gray-400">{log.timestamp}</span>
            </div>
            <p className="text-xs text-gray-700 mt-1"><strong>User:</strong> {log.user}</p>
            <p className="text-xs text-gray-500">{log.details}</p>
            <p className="text-[10px] text-gray-400 mt-1">IP: {log.ip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN SETTINGS ====================
export function AdminSettings({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Settings" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-shield-alt', label: 'Security Settings', desc: 'Password policy, session timeout' },
            { icon: 'fa-bell', label: 'Notification Settings', desc: 'Push notifications, email' },
            { icon: 'fa-database', label: 'Database Backup', desc: 'Last backup: 2 hours ago' },
            { icon: 'fa-storage', label: 'Storage Management', desc: '45.2 GB / 100 GB used' },
            { icon: 'fa-key', label: 'API Keys', desc: 'FCM, Storage credentials' },
            { icon: 'fa-file-import', label: 'Data Migration', desc: 'Import/Export tools' },
            { icon: 'fa-broom', label: 'Cache Management', desc: 'Clear app cache' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-700">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>

        {/* Profile Switching */}
        <div className="card bg-purple-50 border-l-4 border-purple-400">
          <h3 className="text-sm font-bold text-gray-800 mb-2">
            <i className="fas fa-user-tag text-purple-500 mr-1" /> Profile Switching
          </h3>
          <p className="text-xs text-gray-600 mb-3">Initiate an authorized viewing session as another user. All actions are logged.</p>
          <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-2">
            <option>Select user to view as...</option>
            <option>Ayesha Khan (Student)</option>
            <option>Dr. Sharma (Faculty)</option>
            <option>Rahul Kumar (Student)</option>
          </select>
          <input placeholder="Reason for access..." className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-2" />
          <button className="w-full py-2 bg-purple-500 text-white rounded-lg text-xs font-medium">
            Start Viewing Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN COMMUNITY ====================
export function AdminCommunity({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Community Management" showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="card text-center py-2">
            <p className="text-lg font-bold text-teal-600">156</p>
            <p className="text-[10px] text-gray-500">Messages</p>
          </div>
          <div className="card text-center py-2">
            <p className="text-lg font-bold text-orange-500">3</p>
            <p className="text-[10px] text-gray-500">Reports</p>
          </div>
          <div className="card text-center py-2">
            <p className="text-lg font-bold text-blue-500">2</p>
            <p className="text-[10px] text-gray-500">Pinned</p>
          </div>
        </div>

        {[
          { author: 'Dr. Sharma', message: 'Remember to practice at least 50 MCQs daily!', time: '2 hours ago', status: 'active' },
          { author: 'Unknown User', message: 'Inappropriate content reported...', time: '5 hours ago', status: 'reported' },
          { author: 'Admin', message: 'Welcome to the new semester!', time: '1 day ago', status: 'pinned' },
        ].map((msg, i) => (
          <div key={i} className={`card ${msg.status === 'reported' ? 'border-l-4 border-red-400' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-800">{msg.author}</span>
              <div className="flex items-center gap-2">
                {msg.status === 'reported' && <span className="badge badge-red">Reported</span>}
                {msg.status === 'pinned' && <span className="badge badge-teal">Pinned</span>}
                <button className="text-gray-400"><i className="fas fa-ellipsis-v text-xs" /></button>
              </div>
            </div>
            <p className="text-xs text-gray-600">{msg.message}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-gray-400">{msg.time}</span>
              <button className="text-[10px] text-red-500"><i className="fas fa-trash mr-1" />Remove</button>
              <button className="text-[10px] text-teal-500"><i className="fas fa-thumbtack mr-1" />Pin</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
