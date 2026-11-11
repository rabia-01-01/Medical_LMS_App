import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, hasResourceAccess, Course, Resource, deduplicateCompletedChapters } from '../context/DataContext';
import { Header, StatusBadge, EmptyState, AccessRestrictedScreen, RateLimitAlert } from '../components/Navigation';
import { useRbac } from '../hooks/useRbac';
import { useRateLimitGuard } from '../hooks/useRateLimitGuard';
import { CurriculumBrowser, useSubjects, useChapters } from '../features/curriculum';
import { resourceService, normalizeResourceType, useResources, deduplicateAndMergeResources } from '../features/resources';
import { AssessmentCreator } from '../features/assessments';
import { AIMCQGenerator } from '../components/AdminAIMCQGenerator';
import { StudentStudyProgressModal } from '../components/StudentStudyProgressModal';

// ==================== FACULTY DASHBOARD ====================
export function FacultyDashboard({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const [showAIMCQModal, setShowAIMCQModal] = useState(false);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('All');
  const [inspectingStudent, setInspectingStudent] = useState<{ id: string; name: string; email?: string; batch?: string; avatar?: string } | null>(null);
  const { user } = useAuth();
  const { courses, resources, quizzes, notifications, users, getStudentProgress, cohortBatches } = useData();
  const enrolledStudents = useMemo(() => users.filter(u => u.role === 'student'), [users]);
  const { resources: cloudResources } = useResources();
  const assignedCourses = useMemo(() => courses.filter(c => (c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);
  const adminCourses = useMemo(() => courses.filter(c => !(c.facultyIds || []).includes(user?.id || '')), [courses, user?.id]);

  const myResources = useMemo(() => {
    const merged = deduplicateAndMergeResources(cloudResources, resources);
    return merged.filter(r => r.uploaderId === user?.id || !r.uploaderId);
  }, [cloudResources, resources, user?.id]);
  const rbac = useRbac();
  const canAccessCourses = rbac.hasModule('courses');
  const canAccessResources = rbac.hasModule('resources');
  const canAccessQuizzes = rbac.hasModule('quizzes');
  const canAccessAnnouncements = rbac.hasModule('announcements');
  const canAccessNotifications = rbac.hasModule('notifications');
  const canAccessBranch = rbac.hasModule('branch');

  const myQuizzes = quizzes.filter(q => q.createdById === user?.id);
  const unreadNotifs = canAccessNotifications ? notifications.filter(n => !n.read && (n.targetRole === 'all' || n.targetRole === 'faculty')).length : 0;

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
            <p className="text-teal-300 text-lg font-bold">{canAccessCourses ? '7 Subjects' : <i className="fas fa-lock text-sm text-amber-300" />}</p>
            <p className="text-gray-300 text-[10px]">Manage Curriculum</p>
          </div>
          <div onClick={() => onNavigate('faculty-resources')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/15 transition">
            <p className="text-teal-300 text-lg font-bold">{canAccessResources ? myResources.length : <i className="fas fa-lock text-sm text-amber-300" />}</p>
            <p className="text-gray-300 text-[10px]">Resources</p>
          </div>
          <div onClick={() => onNavigate('submissions')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/15 transition">
            <p className="text-teal-300 text-lg font-bold">{canAccessQuizzes ? myQuizzes.length : <i className="fas fa-lock text-sm text-amber-300" />}</p>
            <p className="text-gray-300 text-[10px]">Quizzes</p>
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('faculty-resources')} className={`card flex flex-col items-center py-4 active:bg-gray-50 ${!canAccessResources ? 'opacity-65' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-2 relative">
              <i className="fas fa-folder text-teal-600" />
              {!canAccessResources && <i className="fas fa-lock text-[9px] text-amber-600 absolute -top-0.5 -right-0.5" />}
            </div>
            <span className="text-xs font-medium text-gray-700">View Resources</span>
          </button>
          <button onClick={() => onNavigate('upload')} className={`card flex flex-col items-center py-4 active:bg-gray-50 border border-teal-200 ${!canAccessResources ? 'opacity-65' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2 relative">
              <i className="fas fa-cloud-upload-alt text-emerald-600" />
              {!canAccessResources && <i className="fas fa-lock text-[9px] text-amber-600 absolute -top-0.5 -right-0.5" />}
            </div>
            <span className="text-xs font-medium text-gray-700">Upload Resource</span>
          </button>
          <button onClick={() => onNavigate('create-quiz')} className={`card flex flex-col items-center py-4 active:bg-gray-50 ${!canAccessQuizzes ? 'opacity-65' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2 relative">
              <i className="fas fa-clipboard-list text-purple-600" />
              {!canAccessQuizzes && <i className="fas fa-lock text-[9px] text-amber-600 absolute -top-0.5 -right-0.5" />}
            </div>
            <span className="text-xs font-medium text-gray-700">Create Quiz</span>
          </button>
          <button onClick={() => onNavigate('announcements')} className={`card flex flex-col items-center py-4 active:bg-gray-50 ${!canAccessAnnouncements ? 'opacity-65' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2 relative">
              <i className="fas fa-bullhorn text-orange-600" />
              {!canAccessAnnouncements && <i className="fas fa-lock text-[9px] text-amber-600 absolute -top-0.5 -right-0.5" />}
            </div>
            <span className="text-xs font-medium text-gray-700">Announcements</span>
          </button>
          <button onClick={() => onNavigate('community')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2"><i className="fas fa-comments text-blue-600" /></div>
            <span className="text-xs font-medium text-gray-700">Community</span>
          </button>
          <button onClick={() => onNavigate('departments')} className={`card flex flex-col items-center py-4 active:bg-gray-50 ${!canAccessBranch ? 'opacity-65' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2 relative">
              <i className="fas fa-layer-group text-indigo-600" />
              {!canAccessBranch && <i className="fas fa-lock text-[9px] text-amber-600 absolute -top-0.5 -right-0.5" />}
            </div>
            <span className="text-xs font-medium text-gray-700">Batches</span>
          </button>
        </div>

        {/* Faculty AI Chapter-Wise MCQ Generator (5 Options A-E) */}
        <div className="p-3.5 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <i className="fas fa-robot text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">AI Chapter-Wise MCQ Generator</p>
              <p className="text-[10px] text-gray-500">Auto-generate 5-choice MCQs (A, B, C, D, E) chapter-wise</p>
            </div>
          </div>
          <button
            onClick={() => setShowAIMCQModal(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <i className="fas fa-magic text-[11px]" />
            <span>Open Chatbot</span>
          </button>
        </div>

        {showAIMCQModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs">
                    <i className="fas fa-robot" />
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">Faculty AI MCQ Generator</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIMCQModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs transition"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <AIMCQGenerator onBack={() => setShowAIMCQModal(false)} />
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
          </div>

          {/* Batch Filter */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl">
            {['All', ...(cohortBatches || []).map(b => b.name)].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
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
              .filter(st => {
                if (selectedBatchFilter === 'All') return true;
                return st.batch === selectedBatchFilter;
              })
              .map(student => {
                const prog = getStudentProgress(student.id);
                const chaps = deduplicateCompletedChapters(prog?.completedChapters || []).length;
                const topics = (prog?.completedTopicDetails || []).filter(d => d.name && !d.name.toLowerCase().includes('body fluids') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.name.trim())).length || (prog?.completedTopics || []).filter(t => !t.toLowerCase().includes('body fluids') && !t.includes('-')).length;

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
                          {student.batch && (
                            <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              {student.batch}
                            </span>
                          )}
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

        {/* Manage Curriculum Access */}
        <div className="card bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <i className="fas fa-layer-group text-base" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-gray-900">Official Academic Curriculum</h2>
              <p className="text-[10px] text-gray-500">7 Core Subjects • Chapters & Topics Hierarchy</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('courses')} 
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shrink-0 shadow-xs flex items-center gap-1"
          >
            <span>Manage Curriculum</span>
            <i className="fas fa-chevron-right text-[10px]" />
          </button>
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

// ==================== FACULTY COURSES / MANAGE CURRICULUM ====================
export function FacultyCourses({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  if (!hasResourceAccess(user, 'courses')) {
    return <AccessRestrictedScreen moduleName="Courses & Curriculum" onBack={() => onNavigate('dashboard')} />;
  }
  return (
    <div>
      <Header 
        title="Academic Curriculum" 
        subtitle="Manage Subjects, Chapters & Topics" 
      />

      {/* Primary Tab Switcher: Manage Curriculum Only */}
      <div className="flex bg-gray-100 p-1 rounded-xl mx-4 mb-3">
        <div className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white text-teal-700 shadow-xs flex items-center justify-center gap-1.5">
          <i className="fas fa-layer-group text-[11px]" />
          <span>Manage Curriculum</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <CurriculumBrowser canManage={true} onNavigateToResource={(r) => onNavigate('resource-view', r)} />
      </div>
    </div>
  );
}

// ==================== UPLOAD RESOURCE ====================
export function UploadResource({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const rbac = useRbac();
  const uploadRateLimit = useRateLimitGuard('content:upload_resource');
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
    mimeType: '',
    readingContent: ''
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
    if (!rbac.can('resources:upload')) {
      setErrorMessage('You do not have permission to upload learning resources.');
      return;
    }

    if (!formData.title || !formData.courseId || !user || (!formData.fileData && !selectedFile)) {
      alert('Please fill all required fields and upload a file');
      return;
    }

    const rateCheck = uploadRateLimit.tryConsume();
    if (!rateCheck.allowed) {
      setErrorMessage(rateCheck.message);
      return;
    }

    try {
      setUploading(true);
      setErrorMessage(null);
      setUploadProgress('Uploading to Supabase Storage...');

      const fileToUpload = selectedFile || new Blob([formData.fileData || ''], { type: formData.mimeType || 'application/pdf' });

      // Resolve human-readable subject and chapter
      const resolvedSubject = formData.subject || (subjects.find((s: any) => s.id === formData.subjectId)?.name || 'General');
      const resolvedChapter = chapters.find((c: any) => c.id === formData.chapterId)?.name || null;

      // 1. Supabase Storage upload + PostgreSQL insert
      const created = await resourceService.createResource({
        title: formData.title,
        description: `${formData.examCategory} • ${resolvedSubject}`,
        resourceType: normalizeResourceType(formData.type),
        subjectId: formData.subjectId || subjects[0]?.id || 'sub-general',
        chapterId: formData.chapterId || null,
        subjectName: resolvedSubject,
        chapterName: resolvedChapter,
        status: 'PUBLISHED',
        file: fileToUpload,
        fileName: formData.fileName,
        mimeType: formData.mimeType,
        fileSize: selectedFile?.size || 0,
        base64Data: formData.fileData,
        readingContent: formData.readingContent.trim() || undefined,
      }, user.id, user.name);

      // 2. DataContext state update with identical id and resolved subject
      addResource({
        id: created.id,
        title: formData.title,
        type: formData.type,
        subject: resolvedSubject,
        courseId: formData.courseId,
        uploaderId: user.id,
        uploaderName: user.name,
        size: formData.size || created.sizeFormatted || 'Cloud',
        status: 'published',
        batch: 'All',
        examCategory: formData.examCategory,
        fileName: formData.fileName,
        fileData: formData.fileData,
        mimeType: formData.mimeType,
        storagePath: created.file?.storage_path,
        signedUrl: created.signedUrl || undefined,
        subjectId: formData.subjectId,
        chapterId: formData.chapterId,
        readingContent: formData.readingContent.trim() || undefined,
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

  if (!hasResourceAccess(user, 'resources')) {
    return <AccessRestrictedScreen moduleName="Learning Resources" onBack={onBack} />;
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
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Document Reading Section Contents (Specific for this document)
          </label>
          <textarea
            rows={3}
            value={formData.readingContent}
            onChange={(e) => setFormData(p => ({ ...p, readingContent: e.target.value }))}
            placeholder="Provide specific notes, chapter excerpts, formula derivations, key concepts or clinical summaries for this document..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
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

        <div className="flex items-center justify-between text-[10px] text-gray-500 px-0.5">
          <span>Upload Quota: <strong>{uploadRateLimit.remaining}/{uploadRateLimit.limit} remaining</strong></span>
          <span className="badge badge-teal text-[9px]">{uploadRateLimit.policyLabel}</span>
        </div>

        <RateLimitAlert
          message={uploadRateLimit.limitError}
          retryAfterSeconds={uploadRateLimit.retryAfterSeconds}
          policyLabel={uploadRateLimit.policyLabel}
        />

        <button 
          onClick={handleSubmit} 
          disabled={!formData.title || !formData.courseId || (!formData.fileData && !selectedFile) || uploading || uploadRateLimit.isBlocked} 
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
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return (
      <div className="p-4">
        <Header title="Assessment Authoring" showBack onBack={onBack} gradient={false} />
        <div className="card text-center py-10 shadow-sm mt-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-user-shield text-xl" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Faculty Authoring Privileges Required</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Quiz authoring is restricted to Faculty members. 
            Administrators retain governance, moderation, and auditing controls in the Assessment Engine.
          </p>
          <button onClick={onBack} className="btn-primary max-w-xs mx-auto mt-5">
            Return to Assessment Overview
          </button>
        </div>
      </div>
    );
  }

  if (!hasResourceAccess(user, 'quizzes')) {
    return <AccessRestrictedScreen moduleName="Quizzes & Assessment Creation" onBack={onBack} />;
  }

  return <AssessmentCreator onBack={onBack} />;
}

// ==================== FACULTY SUBMISSIONS ====================
export function FacultySubmissions({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { quizzes } = useData();
  if (!hasResourceAccess(user, 'quizzes')) {
    return <AccessRestrictedScreen moduleName="Quizzes" onBack={onBack} />;
  }
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
  if (!hasResourceAccess(user, 'notifications')) {
    return <AccessRestrictedScreen moduleName="Notifications" onBack={onBack} />;
  }
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
            <p className="text-lg font-bold text-teal-600">7</p>
            <p className="text-[10px] text-gray-500">Curriculum</p>
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
            { icon: 'fa-layer-group', label: 'Manage Curriculum', screen: 'courses' },
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
  const rbac = useRbac();
  const announcementLimit = useRateLimitGuard('comms:announcement');
  const { announcements, addAnnouncement } = useData();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  if (!hasResourceAccess(user, 'announcements') || !rbac.can('announcements:view')) {
    return <AccessRestrictedScreen moduleName="Announcements" onBack={onBack} />;
  }

  const handlePost = () => {
    if (!rbac.can('announcements:publish')) return;
    if (!title || !content || !user) return;
    const rateCheck = announcementLimit.tryConsume();
    if (!rateCheck.allowed) return;
    addAnnouncement({ title, content, pinned, authorId: user.id, authorName: user.name, authorRole: user.role });
    setTitle(''); setContent(''); setPinned(false); setShowForm(false);
  };

  return (
    <div>
      <Header title="Announcements" showBack onBack={onBack} rightAction={
        rbac.can('announcements:publish') ? (
          <button onClick={() => setShowForm(!showForm)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm"><i className="fas fa-plus" /></button>
        ) : undefined
      } />
      <div className="p-4 space-y-3">
        {showForm && (
          <div className="card border-2 border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">New Announcement</h3>
              <span className="badge badge-teal text-[9px]">{announcementLimit.remaining}/{announcementLimit.limit} • {announcementLimit.policyLabel}</span>
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
              <span className="text-xs text-gray-600">Pin this announcement</span>
            </div>
            <RateLimitAlert
              message={announcementLimit.limitError}
              retryAfterSeconds={announcementLimit.retryAfterSeconds}
              policyLabel={announcementLimit.policyLabel}
            />
            <button onClick={handlePost} disabled={!title || !content || announcementLimit.isBlocked} className="btn-primary disabled:opacity-50">Post Announcement</button>
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
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-500 font-medium">By {a.authorName} ({a.authorRole})</span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                      <i className="far fa-clock text-[9px]" />
                      <span>{a.date}{a.time ? ` at ${a.time}` : ''}</span>
                    </span>
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

// ==================== FACULTY COMMUNITY ====================
export function FacultyCommunity({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const rbac = useRbac();
  const postLimit = useRateLimitGuard('community:post');
  const replyLimit = useRateLimitGuard('community:reply');
  const { communityMessages, addCommunityMessage, addCommunityReply } = useData();
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
    if (!rbac.can('community:post')) return;
    if (!newMessage.trim() || !user) return;
    if (!postLimit.tryConsume().allowed) return;
    const authorLabel = rbac.role === 'consultant' ? 'Consultant' : 'Faculty';
    addCommunityMessage({ authorId: user.id, authorName: user.name, authorRole: authorLabel, message: newMessage, pinned: false });
    setNewMessage('');
  };

  const handleSendReply = (parentId: string, targetReplyId?: string, targetAuthor?: string) => {
    if (!rbac.can('community:reply')) return;
    if (!replyText.trim() || !user) return;
    if (!replyLimit.tryConsume().allowed) return;
    const parentReplyId = targetReplyId || replyTarget?.replyId;
    const replyToAuthor = targetAuthor || (replyTarget?.replyId ? replyTarget.replyAuthorName : undefined);
    const authorLabel = rbac.role === 'consultant' ? 'Consultant' : 'Faculty';

    addCommunityReply(parentId, {
      authorId: user.id,
      authorName: user.name,
      authorRole: authorLabel,
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
      <div className="p-4 space-y-3 pb-10">
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Post Quota: <strong>{postLimit.remaining}/{postLimit.limit} remaining</strong></span>
            <span className="badge badge-teal text-[9px]">{postLimit.policyLabel}</span>
          </div>
          <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Post a message..." rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none" />
          <RateLimitAlert
            message={postLimit.limitError || replyLimit.limitError}
            retryAfterSeconds={postLimit.isBlocked ? postLimit.retryAfterSeconds : replyLimit.retryAfterSeconds}
            policyLabel={postLimit.isBlocked ? postLimit.policyLabel : replyLimit.policyLabel}
          />
          <button onClick={handlePost} disabled={!newMessage.trim() || postLimit.isBlocked} className="btn-primary disabled:opacity-50">Post</button>
        </div>
        {communityMessages.map((msg) => (
          <div key={msg.id} className={`card ${msg.pinned ? 'border-l-4 border-teal-500' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm">{msg.authorRole === 'Faculty' ? '👨‍⚕️' : '👩‍🎓'}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{msg.authorName}</p>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                  <i className="far fa-clock text-[9px] text-teal-600" />
                  <span>{msg.time}</span>
                </p>
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
    const merged = deduplicateAndMergeResources(cloudResources, localResources);
    return merged.filter(r => r.uploaderId === user?.id || !r.uploaderId);
  }, [cloudResources, localResources, user]);

  const types = ['All', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Q.Paper', 'Practice'];

  let filtered = myResources;
  if (filter !== 'All') filtered = filtered.filter(r => r.type === filter);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || (r.subject && r.subject.toLowerCase().includes(q)));
  }

  if (!hasResourceAccess(user, 'resources')) {
    return <AccessRestrictedScreen moduleName="Learning Resources" onBack={onBack} />;
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
                    
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      
    </div>
  );
}

