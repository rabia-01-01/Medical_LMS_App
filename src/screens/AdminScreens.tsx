import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, User } from '../context/DataContext';
import { Header, StatusBadge, EmptyState } from '../components/Navigation';

// ==================== ADMIN DASHBOARD ====================
export function AdminDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const { users, departments, courses, resources, quizzes, announcements } = useData();

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
            </button>
            <div className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center text-lg">{user?.avatar}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Users', value: users.length, icon: 'fa-users' },
            { label: 'Courses', value: courses.length, icon: 'fa-book' },
            { label: 'Departments', value: departments.length, icon: 'fa-building' },
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
          <button onClick={() => onNavigate('add-user')} className="card flex flex-col items-center py-3 active:bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center mb-1"><i className="fas fa-user-plus text-teal-600" /></div>
            <span className="text-[10px] font-medium text-gray-700">Add User</span>
          </button>
          <button onClick={() => onNavigate('send-announcement')} className="card flex flex-col items-center py-3 active:bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center mb-1"><i className="fas fa-bullhorn text-orange-600" /></div>
            <span className="text-[10px] font-medium text-gray-700">Announce</span>
          </button>
          <button onClick={() => onNavigate('send-notification')} className="card flex flex-col items-center py-3 active:bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-1"><i className="fas fa-paper-plane text-blue-600" /></div>
            <span className="text-[10px] font-medium text-gray-700">Notify</span>
          </button>
        </div>

        {/* Management */}
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-users', label: 'Manage Users', desc: `${users.length} users`, screen: 'users' },
            { icon: 'fa-building', label: 'Departments', desc: `${departments.length} departments`, screen: 'departments' },
            { icon: 'fa-book-medical', label: 'Courses', desc: `${courses.length} courses`, screen: 'courses' },
            { icon: 'fa-folder-open', label: 'Resources', desc: `${resources.length} resources`, screen: 'resources' },
            { icon: 'fa-clipboard-check', label: 'Quizzes', desc: `${quizzes.length} quizzes`, screen: 'quizzes' },
            { icon: 'fa-bullhorn', label: 'Announcements', desc: `${announcements.length} announcements`, screen: 'announcements' },
            { icon: 'fa-comments', label: 'Community', desc: 'Moderate messages', screen: 'community' },
            { icon: 'fa-bell', label: 'Notifications', desc: 'Send & manage', screen: 'notifications' },
            { icon: 'fa-history', label: 'Audit Logs', desc: 'Security logs', screen: 'audit-logs' },
            { icon: 'fa-cog', label: 'Settings', desc: 'Configuration', screen: 'settings' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.screen)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><i className={`fas ${item.icon} text-gray-600 text-sm`} /></div>
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

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.password) return;
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
  const { users, deleteUser, updateUser } = useData();
  const [filter, setFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const roles = ['All', 'Students', 'Faculty', 'Admins'];

  let filtered = users;
  if (filter === 'Students') filtered = users.filter(u => u.role === 'student');
  if (filter === 'Faculty') filtered = users.filter(u => u.role === 'faculty');
  if (filter === 'Admins') filtered = users.filter(u => u.role === 'admin');

  const handleDelete = (id: string) => {
    deleteUser(id);
    setConfirmDelete(null);
  };

  const toggleStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) updateUser(id, { status: user.status === 'active' ? 'suspended' : 'active' });
  };

  return (
    <div>
      <Header title="Manage Users" subtitle={`${filtered.length} users`} showBack onBack={onBack} rightAction={
        <button onClick={() => onNavigate('add-user')} className="text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {roles.map((r) => (
          <button key={r} onClick={() => setFilter(r)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === r ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{r}</button>
        ))}
      </div>
      <div className="px-4 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon="fa-users" title="No Users" message="No users found. Add users to get started." />
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${u.role === 'student' ? 'bg-teal-100' : u.role === 'faculty' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                <p className="text-[10px] text-gray-400">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${u.role === 'student' ? 'badge-teal' : u.role === 'faculty' ? 'badge-navy' : 'badge-green'}`}>{u.role}</span>
                  <span className={`text-[10px] ${u.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>{u.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => toggleStatus(u.id)} className={`text-[10px] px-2 py-1 rounded ${u.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => setConfirmDelete(u.id)} className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600"><i className="fas fa-trash mr-1" />Delete</button>
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
        <button onClick={() => setShowForm(!showForm)} className="text-white text-sm"><i className="fas fa-plus" /></button>
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
      <Header title="Courses" subtitle={`${courses.length} courses`} showBack onBack={onBack} rightAction={
        <button onClick={() => setShowForm(!showForm)} className="text-white text-sm"><i className="fas fa-plus" /></button>
      } />
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
export function AdminResources({ onBack }: { onBack: () => void }) {
  const { resources, deleteResource } = useData();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div>
      <Header title="Resources" subtitle={`${resources.length} resources`} showBack onBack={onBack} />
      <div className="p-4 space-y-2">
        {resources.length === 0 ? (
          <EmptyState icon="fa-folder" title="No Resources" message="No resources uploaded yet" />
        ) : (
          resources.map((r) => (
            <div key={r.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <i className={`fas ${r.type === 'Video' ? 'fa-play text-blue-500' : 'fa-file-pdf text-red-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{r.title}</p>
                <p className="text-[10px] text-gray-400">{r.uploaderName} • {r.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <button onClick={() => setConfirmDelete(r.id)} className="text-red-400 text-xs"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Resource?</h3>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { deleteResource(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm">Delete</button>
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
        <button onClick={() => onNavigate('send-announcement')} className="text-white text-sm"><i className="fas fa-plus" /></button>
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
        <button onClick={() => onNavigate('send-notification')} className="text-white text-sm"><i className="fas fa-plus" /></button>
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
  return (
    <div>
      <Header title="Audit Logs" subtitle="Security & access tracking" showBack onBack={onBack} />
      <div className="p-4 space-y-2">
        {auditLogs.length === 0 ? (
          <EmptyState icon="fa-history" title="No Logs" message="No activity recorded yet" />
        ) : (
          auditLogs.map((log) => (
            <div key={log.id} className="card">
              <div className="flex items-center justify-between mb-1">
                <span className="badge badge-navy">{log.action}</span>
                <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-700 mt-1"><strong>User:</strong> {log.userName}</p>
              <p className="text-xs text-gray-500">{log.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN SETTINGS ====================
export function AdminSettings({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth();
  return (
    <div>
      <Header title="Settings" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-shield-alt', label: 'Security Settings', desc: 'Password policy, session timeout' },
            { icon: 'fa-bell', label: 'Notification Settings', desc: 'Push notifications, email' },
            { icon: 'fa-database', label: 'Database Backup', desc: 'Data is saved locally' },
            { icon: 'fa-storage', label: 'Storage Management', desc: 'Local storage usage' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <div className="flex-1 text-left"><p className="text-sm text-gray-700">{item.label}</p><p className="text-[10px] text-gray-400">{item.desc}</p></div>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>
        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><i className="fas fa-sign-out-alt" /> Sign Out</button>
      </div>
    </div>
  );
}
