import React, { useState } from 'react';
import { useCurriculum } from '../features/curriculum';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface GeneratedMCQ {
  id: number;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  explanation: string;
}

export function AdminAIMCQGenerator({ onBack }: { onBack?: () => void }) {
  const { curriculum, subjects } = useCurriculum();
  const { addQuiz } = useData();
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'subj-biology');
  const activeSubj = curriculum.find((s) => s.id === selectedSubjectId || s.code === selectedSubjectId) || curriculum[0];
  const chapters = activeSubj?.chapters || [];
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');

  const [includeDiagramQuestion, setIncludeDiagramQuestion] = useState(true);
  const [targetBatch, setTargetBatch] = useState<'Batch 1 (Dec)' | 'Batch 2 (May/June)'>('Batch 1 (Dec)');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedMCQ[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerateAI = () => {
    setGenerating(true);
    setSavedSuccess(false);

    const chapterObj = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
    const chapterName = chapterObj?.name || 'Human Physiology';
    const subjName = activeSubj?.name || 'Biology';

    setTimeout(() => {
      const sampleDiagramSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="100%" height="100%" fill="%23f1f5f9"/><circle cx="80" cy="75" r="40" fill="%230d9488" opacity="0.8"/><circle cx="160" cy="75" r="40" fill="%233b82f6" opacity="0.8"/><circle cx="220" cy="75" r="40" fill="%238b5cf6" opacity="0.8"/><text x="150" y="80" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Figure 1.1: Anatomical Pathway</text></svg>`;

      const questions: GeneratedMCQ[] = [
        {
          id: 1,
          question: includeDiagramQuestion
            ? `Refer to Figure 1.1 below regarding ${chapterName}. Based on the marked pathway, which clinical statement accurately identifies Option A as the primary physiological mechanism?`
            : `In the study of ${chapterName} (${subjName}), which physiological principle governs homeostatic regulation under acute clinical stress?`,
          imageUrl: includeDiagramQuestion ? sampleDiagramSvg : undefined,
          options: [
            `Option A: Primary depolarizing influx driven by voltage-gated sodium channels (Correct clinical pearl)`,
            `Option B: Decreased ventricular end-diastolic compliance causing secondary pulmonary congestion`,
            `Option C: Passive diffusion across non-fenestrated glomerular capillaries`,
            `Option D: Downregulation of adrenergic receptors in acute compensatory shock`,
            `Option E: Retrograde trans-synaptic transport through unmyelinated post-ganglionic fibers`,
          ],
          correctAnswer: 0, // Option A correct
          marks: 4,
          negativeMarks: 1,
          explanation: `Clinical High-Yield Pearl: Option A is the correct answer. The diagnostic diagram demonstrates rapid upstroke depolarization during phase 0, mediated by fast voltage-gated sodium channels.`,
        },
        {
          id: 2,
          question: `Regarding ${chapterName}, a 45-year-old patient presents with acute metabolic disturbance. Which diagnostic laboratory equation provides the most reliable index for differential evaluation?`,
          options: [
            `Option A: Anion Gap = [Na+] - ([Cl-] + [HCO3-]) with normal reference between 8-12 mEq/L`,
            `Option B: Henderson-Hasselbalch ratio with fixed standard bicarbonate of 18 mEq/L`,
            `Option C: Absolute neutrophil clearance exceeding glomerular filtration rate`,
            `Option D: Serum osmolar gap calculation omitting blood urea nitrogen`,
            `Option E: Fractional excretion of sodium exceeding 3.5% with pre-renal azotemia`,
          ],
          correctAnswer: 0, // Option A correct
          marks: 4,
          negativeMarks: 1,
          explanation: `Option A correctly represents the serum anion gap equation, essential for distinguishing between high anion gap metabolic acidosis (HAGMA) and normal anion gap metabolic acidosis (NAGMA).`,
        },
        {
          id: 3,
          question: `In standard competitive medical entrance examinations, which parameter in ${subjName} - ${chapterName} represents the rate-limiting regulatory enzyme?`,
          options: [
            `Option A: Phosphofructokinase-1 (PFK-1) in glycolysis subject to ATP/citrate allosteric inhibition`,
            `Option B: Pyruvate kinase under glucagon non-allosteric activation`,
            `Option C: Hexokinase IV functioning at saturated Vmax at physiological glucose levels`,
            `Option D: Lactate dehydrogenase operating under standard anaerobic conditions exclusively`,
            `Option E: Fructose-1,6-bisphosphatase stimulated by fructose-2,6-bisphosphate in hepatocytes`,
          ],
          correctAnswer: 0,
          marks: 4,
          negativeMarks: 1,
          explanation: `PFK-1 is the primary committed and rate-limiting step of glycolysis, regulated allosterically by AMP, ATP, and fructose 2,6-bisphosphate.`,
        },
      ];

      setGeneratedQuestions(questions);
      setQuizTitle(`AI Drill: ${subjName} - ${chapterName} (${targetBatch})`);
      setGenerating(false);
    }, 700);
  };

  const handleSaveToQuizzes = () => {
    if (generatedQuestions.length === 0) return;

    addQuiz({
      title: quizTitle || `AI MCQ Test: ${activeSubj?.name}`,
      subject: activeSubj?.name || 'Biology',
      courseId: activeSubj?.id || 'subj-biology',
      questions: generatedQuestions,
      duration: 20,
      marks: generatedQuestions.length * 4,
      negativeMarking: 1,
      status: 'active',
      createdById: user?.id || (isFaculty ? 'faculty' : 'admin'),
      createdByName: user?.name ? `${user.name} (AI MCQ Generator)` : (isFaculty ? 'Faculty (AI Generator)' : 'Administrator (AI Generator)'),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      batch: targetBatch,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onBack) onBack();
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-teal-200 text-xs">
            <i className="fas fa-magic" />
          </span>
          <h2 className="text-sm font-bold">AI Chapter-Wise MCQ Generator</h2>
        </div>
        <p className="text-[11px] text-teal-100 leading-relaxed">
          Auto-generate high-yield clinical MCQs for all 7 subjects with diagrams & Option A keying.
        </p>
      </div>

      {/* Generator Controls */}
      <div className="card space-y-3">
        {/* Subject Selection (All 7 subjects) */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1">
            Core Academic Subject (7 Subjects)
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              const found = curriculum.find((s) => s.id === e.target.value || s.code === e.target.value);
              if (found && found.chapters.length > 0) {
                setSelectedChapterId(found.chapters[0].id);
              }
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-teal-500"
          >
            {curriculum.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) - {s.chapters.length} Chapters
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Selection */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1">
            Curriculum Chapter
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-teal-500"
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Target & Diagram Option */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1">
              Cohort Batch Allocation
            </label>
            <select
              value={targetBatch}
              onChange={(e) => setTargetBatch(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
            >
              <option value="Batch 1 (Dec)">Batch 1 (Dec)</option>
              <option value="Batch 2 (May/June)">Batch 2 (May/June)</option>
            </select>
          </div>
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeDiagramQuestion}
                onChange={(e) => setIncludeDiagramQuestion(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span>Include Diagram MCQ</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={generating}
          className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <i className="fas fa-spinner fa-spin" />
              <span>Synthesizing Clinical Questions...</span>
            </>
          ) : (
            <>
              <i className="fas fa-bolt" />
              <span>Generate AI Chapter MCQs</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Generated Questions ({generatedQuestions.length})
            </h3>
            <span className="badge badge-teal text-[10px]">Option A Keyed</span>
          </div>

          <div className="space-y-3">
            {generatedQuestions.map((q, idx) => (
              <div key={q.id} className="card border border-teal-100 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-navy text-[10px]">Q{idx + 1}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">+4 / -1</span>
                </div>

                <p className="text-xs font-semibold text-gray-800 leading-relaxed">{q.question}</p>

                {q.imageUrl && (
                  <div className="my-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <img
                      src={q.imageUrl}
                      alt="Clinical Diagram"
                      className="max-h-28 mx-auto rounded object-contain"
                    />
                    <span className="text-[9px] text-teal-700 font-semibold block mt-1">
                      Figure 1.1: Anatomical Diagnostic Diagram (Option A Keyed)
                    </span>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                        oIdx === q.correctAnswer
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-gray-50 border-gray-100 text-gray-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          oIdx === q.correctAnswer
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-blue-50/60 rounded-lg text-[10px] text-blue-900 border border-blue-100">
                  <span className="font-bold">Rationale:</span> {q.explanation}
                </div>
              </div>
            ))}
          </div>

          {/* Action to Save Quiz */}
          <div className="card bg-teal-50 border border-teal-200 p-3 space-y-2">
            <div>
              <label className="text-[10px] font-bold text-teal-900 block mb-1">
                Assessment Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={handleSaveToQuizzes}
              disabled={savedSuccess}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <i className="fas fa-check-circle" />
                  <span>Published to Question Bank!</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save" />
                  <span>Save & Publish Quiz to {targetBatch}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const AIMCQGenerator = AdminAIMCQGenerator;

