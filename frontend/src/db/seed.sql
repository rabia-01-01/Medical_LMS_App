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
        VALUES (v_subj_id, 'The Chemistry of Living Things, Cell Biology & Bioenergetics', 'Weak interactions, biomolecules, cellular organization, transport, and energy transformations', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Chemistry of Living Things & Weak Interactions', 'Weak interactions, organic biomolecules, and catalytic role of enzymes', 1),
        (v_chap_id, 'Cell Theory, Cell Dimensions & Comparative Cytology', 'Prokaryotic and eukaryotic cells, animal vs. plant cell architectures, and viral structure', 2),
        (v_chap_id, 'Cell Membrane & Cellular Organelles', 'Fluid mosaic membrane structure, transport mechanisms, and organellar compartmentalization', 3),
        (v_chap_id, 'Bioenergetics: ATP, Photosynthesis & Cellular Respiration', 'ATP energy currency, redox reactions, glycolysis, aerobic respiration, Krebs cycle, and fermentation', 4);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Cellular Reproduction, Life Cycles & Mendelian Genetics', 'Mitosis, meiosis, sexual/asexual life cycles, and classical inheritance principles', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Cellular Reproduction: Mitosis, Meiosis & Karyotypes', 'Phases of cell division, spindle apparatus, crossing over, karyotypes, and nondisjunction', 1),
        (v_chap_id, 'Reproduction and Inheritance: Life Cycles', 'Sexual and asexual reproduction, gametogenesis, and alternating life cycles', 2),
        (v_chap_id, 'Mendelian & Classical Genetics', 'Mendel laws, monohybrid and dihybrid crosses, chromosomal theory of inheritance, and linkage', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Molecular Genetics, Gene Regulation & Evolution', 'DNA replication, transcription, translation, gene expression regulation, and evolutionary mechanisms', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Molecular Genetics: DNA Duplication, Genetic Code & Protein Synthesis', 'DNA double helix, semiconservative replication, transcription, codons, and ribosomal translation', 1),
        (v_chap_id, 'Chromosome Architecture & Regulation of Gene Expression', 'Prokaryotic vs. eukaryotic chromosomes, operons, chromatin remodeling, and transcriptional regulation', 2),
        (v_chap_id, 'Mutations, Evolutionary Theories & Natural Selection', 'Point and chromosomal mutations, Darwinian natural and artificial selection, and genetic basis of evolution', 3);

        -- Chapter 4
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Human Genetics & Biotechnology', 'Hereditary disease transmission and recombinant DNA technological applications', 4)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Human Genetics: Autosomal & X-Linked Hereditary Diseases', 'Pedigree analysis, mono- and multifactorial traits, autosomal and X-linked hereditary diseases', 1),
        (v_chap_id, 'Biotechnology & Recombinant DNA Technology', 'Restriction enzymes, cloning vectors, PCR, gel electrophoresis, and medical biotechnology applications', 2);

        -- Chapter 5
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Anatomy and Physiology of Animals and Humans', 'Animal histology, organ system physiology, neural-endocrine control, and homeostasis', 5)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Animal and Human Tissues', 'Epithelial, connective, muscular, and nervous tissue histology and specialized functions', 1),
        (v_chap_id, 'Human Organ Systems, Physiological Interactions & Homeostasis', 'Circulatory, respiratory, digestive, nervous, endocrine, and excretory systems and feedback homeostasis', 2);
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
        VALUES (v_subj_id, 'Constitution of Matter, Atomic Structure & Periodic System', 'Aggregation states, gas laws, atomic orbitals, electron configurations, and periodic trends', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'States of Aggregation, Systems & Ideal Gas Laws', 'Solid, liquid, gas phases, homogeneous/heterogeneous systems, elements, compounds, and ideal gas laws', 1),
        (v_chap_id, 'Atomic Structure, Isotopes & Electronic Configurations', 'Subatomic particles, atomic and mass numbers, isotopes, orbitals, quantum numbers, and electron configurations', 2),
        (v_chap_id, 'The Periodic System of Elements & Periodic Properties', 'Groups, periods, transition elements, atomic radius, ionization potential, electron affinity, and metallic character', 3);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Chemical Bonding, Inorganic Nomenclature & Stoichiometry', 'Chemical bonds, intermolecular forces, inorganic naming rules, and stoichiometric calculations', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Chemical Bonds, Electronegativity & Intermolecular Forces', 'Ionic, covalent, metallic bonds, bond energy, polarity, electronegativity, dipole moments, and intermolecular forces', 1),
        (v_chap_id, 'Fundamentals of Inorganic Nomenclature', 'Nomenclature and properties of oxides, basic/acid anhydrides, hydroxides, binary/ternary acids, and salts', 2),
        (v_chap_id, 'Stoichiometry, Mole Concept & Reaction Balancing', 'Atomic/molecular mass, Avogadro constant, mole calculations, limiting reagents, and balancing chemical reactions', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Solutions, Equilibria, Kinetics, Redox & Acids-Bases', 'Solubility, aqueous equilibria, reaction rates, redox balance, pH, and buffer solutions', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Solutions, Solubility & Concentration Units', 'Water as solvent, solubility curves, mass percentage, molarity, molality, and dilution calculations', 1),
        (v_chap_id, 'Chemical Kinetics & Catalysis', 'Reaction rates, rate laws, activation energy, collision theory, and homogeneous/heterogeneous catalysis', 2),
        (v_chap_id, 'Chemical & Aqueous Equilibria, Acids, Bases & Buffers', 'Dynamic equilibrium, Le Chatelier principle, acid-base theories, pH, salt hydrolysis, and buffer solutions', 3),
        (v_chap_id, 'Oxidation and Reduction & Redox Balancing', 'Oxidation numbers, oxidizing and reducing agents, half-reaction method, and balancing redox reactions', 4);

        -- Chapter 4
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Fundamentals of Organic Chemistry & Functional Groups', 'Carbon bonding, isomerism, hydrocarbons, and characteristic organic functional groups', 4)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Carbon Hybridization, Molecular Formulas & Isomerism', 'Bonds between carbon atoms, structural and spatial formulas, and structural and geometric isomerism', 1),
        (v_chap_id, 'Hydrocarbons: Aliphatic, Alicyclic & Aromatic', 'Alkanes, alkenes, alkynes, cycloalkanes, benzene structure, aromaticity, and electrophilic substitution', 2),
        (v_chap_id, 'Functional Groups & Organic Nomenclature', 'Alcohols, ethers, amines, aldehydes, ketones, carboxylic acids, esters, amides, and IUPAC nomenclature', 3);
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
        VALUES (v_subj_id, 'Physical Quantities, Vectors & Kinematics', 'SI units, vector operations, and rectilinear, accelerated, circular, and harmonic motion', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Physical Quantities, Units, Conversions & Vectors', 'SI and practical units, dimensions, scientific notation, scalar vs. vector quantities, and vector operations', 1),
        (v_chap_id, 'Kinematics: Rectilinear, Accelerated, Circular & Harmonic Motion', 'Displacement, velocity, acceleration, uniform rectilinear, uniformly accelerated, circular, and harmonic motion', 2);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Dynamics, Work, Energy & Fluid Mechanics', 'Newtonian mechanics, momentum, mechanical energy, hydrostatics, and fluid dynamics', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Dynamics: Newton Laws, Friction & Momentum Conservation', 'Newton laws of motion, friction, impulse, linear momentum, and principle of conservation of momentum', 1),
        (v_chap_id, 'Work, Energy, Conservative Forces & Mechanical Power', 'Work-energy theorem, kinetic/potential energy, conservation of mechanical energy, and power', 2),
        (v_chap_id, 'Fluid Mechanics: Hydrostatics & Fluid Dynamics', 'Density, Pascal principle, Stevin law, Archimedes principle, flow rate, continuity equation, and Bernoulli theorem', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Thermodynamics & Heat Physics', 'Calorimetry, state transitions, ideal gas laws, and thermodynamic principles', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Thermometry, Calorimetry & Changes of State', 'Thermal capacity, specific heat, thermal expansion, phase transitions, and latent heat of fusion/vaporization', 1),
        (v_chap_id, 'Ideal Gas Laws & Laws of Thermodynamics', 'Ideal gas equation, work in thermodynamic processes, First Law internal energy, and Second Law entropy', 2);

        -- Chapter 4
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Electricity, Circuits & Electromagnetism', 'Electrostatics, DC circuitry, magnetic fields, and electromagnetic induction', 4)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Electrostatics: Coulomb Law, Electric Fields & Capacitors', 'Coulomb law, electrostatic field and potential, capacitors, dielectric constant, and electrostatic energy', 1),
        (v_chap_id, 'Direct Current Circuits & Kirchhoff Laws', 'Electric current, resistance, resistivity, Ohm law, series/parallel combinations, Kirchhoff laws, and Joule effect', 2),
        (v_chap_id, 'Magnetic Fields & Electromagnetic Induction', 'Magnetic fields of currents, Lorentz force, Faraday-Neumann law, Lenz law, and alternating current', 3);
    END IF;
