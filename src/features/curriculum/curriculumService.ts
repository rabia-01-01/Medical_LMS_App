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
    description: 'Cell biology, bioenergetics, genetics, evolution, human physiology, and biotechnology',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-bio-1',
        subject_id: 'subj-biology',
        name: 'The Chemistry of Living Things, Cell Biology & Bioenergetics',
        description: 'Weak interactions, biomolecules, cellular organization, transport, and energy transformations',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-101', chapter_id: 'chap-bio-1', name: 'Chemistry of Living Things & Weak Interactions', description: 'Weak interactions, organic biomolecules, and catalytic role of enzymes', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-102', chapter_id: 'chap-bio-1', name: 'Cell Theory, Cell Dimensions & Comparative Cytology', description: 'Prokaryotic and eukaryotic cells, animal vs. plant cell architectures, and viral structure', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-103', chapter_id: 'chap-bio-1', name: 'Cell Membrane & Cellular Organelles', description: 'Fluid mosaic membrane structure, transport mechanisms, and organellar compartmentalization', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-104', chapter_id: 'chap-bio-1', name: 'Bioenergetics: ATP, Photosynthesis & Cellular Respiration', description: 'ATP energy currency, redox reactions, glycolysis, aerobic respiration, Krebs cycle, and fermentation', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-2',
        subject_id: 'subj-biology',
        name: 'Cellular Reproduction, Life Cycles & Mendelian Genetics',
        description: 'Mitosis, meiosis, sexual/asexual life cycles, and classical inheritance principles',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-201', chapter_id: 'chap-bio-2', name: 'Cellular Reproduction: Mitosis, Meiosis & Karyotypes', description: 'Phases of cell division, spindle apparatus, crossing over, karyotypes, and nondisjunction', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-202', chapter_id: 'chap-bio-2', name: 'Reproduction and Inheritance: Life Cycles', description: 'Sexual and asexual reproduction, gametogenesis, and alternating life cycles', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-203', chapter_id: 'chap-bio-2', name: 'Mendelian & Classical Genetics', description: 'Mendel laws, monohybrid and dihybrid crosses, chromosomal theory of inheritance, and linkage', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-3',
        subject_id: 'subj-biology',
        name: 'Molecular Genetics, Gene Regulation & Evolution',
        description: 'DNA replication, transcription, translation, gene expression regulation, and evolutionary mechanisms',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-301', chapter_id: 'chap-bio-3', name: 'Molecular Genetics: DNA Duplication, Genetic Code & Protein Synthesis', description: 'DNA double helix, semiconservative replication, transcription, codons, and ribosomal translation', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-302', chapter_id: 'chap-bio-3', name: 'Chromosome Architecture & Regulation of Gene Expression', description: 'Prokaryotic vs. eukaryotic chromosomes, operons, chromatin remodeling, and transcriptional regulation', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-303', chapter_id: 'chap-bio-3', name: 'Mutations, Evolutionary Theories & Natural Selection', description: 'Point and chromosomal mutations, Darwinian natural and artificial selection, and genetic basis of evolution', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-4',
        subject_id: 'subj-biology',
        name: 'Human Genetics & Biotechnology',
        description: 'Hereditary disease transmission and recombinant DNA technological applications',
        display_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-401', chapter_id: 'chap-bio-4', name: 'Human Genetics: Autosomal & X-Linked Hereditary Diseases', description: 'Pedigree analysis, mono- and multifactorial traits, autosomal and X-linked hereditary diseases', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-402', chapter_id: 'chap-bio-4', name: 'Biotechnology & Recombinant DNA Technology', description: 'Restriction enzymes, cloning vectors, PCR, gel electrophoresis, and medical biotechnology applications', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-bio-5',
        subject_id: 'subj-biology',
        name: 'Anatomy and Physiology of Animals and Humans',
        description: 'Animal histology, organ system physiology, neural-endocrine control, and homeostasis',
        display_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-bio-501', chapter_id: 'chap-bio-5', name: 'Animal and Human Tissues', description: 'Epithelial, connective, muscular, and nervous tissue histology and specialized functions', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-bio-502', chapter_id: 'chap-bio-5', name: 'Human Organ Systems, Physiological Interactions & Homeostasis', description: 'Circulatory, respiratory, digestive, nervous, endocrine, and excretory systems and feedback homeostasis', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-chemistry',
    name: 'Chemistry',
    code: 'CHEM',
    description: 'Constitution of matter, atomic structure, periodic properties, bonding, stoichiometry, and organic chemistry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-chem-1',
        subject_id: 'subj-chemistry',
        name: 'Constitution of Matter, Atomic Structure & Periodic System',
        description: 'Aggregation states, gas laws, atomic orbitals, electron configurations, and periodic trends',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-101', chapter_id: 'chap-chem-1', name: 'States of Aggregation, Systems & Ideal Gas Laws', description: 'Solid, liquid, gas phases, homogeneous/heterogeneous systems, elements, compounds, and ideal gas laws', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-102', chapter_id: 'chap-chem-1', name: 'Atomic Structure, Isotopes & Electronic Configurations', description: 'Subatomic particles, atomic and mass numbers, isotopes, orbitals, quantum numbers, and electron configurations', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-103', chapter_id: 'chap-chem-1', name: 'The Periodic System of Elements & Periodic Properties', description: 'Groups, periods, transition elements, atomic radius, ionization potential, electron affinity, and metallic character', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-chem-2',
        subject_id: 'subj-chemistry',
        name: 'Chemical Bonding, Inorganic Nomenclature & Stoichiometry',
        description: 'Chemical bonds, intermolecular forces, inorganic naming rules, and stoichiometric calculations',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-201', chapter_id: 'chap-chem-2', name: 'Chemical Bonds, Electronegativity & Intermolecular Forces', description: 'Ionic, covalent, metallic bonds, bond energy, polarity, electronegativity, dipole moments, and intermolecular forces', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-202', chapter_id: 'chap-chem-2', name: 'Fundamentals of Inorganic Nomenclature', description: 'Nomenclature and properties of oxides, basic/acid anhydrides, hydroxides, binary/ternary acids, and salts', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-203', chapter_id: 'chap-chem-2', name: 'Stoichiometry, Mole Concept & Reaction Balancing', description: 'Atomic/molecular mass, Avogadro constant, mole calculations, limiting reagents, and balancing chemical reactions', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-chem-3',
        subject_id: 'subj-chemistry',
        name: 'Solutions, Equilibria, Kinetics, Redox & Acids-Bases',
        description: 'Solubility, aqueous equilibria, reaction rates, redox balance, pH, and buffer solutions',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-301', chapter_id: 'chap-chem-3', name: 'Solutions, Solubility & Concentration Units', description: 'Water as solvent, solubility curves, mass percentage, molarity, molality, and dilution calculations', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-302', chapter_id: 'chap-chem-3', name: 'Chemical Kinetics & Catalysis', description: 'Reaction rates, rate laws, activation energy, collision theory, and homogeneous/heterogeneous catalysis', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-303', chapter_id: 'chap-chem-3', name: 'Chemical & Aqueous Equilibria, Acids, Bases & Buffers', description: 'Dynamic equilibrium, Le Chatelier principle, acid-base theories, pH, salt hydrolysis, and buffer solutions', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-304', chapter_id: 'chap-chem-3', name: 'Oxidation and Reduction & Redox Balancing', description: 'Oxidation numbers, oxidizing and reducing agents, half-reaction method, and balancing redox reactions', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-chem-4',
        subject_id: 'subj-chemistry',
        name: 'Fundamentals of Organic Chemistry & Functional Groups',
        description: 'Carbon bonding, isomerism, hydrocarbons, and characteristic organic functional groups',
        display_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-chem-401', chapter_id: 'chap-chem-4', name: 'Carbon Hybridization, Molecular Formulas & Isomerism', description: 'Bonds between carbon atoms, structural and spatial formulas, and structural and geometric isomerism', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-402', chapter_id: 'chap-chem-4', name: 'Hydrocarbons: Aliphatic, Alicyclic & Aromatic', description: 'Alkanes, alkenes, alkynes, cycloalkanes, benzene structure, aromaticity, and electrophilic substitution', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-chem-403', chapter_id: 'chap-chem-4', name: 'Functional Groups & Organic Nomenclature', description: 'Alcohols, ethers, amines, aldehydes, ketones, carboxylic acids, esters, amides, and IUPAC nomenclature', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-physics',
    name: 'Physics',
    code: 'PHY',
    description: 'Physical measurements, kinematics, dynamics, fluid mechanics, thermodynamics, and electromagnetism',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-phy-1',
        subject_id: 'subj-physics',
        name: 'Physical Quantities, Vectors & Kinematics',
        description: 'SI units, vector operations, and rectilinear, accelerated, circular, and harmonic motion',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-101', chapter_id: 'chap-phy-1', name: 'Physical Quantities, Units, Conversions & Vectors', description: 'SI and practical units, dimensions, scientific notation, scalar vs. vector quantities, and vector operations', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-102', chapter_id: 'chap-phy-1', name: 'Kinematics: Rectilinear, Accelerated, Circular & Harmonic Motion', description: 'Displacement, velocity, acceleration, uniform rectilinear, uniformly accelerated, circular, and harmonic motion', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-phy-2',
        subject_id: 'subj-physics',
        name: 'Dynamics, Work, Energy & Fluid Mechanics',
        description: 'Newtonian mechanics, momentum, mechanical energy, hydrostatics, and fluid dynamics',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-201', chapter_id: 'chap-phy-2', name: 'Dynamics: Newton Laws, Friction & Momentum Conservation', description: 'Newton laws of motion, friction, impulse, linear momentum, and principle of conservation of momentum', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-202', chapter_id: 'chap-phy-2', name: 'Work, Energy, Conservative Forces & Mechanical Power', description: 'Work-energy theorem, kinetic/potential energy, conservation of mechanical energy, and power', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-203', chapter_id: 'chap-phy-2', name: 'Fluid Mechanics: Hydrostatics & Fluid Dynamics', description: 'Density, Pascal principle, Stevin law, Archimedes principle, flow rate, continuity equation, and Bernoulli theorem', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-phy-3',
        subject_id: 'subj-physics',
        name: 'Thermodynamics & Heat Physics',
        description: 'Calorimetry, state transitions, ideal gas laws, and thermodynamic principles',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-301', chapter_id: 'chap-phy-3', name: 'Thermometry, Calorimetry & Changes of State', description: 'Thermal capacity, specific heat, thermal expansion, phase transitions, and latent heat of fusion/vaporization', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-302', chapter_id: 'chap-phy-3', name: 'Ideal Gas Laws & Laws of Thermodynamics', description: 'Ideal gas equation, work in thermodynamic processes, First Law internal energy, and Second Law entropy', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-phy-4',
        subject_id: 'subj-physics',
        name: 'Electricity, Circuits & Electromagnetism',
        description: 'Electrostatics, DC circuitry, magnetic fields, and electromagnetic induction',
        display_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-phy-401', chapter_id: 'chap-phy-4', name: 'Electrostatics: Coulomb Law, Electric Fields & Capacitors', description: 'Coulomb law, electrostatic field and potential, capacitors, dielectric constant, and electrostatic energy', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-402', chapter_id: 'chap-phy-4', name: 'Direct Current Circuits & Kirchhoff Laws', description: 'Electric current, resistance, resistivity, Ohm law, series/parallel combinations, Kirchhoff laws, and Joule effect', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-phy-403', chapter_id: 'chap-phy-4', name: 'Magnetic Fields & Electromagnetic Induction', description: 'Magnetic fields of currents, Lorentz force, Faraday-Neumann law, Lenz law, and alternating current', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-maths',
    name: 'Maths',
    code: 'MATH',
    description: 'Numerical sets, algebra, functions, goniometry, Euclidean and analytic geometry, and probability/statistics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-math-1',
        subject_id: 'subj-maths',
        name: 'Numerical Sets, Algebra & Polynomials',
        description: 'Numbers, powers, radicals, logarithms, combinatorics, polynomials, and equations/inequalities',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-math-101', chapter_id: 'chap-math-1', name: 'Numerical Sets, Powers, Radicals & Logarithms', description: 'Natural, integer, rational, real numbers, scientific notation, proportions, exponents, radicals, and logarithms base 10 & e', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-102', chapter_id: 'chap-math-1', name: 'Algebraic Expressions, Polynomials & Factoring', description: 'Notable products, binomial powers, polynomial factorization, and algebraic fractions', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-103', chapter_id: 'chap-math-1', name: 'Equations, Inequalities & Systems of Equations', description: 'Linear and quadratic equations, fractional inequalities, and systems of algebraic equations', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-104', chapter_id: 'chap-math-1', name: 'Elements of Combinatorics', description: 'Permutations, arrangements, combinations, and counting principles in problem solving', display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-math-2',
        subject_id: 'subj-maths',
        name: 'Functions, Trigonometry & Goniometric Equations',
        description: 'Function analysis, exponential and logarithmic curves, and trigonometric identities and triangles',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-math-201', chapter_id: 'chap-math-2', name: 'Functions, Graph Analysis & Inverses', description: 'Domain, codomain, sign, continuity, maxima/minima, monotonicity, composite, and inverse functions', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-202', chapter_id: 'chap-math-2', name: 'Exponential & Logarithmic Functions', description: 'Properties, graph analysis, exponential growth and decay models, and logarithmic transformations', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-203', chapter_id: 'chap-math-2', name: 'Goniometry, Trigonometric Formulas & Resolution of Triangles', description: 'Degrees and radians, sine, cosine, tangent notable angles, addition/subtraction formulas, and triangle resolution', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-math-3',
        subject_id: 'subj-maths',
        name: 'Euclidean & Analytic Geometry',
        description: 'Plane polygons, 3D solids, Cartesian coordinates, lines, and conic sections',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-math-301', chapter_id: 'chap-math-3', name: 'Euclidean Geometry: Polygons, Circles, Areas & Volumes', description: 'Polygons, circles, length/surface/volume measurement, Pythagorean theorem, and Euclid theorems', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-302', chapter_id: 'chap-math-3', name: 'Cartesian Plane: Lines & Distances', description: 'Cartesian coordinates, distance formula, segment midpoint, slopes, and parallel and perpendicular line equations', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-303', chapter_id: 'chap-math-3', name: 'Conic Sections in the Cartesian Plane', description: 'Equations and geometric properties of circle, parabola, ellipse, and hyperbola', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-math-4',
        subject_id: 'subj-maths',
        name: 'Probability & Statistics',
        description: 'Frequency distributions, graphical representations, and classical and conditional probability',
        display_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-math-401', chapter_id: 'chap-math-4', name: 'Descriptive Statistics & Data Representations', description: 'Frequency distributions, histograms, pie charts, mean, median, mode, and dispersion measures', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-math-402', chapter_id: 'chap-math-4', name: 'Probability Theory & Random Experiments', description: 'Sample spaces, random experiments, event probability, addition/multiplication rules, and empirical frequency', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-lr',
    name: 'Logical Reasoning',
    code: 'LR',
    description: 'Critical arguments, syllogisms, premise deduction, abstract problem solving, and data interpretation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-lr-1',
        subject_id: 'subj-lr',
        name: 'Critical Thinking & Deductive Logic',
        description: 'Evaluating argument consistency, deductive conclusions, formal logic, and identifying assumptions and flaws',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-lr-101', chapter_id: 'chap-lr-1', name: 'Argument Completion & Deductions from Premises', description: 'Drawing consistent conclusions, identifying underlying premises, and discarding fallacious inferences', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-lr-102', chapter_id: 'chap-lr-1', name: 'Propositional Logic, Truth Tables & Syllogisms', description: 'Formal logic connectives, conditionals, Venn diagrams, and categorical syllogisms', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-lr-103', chapter_id: 'chap-lr-1', name: 'Evaluating Arguments, Flaws & Counter-Examples', description: 'Detecting logical fallacies, strengthening/weakening arguments, and identifying unstated assumptions', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-lr-2',
        subject_id: 'subj-lr',
        name: 'Analytical Problem Solving & Diagrammatic Logic',
        description: 'Abstract quantitative reasoning, puzzles, pattern series, and diagrammatic and tabular data interpretation',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-lr-201', chapter_id: 'chap-lr-2', name: 'Abstract & Quantitative Problem Solving', description: 'Word problems, numerical relationships, sequencing, and condition-based puzzle analysis', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-lr-202', chapter_id: 'chap-lr-2', name: 'Data Interpretation & Diagrammatic Logic', description: 'Interpreting information from tables, bar/line graphs, charts, matrices, and spatial patterns', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-gk',
    name: 'GK',
    code: 'GK',
    description: 'Historical-cultural orientation, contemporary global public debate, national/international institutions, and citizenship',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-gk-1',
        subject_id: 'subj-gk',
        name: 'Historical-Cultural Milestones & Spatial-Temporal Orientation',
        description: 'Chronological orientation across historical-cultural eras and contemporary public debate in science and society',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-gk-101', chapter_id: 'chap-gk-1', name: 'Historical-Cultural Phenomena & Chronological Orientation', description: 'Major historical eras, scientific revolutions, key cultural movements, and global historical geography', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-gk-102', chapter_id: 'chap-gk-1', name: 'Contemporary Public Debate in Science & Society', description: 'Global environmental challenges, public health milestones, Nobel laureates, and modern scientific discoveries', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-gk-2',
        subject_id: 'subj-gk',
        name: 'National & International Institutions, Law & Citizenship',
        description: 'Structure of global governance organizations, constitutional principles, civic rights, and bioethics',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-gk-201', chapter_id: 'chap-gk-2', name: 'National & International Institutions (UN, WHO, EU)', description: 'United Nations, World Health Organization, European Union, international courts, and treaty frameworks', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-gk-202', chapter_id: 'chap-gk-2', name: 'Legal, Economic & Citizenship Governance', description: 'Principles of constitutional law, civic rights, international humanitarian law, economic principles, and bioethics', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
    ],
  },
  {
    id: 'subj-english',
    name: 'English',
    code: 'ENG',
    description: 'Medical and scientific reading comprehension, clinical terminology, applied grammar, and discourse cohesion for NEET & IMAT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chapters: [
      {
        id: 'chap-eng-1',
        subject_id: 'subj-english',
        name: 'Medical & Scientific Reading Comprehension',
        description: 'Passage analysis, thesis identification, textual coherence, inference deduction, and scientific prose',
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-eng-101', chapter_id: 'chap-eng-1', name: 'Scientific Text Analysis, Inferences & Thesis Extraction', description: 'Deciphering scientific essays, extracting core hypotheses, identifying evidential support, and drawing contextual conclusions', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-eng-102', chapter_id: 'chap-eng-1', name: 'Textual Cohesion, Coherence & Rhetorical Devices', description: 'Identifying logical transitions, discourse markers, author stance, and paragraph coherence in academic texts', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-eng-103', chapter_id: 'chap-eng-1', name: 'Contextual Vocabulary in Medical & Biological Passages', description: 'Deriving exact contextual meanings of scientific, formal, and abstract academic terminology', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-eng-2',
        subject_id: 'subj-english',
        name: 'Medical Terminology, Etymology & Advanced Lexicon',
        description: 'Greco-Latin medical roots, morphological affixes, and academic collocations for clinical contexts',
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-eng-201', chapter_id: 'chap-eng-2', name: 'Greco-Latin Roots, Prefixes & Suffixes in Medicine', description: 'Etymological breakdown of anatomical, pathological, surgical, and pharmacological root terms', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-eng-202', chapter_id: 'chap-eng-2', name: 'Academic Collocations, Phrasal Verbs & Scientific Idioms', description: 'High-yield academic collocations, prepositional usage, and formal clinical phrases', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ],
      },
      {
        id: 'chap-eng-3',
        subject_id: 'subj-english',
        name: 'Applied Grammar, Sentence Structure & Clinical Clarity',
        description: 'Advanced syntax rules, sentence correction, concord, error identification, and logical paragraph jumbles',
        display_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topics: [
          { id: 'top-eng-301', chapter_id: 'chap-eng-3', name: 'Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals', description: 'Concord rules, subjunctive moods, conditional sentences, and complex clause structures', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-eng-302', chapter_id: 'chap-eng-3', name: 'Sentence Correction & Error Identification', description: 'Identifying modifiers, parallelism errors, redundancy, and pronoun-antecedent agreement', display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'top-eng-303', chapter_id: 'chap-eng-3', name: 'Sentence Rearrangement, Para-Jumbles & Discourse Completion', description: 'Sequencing scrambled sentences into coherent scientific explanations and cloze test strategies', display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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

    const dbCodes = new Set(data.map((s) => s.code.toUpperCase()));
    const missingDefaults = DEFAULT_CURRICULUM
      .filter((s) => !dbCodes.has(s.code.toUpperCase()))
      .map(({ chapters, ...s }) => s);

    return [...data, ...missingDefaults];
  } catch (err) {
    console.warn('[curriculumService] Error fetching subjects:', err);
    return DEFAULT_CURRICULUM.map(({ chapters, ...s }) => s);
  }
}

// ============================================================================
// LOCAL STORAGE PERSISTENT CURRICULUM FALLBACK (Offline / Hybrid Cache)
// ============================================================================

const CUSTOM_STORAGE_KEY = 'lms_curriculum_custom_v1';

export interface CustomCurriculumData {
  chapters: Chapter[];
  topics: Topic[];
  deletedChapterIds?: string[];
  deletedTopicIds?: string[];
}

export function isDeprecatedTopic(t: { id?: string; name?: string }): boolean {
  if (!t) return false;
  const n = (t.name || '').toLowerCase();
  const id = (t.id || '').toLowerCase();
  return (
    n.includes('molecular basis of inheritance') ||
    id === 'top-bio-204' ||
    n.includes('body fluids') ||
    id.includes('body-fluids')
  );
}

export function getCustomCurriculumData(): CustomCurriculumData {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.topics) {
        parsed.topics = parsed.topics.filter((t: Topic) => !isDeprecatedTopic(t));
      }
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  return { chapters: [], topics: [], deletedChapterIds: [], deletedTopicIds: [] };
}

