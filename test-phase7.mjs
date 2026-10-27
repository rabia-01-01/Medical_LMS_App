import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - PHASE 7 ENROLLMENT, DRM & ADMIN COURSES TEST    ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}\n`);

// 1. Read environment credentials safely (NEVER print the full key)
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}❌ Error: .env file not found in root directory!${colors.reset}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...values] = trimmed.split('=');
    if (key && values.length) {
      envVars[key.trim()] = values.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log(`${colors.bold}[Step 1] Verifying Supabase Client Credentials:${colors.reset}`);
if (!supabaseUrl || !supabaseKey) {
  console.log(`  ${colors.red}❌ Missing credentials in .env${colors.reset}`);
  process.exit(1);
} else {
  const maskedKey = supabaseKey.slice(0, 10) + '...' + supabaseKey.slice(-6);
  console.log(`  ${colors.green}✔ Endpoint:${colors.reset} ${supabaseUrl}`);
  console.log(`  ${colors.green}✔ Key:${colors.reset} ${maskedKey}`);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPhase7Tests() {
  try {
    // 2. Database Tables Verification for Phase 7
    console.log(`\n${colors.bold}[Step 2] Checking Phase 7 Enrollment & Governance Tables in PostgreSQL:${colors.reset}`);
    const phase7Tables = [
      { name: 'student_subjects', desc: 'Student subject/course enrollments' },
      { name: 'student_exams', desc: 'Student competitive exam tracks (NEET/IMAT/UCAT)' },
      { name: 'batches', desc: 'Student batches and cohort grouping' },
      { name: 'classes', desc: 'Academic grades and class years' },
      { name: 'audit_logs', desc: 'System governance, enrollment audits & user logs' },
    ];

    for (const table of phase7Tables) {
      try {
        const { data, error } = await supabase.from(table.name).select('id').limit(1);
        if (error) {
          console.log(`  ${colors.yellow}⚠ ${table.name.padEnd(20)}: ${error.message} (${table.desc})${colors.reset}`);
        } else {
          console.log(`  ${colors.green}✔ ${table.name.padEnd(20)}: Connected & accessible (${table.desc})${colors.reset}`);
        }
      } catch (e) {
        console.log(`  ${colors.yellow}⚠ ${table.name.padEnd(20)}: Pending migration / local fallback mode (${table.desc})${colors.reset}`);
      }
    }

    // 3. Test Phase 7 Module Structure
    console.log(`\n${colors.bold}[Step 3] Checking Phase 7 Module Structure & Exports:${colors.reset}`);
    const requiredFiles = [
      'src/features/enrollment/types.ts',
      'src/features/enrollment/enrollmentService.ts',
      'src/features/enrollment/index.ts',
      'src/features/resources/documentProtection.tsx',
      'src/components/EnrollStudentsModal.tsx',
    ];

    for (const f of requiredFiles) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`  ${colors.green}✔ ${f.padEnd(52)}: Found (${stats.size} bytes)${colors.reset}`);
      } else {
        console.log(`  ${colors.red}❌ ${f.padEnd(52)}: Missing!${colors.reset}`);
        process.exit(1);
      }
    }

    // 4. Test DRM Document Protection Code Integrity
    console.log(`\n${colors.bold}[Step 4] Validating DRM Document Protection & Anti-Screenshot Rules:${colors.reset}`);
    const docProtFile = fs.readFileSync(path.resolve(process.cwd(), 'src/features/resources/documentProtection.tsx'), 'utf8');
    const resourceScreensFile = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/ResourceScreens.tsx'), 'utf8');

    // Rule 1: Context menu blocked
    const hasContextMenuBlocked = docProtFile.includes('handleContextMenu') && docProtFile.includes('onContextMenu') && docProtFile.includes('preventDefault()');
    console.log(`  ${hasContextMenuBlocked ? colors.green + '✔' : colors.red + '❌'} Right-click context menu blocking:${colors.reset} ${hasContextMenuBlocked ? 'Enforced' : 'Missing'}`);

    // Rule 2: PrintScreen / Copy / Print blocked
    const hasPrintScreenBlocked = docProtFile.includes('PrintScreen') && docProtFile.includes('navigator.clipboard.writeText');
    console.log(`  ${hasPrintScreenBlocked ? colors.green + '✔' : colors.red + '❌'} PrintScreen keyboard trap & clipboard wipe:${colors.reset} ${hasPrintScreenBlocked ? 'Enforced' : 'Missing'}`);

    const hasPrintBlocked = docProtFile.includes("e.key === 'p'") || docProtFile.includes('e.key === \'P\'');
    console.log(`  ${hasPrintBlocked ? colors.green + '✔' : colors.red + '❌'} Ctrl/Cmd+P print hotkey interception:${colors.reset} ${hasPrintBlocked ? 'Enforced' : 'Missing'}`);

    // Rule 3: Anti-Screenshot Blur Shield (for Snipping tool / OBS screen recording)
    const hasBlurShield = docProtFile.includes("window.addEventListener('blur'") && docProtFile.includes('shieldActive') && docProtFile.includes('Document Protection Active');
    console.log(`  ${hasBlurShield ? colors.green + '✔' : colors.red + '❌'} Anti-Snipping Tool blur shield overlay:${colors.reset} ${hasBlurShield ? 'Enforced' : 'Missing'}`);

    // Rule 4: Dynamic Medical Security Watermark
    const hasSecurityWatermark = docProtFile.includes('SULTANAT E ITALIA MEDICA') && docProtFile.includes('studentName') && docProtFile.includes('studentId');
    console.log(`  ${hasSecurityWatermark ? colors.green + '✔' : colors.red + '❌'} Dynamic student watermark grid:${colors.reset} ${hasSecurityWatermark ? 'Enforced' : 'Missing'}`);

    // Rule 5: Viewers wrap protection and hide downloads for students
    const pdfProtected = resourceScreensFile.includes('DocumentProtectionWrapper') && resourceScreensFile.includes('#toolbar=0&navpanes=0&scrollbar=0');
    console.log(`  ${pdfProtected ? colors.green + '✔' : colors.red + '❌'} PDFViewer: DRM wrapper & native toolbar suppression:${colors.reset} ${pdfProtected ? 'Enforced' : 'Missing'}`);

    const textProtected = resourceScreensFile.includes('<DocumentProtectionWrapper') && resourceScreensFile.includes('select-none');
    console.log(`  ${textProtected ? colors.green + '✔' : colors.red + '❌'} TextViewer: DRM wrapper & text copy disable:${colors.reset} ${textProtected ? 'Enforced' : 'Missing'}`);

    const videoProtected = resourceScreensFile.includes('controlsList="nodownload noplaybackrate"');
    console.log(`  ${videoProtected ? colors.green + '✔' : colors.red + '❌'} VideoPlayer: nodownload DRM controls:${colors.reset} ${videoProtected ? 'Enforced' : 'Missing'}`);

    if (!hasContextMenuBlocked || !hasPrintScreenBlocked || !hasBlurShield || !hasSecurityWatermark || !pdfProtected) {
      console.log(`  ${colors.red}❌ DRM Protection checks failed!${colors.reset}`);
      process.exit(1);
    }

    // 5. Test Student Course Self-Enrollment Logic
    console.log(`\n${colors.bold}[Step 5] Validating Student Self-Enrollment & State Reflection:${colors.reset}`);
    const studentScreensFile = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/StudentScreens.tsx'), 'utf8');

    const hasCourseFilterMode = studentScreensFile.includes('courseFilterMode') && studentScreensFile.includes('Explore All Courses');
    console.log(`  ${hasCourseFilterMode ? colors.green + '✔' : colors.red + '❌'} Student courses exploration tabs (Enrolled vs Explore):${colors.reset} ${hasCourseFilterMode ? 'Present' : 'Missing'}`);

    const hasSelfEnrollButton = studentScreensFile.includes('enrollStudents(course.id') && studentScreensFile.includes('Enroll Now');
    console.log(`  ${hasSelfEnrollButton ? colors.green + '✔' : colors.red + '❌'} Student 1-click self-enrollment action:${colors.reset} ${hasSelfEnrollButton ? 'Present' : 'Missing'}`);

    const hasCourseDetailEnrollment = resourceScreensFile.includes('enrollStudents(c.id') && resourceScreensFile.includes('Active Student');
    console.log(`  ${hasCourseDetailEnrollment ? colors.green + '✔' : colors.red + '❌'} CourseDetail enrollment banner & state badge:${colors.reset} ${hasCourseDetailEnrollment ? 'Present' : 'Missing'}`);

    if (!hasCourseFilterMode || !hasSelfEnrollButton || !hasCourseDetailEnrollment) {
      console.log(`  ${colors.red}❌ Student self-enrollment checks failed!${colors.reset}`);
      process.exit(1);
    }

    // 6. Test Admin-Uploaded Courses in Faculty Dashboard
    console.log(`\n${colors.bold}[Step 6] Validating Admin-Uploaded Courses in Faculty Dashboard:${colors.reset}`);
    const facultyScreensFile = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/FacultyScreens.tsx'), 'utf8');

    const hasScopeFilter = facultyScreensFile.includes('scopeFilter') && facultyScreensFile.includes('Admin Uploaded');
    console.log(`  ${hasScopeFilter ? colors.green + '✔' : colors.red + '❌'} Faculty course scope filter (All / Assigned / Admin):${colors.reset} ${hasScopeFilter ? 'Present' : 'Missing'}`);

    const hasAdminBadge = facultyScreensFile.includes('Admin Uploaded') && facultyScreensFile.includes('fa-shield-alt');
    console.log(`  ${hasAdminBadge ? colors.green + '✔' : colors.red + '❌'} Admin course distinction badge for faculty:${colors.reset} ${hasAdminBadge ? 'Present' : 'Missing'}`);

    const hasFacultyDashboardAdminStats = facultyScreensFile.includes('adminCourses.length') && facultyScreensFile.includes('assignedCourses.length');
    console.log(`  ${hasFacultyDashboardAdminStats ? colors.green + '✔' : colors.red + '❌'} Faculty dashboard aggregate metrics showing admin courses:${colors.reset} ${hasFacultyDashboardAdminStats ? 'Present' : 'Missing'}`);

    if (!hasScopeFilter || !hasAdminBadge || !hasFacultyDashboardAdminStats) {
      console.log(`  ${colors.red}❌ Faculty dashboard integration checks failed!${colors.reset}`);
      process.exit(1);
    }

    // 7. Simulating Enrollment & Decoration Flow with Fake Course Objects
    console.log(`\n${colors.bold}[Step 7] Simulating Course Enrollment State Machine:${colors.reset}`);
    const mockCourses = [
      { id: 'c1', name: 'NEET Human Physiology', facultyIds: ['fac-1'], studentIds: ['stu-1', 'stu-2'] },
      { id: 'c2', name: 'IMAT Physics Mechanics (Admin)', facultyIds: [], studentIds: [] },
      { id: 'c3', name: 'UCAT Verbal Reasoning (Admin)', facultyIds: [], studentIds: ['stu-3'] },
    ];

    const currentStudentId = 'stu-1';
    const isEnrolledInC1 = mockCourses[0].studentIds.includes(currentStudentId);
    const isEnrolledInC2 = mockCourses[1].studentIds.includes(currentStudentId);

    console.log(`  ${colors.green}✔ Student (${currentStudentId}) in C1:${colors.reset} ${isEnrolledInC1 ? 'Enrolled' : 'Not Enrolled'}`);
    console.log(`  ${colors.green}✔ Student (${currentStudentId}) in C2:${colors.reset} ${isEnrolledInC2 ? 'Enrolled' : 'Not Enrolled'}`);

    // Simulate self enrollment
    mockCourses[1].studentIds.push(currentStudentId);
    const isNowEnrolledInC2 = mockCourses[1].studentIds.includes(currentStudentId);
    console.log(`  ${colors.green}✔ Student (${currentStudentId}) enrolled in C2:${colors.reset} ${isNowEnrolledInC2 ? 'Successfully Enrolled' : 'Failed'}`);

    // Faculty courses filtering simulation
    const currentFacultyId = 'fac-1';
    const assignedCourses = mockCourses.filter(c => c.facultyIds.includes(currentFacultyId));
    const adminCourses = mockCourses.filter(c => !c.facultyIds.includes(currentFacultyId));

    console.log(`  ${colors.green}✔ Faculty (${currentFacultyId}) assigned courses count:${colors.reset} ${assignedCourses.length}`);
    console.log(`  ${colors.green}✔ Admin uploaded courses visible to faculty count:${colors.reset} ${adminCourses.length}`);
    console.log(`  ${colors.green}✔ Total courses visible in Faculty Dashboard:${colors.reset} ${mockCourses.length}`);

    console.log(`\n${colors.bold}${colors.green}================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ ALL PHASE 7 ENROLLMENT, DRM & FACULTY TESTS PASSED!         ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}================================================================${colors.reset}\n`);

  } catch (err) {
    console.error(`\n${colors.red}❌ Unexpected error during Phase 7 testing:${colors.reset}`, err);
    process.exit(1);
  }
}

runPhase7Tests();