END $$;

-- Maths Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'MATH';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Numerical Sets, Algebra & Polynomials', 'Numbers, powers, radicals, logarithms, combinatorics, polynomials, and equations/inequalities', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Numerical Sets, Powers, Radicals & Logarithms', 'Natural, integer, rational, real numbers, scientific notation, proportions, exponents, radicals, and logarithms base 10 & e', 1),
        (v_chap_id, 'Algebraic Expressions, Polynomials & Factoring', 'Notable products, binomial powers, polynomial factorization, and algebraic fractions', 2),
        (v_chap_id, 'Equations, Inequalities & Systems of Equations', 'Linear and quadratic equations, fractional inequalities, and systems of algebraic equations', 3),
        (v_chap_id, 'Elements of Combinatorics', 'Permutations, arrangements, combinations, and counting principles in problem solving', 4);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Functions, Trigonometry & Goniometric Equations', 'Function analysis, exponential and logarithmic curves, and trigonometric identities and triangles', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Functions, Graph Analysis & Inverses', 'Domain, codomain, sign, continuity, maxima/minima, monotonicity, composite, and inverse functions', 1),
        (v_chap_id, 'Exponential & Logarithmic Functions', 'Properties, graph analysis, exponential growth and decay models, and logarithmic transformations', 2),
        (v_chap_id, 'Goniometry, Trigonometric Formulas & Resolution of Triangles', 'Degrees and radians, sine, cosine, tangent notable angles, addition/subtraction formulas, and triangle resolution', 3);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Euclidean & Analytic Geometry', 'Plane polygons, 3D solids, Cartesian coordinates, lines, and conic sections', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Euclidean Geometry: Polygons, Circles, Areas & Volumes', 'Polygons, circles, length/surface/volume measurement, Pythagorean theorem, and Euclid theorems', 1),
        (v_chap_id, 'Cartesian Plane: Lines & Distances', 'Cartesian coordinates, distance formula, segment midpoint, slopes, and parallel and perpendicular line equations', 2),
        (v_chap_id, 'Conic Sections in the Cartesian Plane', 'Equations and geometric properties of circle, parabola, ellipse, and hyperbola', 3);

        -- Chapter 4
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Probability & Statistics', 'Frequency distributions, graphical representations, and classical and conditional probability', 4)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Descriptive Statistics & Data Representations', 'Frequency distributions, histograms, pie charts, mean, median, mode, and dispersion measures', 1),
        (v_chap_id, 'Probability Theory & Random Experiments', 'Sample spaces, random experiments, event probability, addition/multiplication rules, and empirical frequency', 2);
    END IF;
