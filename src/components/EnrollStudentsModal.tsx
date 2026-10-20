import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, Course, User } from '../context/DataContext';

interface EnrollStudentsModalProps {
  course: Course;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EnrollStudentsModal({ course, onClose, onSuccess }: EnrollStudentsModalProps) {
  const { user } = useAuth();
  const { users, enrollStudents, unenrollStudent } = useData();
  
  // Tabs: 'enroll' (add new students) or 'enrolled' (view/manage existing)
  const [activeTab, setActiveTab] = useState<'enroll' | 'enrolled'>('enroll');
  // Mode within 'enroll': 'single' vs 'multiple'
  const [enrollMode, setEnrollMode] = useState<'single' | 'multiple'>('multiple');
  
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('All');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const studentUsers = useMemo(() => {
    return users.filter(u => u.role === 'student' && u.status === 'active');
  }, [users]);

  const enrolledStudents = useMemo(() => {
    const enrolledIds = new Set(course.studentIds || []);
    return studentUsers.filter(s => enrolledIds.has(s.id));
  }, [studentUsers, course.studentIds]);

  const unenrolledStudents = useMemo(() => {
    const enrolledIds = new Set(course.studentIds || []);
    let list = studentUsers.filter(s => !enrolledIds.has(s.id));
    
    if (examFilter !== 'All') {
      list = list.filter(s => s.targetExam?.toUpperCase() === examFilter.toUpperCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    return list;
  }, [studentUsers, course.studentIds, examFilter, search]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Single Student Enrollment
  const handleEnrollSingle = (student: User) => {
    enrollStudents(course.id, [student.id], { id: user?.id || 'faculty', name: user?.name || 'Faculty' });
    showFeedback(`Enrolled ${student.name} successfully!`);
    if (onSuccess) onSuccess();
  };

  // Multiple Students Enrollment
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = unenrolledStudents.map(s => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      // Unselect visible
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible
      const combined = new Set([...selectedStudentIds, ...visibleIds]);
      setSelectedStudentIds(Array.from(combined));
    }
  };

  const handleEnrollMultiple = () => {
    if (selectedStudentIds.length === 0) {
      showFeedback('Please select at least one student to enroll', 'error');
      return;
    }
    enrollStudents(course.id, selectedStudentIds, { id: user?.id || 'faculty', name: user?.name || 'Faculty' });
    showFeedback(`Successfully enrolled ${selectedStudentIds.length} student(s)!`);
    setSelectedStudentIds([]);
    if (onSuccess) onSuccess();
  };

  // Unenroll Single Student
  const handleUnenroll = (student: User) => {
    if (window.confirm(`Are you sure you want to unenroll ${student.name} from ${course.name}?`)) {
      unenrollStudent(course.id, student.id, { id: user?.id || 'faculty', name: user?.name || 'Faculty' });
      showFeedback(`Unenrolled ${student.name}`);
      if (onSuccess) onSuccess();
    }
  };

  const examCategories = ['All', 'NEET', 'IMAT', 'UCAT', 'MCAT'];
  const allVisibleSelected = unenrolledStudents.length > 0 && unenrolledStudents.every(s => selectedStudentIds.includes(s.id));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#0f2b46] to-[#1a3a5c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: course.color + '33' }}>
              <i className={`fas ${course.icon} text-lg`} style={{ color: course.color || '#14b8a6' }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate leading-tight">{course.name}</h2>
              <p className="text-[11px] text-teal-300 font-medium">Manage Student Enrollment • {course.studentIds?.length || 0} enrolled</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition"
            title="Close"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Modal Tabs: Enroll New vs Currently Enrolled */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('enroll')} 
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'enroll' 
                ? 'text-teal-600 border-b-2 border-teal-500 bg-white' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-user-plus text-xs" />
            <span>Enroll New Students</span>
            <span className="text-[10px] bg-teal-100 text-teal-700 font-bold px-1.5 py-0.2 rounded-full">
              {unenrolledStudents.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('enrolled')} 
            className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'enrolled' 
                ? 'text-teal-600 border-b-2 border-teal-500 bg-white' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-users text-xs" />
            <span>Enrolled Students</span>
            <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.2 rounded-full">
              {enrolledStudents.length}
            </span>
          </button>
        </div>

        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div className={`px-4 py-2 text-xs flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'
          }`}>
            <i className={`fas ${feedbackMsg.type === 'success' ? 'fa-check-circle text-green-600' : 'fa-exclamation-circle text-red-600'}`} />
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
        )}

        {/* Modal Content */}
        {activeTab === 'enroll' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Enrollment Mode Selector: Single vs Multiple Choice */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                Enrollment Choice
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEnrollMode('single')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    enrollMode === 'single'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-user text-xs" />
                  Single Student
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollMode('multiple')}
                  className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    enrollMode === 'multiple'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className="fas fa-users text-xs" />
                  Multiple Students (Bulk)
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student by name or email..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>

              {/* Exam category pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {examCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setExamFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
                      examFilter === cat ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiple Mode Controls: Select All & Counter */}
            {enrollMode === 'multiple' && (
              <div className="flex items-center justify-between px-1 py-1 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={unenrolledStudents.length === 0}
                  className="flex items-center gap-2 font-medium text-teal-700 hover:text-teal-900 disabled:opacity-40"
                >
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Select All Filtered ({unenrolledStudents.length})</span>
                </button>
                <span className="text-[11px] font-semibold text-gray-500">
                  {selectedStudentIds.length} selected
                </span>
              </div>
            )}

            {/* Students List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {unenrolledStudents.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
                  <i className="fas fa-user-check text-2xl text-teal-500 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">No unenrolled students found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {studentUsers.length === 0 
                      ? 'No registered student accounts in the system' 
                      : 'All matching students are already enrolled in this course'}
                  </p>
                </div>
              ) : (
                unenrolledStudents.map(student => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => enrollMode === 'multiple' && handleToggleSelectStudent(student.id)}
                      className={`card p-2.5 mb-0 flex items-center gap-3 transition border ${
                        enrollMode === 'multiple' && isSelected
                          ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                      } ${enrollMode === 'multiple' ? 'cursor-pointer' : ''}`}
                    >
                      {enrollMode === 'multiple' && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-sm flex-shrink-0">
                        {student.avatar || '👩‍🎓'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-800 truncate">{student.name}</p>
                          {student.targetExam && (
                            <span className="badge badge-teal text-[9px] py-0 px-1.5">{student.targetExam}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{student.email}</p>
                      </div>

                      {enrollMode === 'single' && (
                        <button
                          type="button"
                          onClick={() => handleEnrollSingle(student)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                        >
                          <i className="fas fa-plus text-[10px]" />
                          <span>Enroll</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Enrolled Students Tab */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Currently Enrolled ({enrolledStudents.length})</span>
              <span className="text-[10px] text-gray-400">Enrolled students can view all resources</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-xl">
                  <i className="fas fa-user-slash text-2xl text-gray-300 mb-2" />
                  <p className="text-xs font-semibold text-gray-700">No students enrolled yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">Switch to the "Enroll New Students" tab to enroll students</p>
                  <button
                    onClick={() => setActiveTab('enroll')}
                    className="mt-3 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg"
                  >
                    Enroll Students Now
                  </button>
                </div>
              ) : (
                enrolledStudents.map(student => (
                  <div key={student.id} className="card p-2.5 mb-0 flex items-center gap-3 border border-gray-100 hover:bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-sm flex-shrink-0">
                      {student.avatar || '👩‍🎓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-800 truncate">{student.name}</p>
                        {student.targetExam && (
                          <span className="badge badge-teal text-[9px] py-0 px-1.5">{student.targetExam}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{student.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnenroll(student)}
                      className="px-2.5 py-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium transition flex items-center gap-1 flex-shrink-0"
                      title="Unenroll student"
                    >
                      <i className="fas fa-user-minus text-[10px]" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
          {activeTab === 'enroll' && enrollMode === 'multiple' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnrollMultiple}
                disabled={selectedStudentIds.length === 0}
                className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition shadow-sm disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <i className="fas fa-user-plus" />
                <span>Enroll Selected Students ({selectedStudentIds.length})</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
