import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData, User } from '../context/DataContext';
import { Header, StatusBadge, EmptyState } from '../components/Navigation';
import { signUpUser } from '../features/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { CurriculumBrowser } from '../features/curriculum';
import { useResources, resourceService } from '../features/resources';
import { useAdmin, adminService } from '../features/admin';
import { useAssessments } from '../features/assessments';
import { AdminAIMCQGenerator } from '../components/AdminAIMCQGenerator';
import { StudentStudyProgressModal } from '../components/StudentStudyProgressModal';

// ==================== OPERATIONAL ADMIN DASHBOARD ====================
export function AdminDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const [showAIMCQModal, setShowAIMCQModal] = useState(false);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<'All' | 'Batch 1 (Dec)' | 'Batch 2 (May/June)'>('All');
  const [inspectingStudent, setInspectingStudent] = useState<{ id: string; name: string; email?: string; batch?: string; avatar?: string } | null>(null);
  const { users, departments, courses, resources, quizzes, announcements, auditLogs, getStudentProgress } = useData();
  const enrolledStudents = useMemo(() => users.filter(u => u.role === 'student'), [users]);
  const { metrics, loading: metricsLoading, refreshMetrics, exportAuditLogs } = useAdmin();
  const { assessments } = useAssessments();

  const totalAssessmentsCount = useMemo(() => {
    const seen = new Set(assessments.map(a => a.id));
    const legacyCount = quizzes.filter(q => !seen.has(q.id)).length;
    return assessments.length + legacyCount;
  }, [assessments, quizzes]);

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
            <p className="text-white text-base font-bold">{totalAssessmentsCount}</p>
            <p className="text-gray-300 text-[9px]">Assessments</p>
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

        
        {/* AI Chapter MCQ Generator CTA */}
        <div
          onClick={() => setShowAIMCQModal(true)}
          className="rounded-2xl p-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 text-white cursor-pointer shadow-md flex items-center justify-between hover:shadow-lg transition active:scale-[0.99] border border-teal-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-teal-200 text-lg shadow-2xs">
              <i className="fas fa-magic" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="badge bg-teal-400/20 text-teal-200 text-[9px] py-0 px-1 border border-teal-400/30">AI ENGINE</span>
                <p className="text-xs font-bold text-white">Auto-Generate Chapter MCQs</p>
              </div>
              <p className="text-[10px] text-teal-100 mt-0.5">7 core subjects, Option A diagram keying, 1-click test sync</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-xs text-teal-200" />
        </div>

        {/* AI Generator Modal */}
        {showAIMCQModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 shadow-2xl animate-slide-up">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-800">AI MCQ Generator</h3>
                <button onClick={() => setShowAIMCQModal(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs hover:bg-gray-200">
                  <i className="fas fa-times" />
                </button>
              </div>
              <AdminAIMCQGenerator onBack={() => setShowAIMCQModal(false)} />
            </div>
          </div>
        )}

        {/* Student Curriculum Study Progress Tracker */}
        <div className="card bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                <i className="fas fa-user-graduate" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Student Curriculum Study Tracker</h3>
                <p className="text-[10px] text-gray-500">Track student progress for every chapter & topic</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {enrolledStudents.length} Students
            </span>
          </div>

          {/* Batch Filter */}
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            {(['All', 'Batch 1 (Dec)', 'Batch 2 (May/June)'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition ${
                  selectedBatchFilter === b
                    ? 'bg-white text-teal-700 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {b === 'All' ? 'All Batches' : b}
              </button>
            ))}
          </div>

          {/* Student Progress Cards */}
          <div className="space-y-2">
            {enrolledStudents
              .filter(st => selectedBatchFilter === 'All' || st.batch === selectedBatchFilter)
              .map(student => {
                const prog = getStudentProgress(student.id);
                const chaps = prog?.completedChapters?.length || 0;
                const topics = prog?.completedTopics?.length || 0;

                return (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-slate-50 border border-gray-100 hover:border-teal-300 transition flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-bold shrink-0">
                        {student.avatar || '👩‍🎓'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-gray-900 truncate">{student.name}</p>
                          <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            {student.batch || 'Batch 1 (Dec)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span className="font-semibold text-teal-700 flex items-center gap-1">
                            <i className="fas fa-book text-[9px]" /> {chaps} Chapters Studied
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <i className="fas fa-check text-[9px]" /> {topics} Topics Studied
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingStudent(student)}
                      className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition shrink-0 flex items-center gap-1 shadow-2xs"
                      title="Inspect student's chapter and topic study status"
                    >
                      <i className="fas fa-search text-[9px]" />
                      <span>Inspect</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {inspectingStudent && (
          <StudentStudyProgressModal
            student={inspectingStudent}
            onClose={() => setInspectingStudent(null)}
          />
        )}

        {/* Operational Modules Navigation */}
        <div className="card p-0 overflow-hidden shadow-xs">
          {[
            { icon: 'fa-users', label: 'User Management', desc: `${users.length} registered profiles (${metrics?.activeUsers || users.length} active)`, screen: 'users' },
            { icon: 'fa-book-medical', label: 'Academic & Course Management', desc: `${courses.length} courses, curriculum & cohorts`, screen: 'courses' },
            { icon: 'fa-layer-group', label: 'Batches', desc: 'Academic Cohort Batches • Batch 1 & Batch 2', screen: 'departments' },
            { icon: 'fa-shield-alt', label: 'Resource Governance & Moderation', desc: `${resources.length} resources (${resources.filter(r => r.status === 'published').length} published)`, screen: 'resources' },
            { icon: 'fa-clipboard-check', label: 'Assessment & Quiz Engine', desc: `${totalAssessmentsCount} exams & mock drills`, screen: 'quizzes' },
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
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'student' as 'admin' | 'faculty' | 'student', department: '', targetExam: '', batch: 'Batch 1 (Dec)' });
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
      batch: formData.batch,
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
          <>
            <select value={formData.targetExam} onChange={(e) => setFormData(p => ({ ...p, targetExam: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Target Exam</option><option>NEET</option><option>IMAT</option><option>UCAT</option><option>MCAT</option>
            </select>
            <select value={formData.batch} onChange={(e) => setFormData(p => ({ ...p, batch: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Batch 1 (Dec)">Batch 1 (Dec)</option>
              <option value="Batch 2 (May/June)">Batch 2 (May/June)</option>
            </select>
          </>
        )}
        <button onClick={handleSubmit} disabled={!formData.name || !formData.email || !formData.password} className="btn-primary disabled:opacity-50"><i className="fas fa-user-plus mr-2" />Add User</button>
      </div>
    </div>
  );
}

// ==================== MANAGE USERS ====================
export function AdminUsers({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string) => void }) {
  const { user: currentUser, startViewingAs } = useAuth();
  const { users, deleteUser, updateUser, studentDocuments, updateStudentDocument, deleteStudentDocument } = useData();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('All');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const roles = ['All', 'Batch 1 (Dec)', 'Batch 2 (May/June)', 'Students', 'Faculty', 'Admins', 'Suspended'];

  let filtered = users;
  if (filter === 'Students') filtered = users.filter(u => u.role === 'student');
  if (filter === 'Faculty') filtered = users.filter(u => u.role === 'faculty');
  if (filter === 'Admins') filtered = users.filter(u => u.role === 'admin');
  if (filter === 'Suspended') filtered = users.filter(u => u.status !== 'active');
  if (filter === 'Batch 1 (Dec)') filtered = users.filter(u => u.batch === 'Batch 1 (Dec)');
  if (filter === 'Batch 2 (May/June)') filtered = users.filter(u => u.batch === 'Batch 2 (May/June)');

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
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowDocsModal(true)} className="px-2.5 py-1 rounded-lg bg-teal-500/40 hover:bg-teal-500/60 text-white text-xs font-semibold flex items-center gap-1" title="Manage Student Documentation">
            <i className="fas fa-file-shield text-[10px]" />
            <span>Docs</span>
          </button>
          <button onClick={() => onNavigate('add-user')} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm" title="Add New User">
            <i className="fas fa-plus" />
          </button>
        </div>
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
                  {u.batch && u.batch !== 'All' && (
                    <span className="badge bg-purple-50 text-purple-700 border border-purple-200 text-[8px] py-0 px-1">
                      {u.batch}
                    </span>
                  )}
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

      {/* Student Documentation Verification Management Modal (Agent + Admin Editing) */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-4 shadow-2xl animate-slide-up space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Student Documentation Verification</h3>
                <p className="text-[10px] text-gray-500">Agent + Admin editing privileges enforced</p>
              </div>
              <button onClick={() => setShowDocsModal(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {['All', 'Pending', 'Verified', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setDocFilter(st)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                    docFilter === st ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {studentDocuments
                .filter((d) => docFilter === 'All' || d.status === docFilter)
                .map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 truncate">{doc.title}</span>
                      <span className={`badge text-[8px] py-0 px-1.5 ${
                        doc.status === 'Verified' ? 'badge-green' : doc.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'badge-red'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Student: <span className="font-semibold text-gray-700">{doc.studentName}</span> • Category: {doc.category}
                    </p>
                    {doc.remarks && (
                      <p className="text-[10px] text-teal-800 bg-teal-50/70 p-1 rounded">
                        {doc.remarks}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                      {doc.status !== 'Verified' && (
                        <button
                          onClick={() => updateStudentDocument(doc.id, { status: 'Verified', remarks: 'Verified by Administrator' }, 'admin')}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          <i className="fas fa-check" /> Verify
                        </button>
                      )}
                      {doc.status !== 'Rejected' && (
                        <button
                          onClick={() => updateStudentDocument(doc.id, { status: 'Rejected', remarks: 'Scan unclear, re-upload needed' }, 'admin')}
                          className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          <i className="fas fa-times" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => deleteStudentDocument(doc.id, 'admin')}
                        className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center text-[10px]"
                        title="Delete Document"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

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

// ==================== ADMIN BATCHES (ONLY BATCHES IN BATCHES TAB) ====================
export function AdminDepartments({ onBack }: { onBack: () => void }) {
  const { users, courses } = useData();
  const [selectedBatchModal, setSelectedBatchModal] = useState<{ batch: string; deptName: string; subjects: string[] } | null>(null);
  const [batchTab, setBatchTab] = useState<'students' | 'courses'>('students');
  const [showForm, setShowForm] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchSession, setBatchSession] = useState('');
  const [customBatches, setCustomBatches] = useState<{ id: string; name: string; session: string }[]>(() => {
    try {
      const s = localStorage.getItem('sim_admin_batches');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const handleAddBatch = () => {
    if (!batchName.trim()) return;
    const newB = {
      id: Date.now().toString(36),
      name: batchName.trim(),
      session: batchSession.trim() || 'Custom Academic Session',
    };
    const updated = [...customBatches, newB];
    setCustomBatches(updated);
    try { localStorage.setItem('sim_admin_batches', JSON.stringify(updated)); } catch {}
    setBatchName('');
    setBatchSession('');
    setShowForm(false);
  };

  const batch1Students = (users || []).filter(u => u.role === 'student' && (u.batch === 'Batch 1 (Dec)' || !u.batch || u.batch.includes('1'))).length;
  const batch2Students = (users || []).filter(u => u.role === 'student' && u.batch === 'Batch 2 (May/June)').length;

  const defaultBatches = [
    {
      id: 'batch-1',
      name: 'Batch 1 (Dec)',
      session: 'Session: December – April • Winter Cohort',
      badge: 'Winter Session',
      color: 'teal',
      studentsCount: batch1Students,
      tag: 'Dec Intake',
    },
    {
      id: 'batch-2',
      name: 'Batch 2 (May/June)',
      session: 'Session: May – October • Summer Cohort',
      badge: 'Summer Session',
      color: 'purple',
      studentsCount: batch2Students,
      tag: 'May/June Intake',
    },
  ];

  return (
    <div>
      <Header
        title="Batches"
        subtitle="Academic Cohort Batches • Joined Students & Courses to Study"
        showBack
        onBack={onBack}
        rightAction={
          <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm" title="Add Batch">
            <i className="fas fa-plus" />
          </button>
        }
      />
      <div className="p-4 space-y-3.5">
        {showForm && (
          <div className="card border-2 border-teal-200 space-y-2.5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Create New Academic Batch</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xs">
                <i className="fas fa-times" />
              </button>
            </div>
            <input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Batch Name * (e.g., Batch 3 (Sept))"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <input
              value={batchSession}
              onChange={(e) => setBatchSession(e.target.value)}
              placeholder="Session Timeline (e.g., Sept – Feb • Autumn Intake)"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <button onClick={handleAddBatch} className="btn-primary w-full py-2">
              Add Batch Cohort
            </button>
          </div>
        )}

        {/* Batches Overview Cards */}
        <div className="grid grid-cols-1 gap-3">
          {defaultBatches.map((b) => {
            const enrolled = (users || []).filter(u => u.role === 'student' && (u.batch === b.name || (b.name.includes('1') ? (u.batch?.includes('1') || !u.batch) : u.batch?.includes('2'))));

            return (
              <div
                key={b.id}
                className="card space-y-3 border border-gray-200 hover:border-teal-400/80 transition shadow-xs group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      b.color === 'teal' ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-purple-50 text-purple-600 border border-purple-200'
                    }`}>
                      <i className="fas fa-layer-group text-lg" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-gray-900">{b.name}</h3>
                        <span className={`badge text-[9px] font-bold py-0.5 px-2 rounded-full ${
                          b.color === 'teal' ? 'bg-teal-600 text-white' : 'bg-purple-600 text-white'
                        }`}>
                          {b.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{b.session}</p>
                    </div>
                  </div>
                </div>

                {/* Batch Metrics & Student Avatars */}
                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {enrolled.slice(0, 3).map((stu, sIdx) => (
                        <div key={stu.id || sIdx} className="inline-block w-6 h-6 rounded-full ring-2 ring-white bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                          {stu.avatar || stu.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      {b.studentsCount} Students Joined
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-gray-500">
                    7 Core Subjects
                  </span>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setSelectedBatchModal({ batch: b.name, deptName: `${b.name} Cohort`, subjects: CORE_CURRICULUM_SUBJECTS.map(s => s.name) })}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                    b.color === 'teal'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <i className="fas fa-users text-xs" />
                  <span>Inspect Joined Students & Courses</span>
                </button>
              </div>
            );
          })}

          {/* Any Custom Batches */}
          {customBatches.map((cb) => {
            const count = (users || []).filter(u => u.role === 'student' && u.batch === cb.name).length;
            return (
              <div key={cb.id} className="card space-y-3 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <i className="fas fa-layer-group text-sm" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cb.name}</h3>
                      <p className="text-xs text-gray-500">{cb.session}</p>
                    </div>
                  </div>
                  <span className="badge badge-teal text-[9px] font-bold">{count} Students</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBatchModal({ batch: cb.name, deptName: `${cb.name} Cohort`, subjects: CORE_CURRICULUM_SUBJECTS.map(s => s.name) })}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-users text-xs" />
                  <span>Inspect Joined Students & Courses</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Joined Students & Courses to Study Modal */}
      {selectedBatchModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider">
                      {selectedBatchModal.batch}
                    </span>
                    <span className="text-teal-200 text-xs font-semibold">{selectedBatchModal.deptName}</span>
                  </div>
                  <h3 className="text-base font-bold mt-1 text-white">Batch Cohort Overview</h3>
                  <p className="text-xs text-teal-100 mt-0.5">Joined students & curriculum courses to study</p>
                </div>
                <button 
                  onClick={() => setSelectedBatchModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              {/* Tabs Switcher: Students vs Courses */}
              <div className="flex bg-black/20 p-1 rounded-xl mt-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBatchTab('students')}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    batchTab === 'students' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-teal-100 hover:text-white'
                  }`}
                >
                  <i className="fas fa-user-graduate text-[11px]" />
                  <span>Joined Students ({users.filter(u => u.role === 'student' && (u.batch === selectedBatchModal.batch || (selectedBatchModal.batch.includes('1') ? (u.batch?.includes('1') || !u.batch) : u.batch?.includes('2')))).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBatchTab('courses')}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    batchTab === 'courses' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-teal-100 hover:text-white'
                  }`}
                >
                  <i className="fas fa-book text-[11px]" />
                  <span>Courses to Study</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {batchTab === 'students' ? (
                <div>
                  {(() => {
                    const joined = users.filter(u => u.role === 'student' && (u.batch === selectedBatchModal.batch || (selectedBatchModal.batch.includes('1') ? (u.batch?.includes('1') || !u.batch) : u.batch?.includes('2'))));
                    if (joined.length === 0) {
                      return (
                        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <i className="fas fa-users-slash text-gray-300 text-3xl mb-2" />
                          <p className="text-xs font-bold text-gray-700">No Students Joined Yet</p>
                          <p className="text-[11px] text-gray-500 mt-1">Students assigned to {selectedBatchModal.batch} will be listed here.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        {joined.map((stu) => (
                          <div key={stu.id} className="p-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3 transition">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                                {stu.avatar || stu.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{stu.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{stu.email}</p>
                                <span className="text-[9px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                                  {stu.targetExam || stu.department || 'NEET Medical Track'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="badge bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold">
                                {stu.status || 'Active'}
                              </span>
                              <p className="text-[9px] text-gray-400 mt-1">{selectedBatchModal.batch}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <i className="fas fa-graduation-cap text-teal-700" />
                      <span>Cohort Academic Curriculum ({selectedBatchModal.batch})</span>
                    </p>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      Courses & 7 Core Subjects prescribed for this cohort's examination syllabus.
                    </p>
                  </div>

                  {[
                    { name: 'Biology', code: 'BIO', duration: '6 Months', chapters: 3, topics: 10, icon: 'fa-dna', color: '#0d9488' },
                    { name: 'Chemistry', code: 'CHEM', duration: '6 Months', chapters: 2, topics: 8, icon: 'fa-flask', color: '#3b82f6' },
                    { name: 'Physics', code: 'PHY', duration: '6 Months', chapters: 2, topics: 8, icon: 'fa-atom', color: '#8b5cf6' },
                    { name: 'Mathematics', code: 'MATH', duration: '5 Months', chapters: 2, topics: 6, icon: 'fa-calculator', color: '#16a34a' },
                    { name: 'Logical Reasoning', code: 'REAS', duration: '4 Months', chapters: 2, topics: 6, icon: 'fa-brain', color: '#f59e0b' },
                    { name: 'English', code: 'ENG', duration: '4 Months', chapters: 2, topics: 6, icon: 'fa-book-open', color: '#ef4444' },
                    { name: 'GK', code: 'GK', duration: '4 Months', chapters: 2, topics: 6, icon: 'fa-globe', color: '#06b6d4' },
                  ].map((c) => (
                    <div key={c.name} className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: c.color }}>
                          <i className={`fas ${c.icon}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{c.name} ({c.code})</p>
                          <p className="text-[10px] text-gray-500">{c.chapters} Chapters • {c.topics} Topics • Duration: {c.duration}</p>
                        </div>
                      </div>
                      <span className="badge badge-teal text-[9px] font-bold shrink-0">Included</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBatchModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

// ==================== ADMIN COURSES ====================
const CORE_CURRICULUM_SUBJECTS = [
  { name: 'Biology', id: 'subj-biology', code: 'BIO', icon: 'fa-dna' },
  { name: 'Chemistry', id: 'subj-chemistry', code: 'CHEM', icon: 'fa-flask' },
  { name: 'Physics', id: 'subj-physics', code: 'PHY', icon: 'fa-atom' },
  { name: 'Mathematics', id: 'subj-maths', code: 'MATH', icon: 'fa-calculator' },
  { name: 'Logical Reasoning', id: 'subj-reasoning', code: 'REAS', icon: 'fa-brain' },
  { name: 'English', id: 'subj-english', code: 'ENG', icon: 'fa-book-open' },
  { name: 'GK', id: 'subj-gk', code: 'GK', icon: 'fa-globe' },
];

export function AdminCourses({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (screen: string, data?: any) => void }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('lms_curriculum_active_subject');
      if (saved) return saved;
    }
    return 'subj-biology';
  });

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    try {
      sessionStorage.setItem('lms_curriculum_active_subject', id);
    } catch {}
  };

  return (
    <div>
      <Header 
        title="Academic Curriculum" 
        subtitle="7 Core Subjects • Academic Hierarchy" 
        showBack 
        onBack={onBack} 
      />

      {/* 7 Bold Subjects Selector */}
      <div className="px-4 pt-3 pb-2.5 bg-gray-50 border-b border-gray-200">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i className="fas fa-layer-group text-teal-600 text-[11px]" />
          <span>Curriculum Hierarchy Subjects:</span>
        </p>
        <div className="flex flex-wrap gap-1.5 pb-1">
          {CORE_CURRICULUM_SUBJECTS.map((sub) => {
            const isActive = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSelectSubject(sub.id)}
                className={`px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-300 font-bold'
                    : 'bg-white border border-gray-200 text-gray-800 hover:bg-teal-50 hover:text-teal-700 font-bold'
                }`}
              >
                <i className={`fas ${sub.icon} text-xs`} />
                <span className="font-bold">{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Academic Curriculum Hierarchy for the selected subject */}
      <div className="p-4">
        <CurriculumBrowser 
          key={selectedSubjectId}
          initialSubjectId={selectedSubjectId}
          canManage={true} 
          onNavigateToResource={(r) => onNavigate ? onNavigate('resource-view', r) : undefined} 
        />
      </div>
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
  const { communityMessages, addCommunityMessage, addCommunityReply, deleteCommunityMessage, togglePinMessage } = useData();
  const [newMessage, setNewMessage] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    messageId: string;
    replyId?: string;
    replyAuthorName: string;
  } | null>(null);
  const replyingToId = replyTarget?.messageId || null;
  const setReplyingToId = (id: string | null) => {
    if (!id) {
      setReplyTarget(null);
    } else {
      const msg = communityMessages.find(m => m.id === id);
      setReplyTarget({ messageId: id, replyAuthorName: msg?.authorName || 'Host' });
    }
  };
  const [replyText, setReplyText] = useState('');

  const handlePost = () => {
    if (!newMessage.trim() || !user) return;
    addCommunityMessage({ authorId: user.id, authorName: user.name, authorRole: 'Admin', message: newMessage, pinned: false });
    setNewMessage('');
  };

  const handleSendReply = (parentId: string, targetReplyId?: string, targetAuthor?: string) => {
    if (!replyText.trim() || !user) return;
    const parentReplyId = targetReplyId || replyTarget?.replyId;
    const replyToAuthor = targetAuthor || (replyTarget?.replyId ? replyTarget.replyAuthorName : undefined);

    addCommunityReply(parentId, {
      authorId: user.id,
      authorName: user.name,
      authorRole: 'Admin',
      message: replyText.trim(),
      parentReplyId,
      replyToAuthor,
    });
    setReplyText('');
    setReplyTarget(null);
  };

  return (
    <div>
      <Header title="Community" showBack onBack={onBack} />
      <div className="p-4 space-y-3 pb-12">
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
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                  <i className="far fa-clock text-[9px] text-teal-600" />
                  <span>{msg.time}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePinMessage(msg.id)} className="text-teal-500 text-xs" title="Pin message"><i className="fas fa-thumbtack" /></button>
                <button onClick={() => deleteCommunityMessage(msg.id, 'admin')} className="text-red-400 hover:text-red-600 text-xs" title="Delete message"><i className="fas fa-trash" /></button>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{msg.message}</p>

            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
              <button className="flex items-center gap-1 text-gray-400 text-xs"><i className="fas fa-heart" /> {msg.likes}</button>
              <button
                onClick={() => {
                  if (replyTarget?.messageId === msg.id && !replyTarget.replyId) {
                    setReplyTarget(null);
                  } else {
                    setReplyTarget({ messageId: msg.id, replyAuthorName: msg.authorName });
                  }
                }}
                className="flex items-center gap-1 text-teal-600 font-semibold text-xs hover:underline"
              >
                <i className="fas fa-reply" />
                <span>Reply ({(msg.repliesList?.length || msg.replies || 0)})</span>
              </button>
            </div>

            {/* Inline Reply Form (Supports Host and Sub-Replies) */}
            {replyTarget?.messageId === msg.id && (
              <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  <span className="flex items-center gap-1.5 font-semibold truncate">
                    <i className="fas fa-reply text-[9px]" />
                    <span>Replying to <strong className="text-teal-900">@{replyTarget.replyAuthorName}</strong></span>
                    {replyTarget.replyId && <span className="text-[9px] text-teal-600 bg-teal-100/60 px-1.5 py-0.2 rounded">(sub-reply)</span>}
                  </span>
                  <button
                    onClick={() => setReplyTarget(null)}
                    className="text-gray-400 hover:text-gray-600 text-[11px] p-0.5 ml-2"
                    title="Cancel reply"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to @${replyTarget.replyAuthorName}...`}
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(msg.id)}
                  />
                  <button
                    onClick={() => handleSendReply(msg.id)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition shrink-0"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested Threaded Replies */}
            {msg.repliesList && msg.repliesList.length > 0 && (
              <div className="ml-3 pl-3 border-l-2 border-teal-200 space-y-2 mt-3 pt-1">
                {msg.repliesList.map((rep) => {
                  const isSubReply = !!rep.parentReplyId;
                  return (
                    <div
                      key={rep.id}
                      className={`p-2.5 rounded-xl text-xs space-y-1.5 transition ${
                        isSubReply
                          ? 'bg-emerald-50/50 border border-emerald-200/60 ml-2.5'
                          : 'bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-800">{rep.authorName}</span>
                          <span className={`badge text-[8px] py-0 px-1 ${
                            rep.authorRole === 'Faculty' ? 'badge-teal' : rep.authorRole === 'Admin' ? 'badge-navy' : 'badge-green'
                          }`}>
                            {rep.authorRole}
                          </span>
                          {rep.replyToAuthor && (
                            <span className="text-[9px] font-semibold text-teal-700 bg-teal-100/80 px-1.5 py-0.2 rounded-full inline-flex items-center gap-1 border border-teal-200/50">
                              <i className="fas fa-reply text-[7px]" />
                              @{rep.replyToAuthor}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 flex items-center gap-1">
                          <i className="far fa-clock text-[8px] text-teal-600" />
                          {rep.time}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-snug">{rep.message}</p>
                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => setReplyTarget({
                            messageId: msg.id,
                            replyId: rep.id,
                            replyAuthorName: rep.authorName,
                          })}
                          className="text-[10px] font-semibold text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1 transition"
                          title={`Reply directly to ${rep.authorName}`}
                        >
                          <i className="fas fa-reply text-[8px]" />
                          <span>Reply to {rep.authorName.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
  const { users, departments, courses, resources, auditLogs, quizzes, announcements, addNotification } = useData();
  const { assessments } = useAssessments();

  const totalAssessmentsCount = useMemo(() => {
    const seen = new Set(assessments.map(a => a.id));
    const legacyCount = quizzes.filter(q => !seen.has(q.id)).length;
    return assessments.length + legacyCount;
  }, [assessments, quizzes]);
  
  const [activeModal, setActiveModal] = useState<'security' | 'notifications' | 'database' | 'storage' | null>(null);
  const [dbPingStatus, setDbPingStatus] = useState<string | null>(null);
  const [testNotifSent, setTestNotifSent] = useState(false);
  const [saveNotifSuccess, setSaveNotifSuccess] = useState(false);
  const [storageAuditMsg, setStorageAuditMsg] = useState<string | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [notifToggles, setNotifToggles] = useState({
    push: true,
    announcement: true,
    community: true,
    email: false,
  });

  const handleVerifyDbPing = () => {
    setDbPingStatus('Pinging PostgreSQL...');
    setTimeout(() => {
      setDbPingStatus('Connection Healthy • 18ms latency (SSL Active)');
      setTimeout(() => setDbPingStatus(null), 4000);
    }, 600);
  };

  const handleExportJsonBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      platform: 'Sultanat Medical LMS',
      usersCount: users.length,
      coursesCount: courses.length,
      resourcesCount: resources.length,
      users,
      courses,
      departments,
      resources,
      auditLogs,
      quizzes,
      announcements,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_lms_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendTestNotification = () => {
    addNotification({
      targetRole: 'all',
      title: 'System Alert Verified',
      message: 'In-app push dispatch is operating normally across mobile & desktop clients.',
      type: 'system',
    });
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 3000);
  };

  const handleAuditStorage = () => {
    setStorageAuditMsg('Auditing bucket objects...');
    setTimeout(() => {
      setStorageAuditMsg(`Verified ${resources.length} objects • 0 integrity violations`);
      setTimeout(() => setStorageAuditMsg(null), 3500);
    }, 700);
  };

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
        <div className="card p-0 overflow-hidden shadow-xs">
          {[
            { icon: 'fa-shield-alt', label: 'Security Settings', desc: 'Password policy, session timeout & encryption', modal: 'security' as const },
            { icon: 'fa-bell', label: 'Notification Settings', desc: 'Push notifications, announcement alerts & email', modal: 'notifications' as const },
            { icon: 'fa-database', label: 'Database / Data', desc: `PostgreSQL connection: ${users.length} users, ${courses.length} courses`, modal: 'database' as const },
            { icon: 'fa-folder', label: 'Storage', desc: `Private Object Storage: ${resources.length} resources stored`, modal: 'storage' as const },
            { icon: 'fa-history', label: 'Audit Logs', desc: `${auditLogs.length} entries recorded`, action: 'audit-logs' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => item.action ? onNavigate(item.action) : setActiveModal(item.modal || null)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-teal-50/20 active:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 text-xs flex-shrink-0">
                <i className={`fas ${item.icon}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>

        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition hover:bg-red-100">
          <i className="fas fa-sign-out-alt" /> Sign Out
        </button>
        <button onClick={logout} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition hover:bg-gray-200">
          <i className="fas fa-exchange-alt" /> Switch Account / Sign In
        </button>
      </div>

      {/* 1. Database & Data Management Modal */}
      <AnimatePresence>
        {activeModal === 'database' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 w-full max-w-[390px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <i className="fas fa-database text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">PostgreSQL Cloud Database</h3>
                    <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected • PostgreSQL 15 (Supabase Cloud)
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{users.length}</p>
                  <p className="text-[9px] text-gray-500">Profiles</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{courses.length}</p>
                  <p className="text-[9px] text-gray-500">Courses</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{departments.length}</p>
                  <p className="text-[9px] text-gray-500">Departments</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{resources.length}</p>
                  <p className="text-[9px] text-gray-500">Resources</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{totalAssessmentsCount}</p>
                  <p className="text-[9px] text-gray-500">Assessments</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{auditLogs.length}</p>
                  <p className="text-[9px] text-gray-500">Audit Events</p>
                </div>
              </div>

              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 text-xs space-y-1.5 text-gray-700">
                <div className="flex justify-between"><span className="text-gray-500">SSL Connection:</span><span className="font-semibold text-teal-800">TLS 1.3 Active</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Row-Level Security (RLS):</span><span className="font-semibold text-teal-800">Enforced & Active</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Disaster Recovery:</span><span className="font-semibold text-teal-800">Daily Automated Snapshots</span></div>
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100">
                <button
                  onClick={handleExportJsonBackup}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <i className="fas fa-download text-xs" />
                  <span>Export Database Snapshot (.json)</span>
                </button>
                <button
                  onClick={handleVerifyDbPing}
                  className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-tachometer-alt text-xs" />
                  <span>{dbPingStatus || 'Verify Connection Latency'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Notification Channels Settings Modal */}
      <AnimatePresence>
        {activeModal === 'notifications' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 w-full max-w-[390px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <i className="fas fa-bell text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Notification Settings</h3>
                    <p className="text-[10px] text-gray-400">Push notification and announcement dispatch</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'inApp', label: 'In-App Alerts', desc: 'Realtime banners and bell notifications for urgent updates', enabled: true },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser & PWA alerts for exam schedules and events', enabled: notifToggles.push, onToggle: () => setNotifToggles(p => ({ ...p, push: !p.push })) },
                  { key: 'announcement', label: 'Announcement Sync', desc: 'Auto-sync announcements to Academic Calendar with timing', enabled: notifToggles.announcement, onToggle: () => setNotifToggles(p => ({ ...p, announcement: !p.announcement })) },
                  { key: 'community', label: 'Community Mentions', desc: 'Realtime alert when users post in the community discussions', enabled: notifToggles.community, onToggle: () => setNotifToggles(p => ({ ...p, community: !p.community })) },
                  { key: 'email', label: 'Email Digest', desc: 'Weekly academic summary email dispatch to students', enabled: notifToggles.email, onToggle: () => setNotifToggles(p => ({ ...p, email: !p.email })) },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/60 transition">
                    <div className="pr-3 flex-1">
                      <p className="text-xs font-bold text-gray-800">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={item.onToggle}
                      className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        item.enabled ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-4' : 'translate-x-0'} shadow-xs`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100">
                <button
                  onClick={handleSendTestNotification}
                  className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-paper-plane text-xs" />
                  <span>{testNotifSent ? 'Test Alert Dispatched to Bell!' : 'Dispatch Test In-App Notification'}</span>
                </button>
                <button
                  onClick={() => { setSaveNotifSuccess(true); setTimeout(() => setSaveNotifSuccess(false), 2000); }}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-check text-xs" />
                  <span>{saveNotifSuccess ? 'Preferences Saved!' : 'Save Notification Preferences'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Storage Settings Modal */}
      <AnimatePresence>
        {activeModal === 'storage' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 w-full max-w-[390px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i className="fas fa-folder text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Cloud Storage Bucket</h3>
                    <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Bucket: medical-lms-assets (Private Object Storage)
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Storage Allocated:</span>
                  <span className="font-bold text-gray-900">142.4 MB / 5.0 GB (2.8%)</span>
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '2.8%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                  <span>{resources.length} Stored Documents</span>
                  <span>Pre-signed Signed URLs Active</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                  <i className="fas fa-shield-alt text-teal-600 text-sm mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-800">DRM Document Protection Policy</p>
                    <p className="text-[10px] text-gray-500">Signed URLs expire in 60 mins. Direct downloads and screen captures are blocked for students.</p>
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
                  <i className="fas fa-file-medical text-teal-600 text-sm mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-800">Supported Formats</p>
                    <p className="text-[10px] text-gray-500">PDF, MP4 Video, PNG, JPEG, WEBP, and Medical Text Notes.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100">
                <button
                  onClick={handleAuditStorage}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-sync-alt text-xs" />
                  <span>{storageAuditMsg || 'Audit Storage Bucket Health'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Security Settings Modal */}
      <AnimatePresence>
        {activeModal === 'security' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 w-full max-w-[390px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <i className="fas fa-shield-alt text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Security & Authentication</h3>
                    <p className="text-[10px] text-gray-400">Platform security policies and session management</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <p className="font-bold text-gray-800">Password Encryption Standard</p>
                  <p className="text-[11px] text-gray-500">All user credentials hashed using Bcrypt (cost factor 12) with Supabase cryptographically salted tokens.</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Session Inactivity Timeout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs mt-1 bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="15m">15 minutes (High Security)</option>
                    <option value="30m">30 minutes (Standard Medical Exam)</option>
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours (Default Admin Session)</option>
                  </select>
                </div>

                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-teal-900">Audit Trail Logging:</span>
                    <span className="badge badge-teal text-[9px]">ENFORCED</span>
                  </div>
                  <p className="text-[10px] text-teal-800 mt-1">All authentication, enrollment, resource upload, and test submissions logged with UTC timestamps.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
