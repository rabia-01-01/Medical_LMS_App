import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

console.log('================================================================');
console.log('  FRONTEND OPTIMIZED RBAC & ROLE-BASED RATE LIMIT VERIFICATION  ');
console.log('================================================================\n');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-rbac-rl-'));

try {
  // Compile pure TypeScript modules cleanly into temp ESM files for runtime verification
  const rbacOut = path.join(tempDir, 'rbac.mjs');
  const rateOut = path.join(tempDir, 'rateLimiter.mjs');

  await Promise.all([
    esbuild.build({
      entryPoints: [path.resolve('src/features/auth/rbac.ts')],
      bundle: true,
      format: 'esm',
      platform: 'neutral',
      outfile: rbacOut,
    }),
    esbuild.build({
      entryPoints: [path.resolve('src/features/auth/rateLimiter.ts')],
      bundle: true,
      format: 'esm',
      platform: 'neutral',
      outfile: rateOut,
    }),
  ]);

  const rbac = await import(pathToFileURL(rbacOut).href);
  const rl = await import(pathToFileURL(rateOut).href);

  // =========================================================================
  // 1. OPTIMIZED O(1) FRONTEND RBAC TESTS
  // =========================================================================
  console.log('[Step 1] Testing O(1) Role Capabilities & Screen Access Policies:');

  const adminUser = { id: 'u-adm', role: 'admin', status: 'active' };
  const facultyUser = {
    id: 'u-fac',
    role: 'faculty',
    status: 'active',
    accessPermissions: { resources: true, branch: true, courses: true, quizzes: true, announcements: true, notifications: true },
  };
  const studentUser = {
    id: 'u-stu',
    role: 'student',
    status: 'active',
    accessPermissions: { resources: true, branch: true, courses: true, quizzes: true, announcements: true, notifications: true },
  };
  const consultantUser = {
    id: 'u-con',
    role: 'consultant',
    status: 'active',
    accessPermissions: { resources: false, branch: false, courses: false, quizzes: false, announcements: false, notifications: true },
  };

  const admSnap = rbac.buildRbacSnapshot(adminUser);
  const facSnap = rbac.buildRbacSnapshot(facultyUser);
  const stuSnap = rbac.buildRbacSnapshot(studentUser);
  const conSnap = rbac.buildRbacSnapshot(consultantUser);

  // Role-specific capabilities
  assert.equal(admSnap.can('users:approve'), true, 'Admin can approve users');
  assert.equal(admSnap.can('courses:enroll_others'), true, 'Admin can enroll other students');
  assert.equal(admSnap.can('resources:delete'), true, 'Admin can delete resources');
  assert.equal(admSnap.can('audit:view'), true, 'Admin can view audit logs');

  assert.equal(facSnap.can('quizzes:create'), true, 'Faculty can create quizzes');
  assert.equal(facSnap.can('resources:upload'), true, 'Faculty can upload resources');
  assert.equal(facSnap.can('ai:mcq_generate'), true, 'Faculty can generate AI MCQs');
  assert.equal(facSnap.can('courses:enroll_others'), false, 'Faculty must NOT enroll students');
  assert.equal(facSnap.can('resources:delete'), false, 'Faculty must NOT delete resources');
  assert.equal(facSnap.can('users:manage'), false, 'Faculty must NOT manage users');
  assert.equal(facSnap.can('audit:view'), false, 'Faculty must NOT view audit logs');

  assert.equal(stuSnap.can('quizzes:take'), true, 'Student can take quizzes');
  assert.equal(stuSnap.can('courses:self_enroll'), true, 'Student can self-enroll');
  assert.equal(stuSnap.can('ai:chatbot'), true, 'Student can access AI chatbot');
  assert.equal(stuSnap.can('ai:mcq_generate'), false, 'Student must NOT access AI MCQ generator');
  assert.equal(stuSnap.can('resources:upload'), false, 'Student must NOT upload resources');

  assert.equal(conSnap.can('consultancy:manage_pipeline'), true, 'Consultant can manage consultancy pipeline');
  assert.equal(conSnap.can('consultancy:verify_docs'), true, 'Consultant can verify docs');
  assert.equal(conSnap.can('quizzes:take'), false, 'Consultant cannot take quizzes');
  assert.equal(conSnap.can('courses:view'), false, 'Consultant cannot access academic courses');

  // Cross-role screen protection (even for non-module admin/faculty screens)
  assert.equal(stuSnap.canOpenScreen('users').allowed, false, 'Student denied admin users route');
  assert.equal(stuSnap.canOpenScreen('add-user').allowed, false, 'Student denied admin add-user route');
  assert.equal(stuSnap.canOpenScreen('audit-logs').allowed, false, 'Student denied admin audit-logs route');
  assert.equal(stuSnap.canOpenScreen('settings').allowed, false, 'Student denied admin settings route');
  assert.equal(stuSnap.canOpenScreen('create-quiz').allowed, false, 'Student denied faculty create-quiz route');
  assert.equal(facSnap.canOpenScreen('users').allowed, false, 'Faculty denied admin users route');
  assert.equal(facSnap.canOpenScreen('settings').allowed, false, 'Faculty denied admin settings route');
  assert.equal(facSnap.canOpenScreen('departments').allowed, true, 'Faculty allowed read-only departments/batches screen');
  assert.equal(conSnap.canOpenScreen('departments').allowed, false, 'Consultant denied batches screen');
  assert.equal(admSnap.canOpenScreen('active-quiz').allowed, false, 'Admin restricted from student live quiz execution route');
  assert.equal(stuSnap.canOpenScreen('active-quiz').allowed, true, 'Student allowed live active-quiz route');
  console.log('  ✔ PASS: Role capability sets and cross-role route policies verified for all 4 roles');

  // Granular Admin permission toggles & pending/suspended enforcement
  console.log('\n[Step 2] Testing Pending/Suspended Blocking & Granular Module Permissions:');
  const pendingFaculty = { ...facultyUser, status: 'pending' };
  const pendingSnap = rbac.buildRbacSnapshot(pendingFaculty);
  assert.equal(pendingSnap.isApproved, false, 'Pending account rejected by RBAC snapshot');
  assert.equal(pendingSnap.can('courses:view'), false, 'Pending faculty denied courses capability');
  assert.equal(pendingSnap.canOpenScreen('courses').allowed, false, 'Pending faculty blocked from courses route');
  assert.ok(pendingSnap.navItems.some((item) => item.module && item.locked === true), 'Pending faculty nav items mark locked modules');

  const restrictedStudent = {
    id: 'u-stu-partial',
    role: 'student',
    status: 'active',
    accessPermissions: {
      resources: false,
      branch: false,
      courses: true,
      quizzes: true,
      announcements: false,
      notifications: true,
    },
  };
  const partialSnap = rbac.buildRbacSnapshot(restrictedStudent);
  assert.equal(partialSnap.hasModule('courses'), true, 'Student has courses permission');
  assert.equal(partialSnap.hasModule('resources'), false, 'Student resources permission disabled');
  assert.equal(partialSnap.canOpenScreen('courses').allowed, true, 'Courses route allowed');
  assert.equal(partialSnap.canOpenScreen('resources').allowed, false, 'Resources route denied when module=false');
  assert.equal(partialSnap.canOpenScreen('resource-view').allowed, true, 'Course-attached resource viewer allowed via anyOfModules=[resources,courses]');
  assert.equal(partialSnap.canOpenScreen('departments').allowed, false, 'Departments route denied when branch=false');
  assert.equal(partialSnap.canOpenScreen('announcements').allowed, false, 'Announcements route denied when announcements=false');
  const resNavItem = partialSnap.navItems.find((item) => item.id === 'resources');
  const crsNavItem = partialSnap.navItems.find((item) => item.id === 'courses');
  assert.equal(resNavItem?.locked, true, 'Locked bottom-nav badge shown for disabled resources tab');
  assert.equal(crsNavItem?.locked, false, 'Enabled courses tab not locked');
  console.log('  ✔ PASS: Pending accounts, module locks, and nav locked badges enforced cleanly');

  // =========================================================================
  // 2. ROLE-BASED RATE LIMITING RUNTIME TESTS
  // =========================================================================
  console.log('\n[Step 3] Testing Role-Based Sliding-Window & Burst Rate Limiting:');
  rl.clearAllRateLimits();
  let now = 1_700_000_000_000;

  // Student community:post -> maxRequests=4 / 60s, minIntervalMs=4000
  const sPost1 = rl.consumeRateLimit('community:post', 'student', 'stu-1', now);
  assert.equal(sPost1.allowed, true, 'Student post #1 allowed');
  assert.equal(sPost1.remaining, 3);

  // Double-click inside 4s burst cooldown should be blocked immediately
  const sPostBurst = rl.consumeRateLimit('community:post', 'student', 'stu-1', now + 500);
  assert.equal(sPostBurst.allowed, false, 'Student rapid double-click blocked by burst cooldown');
  assert.equal(sPostBurst.reason, 'cooldown');
  assert.ok(sPostBurst.retryAfterSeconds >= 3);

  // Consume remaining 3 student posts spaced 5s apart
  for (let i = 1; i <= 3; i++) {
    const res = rl.consumeRateLimit('community:post', 'student', 'stu-1', now + i * 5000);
    assert.equal(res.allowed, true, `Student post #${i + 1} allowed after cooldown`);
  }

  // 5th post within 60s hits student window limit (4/min)
  const sPost5 = rl.consumeRateLimit('community:post', 'student', 'stu-1', now + 20_000);
  assert.equal(sPost5.allowed, false, 'Student 5th post in 60s blocked by window limit');
  assert.equal(sPost5.reason, 'window_exceeded');

  // Different actor bucket for another student stays unaffected
  const otherStudentPost = rl.consumeRateLimit('community:post', 'student', 'stu-2', now + 20_000);
  assert.equal(otherStudentPost.allowed, true, 'Rate limits are isolated per actor');

  // After sliding window expires (+61s), student #1 can post again
  const sPostReset = rl.consumeRateLimit('community:post', 'student', 'stu-1', now + 61_000);
  assert.equal(sPostReset.allowed, true, 'Student quota resets once sliding window elapses');

  // Higher-tier role quota comparison: Faculty vs Student vs Admin on community:post
  const facPolicy = rl.getRoleRateLimitPolicy('community:post', 'faculty');
  const stuPolicy = rl.getRoleRateLimitPolicy('community:post', 'student');
  const admPolicy = rl.getRoleRateLimitPolicy('community:post', 'admin');
  assert.ok(admPolicy.maxRequests > facPolicy.maxRequests && facPolicy.maxRequests > stuPolicy.maxRequests, 'Quotas scale cleanly by role tier (admin > faculty > student)');

  // Role forbidden in rate limiter (e.g., student/consultant trying ai:mcq_generate or admin:bulk_action)
  const stuMcq = rl.consumeRateLimit('ai:mcq_generate', 'student', 'stu-1', now);
  assert.equal(stuMcq.allowed, false);
  assert.equal(stuMcq.reason, 'role_forbidden');
  assert.equal(stuMcq.limit, 0);

  const conUpload = rl.consumeRateLimit('content:upload_resource', 'consultant', 'con-1', now);
  assert.equal(conUpload.allowed, false);
  assert.equal(conUpload.reason, 'role_forbidden');

  // Faculty vs Admin quotas for AI MCQ Generator
  for (let i = 0; i < 8; i++) {
    const r = rl.consumeRateLimit('ai:mcq_generate', 'faculty', 'fac-1', now + i * 3_500);
    assert.equal(r.allowed, true, `Faculty MCQ generation #${i + 1}/8 allowed`);
  }
  const facMcq9 = rl.consumeRateLimit('ai:mcq_generate', 'faculty', 'fac-1', now + 8 * 3_500);
  assert.equal(facMcq9.allowed, false, 'Faculty 9th AI generation in 60s throttled');
  assert.equal(facMcq9.reason, 'window_exceeded');

  const admMcq9 = rl.consumeRateLimit('ai:mcq_generate', 'admin', 'adm-1', now + 8 * 3_500);
  assert.equal(admMcq9.allowed, true, 'Admin has higher 20/min AI MCQ quota');

  // Brute-force login lockout & reset
  for (let i = 0; i < 5; i++) {
    const attempt = rl.consumeRateLimit('auth:login', 'guest', 'victim@edu.in', now + i * 100);
    assert.equal(attempt.allowed, true);
  }
  const brute6 = rl.consumeRateLimit('auth:login', 'guest', 'victim@edu.in', now + 1000);
  assert.equal(brute6.allowed, false, '6th failed login within 60s blocked');
  const penaltyCheck = rl.getRateLimitStatus('auth:login', 'guest', 'victim@edu.in', now + 5_000);
  assert.equal(penaltyCheck.allowed, false);
  assert.equal(penaltyCheck.reason, 'blocked', 'Explicit lockout persists through blockDurationMs');
  rl.resetRateLimit('auth:login', 'guest', 'victim@edu.in');
  const clearedLogin = rl.getRateLimitStatus('auth:login', 'guest', 'victim@edu.in', now + 5_000);
  assert.equal(clearedLogin.allowed, true, 'Successful authentication clears login throttle bucket');
  console.log('  ✔ PASS: Role-tiered sliding windows, burst cooldowns, brute-force lockouts & actor isolation verified');

  // =========================================================================
  // 3. FRONTEND SCREEN & COMPONENT WIRING CHECKS
  // =========================================================================
  console.log('\n[Step 4] Verifying Frontend UI Integration & Privilege Boundaries:');
  const appSrc = fs.readFileSync('src/App.tsx', 'utf8');
  const navSrc = fs.readFileSync('src/components/Navigation.tsx', 'utf8');
  const navCfgSrc = fs.readFileSync('src/config/navigation.ts', 'utf8');
  const authSrc = fs.readFileSync('src/screens/AuthScreens.tsx', 'utf8');
  const adminSrc = fs.readFileSync('src/screens/AdminScreens.tsx', 'utf8');
  const facultySrc = fs.readFileSync('src/screens/FacultyScreens.tsx', 'utf8');
  const studentSrc = fs.readFileSync('src/screens/StudentScreens.tsx', 'utf8');
  const resourceSrc = fs.readFileSync('src/screens/ResourceScreens.tsx', 'utf8');
  const quizSrc = fs.readFileSync('src/screens/QuizScreens.tsx', 'utf8');
  const mcqSrc = fs.readFileSync('src/components/AdminAIMCQGenerator.tsx', 'utf8');
  const chatbotSrc = fs.readFileSync('src/components/StudentAIChatbot.tsx', 'utf8');
  const creatorSrc = fs.readFileSync('src/features/assessments/AssessmentCreator.tsx', 'utf8');
  const consultantSrc = fs.readFileSync('src/screens/ConsultantScreens.tsx', 'utf8');

  assert.ok(navCfgSrc.includes('ROLE_NAV_ITEMS') && navCfgSrc.includes('consultantNavItems'), 'navigation.ts unifies all 4 role navConfigs');
  assert.ok(appSrc.includes('useRbac(') && appSrc.includes('rbac.canOpenScreen'), 'App.tsx enforces unified RBAC route policy evaluation');
  assert.ok(!appSrc.includes("case 'departments': return <AdminDepartments") || appSrc.indexOf("case 'departments': return <DepartmentsScreen") !== -1, 'App.tsx restricts Faculty to read-only DepartmentsScreen');
  assert.ok(navSrc.includes('RateLimitAlert') && navSrc.includes('RoleGuard') && navSrc.includes('item.locked'), 'Navigation.tsx exports RateLimitAlert, RoleGuard, and locked nav badges');
  assert.ok(authSrc.includes("'auth:login'") && authSrc.includes("'auth:register'") && authSrc.includes("'auth:google'") && authSrc.includes("'auth:forgot_password'") && authSrc.includes("'approval:status_check'"), 'AuthScreens rate limits login, register, Google auth, forgot password & approval polling');
  assert.ok(adminSrc.includes("'admin:bulk_action'") && adminSrc.includes("'comms:announcement'") && adminSrc.includes("'comms:notification'") && adminSrc.includes("'community:post'"), 'AdminScreens rate limits bulk actions, announcements, notifications & community posts');
  assert.ok(facultySrc.includes("'content:upload_resource'") && facultySrc.includes("'comms:announcement'") && facultySrc.includes("'community:post'"), 'FacultyScreens rate limits uploads, announcements & community posts');
  assert.ok(studentSrc.includes("useRbac()") && studentSrc.includes("'community:post'") && studentSrc.includes("rbac.can('calendar:manage')"), 'StudentScreens enforces useRbac and community rate limiting');
  assert.ok(resourceSrc.includes("rbac.can('courses:enroll_others')") && resourceSrc.includes('{canEnrollOthers && ('), 'CourseDetail restricts student enrollment management strictly to Admin');
  assert.ok(quizSrc.includes("rbac.can('quizzes:take')") && creatorSrc.includes("'content:create_quiz'"), 'QuizScreens and AssessmentCreator enforce RBAC capabilities and quiz creation throttling');
  assert.ok(mcqSrc.includes("rbac.can('ai:mcq_generate')") && mcqSrc.includes("'ai:mcq_generate'") && mcqSrc.includes('<RateLimitAlert'), 'AdminAIMCQGenerator enforces role capability & rate limit quota');
  assert.ok(chatbotSrc.includes("rbac.can('ai:chatbot')") && chatbotSrc.includes("'ai:chatbot'") && chatbotSrc.includes('<RateLimitAlert'), 'StudentAIChatbot enforces chatbot capability & rate limit quota');
  assert.ok(consultantSrc.includes('useRbac()') && consultantSrc.includes("rbac.can('notifications:view')"), 'ConsultantScreens uses memoized useRbac()');

  console.log('  ✔ PASS: All UI integrations & privilege boundaries verified cleanly');
  console.log('\n================================================================');
  console.log('  SUMMARY: ALL FRONTEND RBAC & RATE-LIMIT CHECKS PASSED (100%)');
  console.log('================================================================\n');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

