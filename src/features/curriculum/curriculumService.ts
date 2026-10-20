import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type {
  Exam,
  Subject,
  Chapter,
  Topic,
  SubjectWithChapters,
  ChapterWithTopics,
  CreateChapterPayload,
  CreateTopicPayload,
  CreateSubjectPayload,
  CreateExamPayload,
} from './types';

// ============================================================================
// DEFAULT MEDICAL CURRICULUM FALLBACKS (Offline / Initial Seed)
// ============================================================================

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam-neet-ug',
    name: 'NEET-UG',
    code: 'NEET_UG',
    description: 'National Eligibility cum Entrance Test for Undergraduate Medical in India',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exam-imat-italy',
    name: 'IMAT (Italy)',
    code: 'IMAT',
    description: 'International Medical Admissions Test for English-taught Medicine in Italy',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exam-ucat',
    name: 'UCAT (UK & ANZ)',
    code: 'UCAT',
    description: 'University Clinical Aptitude Test for Medicine & Dentistry',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exam-mcat',
    name: 'MCAT (USA & Canada)',
    code: 'MCAT',
    description: 'Medical College Admission Test for North American Medical Schools',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_CURRICULUM: SubjectWithChapters[] = [
  {
    id: 'subj-biology',
    name: 'Biology',
    code: 'BIO',
    description: 'Human Anatomy, Cell Biology, Genetics, and Physiological Systems',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-bio-1',
        subject_id: 'subj-biology',
        name: 'Human Physiology',
        description: 'Organ systems, homeostasis, and neural-endocrine control',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-101', chapter_id: 'chap-bio-1', name: 'Neural System & Brain Architecture', description: 'Neurons, synapses, and central nervous system', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-102', chapter_id: 'chap-bio-1', name: 'Chemical Coordination & Endocrine Glands', description: 'Hormones, pituitary, thyroid, and metabolic regulation', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-103', chapter_id: 'chap-bio-1', name: 'Circulatory System & Cardiac Cycle', description: 'Blood composition, ECG, and heart regulation', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-104', chapter_id: 'chap-bio-1', name: 'Respiratory Mechanics & Gas Exchange', description: 'Pulmonary volumes, hemoglobin saturation, and ventilation', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-2',
        subject_id: 'subj-biology',
        name: 'Cell Biology & Genetics',
        description: 'Cytology, inheritance patterns, and DNA biochemistry',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-201', chapter_id: 'chap-bio-2', name: 'Membrane Transport & Cell Organelles', description: 'Fluid mosaic model, mitochondria, and Golgi apparatus', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-202', chapter_id: 'chap-bio-2', name: 'Mitosis, Meiosis & Cell Cycle Checkpoints', description: 'Phases of division, karyotyping, and nondisjunction', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-203', chapter_id: 'chap-bio-2', name: 'Mendelian Genetics & Gene Linkage', description: 'Monohybrid, dihybrid crosses, and pedigree analysis', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-204', chapter_id: 'chap-bio-2', name: 'Molecular Basis of Inheritance', description: 'Replication, transcription, translation, and lac operon', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-3',
        subject_id: 'subj-biology',
        name: 'Human Reproduction & Embryology',
        description: 'Gametogenesis, fertilization, and developmental stages',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-301', chapter_id: 'chap-bio-3', name: 'Spermatogenesis & Oogenesis', description: 'Follicular phases, hormonal loops, and menstrual cycle', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-302', chapter_id: 'chap-bio-3', name: 'Fertilization, Blastocyst & Implantation', description: 'Acrosome reaction, blastocyst formation, and placenta', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-physics',
    name: 'Physics',
    code: 'PHY',
    description: 'Classical Mechanics, Electrodynamics, Thermodynamics, and Medical Optics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-phy-1',
        subject_id: 'subj-physics',
        name: 'Kinematics & Dynamics',
        description: 'Vectors, 1D/2D motion, force laws, and mechanical energy',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-101', chapter_id: 'chap-phy-1', name: 'Vectors & 1D Motion', description: 'Displacement, velocity-time curves, and calculus derivation', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-102', chapter_id: 'chap-phy-1', name: 'Projectile Motion & Trajectories', description: 'Range, maximum height, and parabolic mechanics', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-103', chapter_id: 'chap-phy-1', name: 'Newton Laws of Motion & Friction', description: 'Free-body diagrams, tension, and inclined planes', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-104', chapter_id: 'chap-phy-1', name: 'Work, Energy, Power & Collisions', description: 'Work-energy theorem, conservative fields, and momentum', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-phy-2',
        subject_id: 'subj-physics',
        name: 'Electrodynamics & Circuits',
        description: 'Electric fields, potentials, capacitors, and current circuits',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-201', chapter_id: 'chap-phy-2', name: 'Electrostatics & Coulomb Law', description: 'Electric flux, Gauss law, and dipole moments', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-202', chapter_id: 'chap-phy-2', name: 'Current Electricity & Kirchhoff Rules', description: 'Drift velocity, Wheatstone bridge, and internal resistance', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-203', chapter_id: 'chap-phy-2', name: 'Magnetic Effects of Current & Matter', description: 'Biot-Savart law, Lorentz force, and cyclotron frequency', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-phy-3',
        subject_id: 'subj-physics',
        name: 'Optics & Wave Physics',
        description: 'Ray optics, wave optics, diffraction, and lenses',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-301', chapter_id: 'chap-phy-3', name: 'Ray Optics & Optical Instruments', description: 'Lens maker formula, total internal reflection, and microscope', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-302', chapter_id: 'chap-phy-3', name: 'Wave Optics & Interference', description: 'Young double slit experiment, fringe width, and diffraction', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-chemistry',
    name: 'Chemistry',
    code: 'CHEM',
    description: 'Physical Chemistry, Organic Mechanisms, and Inorganic Coordination',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-chem-1',
        subject_id: 'subj-chemistry',
        name: 'Physical Chemistry & Thermodynamics',
        description: 'Atomic structure, chemical kinetics, and equilibrium',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-101', chapter_id: 'chap-chem-1', name: 'Mole Concept & Stoichiometry', description: 'Molarity, normality, and limiting reagent calculations', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-102', chapter_id: 'chap-chem-1', name: 'Thermodynamics & Thermochemistry', description: 'Enthalpy, entropy, Gibbs free energy, and Hess law', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-103', chapter_id: 'chap-chem-1', name: 'Chemical & Ionic Equilibrium', description: 'Le Chatelier principle, pH buffer equations, and Ksp', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-chem-2',
        subject_id: 'subj-chemistry',
        name: 'Organic Chemistry & Biomolecules',
        description: 'Reaction mechanisms, functional groups, and biomolecules',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-201', chapter_id: 'chap-chem-2', name: 'Reaction Mechanisms (SN1, SN2, E1, E2)', description: 'Nucleophilic substitution and carbocation stability', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-202', chapter_id: 'chap-chem-2', name: 'Carbonyl Compounds & Carboxylic Acids', description: 'Aldehydes, ketones, aldol condensation, and Cannizzaro', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-203', chapter_id: 'chap-chem-2', name: 'Biomolecules: Amino Acids & Nucleic Acids', description: 'Peptide bonds, protein folding, DNA/RNA structures', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-chem-3',
        subject_id: 'subj-chemistry',
        name: 'Inorganic Chemistry & Periodic Trends',
        description: 'Chemical bonding, coordination chemistry, and transition metals',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-301', chapter_id: 'chap-chem-3', name: 'Chemical Bonding & Molecular Orbital Theory', description: 'Hybridization, VSEPR shapes, and bond orders', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-302', chapter_id: 'chap-chem-3', name: 'Coordination Compounds & Crystal Field Theory', description: 'IUPAC naming, isomerism, and d-orbital splitting', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
];

// ============================================================================
// SERVICE FUNCTIONS (PostgreSQL + Supabase Queries)
// ============================================================================

/**
 * Fetch all active medical competitive exams.
 */
export async function getExams(): Promise<Exam[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_EXAMS;
  }

  try {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return DEFAULT_EXAMS;
    }

    return data;
  } catch (err) {
    console.warn('[curriculumService] Error fetching exams:', err);
    return DEFAULT_EXAMS;
  }
}