export function saveCustomCurriculumData(data: CustomCurriculumData): void {
  try {
    if (data.topics) {
      data.topics = data.topics.filter((t: Topic) => !isDeprecatedTopic(t));
    }
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

function mergeWithCustomCurriculum(baseCurriculum: SubjectWithChapters[]): SubjectWithChapters[] {
  const custom = getCustomCurriculumData();
  const deletedChaps = new Set(custom.deletedChapterIds || []);
  const deletedTops = new Set(custom.deletedTopicIds || []);

  return baseCurriculum.map((subj) => {
    // 1. Existing base chapters filtered
    const validBaseChapters: ChapterWithTopics[] = subj.chapters
      .filter((c) => !deletedChaps.has(c.id))
      .map((ch) => {
        const existingTopics = ch.topics.filter((t) => !deletedTops.has(t.id) && !isDeprecatedTopic(t));
        const customForThisChapter = (custom.topics || []).filter(
          (t) => t.chapter_id === ch.id && !deletedTops.has(t.id) && !isDeprecatedTopic(t) && !existingTopics.some((et) => et.id === t.id)
        );
        return {
          ...ch,
          topics: [...existingTopics, ...customForThisChapter].sort(
            (a, b) => (a.display_order || 0) - (b.display_order || 0)
          ),
        };
      });

    // 2. Custom chapters added to this subject
    const customForThisSubject = (custom.chapters || [])
      .filter(
        (c) =>
          (c.subject_id === subj.id || c.subject_id === subj.code) &&
          !deletedChaps.has(c.id) &&
          !validBaseChapters.some((bc) => bc.id === c.id)
      )
      .map((c) => {
        const topics = (custom.topics || [])
          .filter((t) => t.chapter_id === c.id && !deletedTops.has(t.id) && !isDeprecatedTopic(t))
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        return {
          ...c,
          topics,
        };
      });

    return {
      ...subj,
      chapters: [...validBaseChapters, ...customForThisSubject].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      ),
    };
  });
}

/**
 * Fetch the complete 3-tier academic hierarchy:
 * Subject -> Chapters -> Topics
 */
export async function getFullCurriculum(): Promise<SubjectWithChapters[]> {
  if (!isSupabaseConfigured()) {
    return mergeWithCustomCurriculum(DEFAULT_CURRICULUM);
  }

  try {
    const { data: subjects, error: subjError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjError || !subjects || subjects.length === 0) {
      return mergeWithCustomCurriculum(DEFAULT_CURRICULUM);
    }

    const { data: chapters } = await supabase
      .from('chapters')
      .select('*')
      .order('display_order', { ascending: true });

    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .order('display_order', { ascending: true });

    const allChapters = chapters || [];
    const allTopics = (topics || []).filter((t) => !isDeprecatedTopic(t));

    // Assemble nested hierarchy
    const nested: SubjectWithChapters[] = subjects.map((subj) => {
      const subjChapters = allChapters.filter((c) => c.subject_id === subj.id);
      const chaptersWithTopics: ChapterWithTopics[] = subjChapters.map((ch) => ({
        ...ch,
        topics: allTopics.filter((t) => t.chapter_id === ch.id && !isDeprecatedTopic(t)),
      }));

      // Ensure all standard default chapters and topics for this subject are merged
      const defSubj = DEFAULT_CURRICULUM.find(
        (s) => s.code.toUpperCase() === subj.code?.toUpperCase() || s.id === subj.id
      );
      if (defSubj) {
        defSubj.chapters.forEach((defChap) => {
          const matchChap = chaptersWithTopics.find(
            (c) => c.name.toLowerCase() === defChap.name.toLowerCase() || c.id === defChap.id
          );
          if (!matchChap) {
            chaptersWithTopics.push({
              ...defChap,
              topics: (defChap.topics || []).filter((t) => !isDeprecatedTopic(t)),
            });
          } else {
            (defChap.topics || []).filter((t) => !isDeprecatedTopic(t)).forEach((defTop) => {
              if (
                !matchChap.topics.some(
                  (t) => t.name.toLowerCase() === defTop.name.toLowerCase() || t.id === defTop.id
                )
              ) {
                matchChap.topics.push(defTop);
              }
            });
          }
        });
      }

      return {
        ...subj,
        chapters: chaptersWithTopics,
      };
    });

    // If database subjects exist but no chapters are populated, merge with default chapters
    if (nested.every((s) => s.chapters.length === 0)) {
      return mergeWithCustomCurriculum(DEFAULT_CURRICULUM);
    }

    // Ensure all 7 subjects from DEFAULT_CURRICULUM are included in hierarchy
    const existingCodes = new Set(nested.map((s) => s.code.toUpperCase()));
    DEFAULT_CURRICULUM.forEach((defSubj) => {
      if (!existingCodes.has(defSubj.code.toUpperCase())) {
        nested.push(defSubj);
      }
    });

    return mergeWithCustomCurriculum(nested);
  } catch (err) {
    console.error('[curriculumService] Error fetching full curriculum hierarchy:', err);
    return mergeWithCustomCurriculum(DEFAULT_CURRICULUM);
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
  const custom = getCustomCurriculumData();
  const fallbackChapter: Chapter = {
    id: `chap-${Date.now()}`,
    subject_id: payload.subjectId,
    name: payload.name.trim(),
    description: payload.description || null,
    display_order: payload.displayOrder || (custom.chapters.length + 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    custom.chapters.push(fallbackChapter);
    saveCustomCurriculumData(custom);
    return fallbackChapter;
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

    if (error || !data) {
      console.warn('[curriculumService] Supabase createChapter warning, saving locally:', error?.message);
      custom.chapters.push(fallbackChapter);
      saveCustomCurriculumData(custom);
      return fallbackChapter;
    }

    custom.chapters.push(data);
    saveCustomCurriculumData(custom);
    return data;
  } catch (err) {
    console.warn('[curriculumService] createChapter exception, saving locally:', err);
    custom.chapters.push(fallbackChapter);
    saveCustomCurriculumData(custom);
    return fallbackChapter;
  }
}

/**
 * Add a new topic to a chapter.
 */
export async function createTopic(payload: CreateTopicPayload): Promise<Topic | null> {
  const custom = getCustomCurriculumData();
  const fallbackTopic: Topic = {
    id: `top-${Date.now()}`,
    chapter_id: payload.chapterId,
    name: payload.name.trim(),
    description: payload.description || null,
    display_order: payload.displayOrder || (custom.topics.length + 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    custom.topics.push(fallbackTopic);
    saveCustomCurriculumData(custom);
    return fallbackTopic;
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

    if (error || !data) {
      console.warn('[curriculumService] Supabase createTopic warning, saving locally:', error?.message);
      custom.topics.push(fallbackTopic);
      saveCustomCurriculumData(custom);
      return fallbackTopic;
    }

    custom.topics.push(data);
    saveCustomCurriculumData(custom);
    return data;
  } catch (err) {
    console.warn('[curriculumService] createTopic exception, saving locally:', err);
    custom.topics.push(fallbackTopic);
    saveCustomCurriculumData(custom);
    return fallbackTopic;
  }
}

/**
 * Reorder topics inside a chapter.
 */
export async function reorderTopics(chapterId: string, orderedTopicIds: string[]): Promise<boolean> {
  const custom = getCustomCurriculumData();
  custom.topics = custom.topics.map((t) => {
    if (t.chapter_id === chapterId) {
      const idx = orderedTopicIds.indexOf(t.id);
      if (idx !== -1) {
        return { ...t, display_order: idx + 1 };
      }
    }
    return t;
  });
  saveCustomCurriculumData(custom);
  return true;
}

/**
 * Delete a chapter.
 */
export async function deleteChapter(chapterId: string): Promise<boolean> {
  const custom = getCustomCurriculumData();
  if (!custom.deletedChapterIds) custom.deletedChapterIds = [];
  if (!custom.deletedChapterIds.includes(chapterId)) {
    custom.deletedChapterIds.push(chapterId);
  }
  custom.chapters = custom.chapters.filter((c) => c.id !== chapterId);
  saveCustomCurriculumData(custom);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('chapters').delete().eq('id', chapterId);
    } catch {}
  }
  return true;
}

/**
 * Delete a topic.
 */
export async function deleteTopic(topicId: string): Promise<boolean> {
  const custom = getCustomCurriculumData();
  if (!custom.deletedTopicIds) custom.deletedTopicIds = [];
  if (!custom.deletedTopicIds.includes(topicId)) {
    custom.deletedTopicIds.push(topicId);
  }
  custom.topics = custom.topics.filter((t) => t.id !== topicId);
  saveCustomCurriculumData(custom);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('topics').delete().eq('id', topicId);
    } catch {}
  }
  return true;
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
