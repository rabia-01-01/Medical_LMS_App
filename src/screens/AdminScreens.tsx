import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, User } from '../context/DataContext';
import { Header, StatusBadge, EmptyState } from '../components/Navigation';
import { signUpUser } from '../features/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { CurriculumBrowser } from '../features/curriculum';
import { useResources, resourceService } from '../features/resources';
import { useAdmin, adminService } from '../features/admin';

// ==================== OPERATIONAL ADMIN DASHBOARD ====================
export function AdminDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const { users, departments, courses, resources, quizzes, announcements, auditLogs } = useData();
  const { metrics, loading: metricsLoading, refreshMetrics, exportAuditLogs } = useAdmin();

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="badge bg-teal-400/20 text-teal-200 border border-teal-400/30 text-[9px] py-0 px-1.5">
                Phase 8 Admin
              </span>
              <p className="text-teal-200 text-xs font-medium">Operational Control Center</p>
            </div>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Administrator'}</h1>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={() => refreshMetrics()} 
              disabled={metricsLoading}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition"
              title="Refresh System Metrics"
            >
              <i className={`fas fa-sync-alt ${metricsLoading ? 'animate-spin text-teal-300' : ''}`} />
            </button>
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
            </button>
            <button onClick={() => onNavigate('settings')} className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center text-lg">{user?.avatar}</button>
          </div>
        </div>

        {/* Database & Cloud Connectivity Badge */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 mb-3 border border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${metrics?.dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span className="text-white font-medium text-[11px]">
              {metrics?.dbConnected ? 'PostgreSQL Supabase Connected' : 'Local Storage Fallback Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-teal-200">
            {metrics?.dbConnected && <span>{metrics.dbLatencyMs}ms ping</span>}
            <span className="badge bg-white/15 text-white text-[9px] py-0 px-1.5">
              {metrics?.systemStatus || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* 6 Executive KPI Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-user-graduate text-teal-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{metrics?.totalStudents ?? users.filter(u => u.role === 'student').length}</p>
            <p className="text-gray-300 text-[9px]">Students</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-user-md text-blue-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{metrics?.totalFaculty ?? users.filter(u => u.role === 'faculty').length}</p>
            <p className="text-gray-300 text-[9px]">Faculty</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-book-medical text-emerald-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{metrics?.totalCourses ?? courses.length}</p>
            <p className="text-gray-300 text-[9px]">Courses</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-folder-open text-amber-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{metrics?.publishedResources ?? resources.filter(r => r.status === 'published').length}</p>
            <p className="text-gray-300 text-[9px]">Published Docs</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-clipboard-check text-purple-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{quizzes.length}</p>
            <p className="text-gray-300 text-[9px]">Quizzes</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
            <i className="fas fa-history text-cyan-300 text-sm mb-1 block" />
            <p className="text-white text-base font-bold">{auditLogs.length}</p>
            <p className="text-gray-300 text-[9px]">Audit Events</p>
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-4">
        {/* Quick Admin Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => onNavigate('add-user')} className="card flex flex-col items-center py-2.5 active:bg-gray-50 mb-0 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mb-1 text-teal-600"><i className="fas fa-user-plus text-xs" /></div>
            <span className="text-[10px] font-medium text-gray-700">Add User</span>
          </button>
          <button onClick={() => onNavigate('send-announcement')} className="card flex flex-col items-center py-2.5 active:bg-gray-50 mb-0 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-1 text-orange-600"><i className="fas fa-bullhorn text-xs" /></div>
            <span className="text-[10px] font-medium text-gray-700">Announce</span>
          </button>
          <button onClick={() => onNavigate('send-notification')} className="card flex flex-col items-center py-2.5 active:bg-gray-50 mb-0 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1 text-blue-600"><i className="fas fa-paper-plane text-xs" /></div>
            <span className="text-[10px] font-medium text-gray-700">Notify</span>
          </button>
          <button 
            onClick={() => {
              const formattedLogs = auditLogs.map(l => ({
                id: l.id,
                action: l.action,
                userId: l.userId,
                userName: l.userName,
                details: l.details,
                timestamp: l.timestamp,
                severity: 'info' as const
              }));
              adminService.exportAuditLogs(formattedLogs);
            }} 
            className="card flex flex-col items-center py-2.5 active:bg-gray-50 mb-0 shadow-xs"
            title="Download audit trail as JSON"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mb-1 text-purple-600"><i className="fas fa-file-download text-xs" /></div>
            <span className="text-[10px] font-medium text-gray-700">Export Logs</span>
          </button>
        </div>

        {/* Operational Modules Navigation */}
        <div className="card p-0 overflow-hidden shadow-xs">
          {[
            { icon: 'fa-users', label: 'User Management', desc: `${users.length} registered profiles (${metrics?.activeUsers || users.length} active)`, screen: 'users' },
            { icon: 'fa-book-medical', label: 'Academic & Course Management', desc: `${courses.length} courses, curriculum & cohorts`, screen: 'courses' },
            { icon: 'fa-building', label: 'Departments', desc: `${departments.length} departments`, screen: 'departments' },
            { icon: 'fa-shield-alt', label: 'Resource Governance & Moderation', desc: `${resources.length} resources (${resources.filter(r => r.status === 'published').length} published)`, screen: 'resources' },
            { icon: 'fa-clipboard-check', label: 'Assessment & Quiz Engine', desc: `${quizzes.length} exams & mock drills`, screen: 'quizzes' },
            { icon: 'fa-history', label: 'Security & Audit Logs', desc: `${auditLogs.length} events logged`, screen: 'audit-logs' },
            { icon: 'fa-bullhorn', label: 'Announcements', desc: `${announcements.length} broadcasts`, screen: 'announcements' },
            { icon: 'fa-comments', label: 'Community Moderation', desc: 'Manage discussions', screen: 'community' },
            { icon: 'fa-bell', label: 'Alerts & Push Notifications', desc: 'System alerts', screen: 'notifications' },
            { icon: 'fa-cog', label: 'System Configuration', desc: 'Environment & settings', screen: 'settings' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.screen)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50 transition">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><i className={`fas ${item.icon} text-teal-700 text-sm`} /></div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ADD USER ====================
export function AddUser({ onBack }: { onBack: () => void }) {
  const { addUser } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'student' as 'admin' | 'faculty' | 'student', department: '', targetExam: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) return;
    
    if (isSupabaseConfigured()) {
      try {
        await signUpUser({
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          department: formData.department.trim(),
          targetExam: formData.targetExam,
        });
      } catch (err) {
        console.warn('[AddUser] Supabase register error:', err);
      }
    }

    addUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      avatar: formData.role === 'admin' ? '👨‍💼' : formData.role === 'faculty' ? '👨‍⚕️' : '👩‍🎓',
      status: 'active',
      department: formData.department,
      targetExam: formData.targetExam,
    });
    setSuccess(true);
    setTimeout(() => onBack(), 1500);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-check text-green-500 text-2xl" /></div>
          <p className="text-sm font-semibold text-gray-800">User Added!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Add User" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Role *</label>
          <div className="grid grid-cols-3 gap-2">
            {(['student', 'faculty', 'admin'] as const).map((role) => (
              <button key={role} onClick={() => setFormData(p => ({ ...p, role }))} className={`py-2 rounded-lg text-xs font-medium ${formData.role === role ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</button>
            ))}
          </div>
        </div>
        <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="Email *" type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" type="tel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Password *" type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        {formData.role === 'faculty' && <input value={formData.department} onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))} placeholder="Department" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />}
        {formData.role === 'student' && (
          <select value={formData.targetExam} onChange={(e) => setFormData(p => ({ ...p, targetExam: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Target Exam</option><option>NEET</option><option>IMAT</option><option>UCAT</option><option>MCAT</option>
          </select>
        )}
        <button onClick={handleSubmit} disabled={!formData.name || !formData.email || !formData.password} className="btn-primary disabled:opacity-50"><i className="fas fa-user-plus mr-2" />Add User</button>
      </div>
    </div>
  );
}

// ==================== MANAGE USERS ====================
export function AdminUsers({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const { user: currentUser, startViewingAs } = useAuth();
  const { users, deleteUser, updateUser } = useData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const roles = ['All', 'Students', 'Faculty', 'Admins', 'Suspended'];

  let filtered = users;
  if (filter === 'Students') filtered = users.filter(u => u.role === 'student');
  if (filter === 'Faculty') filtered = users.filter(u => u.role === 'faculty');
  if (filter === 'Admins') filtered = users.filter(u => u.role === 'admin');
  if (filter === 'Suspended') filtered = users.filter(u => u.status !== 'active');

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.targetExam && u.targetExam.toLowerCase().includes(q))
    );
  }

  const handleDelete = async (id: string) => {
    const target = users.find(u => u.id === id);
    deleteUser(id);
    if (currentUser) {
      await adminService.recordAuditLog({
        action: 'USER_DELETED',
        entityType: 'USER',
        entityId: id,
        userId: currentUser.id,
        userName: currentUser.name || 'Admin',
        details: `Deleted user profile for ${target?.name || id} (${target?.email})`,
        severity: 'critical',
      });
    }
    setConfirmDelete(null);
  };

  const toggleStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'suspended' : 'active';
    updateUser(id, { status: newStatus });
    if (currentUser) {
      await adminService.recordAuditLog({
        action: `USER_${newStatus.toUpperCase()}`,
        entityType: 'USER',
        entityId: id,
        userId: currentUser.id,
        userName: currentUser.name || 'Admin',
        details: `Changed status of ${target.name} to ${newStatus}`,
        severity: newStatus === 'suspended' ? 'warning' : 'info',
      });
    }
  };

  return (
    <div>
      <Header title="User Management" subtitle={`${filtered.length} users`} showBack onBack={onBack} rightAction={
        <button onClick={() => onNavigate('add-user')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm" title="Add New User">
          <i className="fas fa-plus" />
        </button>
      } />

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or exam (NEET, IMAT)..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {roles.map((r) => (
            <button 
              key={r} 
              onClick={() => setFilter(r)} 
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === r ? 'bg-teal-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* User Cards List */}
        {filtered.length === 0 ? (
          <EmptyState icon="fa-users" title="No Users" message="No users match the search criteria." />
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="card flex items-center gap-3 p-3 mb-0 hover:border-teal-200 border border-gray-100 transition">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                u.role === 'student' ? 'bg-teal-100 text-teal-800' : u.role === 'faculty' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {u.avatar || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                  {u.targetExam && <span className="badge badge-teal text-[8px] py-0 px-1">{u.targetExam}</span>}
                </div>
                <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-[9px] py-0 px-1.5 ${
                    u.role === 'student' ? 'badge-teal' : u.role === 'faculty' ? 'badge-navy' : 'badge-green'
                  }`}>
                    {u.role}
                  </span>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${u.status === 'active' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {u.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => {
                      startViewingAs(u, 'Administrative preview and test');
                      onNavigate(u.role === 'student' ? 'home' : 'dashboard');
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition flex items-center gap-1"
                    title="Impersonate & test user experience"
                  >
                    <i className="fas fa-eye text-[8px]" />
                    <span>View As</span>
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleStatus(u.id)} 
                    className={`text-[10px] px-2 py-0.5 rounded font-medium transition ${
                      u.status === 'active' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(u.id)} 
                    className="text-[10px] p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete user"
                  >
                    <i className="fas fa-trash text-[9px]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-exclamation-triangle text-red-500 text-xl" /></div>
              <h3 className="text-lg font-bold text-gray-800">Delete User?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN DEPARTMENTS ====================
export function AdminDepartments({ onBack }: { onBack: () => void }) {
  const { departments, addDepartment, deleteDepartment } = useData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState('');
  const [icon, setIcon] = useState('fa-book');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const icons = ['fa-book', 'fa-bone', 'fa-heart-pulse', 'fa-flask', 'fa-leaf', 'fa-paw', 'fa-atom', 'fa-vial', 'fa-brain', 'fa-graduation-cap', 'fa-stethoscope', 'fa-microscope'];

  const handleAdd = () => {
    if (!name) return;
    addDepartment({ name, icon, description, subjects: subjects.split(',').map(s => s.trim()).filter(Boolean) });
    setName(''); setDescription(''); setSubjects(''); setShowForm(false);
  };

  return (
    <div>
      <Header title="Departments" subtitle={`${departments.length} departments`} showBack onBack={onBack} rightAction={
        <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      <div className="p-4 space-y-3">
        {showForm && (
          <div className="card border-2 border-teal-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Add Department</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department Name *" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Subjects (comma separated)" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <div className="mb-3">
              <label className="text-[10px] text-gray-500">Icon</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {icons.map((ic) => (
                  <button key={ic} onClick={() => setIcon(ic)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${icon === ic ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <i className={`fas ${ic} text-xs`} />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} className="btn-primary">Add Department</button>
          </div>
        )}

        {departments.length === 0 ? (
          <EmptyState icon="fa-building" title="No Departments" message="Add your first department" />
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0"><i className={`fas ${dept.icon} text-teal-600`} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{dept.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{dept.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">{dept.subjects.map((s) => (<span key={s} className="badge badge-teal text-[9px]">{s}</span>))}</div>
                </div>
                <button onClick={() => setConfirmDelete(dept.id)} className="text-red-400 text-xs"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Department?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { deleteDepartment(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN COURSES ====================
export function AdminCourses({ onBack }: { onBack: () => void }) {
  const { courses, addCourse, deleteCourse, users } = useData();
  const [viewMode, setViewMode] = useState<'courses' | 'curriculum'>('courses');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'NEET', description: '', subjects: '', duration: '6 months', icon: 'fa-book', color: '#0d9488' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const facultyUsers = users.filter(u => u.role === 'faculty');

  const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#16a34a', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed'];
  const icons = ['fa-book', 'fa-book-medical', 'fa-atom', 'fa-flask', 'fa-dna', 'fa-brain', 'fa-calculator', 'fa-globe-europe', 'fa-stethoscope', 'fa-user-md', 'fa-hospital', 'fa-microscope'];

  const handleAdd = () => {
    if (!formData.name) return;
    addCourse({
      name: formData.name, category: formData.category, description: formData.description,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      facultyIds: [], studentIds: [], duration: formData.duration, icon: formData.icon, color: formData.color,
    });
    setFormData({ name: '', category: 'NEET', description: '', subjects: '', duration: '6 months', icon: 'fa-book', color: '#0d9488' });
    setShowForm(false);
  };

  return (
    <div>
      <Header 
        title={viewMode === 'courses' ? 'Courses & Batches' : 'Academic Curriculum'} 
        subtitle={viewMode === 'courses' ? `${courses.length} courses configured` : '3-Tier Academic Hierarchy'} 
        showBack 
        onBack={onBack} 
        rightAction={
          viewMode === 'courses' ? (
            <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
          ) : undefined
        } 
      />

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mx-4 mt-3 mb-1">
        <button
          onClick={() => setViewMode('courses')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'courses' ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-book-medical text-[11px]" />
          <span>Course Batches</span>
        </button>
        <button
          onClick={() => setViewMode('curriculum')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'curriculum' ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-layer-group text-[11px]" />
          <span>Curriculum Hierarchy</span>
        </button>
      </div>

      {viewMode === 'curriculum' ? (
        <div className="p-4">
          <CurriculumBrowser canManage={true} />
        </div>
      ) : (
      <div className="p-4 space-y-3">
        {showForm && (
          <div className="card border-2 border-teal-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Add Course</h3>
            <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Course Name *" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2">
              <option>NEET</option><option>IMAT</option><option>UCAT</option><option>MCAT</option><option>Other</option>
            </select>
            <input value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <input value={formData.subjects} onChange={(e) => setFormData(p => ({ ...p, subjects: e.target.value }))} placeholder="Subjects (comma separated)" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <input value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="Duration" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <div className="mb-2">
              <label className="text-[10px] text-gray-500">Color</label>
              <div className="flex flex-wrap gap-2 mt-1">{colors.map((c) => (<button key={c} onClick={() => setFormData(p => ({ ...p, color: c }))} className={`w-7 h-7 rounded-full ${formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />))}</div>
            </div>
            <div className="mb-3">
              <label className="text-[10px] text-gray-500">Icon</label>
              <div className="flex flex-wrap gap-2 mt-1">{icons.map((ic) => (<button key={ic} onClick={() => setFormData(p => ({ ...p, icon: ic }))} className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.icon === ic ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}><i className={`fas ${ic} text-xs`} /></button>))}</div>
            </div>
            <button onClick={handleAdd} className="btn-primary">Add Course</button>
          </div>
        )}

        {courses.length === 0 ? (
          <EmptyState icon="fa-book" title="No Courses" message="Add your first course" />
        ) : (
          courses.map((course) => (
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
                    <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{course.studentIds.length} students</span>
                    <span className="text-[10px] text-gray-400"><i className="fas fa-clock mr-1" />{course.duration}</span>
                  </div>
                </div>
                <button onClick={() => setConfirmDelete(course.id)} className="text-red-400 text-xs"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Course?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { deleteCourse(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN RESOURCES ====================
export function AdminResources({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { resources: localResources, deleteResource, updateResource } = useData();
  const { resources: cloudResources, loading: cloudLoading, deleteResource: deleteCloudResource } = useResources();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Merge cloud resources with local DataContext resources
  const allResources = useMemo(() => {
    const list: any[] = [];
    const seen = new Set<string>();

    cloudResources.forEach((cr) => {
      seen.add(cr.id);
      list.push({
        id: cr.id,
        title: cr.title,
        type: cr.resource_type === 'NOTE' ? 'Notes' : cr.resource_type === 'VIDEO' ? 'Video' : cr.resource_type === 'PYQ' ? 'PYQ' : cr.resource_type === 'DPP' ? 'Assignment' : 'PDF',
        subject: cr.subjectName || 'General',
        courseId: cr.subject_id,
        uploaderId: cr.created_by,
        uploaderName: cr.creatorName || 'Faculty',
        date: cr.created_at?.split('T')[0] || 'Recent',
        size: cr.sizeFormatted || 'Cloud',
        status: cr.status === 'PUBLISHED' ? 'published' : 'draft',
        examCategory: 'Medical',
        fileName: cr.file?.file_name || 'document.pdf',
        storagePath: cr.file?.storage_path,
        signedUrl: cr.signedUrl,
        fileData: cr.fileData,
        isCloud: !!cr.file?.storage_path,
      });
    });

    localResources.forEach((lr) => {
      if (!seen.has(lr.id)) {
        list.push({
          ...lr,
          isCloud: !!lr.storagePath,
        });
      }
    });

    return list;
  }, [cloudResources, localResources]);

  const cloudCount = allResources.filter(r => r.isCloud).length;
  const publishedCount = allResources.filter(r => r.status === 'published').length;

  const filters = ['All', 'Published', 'Draft', 'Cloud', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment'];

  let filtered = allResources;
  if (filter === 'Cloud') {
    filtered = filtered.filter(r => r.isCloud);
  } else if (filter === 'Published') {
    filtered = filtered.filter(r => r.status === 'published');
  } else if (filter === 'Draft') {
    filtered = filtered.filter(r => r.status === 'draft');
  } else if (filter !== 'All') {
    filtered = filtered.filter(r => r.type === filter);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.subject && r.subject.toLowerCase().includes(q)) ||
      (r.uploaderName && r.uploaderName.toLowerCase().includes(q))
    );
  }

  const handleTogglePublish = async (resourceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateResource(resourceId, { status: newStatus as any });
    if (user) {
      await adminService.moderateResource(
        resourceId,
        newStatus as any,
        { id: user.id, name: user.name || 'Admin' },
        `Admin toggled status to ${newStatus}`
      );
    }
  };

  const handleDelete = async (resourceId: string) => {
    const target = allResources.find(res => res.id === resourceId);
    if (target?.storagePath) {
      try {
        await deleteCloudResource(resourceId, target.storagePath);
      } catch (err) {
        console.warn('Failed to delete cloud resource:', err);
      }
    }
    deleteResource(resourceId);
    setConfirmDelete(null);
  };

  return (
    <div>
      <Header 
        title="Resource Governance" 
        subtitle={`${allResources.length} total resources`} 
        showBack 
        onBack={onBack}
        rightAction={
          cloudLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" title="Syncing cloud resources..." />
          ) : undefined
        }
      />

      <div className="p-4 space-y-3">
        {/* Cloud Storage & Governance Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card p-2.5 text-center mb-0 bg-teal-50/60 border-teal-100">
            <p className="text-teal-700 text-base font-bold">{allResources.length}</p>
            <p className="text-[10px] text-teal-800 font-medium">Total Items</p>
          </div>
          <div className="card p-2.5 text-center mb-0 bg-blue-50/60 border-blue-100">
            <p className="text-blue-700 text-base font-bold flex items-center justify-center gap-1">
              <i className="fas fa-cloud text-xs" />
              <span>{cloudCount}</span>
            </p>
            <p className="text-[10px] text-blue-800 font-medium">Cloud Storage</p>
          </div>
          <div className="card p-2.5 text-center mb-0 bg-emerald-50/60 border-emerald-100">
            <p className="text-emerald-700 text-base font-bold">{publishedCount}</p>
            <p className="text-[10px] text-emerald-800 font-medium">Published</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, or faculty..."
            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === f ? 'bg-teal-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'Cloud' && <i className="fas fa-cloud mr-1 text-[10px]" />}
              {f}
            </button>
          ))}
        </div>

        {/* Resources List */}
        {filtered.length === 0 ? (
          <EmptyState icon="fa-folder" title="No Resources Found" message="No resources match the selected criteria" />
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <div key={r.id} className="card p-3 mb-0 flex items-center gap-3 border border-gray-100 hover:border-teal-300 transition">
                <div 
                  onClick={() => onNavigate && onNavigate('resource-view', r)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-teal-50 transition"
                >
                  <i className={`fas ${
                    r.type === 'Video' ? 'fa-play text-blue-500' :
                    r.type === 'PDF' ? 'fa-file-pdf text-red-500' :
                    r.type === 'Notes' ? 'fa-sticky-note text-yellow-500' : 'fa-file-alt text-teal-600'
                  } text-base`} />
                </div>

                <div 
                  onClick={() => onNavigate && onNavigate('resource-view', r)} 
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <p className="text-xs font-bold text-gray-800 truncate hover:text-teal-600 transition">{r.title}</p>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                    {r.isCloud && (
                      <span className="badge badge-teal text-[8px] py-0 px-1">
                        <i className="fas fa-cloud mr-0.5" />Cloud
                      </span>
                    )}
                    <span>{r.subject} • {r.uploaderName} • {r.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(r.id, r.status)}
                    className="cursor-pointer"
                    title={`Click to ${r.status === 'published' ? 'unpublish' : 'publish'}`}
                  >
                    <StatusBadge status={r.status} />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(r.id, r.status)}
                    className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      r.status === 'published'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                    title={r.status === 'published' ? 'Move to Draft' : 'Approve & Publish'}
                  >
                    <i className={`fas ${r.status === 'published' ? 'fa-eye-slash' : 'fa-check'} text-[9px]`} />
                  </button>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('resource-view', r)}
                      className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="Preview resource document"
                    >
                      <i className="fas fa-eye text-[10px]" />
                    </button>
                  )}
                  <button 
                    onClick={() => setConfirmDelete(r.id)} 
                    className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-xs transition"
                    title="Delete resource"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h3 className="text-base font-bold text-gray-800 mb-1">Delete Resource?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to permanently delete this resource and any associated storage file from the cloud?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button 
                onClick={() => { if (confirmDelete) handleDelete(confirmDelete); }} 
                className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN ANNOUNCEMENTS ====================
export function AdminAnnouncements({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const { announcements, deleteAnnouncement, updateAnnouncement } = useData();

  return (
    <div>
      <Header title="Announcements" subtitle={`${announcements.length} announcements`} showBack onBack={onBack} rightAction={
        <button onClick={() => onNavigate('send-announcement')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      <div className="p-4 space-y-3">
        {announcements.length === 0 ? (
          <EmptyState icon="fa-bullhorn" title="No Announcements" message="Create your first announcement" />
        ) : (
          announcements.map((a) => (
            <div key={a.id} className={`card ${a.pinned ? 'border-l-4 border-teal-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {a.pinned && <i className="fas fa-thumbtack text-teal-500 text-xs" />}
                    <p className="text-sm font-bold text-gray-800">{a.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{a.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400">By {a.authorName}</span>
                    <span className="text-[10px] text-gray-400">{a.date}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateAnnouncement(a.id, { pinned: !a.pinned })} className="text-[10px] text-teal-600">{a.pinned ? 'Unpin' : 'Pin'}</button>
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-[10px] text-red-500"><i className="fas fa-trash mr-1" />Delete</button>
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

// ==================== SEND ANNOUNCEMENT ====================
export function SendAnnouncement({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { addAnnouncement } = useData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePost = () => {
    if (!title || !content || !user) return;
    addAnnouncement({ title, content, pinned, authorId: user.id, authorName: user.name, authorRole: user.role });
    setSuccess(true);
    setTimeout(() => onBack(), 1500);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-check text-green-500 text-2xl" /></div>
          <p className="text-sm font-semibold text-gray-800">Announcement Posted!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="New Announcement" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content *" rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          <span className="text-sm text-gray-600">Pin this announcement</span>
        </div>
        <button onClick={handlePost} disabled={!title || !content} className="btn-primary disabled:opacity-50"><i className="fas fa-bullhorn mr-2" />Post Announcement</button>
      </div>
    </div>
  );
}

// ==================== SEND NOTIFICATION ====================
export function SendNotification({ onBack }: { onBack: () => void }) {
  const { addNotification } = useData();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    if (!title || !message) return;
    addNotification({ title, message, type: 'notification', targetRole });
    setSuccess(true);
    setTimeout(() => onBack(), 1500);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-check text-green-500 text-2xl" /></div>
          <p className="text-sm font-semibold text-gray-800">Notification Sent!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Send Notification" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Send To</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 'all', label: 'All Members' }, { id: 'student', label: 'Students' }, { id: 'faculty', label: 'Faculty' }, { id: 'admin', label: 'Admins' }].map((r) => (
              <button key={r.id} onClick={() => setTargetRole(r.id)} className={`py-2 rounded-lg text-xs font-medium ${targetRole === r.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{r.label}</button>
            ))}
          </div>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message *" rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        <button onClick={handleSend} disabled={!title || !message} className="btn-primary disabled:opacity-50"><i className="fas fa-paper-plane mr-2" />Send Notification</button>
      </div>
    </div>
  );
}

// ==================== ADMIN NOTIFICATIONS ====================
export function AdminNotifications({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const { notifications } = useData();

  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} rightAction={
        <button onClick={() => onNavigate('send-notification')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      <div className="p-4 space-y-2">
        {notifications.length === 0 ? (
          <EmptyState icon="fa-bell-slash" title="No Notifications" message="Send your first notification" />
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              <span className="text-[10px] text-teal-600 mt-1">To: {n.targetRole === 'all' ? 'All Members' : n.targetRole}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN COMMUNITY ====================
export function AdminCommunity({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { communityMessages, addCommunityMessage, deleteCommunityMessage, togglePinMessage } = useData();
  const [newMessage, setNewMessage] = useState('');

  const handlePost = () => {
    if (!newMessage.trim() || !user) return;
    addCommunityMessage({ authorId: user.id, authorName: user.name, authorRole: user.role, message: newMessage, pinned: false });
    setNewMessage('');
  };

  return (
    <div>
      <Header title="Community" showBack onBack={onBack} />
      <div className="p-4 space-y-3">
        <div className="card">
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Post as admin..." rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none mb-2" />
          <button onClick={handlePost} className="btn-primary">Post</button>
        </div>
        {communityMessages.map((msg) => (
          <div key={msg.id} className={`card ${msg.pinned ? 'border-l-4 border-teal-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">{msg.authorRole === 'Admin' ? '👨‍💼' : msg.authorRole === 'Faculty' ? '👨‍⚕️' : '👩‍🎓'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{msg.authorName}</p>
                  <span className={`badge text-[9px] ${msg.authorRole === 'Admin' ? 'badge-navy' : msg.authorRole === 'Faculty' ? 'badge-teal' : 'badge-green'}`}>{msg.authorRole}</span>
                </div>
                <p className="text-[10px] text-gray-400">{msg.time}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePinMessage(msg.id)} className="text-teal-500 text-xs"><i className="fas fa-thumbtack" /></button>
                <button onClick={() => deleteCommunityMessage(msg.id)} className="text-red-400 text-xs"><i className="fas fa-trash" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-700">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== AUDIT LOGS ====================
export function AuditLogs({ onBack }: { onBack: () => void }) {
  const { auditLogs } = useData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'USER', 'RESOURCE', 'ENROLLMENT', 'ANNOUNCEMENT'];

  let filtered = auditLogs;
  if (filter !== 'All') {
    filtered = filtered.filter(l => l.action.toUpperCase().includes(filter));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  }

  const handleExport = () => {
    const formattedLogs = auditLogs.map(l => ({
      id: l.id,
      action: l.action,
      userId: l.userId,
      userName: l.userName,
      details: l.details,
      timestamp: l.timestamp,
      severity: 'info' as const,
    }));
    adminService.exportAuditLogs(formattedLogs);
  };

  return (
    <div>
      <Header 
        title="Audit Logs" 
        subtitle={`${filtered.length} recorded events`} 
        showBack 
        onBack={onBack}
        rightAction={
          <button 
            onClick={handleExport} 
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export audit log report as JSON"
          >
            <i className="fas fa-download text-[10px]" />
            <span>Export</span>
          </button>
        } 
      />

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action, actor, or details..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map((c) => (
            <button 
              key={c} 
              onClick={() => setFilter(c)} 
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === c ? 'bg-teal-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Logs List */}
        {filtered.length === 0 ? (
          <EmptyState icon="fa-history" title="No Logs" message="No activity records match the criteria." />
        ) : (
          filtered.map((log) => {
            const isCritical = log.action.includes('DELETE') || log.action.includes('SUSPEND');
            const isEnrollment = log.action.includes('Enroll');
            const isResource = log.action.includes('Resource');

            return (
              <div key={log.id} className="card p-3 mb-0 border border-gray-100 hover:border-teal-200 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500' : isEnrollment ? 'bg-teal-500' : isResource ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <span className="badge badge-navy text-[9px] py-0 px-1.5 font-bold tracking-wide">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-700 bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-800 text-[11px] mb-0.5">
                    <i className="fas fa-user-shield text-teal-600 mr-1" />
                    {log.userName}
                  </p>
                  <p className="text-[11px] text-gray-600">{log.details}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN SETTINGS ====================
export function AdminSettings({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();
  const { users, departments, courses, resources, auditLogs } = useData();
  const [showInfo, setShowInfo] = useState<string | null>(null);

  return (
    <div>
      <Header title="Settings" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        {/* Profile Card */}
        <div className="gradient-header rounded-xl p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 text-2xl">{user?.avatar}</div>
          <h2 className="text-white font-bold">{user?.name}</h2>
          <p className="text-gray-300 text-xs">{user?.email}</p>
          <span className="badge badge-teal mt-2 inline-block">Administrator</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="card text-center py-3">
            <p className="text-lg font-bold text-teal-600">{users.length}</p>
            <p className="text-[10px] text-gray-500">Total Users</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-lg font-bold text-teal-600">{auditLogs.length}</p>
            <p className="text-[10px] text-gray-500">Audit Logs</p>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-shield-alt', label: 'Security Settings', desc: 'Password policy, session timeout', info: 'Security settings are configured at the server level. All passwords are hashed using bcrypt. Sessions expire after 24 hours of inactivity.' },
            { icon: 'fa-bell', label: 'Notification Settings', desc: 'Push notifications, email', info: 'In-app notifications are active. Push notifications require FCM configuration. Email notifications can be enabled per user preference.' },
            { icon: 'fa-database', label: 'Database / Data', desc: `${users.length} users, ${courses.length} courses, ${departments.length} departments`, info: 'All data is stored in localStorage for this demo. In production, use PostgreSQL with regular backups.' },
            { icon: 'fa-folder', label: 'Storage', desc: `${resources.length} resources stored`, info: 'Resources metadata is stored locally. In production, files are stored in private object storage with signed URLs.' },
            { icon: 'fa-history', label: 'Audit Logs', desc: `${auditLogs.length} entries`, action: 'audit-logs' },
          ].map((item, i) => (
            <button key={i} onClick={() => item.action ? onNavigate(item.action) : setShowInfo(item.info || '')} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <div className="flex-1 text-left"><p className="text-sm text-gray-700">{item.label}</p><p className="text-[10px] text-gray-400">{item.desc}</p></div>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>

        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><i className="fas fa-sign-out-alt" /> Sign Out</button>
        <button onClick={logout} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><i className="fas fa-exchange-alt" /> Switch Account / Sign In</button>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInfo(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3"><i className="fas fa-info-circle text-teal-500 text-xl" /></div>
            <p className="text-sm text-gray-700 text-center">{showInfo}</p>
            <button onClick={() => setShowInfo(null)} className="btn-primary mt-4">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
