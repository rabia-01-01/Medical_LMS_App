import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const require = createRequire(import.meta.url);

console.log('================================================================');
console.log('  AI CHATBOT UX, HYBRID GROQ CHAT & TELEMETRY VERIFICATION      ');
console.log('================================================================\n');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-chatbot-test-'));

try {
  // 1. Verify Frontend Pure Advisor Runtime Logic
  console.log('[Step 1] Testing Pure Advisor, Telemetry Answers & Markdown Formatting:');
  const advisorOut = path.join(tempDir, 'chatbotAdvisor.mjs');
  await esbuild.build({
    entryPoints: [path.resolve('src/features/ai/chatbotAdvisor.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: advisorOut,
  });

  const advisor = await import(pathToFileURL(advisorOut).href);

  const sampleTelemetry = {
    studentName: 'Aisha Khan',
    batch: 'Batch 1 (Dec)',
    enrolledCoursesCount: 2,
    accessibleCoursesCount: 3,
    courseNames: ['IMAT Complete Biology', 'Organic Chemistry Mastery'],
    activeQuizzesCount: 2,
    quizTitles: ['Cellular Respiration DPP #4', 'IMAT Full Mock #1'],
    verifiedDocsCount: 5,
    inReviewDocsCount: 2,
    notVerifiedDocsCount: 0,
    pendingDocsCount: 1,
    totalDocsCount: 8,
    completedChaptersCount: 6,
    completedTopicsCount: 19,
    isConsultancyOptedIn: true,
    verifiedStagesCount: 5,
    totalStagesCount: 8,
    unreadNotificationsCount: 3,
    latestAnnouncementTitle: 'IMAT Exam Registration Window Open',
    permissions: {
      resources: true,
      branch: true,
      courses: true,
      quizzes: true,
      announcements: true,
      notifications: true,
    },
  };

  // Telemetry portal intent accuracy
  const docRes = advisor.buildLocalChatbotResponse('What is my document verification status?', sampleTelemetry);
  assert.equal(docRes.topic, 'registration');
  assert.equal(docRes.directPortal, true);
  assert.ok(docRes.reply.includes('5 of 8'), 'Reflects live verified document ratio (5 of 8)');
  assert.ok(docRes.followUps.length >= 2, 'Provides contextual follow-up chips');

  const batchRes = advisor.buildLocalChatbotResponse('What courses are accessible in my current batch?', sampleTelemetry);
  assert.equal(batchRes.topic, 'enrollment');
  assert.ok(batchRes.reply.includes('Batch 1 (Dec)') && batchRes.reply.includes('IMAT Complete Biology'), 'Lists student cohort and course names');

  const quizRes = advisor.buildLocalChatbotResponse('What are quiz scoring rules?', sampleTelemetry);
  assert.equal(quizRes.topic, 'quiz');
  assert.ok(quizRes.reply.includes('+4 marks') && quizRes.reply.includes('Cellular Respiration DPP #4'), 'Includes live active quiz and +4/-1 rule');

  const visaRes = advisor.buildLocalChatbotResponse('How is my 8-stage visa dossier looking?', sampleTelemetry);
  assert.equal(visaRes.topic, 'consultancy');
  assert.ok(visaRes.reply.includes('5 / 8'), 'Shows live consultancy verified stage count');

  // Locked module awareness
  const lockedCoursesRes = advisor.buildLocalChatbotResponse('Show my courses', {
    ...sampleTelemetry,
    permissions: { ...sampleTelemetry.permissions, courses: false },
  });
  assert.ok(lockedCoursesRes.reply.includes('locked'), 'Informs student cleanly when Courses permission is disabled');

  // Lightweight formatter parses headings, bullets, numbered lines, bold & code cleanly
  const blocks = advisor.parseFormattedBlocks('### Study Tip\n• Focus on **Cell Biology** and `ATP`\n1. Attempt one timed drill');
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'bullet');
  assert.ok(blocks[1].runs.some((r) => r.bold && r.text === 'Cell Biology'), 'Parses **bold** tokens');
  assert.ok(blocks[1].runs.some((r) => r.code && r.text === 'ATP'), 'Parses inline `code` tokens');
  assert.equal(blocks[2].type, 'numbered');
  assert.equal(blocks[2].index, '1');
  console.log('  ✔ PASS: Telemetry answers, permission locks, follow-ups, and markdown formatting verified');

  // 2. Hybrid Cloud/Local Routing & Offline Graceful Fallback
  console.log('\n[Step 2] Testing Hybrid /api/ai/chat Resolution & Graceful Offline Fallback:');
  const originalFetch = globalThis.fetch;

  try {
    // Direct portal question answers locally with zero API latency
    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      throw new Error('Should not fetch for direct portal lookup');
    };
    const fastPortal = await advisor.resolveChatbotReply({
      message: 'How is my fee payment status?',
      history: [],
      telemetry: sampleTelemetry,
    });
    assert.equal(fetchCalled, false, 'Portal lookup skips redundant network roundtrip');
    assert.equal(fastPortal.source, 'local');

    // Open-ended medical study doubt hits /api/ai/chat and surfaces cloud answer
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/ai/chat');
      const body = JSON.parse(init.body);
      assert.equal(body.studentContext.batch, 'Batch 1 (Dec)');
      return {
        ok: true,
        async json() {
          return {
            success: true,
            reply: '**Active transport** uses ATP (e.g., `Na+/K+-ATPase`) against a gradient, while facilitated diffusion moves solutes passively down a gradient.',
            followUps: ['Explain Na+/K+ pump stoichiometry'],
            model: 'llama-3.1-8b-instant',
          };
        },
      };
    };
    const aiReply = await advisor.resolveChatbotReply({
      message: 'Explain active transport vs facilitated diffusion',
      history: [],
      telemetry: sampleTelemetry,
    });
    assert.equal(aiReply.source, 'cloud');
    assert.equal(aiReply.model, 'llama-3.1-8b-instant');
    assert.ok(aiReply.reply.includes('Active transport'));
    assert.deepEqual(aiReply.followUps, ['Explain Na+/K+ pump stoichiometry']);

    // Network/API error falls back seamlessly instead of crashing
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    const degradedReply = await advisor.resolveChatbotReply({
      message: 'Explain Krebs cycle steps',
      history: [],
      telemetry: sampleTelemetry,
    });
    assert.equal(degradedReply.source, 'local');
    assert.equal(degradedReply.usedFallback, true);
    assert.ok(degradedReply.reply.length > 40);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log('  ✔ PASS: Hybrid routing uses instant portal answers locally, Groq AI for open questions, and degrades cleanly');

  // 3. Backend /api/ai/chat Controller & Service Validation
  console.log('\n[Step 3] Verifying Backend Chat Controller & Groq Low-Latency Model Config:');
  const aiController = require('../backend/controllers/aiController.js');
  const aiConfig = require('../backend/config/aiConfig.js');
  const routeActiveSrc = fs.readFileSync(path.resolve('..', 'backend/route/aiRoutes.js'), 'utf8');
  const routeAltSrc = fs.readFileSync(path.resolve('..', 'backend/routes/aiRoutes.js'), 'utf8');

  assert.equal(aiConfig.CHAT_GROQ_MODELS[0], 'llama-3.1-8b-instant', 'Low-latency instant Groq model prioritized for chat');
  assert.ok(routeActiveSrc.includes('router.post("/chat", handleAIChat)'), 'Active backend/route/aiRoutes.js exposes POST /chat');
  assert.ok(routeAltSrc.includes('router.post("/chat", handleAIChat)'), 'Secondary backend/routes/aiRoutes.js exposes POST /chat');

  const createMockRes = () => {
    const out = { statusCode: 200, body: null };
    return {
      status(code) {
        out.statusCode = code;
        return this;
      },
      json(payload) {
        out.body = payload;
        return out;
      },
      _out: out,
    };
  };

  // Invalid message -> 400
  const badRes = createMockRes();
  await aiController.handleAIChat({ body: { message: '   ' } }, badRes);
  assert.equal(badRes._out.statusCode, 400);

  // Missing key -> 503 with fallbackRecommended
  const prevKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  try {
    const missingKeyRes = createMockRes();
    await aiController.handleAIChat({ body: { message: 'Explain glycolysis' } }, missingKeyRes);
    assert.equal(missingKeyRes._out.statusCode, 503);
    assert.equal(missingKeyRes._out.body.fallbackRecommended, true);
  } finally {
    if (prevKey !== undefined) process.env.GROQ_API_KEY = prevKey;
  }

  // With key + mocked Groq response -> 200 structured reply
  const savedFetch = globalThis.fetch;
  process.env.GROQ_API_KEY = 'test-key-mock';
  globalThis.fetch = async () => ({
    ok: true,
    async json() {
      return {
        choices: [
          {
            message: {
              content: JSON.stringify({
                reply: '**Glycolysis** occurs in the cytosol and nets **2 ATP** and **2 NADH** per glucose.',
                followUps: ['Show net ATP from aerobic respiration'],
              }),
            },
          },
        ],
      };
    },
  });
  try {
    const okRes = createMockRes();
    await aiController.handleAIChat(
      {
        body: {
          message: 'Explain glycolysis briefly',
          history: [{ sender: 'user', text: 'Hi' }],
          studentContext: { batch: 'Batch 1 (Dec)', enrolledCoursesCount: 2 },
        },
      },
      okRes
    );
    assert.equal(okRes._out.statusCode, 200);
    assert.equal(okRes._out.body.success, true);
    assert.ok(okRes._out.body.reply.includes('Glycolysis'));
    assert.deepEqual(okRes._out.body.followUps, ['Show net ATP from aerobic respiration']);
  } finally {
    globalThis.fetch = savedFetch;
    if (prevKey !== undefined) {
      process.env.GROQ_API_KEY = prevKey;
    } else {
      delete process.env.GROQ_API_KEY;
    }
  }
  console.log('  ✔ PASS: Backend /api/ai/chat validation, key guard, and Groq structured parsing verified');

  // 4. Component UX Wiring Verification
  console.log('\n[Step 4] Checking StudentAIChatbot UX & Accessibility Capabilities:');
  const chatbotSrc = fs.readFileSync('src/components/StudentAIChatbot.tsx', 'utf8');
  assert.ok(chatbotSrc.includes('scrollIntoView'), 'Auto-scrolls cleanly to latest message');
  assert.ok(chatbotSrc.includes('AbortController') && chatbotSrc.includes('Stop'), 'Supports cancelling in-flight requests cleanly');
  assert.ok(chatbotSrc.includes("e.key === 'Escape'"), 'Supports Escape key dismissal');
  assert.ok(chatbotSrc.includes('navigator.clipboard.writeText'), 'Supports 1-click Copy on AI replies');
  assert.ok(chatbotSrc.includes('handleFeedback') && chatbotSrc.includes('fa-thumbs-up'), 'Supports helpfulness feedback controls');
  assert.ok(chatbotSrc.includes('handleClearChat') && chatbotSrc.includes('New Conversation'), 'Supports clearing & resetting chat history');
  assert.ok(chatbotSrc.includes('Retry AI'), 'Supports retrying fallback messages');
  assert.ok(chatbotSrc.includes('FormattedChatText'), 'Renders structured markdown blocks without raw asterisks');
  console.log('  ✔ PASS: All StudentAIChatbot UX polish features verified');

  console.log('\n================================================================');
  console.log('  SUMMARY: ALL AI CHATBOT UX & API CHECKS PASSED (100%)');
  console.log('================================================================\n');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

