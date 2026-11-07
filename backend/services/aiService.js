const { GROQ_MODELS, GROQ_API_URL } = require("../config/aiConfig");

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

module.exports = {
    generateMCQs,
    buildSystemPrompt,
    GROQ_MODELS
};

