import { spawnSync } from 'child_process';
import path from 'path';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const suites = [
  { name: 'Phase 1: Database & Connectivity', script: 'test-phase1.mjs' },
  { name: 'Phase 2: Authentication & Role Hierarchy', script: 'test-phase2.mjs' },
  { name: 'Phase 3: 3-Tier Academic Curriculum', script: 'test-phase3.mjs' },
  { name: 'Phase 4: Learning Resources & Cloud Storage', script: 'test-phase4.mjs' },
  { name: 'Phase 5: Unified Assessment Engine', script: 'test-phase5.mjs' },
  { name: 'Phase 6: Attempts & Performance Analytics', script: 'test-phase6.mjs' },
  { name: 'Phase 7: Enrollment & DRM Protection', script: 'test-phase7.mjs' },
  { name: 'Phase 8: Admin Governance & Fullscreen', script: 'test-phase8.mjs' },
  { name: 'Phase 9: UX Polish & Academic Calendar', script: 'test-phase9.mjs' },
  { name: 'Core Features & Specifications (29 Tests)', script: 'test-features.mjs' },
  { name: 'Backend AI Engine & Express API Routes', script: 'test-backend.mjs' },
];

console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - MASTER AUTOMATED TEST SUITE RUNNER              ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}\n`);

const startTime = Date.now();
let suitesPassed = 0;
let suitesFailed = 0;

for (let i = 0; i < suites.length; i++) {
  const suite = suites[i];
  const stepNum = i + 1;
  process.stdout.write(`[${stepNum}/${suites.length}] Running ${colors.bold}${suite.name}${colors.reset}... `);

  const suiteStart = Date.now();
  const res = spawnSync(process.execPath, [path.resolve(process.cwd(), suite.script)], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);

  if (res.status === 0) {
    suitesPassed++;
    console.log(`${colors.green}✔ PASSED${colors.reset} (${duration}s)`);
  } else {
    suitesFailed++;
    console.log(`${colors.red}❌ FAILED${colors.reset} (${duration}s)`);
    console.log(res.stdout || res.stderr);
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bold}  MASTER TEST EXECUTION SUMMARY                                 ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`  Total Test Suites: ${suites.length}`);
console.log(`  Suites Passed:     ${colors.green}${suitesPassed} / ${suites.length}${colors.reset} (${Math.round((suitesPassed / suites.length) * 100)}%)`);
console.log(`  Suites Failed:     ${suitesFailed === 0 ? colors.green + '0' : colors.red + suitesFailed}${colors.reset}`);
console.log(`  Total Duration:    ${totalDuration}s`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}\n`);

if (suitesFailed === 0) {
  console.log(`${colors.bold}${colors.green}🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY! 100% PRODUCTION READY.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.bold}${colors.red}❌ ${suitesFailed} test suite(s) failed. Check details above.${colors.reset}\n`);
  process.exit(1);
}

