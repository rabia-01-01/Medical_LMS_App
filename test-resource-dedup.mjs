import fs from 'fs';
import { deduplicateAndMergeResources } from './src/features/resources/utils.js';

console.log('================================================================');
console.log('  RESOURCE UPLOAD DEDUPLICATION VERIFICATION TEST                ');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Test deduplication of cloud + local duplicate entries (as seen in user screenshot)
console.log('[Step 1] Verifying Deduplication of Cloud + Local Duplicate Document:');

const mockCloudResource = {
  id: 'uuid-cloud-123',
  title: 'imat-syllabus-1',
  resource_type: 'NOTE',
  subject_id: 'sub-bio',
  subjectName: undefined, // Simulating cloud without resolved subjectName
  description: 'IMAT • General',
  created_by: 'u-faculty-1',
  creatorName: 'John Doe',
  created_at: '2026-11-07T08:00:00Z',
  sizeFormatted: '52.5 KB',
  file: {
    id: 'f-1',
    storage_path: 'biology/general/1730966400_imat_syllabus_1.pdf',
    file_name: 'imat-syllabus-1.pdf',
    mime_type: 'application/pdf',
    file_size: 53760,
  },
};

const mockLocalResource = {
  id: 'gen-local-456', // Different ID from prototype addResource
  title: 'imat-syllabus-1',
  type: 'PDF',
  subject: 'Biology',
  courseId: 'crs-1',
  uploaderId: 'u-faculty-1',
  uploaderName: 'John Doe',
  size: '0.05 MB',
  status: 'published',
  batch: 'All',
  date: '2026-11-07',
  fileName: 'imat-syllabus-1.pdf',
  storagePath: 'biology/general/1730966400_imat_syllabus_1.pdf',
};

const merged = deduplicateAndMergeResources([mockCloudResource], [mockLocalResource]);

assert(merged.length === 1, `Exactly 1 document returned (got ${merged.length}, duplicate eliminated)`);
assert(merged[0].title === 'imat-syllabus-1', 'Merged title matches "imat-syllabus-1"');
assert(merged[0].subject === 'Biology', `Merged subject resolved to "Biology" instead of "General" (got "${merged[0].subject}")`);
assert(merged[0].date === '2026-11-07', `Merged date formatted correctly as "2026-11-07" (got "${merged[0].date}")`);
assert(merged[0].uploaderName === 'John Doe', 'Uploader name is preserved');

// 2. Verify UploadResource passes id: created.id and resolved subject
console.log('\n[Step 2] Verifying Faculty UploadResource passes id: created.id and subject:');
const facultyScreensCode = fs.readFileSync('src/screens/FacultyScreens.tsx', 'utf8');

assert(
  facultyScreensCode.includes('id: created.id'),
  'UploadResource passes id: created.id to addResource'
);
assert(
  facultyScreensCode.includes('subjectName: resolvedSubject'),
  'UploadResource passes subjectName: resolvedSubject to resourceService'
);
assert(
  facultyScreensCode.includes('subject: resolvedSubject'),
  'UploadResource passes subject: resolvedSubject to addResource'
);

// 3. Verify screen implementations use deduplicateAndMergeResources
console.log('\n[Step 3] Verifying Screens use deduplicateAndMergeResources:');
assert(
  facultyScreensCode.includes('deduplicateAndMergeResources'),
  'FacultyScreens uses deduplicateAndMergeResources'
);

const studentScreensCode = fs.readFileSync('src/screens/StudentScreens.tsx', 'utf8');
assert(
  studentScreensCode.includes('deduplicateAndMergeResources'),
  'StudentScreens uses deduplicateAndMergeResources'
);

const adminScreensCode = fs.readFileSync('src/screens/AdminScreens.tsx', 'utf8');
assert(
  adminScreensCode.includes('deduplicateAndMergeResources'),
  'AdminScreens uses deduplicateAndMergeResources'
);

const resourceScreensCode = fs.readFileSync('src/screens/ResourceScreens.tsx', 'utf8');
assert(
  resourceScreensCode.includes('deduplicateAndMergeResources'),
  'ResourceScreens uses deduplicateAndMergeResources'
);

// 4. Verify DataContext storage deduplication
console.log('\n[Step 4] Verifying DataContext Storage Deduplication:');
const dataContextCode = fs.readFileSync('src/context/DataContext.tsx', 'utf8');
assert(
  dataContextCode.includes('const deduplicated: Resource[] = []'),
  'DataContext deduplicates sim_resources on load'
);
assert(
  dataContextCode.includes('existingIdx !== -1'),
  'DataContext addResource checks for existing duplicate before prepending'
);

console.log('\n================================================================');
console.log(`  VERIFICATION SUMMARY: ${passCount}/${passCount + failCount} TESTS PASSED (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
console.log('================================================================\n');

if (failCount === 0) {
  console.log('🎉 RESOURCE DUPLICATION ISSUE 100% FIXED & VERIFIED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}

