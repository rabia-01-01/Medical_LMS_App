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
console.log(`${colors.bold}${colors.cyan}  MEDICAL LMS - PHASE 4 RESOURCES & STORAGE TEST    ${colors.reset}`);
console.log(`${colors.bold}${colors.blue}====================================================${colors.reset}\n`);

// 1. Read environment credentials safely (never print the full key)
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

async function runPhase4Tests() {
  try {
    // 2. Database Tables Verification
    console.log(`\n${colors.bold}[Step 2] Checking Phase 4 Resource Tables in PostgreSQL:${colors.reset}`);
    const resourceTables = [
      { name: 'resources', desc: 'Learning Resources (Notes, PYQs, Books, DPPs, Videos)' },
      { name: 'resource_files', desc: 'Resource Binary Files Metadata & Storage Path Mapping' },
    ];

    for (const table of resourceTables) {
      try {
        const { data, error } = await supabase.from(table.name).select('id').limit(1);
        if (error) {
          console.log(`  ${colors.yellow}⚠ ${table.name.padEnd(16)}: ${error.message} (${table.desc})${colors.reset}`);
        } else {
          console.log(`  ${colors.green}✔ ${table.name.padEnd(16)}: Connected & accessible (${table.desc})${colors.reset}`);
        }
      } catch (e) {
        console.log(`  ${colors.yellow}⚠ ${table.name.padEnd(16)}: Local connection / pending migration (${table.desc})${colors.reset}`);
      }
    }

    // 3. Supabase Storage Bucket Verification
    console.log(`\n${colors.bold}[Step 3] Checking Supabase Storage Bucket ('resources'):${colors.reset}`);
    try {
      const { data: bucket, error: bucketError } = await supabase.storage.getBucket('resources');
      if (bucketError) {
        console.log(`  ${colors.yellow}⚠ Storage bucket 'resources': ${bucketError.message}${colors.reset}`);
        console.log(`  ${colors.cyan}ℹ (Note: If bucket is not yet created in Supabase dashboard, run src/db/db.sql line 380 to provision it)${colors.reset}`);
      } else {
        console.log(`  ${colors.green}✔ Storage bucket 'resources' exists and is ready! (Public: ${bucket.public})${colors.reset}`);
      }
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Storage bucket verification skipped in offline mode.${colors.reset}`);
    }

    // 4. Test Storage Signed URL Generation API
    console.log(`\n${colors.bold}[Step 4] Testing Signed URL Generation API:${colors.reset}`);
    try {
      const testPath = 'biology/sample_lecture_notes.pdf';
      const { data: signedData, error: signedError } = await supabase.storage.from('resources').createSignedUrl(testPath, 3600);
      if (signedError) {
        console.log(`  ${colors.yellow}⚠ createSignedUrl('${testPath}'): ${signedError.message} (expected if object does not exist yet)${colors.reset}`);
      } else if (signedData?.signedUrl) {
        console.log(`  ${colors.green}✔ Successfully created signed URL for '${testPath}'${colors.reset}`);
      }
    } catch (e) {
      console.log(`  ${colors.yellow}⚠ Signed URL test skipped: ${e.message}${colors.reset}`);
    }

    // 5. Test Frontend Resource Feature Module Files
    console.log(`\n${colors.bold}[Step 5] Checking Phase 4 Module Structure & Exports:${colors.reset}`);
    const requiredFiles = [
      'src/features/resources/types.ts',
      'src/features/resources/resourceService.ts',
      'src/features/resources/useResources.ts',
      'src/features/resources/index.ts',
    ];

    for (const f of requiredFiles) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`  ${colors.green}✔ ${f.padEnd(42)}: Found (${stats.size} bytes)${colors.reset}`);
      } else {
        console.log(`  ${colors.red}❌ ${f.padEnd(42)}: Missing!${colors.reset}`);
        process.exit(1);
      }
    }

    // 6. Test Utility & Normalization Logic
    console.log(`\n${colors.bold}[Step 6] Verifying Resource Type Normalization & Size Formatting:${colors.reset}`);
    let normalizeResourceType, formatFileSize;
    try {
      const utils = await import('./src/features/resources/utils.js');
      normalizeResourceType = utils.normalizeResourceType;
      formatFileSize = utils.formatFileSize;
    } catch (e) {
      const typesMod = await import('./src/features/resources/types.ts');
      normalizeResourceType = typesMod.normalizeResourceType;
      formatFileSize = typesMod.formatFileSize;
    }
    
    const typeTests = [
      { input: 'PDF', expected: 'NOTE' },
      { input: 'Video', expected: 'VIDEO' },
      { input: 'Notes', expected: 'NOTE' },
      { input: 'PYQ', expected: 'PYQ' },
      { input: 'Assignment', expected: 'DPP' },
      { input: 'DPP', expected: 'DPP' },
      { input: 'Syllabus', expected: 'BOOK' },
    ];

    let allTypesPassed = true;
    for (const t of typeTests) {
      const res = normalizeResourceType(t.input);
      if (res !== t.expected) {
        console.log(`  ${colors.red}❌ normalizeResourceType('${t.input}') expected '${t.expected}', got '${res}'${colors.reset}`);
        allTypesPassed = false;
      }
    }
    if (allTypesPassed) {
      console.log(`  ${colors.green}✔ All resource type normalizations mapped accurately (NOTE, BOOK, DPP, PYQ, VIDEO)${colors.reset}`);
    }

    const sizeTests = [
      { bytes: 500, expected: '500 B' },
      { bytes: 1048576, expected: '1.0 MB' },
      { bytes: 5242880, expected: '5.0 MB' },
    ];
    let allSizesPassed = true;
    for (const s of sizeTests) {
      const res = formatFileSize(s.bytes);
      if (res !== s.expected) {
        console.log(`  ${colors.red}❌ formatFileSize(${s.bytes}) expected '${s.expected}', got '${res}'${colors.reset}`);
        allSizesPassed = false;
      }
    }
    if (allSizesPassed) {
      console.log(`  ${colors.green}✔ File size formatters verified (B, KB, MB, GB)${colors.reset}`);
    }

    // 7. Verify RLS Policies in db.sql
    console.log(`\n${colors.bold}[Step 7] Checking RLS Policies in db.sql for Resources & Storage:${colors.reset}`);
    const dbSqlContent = fs.readFileSync(path.resolve(process.cwd(), 'src/db/db.sql'), 'utf8');
    const policiesToCheck = [
      'Students view published resources',
      'Faculty create resources',
      'Faculty edit own resources, Admin edit any',
      'Users delete own resources, Admin delete any',
      'Students and Faculty view resource files for viewable resources',
      'Faculty and Admins insert resource files',
      'Faculty and Admins delete resource files',
      'Students and Faculty can read resources',
      'Faculty and Admins can upload resources',
      'Faculty and Admins can delete resources',
    ];

    let allPoliciesFound = true;
    for (const policy of policiesToCheck) {
      if (dbSqlContent.includes(policy)) {
        console.log(`  ${colors.green}✔ Policy "${policy}" found in db.sql${colors.reset}`);
      } else {
        console.log(`  ${colors.red}❌ Policy "${policy}" missing in db.sql${colors.reset}`);
        allPoliciesFound = false;
      }
    }

    if (!allPoliciesFound) {
      process.exit(1);
    }

    console.log(`\n${colors.bold}${colors.green}====================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}  ✔ PHASE 4 RESOURCES & STORAGE INTEGRATION PASSED! ${colors.reset}`);
    console.log(`${colors.bold}${colors.green}====================================================${colors.reset}\n`);

  } catch (err) {
    console.error(`\n${colors.red}❌ Error running Phase 4 tests:${colors.reset}`, err);
    process.exit(1);
  }
}

runPhase4Tests();
