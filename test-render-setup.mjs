import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  RENDER ZERO-CONFIG DEPLOYMENT READINESS VERIFICATION          ');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✔ PASS: ${name}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

const root = process.cwd();

test('render.yaml exists with Node web service blueprint', () => {
  const p = path.join(root, 'render.yaml');
  assert(fs.existsSync(p), 'render.yaml missing');
  const content = fs.readFileSync(p, 'utf8');
  assert(content.includes('type: web'), 'Must define web service');
  assert(content.includes('runtime: node'), 'Must specify runtime: node');
  assert(content.includes('buildCommand:'), 'Must specify buildCommand');
  assert(content.includes('startCommand: npm start'), 'Must specify startCommand: npm start');
  assert(content.includes('healthCheckPath: /health'), 'Must specify healthCheckPath: /health');
  assert(content.includes('autoDeployTrigger: commit'), 'Must specify autoDeployTrigger: commit');
});

test('.node-version pins Node LTS runtime', () => {
  const p = path.join(root, '.node-version');
  assert(fs.existsSync(p), '.node-version missing');
  const ver = fs.readFileSync(p, 'utf8').trim();
  assert(/^\d+\.\d+\.\d+$/.test(ver), `Invalid version format: ${ver}`);
});

test('package.json has start, build, render:build, and engines', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert(pkg.scripts?.start === 'node backend/server.js', 'scripts.start must run node backend/server.js');
  assert(pkg.scripts?.build === 'vite build', 'scripts.build must run vite build');
  assert(pkg.engines?.node, 'engines.node must be specified');
  assert(pkg.dependencies?.express, 'express must be in root dependencies');
  assert(pkg.dependencies?.cors, 'cors must be in root dependencies');
  assert(pkg.dependencies?.dotenv, 'dotenv must be in root dependencies');
});

test('backend/server.js configures unified SPA static hosting, /health, CORS, and 0.0.0.0 bind', () => {
  const serverJs = fs.readFileSync(path.join(root, 'backend/server.js'), 'utf8');
  assert(serverJs.includes('/health'), 'Must expose /health endpoint');
  assert(serverJs.includes('/api/ai'), 'Must mount /api/ai routes');
  assert(serverJs.includes('express.static(distPath'), 'Must serve dist/ static assets');
  assert(serverJs.includes('sendFile(indexHtmlPath)'), 'Must handle SPA client route fallback');
  assert(serverJs.includes('onrender\\.com') || serverJs.includes('.onrender.com'), 'Must permit *.onrender.com origin in CORS');
  assert(serverJs.includes('0.0.0.0'), 'Must bind 0.0.0.0 for Render port binding');
  assert(serverJs.includes('process.env.PORT'), 'Must respect process.env.PORT');
});

test('.gitignore ignores .env files and build artifacts', () => {
  const gi = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert(gi.includes('.env'), '.gitignore must ignore .env');
  assert(gi.includes('dist/'), '.gitignore must ignore dist/');
  assert(gi.includes('node_modules/'), '.gitignore must ignore node_modules/');
});

test('.env.example documents optional Supabase & Groq variables', () => {
  const ex = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  assert(ex.includes('VITE_SUPABASE_URL='), 'Must document VITE_SUPABASE_URL');
  assert(ex.includes('VITE_SUPABASE_ANON_KEY='), 'Must document VITE_SUPABASE_ANON_KEY');
  assert(ex.includes('GROQ_API_KEY='), 'Must document GROQ_API_KEY');
});

console.log(`\nSummary: ${passed}/${total} checks passed.`);
if (passed !== total) process.exit(1);
