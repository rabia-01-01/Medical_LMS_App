/**
 * AI Configuration & Model Hierarchy
 */
const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b"
];

module.exports = {
    GROQ_MODELS,
    GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
    MAX_QUESTION_COUNT: 25,
    MIN_QUESTION_COUNT: 1
};

