const { GROQ_MODELS, CHAT_GROQ_MODELS, GROQ_API_URL } = require("../config/aiConfig");

/**
 * Builds the system prompt for medical MCQ generation.
 */
function buildSystemPrompt(questionCount, subject, chapter, topic, targetBatch) {
    return `
You are an expert medical entrance examination question author.

Generate exactly ${questionCount} multiple-choice questions.

Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic || "All topics"}
Target cohort: ${targetBatch}

Requirements:
- Exactly 5 options per question.
- correctAnswer must be an integer from 0 to 4.
- Include a detailed explanation.
- Distribute correct answers across all five options.
- Return valid JSON only.

Expected format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D", "E"],
      "correctAnswer": 0,
      "explanation": "Explanation"
    }
  ]
}
`;
}

/**
 * Generates MCQs by iterating over available Groq models with fallback.
 */
async function generateMCQs({ subject, chapter, topic, targetBatch, questionCount }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY_MISSING");
    }

    const systemPrompt = buildSystemPrompt(questionCount, subject, chapter, topic, targetBatch);
    let result = null;
    let lastError = null;

    for (const model of GROQ_MODELS) {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Generate ${questionCount} questions for ${subject}, ${chapter}, ${topic || "all topics"}.` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.6
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                lastError = `Groq returned HTTP ${response.status}`;
                console.error(lastError, errorText);
                continue;
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) continue;

            const parsed = JSON.parse(content);
            if (
                Array.isArray(parsed.questions) &&
                parsed.questions.length === questionCount &&
                parsed.questions.every(q =>
                    typeof q.question === "string" &&
                    Array.isArray(q.options) &&
                    q.options.length === 5 &&
                    Number.isInteger(q.correctAnswer) &&
                    q.correctAnswer >= 0 &&
                    q.correctAnswer <= 4 &&
                    typeof q.explanation === "string"
                )
            ) {
                result = parsed.questions;
                break;
            }

            lastError = "Invalid question format returned by Groq.";
        } catch (error) {
            lastError = error.message;
            console.error("Groq model attempt failed:", error.message);
        }
    }

    if (!result) {
        throw new Error(lastError || "Unable to generate questions.");
    }

    return result;
}

/**
 * Builds concise, domain-aware system instructions for student tutoring & LMS help.
 */
function buildChatSystemPrompt(studentContext = {}) {
    const batch = typeof studentContext.batch === "string" && studentContext.batch.trim()
        ? studentContext.batch.trim()
        : "Unassigned";
    const courses = Number.isFinite(studentContext.enrolledCoursesCount) ? studentContext.enrolledCoursesCount : 0;
    const verifiedDocs = Number.isFinite(studentContext.verifiedDocsCount) ? studentContext.verifiedDocsCount : 0;
    const totalDocs = Number.isFinite(studentContext.totalDocsCount) ? studentContext.totalDocsCount : 0;
    const completedChapters = Number.isFinite(studentContext.completedChaptersCount) ? studentContext.completedChaptersCount : 0;
    const activeQuizzes = Number.isFinite(studentContext.activeQuizzesCount) ? studentContext.activeQuizzesCount : 0;

    return `You are the AI Academic Assistant for Sultanat e Italia Medica LMS (NEET, IMAT, UCAT, MCAT preparation and Study Abroad Italy admissions).
Keep replies accurate, structured with brief bullet points or bold key terms, concise (under 180 words unless explaining a medical concept), and encouraging.

Student Live Portal Context:
- Cohort Batch: ${batch}
- Enrolled Courses: ${courses}
- Active Quizzes Available: ${activeQuizzes}
- Completed Curriculum Chapters: ${completedChapters}
- Verified Consular/Registration Docs: ${verifiedDocs}/${totalDocs}
- Platform Rules: Standard assessments use +4 for correct, -1 for wrong across 5 options (A-E). Batch-wise isolation restricts courses/resources by cohort.

Return valid JSON only matching:
{
  "reply": "Markdown-formatted helpful answer",
  "followUps": ["Short follow-up prompt 1", "Short follow-up prompt 2"]
}`;
}

/**
 * Generates an interactive student assistant response via Groq with low-latency model fallback.
 */
async function generateChatReply({ message, history = [], studentContext = {} }) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY_MISSING");
    }

    const sanitizedHistory = Array.isArray(history)
        ? history
              .slice(-6)
              .filter((m) => m && (m.sender === "user" || m.sender === "ai") && typeof m.text === "string" && m.text.trim())
              .map((m) => ({
                  role: m.sender === "ai" ? "assistant" : "user",
                  content: m.text.trim().slice(0, 600)
              }))
        : [];

    const modelsToTry = Array.isArray(CHAT_GROQ_MODELS) && CHAT_GROQ_MODELS.length > 0
        ? CHAT_GROQ_MODELS
        : GROQ_MODELS;

    let lastError = null;
    for (const model of modelsToTry) {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                signal: AbortSignal.timeout(8500),
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: "system", content: buildChatSystemPrompt(studentContext) },
                        ...sanitizedHistory,
                        { role: "user", content: message.trim().slice(0, 1200) }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.45,
                    max_tokens: 512
                })
            });

            if (!response.ok) {
                lastError = `Groq chat returned HTTP ${response.status}`;
                continue;
            }

            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (!rawContent || typeof rawContent !== "string") continue;

            try {
                const parsed = JSON.parse(rawContent);
                if (typeof parsed.reply === "string" && parsed.reply.trim()) {
                    const followUps = Array.isArray(parsed.followUps)
                        ? parsed.followUps.filter((f) => typeof f === "string" && f.trim()).slice(0, 3)
                        : [];
                    return {
                        reply: parsed.reply.trim(),
                        followUps,
                        model
                    };
                }
            } catch {
                // Graceful fallback if model emits plain text
                return {
                    reply: rawContent.trim(),
                    followUps: [],
                    model
                };
            }
        } catch (error) {
            lastError = error.message;
        }
    }

    throw new Error(lastError || "Unable to reach AI chat assistant.");
}

module.exports = {
    generateMCQs,
    generateChatReply,
    buildSystemPrompt,
    buildChatSystemPrompt,
    GROQ_MODELS
};

