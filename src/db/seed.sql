-- ============================================================================
-- MEDICAL COMPETITIVE EXAM LMS - SEED DATA
-- ============================================================================

-- 1. Exams
INSERT INTO exams (name, code, description, is_active) VALUES
('NEET-UG', 'NEET_UG', 'National Eligibility cum Entrance Test for Undergraduate Medical in India', true),
('IMAT (Italy)', 'IMAT', 'International Medical Admissions Test for English-taught Medicine in Italy', true),
('UCAT (UK & ANZ)', 'UCAT', 'University Clinical Aptitude Test for Medicine & Dentistry', true),
('MCAT (USA & Canada)', 'MCAT', 'Medical College Admission Test for North American Medical Schools', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Departments
INSERT INTO departments (name, description) VALUES
('Pre-Clinical Sciences', 'Anatomy, Physiology, and Biochemistry foundations'),
('Paraclinical Sciences', 'Pathology, Pharmacology, and Microbiology'),
('Clinical Medicine', 'Internal Medicine, Surgery, Pediatrics, and Obstetrics')
ON CONFLICT DO NOTHING;

-- 3. Classes
INSERT INTO classes (name, academic_year) VALUES
('Class 11 Medical', '2026-2027'),
('Class 12 Medical', '2026-2027'),
('Repeater / Dropper Batch', '2026-2027')
ON CONFLICT DO NOTHING;

-- 4. Batches
DO $$
DECLARE
    v_class_id UUID;
    v_exam_id UUID;
BEGIN
    SELECT id INTO v_class_id FROM classes WHERE name = 'Class 12 Medical' LIMIT 1;
    SELECT id INTO v_exam_id FROM exams WHERE code = 'NEET_UG' LIMIT 1;

    IF v_class_id IS NOT NULL AND v_exam_id IS NOT NULL THEN
        INSERT INTO batches (name, class_id, exam_id, start_date, end_date, status)
        VALUES 
        ('Batch 1 (Dec)', v_class_id, v_exam_id, '2026-12-01', '2027-04-30', 'ACTIVE'),
        ('Batch 2 (May/June)', v_class_id, v_exam_id, '2026-05-01', '2027-09-30', 'ACTIVE'),
        ('Target NEET 2027 Super-30', v_class_id, v_exam_id, '2026-06-01', '2027-05-01', 'ACTIVE')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 5. Subjects & 3-Tier Curriculum (7 Core Subjects)
INSERT INTO subjects (name, code, description) VALUES
('Biology', 'BIO', 'Human Anatomy, Cell Biology, Genetics, and Physiological Systems'),
('Physics', 'PHY', 'Classical Mechanics, Electrodynamics, Thermodynamics, and Medical Optics'),
('Chemistry', 'CHEM', 'Physical Chemistry, Organic Mechanisms, and Inorganic Coordination'),
('Maths', 'MATH', 'Calculus, Algebra, Coordinate Geometry, and Biostatistics'),
('Logical Reasoning', 'LR', 'Analytical ability, syllogisms, pattern recognition, and data interpretation'),
('English', 'ENG', 'Medical comprehension, clinical communication, grammar, and scientific vocabulary'),
('GK', 'GK', 'Healthcare developments, Nobel laureates in Medicine, global health policies, and general awareness')
ON CONFLICT (code) DO NOTHING;

-- Biology Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'BIO';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Human Physiology', 'Organ systems, homeostasis, and neural-endocrine control', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Neural System & Brain Architecture', 'Neurons, synapses, and central nervous system', 1),
        (v_chap_id, 'Chemical Coordination & Endocrine Glands', 'Hormones, pituitary, thyroid, and metabolic regulation', 2),
        (v_chap_id, 'Circulatory System & Cardiac Cycle', 'Blood composition, ECG, and heart regulation', 3),
        (v_chap_id, 'Respiratory Mechanics & Gas Exchange', 'Pulmonary volumes, hemoglobin saturation, and ventilation', 4);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Cell Biology & Genetics', 'Cytology, inheritance patterns, and DNA biochemistry', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Membrane Transport & Cell Organelles', 'Fluid mosaic model, mitochondria, and Golgi apparatus', 1),
        (v_chap_id, 'Mitosis, Meiosis & Cell Cycle Checkpoints', 'Phases of division, karyotyping, and nondisjunction', 2),
        (v_chap_id, 'Mendelian Genetics & Gene Linkage', 'Monohybrid, dihybrid crosses, and pedigree analysis', 3),
        (v_chap_id, 'Molecular Basis of Inheritance', 'Replication, transcription, translation, and lac operon', 4);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Human Reproduction & Embryology', 'Gametogenesis, fertilization, and developmental stages', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Spermatogenesis & Oogenesis', 'Follicular phases, hormonal loops, and menstrual cycle', 1),
        (v_chap_id, 'Fertilization, Blastocyst & Implantation', 'Acrosome reaction, blastocyst formation, and placenta', 2);
    END IF;
