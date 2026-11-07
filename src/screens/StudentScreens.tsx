import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useData, deduplicateCompletedChapters } from '../context/DataContext';
import { Header, BottomNav, SearchBar, EmptyState, StatusBadge } from '../components/Navigation';
import { CurriculumBrowser } from '../features/curriculum';
import { useResources, deduplicateAndMergeResources } from '../features/resources';
import { PerformanceAnalyticsView, useStudentAnalytics } from '../features/attempts';
import { useAssessments } from '../features/assessments';
import { StudentConsultancyRoadmapModal, DocumentAttachmentPreviewModal } from './ConsultantScreens';

// ==================== HOME SCREEN ====================
export function StudentHome({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses, announcements, communityMessages, quizzes, departments, notifications, getStudentProgress, getStudentDossier, isConsultancyOptedIn, setConsultancyOptIn, studentDocuments } = useData();
  const { assessments } = useAssessments();
  const studentBatch = user?.batch || 'Batch 1 (Dec)';
  const myCourses = courses.filter(c => (!c.batch || c.batch === 'All' || c.batch === studentBatch) && c.studentIds.includes(user?.id || ''));
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const myProgress = getStudentProgress(user?.id);
  const myCompletedChapters = deduplicateCompletedChapters(myProgress?.completedChapters || []).length;
  const myCompletedTopics = (myProgress?.completedTopicDetails || []).filter(d => d.name && !d.name.toLowerCase().includes('body fluids') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.name.trim())).length || (myProgress?.completedTopics || []).filter(t => !t.toLowerCase().includes('body fluids') && !t.includes('-')).length;

  const myDossier = getStudentDossier ? getStudentDossier(user?.id) : undefined;
  const isOptedIn = typeof isConsultancyOptedIn === 'function' ? isConsultancyOptedIn(user?.id) : true;
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  const totalAssessmentsCount = useMemo(() => {
    const seen = new Set(assessments.map(a => a.id));
    const legacyCount = quizzes.filter(q => !seen.has(q.id)).length;
    return assessments.length + legacyCount;
  }, [assessments, quizzes]);

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Welcome back,</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Student'}</h1>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-300/30">
              <i className="fas fa-layer-group text-[9px]" />
              {user?.batch || 'Batch 1 (Dec)'}
            </span>
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
          <div onClick={() => onNavigate('quizzes')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/20 active:scale-95 transition">
            <p className="text-teal-300 text-lg font-bold">{totalAssessmentsCount}</p>
            <p className="text-gray-300 text-[10px]">Active Drills</p>
          </div>
          <div onClick={() => onNavigate('departments')} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm cursor-pointer hover:bg-white/20 active:scale-95 transition">
            <p className="text-teal-300 text-lg font-bold">2</p>
            <p className="text-gray-300 text-[10px]">Batches</p>
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

        {/* Curriculum Study Progress */}
        <div className="card bg-gradient-to-br from-teal-50 via-emerald-50/50 to-white border border-teal-200/80 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs">
                <i className="fas fa-graduation-cap" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Curriculum Study Progress</h3>
                <p className="text-[10px] text-teal-700 font-medium">Reflected on Faculty & Admin Dashboards</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full transition flex items-center gap-1 shadow-2xs"
            >
              <span>Study Hierarchy</span>
              <i className="fas fa-arrow-right text-[8px]" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white/90 p-2.5 rounded-xl border border-teal-100/80 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-extrabold">
                {myCompletedChapters}
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800">Chapters Studied</p>
                <p className="text-[9px] text-gray-500">Marked as Completed</p>
              </div>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100/80 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">
                {myCompletedTopics}
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800">Topics Studied</p>
                <p className="text-[9px] text-gray-500">Marked as Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Abroad & Consular Admissions Dossier (Handwritten 8-Stage Checklist) */}
        {isOptedIn && myDossier ? (
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-[#0f2b46] rounded-2xl p-4 text-white shadow-md relative overflow-hidden border border-teal-500/30">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
                  🇮🇹
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Study Abroad Dossier</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-teal-400 text-teal-950">
                      {myDossier.overallStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{myDossier.targetCountry} — {myDossier.targetCourse}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConsultancyOptIn(user?.id || 'u-student-1', false)}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 hover:bg-rose-500/40 text-teal-200 hover:text-white transition"
                title="Opt out of consultancy assistance"
              >
                Opt Out
              </button>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5 my-2.5 backdrop-blur-xs flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-teal-200">Consultant Agent:</p>
                <p className="font-semibold text-white text-[11px]">{myDossier.consultantName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-teal-200">Legalisation Pipeline:</p>
                <p className="font-black text-emerald-300 text-[11px]">
                  {myDossier.checklist.filter(i => i.status === 'verified').length} / 8 Stages Cleared
                </p>
              </div>
            </div>

            {/* Status Breakdown Grid for Student (Directly matching canonical 8 stages) */}
            {(() => {
              const checklist = myDossier?.checklist || [];
              const vCount = checklist.filter(i => i.status === 'verified').length;
              const rCount = checklist.filter(i => i.status === 'in_progress').length;
              const nvCount = checklist.filter(i => i.status === 'rejected').length;
              const pCount = checklist.filter(i => !i.status || i.status === 'pending' || i.status === 'submitted').length;

              return (
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  <div className="bg-white/10 rounded-xl p-1.5 text-center">
                    <span className="block text-emerald-300 font-black text-xs">{vCount}</span>
                    <span className="text-[9px] text-teal-200">Verified</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-1.5 text-center">
                    <span className="block text-amber-300 font-black text-xs">{rCount}</span>
                    <span className="text-[9px] text-amber-200">In Review</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-1.5 text-center">
                    <span className="block text-rose-300 font-black text-xs">{nvCount}</span>
                    <span className="text-[9px] text-rose-200">Not Verified</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-1.5 text-center">
                    <span className="block text-slate-300 font-black text-xs">{pCount}</span>
                    <span className="text-[9px] text-slate-300">Pending</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setShowRoadmapModal(true)}
              className="w-full py-2 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <i className="fas fa-clipboard-check text-[11px]" />
              View 8-Stage Admissions & Consular Checklist
            </button>
          </div>
        ) : (
          <div className="rounded-2xl p-3.5 bg-gradient-to-r from-teal-900 via-teal-800 to-[#0f2b46] text-white shadow-md border border-teal-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-base shrink-0">
                🇮🇹
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Consultancy Assistance</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-gray-600/70 text-gray-200">
                    Not Opted
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">Study Abroad & Consular Guidance</h4>
                <p className="text-[10px] text-teal-200/80">Need help with HRD, Apostille, or Pre-Enrolment?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConsultancyOptIn(user?.id || 'u-student-1', true)}
              className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs rounded-xl shadow-xs shrink-0 transition active:scale-95"
            >
              Opt In
            </button>
          </div>
        )}

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

        {/* Academic Cohort Batches */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-gray-800 font-bold text-sm">Academic Batches</h2>
            <button onClick={() => onNavigate('departments')} className="text-teal-600 text-xs font-medium">View Batches</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => onNavigate('departments')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${user?.batch === 'Batch 1 (Dec)' ? 'bg-teal-50 border-teal-300 shadow-2xs' : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Batch 1 (Dec)</span>
                {user?.batch === 'Batch 1 (Dec)' && (
                  <span className="badge bg-teal-600 text-white text-[8px] py-0.2 px-1 rounded-full font-bold">Enrolled</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Winter Session (Dec – Apr)</p>
            </div>
            <div
              onClick={() => onNavigate('departments')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${user?.batch === 'Batch 2 (May/June)' ? 'bg-purple-50 border-purple-300 shadow-2xs' : 'bg-white border-gray-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Batch 2 (May/June)</span>
                {user?.batch === 'Batch 2 (May/June)' && (
                  <span className="badge bg-purple-600 text-white text-[8px] py-0.2 px-1 rounded-full font-bold">Enrolled</span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Summer Session (May – Oct)</p>
            </div>
          </div>
        </div>

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

      {showRoadmapModal && myDossier && (
        <StudentConsultancyRoadmapModal
          dossier={myDossier}
          onClose={() => setShowRoadmapModal(false)}
        />
      )}
    </div>
  );
}

// ==================== COURSES SCREEN ====================
export function StudentCourses({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { courses, enrollStudents, cohortBatches, users } = useData();

  // Preserved batch access control & enrollment capacity validation logic for NEET & IMAT cohorts
  const validateBatchEnrollment = (course: any) => {
    const studentBatch = user?.batch || 'Batch 1 (Dec)';
    const isOtherBatch = course.batch && course.batch !== 'All' && course.batch !== studentBatch;
    if (isOtherBatch) {
      alert(`Batch Restricted: This course belongs to ${course.batch}. You are enrolled in ${studentBatch}. Students of one batch cannot access another.`);
      return false;
    }
    const targetBatch = course.batch ? (cohortBatches || []).find(b => b.name === course.batch || b.id === course.batch) : null;
    const batchMaxCap = targetBatch?.maxStudents || 25;
    const batchEnrolledCount = targetBatch
      ? (users || []).filter(u => u.role === 'student' && (u.batch === targetBatch.name || (targetBatch.name === 'Batch 1 (Dec)' ? (u.batch?.includes('1') || !u.batch) : targetBatch.name === 'Batch 2 (May/June)' ? u.batch?.includes('2') : false))).length
      : 0;
    const isBatchFull = targetBatch ? batchEnrolledCount >= batchMaxCap : false;
    if (isBatchFull) {
      alert(`❌ Enrollment Closed: Batch "${targetBatch?.name}" has reached its maximum enrollment capacity of ${batchMaxCap} students. Batch Full.`);
      return false;
    }
    return true;
  };

  return (
    <div>
      <Header
        title="Medical Curriculum"
        subtitle="3-Tier Academic Hierarchy for NEET & IMAT Aspirants"
      />

      <div className="px-4 pb-4">
        <CurriculumBrowser onNavigateToResource={(r) => onNavigate('resource-view', r)} />
      </div>
    </div>
  );
}

// ==================== RESOURCES SCREEN ====================
export function StudentResources({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { resources: localResources, courses } = useData();
  const { resources: cloudResources, loading: cloudLoading } = useResources();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const types = ['All', 'PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Q.Paper', 'Practice'];

  // Merge cloud resources with local DataContext resources
  const allResources = useMemo(() => {
    return deduplicateAndMergeResources(cloudResources, localResources);
  }, [cloudResources, localResources]);

  // Show resources uploaded by Admin and Faculty to students
  const studentBatch = user?.batch || 'Batch 1 (Dec)';
  let filtered = allResources.filter((r: any) => {
    // Exclude topic documents: students must see only general Resource documents in the Resources tab
    const isTopicDocument = Boolean(
      r.topicMaterialOnly ||
      (typeof r.description === 'string' && r.description.startsWith('Study material for '))
    );
    if (isTopicDocument) return false;

    return (r.status === 'published' || r.status === 'PUBLISHED' || !r.status) && (!r.batch || r.batch === 'All' || r.batch === studentBatch);
  });
  if (filter !== 'All') {
    const fLower = filter.toLowerCase();
    filtered = filtered.filter((r: any) => {
      const tLower = (r.type || '').toLowerCase();
      if (fLower === 'pdf') return tLower.includes('pdf') || (r.fileName && r.fileName.toLowerCase().endsWith('.pdf'));
      if (fLower === 'notes') return tLower.includes('note');
      if (fLower === 'video') return tLower.includes('vid');
      if (fLower === 'pyq') return tLower.includes('pyq') || tLower.includes('past');
      if (fLower === 'assignment') return tLower.includes('assign') || tLower.includes('dpp') || tLower.includes('practice');
      return tLower === fLower;
    });
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((r: any) =>
      r.title.toLowerCase().includes(s) ||
      (r.subject && r.subject.toLowerCase().includes(s))
    );
  }

  const typeIcons: Record<string, string> = {
    PDF: 'fa-file-pdf text-red-500',
    Video: 'fa-play-circle text-blue-500',
    Notes: 'fa-sticky-note text-yellow-500',
    PYQ: 'fa-file-alt text-purple-500',
    Assignment: 'fa-tasks text-green-500',
  };

  return (
    <div>
      <Header
        title="Resources"
        subtitle={`${filtered.length} learning resources`}
        rightAction={
          cloudLoading ? (
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" title="Syncing cloud resources..." />
          ) : undefined
        }
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search high-yield notes, PYQs, videos..." />

      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === type ? 'bg-teal-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {filtered.map((resource: any) => (
          <div
            key={resource.id}
            onClick={() => onNavigate('resource-view', resource)}
            className="card flex items-center gap-3 cursor-pointer active:bg-gray-50 border border-gray-100 hover:border-teal-300 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <i className={`fas ${typeIcons[resource.type] || 'fa-file text-teal-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate hover:text-teal-600 transition">{resource.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {resource.storagePath && (
                  <span className="badge badge-teal text-[8px] py-0 px-1 font-semibold flex items-center gap-0.5">
                    <i className="fas fa-cloud text-[8px]" /> Cloud
                  </span>
                )}
                <p className="text-xs text-gray-500 truncate">{resource.subject} • {resource.uploaderName}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400">{resource.size}</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">{resource.date}</span>
              </div>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-xs" />
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState
            icon="fa-folder-open"
            title="No Resources Found"
            message={search ? 'No materials match your search query.' : 'No resources available for this category yet.'}
          />
        )}
      </div>
    </div>
  );
}

// ==================== COMMUNITY SCREEN ====================
export function StudentCommunity({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
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

  const handleSendReply = (parentId: string, targetReplyId?: string, targetAuthor?: string) => {
    if (!replyText.trim() || !user) return;
    const parentReplyId = targetReplyId || replyTarget?.replyId;
    const replyToAuthor = targetAuthor || (replyTarget?.replyId ? replyTarget.replyAuthorName : undefined);

    addCommunityReply(parentId, {
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role === 'admin' ? 'Admin' : user.role === 'faculty' ? 'Faculty' : 'Student',
      message: replyText.trim(),
      parentReplyId,
      replyToAuthor,
    });
    setReplyText('');
    setReplyTarget(null);
  };

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
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                    <i className="far fa-clock text-[9px] text-teal-600" />
                    <span>{msg.time}</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
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
                        className={`p-2.5 rounded-xl text-xs space-y-1.5 transition ${isSubReply
                            ? 'bg-emerald-50/50 border border-emerald-200/60 ml-2.5'
                            : 'bg-slate-50 border border-slate-100'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-800">{rep.authorName}</span>
                            <span className={`badge text-[8px] py-0 px-1 ${rep.authorRole === 'Faculty' ? 'badge-teal' : rep.authorRole === 'Admin' ? 'badge-navy' : 'badge-green'
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
  const { courses, quizzes, studentDocuments, getStudentDossier, isConsultancyOptedIn, setConsultancyOptIn } = useData();
  const { assessments } = useAssessments();
  const { analytics, loading: analyticsLoading } = useStudentAnalytics(user?.id);
  const myCourses = courses.filter(c => c.studentIds.includes(user?.id || ''));
  const myDossier = getStudentDossier ? getStudentDossier(user?.id) : undefined;
  const isOptedIn = typeof isConsultancyOptedIn === 'function' ? isConsultancyOptedIn(user?.id) : true;
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{
    fileName: string;
    fileSize: string;
    stageTitle: string;
    studentName: string;
    submittedAt?: string;
  } | null>(null);

  const totalAssessmentsCount = useMemo(() => {
    const seen = new Set(assessments.map(a => a.id));
    const legacyCount = quizzes.filter(q => !seen.has(q.id)).length;
    return assessments.length + legacyCount;
  }, [assessments, quizzes]);

  return (
    <div>
      <div className="gradient-header pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl backdrop-blur-sm border-2 border-white/30">{user?.avatar}</div>
        <h2 className="text-white text-lg font-bold">{user?.name}</h2>
        <p className="text-gray-300 text-xs">{user?.email}</p>
        <p className="text-teal-300 text-xs mt-1">ID: {user?.id}</p>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span className="badge bg-teal-400/20 text-teal-200 border border-teal-300/30 text-[10px] py-0.5 px-2 font-bold">
            <i className="fas fa-layer-group mr-1" />
            {user?.batch || 'Batch 1 (Dec)'}
          </span>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center"><p className="text-lg font-bold text-teal-600">{myCourses.length}</p><p className="text-[10px] text-gray-500">Courses</p></div>
          <div className="card text-center cursor-pointer hover:bg-gray-50 transition" onClick={() => onNavigate('analytics')}>
            <p className="text-lg font-bold text-teal-600">{analyticsLoading ? '...' : (analytics?.completedAttempts ?? 0)}</p>
            <p className="text-[10px] text-gray-500">Quizzes Taken</p>
          </div>
          <div className="card text-center cursor-pointer hover:bg-gray-50 transition" onClick={() => onNavigate('analytics')}>
            <p className="text-lg font-bold text-teal-600">{analytics ? `${analytics.averageAccuracy}%` : '—'}</p>
            <p className="text-[10px] text-gray-500">Avg Accuracy</p>
          </div>
        </div>

        {/* Quick Analytics CTA Card */}
        <div
          onClick={() => onNavigate('analytics')}
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f2b46 100%)' }}
          className="rounded-xl text-white p-4 cursor-pointer hover:shadow-lg transition active:scale-[0.99] flex items-center justify-between mb-3 shadow-md border border-teal-600/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg text-white shadow-2xs">
              <i className="fas fa-chart-line" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Analytics & Diagnostic Report</p>
              <p className="text-xs text-teal-100 font-medium">Review score trends, subject breakdown & weak areas</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition">
            <i className="fas fa-arrow-right text-xs" />
          </div>
        </div>


        {/* Consultancy Assistance Opt-In / Opt-Out Choice */}
        <div className="card space-y-2.5 border border-teal-200/80 bg-gradient-to-r from-teal-50/70 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm shadow-2xs">
                <i className="fas fa-passport" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Study Abroad Consultancy Assistance</h3>
                <p className="text-[10px] text-gray-500">Official HRD, Apostille & Italian admissions pipeline</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setConsultancyOptIn(user?.id || 'u-student-1', !isOptedIn)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                isOptedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <i className={`fas ${isOptedIn ? 'fa-check-circle' : 'fa-plus-circle'}`} />
              <span>{isOptedIn ? 'Opted In' : 'Opt In'}</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-600">
            {isOptedIn
              ? '✅ You have opted in for expert Consultancy Assistance with assigned Consultant Agent Dr. Marco Rossi. Detailed document dashboard is active below.'
              : 'ℹ️ Status: Not Opted. Click "Opt In" above to request the facility. A notification will be dispatched to the Consultant Agent and your document verification dashboard will open.'}
          </p>
        </div>

        {/* Student Verified Documentation List (Official 8 Stages from Consultant Agent) - Shown ONLY when Opted In and Active */}
        {isOptedIn && myDossier && (
          <div className="card p-4 space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-sm shadow-2xs">
                  <i className="fas fa-file-shield" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    My Verification Documents
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    8 Official Consular & Admissions Legalisation Documents
                  </p>
                </div>
              </div>
              <span className="badge badge-teal text-[10px] py-0.5 px-2.5 font-bold">
                {myDossier?.checklist ? myDossier.checklist.filter(i => i.status === 'verified').length : studentDocuments.filter(d => (d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1') && d.status === 'Verified').length} / 8 Verified
              </span>
            </div>

            {/* Status Breakdown Grid (Verified, In Review, Not Verified, Pending) */}
            {(() => {
              const checklist = myDossier?.checklist;
              const verifiedDocsCount = checklist
                ? checklist.filter(i => i.status === 'verified').length
                : studentDocuments.filter(d => (d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1') && d.status === 'Verified').length;
              const inProgressDocsCount = checklist
                ? checklist.filter(i => i.status === 'in_progress').length
                : studentDocuments.filter(d => (d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1') && d.status === 'In Review/In Progress').length;
              const notVerifiedDocsCount = checklist
                ? checklist.filter(i => i.status === 'rejected').length
                : studentDocuments.filter(d => (d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1') && (d.status === 'Not Verified' || d.status === 'Rejected')).length;
              const pendingDocsCount = checklist
                ? checklist.filter(i => !i.status || i.status === 'pending' || i.status === 'submitted').length
                : studentDocuments.filter(d => (d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1') && (!d.status || d.status === 'Pending')).length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-sm">
                      <i className="fas fa-check-circle text-xs" />
                      <span>{verifiedDocsCount}</span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mt-0.5">Verified</p>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-700 font-black text-sm">
                      <i className="fas fa-hourglass-half text-xs" />
                      <span>{inProgressDocsCount}</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mt-0.5">In Review</p>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-rose-700 font-black text-sm">
                      <i className="fas fa-times-circle text-xs" />
                      <span>{notVerifiedDocsCount}</span>
                    </div>
                    <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wide mt-0.5">Not Verified</p>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-700 font-black text-sm">
                      <i className="fas fa-clock text-xs" />
                      <span>{pendingDocsCount}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide mt-0.5">Pending</p>
                  </div>
                </div>
              );
            })()}

            <p className="text-[10px] text-gray-400">
              Read-only verification status managed strictly by Academy Admin and AI Agent (Consultant Agent Dr. Marco Rossi).
            </p>

          <div className="space-y-2 pt-1">
            {(() => {
              const rawDocs = studentDocuments.filter(d => d.studentId === user?.id || d.studentName === user?.name || d.studentId === 'u-student-1');
              const seenStages = new Set<string>();
              const dedupedDocs = rawDocs.filter(d => {
                const key = String(d.stageNumber || d.stageKey || d.id.replace(/^sdoc-[^-]+-/, ''));
                if (seenStages.has(key)) return false;
                seenStages.add(key);
                return true;
              });
              return dedupedDocs.map((doc) => {
                const isVerified = doc.status === 'Verified';
                const isRejected = doc.status === 'Not Verified' || doc.status === 'Rejected';
                const isInProgress = doc.status === 'In Review/In Progress';

                const markerLabel = isVerified
                  ? 'Verified'
                  : isRejected
                  ? 'Not Verified'
                  : isInProgress
                  ? 'In Review/In Progress'
                  : 'Pending';

                const badgeClass = isVerified
                  ? 'badge-green'
                  : isRejected
                  ? 'badge-red'
                  : isInProgress
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300';

                const badgeIcon = isVerified
                  ? 'fa-check-circle'
                  : isRejected
                  ? 'fa-times-circle'
                  : isInProgress
                  ? 'fa-hourglass-half'
                  : 'fa-clock';

                return (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-2xl border transition ${
                      isVerified
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isRejected
                        ? 'bg-rose-50/40 border-rose-200'
                        : isInProgress
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-gray-50/80 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{doc.title}</p>
                          <span
                            className={`badge text-[9px] font-bold py-0.5 px-2 flex items-center gap-1 ${badgeClass}`}
                          >
                            <i className={`fas ${badgeIcon}`} />
                            {markerLabel}
                          </span>
                        </div>

                        {/* Submission file details */}
                        {doc.fileName && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 mb-1">
                            <span className="flex items-center gap-1 text-gray-700 font-medium">
                              <i className="fas fa-paperclip text-[9px] text-teal-600" />
                              {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Verification officer */}
                        <p className="text-[10px] text-gray-400">
                          Category: <span className="text-gray-600 font-semibold">{doc.category}</span> •{' '}
                          {isVerified ? (
                            <span className="text-emerald-700 font-semibold">
                              Verified by {doc.verifiedBy || 'Dr. Marco Rossi (Consultant Agent)'}{' '}
                              {doc.verifiedAt ? `on ${doc.verifiedAt}` : ''}
                            </span>
                          ) : isRejected ? (
                            <span className="text-rose-700 font-semibold">
                              Not Verified — Action Required
                            </span>
                          ) : isInProgress ? (
                            <span className="text-amber-700 font-semibold">
                              In Review/In Progress by Consultant Agent
                            </span>
                          ) : (
                            <span className="text-gray-500 font-semibold">
                              Pending Consultant Agent Verification
                            </span>
                          )}
                        </p>

                        {/* Sub-items if any */}
                        {doc.subItems && doc.subItems.length > 0 && (
                          <div className="mt-2 space-y-1 pt-1.5 border-t border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              Checklist Sub-Items:
                            </p>
                            {doc.subItems.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between text-[10px] text-gray-700">
                                <span className="flex items-center gap-1.5">
                                  <i className={`fas ${sub.status === 'verified' ? 'fa-check text-emerald-600' : 'fa-clock text-amber-500'} text-[8px]`} />
                                  {sub.title}
                                </span>
                                <span className={`text-[9px] font-bold ${sub.status === 'verified' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                  {sub.status === 'verified' ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Remarks */}
                        {doc.remarks && (
                          <p className="text-[10px] text-teal-800 bg-teal-50/80 p-1.5 rounded-lg mt-1.5 border border-teal-200/60 font-medium">
                            <span className="font-bold text-teal-900">Consultant Remarks:</span> {doc.remarks}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-2xs ${
                            isVerified
                              ? 'bg-emerald-600 text-white'
                              : isRejected
                              ? 'bg-red-100 text-red-600'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          <i className={`fas ${
                            isVerified
                              ? 'fa-check'
                              : isRejected
                              ? 'fa-times'
                              : isInProgress
                              ? 'fa-hourglass-half'
                              : 'fa-clock'
                          }`} />
                        </div>
                        {doc.fileName && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              fileName: doc.fileName || 'Document.pdf',
                              fileSize: doc.fileSize || '1.8 MB',
                              stageTitle: doc.title,
                              studentName: user?.name || 'Mary',
                              submittedAt: doc.submittedAt,
                            })}
                            className="text-[9px] font-bold text-teal-600 hover:text-teal-800 hover:underline pt-0.5"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* CTA to open full roadmap modal */}
          {myDossier && (
            <button
              type="button"
              onClick={() => setShowRoadmapModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <i className="fas fa-route text-teal-600" />
              View Full 8-Stage Consular Admissions Roadmap
            </button>
          )}
        </div>
        )}

        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-chart-pie', label: 'Performance Analytics', screen: 'analytics', badge: 'Phase 6' },
            { icon: 'fa-book', label: 'My Courses', screen: 'courses' },
            { icon: 'fa-clipboard-check', label: 'Quizzes & Drills', screen: 'quizzes', badge: `${totalAssessmentsCount} Drills` },
            { icon: 'fa-building', label: 'Batches', screen: 'departments' },
            { icon: 'fa-bullhorn', label: 'Announcements', screen: 'announcements' },
            { icon: 'fa-calendar', label: 'Academic Calendar', screen: 'calendar' },
            { icon: 'fa-question-circle', label: 'Help & Support', screen: 'help' },
            { icon: 'fa-info-circle', label: 'About', screen: 'about' },
          ].map((item, i) => (
            <button key={i} onClick={() => onNavigate(item.screen)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50">
              <i className={`fas ${item.icon} text-gray-400 w-5 text-center`} />
              <span className="text-sm text-gray-700 flex-1 text-left">{item.label}</span>
              {item.badge && <span className="badge badge-teal text-[9px] mr-1">{item.badge}</span>}
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

      {showRoadmapModal && myDossier && (
        <StudentConsultancyRoadmapModal
          dossier={myDossier}
          onClose={() => setShowRoadmapModal(false)}
        />
      )}

      {previewDoc && (
        <DocumentAttachmentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
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
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
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

// ==================== BATCHES (ONLY BATCHES IN BATCHES TAB) ====================
export function DepartmentsScreen({ onBack }: { onBack: () => void }) {
  const { users, cohortBatches } = useData();
  const { user } = useAuth();
  const studentBatch = user?.batch || 'Batch 1 (Dec)';

  const batchesList = (cohortBatches || []).map((b) => {
    const isEnrolled = studentBatch === b.name || (b.name === 'Batch 1 (Dec)' && (!user?.batch || user.batch.includes('1')));
    const studentsCount = (users || []).filter(u => u.role === 'student' && (u.batch === b.name || (b.name === 'Batch 1 (Dec)' ? (u.batch?.includes('1') || !u.batch) : b.name === 'Batch 2 (May/June)' ? u.batch?.includes('2') : false))).length;
    const color = b.color || (b.name.includes('1') ? 'teal' : b.name.includes('2') ? 'purple' : 'blue');
    const season = b.season || b.badge || 'Academic Cohort';
    const description = b.description || `Academic medical entrance preparation cohort for ${b.name} covering all 7 core subjects.`;

    return {
      id: b.id,
      name: b.name,
      session: b.session,
      season,
      color,
      studentsCount,
      isEnrolled,
      description,
    };
  });

  return (
    <div>
      <Header
        title="Batches"
        subtitle={`Academic Cohort Batches • ${batchesList.length} Cohorts Active`}
        showBack
        onBack={onBack}
      />
      <div className="p-4 space-y-3.5">
        <div className="bg-gradient-to-r from-teal-800 to-indigo-900 rounded-2xl p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-teal-200 text-xs">
              <i className="fas fa-layer-group" />
            </span>
            <h2 className="text-sm font-bold">Academic Cohort System</h2>
          </div>
          <p className="text-[11px] text-teal-100 leading-relaxed">
            Students are enrolled into dedicated cohort batches with batch-wise access control to learning resources, drills, and curriculum tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {batchesList.map((b) => (
            <div
              key={b.id}
              className={`card space-y-3 border transition shadow-xs ${b.isEnrolled
                  ? b.color === 'teal'
                    ? 'border-teal-300 ring-2 ring-teal-200 bg-teal-50/30'
                    : 'border-purple-300 ring-2 ring-purple-200 bg-purple-50/30'
                  : 'border-gray-200 bg-white'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${b.color === 'teal'
                      ? 'bg-teal-100/70 text-teal-700 border-teal-200'
                      : 'bg-purple-100/70 text-purple-700 border-purple-200'
                    }`}>
                    <i className="fas fa-layer-group text-base" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-extrabold text-gray-900">{b.name}</h3>
                      <span className={`badge text-[9px] font-bold py-0.5 px-2 rounded-full ${b.color === 'teal' ? 'bg-teal-600 text-white' : 'bg-purple-600 text-white'
                        }`}>
                        {b.season}
                      </span>
                      {b.isEnrolled && (
                        <span className="badge bg-emerald-600 text-white text-[9px] font-bold py-0.5 px-2 rounded-full shadow-2xs flex items-center gap-1">
                          <i className="fas fa-check text-[8px]" />
                          <span>Your Enrolled Batch</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{b.session}</p>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">{b.description}</p>
                  </div>
                </div>
              </div>

              {/* Batch Metrics & Curriculum Subjects */}
              <div className="p-2.5 bg-slate-50/90 rounded-xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                    <i className="fas fa-users text-[10px]" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {b.studentsCount} Students Enrolled
                  </span>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-100">
                  7 Core Subjects
                </span>
              </div>
            </div>
          ))}
        </div>
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
  const { user } = useAuth();
  const { calendarEvents, announcements, quizzes, addCalendarEvent } = useData();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<string>('All');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventType, setNewEventType] = useState<'announcement' | 'exam' | 'lecture' | 'deadline'>('lecture');

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  // Consolidate all academic events
  const allEvents = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description?: string;
      date: string;
      time?: string;
      type: 'announcement' | 'exam' | 'lecture' | 'deadline';
      authorName?: string;
      authorRole?: string;
    }> = [...calendarEvents];

    const seenIds = new Set(list.map(e => e.id));

    // Include announcements
    announcements.forEach((a) => {
      const synId = `cal-ann-${a.id}`;
      if (!seenIds.has(synId) && !seenIds.has(a.id)) {
        list.push({
          id: synId,
          title: `[Announcement] ${a.title}`,
          description: a.content,
          date: a.date,
          time: a.time || '10:00 AM',
          type: 'announcement',
          authorName: a.authorName,
          authorRole: a.authorRole,
        });
      }
    });

    // Include quizzes
    quizzes.forEach((q) => {
      const qDate = q.startDate || format(new Date(), 'yyyy-MM-dd');
      const qId = `cal-quiz-${q.id}`;
      if (!seenIds.has(qId)) {
        list.push({
          id: qId,
          title: `[Exam Drill] ${q.title}`,
          description: `${q.subject} • ${q.questions.length} Questions • ${q.duration} mins`,
          date: qDate,
          time: '09:00 AM',
          type: 'exam',
          authorName: q.createdByName,
          authorRole: 'Faculty',
        });
      }
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [calendarEvents, announcements, quizzes]);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday

  // Events on specific dates
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    allEvents.forEach((e) => {
      map.set(e.date, (map.get(e.date) || 0) + 1);
    });
    return map;
  }, [allEvents]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    let list = allEvents;
    if (selectedDate) {
      list = list.filter((e) => e.date === selectedDate);
    }
    if (filterType === 'Announcements') {
      list = list.filter((e) => e.type === 'announcement');
    } else if (filterType === 'Exams') {
      list = list.filter((e) => e.type === 'exam');
    } else if (filterType === 'Lectures') {
      list = list.filter((e) => e.type === 'lecture');
    }
    return list;
  }, [allEvents, selectedDate, filterType]);

  const handleCreateEvent = () => {
    if (!newEventTitle.trim()) return;
    addCalendarEvent({
      title: newEventTitle.trim(),
      description: newEventDesc.trim() || undefined,
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      authorName: user?.name || 'Academic Team',
      authorRole: user?.role === 'admin' ? 'Admin' : 'Faculty',
    });
    setNewEventTitle('');
    setNewEventDesc('');
    setShowAddEventModal(false);
  };

  return (
    <div className="pb-12">
      <Header
        title="Academic Calendar"
        subtitle="Schedules, Announcements & Exam Timings"
        showBack
        onBack={onBack}
        gradient={false}
        rightAction={
          isFacultyOrAdmin && (
            <button
              onClick={() => setShowAddEventModal(true)}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
            >
              <i className="fas fa-calendar-plus text-[10px]" />
              <span className="hidden sm:inline">Add Event</span>
            </button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Month Selector & Navigation */}
        <div className="card mb-0 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs transition"
              title="Previous Month"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
              <p className="text-[10px] text-gray-400">Academic Term 2026</p>
            </div>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs transition"
              title="Next Month"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <span key={i} className="text-[10px] text-gray-400 font-semibold py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset tiles */}
            {Array.from({ length: startDayOfWeek }, (_, i) => (
              <span key={`blank-${i}`} className="py-2" />
            ))}

            {/* Days in Month */}
            {daysInMonth.map((day, i) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate === dayStr;
              const hasEvents = (eventsByDate.get(dayStr) || 0) > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(prev => prev === dayStr ? null : dayStr)}
                  className={`py-2 rounded-xl text-xs font-semibold relative transition flex flex-col items-center justify-center ${isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isToday
                        ? 'bg-teal-50 text-teal-800 border border-teal-300 font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>{format(day, 'd')}</span>
                  {hasEvents && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-teal-500'
                        }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Date Selection Reset */}
          {selectedDate && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-600 font-medium">
                Filtering: <strong className="text-teal-700">{format(new Date(selectedDate), 'dd MMMM yyyy')}</strong>
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-[10px] text-teal-600 font-bold hover:underline"
              >
                Clear Date Filter
              </button>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {['All', 'Announcements', 'Exams', 'Lectures'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full font-semibold transition text-xs whitespace-nowrap ${filterType === t
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-list-check text-teal-600" />
              <span>
                {selectedDate
                  ? `Events for ${format(new Date(selectedDate), 'dd MMM yyyy')}`
                  : `Upcoming Events (${filteredEvents.length})`}
              </span>
            </h3>
            <span className="text-[10px] text-gray-400">
              {filteredEvents.length} scheduled
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="card text-center py-8">
              <EmptyState
                icon="fa-calendar-day"
                title="No Events Scheduled"
                message={selectedDate ? `No academic events found on ${selectedDate}` : "No upcoming events matching this filter"}
              />
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isAnn = ev.type === 'announcement';
              const isExam = ev.type === 'exam';
              const isLecture = ev.type === 'lecture';

              return (
                <div
                  key={ev.id}
                  className={`card border-l-4 transition hover:shadow-xs ${isAnn
                      ? 'border-l-amber-500 bg-amber-50/20'
                      : isExam
                        ? 'border-l-rose-500 bg-rose-50/20'
                        : 'border-l-teal-600 bg-teal-50/20'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge text-[9px] font-bold uppercase py-0.5 px-2 rounded-full ${isAnn
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isExam
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                      >
                        {ev.type}
                      </span>
                      {ev.authorRole && (
                        <span className="text-[10px] text-gray-500">
                          {ev.authorName} ({ev.authorRole})
                        </span>
                      )}
                    </div>

                    {/* Actual Date and Timing */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-gray-800 block">
                        {ev.date}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-700 flex items-center justify-end gap-1">
                        <i className="far fa-clock text-[9px]" />
                        {ev.time || '10:00 AM'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ev.description}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Event Modal for Admin / Faculty */}
      <AnimatePresence>
        {showAddEventModal && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowAddEventModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-calendar-plus text-teal-600" />
                  <span>Schedule Academic Calendar Event</span>
                </h3>
                <button onClick={() => setShowAddEventModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Event Title</label>
                <input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Physiology Grand Revision Lecture"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Actual Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Actual Timing</label>
                  <input
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mt-1 bg-white"
                >
                  <option value="announcement">Announcement</option>
                  <option value="exam">Examination / Drill</option>
                  <option value="lecture">Lecture / Clinical Session</option>
                  <option value="deadline">Academic Deadline</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Brief syllabus outline or instructions..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mt-1 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEventTitle.trim()}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition"
                >
                  Save Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== ANALYTICS SCREEN (PHASE 6) ====================
export function AnalyticsScreen({
  onBack,
  onNavigate
}: {
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}) {
  const { user } = useAuth();

  return (
    <div>
      <Header
        title="Performance Analytics"
        subtitle="Drill history, score trends & diagnostic insights"
        showBack
        onBack={onBack}
        gradient={false}
      />
      <div className="p-4">
        <PerformanceAnalyticsView
          studentId={user?.id}
          onNavigateToQuizzes={() => onNavigate?.('quizzes')}
        />
      </div>
    </div>
  );
}
