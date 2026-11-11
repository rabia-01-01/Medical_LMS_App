
const express = require("express");
const router = express.Router();
const { handleAIChat } = require("../controllers/aiController");

const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b"
];

router.post("/generate", async (req, res) => {
    try {
        const {
            subject,
            chapter,
            topic,
            targetBatch,
            questionCount
        } = req.body;

        if (
            !subject ||
            !chapter ||
            !Number.isInteger(questionCount) ||
            questionCount < 1 ||
            questionCount > 25
        ) {
            return res.status(400).json({
                error: "Invalid question generation details."
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "Groq API key is not configured on the server."
            });
        }

        const systemPrompt = `
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

        let result = null;
        let lastError = null;

        for (const model of GROQ_MODELS) {
            try {
                const response = await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                        },
                        body: JSON.stringify({
                            model,
                            messages: [
                                {
                                    role: "system",
                                    content: systemPrompt
                                },
                                {
                                    role: "user",
                                    content: `Generate ${questionCount} questions for ${subject}, ${chapter}, ${topic || "all topics"}.`
                                }
                            ],
                            response_format: {
                                type: "json_object"
                            },
                            temperature: 0.6
                        })
                    }
                );

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
            return res.status(502).json({
                error: lastError || "Unable to generate questions."
            });
        }

        return res.json({
            success: true,
            questions: result
        });

    } catch (error) {
        console.error("AI generation error:", error.message);

        return res.status(500).json({
            error: "Internal server error during question generation."
        });
    }
});

router.post("/chat", handleAIChat);

module.exports = router;