END $$;

-- Logical Reasoning Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'LR';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Critical Thinking & Deductive Logic', 'Evaluating argument consistency, deductive conclusions, formal logic, and identifying assumptions and flaws', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Argument Completion & Deductions from Premises', 'Drawing consistent conclusions, identifying underlying premises, and discarding fallacious inferences', 1),
        (v_chap_id, 'Propositional Logic, Truth Tables & Syllogisms', 'Formal logic connectives, conditionals, Venn diagrams, and categorical syllogisms', 2),
        (v_chap_id, 'Evaluating Arguments, Flaws & Counter-Examples', 'Detecting logical fallacies, strengthening/weakening arguments, and identifying unstated assumptions', 3);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Analytical Problem Solving & Diagrammatic Logic', 'Abstract quantitative reasoning, puzzles, pattern series, and diagrammatic and tabular data interpretation', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Abstract & Quantitative Problem Solving', 'Word problems, numerical relationships, sequencing, and condition-based puzzle analysis', 1),
        (v_chap_id, 'Data Interpretation & Diagrammatic Logic', 'Interpreting information from tables, bar/line graphs, charts, matrices, and spatial patterns', 2);
    END IF;
END $$;

-- GK Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'GK';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Historical-Cultural Milestones & Spatial-Temporal Orientation', 'Chronological orientation across historical-cultural eras and contemporary public debate in science and society', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Historical-Cultural Phenomena & Chronological Orientation', 'Major historical eras, scientific revolutions, key cultural movements, and global historical geography', 1),
        (v_chap_id, 'Contemporary Public Debate in Science & Society', 'Global environmental challenges, public health milestones, Nobel laureates, and modern scientific discoveries', 2);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'National & International Institutions, Law & Citizenship', 'Structure of global governance organizations, constitutional principles, civic rights, and bioethics', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'National & International Institutions (UN, WHO, EU)', 'United Nations, World Health Organization, European Union, international courts, and treaty frameworks', 1),
        (v_chap_id, 'Legal, Economic & Citizenship Governance', 'Principles of constitutional law, civic rights, international humanitarian law, economic principles, and bioethics', 2);
    END IF;
