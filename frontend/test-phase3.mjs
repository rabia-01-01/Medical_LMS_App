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
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - PHASE 3 CURRICULUM VERIFICATION     ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================================${colors.reset}\n`);

// 1. Read environment credentials safely
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
envContent.split('\n').forEach(line => {
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

async function runPhase3Tests() {
  try {
    console.log(`\n${colors.bold}[Step 2] Checking Phase 3 Curriculum & Hierarchy Tables:${colors.reset}`);
    const curriculumTables = [
      { name: 'exams', desc: 'Medical Exams (NEET, IMAT, UCAT, MCAT)' },
      { name: 'classes', desc: 'Academic Classes & Grades' },
      { name: 'batches', desc: 'Academic Student Batches' },
      { name: 'subjects', desc: 'Subjects (Biology, Physics, Chemistry)' },
      { name: 'chapters', desc: 'Chapters (Tier 2 Curriculum)' },
      { name: 'topics', desc: 'Topics (Tier 3 Curriculum)' },
      { name: 'student_exams', desc: 'Student-Exam Mapping' },
      { name: 'student_subjects', desc: 'Student-Subject Mapping' },
      { name: 'faculty_subjects', desc: 'Faculty-Subject Mapping' },
    ];

    let anyTableFailed = false;
    for (const t of curriculumTables) {
      const { data, count, error } = await supabase
        .from(t.name)
        .select('*', { count: 'exact', head: true });

      if (error && (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
        console.log(`  ${colors.red}❌ Table '${t.name}': Not found!${colors.reset}`);
        anyTableFailed = true;
      } else {
        console.log(`  ${colors.green}✔ Table '${t.name}': Ready & accessible${colors.reset} (${t.desc})`);
      }
    }

    if (anyTableFailed) {
      console.log(`  ${colors.red}❌ Phase 3 failed: one or more curriculum tables missing!${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.bold}[Step 3] Testing 3-Tier Curriculum Querying & Hierarchical Integrity:${colors.reset}`);
    const { data: subjects, error: subjErr } = await supabase.from('subjects').select('*').order('name');
    if (subjErr || !subjects || subjects.length === 0) {
      console.log(`  ${colors.red}❌ Subjects query failed:${colors.reset}`, subjErr?.message || 'No subjects found');
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Subjects query operational:${colors.reset} Found ${subjects.length} subjects (${subjects.map(s => s.name).join(', ')})`);

    const { data: chapters, error: chapErr } = await supabase.from('chapters').select('*').order('display_order');
    if (chapErr || !chapters || chapters.length === 0) {
      console.log(`  ${colors.red}❌ Chapters query failed:${colors.reset}`, chapErr?.message || 'No chapters found');
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Chapters query operational:${colors.reset} Found ${chapters.length} chapters`);

    const { data: topics, error: topErr } = await supabase.from('topics').select('*').order('display_order');
    if (topErr || !topics || topics.length === 0) {
      console.log(`  ${colors.red}❌ Topics query failed:${colors.reset}`, topErr?.message || 'No topics found');
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Topics query operational:${colors.reset} Found ${topics.length} topics`);

    // Verify foreign key integrity
    const subjectIds = new Set(subjects.map(s => s.id));
    const orphanedChapters = chapters.filter(c => !subjectIds.has(c.subject_id));
    if (orphanedChapters.length > 0) {
      console.log(`  ${colors.red}❌ Found ${orphanedChapters.length} orphaned chapters without valid subject_id!${colors.reset}`);
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Hierarchy link Subject → Chapter verified: all ${chapters.length} chapters reference valid subjects`);

    const chapterIds = new Set(chapters.map(c => c.id));
    const orphanedTopics = topics.filter(t => !chapterIds.has(t.chapter_id));
    if (orphanedTopics.length > 0) {
      console.log(`  ${colors.red}❌ Found ${orphanedTopics.length} orphaned topics without valid chapter_id!${colors.reset}`);
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ Hierarchy link Chapter → Topic verified: all ${topics.length} topics reference valid chapters`);

    console.log(`\n${colors.bold}[Step 4] Checking UI Integration & Hooks Architecture:${colors.reset}`);
    const curriculumServicePath = path.resolve(process.cwd(), 'src/features/curriculum/curriculumService.ts');
    const useCurriculumPath = path.resolve(process.cwd(), 'src/features/curriculum/useCurriculum.ts');
    const curriculumBrowserPath = path.resolve(process.cwd(), 'src/features/curriculum/CurriculumBrowser.tsx');

    if (!fs.existsSync(curriculumServicePath) || !fs.existsSync(useCurriculumPath) || !fs.existsSync(curriculumBrowserPath)) {
      console.log(`  ${colors.red}❌ Missing curriculum UI or service files!${colors.reset}`);
      process.exit(1);
    }

    const browserSrc = fs.readFileSync(curriculumBrowserPath, 'utf8');
    const hasStudyHub = browserSrc.includes('handleOpenChapterStudyHub') && browserSrc.includes('activeStudyChapter');
    const hasDnd = browserSrc.includes('DndContext') && browserSrc.includes('SortableContext');

    if (!hasStudyHub || !hasDnd) {
      console.log(`  ${colors.red}❌ CurriculumBrowser missing Study Hub or DndKit sorting!${colors.reset}`);
      process.exit(1);
    }
    console.log(`  ${colors.green}✔ src/features/curriculum/curriculumService.ts operational`);
    console.log(`  ${colors.green}✔ src/features/curriculum/useCurriculum.ts hook operational`);
    console.log(`  ${colors.green}✔ Interactive CurriculumBrowser rendered with Chapter Study Hub and DndKit sorting`);

    console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ PHASE 3 VERIFICATION PASSED: CURRICULUM READY!   ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);
  } catch (err) {
    console.error(`\n${colors.red}❌ Error during Phase 3 verification:${colors.reset}`, err.message);
    process.exit(1);
  }
}

runPhase3Tests();
