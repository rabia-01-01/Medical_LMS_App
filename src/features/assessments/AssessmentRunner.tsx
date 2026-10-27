import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../../components/Navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext';
import { attemptService } from '../attempts';
import {
  AssessmentWithQuestions,
  AssessmentAnswerRecord,
  AssessmentResultSummary,
  getAssessmentBadgeColor,
} from './types';
import { evaluateAnswers } from './assessmentService';

interface AssessmentRunnerProps {
  assessment: AssessmentWithQuestions;
  onBack: () => void;
  onFinish?: (result: AssessmentResultSummary) => void;
}

export function AssessmentRunner({ assessment, onBack, onFinish }: AssessmentRunnerProps) {
  const questions = useMemo(() => assessment.questions || [], [assessment.questions]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswerRecord>>({});
  const [timeLeft, setTimeLeft] = useState((assessment.duration_minutes || 45) * 60);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<AssessmentResultSummary | null>(null);

  const currentQ = questions[currentIdx];
  const currentRecord = currentQ ? answers[currentQ.id] : undefined;

  // Countdown Timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (optionIndex: number, optionId?: string) => {
    if (isSubmitted || !currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        selectedOptionIndex: optionIndex,
        selectedOptionId: optionId,
      },
    }));
  };

  const handleClearResponse = () => {
    if (!currentQ || isSubmitted) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      if (copy[currentQ.id]) {
        delete copy[currentQ.id].selectedOptionIndex;
        delete copy[currentQ.id].selectedOptionId;
      }
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    if (!currentQ || isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        questionId: currentQ.id,
        isMarkedForReview: !prev[currentQ.id]?.isMarkedForReview,
      },
    }));
  };

  const { user, authUser } = useAuth();
  const studentId = authUser?.studentId || user?.id || 'std-seed-1';

  const handleSubmit = useCallback(() => {
    setShowConfirmModal(false);
    const timeSpent = (assessment.duration_minutes || 45) * 60 - timeLeft;
    const evaluated = evaluateAnswers(assessment, answers, timeSpent);
    setResults(evaluated);
    setIsSubmitted(true);

    // Persist attempt to PostgreSQL / Supabase & local cache
    const answersList = evaluated.breakdown.map((item) => ({
      id: uuidv4(),
      attemptId: '',
      questionId: item.questionId,
      questionText: item.questionText,
      selectedOptionText: item.selectedOptionText,
      correctOptionText: item.correctOptionText,
      isCorrect: item.isCorrect,
      marksAwarded: item.marksAwarded,
      answeredAt: new Date().toISOString(),
      explanation: item.explanation,
    }));

    attemptService.startAttempt(assessment.id, studentId, {
      assessmentTitle: assessment.title,
      assessmentType: assessment.assessment_type,
      totalMarks: assessment.total_marks,
      durationMinutes: assessment.duration_minutes,
      subjectName: assessment.subjectName,
    }).then((created) => {
      attemptService.submitAttempt(
        created.id,
        evaluated.totalScore,
        evaluated.accuracyPercentage,
        answersList.map((a) => ({ ...a, attemptId: created.id }))
      );
    }).catch((err) => {
      console.warn('[AssessmentRunner] Attempt save notice:', err);
    });

    if (evaluated.accuracyPercentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#0f2b46', '#14b8a6', '#009246', '#ce2b37'],
      });
    }

    if (onFinish) {
      onFinish(evaluated);
    }
  }, [assessment, answers, timeLeft, studentId, onFinish]);

  // Statistics
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionIndex !== undefined || a.selectedOptionId !== undefined
  ).length;
  const markedReviewCount = Object.values(answers).filter((a) => a.isMarkedForReview).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const badge = getAssessmentBadgeColor(assessment.assessment_type);

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Header title="Examination" showBack onBack={onBack} gradient={false} />
        <p className="text-sm text-gray-500 mt-8">No questions loaded for this assessment.</p>
        <button onClick={onBack} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  // ==================== RESULTS VIEW ====================
  if (isSubmitted && results) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <Header
          title="Examination Performance"
          subtitle={assessment.title}
          showBack
          onBack={onBack}
          gradient={false}
        />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Score Header Card */}
          <div className="card text-center relative overflow-hidden bg-white shadow-sm border border-slate-100">
            <div className="w-20 h-20 rounded-full border-4 border-teal-500 flex flex-col items-center justify-center mx-auto mb-2 shadow-xs bg-teal-50/30">
              <span className="text-xl font-extrabold text-teal-800">{results.accuracyPercentage}%</span>
              <span className="text-[9px] uppercase tracking-wider text-teal-600 font-semibold">Accuracy</span>
            </div>
            <h2 className="text-base font-bold text-gray-800">{assessment.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Net Score:{' '}
              <span className={`font-bold ${results.totalScore >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                {results.totalScore}
              </span>{' '}
              / {results.maxScore} marks
            </p>

            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-emerald-700">{results.correctCount}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Correct</p>
              </div>
              <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-rose-700">{results.incorrectCount}</p>
                <p className="text-[10px] text-rose-600 font-medium">Incorrect</p>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-slate-700">{results.unansweredCount}</p>
                <p className="text-[10px] text-slate-500 font-medium">Skipped</p>
              </div>
              <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2 text-center">
                <p className="text-sm font-bold text-teal-800">{Math.floor(results.timeSpentSeconds / 60)}m</p>
                <p className="text-[10px] text-teal-600 font-medium">Time Taken</p>
              </div>
            </div>
          </div>

          {/* Question Breakdown with Medical Explanations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
              Clinical & Concept Breakdown ({results.breakdown.length} Questions)
            </h3>
            {results.breakdown.map((item, idx) => (
              <div
                key={item.questionId}
                className={`card mb-0 border-l-4 ${
                  item.isCorrect
                    ? 'border-emerald-500'
                    : item.selectedOptionText
                    ? 'border-rose-500'
                    : 'border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.selectedOptionText
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.isCorrect ? '✓' : item.selectedOptionText ? '✗' : '—'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Q{idx + 1}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      item.marksAwarded > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.marksAwarded < 0
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.marksAwarded > 0 ? `+${item.marksAwarded}` : item.marksAwarded} Marks
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed mb-2">
                  {item.questionText}
                </p>

                <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-emerald-700 font-medium">
                    <span className="font-bold">Correct Key:</span> {item.correctOptionText}
                  </p>
                  {item.selectedOptionText && !item.isCorrect && (
                    <p className="text-rose-600">
                      <span className="font-bold">Your Choice:</span> {item.selectedOptionText}
                    </p>
                  )}
                  {!item.selectedOptionText && (
                    <p className="text-slate-500 italic">Unattempted / Skipped</p>
                  )}
                </div>

                {item.explanation && (
                  <div className="mt-2 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    <div className="flex items-center gap-1 font-bold text-blue-800 mb-0.5">
                      <i className="fas fa-stethoscope text-[10px]" />
                      <span>Clinical Solution & Explanation:</span>
                    </div>
                    <p className="text-blue-950/90">{item.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 pb-6 space-y-2">
            {assessment.allow_retake && (
              <button
                onClick={() => {
                  setAnswers({});
                  setCurrentIdx(0);
                  setTimeLeft((assessment.duration_minutes || 45) * 60);
                  setIsSubmitted(false);
                  setResults(null);
                }}
                className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-xl text-xs transition border border-teal-200"
              >
                <i className="fas fa-redo mr-1.5" /> Retake Assessment
              </button>
            )}
            <button onClick={onBack} className="btn-primary w-full">
              <i className="fas fa-home mr-1.5" /> Return to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LIVE EXAMINATION VIEW ====================
  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Examination Status Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <button
            onClick={() => setShowPalette(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <i className="fas fa-th text-xs text-teal-600" />
            <span>
              Q {currentIdx + 1}/{questions.length}
            </span>
          </button>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition ${
              timeLeft < 300
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse font-extrabold'
                : 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
            }`}
          >
            <i className="fas fa-clock text-[11px]" />
            <span className="text-xs font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-teal-500 h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Question Header Card */}
        <div className="card mb-0 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="badge badge-navy text-[10px] py-0.5 px-2">
              Question {currentIdx + 1}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold">+{currentQ.marks}</span>
              <span>/</span>
              <span className="text-rose-500 font-bold">-{currentQ.negative_marks}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
            {currentQ.question_text}
          </p>
        </div>

        {/* Question Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected =
              currentRecord?.selectedOptionIndex === optIdx ||
              (opt.id && currentRecord?.selectedOptionId === opt.id);

            return (
              <div
                key={opt.id || optIdx}
                onClick={() => handleSelectOption(optIdx, opt.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition active:scale-[0.99] ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-xs leading-relaxed flex-1">{opt.optionText}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls for Active Question */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={handleToggleMarkReview}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
              currentRecord?.isMarkedForReview
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fas fa-bookmark text-[10px]" />
            <span>{currentRecord?.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>

          {(currentRecord?.selectedOptionIndex !== undefined || currentRecord?.selectedOptionId) && (
            <button
              onClick={handleClearResponse}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              Clear Choice
            </button>
          )}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          disabled={currentIdx === 0}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1"
        >
          <i className="fas fa-chevron-left text-[10px]" /> Prev
        </button>

        <span className="text-xs text-slate-400 font-medium">
          {answeredCount}/{questions.length} Attempted
        </span>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
          >
            Next <i className="fas fa-chevron-right text-[10px]" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1"
          >
            <i className="fas fa-check-circle text-[11px]" /> Finish & Submit
          </button>
        )}
      </div>

      {/* Question Palette Modal */}
      {showPalette && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="bg-white w-full max-w-[430px] rounded-t-2xl sm:rounded-2xl p-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Question Palette</h3>
                <p className="text-[10px] text-slate-400">Navigate to any question directly</p>
              </div>
              <button
                onClick={() => setShowPalette(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto p-1 flex-1">
              {questions.map((q, idx) => {
                const rec = answers[q.id];
                const hasAnswered =
                  rec?.selectedOptionIndex !== undefined || rec?.selectedOptionId !== undefined;
                const isMarked = rec?.isMarkedForReview;
                const isCurrent = idx === currentIdx;

                let btnClass = 'bg-slate-100 text-slate-600 border-slate-200';
                if (hasAnswered) {
                  btnClass = isMarked
                    ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                } else if (isMarked) {
                  btnClass = 'bg-purple-50 text-purple-600 border-purple-200';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowPalette(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center relative ${btnClass} ${
                      isCurrent ? 'ring-2 ring-teal-500 ring-offset-1' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Review
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> Skipped
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submission Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 text-lg">
              <i className="fas fa-clipboard-check" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Submit Examination?</h3>
            <p className="text-xs text-slate-500 mt-1">
              You have answered <span className="font-bold text-slate-700">{answeredCount}</span> of{' '}
              <span className="font-bold text-slate-700">{questions.length}</span> questions.
              {markedReviewCount > 0 && ` (${markedReviewCount} marked for review)`}
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
