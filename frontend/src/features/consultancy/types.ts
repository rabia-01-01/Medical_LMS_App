// ============================================================================
// CONSULTANCY DOSSIER & ADMISSIONS CHECKLIST DATA TYPES
// Based on the Medical Study Abroad & Consular Attestation Pipeline
// ============================================================================

export type ChecklistItemStatus = 'pending' | 'submitted' | 'in_progress' | 'verified' | 'rejected';

export interface ConsultancyChecklistSubItem {
  id: string;
  title: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

export interface ConsultancyChecklistItem {
  id: string;
  key: string;
  stageNumber: number;
  title: string;
  category: 'Identity' | 'Academic' | 'Attestation' | 'Scholarship' | 'Enrolment' | 'Registration' | 'Examination';
  description: string;
  status: ChecklistItemStatus;
  subItems?: ConsultancyChecklistSubItem[];
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  uploadedFile?: {
    fileName: string;
    fileSize: string;
    fileUrl?: string;
    uploadedAt: string;
  };
  verifiedBy?: string;
  verifiedAt?: string;
  consultantNotes?: string;
  deadline?: string;
}

export type DossierOverallStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'DOCS_VERIFIED'
  | 'APOSTILLED'
  | 'SCHOLARSHIP_READY'
  | 'PRE_ENROLLED'
  | 'VISA_READY'
  | 'COMPLETED';

export interface StudentConsultancyDossier {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBatch: string;
  avatar?: string;
  targetCountry: string; // e.g. 'Italy'
  targetCourse: string; // e.g. 'Medicine and Surgery (MD / Single-Cycle)'
  targetUniversities: string[];
  consultantId: string;
  consultantName: string;
  assignedAt: string;
  overallStatus: DossierOverallStatus;
  checklist: ConsultancyChecklistItem[];
  lastUpdated: string;
  priority?: 'High' | 'Medium' | 'Standard';
  intake?: string; // e.g. 'Autumn 2026 / 2027'
  notes?: string;
}

/**
 * Creates the standard 8-stage admissions checklist from the handwritten workflow.
 */
export function createDefaultChecklist(): ConsultancyChecklistItem[] {
  return [
    {
      id: 'chk-passport',
      key: 'passport',
      stageNumber: 1,
      title: 'Passport',
      category: 'Identity',
      description: 'Valid International Passport (Bio-data page, minimum 18-24 months validity, at least 2 blank visa pages)',
      status: 'verified',
      documentNumber: 'Z8492014',
      issueDate: '2023-01-15',
      expiryDate: '2033-01-14',
      issuingAuthority: 'Passport Seva Kendra / Govt. of India',
      uploadedFile: {
        fileName: 'Passport_BioData_Page.pdf',
        fileSize: '1.8 MB',
        uploadedAt: '2026-10-10T10:00:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-10-12T14:30:00Z',
      consultantNotes: 'Passport verified. Bio-data clear, expires in 2033, valid for full degree duration.',
    },
    {
      id: 'chk-12th-moi',
      key: '12th_moi',
      stageNumber: 2,
      title: 'Class 12th Marksheet, Passing Certs & MOI',
      category: 'Academic',
      description: 'Senior Secondary Board Marksheet (PCB aggregate >= 60%), official Passing Certificate, and English Medium of Instruction (MOI) Certificate',
      status: 'verified',
      subItems: [
        { id: 'sub-12th-mark', title: 'Class 12th Marksheet (PCB aggregate & practicals)', status: 'verified', notes: 'Aggregate: 94.6% in PCB' },
        { id: 'sub-12th-pass', title: 'Class 12th Passing Certificate / Migration', status: 'verified', notes: 'Original certificate verified' },
        { id: 'sub-12th-moi', title: 'Medium of Instruction (MOI) Certificate in English', status: 'verified', notes: 'Issued by School Principal, 12 years English medium' },
      ],
      documentNumber: 'CBSE/XII/2024/918234',
      issueDate: '2024-05-20',
      issuingAuthority: 'CBSE Board & Senior Secondary School',
      uploadedFile: {
        fileName: 'Class12_Marksheet_Passing_MOI_Compiled.pdf',
        fileSize: '3.4 MB',
        uploadedAt: '2026-10-12T11:20:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-10-14T16:00:00Z',
      consultantNotes: 'All 3 academic documents verified. PCB marksheet, passing certificate, and MOI valid.',
    },
    {
      id: 'chk-hrd',
      key: 'hrd',
      stageNumber: 3,
      title: 'State HRD Attestation',
      category: 'Attestation',
      description: 'State Human Resource Development (HRD / Higher Education Department) authentication on original Class 12th certificates',
      status: 'verified',
      documentNumber: 'HRD-DL-2024-88412',
      issueDate: '2026-10-18',
      issuingAuthority: 'State Department of Higher Education (HRD)',
      uploadedFile: {
        fileName: 'HRD_Attested_Backside_Stamp.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '2026-10-19T09:15:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-10-20T11:45:00Z',
      consultantNotes: 'Regional state HRD seal confirmed with official countersignature.',
    },
    {
      id: 'chk-apostille',
      key: 'apostille',
      stageNumber: 4,
      title: 'Apostille (MEA)',
      category: 'Attestation',
      description: 'Ministry of External Affairs (MEA), Government of India Hague Apostille sticker with verification QR code',
      status: 'verified',
      documentNumber: 'MEA-IN-APO-2026-449102',
      issueDate: '2026-10-24',
      issuingAuthority: 'Ministry of External Affairs, CPV Division, New Delhi',
      uploadedFile: {
        fileName: 'MEA_Apostille_Sticker_Certificate.pdf',
        fileSize: '1.9 MB',
        uploadedAt: '2026-10-25T14:10:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-10-26T15:20:00Z',
      consultantNotes: 'Hague Apostille sticker verified via MEA e-Sanad online QR code.',
    },
    {
      id: 'chk-scholarship',
      key: 'scholarship_docs',
      stageNumber: 5,
      title: 'SCHOLARSHIP DOCS',
      category: 'Scholarship',
      description: 'Regional Italian Government Scholarship dossier (EDISU / DSU / ER.GO) for 100% tuition waiver & €7,500/year living grant',
      status: 'in_progress',
      subItems: [
        { id: 'sub-sch-bank', title: 'Bank Certificate (Balance & 6-month transaction statement as of 31st Dec)', status: 'verified', notes: 'Closing balance confirmed, official bank seal' },
        { id: 'sub-sch-special', title: 'Special Certificate (Family Composition & Annual Income Certificate)', status: 'verified', notes: 'Family composition & income certificate submitted' },
        { id: 'sub-sch-notary', title: 'Notary, SDM, Apostille (Sub-Divisional Magistrate & MEA Apostille)', status: 'verified', notes: 'SDM attestation and MEA scholarship apostille completed' },
        { id: 'sub-sch-trans', title: 'Translation & Legalisation (Sworn Italian translation & Consular legalisation)', status: 'pending', notes: 'Sent to Italian sworn translator in Rome. Delivery awaited.' },
      ],
      documentNumber: 'DSU-SCH-2026-00418',
      issueDate: '2026-10-28',
      issuingAuthority: 'Regional DSU / Italian Consular Section',
      uploadedFile: {
        fileName: 'Scholarship_Income_Bank_SDM_Draft.pdf',
        fileSize: '4.2 MB',
        uploadedAt: '2026-10-29T12:00:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-10-30T10:00:00Z',
      consultantNotes: 'Bank Certificate, Special Certificate, and Notary/SDM/Apostille complete. Italian translation & legalisation in progress.',
    },
    {
      id: 'chk-pre-enrolment',
      key: 'pre_enrolment',
      stageNumber: 6,
      title: 'Pre registration evaluation & Pre enrolment',
      category: 'Enrolment',
      description: 'Universitaly portal pre-enrolment dossier, eligibility evaluation letter, and CIMEA Comparability / DOV application',
      status: 'in_progress',
      subItems: [
        { id: 'sub-univ-pre', title: 'Universitaly Pre-Enrolment Application Form & Code', status: 'verified', notes: 'Pre-enrolment submitted to Sapienza University of Rome' },
        { id: 'sub-univ-eval', title: 'Pre-registration Academic Evaluation & Acceptance Letter', status: 'verified', notes: 'Eligibility evaluation approved by university international desk' },
        { id: 'sub-univ-dov', title: 'CIMEA Statement of Comparability / DOV (Dichiarazione di Valore)', status: 'pending', notes: 'CIMEA DiploME certificate issuance in final verification' },
      ],
      documentNumber: 'UNIV-IT-2026-9921',
      issueDate: '2026-11-01',
      issuingAuthority: 'Universitaly (MUR) & Sapienza University of Rome',
      uploadedFile: {
        fileName: 'Universitaly_PreEnrolment_Summary.pdf',
        fileSize: '2.5 MB',
        uploadedAt: '2026-11-02T16:30:00Z',
      },
      verifiedBy: 'Dr. Marco Rossi (Consultant Agent)',
      verifiedAt: '2026-11-03T11:00:00Z',
      consultantNotes: 'Universitaly pre-enrolment submitted. Awaiting CIMEA statement release to complete stage.',
    },
    {
      id: 'chk-registration',
      key: 'registration',
      stageNumber: 7,
      title: 'Registration',
      category: 'Registration',
      description: 'Official university portal matriculation, student ID allocation, and tuition exemption registration',
      status: 'pending',
      issuingAuthority: 'University Registrar / Infostud Portal',
      consultantNotes: 'Scheduled following CIMEA release and scholarship voucher allocation.',
    },
    {
      id: 'chk-examination',
      key: 'examination',
      stageNumber: 8,
      title: 'EXAMINATION (IMAT)',
      category: 'Examination',
      description: 'International Medical Admissions Test (IMAT) registration, test center allocation, admit card verification, and examination day clearance',
      status: 'pending',
      subItems: [
        { id: 'sub-exam-reg', title: 'IMAT / Medical Entrance Registration Fee Receipt', status: 'verified', notes: 'Exam fee paid, registration confirmed' },
        { id: 'sub-exam-hall', title: 'Official Examination Admit Card & Roll Number Verification', status: 'pending', notes: 'Admit card will be released 10 days prior to exam' },
        { id: 'sub-exam-clear', title: 'Examination Day Medical Checklist & Center Clearance', status: 'pending', notes: 'Center: New Delhi / Rome Overseas Testing Center' },
      ],
      issuingAuthority: 'Cambridge Assessment & Universitaly (MUR)',
      consultantNotes: 'Candidate is actively preparing on the LMS (curriculum completed, 4/4 topics studied in Biology). Test center allocated.',
    },
  ];
}

/**
 * Creates an initial 8-stage admissions checklist for newly enrolled applicants.
 * All 8 stages start strictly in 'in_progress' (In Review) status until verified by Consultant Agent.
 */
export function createNewApplicantChecklist(): ConsultancyChecklistItem[] {
  return createDefaultChecklist().map((item) => ({
    id: item.id,
    key: item.key,
    stageNumber: item.stageNumber,
    title: item.title,
    category: item.category,
    description: item.description,
    status: 'in_progress' as ChecklistItemStatus,
    verifiedBy: undefined,
    verifiedAt: undefined,
    consultantNotes: 'Applicant enrolled. Documents in review by Consultant Agent.',
    subItems: item.subItems?.map((sub) => ({
      id: sub.id,
      title: sub.title,
      status: 'pending' as const,
      notes: 'Pending consultant review and verification',
    })),
  }));
}


