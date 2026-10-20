import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Header, StatusBadge, EmptyState } from '../components/Navigation';

// ==================== QUIZZES LIST ====================
export function QuizList({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string, data?: any) => void }) {
  const { quizzes } = useData();
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Active', 'Upcoming', 'Completed'];
  
  let filtered = quizzes;
  if (filter !== 'All') filtered = filtered.filter(q => q.status === filter.toLowerCase());

  return (
    <div>
      <Header title="Quizzes" subtitle={`${filtered.length} quizzes`} showBack onBack={onBack} />
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === f ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
        ))}
      </div>
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon="fa-clipboard" title="No Quizzes" message="No quizzes available yet. Faculty or admin can create quizzes." />
        ) : (
          filtered.map((quiz) => (
            <div key={quiz.id} onClick={() => onNavigate('quiz-detail', quiz)} className="card cursor-pointer active:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={quiz.status} />
                <span className="text-xs text-gray-500"><i className="fas fa-clock mr-1" />{quiz.duration} min</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{quiz.title}</p>
              <p className="text-xs text-gray-500 mt-1">{quiz.subject} • By {quiz.createdByName}</p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400"><i className="fas fa-question-circle mr-1" />{quiz.questions.length} Qs</span>
                <span className="text-[10px] text-gray-400"><i className="fas fa-star mr-1" />{quiz.marks} marks</span>
                <span className="text-[10px] text-gray-400"><i className="fas fa-minus-circle mr-1" />-{quiz.negativeMarking}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== QUIZ DETAIL ====================
export function QuizDetail({ onBack, onNavigate, quiz }: { onBack: () => void; onNavigate: (screen: string) => void; quiz?: any }) {
  const q = quiz;
  const [showInstructions, setShowInstructions] = useState(false);

  if (!q) return (
    <div>
      <Header title="Quiz" showBack onBack={onBack} gradient={false} />
      <EmptyState icon="fa-clipboard" title="Quiz Not Found" message="This quiz is no longer available" />
    </div>
  );

  if (showInstructions) {
    return <QuizInstructions onBack={() => setShowInstructions(false)} onStart={() => onNavigate('active-quiz')} quiz={q} />;
  }

  return (
    <div>
      <Header title="Quiz Details" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={q.status} />
            <span className="text-xs text-gray-500">By {q.createdByName}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">{q.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{q.subject}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-teal-600">{q.questions.length}</p>
              <p className="text-[10px] text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-teal-600">{q.duration}</p>
              <p className="text-[10px] text-gray-500">Minutes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-teal-600">{q.marks}</p>
              <p className="text-[10px] text-gray-500">Total Marks</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-red-500">-{q.negativeMarking}</p>
              <p className="text-[10px] text-gray-500">Negative Marking</p>
            </div>
          </div>
        </div>
        {q.status === 'active' && (
          <button onClick={() => setShowInstructions(true)} className="btn-primary"><i className="fas fa-play mr-2" />Start Quiz</button>
        )}
        {q.status === 'upcoming' && (
          <div className="text-center py-4"><i className="fas fa-clock text-3xl text-gray-300 mb-2" /><p className="text-sm text-gray-500">Not yet available</p></div>
        )}
        {q.status === 'completed' && (
          <button onClick={() => onNavigate('quiz-results')} className="btn-primary"><i className="fas fa-trophy mr-2" />View Results</button>
        )}
      </div>
    </div>
  );
}

// ==================== QUIZ INSTRUCTIONS ====================
function QuizInstructions({ onBack, onStart, quiz }: { onBack: () => void; onStart: () => void; quiz: any }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div>
      <Header title="Instructions" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        <div className="card mb-4 border-l-4 border-orange-400">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><i className="fas fa-exclamation-triangle text-orange-500" />Examination Policy</h3>
          <ul className="space-y-2">
            {['Timed examination. Timer starts when you begin.', 'Each correct answer: +4 marks. Incorrect: -1 mark.', 'Do not switch to other applications.', 'App-switching events are recorded.', 'Quiz auto-submits when time expires.', 'Ensure stable internet connectivity.', 'Results published after quiz end date.'].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-xs text-gray-600">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-start gap-2 mb-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4" />
          <label className="text-xs text-gray-600">I have read and agree to the examination policy.</label>
        </div>
        <button onClick={onStart} disabled={!agreed} className="btn-primary disabled:opacity-50">Begin Quiz</button>
      </div>
    </div>
  );
}

// ==================== ACTIVE QUIZ ====================
export function ActiveQuiz({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: string, data?: any) => void }) {
  const { quizzes } = useData();
  const activeQuiz = quizzes.find(q => q.status === 'active');
  const questions = activeQuiz?.questions || [];
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState((activeQuiz?.duration || 45) * 60);
  const [showNav, setShowNav] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit with current answers
          onNavigate('quiz-results', { answers, quiz: activeQuiz });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft <= 0]);

  // Prevent back navigation during quiz
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowExitWarning(true);
      window.history.pushState(null, '', window.location.href);
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (optionIndex: number) => setAnswers(prev => ({ ...prev, [currentQ]: optionIndex }));
  
  const handleSubmit = () => {
    setShowSubmit(false);
    onNavigate('quiz-results', { answers, quiz: activeQuiz });
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return (
      <div>
        <Header title="Quiz" showBack onBack={onBack} gradient={false} />
        <EmptyState icon="fa-clipboard" title="No Questions" message="This quiz has no questions" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setShowNav(true)} className="text-sm text-gray-600"><i className="fas fa-th mr-1" />Q {currentQ + 1}/{questions.length}</button>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-teal-100 text-teal-700'}`}>
            <i className="fas fa-clock text-xs" /><span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        <p className="text-[10px] text-orange-600 mt-1 text-center"><i className="fas fa-lock mr-1" />Quiz in progress - cannot exit until submission</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="badge badge-navy">Question {currentQ + 1}</span>
            <span className="text-xs text-gray-500">+{questions[currentQ].marks}/-{questions[currentQ].negativeMarks}</span>
          </div>
          <p className="text-sm font-medium text-gray-800">{questions[currentQ].question}</p>
        </div>
        <div className="space-y-2">
          {questions[currentQ].options.map((option: string, idx: number) => (
            <div key={idx} onClick={() => selectAnswer(idx)} className={`quiz-option ${answers[currentQ] === idx ? 'selected' : ''}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${answers[currentQ] === idx ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{String.fromCharCode(65 + idx)}</span>
              <span className="text-sm text-gray-700">{option}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="px-4 py-2 bg-gray-100 rounded-lg text-sm disabled:opacity-50"><i className="fas fa-chevron-left mr-1" />Prev</button>
        <div className="flex-1 text-center"><span className="text-xs text-gray-500">{answeredCount}/{questions.length}</span></div>
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)} className="px-4 py-2 bg-teal-500 rounded-lg text-sm text-white">Next<i className="fas fa-chevron-right ml-1" /></button>
        ) : (
          <button onClick={() => setShowSubmit(true)} className="px-4 py-2 bg-green-500 rounded-lg text-sm text-white">Submit<i className="fas fa-check ml-1" /></button>
        )}
      </div>
      {showNav && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowNav(false)}>
          <div className="bg-white w-full max-w-[430px] mx-auto rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Navigation</h3><button onClick={() => setShowNav(false)}><i className="fas fa-times text-gray-400" /></button></div>
            <div className="grid grid-cols-5 gap-2">{questions.map((_: any, idx: number) => (<button key={idx} onClick={() => { setCurrentQ(idx); setShowNav(false); }} className={`w-10 h-10 rounded-lg text-xs font-bold flex items-center justify-center ${idx === currentQ ? 'bg-teal-500 text-white' : answers[idx] !== undefined ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</button>))}</div>
          </div>
        </div>
      )}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-exclamation-triangle text-orange-500 text-xl" /></div>
              <h3 className="text-lg font-bold">Submit Quiz?</h3>
              <p className="text-sm text-gray-500 mt-1">Answered {answeredCount}/{questions.length}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmit(false)} className="btn-secondary flex-1">Review</button>
              <button onClick={handleSubmit} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-sm">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showExitWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><i className="fas fa-lock text-red-500 text-xl" /></div>
              <h3 className="text-lg font-bold">Cannot Exit Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">You must complete and submit the quiz before exiting. Time remaining: {formatTime(timeLeft)}</p>
            </div>
            <button onClick={() => setShowExitWarning(false)} className="btn-primary">Continue Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== QUIZ RESULTS ====================
export function QuizResults({ onBack, quizData }: { onBack: () => void; quizData?: any }) {
  const data = quizData || { answers: {}, quiz: null };
  const answers = data.answers || {};
  const quiz = data.quiz;
  
  if (!quiz || !quiz.questions) {
    return (
      <div>
        <Header title="Results" showBack onBack={onBack} gradient={false} />
        <EmptyState icon="fa-clipboard" title="No Results" message="Quiz data not available" />
      </div>
    );
  }

  // Calculate actual results
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let totalScore = 0;

  quiz.questions.forEach((q: any, idx: number) => {
    if (answers[idx] === undefined) {
      unanswered++;
    } else if (answers[idx] === q.correctAnswer) {
      correct++;
      totalScore += q.marks;
    } else {
      incorrect++;
      totalScore -= q.negativeMarks;
    }
  });

  const maxScore = quiz.questions.length * 4; // Assuming 4 marks per question
  const percentage = maxScore > 0 ? Math.max(0, (totalScore / maxScore) * 100) : 0;

  return (
    <div>
      <Header title="Results" showBack onBack={onBack} gradient={false} />
      <div className="p-4">
        <div className="card text-center mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-teal-500 flex items-center justify-center mx-auto mb-3">
            <p className="text-2xl font-bold text-teal-600">{percentage.toFixed(0)}%</p>
          </div>
          <h2 className="text-lg font-bold text-gray-800">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Score: {totalScore}/{maxScore} marks</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-green-600">{correct}</p>
              <p className="text-[10px] text-green-600">Correct</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-600">{incorrect}</p>
              <p className="text-[10px] text-red-600">Incorrect</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-gray-600">{unanswered}</p>
              <p className="text-[10px] text-gray-600">Skipped</p>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <h3 className="text-sm font-bold text-gray-800 mb-3">Answer Review</h3>
        <div className="space-y-2">
          {quiz.questions.map((q: any, idx: number) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            const wasAnswered = userAnswer !== undefined;
            
            return (
              <div key={idx} className={`card ${isCorrect ? 'border-l-4 border-green-500' : wasAnswered ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-300'}`}>
                <div className="flex items-start gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCorrect ? 'bg-green-100 text-green-600' : wasAnswered ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isCorrect ? '✓' : wasAnswered ? '✗' : '—'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">Q{idx + 1}: {q.question}</p>
                    <p className="text-[10px] text-green-600 mt-1">
                      Correct: {q.options[q.correctAnswer]}
                    </p>
                    {wasAnswered && !isCorrect && (
                      <p className="text-[10px] text-red-600">Your answer: {q.options[userAnswer]}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Home Button */}
        <div className="mt-6 mb-4">
          <button onClick={onBack} className="btn-primary">
            <i className="fas fa-home mr-2" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