END $$;

-- Physics Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'PHY';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Kinematics & Dynamics', 'Vectors, 1D/2D motion, force laws, and mechanical energy', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Vectors & 1D Motion', 'Displacement, velocity-time curves, and calculus derivation', 1),
        (v_chap_id, 'Projectile Motion & Trajectories', 'Range, maximum height, and parabolic mechanics', 2),
        (v_chap_id, 'Newton Laws of Motion & Friction', 'Free-body diagrams, tension, and inclined planes', 3),
        (v_chap_id, 'Work, Energy, Power & Collisions', 'Work-energy theorem, conservative fields, and momentum', 4);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Electrodynamics & Circuits', 'Electric fields, potentials, capacitors, and current circuits', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Electrostatics & Coulomb Law', 'Electric flux, Gauss law, and dipole moments', 1),
        (v_chap_id, 'Current Electricity & Kirchhoff Rules', 'Drift velocity, Wheatstone bridge, and internal resistance', 2),
        (v_chap_id, 'Magnetic Effects of Current & Matter', 'Biot-Savart law, Lorentz force, and cyclotron frequency', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Optics & Wave Physics', 'Ray optics, wave optics, diffraction, and lenses', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Ray Optics & Optical Instruments', 'Lens maker formula, total internal reflection, and microscope', 1),
        (v_chap_id, 'Wave Optics & Interference', 'Young double slit experiment, fringe width, and diffraction', 2);
    END IF;
END $$;

-- Chemistry Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'CHEM';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Physical Chemistry & Thermodynamics', 'Atomic structure, chemical kinetics, and equilibrium', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Mole Concept & Stoichiometry', 'Molarity, normality, and limiting reagent calculations', 1),
        (v_chap_id, 'Thermodynamics & Thermochemistry', 'Enthalpy, entropy, Gibbs free energy, and Hess law', 2),
        (v_chap_id, 'Chemical & Ionic Equilibrium', 'Le Chatelier principle, pH buffer equations, and Ksp', 3);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Organic Chemistry & Biomolecules', 'Reaction mechanisms, functional groups, and biomolecules', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Reaction Mechanisms (SN1, SN2, E1, E2)', 'Nucleophilic substitution and carbocation stability', 1),
        (v_chap_id, 'Carbonyl Compounds & Carboxylic Acids', 'Aldehydes, ketones, aldol condensation, and Cannizzaro', 2),
        (v_chap_id, 'Biomolecules: Amino Acids & Nucleic Acids', 'Peptide bonds, protein folding, DNA/RNA structures', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Inorganic Chemistry & Periodic Trends', 'Chemical bonding, coordination chemistry, and transition metals', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Chemical Bonding & Molecular Orbital Theory', 'Hybridization, VSEPR shapes, and bond orders', 1),
        (v_chap_id, 'Coordination Compounds & Crystal Field Theory', 'IUPAC naming, isomerism, and d-orbital splitting', 2);
    END IF;
END $$;