/**
 * Fetch all subjects.
 */
export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CURRICULUM.map(({ chapters, ...s }) => s);
  }

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return DEFAULT_CURRICULUM.map(({ chapters, ...s }) => s);
    }

    return data;
  } catch (err) {
    console.warn('[curriculumService] Error fetching subjects:', err);
    return DEFAULT_CURRICULUM.map(({ chapters, ...s }) => s);
  }
}

/**
 * Fetch the complete 3-tier academic hierarchy:
 * Subject -> Chapters -> Topics
 */
export async function getFullCurriculum(): Promise<SubjectWithChapters[]> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_CURRICULUM;
  }

  try {
    const { data: subjects, error: subjError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjError || !subjects || subjects.length === 0) {
      return DEFAULT_CURRICULUM;
    }

    const { data: chapters, error: chapError } = await supabase
      .from('chapters')
      .select('*')
      .order('display_order', { ascending: true });

    const { data: topics, error: topError } = await supabase
      .from('topics')
      .select('*')
      .order('display_order', { ascending: true });

    const allChapters = chapters || [];
    const allTopics = topics || [];

    // Assemble nested hierarchy
    const nested: SubjectWithChapters[] = subjects.map((subj) => {
      const subjChapters = allChapters.filter((c) => c.subject_id === subj.id);
      const chaptersWithTopics: ChapterWithTopics[] = subjChapters.map((ch) => ({
        ...ch,
        topics: allTopics.filter((t) => t.chapter_id === ch.id),
      }));

      return {
        ...subj,
        chapters: chaptersWithTopics,
      };
    });

    // If database subjects exist but no chapters are populated, merge with default chapters
    if (nested.every((s) => s.chapters.length === 0)) {
      return DEFAULT_CURRICULUM;
    }

    return nested;
  } catch (err) {
    console.error('[curriculumService] Error fetching full curriculum hierarchy:', err);
    return DEFAULT_CURRICULUM;
  }
}

