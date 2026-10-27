import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type {
  AssessmentWithQuestions,
  QuestionWithOptions,
  CreateAssessmentInput,
  CreateQuestionInput,
  AssessmentFilter,
  AssessmentResultSummary,
  AssessmentAnswerRecord,
} from './types';

const LOCAL_STORAGE_ASSESSMENTS_KEY = 'lms_assessments_cache_v2';
const LOCAL_STORAGE_QUESTIONS_KEY = 'lms_questions_cache_v2';

// ============================================================================
// HIGH-YIELD MEDICAL QUESTION BANK SEED (Biology, Physics, Chemistry)
// ============================================================================

export const SEED_QUESTIONS: QuestionWithOptions[] = [
  {
    id: 'q-med-1',
    subject_id: 'subj-biology',
    chapter_id: 'chap-bio-1',
    topic_id: 'top-bio-103',
    question_text: 'During the cardiac cycle in a healthy adult human, which event corresponds directly to the closure of the atrioventricular (AV) tricuspid and bicuspid valves?',
    question_type: 'MCQ',
    marks: 4,
    negative_marks: 1,
    explanation: 'The first heart sound (LUB) is produced by the simultaneous closure of the tricuspid and bicuspid (mitral) AV valves at the beginning of ventricular systole to prevent backflow into the atria.',
    created_by: 'faculty-seed-1',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Human Physiology',
    options: [
      { id: 'opt-1-1', optionText: 'Onset of ventricular systole generating the first heart sound (S1 / Lub)', isCorrect: true, optionOrder: 1 },
      { id: 'opt-1-2', optionText: 'End of ventricular systole generating the second heart sound (S2 / Dub)', isCorrect: false, optionOrder: 2 },
      { id: 'opt-1-3', optionText: 'Rapid ventricular filling phase during joint diastole', isCorrect: false, optionOrder: 3 },
      { id: 'opt-1-4', optionText: 'Isovolumetric ventricular relaxation period', isCorrect: false, optionOrder: 4 },
    ],
  },
  {
    id: 'q-med-2',
    subject_id: 'subj-biology',
    chapter_id: 'chap-bio-2',
    topic_id: 'top-bio-204',
    question_text: 'In prokaryotic DNA replication, which specific enzyme catalyzes the synthesis of RNA primers essential for initiating leading and lagging strand synthesis?',
    question_type: 'MCQ',
    marks: 4,
    negative_marks: 1,
    explanation: 'DNA primase (encoded by the dnaG gene in E. coli) synthesizes short RNA primers (10-12 nucleotides) that provide the free 3\'-OH group necessary for DNA Polymerase III elongation.',
    created_by: 'faculty-seed-1',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Cell Biology & Genetics',
    options: [
      { id: 'opt-2-1', optionText: 'DNA Polymerase I (Kornberg enzyme)', isCorrect: false, optionOrder: 1 },
      { id: 'opt-2-2', optionText: 'DNA Primase (DnaG product)', isCorrect: true, optionOrder: 2 },
      { id: 'opt-2-3', optionText: 'DNA Topoisomerase II (Gyrase)', isCorrect: false, optionOrder: 3 },
      { id: 'opt-2-4', optionText: 'DNA Ligase I', isCorrect: false, optionOrder: 4 },
    ],
  },
  {
    id: 'q-med-3',
    subject_id: 'subj-physics',
    chapter_id: 'chap-phy-2',
    topic_id: 'top-phy-201',
    question_text: 'Two point charges +4q and +q are placed separated by a distance L in vacuum. At what distance from +4q along the connecting line is the net electric field intensity exactly zero?',
    question_type: 'MCQ',
    marks: 4,
    negative_marks: 1,
    explanation: 'Electric field E1 = k(4q)/x² and E2 = k(q)/(L - x)². Equating E1 = E2 gives 2/x = 1/(L - x) => 2L - 2x = x => 3x = 2L => x = (2/3)L from the +4q charge.',
    created_by: 'faculty-seed-1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    subjectName: 'Physics',
    chapterName: 'Electrodynamics & Magnetism',
    options: [
      { id: 'opt-3-1', optionText: '(1/3) L', isCorrect: false, optionOrder: 1 },
      { id: 'opt-3-2', optionText: '(2/3) L', isCorrect: true, optionOrder: 2 },
      { id: 'opt-3-3', optionText: '(1/2) L', isCorrect: false, optionOrder: 3 },
      { id: 'opt-3-4', optionText: '(3/4) L', isCorrect: false, optionOrder: 4 },
    ],
  },
  {
    id: 'q-med-4',
    subject_id: 'subj-chemistry',
    chapter_id: 'chap-chem-1',
    topic_id: 'top-chem-101',
    question_text: 'Which of the following alkyl halides undergoes nucleophilic substitution primarily via an SN1 pathway with complete racemization when reacted with weak nucleophiles in polar protic solvents?',
    question_type: 'MCQ',
    marks: 4,
    negative_marks: 1,
    explanation: 'Tertiary alkyl halides like 2-bromo-2-methylpropane form highly stabilized 3° carbocations via heterolytic cleavage, proceeding stereochemically through planar carbocation intermediates (SN1).',
    created_by: 'faculty-seed-2',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    subjectName: 'Chemistry',
    chapterName: 'Organic Reaction Mechanisms',
    options: [
      { id: 'opt-4-1', optionText: 'Methyl bromide (CH3Br)', isCorrect: false, optionOrder: 1 },
      { id: 'opt-4-2', optionText: 'Ethyl chloride (CH3CH2Cl)', isCorrect: false, optionOrder: 2 },
      { id: 'opt-4-3', optionText: '2-Bromo-2-methylpropane ((CH3)3CBr)', isCorrect: true, optionOrder: 3 },
      { id: 'opt-4-4', optionText: '1-Chlorobutane (CH3(CH2)3Cl)', isCorrect: false, optionOrder: 4 },
    ],
  },
  {
    id: 'q-med-5',
    subject_id: 'subj-biology',
    chapter_id: 'chap-bio-1',
    topic_id: 'top-bio-104',
    question_text: 'Assertion (A): The dissociation of oxyhemoglobin into oxygen and deoxyhemoglobin is enhanced in metabolically active tissues.\nReason (R): High pCO2, elevated H+ concentration (acidosis), and higher temperature shift the oxygen dissociation curve to the right (Bohr effect).',
    question_type: 'ASSERTION_REASON',
    marks: 4,
    negative_marks: 1,
    explanation: 'Both A and R are true, and R is the correct physiological explanation of the Bohr effect. In actively respiring tissues, metabolic byproducts shift the Hb-O2 curve rightward, promoting O2 unloading.',
    created_by: 'faculty-seed-1',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Human Physiology',
    options: [
      { id: 'opt-5-1', optionText: 'Both (A) and (R) are true and (R) is the correct explanation of (A)', isCorrect: true, optionOrder: 1 },
      { id: 'opt-5-2', optionText: 'Both (A) and (R) are true but (R) is NOT the correct explanation of (A)', isCorrect: false, optionOrder: 2 },
      { id: 'opt-5-3', optionText: '(A) is true but (R) is false', isCorrect: false, optionOrder: 3 },
      { id: 'opt-5-4', optionText: '(A) is false but (R) is true', isCorrect: false, optionOrder: 4 },
    ],
  },
];

