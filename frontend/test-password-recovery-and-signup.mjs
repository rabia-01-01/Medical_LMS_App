import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(import.meta.dirname, '..');
const userAccessService = require(path.join(rootDir, 'backend', 'services', 'userAccessService.js'));

const storePath = path.join(rootDir, 'backend', 'data', 'user-access.json');
const hadExistingStore = fs.existsSync(storePath);
const existingStoreBackup = hadExistingStore ? fs.readFileSync(storePath, 'utf8') : null;

console.log('================================================================');
console.log('  PASSWORD RECOVERY, SIGN-UP & ONE-TIME ADMIN SETUP TESTS       ');
console.log('================================================================\n');

try {
  // 1. Self-register student & verify initial login works, wrong password fails
  const studentEmail = `forgot.student.${Date.now()}@example.com`;
  const regStudent = userAccessService.registerSelfUser({
    name: 'Recovery Student',
    email: studentEmail,
    password: 'oldPassword123',
    role: 'student',
  });
  assert.equal(regStudent.statusCode, 201);
  assert.equal(regStudent.user.status, 'pending');
  assert.equal('passwordHash' in regStudent.user, false, 'Safe user must strip passwordHash');

  const okOldLogin = userAccessService.authenticateUser(studentEmail, 'oldPassword123');
  assert.equal(okOldLogin.statusCode, 200);
  const badLogin = userAccessService.authenticateUser(studentEmail, 'wrongPassword');
  assert.equal(badLogin.statusCode, 401);
  console.log('  [PASS] Registered user authenticates with valid password and fails with wrong password');

  // 2. Request password reset auto-generates 1-time code for registered email and verifies update
  const missingReq = userAccessService.requestPasswordReset('nobody.missing@example.com');
  assert.equal(missingReq.statusCode, 404, 'Unknown email should return 404');

  const reqReset = userAccessService.requestPasswordReset(studentEmail);
  assert.equal(reqReset.statusCode, 200);
  assert.equal(reqReset.requested, true);
  assert.match(reqReset.resetCode, /^[A-F0-9]{4}-[A-F0-9]{4}$/, 'Forgot password auto-generates formatted 1-time reset code');
  const statusAfterReq = userAccessService.getUserStatus({ id: regStudent.user.id });
  assert.equal(statusAfterReq.passwordResetRequested, true, 'User status flags pending reset request for admin');
  assert.equal(statusAfterReq.hasActiveResetCode, true, 'User status records active reset code');
  assert.equal('resetCodeHash' in statusAfterReq, false, 'Safe user never exposes resetCodeHash');

  const selfComplete = userAccessService.completePasswordResetWithCode({
    email: studentEmail,
    code: reqReset.resetCode,
    newPassword: 'selfUpdatedPassword1',
  });
  assert.equal(selfComplete.statusCode, 200);
  assert.equal(userAccessService.authenticateUser(studentEmail, 'oldPassword123').statusCode, 401);
  assert.equal(userAccessService.authenticateUser(studentEmail, 'selfUpdatedPassword1').statusCode, 200);
  console.log('  [PASS] Forgot password auto-generates 1-time code and lets user update password safely');

  // 3. Non-admin cannot issue reset code
  const nonAdmin = userAccessService.verifyAdminActor({ adminEmail: studentEmail });
  assert.equal(nonAdmin, null);
  const forbiddenIssue = userAccessService.issuePasswordResetCode(regStudent.user.id, nonAdmin);
  assert.equal(forbiddenIssue.statusCode, 403);

  // 4. First-time Admin registers once, then closes & exercises full admin authority to issue reset code
  assert.equal(userAccessService.isAdminRegistrationOpen(), true);
  const adminEmail = `first.admin.rec.${Date.now()}@example.com`;
  const firstAdmin = userAccessService.registerSelfUser({
    name: 'First Recovery Admin',
    email: adminEmail,
    password: 'adminPassword123',
    role: 'admin',
  });
  assert.equal(firstAdmin.statusCode, 201);
  assert.equal(userAccessService.isAdminRegistrationOpen(), false);
  const secondAdmin = userAccessService.registerSelfUser({
    name: 'Second Admin Blocked',
    email: `second.admin.rec.${Date.now()}@example.com`,
    password: 'adminPassword123',
    role: 'admin',
  });
  assert.equal(secondAdmin.statusCode, 403);
  console.log('  [PASS] One-time Admin registration works once and blocks subsequent Admin signups');

  const adminActor = userAccessService.verifyAdminActor({ adminEmail });
  assert.ok(adminActor);

  // Issue reset code, test invalid code & complete valid reset
  const issued = userAccessService.issuePasswordResetCode(regStudent.user.id, adminActor);
  assert.equal(issued.statusCode, 200);
  assert.match(issued.resetCode, /^[A-F0-9]{4}-[A-F0-9]{4}$/);
  assert.equal(issued.user.hasActiveResetCode, true);

  const wrongCodeRes = userAccessService.completePasswordResetWithCode({
    email: studentEmail,
    code: '0000-0000',
    newPassword: 'newPassword999',
  });
  assert.equal(wrongCodeRes.statusCode, 400);

  const completeRes = userAccessService.completePasswordResetWithCode({
    email: studentEmail,
    code: issued.resetCode,
    newPassword: 'newPassword999',
  });
  assert.equal(completeRes.statusCode, 200);
  assert.equal(completeRes.user.passwordResetRequested, false);
  assert.equal(completeRes.user.hasActiveResetCode, false);

  // Old password rejected, new password works!
  assert.equal(userAccessService.authenticateUser(studentEmail, 'oldPassword123').statusCode, 401);
  assert.equal(userAccessService.authenticateUser(studentEmail, 'newPassword999').statusCode, 200);
  console.log('  [PASS] One-time Admin reset code lets forgotten-password user set new password & sign in');

  // Reused reset code rejected
  const reuseRes = userAccessService.completePasswordResetWithCode({
    email: studentEmail,
    code: issued.resetCode,
    newPassword: 'anotherPassword',
  });
  assert.equal(reuseRes.statusCode, 400);

  // Brute-force lockout after 5 wrong attempts
  const secondIssued = userAccessService.issuePasswordResetCode(regStudent.user.id, adminActor);
  assert.equal(secondIssued.statusCode, 200);
  for (let i = 0; i < 5; i += 1) {
    const attempt = userAccessService.completePasswordResetWithCode({
      email: studentEmail,
      code: 'BAD0-CODE',
      newPassword: 'hackedPassword',
    });
    assert.equal(attempt.statusCode, 400);
  }
  const afterLockout = userAccessService.completePasswordResetWithCode({
    email: studentEmail,
    code: secondIssued.resetCode,
    newPassword: 'validAfterLockout',
  });
  assert.equal(afterLockout.statusCode, 400, 'Reset code must invalidate after 5 failed attempts');
  console.log('  [PASS] Single-use reset code invalidation & 5-attempt brute-force lockout verified');

  // Admin direct password reset
  const directReset = userAccessService.adminResetUserPassword(
    regStudent.user.id,
    'adminAssignedPass1',
    adminActor
  );
  assert.equal(directReset.statusCode, 200);
  assert.equal(userAccessService.authenticateUser(studentEmail, 'adminAssignedPass1').statusCode, 200);
  console.log('  [PASS] Admin direct password reset updates login credentials');

  // 5. Self-service Delete Account requires valid email + password and deletes the user
  const wrongDelete = userAccessService.deleteOwnAccount(studentEmail, 'wrongPassword!');
  assert.equal(wrongDelete.statusCode, 401, 'Delete account must reject wrong password');
  const okDelete = userAccessService.deleteOwnAccount(studentEmail, 'adminAssignedPass1');
  assert.equal(okDelete.statusCode, 200);
  assert.equal(userAccessService.getUserStatus({ id: regStudent.user.id }), null, 'Deleted user must no longer exist');
  console.log('  [PASS] Delete Account verifies email + password and permanently removes user');

  // 6. Suspending Admin account deletes the admin and re-opens first-time Admin setup if none left
  const suspendAdminRes = userAccessService.suspendAdminAccount(firstAdmin.user.id, adminActor);
  assert.equal(suspendAdminRes.statusCode, 200);
  assert.equal(suspendAdminRes.deletedSelf, true);
  assert.equal(suspendAdminRes.adminRegistrationOpen, true, 'Re-opens 1-time Admin registration when self-registered admin is deleted');
  assert.equal(userAccessService.getUserStatus({ id: firstAdmin.user.id }), null, 'Suspended admin must be deleted');
  console.log('  [PASS] Admin Suspend deletes the admin account and signals login reset');

  // 7. Static Frontend Verification (Login Sign Up button, Delete Account, Admin Suspend, One-Time Setup, Password Recovery)
  const authScreensSrc = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'screens', 'AuthScreens.tsx'), 'utf8');
  const adminScreensSrc = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'screens', 'AdminScreens.tsx'), 'utf8');
  const authCtxSrc = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'context', 'AuthContext.tsx'), 'utf8');
  const appSrc = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'App.tsx'), 'utf8');
  const routesSrc = fs.readFileSync(path.join(rootDir, 'backend', 'route', 'userAccessRoutes.js'), 'utf8');

  assert.ok(authScreensSrc.includes('<span>Sign Up</span>'), 'LoginScreen includes a clear Sign Up button');
  assert.ok(authScreensSrc.includes('<span>Delete Account</span>') && authScreensSrc.includes('handleDeleteOwnAccount'), 'LoginScreen provides separate Delete Account email+password flow');
  assert.ok(authScreensSrc.includes('Admin Registration') && authScreensSrc.includes('showAdminSetup'), 'LoginScreen keeps conditional one-time Admin Registration button');
  assert.ok(authScreensSrc.includes('Use Reset Code') && authScreensSrc.includes('completeBackendPasswordReset'), 'Forgot Password modal supports reset codes');
  assert.ok(authCtxSrc.includes('PASSWORD_RECOVERY') && authCtxSrc.includes('completePasswordRecovery'), 'AuthContext supports Supabase PASSWORD_RECOVERY event');
  assert.ok(appSrc.includes('isPasswordRecovery') && appSrc.includes('Set New Password'), 'App renders Supabase password recovery modal');
  assert.ok(adminScreensSrc.includes('suspendAdminAccount') && adminScreensSrc.includes('logout()'), 'AdminUsers deletes admin account on Suspend and navigates to login');
  assert.ok(adminScreensSrc.includes('Generate 1-Time Reset Code') && adminScreensSrc.includes('Reset Requested'), 'AdminUsers exposes password recovery controls');
  assert.ok(routesSrc.includes('/forgot-password') && routesSrc.includes('/reset-password') && routesSrc.includes('/:id/reset-code') && routesSrc.includes('/delete-account') && routesSrc.includes('/:id/suspend-admin'), 'Backend mounts password recovery, self-delete, and admin-suspend routes');
  console.log('  [PASS] Frontend Sign-Up CTA, Delete Account modal, Admin Suspend-Delete, and Password Recovery UI verified');

  console.log('\nSummary: All password recovery, Sign-Up button, and one-time Admin registration tests passed.');
} finally {
  if (hadExistingStore && existingStoreBackup !== null) {
    fs.writeFileSync(storePath, existingStoreBackup, 'utf8');
  } else if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
}

