const express = require("express");
const router = express.Router();
const { handleGenerateMCQ, handleAIChat, GROQ_MODELS } = require("../controllers/aiController");

// Primary generation & interactive student chat endpoints
router.post("/generate", handleGenerateMCQ);
router.post("/chat", handleAIChat);

module.exports = router;
module.exports.GROQ_MODELS = GROQ_MODELS;