// ============================================================================
// DEFAULT SEED ASSESSMENTS (DPP, PYQ, Mock Test, Test Series)
// ============================================================================

export const SEED_ASSESSMENTS: AssessmentWithQuestions[] = [
  {
    id: 'asmt-dpp-1',
    title: 'DPP-01: Cardiovascular Dynamics & Hematology Practice Drill',
    description: 'Daily practice problem set focused on cardiac cycles, ECG wave analysis, and pulmonary hemodynamics.',
    assessment_type: 'DPP',
    subject_id: 'subj-biology',
    chapter_id: 'chap-bio-1',
    duration_minutes: 20,
    total_marks: 12,
    negative_marks: 1,
    allow_retake: true,
    created_by: 'faculty-seed-1',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Human Physiology',
    creatorName: 'Dr. Sharma',
    questionCount: 3,
    questions: [SEED_QUESTIONS[0], SEED_QUESTIONS[1], SEED_QUESTIONS[4]],
  },
  {
    id: 'asmt-pyq-1',
    title: 'PYQ Drill: 10-Year Compiled NEET UG & IMAT Medical Questions',
    description: 'High-probability previous year competitive exam questions with detailed clinical solution explanations.',
    assessment_type: 'PYQ',
    subject_id: 'subj-physics',
    chapter_id: 'chap-phy-2',
    duration_minutes: 30,
    total_marks: 16,
    negative_marks: 1,
    allow_retake: true,
    created_by: 'faculty-seed-1',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    subjectName: 'Physics',
    chapterName: 'Electrodynamics & Magnetism',
    creatorName: 'Prof. Verma',
    questionCount: 4,
    questions: [SEED_QUESTIONS[2], SEED_QUESTIONS[3], SEED_QUESTIONS[0], SEED_QUESTIONS[1]],
  },
  {
    id: 'asmt-mock-1',
    title: 'Grand Mock Test I: Complete Pre-Medical Grand Rehearsal',
    description: 'Full-length simulated timed examination with strict medical marking scheme (+4 / -1) and live question palette.',
    assessment_type: 'MOCK_TEST',
    subject_id: 'subj-biology',
    chapter_id: null,
    duration_minutes: 45,
    total_marks: 20,
    negative_marks: 1,
    allow_retake: false,
    created_by: 'faculty-seed-2',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    subjectName: 'All Medical Subjects',
    chapterName: 'Comprehensive Syllabus',
    creatorName: 'Dr. Mukherjee',
    questionCount: 5,
    questions: SEED_QUESTIONS,
  },
  {
    id: 'asmt-series-1',
    title: 'All-India & European Medical Test Series: Milestone 01',
    description: 'Comprehensive evaluation covering Cell Biology, Reaction Kinetics, and Electrostatics for NEET & IMAT candidates.',
    assessment_type: 'TEST_SERIES',
    subject_id: 'subj-chemistry',
    chapter_id: 'chap-chem-1',
    duration_minutes: 40,
    total_marks: 16,
    negative_marks: 1,
    allow_retake: true,
    created_by: 'faculty-seed-2',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    subjectName: 'Chemistry',
    chapterName: 'Organic Reaction Mechanisms',
    creatorName: 'Dr. Mukherjee',
    questionCount: 4,
    questions: [SEED_QUESTIONS[3], SEED_QUESTIONS[2], SEED_QUESTIONS[1], SEED_QUESTIONS[4]],
  },
];

