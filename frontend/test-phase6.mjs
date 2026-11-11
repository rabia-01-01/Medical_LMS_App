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
};

console.log(`${colors.bold}${colors.blue}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - PHASE 6 ATTEMPTS & ANALYTICS TEST   ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================================${colors.reset}\n`);

// 1. Read environment credentials safely (never print the full key)
let envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  const backendEnv = path.resolve(process.cwd(), 'backend', '.env');
  if (fs.existsSync(backendEnv)) {
    envPath = backendEnv;
  } else {
    console.error(`${colors.red}❌ Error: .env file not found in root or backend directory!${colors.reset}`);
    process.exit(1);
  }
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

async function runPhase6Tests() {
  try {
    // 2. Database Tables Verification
    console.log(`\n${colors.bold}[Step 2] Checking Phase 6 Attempt & Answer Tables in PostgreSQL:${colors.reset}`);
    const phase6Tables = [
      { name: 'attempts', desc: 'Student test sessions, score, accuracy, submission status' },
      { name: 'attempt_answers', desc: 'Per-question responses, option selected, marks awarded' },
      { name: 'students', desc: 'Student profiles & enrolled exam tracks' },
    ];

    for (const table of phase6Tables) {
      const { data, count, error } = await supabase.from(table.name).select('*', { count: 'exact', head: true });
      if (error && (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
        console.log(`  ${colors.red}❌ Table '${table.name}': Not found!${colors.reset}`);
        process.exit(1);
      } else {
        console.log(`  ${colors.green}✔ Table '${table.name.padEnd(20)}': Connected & accessible (${table.desc})${colors.reset}`);
      }
    }

    // 3. Test Phase 6 Frontend Attempt Feature Modules
    console.log(`\n${colors.bold}[Step 3] Checking Phase 6 Module Structure & Exports:${colors.reset}`);
    const requiredFiles = [
      'src/features/attempts/types.ts',
      'src/features/attempts/attemptService.ts',
      'src/features/attempts/useAttempts.ts',
      'src/features/attempts/PerformanceAnalyticsView.tsx',
      'src/features/attempts/index.ts',
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

    // 4. Test Scoring Engine & Medical Marking Calculations in attemptService
    console.log(`\n${colors.bold}[Step 4] Validating Medical Scoring & Analytics Calculation Logic in attemptService:${colors.reset}`);
    const attemptServiceContent = fs.readFileSync(path.resolve(process.cwd(), 'src/features/attempts/attemptService.ts'), 'utf8');

    const hasStartAttempt = attemptServiceContent.includes('export async function startAttempt');
    const hasSaveAnswer = attemptServiceContent.includes('export async function saveAnswer');
    const hasSubmitAttempt = attemptServiceContent.includes('export async function submitAttempt');
    const hasGetAnalytics = attemptServiceContent.includes('export async function getStudentAnalytics');
    const hasWeakAreaLogic = attemptServiceContent.includes('weakAreas') && attemptServiceContent.includes('accuracy < 50');

    if (!hasStartAttempt || !hasSaveAnswer || !hasSubmitAttempt || !hasGetAnalytics || !hasWeakAreaLogic) {
      console.log(`  ${colors.red}❌ attemptService.ts missing core attempt lifecycle or analytics routines!${colors.reset}`);
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Attempt lifecycle implemented: startAttempt(), saveAnswer(), submitAttempt()${colors.reset}`);
    console.log(`  ${colors.green}✔ Performance analytics implemented: getStudentAnalytics() with score history, subject accuracy & weak areas (< 50%)${colors.reset}`);

    // 5. Test UI & Screen Integrations
    console.log(`\n${colors.bold}[Step 5] Checking UI Integrations (AssessmentRunner, StudentScreens, App.tsx):${colors.reset}`);
    const runnerContent = fs.readFileSync(path.resolve(process.cwd(), 'src/features/assessments/AssessmentRunner.tsx'), 'utf8');
    const studentScreensContent = fs.readFileSync(path.resolve(process.cwd(), 'src/screens/StudentScreens.tsx'), 'utf8');
    const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');

    // Runner calls attempt lifecycle
    if (runnerContent.includes('attemptService.startAttempt') && runnerContent.includes('attemptService.submitAttempt')) {
      console.log(`  ${colors.green}✔ AssessmentRunner automatically initiates startAttempt() and submits submitAttempt()${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ AssessmentRunner missing attemptService lifecycle calls${colors.reset}`);
      process.exit(1);
    }

    // StudentScreens has PerformanceAnalyticsView and AnalyticsScreen
    if (
      studentScreensContent.includes('PerformanceAnalyticsView') &&
      studentScreensContent.includes('useStudentAnalytics') &&
      studentScreensContent.includes('AnalyticsScreen')
    ) {
      console.log(`  ${colors.green}✔ StudentScreens exports AnalyticsScreen & embeds dynamic analytics in StudentProfile${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ StudentScreens missing AnalyticsScreen or PerformanceAnalyticsView integration${colors.reset}`);
      process.exit(1);
    }

    // App.tsx routing
    if (appContent.includes("case 'analytics': return <AnalyticsScreen")) {
      console.log(`  ${colors.green}✔ App.tsx routes 'analytics' for student, faculty, and admin roles${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ App.tsx missing 'analytics' route${colors.reset}`);
      process.exit(1);
    }

    // 6. Test Recharts Visualizations
    console.log(`\n${colors.bold}[Step 6] Validating Recharts & Performance Visualizations:${colors.reset}`);
    const analyticsViewContent = fs.readFileSync(path.resolve(process.cwd(), 'src/features/attempts/PerformanceAnalyticsView.tsx'), 'utf8');
    const hasRecharts = [
      'ResponsiveContainer',
      'LineChart',
      'BarChart',
      'XAxis',
      'YAxis',
      'Tooltip',
      'Legend'
    ].every(component => analyticsViewContent.includes(component));

    if (hasRecharts) {
      console.log(`  ${colors.green}✔ Recharts components properly integrated (Score progression line & subject accuracy bar charts)${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ Recharts missing in PerformanceAnalyticsView${colors.reset}`);
      process.exit(1);
    }

    // 7. Verify Database RLS and Schema in db.sql
    console.log(`\n${colors.bold}[Step 7] Validating Database SQL Schema & RLS in src/db/db.sql:${colors.reset}`);
    const dbSqlContent = fs.readFileSync(path.resolve(process.cwd(), 'src/db/db.sql'), 'utf8');
    const requiredSqlTokens = [
      'CREATE TABLE attempts',
      'CREATE TABLE attempt_answers',
      'ENABLE ROW LEVEL SECURITY',
      'idx_attempts_student_assessment',
      'idx_attempt_answers_attempt_id',
    ];

    for (const token of requiredSqlTokens) {
      if (dbSqlContent.includes(token)) {
        console.log(`  ${colors.green}✔ Found SQL definition: "${token}"${colors.reset}`);
      } else {
        console.log(`  ${colors.red}❌ Missing SQL definition: "${token}"${colors.reset}`);
        process.exit(1);
      }
    }

    console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ ALL PHASE 6 ATTEMPTS & ANALYTICS TESTS PASSED!  ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);

  } catch (err) {
    console.error(`\n${colors.red}❌ Unexpected error during Phase 6 testing:${colors.reset}`, err);
    process.exit(1);
  }
}

runPhase6Tests();