/**
 * Fetch chapters for a given subject.
 */
export async function getChapters(subjectId: string): Promise<ChapterWithTopics[]> {
  const full = await getFullCurriculum();
  const found = full.find((s) => s.id === subjectId || s.code.toLowerCase() === subjectId.toLowerCase());
  return found ? found.chapters : [];
}

/**
 * Add a new chapter to a subject.
 */
export async function createChapter(payload: CreateChapterPayload): Promise<Chapter | null> {
  if (!isSupabaseConfigured()) {
    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      subject_id: payload.subjectId,
      name: payload.name.trim(),
      description: payload.description || null,
      display_order: payload.displayOrder || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newChapter;
  }

  try {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        subject_id: payload.subjectId,
        name: payload.name.trim(),
        description: payload.description || null,
        display_order: payload.displayOrder || 1,
      })
      .select()
      .single();

    if (error) {
      console.error('[curriculumService] createChapter error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[curriculumService] createChapter exception:', err);
    return null;
  }
}

/**
 * Add a new topic to a chapter.
 */
export async function createTopic(payload: CreateTopicPayload): Promise<Topic | null> {
  if (!isSupabaseConfigured()) {
    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      chapter_id: payload.chapterId,
      name: payload.name.trim(),
      description: payload.description || null,
      display_order: payload.displayOrder || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newTopic;
  }

  try {
    const { data, error } = await supabase
      .from('topics')
      .insert({
        chapter_id: payload.chapterId,
        name: payload.name.trim(),
        description: payload.description || null,
        display_order: payload.displayOrder || 1,
      })
      .select()
      .single();

    if (error) {
      console.error('[curriculumService] createTopic error:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[curriculumService] createTopic exception:', err);
    return null;
  }
}

/**
 * Delete a chapter.
 */
export async function deleteChapter(chapterId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Delete a topic.
 */
export async function deleteTopic(topicId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    const { error } = await supabase.from('topics').delete().eq('id', topicId);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * Seeds default exams, subjects, chapters, and topics into Supabase
 * if the remote tables are empty.
 */
export async function seedCurriculumIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { seeded: false, message: 'Offline mode active.' };
  }

  try {
    const { count, error } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
    if (error) {
      return { seeded: false, message: `Could not check subjects: ${error.message}` };
    }

    if (count && count > 0) {
      return { seeded: false, message: `Subjects already present (${count} found).` };
    }

    // 1. Seed Exams
    for (const exam of DEFAULT_EXAMS) {
      await supabase.from('exams').upsert({
        name: exam.name,
        code: exam.code,
        description: exam.description,
        is_active: exam.is_active,
      }, { onConflict: 'code' });
    }

    // 2. Seed Subjects, Chapters, and Topics
    for (const subj of DEFAULT_CURRICULUM) {
      const { data: insertedSubj } = await supabase
        .from('subjects')
        .upsert({
          name: subj.name,
          code: subj.code,
          description: subj.description,
        }, { onConflict: 'code' })
        .select()
        .single();

      if (insertedSubj) {
        for (const chap of subj.chapters) {
          const { data: insertedChap } = await supabase
            .from('chapters')
            .insert({
              subject_id: insertedSubj.id,
              name: chap.name,
              description: chap.description,
              display_order: chap.display_order,
            })
            .select()
            .single();

          if (insertedChap) {
            for (const top of chap.topics) {
              await supabase.from('topics').insert({
                chapter_id: insertedChap.id,
                name: top.name,
                description: top.description,
                display_order: top.display_order,
              });
            }
          }
        }
      }
    }

    return { seeded: true, message: 'Successfully seeded default medical curriculum into PostgreSQL!' };
  } catch (err: any) {
    return { seeded: false, message: err.message || 'Error seeding curriculum.' };
  }
}
