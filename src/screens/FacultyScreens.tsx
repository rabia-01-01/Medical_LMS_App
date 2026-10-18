import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, SearchBar, StatusBadge, EmptyState } from '../components/Navigation';
import { courses, resources, quizzes, notifications } from '../data/mockData';

// ==================== FACULTY DASHBOARD ====================
export function FacultyDashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const facultyCourses = courses.filter(c => user?.courses?.includes(c.name));

  return (
    <div>
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs">Welcome,</p>
            <h1 className="text-white text-lg font-bold">{user?.name || 'Faculty'}</h1>
            <p className="text-teal-300 text-xs">{user?.department || 'Department'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('notifications')} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-bell text-white text-sm" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">2</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-lg">{user?.avatar}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">{facultyCourses.length}</p>
            <p className="text-gray-300 text-[10px]">Courses</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">8</p>
            <p className="text-gray-300 text-[10px]">Resources</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-teal-300 text-lg font-bold">3</p>
            <p className="text-gray-300 text-[10px]">Quizzes</p>
          </div>
        </div>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('upload')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-2">
              <i className="fas fa-cloud-upload-alt text-teal-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Upload Resource</span>
          </button>
          <button onClick={() => onNavigate('create-quiz')} className="card flex flex-col items-center py-4 active:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-2">
              <i className="fas fa-clipboard-list text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Create Quiz</span>
          </button>
        </div>

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-800 font-bold text-sm">My Courses</h2>
            <button onClick={() => onNavigate('courses')} className="text-teal-600 text-xs font-medium">View All</button>
          </div>
          {facultyCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="card flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                <i className={`fas ${course.icon}`} style={{ color: course.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{course.name}</p>
                <p className="text-xs text-gray-500">{course.students} students</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Uploads */}
        <div>
          <h2 className="text-gray-800 font-bold text-sm mb-3">Recent Uploads</h2>
          {resources.slice(0, 3).map((r) => (
            <div key={r.id} className="card flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                <i className={`fas ${r.type === 'Video' ? 'fa-play text-blue-500' : 'fa-file-pdf text-red-500'} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{r.title}</p>
                <p className="text-[10px] text-gray-400">{r.date}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== FACULTY COURSES ====================
export function FacultyCourses({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user } = useAuth();
  const facultyCourses = courses.filter(c => user?.courses?.includes(c.name));

  return (
    <div>
      <Header title="My Courses" subtitle={`${facultyCourses.length} assigned courses`} />
      <div className="p-4 space-y-3">
        {facultyCourses.map((course) => (
          <div key={course.id} className="card">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: course.color + '20' }}>
                <i className={`fas ${course.icon} text-lg`} style={{ color: course.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{course.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{course.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{course.students} students</span>
                  <span className="text-[10px] text-gray-400"><i className="fas fa-book mr-1" />{course.subjects.length} subjects</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onNavigate('upload')} className="text-[10px] bg-teal-50 text-teal-600 px-2 py-1 rounded font-medium">
                    <i className="fas fa-upload mr-1" /> Upload
                  </button>
                  <button className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-medium">
                    <i className="fas fa-eye mr-1" /> Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== UPLOAD RESOURCE ====================
export function UploadResource({ onBack }: { onBack: () => void }) {
  const [resourceType, setResourceType] = useState('PDF');
  const [selectedCourse, setSelectedCourse] = useState('');

  return (
    <div>
      <Header title="Upload Resource" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        {/* Resource Type */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Resource Type</label>
          <div className="grid grid-cols-4 gap-2">
            {['PDF', 'Video', 'Notes', 'PYQ', 'Assignment', 'Syllabus', 'Question Paper', 'Practice'].map((type) => (
              <button
                key={type}
                onClick={() => setResourceType(type)}
                className={`py-2 px-2 rounded-lg text-[10px] font-medium transition ${
                  resourceType === type ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Title</label>
          <input placeholder="Enter resource title" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Description</label>
          <textarea placeholder="Brief description of the resource" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        {/* Course */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select course</option>
            {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Subject</label>
          <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select subject</option>
            <option>Physics</option><option>Chemistry</option><option>Biology</option>
            <option>Botany</option><option>Zoology</option><option>Logical Reasoning</option>
          </select>
        </div>

        {/* Exam Category */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Exam Category</label>
          <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option>NEET</option><option>IMAT</option><option>UCAT</option><option>MCAT</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Upload File</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <i className="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Tap to select file</p>
            <p className="text-[10px] text-gray-400 mt-1">PDF, MP4, DOCX up to 500MB</p>
          </div>
        </div>

        {/* Publish Status */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Status</label>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-xs font-medium">Publish Now</button>
            <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">Save as Draft</button>
          </div>
        </div>

        <button className="btn-primary">
          <i className="fas fa-upload mr-2" /> Upload Resource
        </button>
      </div>
    </div>
  );
}

// ==================== CREATE QUIZ (FACULTY) ====================
export function CreateQuiz({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 4, negativeMarks: 1 }]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 4, negativeMarks: 1 }]);
  };

  return (
    <div>
      <Header title="Create Quiz" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        {/* Quiz Details */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Quiz Details</h3>
          <div className="space-y-3">
            <input placeholder="Quiz Title" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>Select Course</option>
              {courses.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500">Duration (min)</label>
                <input type="number" placeholder="45" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Negative Marks</label>
                <input type="number" placeholder="1" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-500">Start Date</label>
                <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">End Date</label>
                <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Questions ({questions.length})</h3>
            <button onClick={addQuestion} className="text-xs text-teal-600 font-medium">
              <i className="fas fa-plus mr-1" /> Add Question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-navy">Q{qIdx + 1}</span>
                {qIdx > 0 && (
                  <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-red-400 text-xs">
                    <i className="fas fa-trash" />
                  </button>
                )}
              </div>
              <textarea
                placeholder="Enter question..."
                value={q.question}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIdx].question = e.target.value;
                  setQuestions(updated);
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-2 resize-none"
                rows={2}
              />
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = [...questions];
                        updated[qIdx].correctAnswer = oIdx;
                        setQuestions(updated);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        q.correctAnswer === oIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </button>
                    <input
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIdx].options[oIdx] = e.target.value;
                        setQuestions(updated);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                <i className="fas fa-info-circle mr-1" /> Tap the letter to set correct answer (green = correct)
              </p>
            </div>
          ))}
        </div>

        <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
          <i className="fas fa-plus mr-2" /> Add Another Question
        </button>

        {/* Confidentiality Notice */}
        <div className="card bg-orange-50 border-l-4 border-orange-400">
          <p className="text-xs text-orange-800">
            <i className="fas fa-shield-alt mr-1" />
            <strong>Confidentiality Notice:</strong> Once submitted, quiz questions and answer keys cannot be retrieved. This policy ensures examination integrity.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1">Save Draft</button>
          <button className="btn-primary flex-1">Submit Quiz</button>
        </div>
      </div>
    </div>
  );
}

// ==================== FACULTY SUBMISSIONS ====================
export function FacultySubmissions({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Submissions" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-3">
        {quizzes.filter(q => q.createdBy === 'Dr. Sharma' || q.createdBy === 'Dr. Verma' || q.createdBy === 'Dr. Patel').map((quiz) => (
          <div key={quiz.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={quiz.status} />
              <span className="text-xs text-gray-500">{quiz.questions} Qs</span>
            </div>
            <p className="text-sm font-bold text-gray-800">{quiz.title}</p>
            <p className="text-xs text-gray-500 mt-1">{quiz.course}</p>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-400"><i className="fas fa-users mr-1" />{Math.floor(Math.random() * 100 + 50)} attempts</span>
              <span className="text-[10px] text-gray-400"><i className="fas fa-chart-bar mr-1" />Avg: {Math.floor(Math.random() * 30 + 50)}%</span>
            </div>
          </div>
        ))}
        <div className="card bg-gray-50 text-center py-6">
          <i className="fas fa-shield-alt text-2xl text-gray-300 mb-2" />
          <p className="text-xs text-gray-500">Quiz contents and answer keys are not retrievable after submission per confidentiality policy.</p>
        </div>
      </div>
    </div>
  );
}

// ==================== FACULTY NOTIFICATIONS ====================
export function FacultyNotifications({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <Header title="Notifications" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`card flex items-start gap-3 ${!n.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-bell text-blue-500 text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== FACULTY PROFILE ====================
export function FacultyProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="gradient-header pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl backdrop-blur-sm border-2 border-white/30">
          {user?.avatar}
        </div>
        <h2 className="text-white text-lg font-bold">{user?.name}</h2>
        <p className="text-gray-300 text-xs">{user?.email}</p>
        <p className="text-teal-300 text-xs mt-1">{user?.department}</p>
      </div>
      <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">3</p>
            <p className="text-[10px] text-gray-500">Courses</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">8</p>
            <p className="text-[10px] text-gray-500">Resources</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-teal-600">3</p>
            <p className="text-[10px] text-gray-500">Quizzes</p>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          {[
            { icon: 'fa-cloud-upload-alt', label: 'Upload Resource', screen: 'upload' },
            { icon: 'fa-clipboard-list', label: 'Create Quiz', screen: 'create-quiz' },
            { icon: 'fa-list-alt', label: 'My Submissions', screen: 'submissions' },
            { icon: 'fa-eye', label: 'Student Preview', screen: 'student-preview' },
            { icon: 'fa-question-circle', label: 'Help & Support', screen: 'help' },
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

// ==================== STUDENT PREVIEW (FACULTY) ====================
export function StudentPreview({ onBack }: { onBack: () => void }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const students = [
    { name: 'Ayesha Khan', id: 'SIM-2024-0042', courses: ['NEET Foundation', 'NEET Physics'] },
    { name: 'Rahul Kumar', id: 'SIM-2024-0038', courses: ['NEET Foundation', 'NEET Chemistry'] },
    { name: 'Priya Singh', id: 'SIM-2024-0055', courses: ['NEET Biology', 'NEET Mock Tests'] },
  ];

  return (
    <div>
      <Header title="Student Preview" subtitle="Read-only view for authorized students" showBack onBack={onBack} />
      <div className="p-4">
        <div className="card bg-blue-50 border-l-4 border-blue-400 mb-4">
          <p className="text-xs text-blue-800">
            <i className="fas fa-shield-alt mr-1" />
            This is a restricted, read-only preview. You can only view students in your authorized courses. No modifications are permitted.
          </p>
        </div>

        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`card cursor-pointer ${selectedStudent === student.id ? 'ring-2 ring-teal-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">👩‍🎓</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-500">ID: {student.id}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{student.courses.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <div className="mt-4 card">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Student Activity (Read-only)</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Last Active</span>
                <span className="text-xs text-gray-700">2 hours ago</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Quizzes Completed</span>
                <span className="text-xs text-gray-700">8</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500">Average Score</span>
                <span className="text-xs text-gray-700">76%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-xs text-gray-500">Resources Accessed</span>
                <span className="text-xs text-gray-700">23</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
