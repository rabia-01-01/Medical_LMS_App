/**
 * Pure AI Chatbot Advisor, Telemetry Formatter & Lightweight Markdown Block Parser
 * Powers fast local portal answers and Groq-backed academic tutoring with automatic fallback.
 */

export type ChatTopic =
  | 'registration'
  | 'payment'
  | 'enrollment'
  | 'quiz'
  | 'progress'
  | 'consultancy'
  | 'announcements'
  | 'study'
  | 'general';

export interface ChatbotMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  topic?: ChatTopic;
  source?: 'cloud' | 'local';
  model?: string;
  followUps?: string[];
  feedback?: 'up' | 'down';
  usedFallback?: boolean;
}

export interface StudentChatbotTelemetry {
  studentName: string;
  batch: string;
  enrolledCoursesCount: number;
  accessibleCoursesCount: number;
  courseNames: string[];
  activeQuizzesCount: number;
  quizTitles: string[];
  verifiedDocsCount: number;
  inReviewDocsCount: number;
  notVerifiedDocsCount: number;
  pendingDocsCount: number;
  totalDocsCount: number;
  completedChaptersCount: number;
  completedTopicsCount: number;
  isConsultancyOptedIn: boolean;
  verifiedStagesCount: number;
  totalStagesCount: number;
  unreadNotificationsCount: number;
  latestAnnouncementTitle?: string;
  permissions: {
    resources: boolean;
    branch: boolean;
    courses: boolean;
    quizzes: boolean;
    announcements: boolean;
    notifications: boolean;
  };
}

export interface QuickPromptItem {
  id: string;
  category: 'portal' | 'study';
  label: string;
  icon: string;
  topic: ChatTopic;
  q: string;
}

export interface FormattedRun {
  text: string;
  bold?: boolean;
  code?: boolean;
}

export type FormattedBlock =
  | { type: 'heading'; runs: FormattedRun[] }
  | { type: 'bullet'; runs: FormattedRun[] }
  | { type: 'numbered'; index: string; runs: FormattedRun[] }
  | { type: 'paragraph'; runs: FormattedRun[] };

const CHAT_ENDPOINT = '/api/ai/chat';
const STORAGE_PREFIX = 'lms_ai_chatbot_history_v2_';
const MAX_STORED_MESSAGES = 40;

export const CHATBOT_QUICK_PROMPTS: QuickPromptItem[] = [
  {
    id: 'reg',
    category: 'portal',
    label: 'Registration Docs',
    icon: 'fa-file-shield',
    topic: 'registration',
    q: 'What is my document verification and registration status?',
  },
  {
    id: 'pay',
    category: 'portal',
    label: 'Fee Payment',
    icon: 'fa-credit-card',
    topic: 'payment',
    q: 'How do I complete fee payment and get my payment receipt?',
  },
  {
    id: 'batch',
    category: 'portal',
    label: 'Batch & Courses',
    icon: 'fa-layer-group',
    topic: 'enrollment',
    q: 'What courses are accessible in my current batch?',
  },
  {
    id: 'quiz',
    category: 'study',
    label: 'Quiz Rules',
    icon: 'fa-clipboard-check',
    topic: 'quiz',
    q: 'What are the scoring, negative marking, and quiz assessment rules?',
  },
  {
    id: 'progress',
    category: 'study',
    label: 'Study Progress',
    icon: 'fa-chart-line',
    topic: 'progress',
    q: 'Summarize my study progress and what to revise next',
  },
  {
    id: 'consultancy',
    category: 'portal',
    label: 'Visa & Dossier',
    icon: 'fa-passport',
    topic: 'consultancy',
    q: 'What is my 8-stage Italy admissions and visa dossier status?',
  },
  {
    id: 'bio-plan',
    category: 'study',
    label: 'IMAT Study Plan',
    icon: 'fa-brain',
    topic: 'study',
    q: 'Create a high-yield 7-day revision strategy for IMAT & NEET core subjects',
  },
];

