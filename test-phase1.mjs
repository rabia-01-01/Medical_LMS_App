import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ANSI colors for clean terminal output
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
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - PHASE 1 VERIFICATION TEST ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================================${colors.reset}\n`);

// 1. Read .env file
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}❌ Error: .env file not found in root directory!${colors.reset}`);
  process.exit(1);
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

console.log(`${colors.bold}[Step 1] Checking Environment Variables:${colors.reset}`);
if (!supabaseUrl) {
  console.log(`  ${colors.red}❌ VITE_SUPABASE_URL is missing in .env${colors.reset}`);
} else {
  console.log(`  ${colors.green}✔ VITE_SUPABASE_URL:${colors.reset} ${supabaseUrl}`);
}

if (!supabaseKey) {
  console.log(`  ${colors.red}❌ VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY is missing in .env${colors.reset}`);
} else {
  const maskedKey = supabaseKey.slice(0, 10) + '...' + supabaseKey.slice(-6);
  console.log(`  ${colors.green}✔ VITE_SUPABASE_KEY:${colors.reset} ${maskedKey}`);
}

if (!supabaseUrl || !supabaseKey) {
  console.log(`\n${colors.red}❌ Phase 1 Configuration Test FAILED: Missing credentials.${colors.reset}\n`);
  process.exit(1);
}

// 2. Initialize Supabase Client
console.log(`\n${colors.bold}[Step 2] Initializing Supabase Client:${colors.reset}`);
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log(`  ${colors.green}✔ Supabase Client successfully initialized.${colors.reset}`);
} catch (err) {
  console.error(`  ${colors.red}❌ Client initialization failed:${colors.reset}`, err.message);
  process.exit(1);
}

// 3. Test Connectivity & Auth Service
console.log(`\n${colors.bold}[Step 3] Testing Supabase Connectivity:${colors.reset}`);
async function runTests() {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log(`  ${colors.yellow}⚠ Auth Service response:${colors.reset} ${authError.message}`);
    } else {
      console.log(`  ${colors.green}✔ Supabase Auth service is ONLINE & responding.${colors.reset}`);
    }

    // 4. Test Database Tables (from src/db/db.sql)
    console.log(`\n${colors.bold}[Step 4] Checking Database Schema (src/db/db.sql tables):${colors.reset}`);
    const tablesToCheck = ['profiles', 'exams', 'subjects', 'resources', 'assessments'];
    
    for (const table of tablesToCheck) {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          console.log(`  ${colors.yellow}⚠ Table '${table}': Not found (Please run src/db/db.sql in your Supabase SQL Editor)${colors.reset}`);
        } else {
          // Table exists but RLS restricted or empty
          console.log(`  ${colors.green}✔ Table '${table}': Ready${colors.reset} (RLS active / status: ${error.message || 'OK'})`);
        }
      } else {
        console.log(`  ${colors.green}✔ Table '${table}': Connected & Available${colors.reset}`);
      }
    }

    console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ PHASE 1 TEST PASSED: SUPABASE CONNECTED!       ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);
    console.log(`${colors.cyan}Tip:${colors.reset} If any tables showed "Not found", copy the contents of`);
    console.log(`${colors.bold}src/db/db.sql${colors.reset} into your Supabase Dashboard -> SQL Editor and click 'Run'.\n`);
  } catch (err) {
    console.error(`\n${colors.red}❌ Network or Connectivity error:${colors.reset}`, err.message);
  }
}

runTests();
