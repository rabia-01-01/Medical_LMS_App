import fs from 'fs';
import assert from 'assert';

console.log('================================================================');
console.log('  VERIFYING USER REQUESTS 1, 2, 3, 4 ENHANCEMENTS               ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    failCount++;
  }
}

const consultantScreens = fs.readFileSync('src/screens/ConsultantScreens.tsx', 'utf8');
const studentScreens = fs.readFileSync('src/screens/StudentScreens.tsx', 'utf8');
const dataContext = fs.readFileSync('src/context/DataContext.tsx', 'utf8');

// 1. Opt-in conditional rendering and status breakdown counts
console.log('[Requirement 1] Opt-In Dependency & Status Breakdown (Verified, Not Verified, Pending, In Review):');
test('StudentProfile gates Verification Documents on isOptedIn and myDossier', () => {
  assert(studentScreens.includes('isOptedIn && myDossier && ('), 'My Verification Documents rendered only when isOptedIn && myDossier');
});

test('StudentProfile computes status breakdown for all 4 markers', () => {
  assert(studentScreens.includes('verifiedDocsCount'), 'Calculates verified count');
  assert(studentScreens.includes('inProgressDocsCount'), 'Calculates in review count');
  assert(studentScreens.includes('notVerifiedDocsCount'), 'Calculates not verified count');
  assert(studentScreens.includes('pendingDocsCount'), 'Calculates pending count');
});

test('StudentProfile displays breakdown UI cards for Verified, In Review, Not Verified, Pending', () => {
  assert(studentScreens.includes('>Verified</p>') || studentScreens.includes('>Verified</div>'), 'Renders Verified label in breakdown grid');
  assert(studentScreens.includes('>In Review</p>') || studentScreens.includes('>In Review</div>'), 'Renders In Review label in breakdown grid');
  assert(studentScreens.includes('>Not Verified</p>') || studentScreens.includes('>Not Verified</div>'), 'Renders Not Verified label in breakdown grid');
  assert(studentScreens.includes('>Pending</p>') || studentScreens.includes('>Pending</div>'), 'Renders Pending label in breakdown grid');
});

// 2. Notification to Consultant Agent when student clicks Opt In
console.log('\n[Requirement 2] Consultant Agent Notification on Student Opt-In:');
test('setConsultancyOptIn dispatches notification targeted to consultant', () => {
  assert(dataContext.includes("targetRole: 'consultant'"), 'Notification targeted to consultant role');
  assert(dataContext.includes('New Consultancy Facility Request'), 'Notification title informs of new consultancy facility request');
  assert(dataContext.includes('setNotifications(prev => [consultantNotif, ...prev])'), 'Notification added to notification store');
});

test('Consultant Dashboard renders alert banner & Allow Facility action for student requests', () => {
  assert(consultantScreens.includes('New Student Opt-In Request'), 'ConsultantDashboard has New Student Opt-In Request banner');
  assert(consultantScreens.includes('Allow Facility'), 'ConsultantDashboard provides Allow Facility action button');
  assert(consultantScreens.includes('unreadConsultantNotifs'), 'ConsultantDashboard tracks unread consultant notifications');
});

// 3. Remove Print Dossier button from Consultant Agent Dashboard
console.log('\n[Requirement 3] Remove Print Dossier Button from Consultant Agent Dashboard:');
test('Consultant candidate card does not have Print Dossier button', () => {
  assert(!consultantScreens.includes('Print Dossier</button>'), 'Print Dossier button removed from candidate card actions');
});

// 4. Remove Attached Documents and Saved Note fields from review modal
console.log('\n[Requirement 4] Remove Attached Documents and Saved Note Fields:');
test('ConsultantStageInspectionModal removed View Attachment button', () => {
  const stageModalMatch = consultantScreens.slice(
    consultantScreens.indexOf('function ConsultantStageInspectionModal'),
    consultantScreens.indexOf('function NewConsultancyApplicantModal')
  );
  assert(!stageModalMatch.includes('View Attachment'), 'View Attachment (Attached Documents) removed from ConsultantStageInspectionModal');
  assert(!stageModalMatch.includes('Save Note'), 'Save Note button removed from ConsultantStageInspectionModal');
  assert(!stageModalMatch.includes('Consultant Verification Remarks / Feedback:'), 'Notes input field removed from ConsultantStageInspectionModal');
});

// 5. Remove Verification Document dashboard when Consultant Agent deletes facility
console.log('\n[Requirement 5] Delete Student Consultancy Facility & Restore Option:');
test('deleteConsultancyDossier clears dossier, opt-in status, and student documents', () => {
  assert(dataContext.includes('setConsultancyDossiers(prev => prev.filter(d => d.studentId !== studentId));'), 'Deletes candidate dossier');
  assert(dataContext.includes('setConsultancyOptInMap(prev => ({ ...prev, [studentId]: false }));'), 'Sets opt-in map to false on deletion');
  assert(dataContext.includes('setStudentDocuments(prev => prev.filter(d => d.studentId !== studentId));'), 'Clears student documents on deletion');
});

test('Student can opt in anytime via Opt In button', () => {
  assert(studentScreens.includes("'Opted In' : 'Opt In'"), 'Student profile provides Opt In button when not opted in');
});

console.log('\n================================================================');
console.log(`  VERIFICATION SUMMARY: ${passCount}/${passCount + failCount} TESTS PASSED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