function parseInlineRuns(input: string): FormattedRun[] {
  const runs: FormattedRun[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      runs.push({ text: input.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      runs.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      runs.push({ text: token.slice(1, -1), code: true });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    runs.push({ text: input.slice(lastIndex) });
  }

  return runs.length > 0 ? runs : [{ text: input }];
}

/**
 * Converts markdown-lite AI text into structured, XSS-safe UI blocks.
 */
export function parseFormattedBlocks(text: string): FormattedBlock[] {
  const lines = (text || '').split(/\r?\n/);
  const blocks: FormattedBlock[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
      const clean = trimmed.replace(/^#{2,3}\s+/, '');
      blocks.push({ type: 'heading', runs: parseInlineRuns(clean) });
      continue;
    }

    if (/^[•*-]\s+/.test(trimmed)) {
      const clean = trimmed.replace(/^[•*-]\s+/, '');
      blocks.push({ type: 'bullet', runs: parseInlineRuns(clean) });
      continue;
    }

    const numMatch = /^(\d+)[.)]\s+(.+)$/.exec(trimmed);
    if (numMatch) {
      blocks.push({
        type: 'numbered',
        index: numMatch[1],
        runs: parseInlineRuns(numMatch[2]),
      });
      continue;
    }

    blocks.push({ type: 'paragraph', runs: parseInlineRuns(trimmed) });
  }

  return blocks;
}

interface IntentRule {
  topic: ChatTopic;
  keywords: string[];
  directPortal: boolean;
  respond: (t: StudentChatbotTelemetry, query: string) => { reply: string; followUps: string[] };
}

const INTENT_RULES: IntentRule[] = [
  {
    topic: 'consultancy',
    keywords: ['visa', 'apostille', 'hrd', 'passport', 'universitaly', 'dossier', 'consultan', '8-stage', 'italy admission'],
    directPortal: true,
    respond: (t) => {
      if (!t.isConsultancyOptedIn) {
        return {
          reply: `🛂 **Study Abroad Consultancy Status:**\n\n• **Portal Enrollment:** You have **not opted in** to Study Abroad Consultancy Assistance yet.\n• You can activate the **8-Stage Consular & Admissions Dossier** directly from the **Home** tab of your Student Dashboard anytime.\n• Once opted in, your Consultant Agent tracks Passport, Class 12th/MOI, HRD, MEA Apostille, Scholarship Docs, Universitaly Pre-enrolment, IMAT Registration, and Exam stages.`,
          followUps: ['What is my document verification status?', 'Summarize my study progress'],
        };
      }
      return {
        reply: `🛂 **8-Stage Consular & Admissions Dossier:**\n\n• **Verification Progress:** **${t.verifiedStagesCount} / ${t.totalStagesCount}** checklist stages verified.\n• **Document Breakdown:** ${t.verifiedDocsCount} Verified, ${t.inReviewDocsCount} In Review, ${t.notVerifiedDocsCount} Action Needed, ${t.pendingDocsCount} Pending.\n• Verification status is managed by your Consultant Agent & Academy Admin and visible on your **Home** dashboard.`,
        followUps: ['How do I check rejected/pending documents?', 'What are IMAT quiz rules?'],
      };
    },
  },
  {
    topic: 'registration',
    keywords: ['regist', 'doc', 'admit card', 'verify', 'verification', 'certificate', 'status'],
    directPortal: true,
    respond: (t) => ({
      reply: `📄 **Registration & Documentation Status:**\n\n• **Progress:** You currently have **${t.verifiedDocsCount} of ${t.totalDocsCount || 8}** required documents verified by Admin/Agent.\n• **Status Breakdown:** ${t.inReviewDocsCount} in review • ${t.pendingDocsCount} pending • ${t.notVerifiedDocsCount} flagged for attention.\n• Required records include: Entrance Admit Card, Class 12th Marksheet, Government ID / Passport, Medical Fitness Certificate, and Batch Registration Receipt.\n• Verification statuses are updated by Academy Administrators and Consultant Agents in real time.`,
      followUps: ['Show my visa dossier progress', 'How do I complete fee payment?'],
    }),
  },
  {
    topic: 'payment',
    keywords: ['pay', 'fee', 'tuition', 'receipt', 'installment', 'invoice', 'finance'],
    directPortal: true,
    respond: (t) => ({
      reply: `💳 **Fee Payment & Tuition Support:**\n\n• **Batch Allocation:** Assigned to **${t.batch}**.\n• **Payment Methods:** Online Card, UPI, NetBanking, and Medical Student Education Loans.\n• **Receipts:** Official fee payment receipts are synced directly to your Student Documentation list once verified by the Academic Directorate.\n• For installment adjustments or billing queries, contact **finance@medical.lms**.`,
      followUps: ['What is my document verification status?', 'What courses are in my batch?'],
    }),
  },
  {
    topic: 'enrollment',
    keywords: ['batch', 'enroll', 'course', 'subject', 'syllabus', 'module', 'curriculum'],
    directPortal: true,
    respond: (t) => {
      if (!t.permissions.courses) {
        return {
          reply: `🎓 **Batch-Wise Access Control:**\n\n• **Your Cohort:** ${t.batch}\n• **Module Permission:** Courses access is currently **locked** on your account. Please ask the Academy Administrator to enable \`courses\` permission under User Management.`,
          followUps: ['Check my document verification status', 'Check announcements & alerts'],
        };
      }
      const coursePreview = t.courseNames.length > 0
        ? t.courseNames.slice(0, 3).join(', ')
        : 'All batch-assigned medical courses';
      return {
        reply: `🎓 **Batch-Wise Access Control:**\n\n• **Your Cohort:** **${t.batch}**\n• **Enrolled Courses:** **${t.enrolledCoursesCount}** enrolled (${t.accessibleCoursesCount} available in your cohort: ${coursePreview}).\n• **Strict Batch Isolation:** Students enrolled in one batch only access modules matching their cohort to preserve exam pacing.\n• Core 7 subjects: **Biology, Chemistry, Physics, Maths, Logical Reasoning, English, and GK**.`,
        followUps: ['Summarize my study progress', 'Show active quizzes & rules'],
      };
    },
  },
  {
    topic: 'quiz',
    keywords: ['quiz', 'exam', 'test', 'mark', 'negative', 'option', 'dpp', 'pyq', 'mock'],
    directPortal: true,
    respond: (t) => {
      if (!t.permissions.quizzes) {
        return {
          reply: `📝 **Assessments & Quiz Protocols:**\n\n• Quizzes access is currently **locked** for your account until enabled by an Administrator.`,
          followUps: ['Check my batch & courses', 'Create an offline Biology revision plan'],
        };
      }
      const quizLine = t.quizTitles.length > 0
        ? `• **Ready to Attempt (${t.activeQuizzesCount}):** ${t.quizTitles.slice(0, 3).join(' • ')}\n`
        : `• **Available Modules:** ${t.activeQuizzesCount} assessment(s) synced in your cohort.\n`;
      return {
        reply: `📝 **Assessments & Quiz Protocols:**\n\n${quizLine}• **Marking Scheme:** **+4 marks** per correct response and **-1 mark** for incorrect answers.\n• **Format:** Multiple-choice questions with 5 options (A, B, C, D, E) and post-submission clinical rationale.\n• **Timer Policy:** Timed tests auto-submit cleanly when the countdown ends.`,
        followUps: ['Summarize my study progress', 'Give me negative-marking exam strategy'],
      };
    },
  },
  {
    topic: 'progress',
    keywords: ['progress', 'completed', 'chapter', 'topic', 'analytics', 'score', 'weak'],
    directPortal: true,
    respond: (t) => ({
      reply: `📊 **Live Study Progress Summary:**\n\n• **Completed Chapters:** **${t.completedChaptersCount}** chapters mastered\n• **Completed Topics:** **${t.completedTopicsCount}** topics checked off\n• **Cohort Batch:** **${t.batch}** (${t.enrolledCoursesCount} enrolled courses, ${t.activeQuizzesCount} active drills)\n• **Next Recommended Step:** Open the **Profile → Performance Analytics** view or finish 1 active DPP today to lock retention!`,
      followUps: ['Build a 7-day IMAT study plan', 'What are the quiz marking rules?'],
    }),
  },
  {
    topic: 'announcements',
    keywords: ['announc', 'notif', 'alert', 'news', 'calendar', 'schedule', 'deadline'],
    directPortal: true,
    respond: (t) => ({
      reply: `🔔 **Announcements & Alerts Summary:**\n\n• **Unread Notifications:** **${t.unreadNotificationsCount}** alert(s)\n• **Latest Announcement:** ${t.latestAnnouncementTitle || 'No recent announcements posted yet.'}\n• **Permissions:** Announcements (${t.permissions.announcements ? 'Enabled' : 'Locked'}), Notifications (${t.permissions.notifications ? 'Enabled' : 'Locked'}).`,
      followUps: ['What quizzes are active now?', 'Check my batch & courses'],
    }),
  },
];

function classifyIntent(query: string): IntentRule | null {
  const lower = query.toLowerCase();
  // Prefer detailed Groq AI for explicit conceptual/analytical prompts even if they mention "exam" or "course"
  const conceptualTriggers = [
    'explain ',
    'what is ',
    'difference between',
    'why does',
    'mechanism',
    'formula',
    'pathway',
    'how to solve',
    'study plan',
    'revision strategy',
    'mnemonic',
    'teach me',
  ];
  if (conceptualTriggers.some((phrase) => lower.includes(phrase)) && !lower.includes('my ')) {
    return null;
  }

  let bestRule: IntentRule | null = null;
  let bestHits = 0;

  for (const rule of INTENT_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) hits++;
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestRule = rule;
    }
  }

  return bestHits > 0 ? bestRule : null;
}

