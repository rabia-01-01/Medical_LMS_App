import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Header, EmptyState } from '../components/Navigation';
import {
  useAssessments,
  AssessmentRunner,
  AssessmentWithQuestions,
  QuestionWithOptions,
  getAssessmentBadgeColor,
  normalizeAssessmentType,
} from '../features/assessments';

// Helper to convert legacy DataContext quiz to unified AssessmentWithQuestions
function mapLegacyQuizToAssessment(q: any): AssessmentWithQuestions {
  const mappedQuestions: QuestionWithOptions[] = (q.questions || []).map((item: any, idx: number) => {
    const rawOptions = item.options || [];
    const correctIdx = item.correctAnswer !== undefined ? item.correctAnswer : 0;
    const opts = rawOptions.map((optText: string, oIdx: number) => ({
      id: `opt-${q.id}-${idx}-${oIdx}`,
      optionText: optText,
      isCorrect: oIdx === correctIdx,
      optionOrder: oIdx + 1,
    }));

    return {
      id: `q-${q.id}-${idx}`,
      subject_id: q.courseId || 'general',
      chapter_id: null,
      topic_id: null,
      question_text: item.question || `Question ${idx + 1}`,
      question_type: 'MCQ',
      marks: item.marks || 4,
      negative_marks: item.negativeMarks || q.negativeMarking || 1,
      explanation: item.explanation || `The correct answer is Option ${String.fromCharCode(65 + correctIdx)}.`,
      created_by: q.createdById || 'faculty',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: opts,
    };
  });

  return {
    id: q.id,
    title: q.title || 'Medical Examination',
    description: q.description || `${q.subject || 'Medical'} examination practice`,
    assessment_type: normalizeAssessmentType(q.type || q.category || q.title),
    subject_id: q.courseId || 'general',
    chapter_id: null,
    duration_minutes: q.duration || 45,
    total_marks: q.marks || mappedQuestions.length * 4,
    negative_marks: q.negativeMarking || 1,
    allow_retake: true,
    created_by: q.createdById || 'faculty',
    status: 'PUBLISHED',
    created_at: q.startDate || new Date().toISOString(),
    updated_at: q.endDate || new Date().toISOString(),
    subjectName: q.subject || 'General Medical',
    creatorName: q.createdByName || 'Faculty',
    questionCount: mappedQuestions.length,
    questions: mappedQuestions,
  };
}