// Local offline persistence helpers
function loadLocalAssessments(): AssessmentWithQuestions[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSESSMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[assessmentService] Error reading local assessments:', err);
  }
  return SEED_ASSESSMENTS;
}

function saveLocalAssessments(items: AssessmentWithQuestions[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ASSESSMENTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[assessmentService] Error saving local assessments:', err);
  }
}

function loadLocalQuestions(): QuestionWithOptions[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUESTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[assessmentService] Error reading local questions:', err);
  }
  return SEED_QUESTIONS;
}

function saveLocalQuestions(items: QuestionWithOptions[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_QUESTIONS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[assessmentService] Error saving local questions:', err);
  }
}

// ============================================================================
// SERVICE API FUNCTIONS
// ============================================================================

/**
 * Fetches all assessments with joined questions, options, and subject names.
 */
export async function fetchAssessments(filter?: AssessmentFilter): Promise<AssessmentWithQuestions[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('assessments')
        .select(`
          id,
          title,
          description,
          assessment_type,
          subject_id,
          chapter_id,
          duration_minutes,
          total_marks,
          negative_marks,
          allow_retake,
          created_by,
          status,
          created_at,
          updated_at,
          subjects:subject_id (name),
          chapters:chapter_id (name),
          profiles:created_by (full_name),
          assessment_questions (
            question_order,
            questions (
              id,
              subject_id,
              chapter_id,
              topic_id,
              question_text,
              question_type,
              marks,
              negative_marks,
              explanation,
              created_by,
              created_at,
              updated_at,
              question_options (
                id,
                option_text,
                is_correct,
                option_order
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'ALL') {
        query = query.eq('status', filter.status);
      }
      if (filter?.subjectId) {
        query = query.eq('subject_id', filter.subjectId);
      }
      if (filter?.chapterId) {
        query = query.eq('chapter_id', filter.chapterId);
      }
      if (filter?.assessmentType && filter.assessmentType !== 'ALL') {
        query = query.eq('assessment_type', filter.assessmentType);
      }
      if (filter?.createdBy) {
        query = query.eq('created_by', filter.createdBy);
      }
      if (filter?.search) {
        query = query.ilike('title', `%${filter.search}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped: AssessmentWithQuestions[] = data.map((row: any) => {
          const rawAqs = row.assessment_questions || [];
          const sortedAqs = rawAqs.sort((a: any, b: any) => (a.question_order || 0) - (b.question_order || 0));
          const questions: QuestionWithOptions[] = sortedAqs
            .map((aq: any) => {
              const q = aq.questions;
              if (!q) return null;
              const rawOpts = q.question_options || [];
              const sortedOpts = rawOpts
                .sort((a: any, b: any) => (a.option_order || 0) - (b.option_order || 0))
                .map((opt: any) => ({
                  id: opt.id,
                  optionText: opt.option_text,
                  isCorrect: Boolean(opt.is_correct),
                  optionOrder: opt.option_order || 1,
                }));

              return {
                id: q.id,
                subject_id: q.subject_id,
                chapter_id: q.chapter_id,
                topic_id: q.topic_id,
                question_text: q.question_text,
                question_type: q.question_type,
                marks: Number(q.marks) || 4,
                negative_marks: Number(q.negative_marks) || 1,
                explanation: q.explanation,
                created_by: q.created_by,
                created_at: q.created_at,
                updated_at: q.updated_at,
                options: sortedOpts,
              };
            })
            .filter(Boolean);

          return {
            id: row.id,
            title: row.title,
            description: row.description,
            assessment_type: row.assessment_type,
            subject_id: row.subject_id,
            chapter_id: row.chapter_id,
            duration_minutes: row.duration_minutes || 60,
            total_marks: Number(row.total_marks) || questions.length * 4,
            negative_marks: Number(row.negative_marks) || 1,
            allow_retake: Boolean(row.allow_retake),
            created_by: row.created_by,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            subjectName: row.subjects?.name || 'General',
            chapterName: row.chapters?.name || undefined,
            creatorName: row.profiles?.full_name || 'Faculty',
            questionCount: questions.length,
            questions,
          };
        });

        return mapped;
      }
    } catch (err: any) {
      console.warn('[assessmentService] Cloud query failed, falling back to local cache:', err.message);
    }
  }

  // Local fallback
  let items = loadLocalAssessments();
  if (filter?.status && filter.status !== 'ALL') {
    items = items.filter((a) => a.status === filter.status);
  }
  if (filter?.subjectId) {
    items = items.filter((a) => a.subject_id === filter.subjectId);
  }
  if (filter?.chapterId) {
    items = items.filter((a) => a.chapter_id === filter.chapterId);
  }
  if (filter?.assessmentType && filter.assessmentType !== 'ALL') {
    items = items.filter((a) => a.assessment_type === filter.assessmentType);
  }
  if (filter?.createdBy) {
    items = items.filter((a) => a.created_by === filter.createdBy);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    items = items.filter((a) => a.title.toLowerCase().includes(s) || (a.description && a.description.toLowerCase().includes(s)));
  }

  return items;
}