export function buildLocalChatbotResponse(
  query: string,
  telemetry: StudentChatbotTelemetry
): {
  reply: string;
  topic: ChatTopic;
  followUps: string[];
  directPortal: boolean;
} {
  const matched = classifyIntent(query);
  if (matched) {
    const out = matched.respond(telemetry, query);
    return {
      reply: out.reply,
      topic: matched.topic,
      followUps: out.followUps,
      directPortal: matched.directPortal,
    };
  }

  return {
    reply: `🤖 **Academic Study Assistant (${telemetry.batch}):**\n\nI received your question about "${query}". Here is your live campus snapshot:\n• **Enrolled Courses:** ${telemetry.enrolledCoursesCount} | **Completed Chapters:** ${telemetry.completedChaptersCount}\n• **Active Quizzes:** ${telemetry.activeQuizzesCount} | **Verified Docs:** ${telemetry.verifiedDocsCount}/${telemetry.totalDocsCount}\n\n• **Study Tip:** Pair 45-minute active recall blocks on high-weightage **Biology & Chemistry** topics with timed 5-option (+4/-1) drills for optimal IMAT/NEET accuracy.`,
    topic: 'study',
    followUps: [
      'Summarize my study progress',
      'Show my batch & courses',
      'What are the quiz marking rules?',
    ],
    directPortal: false,
  };
}