// ==================== QUIZZES / ASSESSMENTS LIST ====================
export function QuizList({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}) {
  const { user } = useAuth();
  const { quizzes: legacyQuizzes } = useData();
  const { assessments: cloudAssessments, loading: cloudLoading } = useAssessments();

  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const isFaculty = user?.role === 'faculty';

  // Merge unified assessments with legacy quizzes
  const allAssessments = useMemo(() => {
    const list: AssessmentWithQuestions[] = [];
    const seen = new Set<string>();

    // 1. Cloud & Unified Assessments
    cloudAssessments.forEach((ca) => {
      seen.add(ca.id);
      list.push(ca);
    });

    // 2. Legacy context quizzes mapped to unified structure
    legacyQuizzes.forEach((lq) => {
      if (!seen.has(lq.id)) {
        list.push(mapLegacyQuizToAssessment(lq));
      }
    });

    return list;
  }, [cloudAssessments, legacyQuizzes]);

  const filterTabs = ['All', 'DPP', 'PYQ', 'Mock Tests', 'Test Series'];

  let filtered = allAssessments;

  if (filter === 'DPP') {
    filtered = filtered.filter((a) => a.assessment_type === 'DPP');
  } else if (filter === 'PYQ') {
    filtered = filtered.filter((a) => a.assessment_type === 'PYQ');
  } else if (filter === 'Mock Tests') {
    filtered = filtered.filter((a) => a.assessment_type === 'MOCK_TEST');
  } else if (filter === 'Test Series') {
    filtered = filtered.filter((a) => a.assessment_type === 'TEST_SERIES');
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subjectName && a.subjectName.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }

  return (
    <div>
      <Header
        title="Examinations & Drills"
        subtitle={`${filtered.length} assessment modules`}
        showBack
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            {cloudLoading && (
              <div
                className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"
                title="Syncing assessments..."
              />
            )}
            {isFaculty && (
              <button
                onClick={() => onNavigate('create-quiz')}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                title="Create new assessment (Faculty only)"
              >
                <i className="fas fa-plus text-[10px]" />
                <span className="hidden sm:inline">New Test</span>
              </button>
            )}
          </div>
        }
      />

      {/* Search Input */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DPPs, PYQs, Mock Tests..."
            className="w-full pl-8 pr-3 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filter === f
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Assessments List */}
      <div className="px-4 space-y-3 pb-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon="fa-clipboard-list"
            title="No Assessments Found"
            message={
              search
                ? 'No examination modules match your search.'
                : 'No assessments available in this category yet.'
            }
          />
        ) : (
          filtered.map((asmt) => {
            const badge = getAssessmentBadgeColor(asmt.assessment_type);
            return (
              <div
                key={asmt.id}
                onClick={() => onNavigate('quiz-detail', asmt)}
                className="card mb-0 cursor-pointer active:bg-gray-50 border border-slate-100 hover:border-teal-300 transition shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <i className="fas fa-clock text-[10px] text-teal-600" />
                    <span>{asmt.duration_minutes} min</span>
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 leading-snug">{asmt.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {asmt.subjectName || 'Medical Subject'} • By {asmt.creatorName || 'Faculty'}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>
                      <i className="fas fa-question-circle text-teal-600 mr-1" />
                      {asmt.questions?.length || asmt.questionCount || 0} Questions
                    </span>
                    <span>
                      <i className="fas fa-star text-amber-500 mr-1" />
                      {asmt.total_marks} Marks
                    </span>
                    <span className="text-rose-500 font-semibold">
                      -{asmt.negative_marks} Neg
                    </span>
                  </div>
                  <span className="text-teal-600 font-bold flex items-center gap-0.5 text-xs">
                    Take Test <i className="fas fa-chevron-right text-[10px]" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==================== QUIZ / ASSESSMENT DETAIL ====================
export function QuizDetail({
  onBack,
  onNavigate,
  quiz,
}: {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  quiz?: any;
}) {
  const asmt: AssessmentWithQuestions | null = useMemo(() => {
    if (!quiz) return null;
    if (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].options) {
      return quiz as AssessmentWithQuestions;
    }
    return mapLegacyQuizToAssessment(quiz);
  }, [quiz]);

  const [showInstructions, setShowInstructions] = useState(false);

  if (!asmt) {
    return (
      <div>
        <Header title="Assessment" showBack onBack={onBack} gradient={false} />
        <EmptyState
          icon="fa-clipboard"
          title="Assessment Not Found"
          message="This examination module is currently unavailable."
        />
      </div>
    );
  }

  const badge = getAssessmentBadgeColor(asmt.assessment_type);

  if (showInstructions) {
    return (
      <QuizInstructions
        onBack={() => setShowInstructions(false)}
        onStart={() => onNavigate('active-quiz', asmt)}
        quiz={asmt}
      />
    );
  }

  return (
    <div>
      <Header title="Assessment Overview" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        {/* Main Details Card */}
        <div className="card mb-0 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}
            >
              {badge.label}
            </span>
            <span className="text-xs text-slate-500 font-medium">By {asmt.creatorName || 'Faculty'}</span>
          </div>

          <h2 className="text-base font-bold text-slate-800 leading-snug">{asmt.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {asmt.subjectName} {asmt.chapterName && `• ${asmt.chapterName}`}
          </p>
          {asmt.description && (
            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
              {asmt.description}
            </p>
          )}

          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2 text-center">
              <p className="text-base font-bold text-teal-800">{asmt.questions?.length || 0}</p>
              <p className="text-[10px] text-teal-600 font-medium">Questions</p>
            </div>
            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2 text-center">
              <p className="text-base font-bold text-teal-800">{asmt.duration_minutes}</p>
              <p className="text-[10px] text-teal-600 font-medium">Minutes</p>
            </div>
            <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2 text-center">
              <p className="text-base font-bold text-teal-800">{asmt.total_marks}</p>
              <p className="text-[10px] text-teal-600 font-medium">Total Marks</p>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2 text-center">
              <p className="text-base font-bold text-rose-700">-{asmt.negative_marks}</p>
              <p className="text-[10px] text-rose-600 font-medium">Negative</p>
            </div>
          </div>
        </div>

        {/* Examination Rules Card */}
        <div className="card mb-0 bg-blue-50/40 border border-blue-100">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i className="fas fa-info-circle text-blue-600 text-xs" /> Examination Parameters
          </h3>
          <ul className="text-xs text-blue-900/80 space-y-1.5">
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-teal-600 text-[10px]" />
              <span>Standard Medical Marking: +4.00 per correct response</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-rose-500 text-[10px]" />
              <span>Negative Penalty: -{asmt.negative_marks}.00 per incorrect response</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-teal-600 text-[10px]" />
              <span>Question Palette with instant review and mark for review</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check text-teal-600 text-[10px]" />
              <span>Detailed post-exam clinical explanations & solutions</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={() => setShowInstructions(true)}
          className="btn-primary w-full py-3 shadow-sm flex items-center justify-center gap-2"
        >
          <i className="fas fa-play text-xs" />
          <span>Start Assessment</span>
        </button>
      </div>
    </div>
  );
}

// ==================== EXAMINATION INSTRUCTIONS ====================
function QuizInstructions({
  onBack,
  onStart,
  quiz,
}: {
  onBack: () => void;
  onStart: () => void;
  quiz: AssessmentWithQuestions;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      <Header title="Instructions & Policy" showBack onBack={onBack} gradient={false} />
      <div className="p-4 space-y-4">
        <div className="card mb-0 border-l-4 border-amber-500 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <i className="fas fa-shield-alt text-amber-500" />
            Medical Examination Code of Conduct
          </h3>
          <ul className="space-y-2.5">
            {[
              'This is a timed test session. The timer starts immediately upon clicking "Begin Assessment".',
              `Marking scheme: +${quiz.questions?.[0]?.marks || 4} for correct, -${quiz.negative_marks || 1} for incorrect.`,
              'Use the question palette to jump across questions or mark uncertain questions for review.',
              'When time expires, the system automatically collects and grades all saved responses.',
              'Explanations with clinical rationale will unlock immediately after submission.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-600 leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card mb-0 bg-slate-50 border border-slate-200 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="policy-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-teal-600 rounded cursor-pointer"
          />
          <label htmlFor="policy-agree" className="text-xs text-slate-700 font-medium cursor-pointer">
            I confirm that I am taking this test independently in adherence to medical examination standards.
          </label>
        </div>

        <button
          onClick={onStart}
          disabled={!agreed}
          className="btn-primary w-full disabled:opacity-40 transition py-3"
        >
          Begin Assessment
        </button>
      </div>
    </div>
  );
}

// ==================== ACTIVE QUIZ / ASSESSMENT ====================
export function ActiveQuiz({
  onBack,
  onNavigate,
  quiz,
}: {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  quiz?: any;
}) {
  const { quizzes } = useData();
  const { assessments } = useAssessments();

  const resolvedAssessment: AssessmentWithQuestions | null = useMemo(() => {
    if (quiz) {
      if (quiz.questions && quiz.questions.length > 0 && quiz.questions[0].options) {
        return quiz as AssessmentWithQuestions;
      }
      return mapLegacyQuizToAssessment(quiz);
    }

    if (assessments.length > 0) {
      return assessments[0];
    }

    const legacyActive = quizzes.find((q) => q.status === 'active') || quizzes[0];
    return legacyActive ? mapLegacyQuizToAssessment(legacyActive) : null;
  }, [quiz, assessments, quizzes]);

  if (!resolvedAssessment || !resolvedAssessment.questions || resolvedAssessment.questions.length === 0) {
    return (
      <div>
        <Header title="Examination" showBack onBack={onBack} gradient={false} />
        <EmptyState
          icon="fa-clipboard"
          title="No Active Examination"
          message="No active questions found to start."
        />
      </div>
    );
  }

  return (
    <AssessmentRunner
      assessment={resolvedAssessment}
      onBack={onBack}
      onFinish={(results) => {
        onNavigate('quiz-results', { results, quiz: resolvedAssessment });
      }}
    />
  );
}

// ==================== QUIZ RESULTS WRAPPER ====================
export function QuizResults({
  onBack,
  quizData,
}: {
  onBack: () => void;
  quizData?: any;
}) {
  const assessment = quizData?.quiz;
  const results = quizData?.results;

  if (assessment && results) {
    return (
      <AssessmentRunner
        assessment={assessment}
        onBack={onBack}
      />
    );
  }

  // Fallback if results were passed via legacy format
  return (
    <div className="p-4">
      <Header title="Results" showBack onBack={onBack} gradient={false} />
      <div className="card text-center my-6">
        <i className="fas fa-trophy text-4xl text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-slate-800">Assessment Completed</h3>
        <p className="text-xs text-slate-500 mt-1">Review your score in the dashboard</p>
        <button onClick={onBack} className="btn-primary mt-4">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
