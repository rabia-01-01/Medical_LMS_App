import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const userAccessService = require('./backend/services/userAccessService.js');

console.log('================================================================');
console.log('  ADMIN USER APPROVAL & RESOURCE ACCESS CONTROL VERIFICATION    ');
console.log('================================================================\n');

const storePath = path.resolve('backend/data/user-access.json');
const hadExistingStore = fs.existsSync(storePath);
const existingStoreBackup = hadExistingStore ? fs.readFileSync(storePath, 'utf8') : null;

const createdIds = [];

try {
  // 1. Backend Self-Registration Workflow (Student, Faculty, Consultant)
  console.log('[Step 1] Testing Self-Registration & Pending Default Enforcement:');
  const rolesToTest = ['student', 'faculty', 'consultant'];
  for (const role of rolesToTest) {
    const email = `test.${role}.${Date.now()}@example.com`;
    const reg = userAccessService.registerSelfUser({
      name: `Test ${role}`,
      email,
      password: 'password123',
      role,
    });
    assert.equal(reg.statusCode, 201, `Self-register ${role} should succeed with 201`);
    assert.equal(reg.user.status, 'pending', `${role} must start in pending status`);
    assert.equal(reg.user.batch, '', `${role} batch must start empty before admin assignment`);
    for (const key of ['resources', 'branch', 'courses', 'quizzes', 'announcements', 'notifications']) {
      assert.equal(reg.user.accessPermissions[key], false, `${role} permission '${key}' must be false before admin approval`);
    }
    createdIds.push(reg.user.id);
  }
  console.log('  ✔ PASS: Student, Faculty, and Consultant Agent registrations start pending with all 6 resources locked');

  // Admin self-registration blocked
  const adminReg = userAccessService.registerSelfUser({
    name: 'Rogue Admin',
    email: `rogue.${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin',
  });
  assert.equal(adminReg.statusCode, 400, 'Public registration must reject admin role');
  console.log('  ✔ PASS: Public self-registration blocks admin role');

  // Google first-time sign-in starts pending
  const googleRes = userAccessService.googleSignInOrRegister({
    email: `google.aspirant.${Date.now()}@gmail.com`,
    name: 'Google Aspirant',
    role: 'student',
  });
  assert.equal(googleRes.statusCode, 201);
  assert.equal(googleRes.user.status, 'pending', 'New Google account must start pending until admin allows');
  assert.equal(googleRes.user.accessPermissions.courses, false);
  createdIds.push(googleRes.user.id);
  console.log('  ✔ PASS: First-time Google sign-in starts pending with resources locked');

  // 2. Authorization & Granular Approval by Admin
  console.log('\n[Step 2] Testing Non-Admin Rejection & Admin Selective Resource Allow:');
  const targetStudentId = createdIds[0];

  // Unprivileged caller cannot approve user
  const nonAdminActor = userAccessService.verifyAdminActor({ adminEmail: `google.aspirant@gmail.com` });
  assert.equal(nonAdminActor, null);
  const unauthorizedPatch = userAccessService.updateUserAccess(
    targetStudentId,
    { status: 'active', accessPermissions: userAccessService.FULL_PERMISSIONS },
    nonAdminActor
  );
  assert.equal(unauthorizedPatch.statusCode, 403, 'Non-admin approval attempt must fail with 403');
  console.log('  ✔ PASS: Non-admin approval attempt rejected (403 Forbidden)');

  // Admin caller allows user with selective resources (branch=false, courses=true, quizzes=true, announcements=false, notifications=true, resources=true)
  const adminActor = userAccessService.verifyAdminActor({ adminEmail: 'admin@medical.lms' });
  assert.ok(adminActor, 'Active Admin actor verified');
  const allowedPatch = userAccessService.updateUserAccess(
    targetStudentId,
    {
      status: 'active',
      batch: 'NEET-2026',
      accessPermissions: {
        resources: true,
        branch: false,
        courses: true,
        quizzes: true,
        announcements: false,
        notifications: true,
      },
    },
    adminActor
  );
  assert.equal(allowedPatch.statusCode, 200);
  assert.equal(allowedPatch.user.status, 'active');
  assert.equal(allowedPatch.user.batch, 'NEET-2026');
  assert.equal(allowedPatch.user.accessPermissions.courses, true);
  assert.equal(allowedPatch.user.accessPermissions.quizzes, true);
  assert.equal(allowedPatch.user.accessPermissions.notifications, true);
  assert.equal(allowedPatch.user.accessPermissions.branch, false);
  assert.equal(allowedPatch.user.accessPermissions.announcements, false);
  console.log('  ✔ PASS: Admin allowed student with selective resource permissions (Branch & Announcements remain locked)');

  // Login verifies persisted selective permissions & status
  const fetchedStatus = userAccessService.getUserStatus({ id: targetStudentId });
  assert.equal(fetchedStatus.status, 'active');
  assert.equal(fetchedStatus.accessPermissions.branch, false);
  assert.equal(fetchedStatus.accessPermissions.courses, true);
  console.log('  ✔ PASS: Status endpoint reflects exact Admin approval & resource permissions');

  // 3. Static Verification of Frontend Access Control Wiring
  console.log('\n[Step 3] Testing Frontend Access Control, UI Gates & Route Guards:');
  const accessCtrlSrc = fs.readFileSync('src/features/auth/accessControl.ts', 'utf8');
  const appSrc = fs.readFileSync('src/App.tsx', 'utf8');
  const authScreensSrc = fs.readFileSync('src/screens/AuthScreens.tsx', 'utf8');
  const adminScreensSrc = fs.readFileSync('src/screens/AdminScreens.tsx', 'utf8');
  const studentScreensSrc = fs.readFileSync('src/screens/StudentScreens.tsx', 'utf8');
  const facultyScreensSrc = fs.readFileSync('src/screens/FacultyScreens.tsx', 'utf8');
  const quizScreensSrc = fs.readFileSync('src/screens/QuizScreens.tsx', 'utf8');
  const resourceScreensSrc = fs.readFileSync('src/screens/ResourceScreens.tsx', 'utf8');
  const userAccessApiSrc = fs.readFileSync('src/services/userAccessApi.ts', 'utf8');
  const viteConfigSrc = fs.readFileSync('vite.config.js', 'utf8');

  assert.ok(accessCtrlSrc.includes('export function hasResourceAccess'), 'accessControl exports hasResourceAccess');
  assert.ok(userAccessApiSrc.includes('proxyUnavailable') && userAccessApiSrc.includes('res.status >= 500'), 'userAccessApi treats unreachable Vite proxy 500/503 cleanly as networkError fallback');
  assert.ok(viteConfigSrc.includes('proxyUnavailable: true'), 'vite.config.js handles offline backend proxy errors cleanly without raw 500');
  assert.ok(appSrc.includes('PendingApprovalScreen') && appSrc.includes('isAccountBlocked'), 'App gates unapproved users at PendingApprovalScreen');
  assert.ok(appSrc.includes('SCREEN_PERMISSION_MAP') && appSrc.includes('hasResourceAccess(activeUser'), 'App enforces screen-level resource permissions');
  assert.ok(!authScreensSrc.includes("{ id: 'admin' as UserRole"), 'RegisterScreen disallows self-registration as admin');
  assert.ok(authScreensSrc.includes("id: 'consultant' as RegisterableRole") && authScreensSrc.includes("id: 'faculty' as RegisterableRole"), 'RegisterScreen allows Student, Faculty, Consultant registration');
  assert.ok(authScreensSrc.includes("status: 'pending'"), 'Registrations default to pending approval');
  assert.ok(adminScreensSrc.includes('Allow & Manage User Access') && adminScreensSrc.includes('RESOURCE_ACCESS_MODULES'), 'AdminUsers provides per-user Allow & Resource Access modal');
  assert.ok(studentScreensSrc.includes("hasResourceAccess(user, 'branch')") && studentScreensSrc.includes("hasResourceAccess(user, 'announcements')"), 'StudentScreens enforces branch & announcements permissions');
  assert.ok(facultyScreensSrc.includes("hasResourceAccess(user, 'courses')") && facultyScreensSrc.includes("hasResourceAccess(user, 'quizzes')"), 'FacultyScreens enforces courses & quizzes permissions');
  assert.ok(quizScreensSrc.includes("hasResourceAccess(user, 'quizzes')"), 'QuizScreens enforces quizzes permission');
  assert.ok(resourceScreensSrc.includes("hasResourceAccess(user, 'resources')") && resourceScreensSrc.includes("hasResourceAccess(user, 'courses')"), 'ResourceScreens enforces resources & courses permissions');

  console.log('  ✔ PASS: All UI & route guards verified cleanly');
  console.log('\nSummary: All user approval and resource access checks passed.');
} finally {
  // Restore store state cleanly so workspace stays untouched by test records
  if (hadExistingStore && existingStoreBackup !== null) {
    fs.writeFileSync(storePath, existingStoreBackup, 'utf8');
  } else if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
}