export async function resolveChatbotReply({
  message,
  history,
  telemetry,
  signal,
}: {
  message: string;
  history: ChatbotMessage[];
  telemetry: StudentChatbotTelemetry;
  signal?: AbortSignal;
}): Promise<{
  reply: string;
  topic: ChatTopic;
  followUps: string[];
  source: 'cloud' | 'local';
  model?: string;
  usedFallback?: boolean;
}> {
  const local = buildLocalChatbotResponse(message, telemetry);

  // Instant zero-latency reply for deterministic portal telemetry lookups
  if (local.directPortal) {
    return {
      reply: local.reply,
      topic: local.topic,
      followUps: local.followUps,
      source: 'local',
    };
  }

  // Open-ended academic or medical study query -> attempt backend Groq chat first
  const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  if (!isOnline) {
    return {
      reply: local.reply,
      topic: local.topic,
      followUps: local.followUps,
      source: 'local',
      usedFallback: true,
    };
  }

  try {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        message,
        history: history.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        studentContext: {
          batch: telemetry.batch,
          enrolledCoursesCount: telemetry.enrolledCoursesCount,
          activeQuizzesCount: telemetry.activeQuizzesCount,
          completedChaptersCount: telemetry.completedChaptersCount,
          verifiedDocsCount: telemetry.verifiedDocsCount,
          totalDocsCount: telemetry.totalDocsCount,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.success && typeof data.reply === 'string' && data.reply.trim()) {
        return {
          reply: data.reply.trim(),
          topic: 'study',
          followUps:
            Array.isArray(data.followUps) && data.followUps.length > 0
              ? data.followUps.slice(0, 3)
              : local.followUps,
          source: 'cloud',
          model: data.model,
        };
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw err;
    }
  }

  // Seamless offline / unconfigured fallback
  return {
    reply: local.reply,
    topic: local.topic,
    followUps: local.followUps,
    source: 'local',
    usedFallback: true,
  };
}

export function createWelcomeMessage(telemetry: StudentChatbotTelemetry): ChatbotMessage {
  const firstName = (telemetry.studentName || 'Student').split(' ')[0];
  return {
    id: 'welcome',
    sender: 'ai',
    text: `Hello **${firstName}**! I am your AI Academic Assistant.\n\n• **Batch:** ${telemetry.batch} • **Courses:** ${telemetry.enrolledCoursesCount} enrolled\n• **Progress:** ${telemetry.completedChaptersCount} chapters • **Docs Verified:** ${telemetry.verifiedDocsCount}/${telemetry.totalDocsCount}\n\nAsk me any **Biology, Chemistry, Physics, IMAT/NEET doubt** or tap a quick topic below!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'local',
    followUps: [
      'What is my document verification status?',
      'Summarize my study progress',
      'Explain active transport vs facilitated diffusion',
    ],
  };
}

export function loadChatbotHistory(userKey: string, welcome: ChatbotMessage): ChatbotMessage[] {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return [welcome];
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${userKey || 'anon'}`);
    if (!raw) return [welcome];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(-MAX_STORED_MESSAGES);
    }
  } catch {
    // Ignore malformed persisted chat
  }
  return [welcome];
}

export function saveChatbotHistory(userKey: string, messages: ChatbotMessage[]): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${userKey || 'anon'}`,
      JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
    );
  } catch {
    // Ignore quota limits
  }
}

export function clearChatbotHistory(userKey: string): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${userKey || 'anon'}`);
  } catch {
    // Ignore errors
  }
}

