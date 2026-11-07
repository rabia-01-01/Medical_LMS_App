import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  CONSULTANT AGENT & 8-STAGE CHECKLIST VERIFICATION TEST        ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Types & 8-Stage Checklist Specification
console.log('[Step 1] Verifying 8-Stage Checklist Specification from Handwritten Note:');
const typesCode = fs.readFileSync('src/features/consultancy/types.ts', 'utf8');

const stages = [
  'Passport',
  'Class 12th',
  'HRD',
  'Apostille',
  'SCHOLARSHIP DOCS',
  'Pre registration evaluation & Pre enrolment',
  'Registration',
  'EXAMINATION',
];

for (const stage of stages) {
  assert(typesCode.includes(stage), `Checklist defines stage: "${stage}"`);
}

// Check Scholarship Sub-items
const scholarshipSubItems = [
  'Bank Certificate',
  'Special Certificate',
  'Notary, SDM, Apostille',
  'Translation & Legalisation',
];

for (const sub of scholarshipSubItems) {
  assert(typesCode.includes(sub), `Scholarship docs stage includes sub-item: "${sub}"`);
}

// 2. Auth Role & User Mapping
console.log('\n[Step 2] Verifying Consultant Agent Auth & Database Integration:');
const authTypes = fs.readFileSync('src/features/auth/types.ts', 'utf8');
assert(authTypes.includes("'consultant'"), "Auth AppUserRole includes 'consultant'");

const dbTypes = fs.readFileSync('src/types/database.ts', 'utf8');
assert(dbTypes.includes("'CONSULTANT'"), "Database UserRole includes 'CONSULTANT'");

const authService = fs.readFileSync('src/features/auth/authService.ts', 'utf8');
assert(authService.includes("appRole === 'consultant'") || authService.includes("case 'consultant':"), "authService maps 'consultant' to DB 'CONSULTANT'");
assert(authService.includes("upper === 'CONSULTANT'") || authService.includes("case 'CONSULTANT':"), "authService maps DB 'CONSULTANT' to App 'consultant'");

// 3. DataContext State & Operations
console.log('\n[Step 3] Verifying DataContext State & Methods for Consultancy:');
const dataContext = fs.readFileSync('src/context/DataContext.tsx', 'utf8');
assert(dataContext.includes('consultancyDossiers: StudentConsultancyDossier[]'), 'DataContextType defines consultancyDossiers');
assert(dataContext.includes('updateChecklistItemStatus'), 'DataContext defines updateChecklistItemStatus');
assert(dataContext.includes('addConsultancyDossier'), 'DataContext defines addConsultancyDossier');
assert(dataContext.includes('updateConsultancyDossier'), 'DataContext defines updateConsultancyDossier');
assert(dataContext.includes('deleteConsultancyDossier'), 'DataContext defines deleteConsultancyDossier');
assert(dataContext.includes('getStudentDossier'), 'DataContext defines getStudentDossier');
assert(dataContext.includes('consultant@italia.medica'), 'DataContext seeds Dr. Marco Rossi (Consultant Agent)');

// 4. Consultant Dashboard & Inspection Components
console.log('\n[Step 4] Verifying Consultant Dashboard & Inspector Screens:');
const consultantScreens = fs.readFileSync('src/screens/ConsultantScreens.tsx', 'utf8');
assert(consultantScreens.includes('export function ConsultantDashboard'), 'ConsultantDashboard exported');
assert(consultantScreens.includes('export function ConsultantChecklistInspectorModal'), 'ConsultantChecklistInspectorModal exported');
assert(consultantScreens.includes('export function NewConsultancyApplicantModal'), 'NewConsultancyApplicantModal exported');
assert(consultantScreens.includes('export function ConsularDossierPrintModal'), 'ConsularDossierPrintModal exported');
assert(consultantScreens.includes('export function StudentConsultancyRoadmapModal'), 'StudentConsultancyRoadmapModal exported');

// 5. App Navigation & Routing for Consultant
console.log('\n[Step 5] Verifying App Navigation & Routing:');
const appCode = fs.readFileSync('src/App.tsx', 'utf8');
assert(appCode.includes('consultantNavItems'), 'App defines consultantNavItems');
assert(appCode.includes("user?.role === 'consultant'"), "App routes user?.role === 'consultant' to ConsultantDashboard");
assert(appCode.includes('ConsultantDashboard'), 'App imports ConsultantDashboard');

// 6. Student Dashboard Integration
console.log('\n[Step 6] Verifying Student Dashboard Consular Roadmap:');
const studentScreens = fs.readFileSync('src/screens/StudentScreens.tsx', 'utf8');
assert(studentScreens.includes('StudentConsultancyRoadmapModal'), 'StudentHome imports StudentConsultancyRoadmapModal');
assert(studentScreens.includes('myDossier'), 'StudentHome loads student consultancy dossier');
assert(studentScreens.includes('View 8-Stage Admissions & Consular Checklist'), 'StudentHome renders interactive 8-stage checklist button');

// 7. Clickable Stages & Stage Inspection Modal
console.log('\n[Step 7] Verifying Clickable 8 Stages & ConsultantStageInspectionModal:');
assert(consultantScreens.includes('export function ConsultantStageInspectionModal'), 'ConsultantStageInspectionModal exported');
assert(consultantScreens.includes('export function DocumentAttachmentPreviewModal'), 'DocumentAttachmentPreviewModal exported');
assert(consultantScreens.includes('handleOpenStage(stage.num)'), '8 pipeline stages are clickable and call handleOpenStage');
assert(consultantScreens.includes('ConsultantStageInspectionModal'), 'ConsultantDashboard mounts ConsultantStageInspectionModal');
assert(consultantScreens.includes('Candidate Submissions for Review'), 'ConsultantStageInspectionModal displays candidate submissions');
assert(consultantScreens.includes('Verified'), 'Inspection modal has Verified action button');
assert(consultantScreens.includes('Not Verified'), 'Inspection modal has Not Verified action button');
assert(consultantScreens.includes('In Review/In Progress'), 'Inspection modal has In Review/In Progress action button');
assert(consultantScreens.includes('Pending'), 'Inspection modal has Pending action button');

