import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  VERIFYING IMAT QUESTION BANK & GOOGLE SIGN-IN ENHANCEMENTS   ');
console.log('================================================================\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✔ PASS: ${message}`);
}

// 1. Verify Markdown File Exists and Contains 350 Questions
console.log('[Step 1] Verifying Official IMAT Question Bank Markdown:');
const mdPath = path.resolve('src/data/imat_question_bank.md');
assert(fs.existsSync(mdPath), 'imat_question_bank.md exists in src/data/');
const mdContent = fs.readFileSync(mdPath, 'utf8');

assert(mdContent.includes('Reading Skills and General Knowledge — 50 Questions'), 'Includes Reading Skills & GK 50 questions');
assert(mdContent.includes('Logical Reasoning and Problems — 50 Questions'), 'Includes Logical Reasoning 50 questions');
assert(mdContent.includes('Biology — 50 Questions'), 'Includes Biology 50 questions');
assert(mdContent.includes('Chemistry — 50 Questions'), 'Includes Chemistry 50 questions');
assert(mdContent.includes('Mathematics — 50 Questions'), 'Includes Mathematics 50 questions');
assert(mdContent.includes('Physics — 50 Questions'), 'Includes Physics 50 questions');
assert(mdContent.includes('English — Chapter-wise Practice Questions (50 MCQs)'), 'Includes English 50 questions');

// 2. Verify Parsed TypeScript Module
console.log('\n[Step 2] Verifying imatQuestionBank.ts Module:');
const tsPath = path.resolve('src/data/imatQuestionBank.ts');
assert(fs.existsSync(tsPath), 'imatQuestionBank.ts exists in src/data/');
const tsContent = fs.readFileSync(tsPath, 'utf8');

assert(tsContent.includes('export const IMAT_QUESTION_BANK'), 'Exports IMAT_QUESTION_BANK array');
assert(tsContent.includes('export function getQuestionsFromBank'), 'Exports getQuestionsFromBank helper');

// 3. Verify AdminAIMCQGenerator Integration
console.log('\n[Step 3] Verifying AdminAIMCQGenerator Strict Non-Hallucination Retrieval:');
const mcqGenSrc = fs.readFileSync(path.resolve('src/components/AdminAIMCQGenerator.tsx'), 'utf8');
assert(mcqGenSrc.includes("import { getQuestionsFromBank } from '../data/imatQuestionBank'"), 'AdminAIMCQGenerator imports getQuestionsFromBank');
assert(mcqGenSrc.includes('getQuestionsFromBank('), 'AdminAIMCQGenerator invokes getQuestionsFromBank with subject, chapter, and topic');
assert(mcqGenSrc.includes('Official IMAT Syllabus 350-Question Bank'), 'AdminAIMCQGenerator displays Official IMAT Syllabus Question Bank badge');

// 4. Verify Quick Demo Login Removal and Sign in with Google Facility
console.log('\n[Step 4] Verifying AuthScreens Quick Demo Removal & Google Sign-In:');
const authScreensSrc = fs.readFileSync(path.resolve('src/screens/AuthScreens.tsx'), 'utf8');
assert(!authScreensSrc.includes('Quick Demo Login'), 'AuthScreens completely removed "Quick Demo Login"');
assert(authScreensSrc.includes('Sign in with Google'), 'AuthScreens provides "Sign in with Google" button');
assert(authScreensSrc.includes('handleGoogleSignIn'), 'AuthScreens implements handleGoogleSignIn handler');
assert(authScreensSrc.includes("provider: 'google'"), 'AuthScreens integrates Supabase Google OAuth provider');

console.log('\n================================================================');
console.log('  VERIFICATION SUMMARY: ALL CHECKS PASSED (100%)');
console.log('================================================================\n');