/**
 * Fetches a single assessment with full questions and options.
 */
export async function getAssessmentById(assessmentId: string): Promise<AssessmentWithQuestions | null> {
  const all = await fetchAssessments();
  return all.find((a) => a.id === assessmentId) || null;
}

/**
 * Creates a new assessment in PostgreSQL and connects questions to it.
 */
export async function createAssessment(
  input: CreateAssessmentInput,
  createdByProfileId: string,
  creatorName = 'Faculty'
): Promise<AssessmentWithQuestions> {
  const assessmentId = uuidv4();
  const negativeMarks = input.negativeMarks !== undefined ? input.negativeMarks : 1;
  const duration = input.durationMinutes || 45;
  const status = input.status || 'PUBLISHED';

  // Build question instances
  const createdQuestions: QuestionWithOptions[] = [];
  const existingQuestions = loadLocalQuestions();

  if (input.questions && input.questions.length > 0) {
    for (let i = 0; i < input.questions.length; i++) {
      const qItem = input.questions[i];
      if (typeof qItem === 'string') {
        const found = existingQuestions.find((q) => q.id === qItem);
        if (found) createdQuestions.push(found);
      } else {
        const newQId = uuidv4();
        const optionsList = qItem.options.map((opt, oIdx) => ({
          id: uuidv4(),
          questionId: newQId,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          optionOrder: opt.optionOrder || oIdx + 1,
        }));

        const newQ: QuestionWithOptions = {
          id: newQId,
          subject_id: qItem.subjectId || input.subjectId,
          chapter_id: qItem.chapterId || input.chapterId || null,
          topic_id: qItem.topicId || null,
          question_text: qItem.questionText,
          question_type: qItem.questionType || 'MCQ',
          marks: qItem.marks || 4,
          negative_marks: qItem.negativeMarks || negativeMarks,
          explanation: qItem.explanation || null,
          created_by: createdByProfileId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          options: optionsList,
        };
        createdQuestions.push(newQ);
      }
    }
  }

  const calculatedTotalMarks = input.totalMarks || createdQuestions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0);

  // Attempt Supabase PostgreSQL Insert
  if (isSupabaseConfigured()) {
    try {
      // 1. Insert assessment record
      const { error: asmtError } = await supabase.from('assessments').insert({
        id: assessmentId,
        title: input.title,
        description: input.description || null,
        assessment_type: input.assessmentType,
        subject_id: input.subjectId,
        chapter_id: input.chapterId || null,
        duration_minutes: duration,
        total_marks: calculatedTotalMarks,
        negative_marks: negativeMarks,
        allow_retake: input.allowRetake ?? true,
        created_by: createdByProfileId,
        status,
      });

      if (asmtError) {
        console.warn('[assessmentService] Cloud assessment insert error:', asmtError.message);
      } else {
        // 2. Insert any new questions and options
        for (let idx = 0; idx < createdQuestions.length; idx++) {
          const q = createdQuestions[idx];
          await supabase.from('questions').upsert({
            id: q.id,
            subject_id: q.subject_id,
            chapter_id: q.chapter_id,
            topic_id: q.topic_id,
            question_text: q.question_text,
            question_type: q.question_type,
            marks: q.marks,
            negative_marks: q.negative_marks,
            explanation: q.explanation,
            created_by: createdByProfileId,
          });

          for (const opt of q.options) {
            await supabase.from('question_options').upsert({
              id: opt.id || uuidv4(),
              question_id: q.id,
              option_text: opt.optionText,
              is_correct: opt.isCorrect,
              option_order: opt.optionOrder,
            });
          }

          // Link assessment_questions
          await supabase.from('assessment_questions').upsert({
            assessment_id: assessmentId,
            question_id: q.id,
            question_order: idx + 1,
          });
        }
      }
    } catch (err: any) {
      console.warn('[assessmentService] Cloud sync error, persisting locally:', err.message);
    }
  }

  const createdAssessment: AssessmentWithQuestions = {
    id: assessmentId,
    title: input.title,
    description: input.description || null,
    assessment_type: input.assessmentType,
    subject_id: input.subjectId,
    chapter_id: input.chapterId || null,
    duration_minutes: duration,
    total_marks: calculatedTotalMarks,
    negative_marks: negativeMarks,
    allow_retake: input.allowRetake ?? true,
    created_by: createdByProfileId,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creatorName,
    questionCount: createdQuestions.length,
    questions: createdQuestions,
  };

  // Update local cache
  const local = loadLocalAssessments();
  saveLocalAssessments([createdAssessment, ...local]);

  // Also persist created questions to question bank
  const localQuestions = loadLocalQuestions();
  saveLocalQuestions([...createdQuestions, ...localQuestions.filter((q) => !createdQuestions.some((cq) => cq.id === q.id))]);

  return createdAssessment;
}

