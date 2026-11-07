const { generateMCQs, GROQ_MODELS } = require("../services/aiService");
const { MIN_QUESTION_COUNT, MAX_QUESTION_COUNT } = require("../config/aiConfig");

/**
 * Handles MCQ generation request.
 */
async function handleGenerateMCQ(req, res) {
    try {
        const { subject, chapter, topic, targetBatch, questionCount } = req.body;

        if (
            !subject ||
            !chapter ||
            !Number.isInteger(questionCount) ||
            questionCount < MIN_QUESTION_COUNT ||
            questionCount > MAX_QUESTION_COUNT
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

        const questions = await generateMCQs({
            subject,
            chapter,
            topic,
            targetBatch,
            questionCount
        });

        return res.json({
            success: true,
            questions
        });
    } catch (error) {
        if (error.message === "GROQ_API_KEY_MISSING") {
            return res.status(500).json({
                error: "Groq API key is not configured on the server."
            });
        }

        console.error("AI generation error:", error.message);
        return res.status(502).json({
            error: error.message || "Unable to generate questions."
        });
    }
}

module.exports = {
    handleGenerateMCQ,
    GROQ_MODELS
};

