import React, { useState } from 'react';
import { Header } from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useCurriculum } from '../curriculum';
import { useAssessments } from './useAssessments';
import type { AssessmentType, QuestionType, CreateQuestionInput } from './types';
import { getAssessmentBadgeColor } from './types';

interface AssessmentCreatorProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AssessmentCreator({ onBack, onSuccess }: AssessmentCreatorProps) {
  const { user } = useAuth();
  const { subjects, chapters, activeSubject, setActiveSubjectId } = useCurriculum();
  const { createAssessment } = useAssessments();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('DPP');
  const [chapterId, setChapterId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [allowRetake, setAllowRetake] = useState(true);

  // Questions Builder
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([
    {
      questionText: '',
      questionType: 'MCQ',
      marks: 4,
      negativeMarks: 1,
      explanation: '',
      options: [
        { optionText: '', isCorrect: true, optionOrder: 1 },
        { optionText: '', isCorrect: false, optionOrder: 2 },
        { optionText: '', isCorrect: false, optionOrder: 3 },
        { optionText: '', isCorrect: false, optionOrder: 4 },
      ],
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        questionType: 'MCQ',
        marks: 4,
        negativeMarks: negativeMarks,
        explanation: '',
        options: [
          { optionText: '', isCorrect: true, optionOrder: 1 },
          { optionText: '', isCorrect: false, optionOrder: 2 },
          { optionText: '', isCorrect: false, optionOrder: 3 },
          { optionText: '', isCorrect: false, optionOrder: 4 },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[optIdx].optionText = text;
      return copy;
    });
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options.forEach((opt, idx) => {
        opt.isCorrect = idx === optIdx;
      });
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide an assessment title.');
      return;
    }

    const targetSubjectId = activeSubject?.id || (subjects[0]?.id ?? 'sub-general');

    const validQuestions = questions.filter(
      (q) => q.questionText.trim() && q.options.some((o) => o.optionText.trim())
    );

    if (validQuestions.length === 0) {
      setErrorMessage('Please add at least one complete question with options.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await createAssessment({
        title: title.trim(),
        description: description.trim() || undefined,
        assessmentType,
        subjectId: targetSubjectId,
        chapterId: chapterId || null,
        durationMinutes: Number(durationMinutes) || 30,
        negativeMarks: Number(negativeMarks) || 1,
        allowRetake,
        status: 'PUBLISHED',
        questions: validQuestions,
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onBack();
      }, 1400);
    } catch (err: any) {
      console.error('[AssessmentCreator] Submission failed:', err);
      setErrorMessage(err.message || 'Failed to create assessment.');
    } finally {
      setSaving(false);
    }
  };

  const typesList: AssessmentType[] = ['DPP', 'PYQ', 'MOCK_TEST', 'TEST_SERIES'];

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-2xl">
            <i className="fas fa-check-circle" />
          </div>
          <p className="text-sm font-bold text-slate-800">Assessment Published!</p>
          <p className="text-xs text-slate-500 mt-1">Synced to Question Bank & Students</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Create Assessment" showBack onBack={onBack} gradient={false} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <i className="fas fa-exclamation-circle" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Assessment Type Selection */}
        <div className="card mb-0 shadow-xs border border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-2">Examination Category</label>
          <div className="grid grid-cols-2 gap-2">
            {typesList.map((type) => {
              const b = getAssessmentBadgeColor(type);
              const isSelected = assessmentType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssessmentType(type)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 shadow-2xs ring-1 ring-teal-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                      {b.label}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {type === 'DPP'
                        ? 'Daily Chapter Drill'
                        : type === 'PYQ'
                        ? 'Past Medical Papers'
                        : type === 'MOCK_TEST'
                        ? 'Simulated Full Exam'
                        : 'Scheduled Series'}
                    </span>
                  </div>
                  {isSelected && <i className="fas fa-check-circle text-teal-600 text-xs" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className="card mb-0 shadow-xs border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assessment Metadata</h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Human Physiology: Neural Regulation DPP-04"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key concepts, topics tested, and instructions..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Subject</label>
              <select
                value={activeSubject?.id || ''}
                onChange={(e) => setActiveSubjectId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Chapter (Optional)</label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Full Syllabus / General</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Duration (Minutes)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(5, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Negative Marking</label>
              <select
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={1}>-1.00 (Standard Medical)</option>
                <option value={0.5}>-0.50 (Partial)</option>
                <option value={0}>0 (No Negative Marking)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="retake-toggle"
              checked={allowRetake}
              onChange={(e) => setAllowRetake(e.target.checked)}
              className="w-3.5 h-3.5 text-teal-600 rounded"
            />
            <label htmlFor="retake-toggle" className="text-xs text-slate-600 cursor-pointer">
              Allow multiple student retakes for practice drills
            </label>
          </div>
        </div>

        {/* Question Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assessment Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <i className="fas fa-plus text-[10px]" /> Add Question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="card mb-0 shadow-xs border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge badge-navy text-[10px] py-0.5 px-2">Q{qIdx + 1}</span>
                  <select
                    value={q.questionType}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[qIdx].questionType = e.target.value as QuestionType;
                      setQuestions(copy);
                    }}
                    className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold"
                  >
                    <option value="MCQ">Standard MCQ</option>
                    <option value="ASSERTION_REASON">Assertion & Reason</option>
                  </select>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-slate-400 hover:text-rose-600 transition text-xs"
                    title="Remove question"
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                )}
              </div>

              <textarea
                value={q.questionText}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[qIdx].questionText = e.target.value;
                  setQuestions(copy);
                }}
                placeholder="Enter clinical question stem..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  Options (Click green bubble to set correct key):
                </span>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetCorrectOption(qIdx, oIdx)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition flex-shrink-0 ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                      title={opt.isCorrect ? 'Correct Option' : 'Mark as Correct'}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </button>
                    <input
                      type="text"
                      value={opt.optionText}
                      onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                      className={`flex-1 px-3 py-1.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        opt.isCorrect ? 'border-emerald-300 font-medium' : 'border-slate-200'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-0.5 block">
                  Medical Solution / Explanation (Shown in review):
                </label>
                <input
                  type="text"
                  value={q.explanation || ''}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[qIdx].explanation = e.target.value;
                    setQuestions(copy);
                  }}
                  placeholder="e.g. Mechanism of action or anatomical pathway explanation..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-xl text-xs font-semibold text-slate-500 hover:text-teal-700 transition flex items-center justify-center gap-1.5 bg-slate-50/50"
          >
            <i className="fas fa-plus text-[10px]" /> Add Another Question
          </button>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 pb-6 space-y-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Publishing to Question Bank...
              </span>
            ) : (
              'Save & Publish Assessment'
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
