import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, Course, Resource } from '../context/DataContext';
import { Header, StatusBadge, EmptyState } from '../components/Navigation';
import { EnrollStudentsModal } from '../components/EnrollStudentsModal';
import { CurriculumBrowser, useSubjects, useChapters } from '../features/curriculum';
import { resourceService, normalizeResourceType, useResources } from '../features/resources';
import { AssessmentCreator } from '../features/assessments';

// ==================== FACULTY DASHBOARD ====================
export function FacultyDashboard({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses, resources, quizzes, notifications } = useData();
  const { resources: cloudResources } = useResources();
  const assignedCourses = useMemo(() => courses.filter(c => (c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);
  const adminCourses = useMemo(() => courses.filter(c => !(c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);

  const myResources = useMemo(() => {
    const ids = new Set<string>();
    const list: any[] = [];
    cloudResources.forEach((cr) => {
      if (cr.created_by === user?.id || !cr.created_by) {
        ids.add(cr.id);
        list.push(cr);
      }
    });
    resources.forEach((r) => {
      if (r.uploaderId === user?.id && !ids.has(r.id)) {
        list.push(r);
      }
    });
    return list;
  }, [cloudResources, resources, user?.id]);
  const myQuizzes = quizzes.filter(q => q.createdById === user?.id);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Welcome,</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Faculty'}</h1>
            <p className="text-teal-300 text-xs">{user?.department || 'Faculty'}</p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
              {unreadNotifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">{unreadNotifs}</span>}
            </button>
            <button onClick={() => onNavigate('profile')} className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-lg">{user?.avatar}</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div onClick={() => onNavigate('courses')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/15 transition">
            <p className="text-teal-300 text-lg font-bold">{courses.length}</p>
            <p className="text-gray-300 text-[10px]">Courses ({assignedCourses.length} assigned)</p>
          </div>
          <div onClick={() => onNavigate('faculty-resources')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/15 transition">
            <p className="text-teal-300 text-lg font-bold">{myResources.length}</p>
            <p className="text-gray-300 text-[10px]">Resources</p>
          </div>
          <div onClick={() => onNavigate('submissions')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/15 transition">
            <p className="text-teal-300 text-lg font-bold">{myQuizzes.length}</p>
            <p className="text-gray-300 text-[10px]">Quizzes</p>
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('upload')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-2"><i className="fas fa-cloud-upload-alt text-teal-600" /></div>
            <span className="text-xs font-medium text-gray-700">Upload Resource</span>
          </button>
          <button onClick={() => onNavigate('create-quiz')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2"><i className="fas fa-clipboard-list text-purple-600" /></div>
            <span className="text-xs font-medium text-gray-700">Create Quiz</span>
          </button>
          <button onClick={() => onNavigate('announcements')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2"><i className="fas fa-bullhorn text-orange-600" /></div>
            <span className="text-xs font-medium text-gray-700">Announcements</span>
          </button>
          <button onClick={() => onNavigate('community')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2"><i className="fas fa-comments text-blue-600" /></div>
            <span className="text-xs font-medium text-gray-700">Community</span>
          </button>
        </div>

        {/* Assigned and Admin Uploaded Courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-gray-800 font-bold text-sm">Courses ({courses.length})</h2>
              <p className="text-[10px] text-gray-400">Assigned courses & courses uploaded by Admin</p>
            </div>
            <button onClick={() => onNavigate('courses')} className="text-teal-600 text-xs font-medium hover:underline">View All</button>
          </div>
          {courses.length === 0 ? (
            <div className="card text-center py-4"><p className="text-xs text-gray-500">No courses available yet</p></div>
          ) : (
            courses.slice(0, 4).map((course) => {
              const isAssigned = (course.facultyIds || []).includes(user?.id || '');
              return (
                <div 
                  key={course.id} 
                  onClick={() => onNavigate('course-detail', course)} 
                  className="card flex items-center gap-3 mb-2 cursor-pointer hover:border-teal-300 active:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: course.color + '20' }}>
                    <i className={`fas ${course.icon}`} style={{ color: course.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">{course.name}</p>
                      {isAssigned ? (
                        <span className="badge badge-teal text-[9px] py-0 px-1.5 flex-shrink-0">Assigned</span>
                      ) : (
                        <span className="badge bg-purple-50 text-purple-700 border border-purple-200 text-[9px] py-0 px-1.5 flex-shrink-0 flex items-center gap-0.5">
                          <i className="fas fa-user-shield text-[8px]" /> Admin Course
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{course.studentIds.length} students enrolled • {course.category}</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-300 text-xs" />
                </div>
              );
            })
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">Recent Uploads</h2>
            <button onClick={() => onNavigate('faculty-resources')} className="text-teal-600 text-xs font-medium hover:underline">View All</button>
          </div>
          {myResources.length === 0 ? (
            <div className="card text-center py-4"><p className="text-xs text-gray-500">No resources uploaded yet</p></div>
          ) : (
            myResources.slice(0, 3).map((r) => (
              <div 
                key={r.id} 
                onClick={() => onNavigate('resource-view', r)} 
                className="card flex items-center gap-3 mb-2 cursor-pointer hover:border-teal-300 active:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${
                    r.type === 'Video' ? 'fa-play text-blue-500' :
                    r.type === 'PDF' ? 'fa-file-pdf text-red-500' :
                    r.type === 'Notes' ? 'fa-sticky-note text-yellow-500' : 'fa-file-alt text-teal-600'
                  } text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{r.title}</p>
                  <p className="text-[10px] text-gray-400">{r.subject} • {r.date}</p>
                </div>
                <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded flex-shrink-0">
                  View
                </span>
                <i className="fas fa-chevron-right text-gray-300 text-xs" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== FACULTY COURSES ====================
export function FacultyCourses({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses } = useData();
  const [viewMode, setViewMode] = useState<'courses' | 'curriculum'>('courses');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'assigned' | 'admin'>('all');
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);

  const assignedCourses = useMemo(() => courses.filter(c => (c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);
  const adminCourses = useMemo(() => courses.filter(c => !(c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);

  const displayedCourses = useMemo(() => {
    if (scopeFilter === 'assigned') return assignedCourses;
    if (scopeFilter === 'admin') return adminCourses;
    return courses;
  }, [courses, assignedCourses, adminCourses, scopeFilter]);

  return (
    <div>
      <Header 
        title={viewMode === 'courses' ? 'Faculty Courses' : 'Academic Curriculum'} 
        subtitle={viewMode === 'courses' ? `${courses.length} courses (${assignedCourses.length} assigned • ${adminCourses.length} admin)` : 'Subjects, Chapters & Topics'} 
      />

      {/* Primary Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mx-4 mb-3">
        <button
          onClick={() => setViewMode('courses')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'courses' ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-book-medical text-[11px]" />
          <span>Courses ({courses.length})</span>
        </button>
        <button
          onClick={() => setViewMode('curriculum')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'curriculum' ? 'bg-white text-teal-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-layer-group text-[11px]" />
          <span>Manage Curriculum</span>
        </button>
      </div>

      {viewMode === 'curriculum' ? (
        <div className="px-4 pb-4">
          <CurriculumBrowser canManage={true} />
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Scope Filter: All vs Assigned vs Admin-uploaded */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setScopeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition border ${
                scopeFilter === 'all'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setScopeFilter('assigned')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition border ${
                scopeFilter === 'assigned'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              My Assigned ({assignedCourses.length})
            </button>
            <button
              onClick={() => setScopeFilter('admin')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition border ${
                scopeFilter === 'admin'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Admin Uploaded ({adminCourses.length})
            </button>
          </div>

          {displayedCourses.length === 0 ? (
            <EmptyState icon="fa-book" title="No Courses" message="No courses found in this category" />
          ) : (
          displayedCourses.map((course) => {
            const isAssigned = (course.facultyIds || []).includes(user?.id || '');
            return (
            <div key={course.id} className="card">
              <div className="flex items-start gap-3">
                <div 
                  onClick={() => onNavigate('course-detail', course)} 
                  className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0" 
                  style={{ backgroundColor: course.color + '20' }}
                >
                  <i className={`fas ${course.icon} text-lg`} style={{ color: course.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div onClick={() => onNavigate('course-detail', course)} className="cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm font-bold text-gray-800 hover:text-teal-600 transition truncate">{course.name}</p>
                      {isAssigned ? (
                        <span className="badge badge-teal text-[9px] py-0 px-1.5 flex-shrink-0">Assigned</span>
                      ) : (
                        <span className="badge bg-purple-50 text-purple-700 border border-purple-200 text-[9px] py-0 px-1.5 flex-shrink-0 flex items-center gap-0.5">
                          <i className="fas fa-shield-alt text-[8px]" /> Admin Uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        <i className="fas fa-users mr-1" />{course.studentIds.length} students enrolled
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {course.category} • {course.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button 
                      onClick={() => setEnrollingCourse(course)} 
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
                    >
                      <i className="fas fa-user-plus text-[10px]" />
                      <span>Enroll Students</span>
                    </button>
                    <button onClick={() => onNavigate('upload')} className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5">
                      <i className="fas fa-upload text-[10px]" />
                      <span>Upload</span>
                    </button>
                    <button onClick={() => onNavigate('create-quiz')} className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5">
                      <i className="fas fa-clipboard-list text-[10px]" />
                      <span>Quiz</span>
                    </button>
                    <button onClick={() => onNavigate('course-detail', course)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ml-auto">
                      <span>Details</span>
                      <i className="fas fa-chevron-right text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
      )}

      {/* Enrollment Modal */}
      {enrollingCourse && (
        <EnrollStudentsModal
          course={enrollingCourse}
          onClose={() => setEnrollingCourse(null)}
        />
      )}
    </div>
  );
}

// ==================== UPLOAD RESOURCE ====================
export function UploadResource({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { courses, addResource } = useData();
  const { subjects } = useSubjects();

  const [formData, setFormData] = useState({ 
    title: '', 
    type: 'PDF', 
    subjectId: '',
    chapterId: '',
    subject: '', 
    courseId: '', 
    examCategory: 'NEET', 
    size: '',
    fileName: '',
    fileData: '',
    mimeType: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load chapters dynamically when a subject is selected
  const { chapters } = useChapters(formData.subjectId || undefined);
  const myCourses = courses.filter(c => c.facultyIds.includes(user?.id || ''));

  const handleSubjectChange = (subjectId: string) => {
    const selected = subjects.find((s: any) => s.id === subjectId);
    setFormData(prev => ({
      ...prev,
      subjectId,
      subject: selected ? selected.name : prev.subject,
      chapterId: '' // reset chapter
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);
    setUploadProgress('Preparing file...');
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type || 'application/octet-stream',
        size: `${sizeMB} MB`,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }));
      setUploading(false);
      setUploadProgress('');
    };

    reader.onerror = () => {
      setErrorMessage('Error reading selected file');
      setUploading(false);
      setUploadProgress('');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.courseId || !user || (!formData.fileData && !selectedFile)) {
      alert('Please fill all required fields and upload a file');
      return;
    }

    try {
      setUploading(true);
      setErrorMessage(null);
      setUploadProgress('Uploading to Supabase Storage...');

      const fileToUpload = selectedFile || new Blob([formData.fileData || ''], { type: formData.mimeType || 'application/pdf' });

      // 1. Supabase Storage upload + PostgreSQL insert
      const created = await resourceService.createResource({
        title: formData.title,
        description: `${formData.examCategory} • ${formData.subject || 'General'}`,
        resourceType: normalizeResourceType(formData.type),
        subjectId: formData.subjectId || subjects[0]?.id || 'sub-general',
        chapterId: formData.chapterId || null,
        status: 'PUBLISHED',
        file: fileToUpload,
        fileName: formData.fileName,
        mimeType: formData.mimeType,
        fileSize: selectedFile?.size || 0,
        base64Data: formData.fileData,
      }, user.id, user.name);

      // 2. DataContext state update
      addResource({
        title: formData.title,
        type: formData.type,
        subject: formData.subject || (subjects.find((s: any) => s.id === formData.subjectId)?.name || 'General'),
        courseId: formData.courseId,
        uploaderId: user.id,
        uploaderName: user.name,
        size: formData.size,
        status: 'published',
        examCategory: formData.examCategory,
        fileName: formData.fileName,
        fileData: formData.fileData,
        mimeType: formData.mimeType,
        storagePath: created.file?.storage_path,
        signedUrl: created.signedUrl || undefined,
        subjectId: formData.subjectId,
        chapterId: formData.chapterId,
      });

      setSuccess(true);
      setTimeout(() => { onBack(); }, 1500);
    } catch (err: any) {
      console.error('Resource upload failed:', err);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress('');
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-cloud-upload-alt text-teal-600 text-2xl" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Resource Uploaded to Cloud Storage!</p>
          <p className="text-xs text-gray-500 mt-1">Secured & synced with academic curriculum</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Upload Resource" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <i className="fas fa-exclamation-circle" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Resource Type</label>
          <div className="grid grid-cols-4 gap-2">
            {['PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Q.Paper', 'Practice'].map((type) => (
              <button 
                key={type} 
                onClick={() => setFormData(p => ({ ...p, type }))} 
                className={`py-2 px-1 rounded-lg text-[10px] font-medium transition ${formData.type === type ? 'bg-teal-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Title *</label>
          <input 
            value={formData.title} 
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
            placeholder="e.g., Kinematics Formula Sheet & Practice Set" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Curriculum Subject *</label>
            <select 
              value={formData.subjectId} 
              onChange={(e) => handleSubjectChange(e.target.value)} 
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select subject</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Chapter (Optional)</label>
            <select 
              value={formData.chapterId} 
              onChange={(e) => setFormData(p => ({ ...p, chapterId: e.target.value }))} 
              disabled={!formData.subjectId || chapters.length === 0}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="">Select chapter</option>
              {chapters.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Course *</label>
            <select 
              value={formData.courseId} 
              onChange={(e) => setFormData(p => ({ ...p, courseId: e.target.value }))} 
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select course</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {myCourses.length === 0 && courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Target Exam</label>
            <select 
              value={formData.examCategory} 
              onChange={(e) => setFormData(p => ({ ...p, examCategory: e.target.value }))} 
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>NEET</option><option>IMAT</option><option>UCAT</option><option>MCAT</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Cloud Storage Upload *</label>
          <input
            type="file"
            id="resource-file-upload"
            accept=".pdf,.mp4,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label 
            htmlFor="resource-file-upload" 
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-teal-400 transition block bg-gray-50/50"
          >
            {uploading ? (
              <>
                <div className="w-8 h-8 border-3 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-teal-700">{uploadProgress || 'Processing...'}</p>
                <p className="text-[10px] text-gray-400 mt-1">Connecting to Supabase Storage</p>
              </>
            ) : formData.fileName ? (
              <>
                <i className="fas fa-check-circle text-3xl text-teal-500 mb-2" />
                <p className="text-sm text-gray-800 font-semibold truncate px-4">{formData.fileName}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="badge badge-teal text-[10px]"><i className="fas fa-cloud mr-1" />Storage Ready</span>
                  <span className="text-[10px] text-gray-400">{formData.size} • Tap to replace</span>
                </div>
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">Tap or drop file here</p>
                <p className="text-[10px] text-gray-400 mt-1">Direct upload to private bucket: PDF, MP4, Office, Images</p>
              </>
            )}
          </label>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={!formData.title || !formData.courseId || (!formData.fileData && !selectedFile) || uploading} 
          className="btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading to Cloud...</span>
            </>
          ) : (
            <>
              <i className="fas fa-cloud-upload-alt" />
              <span>Upload to Supabase Storage</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ==================== CREATE QUIZ / ASSESSMENT ====================
export function CreateQuiz({ onBack }: { onBack: () => void }) {
  return <AssessmentCreator onBack={onBack} />;
}

// ==================== FACULTY SUBMISSIONS ====================
export function FacultySubmissions({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { quizzes } = useData();
  const myQuizzes = quizzes.filter(q => q.createdById === user?.id);

  return (
    <div>
      <Header title="My Quizzes" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        {myQuizzes.length === 0 ? (
          <EmptyState icon="fa-clipboard" title="No Quizzes" message="You haven't created any quizzes yet" />
        ) : (
          myQuizzes.map((quiz) => (
            <div key={quiz.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={quiz.status} />
                <span className="text-xs text-gray-500">{quiz.questions.length} Qs</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{quiz.title}</p>
              <p className="text-xs text-gray-500 mt-1">{quiz.subject}</p>
            </div>
          ))
        )}
        <div className="card bg-gray-50 text-center py-4">
          <i className="fas fa-shield-alt text-xl text-gray-300 mb-2" />
          <p className="text-[10px] text-gray-500">Quiz contents not retrievable after submission per confidentiality policy.</p>
        </div>
      </div>
    </div>
  );
}

// ==================== FACULTY NOTIFICATIONS ====================
export function FacultyNotifications({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const myNotifs = notifications.filter(n => n.targetRole === 'all' || n.targetRole === user?.role);

  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-2">
        {myNotifs.length === 0 ? (
          <EmptyState icon="fa-bell-slash" title="No Notifications" message="You're all caught up!" />
        ) : (
          myNotifs.map((n) => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`card flex items-start gap-3 cursor-pointer ${!n.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><i className="fas fa-bell text-blue-500 text-sm" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== FACULTY PROFILE ====================
export function FacultyProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();
  const { courses, resources, quizzes } = useData();
  const myCourses = courses.filter(c => c.facultyIds.includes(user?.id || ''));

  return (
    <div>
      <div className="gradient-header pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl backdrop-blur-sm border-2 border-white/30">{user?.avatar}</div>
        <h2 className="text-white text-lg font-bold">{user?.name}</h2>
        <p className="text-gray-300 text-xs">{user?.email}</p>
        <p className="text-teal-300 text-xs mt-1">{user?.department}</p>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div onClick={() => onNavigate('courses')} className="card text-center cursor-pointer hover:border-teal-300 transition">
            <p className="text-lg font-bold text-teal-600">{myCourses.length}</p>
            <p className="text-[10px] text-gray-500">Courses</p>
          </div>
          <div onClick={() => onNavigate('faculty-resources')} className="card text-center cursor-pointer hover:border-teal-300 transition">
            <p className="text-lg font-bold text-teal-600">{resources.filter(r => r.uploaderId === user?.id).length}</p>
            <p className="text-[10px] text-gray-500">Resources</p>
          </div>
          <div onClick={() => onNavigate('submissions')} className="card text-center cursor-pointer hover:border-teal-300 transition">
            <p className="text-lg font-bold text-teal-600">{quizzes.filter(q => q.createdById === user?.id).length}</p>
            <p className="text-[10px] text-gray-500">Quizzes</p>
          </div>
        </div>
        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-folder', label: 'My Resources', screen: 'faculty-resources' },
            { icon: 'fa-cloud-upload-alt', label: 'Upload Resource', screen: 'upload' },
            { icon: 'fa-book', label: 'My Courses & Enrollment', screen: 'courses' },
            { icon: 'fa-clipboard-list', label: 'Create Quiz', screen: 'create-quiz' },
            { icon: 'fa-list-alt', label: 'My Quizzes', screen: 'submissions' },
            { icon: 'fa-bullhorn', label: 'Announcements', screen: 'announcements' },
            { icon: 'fa-comments', label: 'Community', screen: 'community' },
            { icon: 'fa-question-circle', label: 'Help & Support', screen: 'help' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.screen)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <span className="text-sm text-gray-700 flex-1 text-left">{item.label}</span>
              <i className="fas fa-chevron-right text-gray-300 text-xs" />
            </button>
          ))}
        </div>
        <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><i className="fas fa-sign-out-alt" /> Sign Out</button>
        <button onClick={logout} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2"><i className="fas fa-exchange-alt" /> Switch Account / Sign In</button>
      </div>
    </div>
  );
}

// ==================== FACULTY ANNOUNCEMENTS ====================
export function FacultyAnnouncements({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { announcements, addAnnouncement } = useData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  const handlePost = () => {
    if (!title || !content || !user) return;
    addAnnouncement({ title, content, pinned, authorId: user.id, authorName: user.name, authorRole: user.role });
    setTitle(''); setContent(''); setPinned(false); setShowForm(false);
  };

  return (
    <div>
      <Header title="Announcements" showBack onBack={onBack} rightAction={
        <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
      } />
      <div className="p-4 space-y-3">
        {showForm && (
          <div className="card border-2 border-teal-200">
            <h3 className="text-sm font-bold text-gray-800 mb-3">New Announcement</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2 resize-none" />
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              <span className="text-xs text-gray-600">Pin this announcement</span>
            </div>
            <button onClick={handlePost} className="btn-primary">Post Announcement</button>
          </div>
        )}
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
                  <p className="text-[10px] text-gray-400 mt-1">By {a.authorName} • {a.date}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== FACULTY COMMUNITY ====================
export function FacultyCommunity({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { communityMessages, addCommunityMessage } = useData();
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
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Post a message..." rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none mb-2" />
          <button onClick={handlePost} className="btn-primary">Post</button>
        </div>
        {communityMessages.map((msg) => (
          <div key={msg.id} className={`card ${msg.pinned ? 'border-l-4 border-teal-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">{msg.authorRole === 'Faculty' ? '👨‍⚕️' : '👩‍🎓'}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{msg.authorName}</p>
                <p className="text-[10px] text-gray-400">{msg.time}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== FACULTY RESOURCES ====================
export function FacultyResources({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { resources: localResources, deleteResource, courses } = useData();
  const { resources: cloudResources, loading: cloudLoading, deleteResource: deleteCloudResource } = useResources();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Merge cloud resources with local DataContext resources
  const myResources = useMemo(() => {
    const list: any[] = [];
    const seen = new Set<string>();

    cloudResources.forEach((cr) => {
      if (cr.created_by === user?.id || !cr.created_by) {
        seen.add(cr.id);
        list.push({
          id: cr.id,
          title: cr.title,
          type: cr.resource_type === 'NOTE' ? 'Notes' : cr.resource_type === 'VIDEO' ? 'Video' : cr.resource_type === 'PYQ' ? 'PYQ' : cr.resource_type === 'DPP' ? 'Assignment' : 'PDF',
          subject: cr.subjectName || 'General',
          courseId: cr.subject_id,
          uploaderId: cr.created_by,
          uploaderName: cr.creatorName || user?.name || 'Faculty',
          date: cr.created_at?.split('T')[0] || 'Recent',
          size: cr.sizeFormatted || 'Cloud',
          status: cr.status === 'PUBLISHED' ? 'published' : 'draft',
          examCategory: 'Medical',
          fileName: cr.file?.file_name || 'document.pdf',
          storagePath: cr.file?.storage_path,
          signedUrl: cr.signedUrl,
          fileData: cr.fileData,
        });
      }
    });

    localResources.forEach((lr) => {
      if ((lr.uploaderId === user?.id || !lr.uploaderId) && !seen.has(lr.id)) {
        list.push(lr);
      }
    });

    return list;
  }, [cloudResources, localResources, user]);

  const types = ['All', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Q.Paper', 'Practice'];

  let filtered = myResources;
  if (filter !== 'All') filtered = filtered.filter(r => r.type === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || (r.subject && r.subject.toLowerCase().includes(q)));
  }

  const handleDelete = async (resourceId: string) => {
    const target = myResources.find(res => res.id === resourceId);
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
        title="My Resources" 
        subtitle={`${myResources.length} uploaded`} 
        showBack 
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            {cloudLoading && (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" title="Syncing cloud resources..." />
            )}
            <button 
              onClick={() => onNavigate('upload')} 
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition"
              title="Upload new resource"
            >
              <i className="fas fa-plus" />
            </button>
          </div>
        }
      />
      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my resources..."
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
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                filter === t ? 'bg-teal-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Resources List */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12 px-4">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-2" />
            <h3 className="text-sm font-bold text-gray-700">No resources found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {myResources.length === 0
                ? 'You have not uploaded any resources yet. Upload learning materials, lecture notes, or videos for your students.'
                : 'No resources match your current search and filter criteria.'}
            </p>
            <button 
              onClick={() => onNavigate('upload')} 
              className="btn-primary max-w-xs mx-auto mt-4 flex items-center justify-center gap-2"
            >
              <i className="fas fa-cloud-upload-alt" />
              <span>Upload New Resource</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => {
              const course = courses.find(c => c.id === r.courseId);
              return (
                <div 
                  key={r.id} 
                  className="card p-3 mb-0 flex items-center gap-3 border border-gray-100 hover:border-teal-300 transition"
                >
                  <div 
                    onClick={() => onNavigate('resource-view', r)}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-teal-50 transition"
                  >
                    <i className={`fas ${
                      r.type === 'Video' ? 'fa-play text-blue-500' :
                      r.type === 'PDF' ? 'fa-file-pdf text-red-500' :
                      r.type === 'Notes' ? 'fa-sticky-note text-yellow-500' : 'fa-file-alt text-teal-600'
                    } text-base`} />
                  </div>
                  
                  <div 
                    onClick={() => onNavigate('resource-view', r)} 
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="text-xs font-bold text-gray-800 truncate hover:text-teal-600 transition">{r.title}</p>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                      {r.storagePath && (
                        <span className="badge badge-teal text-[8px] py-0 px-1">
                          <i className="fas fa-cloud mr-0.5" />Cloud
                        </span>
                      )}
                      <span>{r.subject} {course ? `• ${course.name}` : ''} • {r.size} • {r.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('resource-view', r)}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="View document"
                    >
                      <span>View</span>
                      <i className="fas fa-eye text-[10px]" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(r.id)}
                      className="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-xs transition"
                      title="Delete resource"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm animate-slide-up">
            <h3 className="text-base font-bold text-gray-800 mb-1">Delete Resource?</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this resource? Students will no longer be able to access it.</p>
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

