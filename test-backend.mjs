import assert from 'assert';
import fs from 'fs';
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
};

console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  BACKEND AI SERVICE & API ROUTE VERIFICATION TEST             ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}\n`);

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${description}`);
  } catch (err) {
    console.log(`  ${colors.red}❌ FAIL:${colors.reset} ${description}`);
    console.error(`    ${colors.red}Error:${colors.reset} ${err.message}`);
  }
}

// 1. Check Backend Structure
console.log(`${colors.bold}[Step 1] Verifying Backend Architecture & Server Setup:${colors.reset}`);
const serverPath = path.resolve(process.cwd(), 'backend/server.js');
const routePath = path.resolve(process.cwd(), 'backend/route/aiRoutes.js');

test('Backend server.js exists', () => {
  assert(fs.existsSync(serverPath), 'backend/server.js must exist');
});

test('Backend route/aiRoutes.js exists', () => {
  assert(fs.existsSync(routePath), 'backend/route/aiRoutes.js must exist');
});

const serverContent = fs.readFileSync(serverPath, 'utf8');
const routeContent = fs.readFileSync(routePath, 'utf8');

test('Server imports express, cors, and route correctly', () => {
  assert(serverContent.includes('require("express")'), 'server.js must require express');
  assert(serverContent.includes('require("cors")'), 'server.js must require cors');
  assert(serverContent.includes('./route/aiRoutes'), 'server.js must require ./route/aiRoutes');
  assert(serverContent.includes('app.use("/api/ai"'), 'server.js must mount /api/ai');
});

// 2. Validate aiRoutes.js Route Handler & Prompt Construction
console.log(`\n${colors.bold}[Step 2] Validating Route Handlers & Input Validation:${colors.reset}`);

test('aiRoutes.js defines POST /generate endpoint', () => {
  assert(routeContent.includes('router.post("/generate"'), 'Must define router.post("/generate")');
});

test('Input validation checks subject, chapter, and questionCount bounds (1-25)', () => {
  assert(routeContent.includes('!subject'), 'Must check subject is provided');
  assert(routeContent.includes('!chapter'), 'Must check chapter is provided');
  assert(routeContent.includes('questionCount < 1') || routeContent.includes('questionCount > 25'), 'Must check questionCount between 1 and 25');
  assert(routeContent.includes('status(400)'), 'Must return HTTP 400 for invalid inputs');
});

test('System prompt mandates 5 options (A-E) and natural answer distribution', () => {
  assert(routeContent.includes('5 options'), 'Prompt must require 5 options');
  assert(routeContent.includes('correctAnswer'), 'Prompt must specify correctAnswer');
  assert(routeContent.includes('Distribute correct answers') || routeContent.includes('distribute'), 'Prompt must require distributing answers');
  assert(routeContent.includes('json_object'), 'Prompt must enforce json_object response format');
});

test('Groq model fallback hierarchy is configured', () => {
  assert(routeContent.includes('GROQ_MODELS'), 'Must define fallback models list');
  assert(routeContent.includes('openai/gpt-oss-120b'), 'Must include primary model');
  assert(routeContent.includes('openai/gpt-oss-20b') || routeContent.includes('qwen'), 'Must include fallback models');
});

// 3. Response Schema Validation
console.log(`\n${colors.bold}[Step 3] Validating AI Response Parsing & Normalization Logic:${colors.reset}`);

test('Response validation checks question format (5 options, valid index, explanation)', () => {
  assert(routeContent.includes('options.length === 5'), 'Must validate exactly 5 options');
  assert(routeContent.includes('correctAnswer >= 0') && routeContent.includes('correctAnswer <= 4'), 'Must validate answer index in 0..4');
  assert(routeContent.includes('typeof q.explanation === "string"'), 'Must validate explanation string');
  assert(routeContent.includes('res.json(') && routeContent.includes('questions: result'), 'Must return valid questions array');
});

// Summary
console.log(`\n${colors.bold}${colors.blue}================================================================${colors.reset}`);
console.log(`${colors.bold}  BACKEND TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)${colors.reset}`);
console.log(`${colors.bold}${colors.blue}================================================================${colors.reset}\n`);

if (passedTests === totalTests) {
  console.log(`${colors.green}${colors.bold}🎉 ALL BACKEND AI TESTS PASSED!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}${colors.bold}❌ Some backend tests failed.${colors.reset}\n`);
  process.exit(1);
}