END $$;

-- English Chapters & Topics
DO $$
DECLARE
    v_subj_id UUID;
    v_chap_id UUID;
BEGIN
    SELECT id INTO v_subj_id FROM subjects WHERE code = 'ENG';

    IF v_subj_id IS NOT NULL THEN
        -- Chapter 1
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Medical & Scientific Reading Comprehension', 'Passage analysis, thesis identification, textual coherence, inference deduction, and scientific prose', 1)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Scientific Text Analysis, Inferences & Thesis Extraction', 'Deciphering scientific essays, extracting core hypotheses, identifying evidential support, and drawing contextual conclusions', 1),
        (v_chap_id, 'Textual Cohesion, Coherence & Rhetorical Devices', 'Identifying logical transitions, discourse markers, author stance, and paragraph coherence in academic texts', 2),
        (v_chap_id, 'Contextual Vocabulary in Medical & Biological Passages', 'Deriving exact contextual meanings of scientific, formal, and abstract academic terminology', 3);

        -- Chapter 2
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Medical Terminology, Etymology & Advanced Lexicon', 'Greco-Latin medical roots, morphological affixes, and academic collocations for clinical contexts', 2)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Greco-Latin Roots, Prefixes & Suffixes in Medicine', 'Etymological breakdown of anatomical, pathological, surgical, and pharmacological root terms', 1),
        (v_chap_id, 'Academic Collocations, Phrasal Verbs & Scientific Idioms', 'High-yield academic collocations, prepositional usage, and formal clinical phrases', 2);

        -- Chapter 3
        INSERT INTO chapters (subject_id, name, description, display_order)
        VALUES (v_subj_id, 'Applied Grammar, Sentence Structure & Clinical Clarity', 'Advanced syntax rules, sentence correction, concord, error identification, and logical paragraph jumbles', 3)
        RETURNING id INTO v_chap_id;

        INSERT INTO topics (chapter_id, name, description, display_order) VALUES
        (v_chap_id, 'Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals', 'Concord rules, subjunctive moods, conditional sentences, and complex clause structures', 1),
        (v_chap_id, 'Sentence Correction & Error Identification', 'Identifying modifiers, parallelism errors, redundancy, and pronoun-antecedent agreement', 2),
        (v_chap_id, 'Sentence Rearrangement, Para-Jumbles & Discourse Completion', 'Sequencing scrambled sentences into coherent scientific explanations and cloze test strategies', 3);
    END IF;
END $$;