/**
 * Deletes an assessment.
 */
export async function deleteAssessment(assessmentId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('assessments').delete().eq('id', assessmentId);
    } catch (err) {
      console.warn('[assessmentService] Supabase delete warning:', err);
    }
  }

  const local = loadLocalAssessments();
  saveLocalAssessments(local.filter((a) => a.id !== assessmentId));
  return true;
}

/**
 * Evaluates student answers against the assessment questions.
 * Implements standard medical exam negative marking formula:
 * Total Score = (Correct × Marks) - (Incorrect × NegativeMarks)
 */
export function evaluateAnswers(
  assessment: AssessmentWithQuestions,
  answers: Record<string, AssessmentAnswerRecord>,
  timeSpentSeconds = 0
): AssessmentResultSummary {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;
  const questions = assessment.questions || [];

  const breakdown = questions.map((q) => {
    const record = answers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect) || q.options[0];
    const isAnswered = record && (record.selectedOptionIndex !== undefined || record.selectedOptionId !== undefined);

    let isCorrect = false;
    let selectedText: string | undefined;
    let marksAwarded = 0;

    if (!isAnswered) {
      unansweredCount++;
      marksAwarded = 0;
    } else {
      if (record.selectedOptionId) {
        isCorrect = record.selectedOptionId === correctOpt?.id;
        const chosen = q.options.find((o) => o.id === record.selectedOptionId);
        selectedText = chosen?.optionText;
      } else if (record.selectedOptionIndex !== undefined) {
        const chosen = q.options[record.selectedOptionIndex];
        isCorrect = Boolean(chosen?.isCorrect);
        selectedText = chosen?.optionText;
      }

      if (isCorrect) {
        correctCount++;
        marksAwarded = Number(q.marks) || 4;
        totalScore += marksAwarded;
      } else {
        incorrectCount++;
        const neg = Number(q.negative_marks !== undefined ? q.negative_marks : assessment.negative_marks || 1);
        marksAwarded = -neg;
        totalScore -= neg;
      }
    }

    return {
      questionId: q.id,
      questionText: q.question_text,
      selectedOptionText: selectedText,
      correctOptionText: correctOpt?.optionText || 'Option A',
      isCorrect,
      marksAwarded,
      explanation: q.explanation || undefined,
    };
  });

  const maxScore = Number(assessment.total_marks) || questions.length * 4;
  const accuracyPercentage = questions.length > 0 ? Math.max(0, Math.min(100, (correctCount / questions.length) * 100)) : 0;

  return {
    assessmentId: assessment.id,
    totalQuestions: questions.length,
    answeredCount: correctCount + incorrectCount,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalScore,
    maxScore,
    accuracyPercentage: Math.round(accuracyPercentage * 10) / 10,
    timeSpentSeconds,
    breakdown,
  };
}
