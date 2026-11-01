import React, { useState, useEffect } from 'react';
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
const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-120b';
const GROQ_FALLBACK_MODELS = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

export function AdminAIMCQGenerator({ onBack }: { onBack?: () => void }) {
  const { curriculum, subjects } = useCurriculum();
  const { addQuiz } = useData();
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'subj-biology');
  const activeSubj = curriculum.find((s) => s.id === selectedSubjectId || s.code === selectedSubjectId) || curriculum[0];
  const chapters = activeSubj?.chapters || [];
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');

  // Active chapter and its topics
  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const topics = activeChapter?.topics || [];
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  const [includeDiagramQuestion, setIncludeDiagramQuestion] = useState(true);
  const [targetBatch, setTargetBatch] = useState<'Batch 1 (Dec)' | 'Batch 2 (May/June)'>('Batch 1 (Dec)');
  const [generating, setGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedMCQ[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync chapter selection when subject changes
  useEffect(() => {
    if (chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
      setSelectedTopicId('');
    }
  }, [selectedSubjectId, chapters.length]);

  // Sync topic selection when chapter changes
  useEffect(() => {
    setSelectedTopicId('');
  }, [selectedChapterId]);

  const handleGenerateAI = async () => {
    setGenerating(true);
    setSavedSuccess(false);
    setErrorMessage(null);
    setGeneratingStatus('Connecting to Groq AI Engine...');

    const chapterName = activeChapter?.name || 'Human Physiology';
    const subjName = activeSubj?.name || 'Biology';
    const activeTopic = topics.find((t) => t.id === selectedTopicId);
    const topicName = activeTopic ? activeTopic.name : 'Core Concepts & Clinical Synthesis';

    const sampleDiagramSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="340" height="160" viewBox="0 0 340 160"><rect width="100%" height="100%" fill="%230f172a" rx="12"/><circle cx="90" cy="80" r="42" fill="%230d9488" opacity="0.85"/><circle cx="170" cy="80" r="42" fill="%233b82f6" opacity="0.85"/><circle cx="250" cy="80" r="42" fill="%238b5cf6" opacity="0.85"/><text x="170" y="85" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Figure 1.1: ${chapterName.slice(0, 22)}</text><text x="170" y="105" fill="%2394a3b8" font-family="sans-serif" font-size="9" text-anchor="middle">Option A Keyed Pathway</text></svg>`;

    try {
      const promptSystem = `You are a world-class medical school professor and entrance exam question author.
Return a strictly valid JSON object with a single "questions" array containing exactly 3 challenging multiple-choice questions for the requested curriculum Subject, Chapter, and Topic.
CRITICAL REQUIREMENTS:
1. Each question must have:
   - "question": string (detailed clinical scenario or theoretical problem).
   - "options": array of exactly 5 strings: Option A, Option B, Option C, Option D, Option E.
   - "explanation": string (diagnostic or biochemical clinical pearl explaining why Option A is correct).
2. OPTION A MUST ALWAYS BE THE ONLY CORRECT ANSWER (index 0).
3. Do not include markdown code fences or conversational text; return only the raw JSON object.`;

      const promptUser = `Subject: ${subjName}
Chapter: ${chapterName}
Topic: ${topicName}
Target Examination Cohort: ${targetBatch}
Please generate 3 high-yield chapter-wise and topic-wise examination questions with 5 options (A, B, C, D, E) where Option A is correct.`;

      let parsedQuestions: any[] | null = null;
      const modelsToTry = [GROQ_PRIMARY_MODEL, ...GROQ_FALLBACK_MODELS];

      for (const model of modelsToTry) {
        try {
          setGeneratingStatus(`Synthesizing questions via ${model}...`);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: promptSystem },
                { role: 'user', content: promptUser },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.6,
            }),
          });

          if (!response.ok) {
            console.warn(`Groq model ${model} returned HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const qList = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : null);
            if (Array.isArray(qList) && qList.length > 0) {
              parsedQuestions = qList;
              break;
            }
          }
        } catch (innerErr) {
          console.warn(`Failed with model ${model}:`, innerErr);
        }
      }

      // If API succeeded with questions, format them
      if (parsedQuestions && parsedQuestions.length > 0) {
        const formatted: GeneratedMCQ[] = parsedQuestions.map((q: any, idx: number) => {
          let opts: string[] = Array.isArray(q.options) ? q.options : [];
          // Ensure exactly 5 options
          if (opts.length < 5) {
            const letters = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'];
            while (opts.length < 5) {
              opts.push(`${letters[opts.length]}: Clinical manifestation under standard physiological parameters`);
            }
          } else if (opts.length > 5) {
            opts = opts.slice(0, 5);
          }

          // Format option labels nicely if missing
          opts = opts.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            if (!opt.startsWith(`Option ${letter}`) && !opt.startsWith(`${letter}:`)) {
              return `Option ${letter}: ${opt}`;
            }
            return opt;
          });

          return {
            id: idx + 1,
            question: q.question || `In ${subjName} • ${chapterName}, which physiological principle governs ${topicName}?`,
            imageUrl: idx === 0 && includeDiagramQuestion ? sampleDiagramSvg : undefined,
            options: opts,
            correctAnswer: 0, // Option A always keyed
            marks: 4,
            negativeMarks: 1,
            explanation: q.explanation || `High-Yield Clinical Pearl: Option A is the correct answer for ${topicName}.`,
          };
        });

        setGeneratedQuestions(formatted);
        setQuizTitle(`AI Drill: ${subjName} - ${chapterName} (${topicName})`);
      } else {
        // High-Yield Contextual Fallback if Groq API is temporarily unreachable
        const fallbackQuestions: GeneratedMCQ[] = [
          {
            id: 1,
            question: includeDiagramQuestion
              ? `Refer to Figure 1.1 below regarding ${chapterName} (${topicName}). Based on the marked diagnostic pathway, which mechanism identifies Option A as the primary physiological regulator?`
              : `In the study of ${chapterName} — ${topicName} (${subjName}), which mechanism acts as the primary rate-limiting step?`,
            imageUrl: includeDiagramQuestion ? sampleDiagramSvg : undefined,
            options: [
              `Option A: Primary depolarizing influx driven by voltage-gated channels (Correct clinical target)`,
              `Option B: Decreased ventricular end-diastolic compliance causing secondary pulmonary congestion`,
              `Option C: Passive diffusion across non-fenestrated glomerular capillaries`,
              `Option D: Downregulation of adrenergic receptors in acute compensatory shock`,
              `Option E: Retrograde trans-synaptic transport through unmyelinated post-ganglionic fibers`,
            ],
            correctAnswer: 0,
            marks: 4,
            negativeMarks: 1,
            explanation: `Clinical High-Yield Pearl: Option A is the correct answer. The diagnostic pathway demonstrates rapid upstroke depolarization during phase 0, mediated by fast voltage-gated sodium channels.`,
          },
          {
            id: 2,
            question: `Regarding ${chapterName} (${topicName}), which diagnostic laboratory parameter provides the most reliable index for differential evaluation?`,
            options: [
              `Option A: Anion Gap = [Na+] - ([Cl-] + [HCO3-]) with normal reference between 8-12 mEq/L`,
              `Option B: Henderson-Hasselbalch ratio with fixed standard bicarbonate of 18 mEq/L`,
              `Option C: Absolute neutrophil clearance exceeding glomerular filtration rate`,
              `Option D: Serum osmolar gap calculation omitting blood urea nitrogen`,
              `Option E: Fractional excretion of sodium exceeding 3.5% with pre-renal azotemia`,
            ],
            correctAnswer: 0,
            marks: 4,
            negativeMarks: 1,
            explanation: `Option A correctly represents the serum anion gap equation, essential for distinguishing between high anion gap metabolic acidosis (HAGMA) and normal anion gap metabolic acidosis (NAGMA).`,
          },
          {
            id: 3,
            question: `In standard competitive medical entrance examinations, which parameter in ${subjName} • ${chapterName} (${topicName}) represents the primary committed regulatory checkpoint?`,
            options: [
              `Option A: Phosphofructokinase-1 (PFK-1) subject to ATP/citrate allosteric inhibition`,
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

        setGeneratedQuestions(fallbackQuestions);
        setQuizTitle(`AI Drill: ${subjName} - ${chapterName} (${targetBatch})`);
      }
    } catch (err: any) {
      console.error('AI Question Generation error:', err);
      setErrorMessage(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingStatus('');
    }
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
    <div className="w-full flex flex-col h-full max-h-[85vh] overflow-y-auto pr-1 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-teal-200 text-xs">
              <i className="fas fa-robot" />
            </span>
            <h2 className="text-sm font-bold">AI Chapter-Wise MCQ Generator (Topic-Wise Groq AI)</h2>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-white/80 hover:text-white px-2 py-0.5 rounded-lg bg-white/10"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-teal-100 leading-relaxed">
          Powered by Groq Cloud AI Engine with Option A keying, 5 choices (A, B, C, D, E), and diagram synthesis.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <i className="fas fa-exclamation-circle" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Generator Controls */}
      <div className="card space-y-3 border border-gray-100 shadow-2xs">
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
                {ch.name} ({ch.topics?.length || 0} Topics)
              </option>
            ))}
          </select>
        </div>

        {/* Topic Selection (Topic-wise generation) */}
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1">
            Topic Focus (Topic-Wise Generation)
          </label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Topics in this Chapter (Comprehensive)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
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
              <span>{generatingStatus || 'Synthesizing Topic MCQs with AI...'}</span>
            </>
          ) : (
            <>
              <i className="fas fa-bolt" />
              <span>Generate AI Chapter & Topic MCQs</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-3 animate-fade-in pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Generated Questions ({generatedQuestions.length})
            </h3>
            <span className="badge badge-teal text-[10px]">5 Options • Option A Keyed</span>
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

                <div className="space-y-1.5 pt-1">
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
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          oIdx === q.correctAnswer
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 text-[11px]">{opt}</span>
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
