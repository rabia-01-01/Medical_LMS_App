const express = require("express");
const router = express.Router();
const { handleGenerateMCQ, GROQ_MODELS } = require("../controllers/aiController");

// Primary generation endpoint
router.post("/generate", handleGenerateMCQ);

module.exports = router;
module.exports.GROQ_MODELS = GROQ_MODELS;