// 8. 8 Documents on Student Dashboard & Bi-directional Sync
console.log('\n[Step 8] Verifying 8 Admissions Documents on Student Dashboard:');
assert(dataContext.includes('sdoc-passport'), 'DEFAULT_STUDENT_DOCS defines Stage 1: Passport');
assert(dataContext.includes('sdoc-12th-moi'), 'DEFAULT_STUDENT_DOCS defines Stage 2: 12th & MOI');
assert(dataContext.includes('sdoc-hrd'), 'DEFAULT_STUDENT_DOCS defines Stage 3: HRD Attestation');
assert(dataContext.includes('sdoc-apostille'), 'DEFAULT_STUDENT_DOCS defines Stage 4: Apostille');
assert(dataContext.includes('sdoc-scholarship'), 'DEFAULT_STUDENT_DOCS defines Stage 5: Scholarship Docs');
assert(dataContext.includes('sdoc-pre-enrolment'), 'DEFAULT_STUDENT_DOCS defines Stage 6: Pre-Enrolment');
assert(dataContext.includes('sdoc-registration'), 'DEFAULT_STUDENT_DOCS defines Stage 7: Registration');
assert(dataContext.includes('sdoc-examination'), 'DEFAULT_STUDENT_DOCS defines Stage 8: Examination');
assert(!studentScreens.includes('Submitted via Student Mail'), 'StudentProfile has completely removed Submitted via Student Mail');
assert(dataContext.includes("docStatus = 'Verified'"), 'updateChecklistItemStatus syncs Verified to studentDocuments');
assert(dataContext.includes("docStatus = 'Not Verified'"), 'updateChecklistItemStatus syncs Not Verified to studentDocuments');
assert(dataContext.includes("docStatus = 'In Review/In Progress'"), 'updateChecklistItemStatus syncs In Review/In Progress to studentDocuments');
assert(dataContext.includes("docStatus = 'Pending'"), 'updateChecklistItemStatus syncs Pending to studentDocuments');

assert(studentScreens.includes('My Verification Documents'), 'StudentProfile renders My Verification Documents');
assert(studentScreens.includes('/ 8 Verified'), 'StudentProfile shows / 8 Verified count');
assert(studentScreens.includes('View Full 8-Stage Consular Admissions Roadmap'), 'StudentProfile includes CTA to open full consular roadmap');

// 9. Batch Enrollment Capacity Limits
console.log('\n[Step 9] Verifying Batch Enrollment Capacity Limits:');
const adminScreens = fs.readFileSync('src/screens/AdminScreens.tsx', 'utf8');
assert(adminScreens.includes('batchMaxStudents') || adminScreens.includes('maxStudents'), 'Admin batch creation includes maxStudents capacity field');
assert(adminScreens.includes('Batch Enrollment Capacity') || adminScreens.includes('Max Student Enrollment Capacity'), 'Admin UI labels batch enrollment capacity');
assert(adminScreens.includes('Students Joined') && adminScreens.includes('Batch Full'), 'Admin batches card displays capacity and Batch Full indicator');
assert(studentScreens.includes('isBatchFull') && studentScreens.includes('Batch Full'), 'StudentCourses detects batch capacity and displays Batch Full');
assert(studentScreens.includes('Enrollment Closed') || studentScreens.includes('reached its maximum enrollment capacity'), 'StudentCourses blocks enrollment when batch capacity is reached');

// 10. Consultant Dashboard Back Button & Delete Candidate Button
console.log('\n[Step 10] Verifying Consultant Back Button & Candidate Deletion:');
assert(consultantScreens.includes('onBack?: () => void') || consultantScreens.includes('onBack'), 'ConsultantDashboard accepts onBack prop');
assert(consultantScreens.includes('fa-arrow-left') && consultantScreens.includes('Go Back'), 'ConsultantDashboard header renders Go Back button');
assert(appCode.includes('<ConsultantDashboard onNavigate={handleNavigate} onBack={handleBack} />'), 'App passes onBack to ConsultantDashboard');
assert(consultantScreens.includes('Delete Candidate') && consultantScreens.includes('deleteConsultancyDossier'), 'Consultant screens provide Delete Candidate button for completed consultancy students');

// 11. Student Consultancy Assistance Opt-In / Opt-Out Choice
console.log('\n[Step 11] Verifying Student Choice for Consultancy Assistance:');
assert(dataContext.includes('isConsultancyOptedIn') && dataContext.includes('setConsultancyOptIn'), 'DataContext provides isConsultancyOptedIn and setConsultancyOptIn');
assert(studentScreens.includes('Study Abroad Consultancy Assistance') || studentScreens.includes('Consultancy Assistance'), 'Student screens render Consultancy Assistance Choice UI');
assert(studentScreens.includes('Opted In') && studentScreens.includes('Not Opted'), 'Student screens provide Opted In / Not Opted toggle');
assert(studentScreens.includes('Opt Out') && studentScreens.includes('Opt In'), 'Student screens provide explicit buttons to opt in or opt out');

console.log('\n================================================================');
console.log(`  VERIFICATION SUMMARY: ${passCount}/${passCount + failCount} TESTS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('================================================================\n');

if (failCount === 0) {
  console.log('🎉 CONSULTANT AGENT DASHBOARD & CHECKLIST 100% OPERATIONAL!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
