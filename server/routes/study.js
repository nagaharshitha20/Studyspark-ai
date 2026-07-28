import { Router } from "express";
import { generateStudySet } from "../services/geminiService.js";
import { parseAndValidateStudySet } from "../validators/studySetSchema.js";

const router = Router();

const ERROR_STATUS_MAP = {
  TIMEOUT: 504,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  AUTH_ERROR: 500, // server misconfiguration, not the client's fault
  EMPTY_RESPONSE: 502,
  UNKNOWN: 500,
};

router.post("/generate", async (req, res) => {
  const { notes } = req.body;

  if (!notes || typeof notes !== "string" || !notes.trim()) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Please provide some notes to generate a study set from.",
    });
  }

  if (notes.length > 12000) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Notes are too long (max ~12,000 characters). Try trimming them down.",
    });
  }

  let rawText;
  try {
    rawText = await generateStudySet(notes);
  } catch (err) {
    const status = ERROR_STATUS_MAP[err.code] || 500;
    console.error(`[generateStudySet] ${err.code}:`, err.message);
    return res.status(status).json({
      error: err.code || "UNKNOWN",
      message: userFacingMessage(err.code),
    });
  }

  const result = parseAndValidateStudySet(rawText);
  if (!result.success) {
    console.error("[parseAndValidateStudySet] failed:", result.error, result.details);
    return res.status(422).json({
      error: "INVALID_MODEL_OUTPUT",
      message: "The model returned something we couldn't parse into a study set. Please try again.",
      details: result.details,
    });
  }

  return res.status(200).json({ data: result.data });
});

function userFacingMessage(code) {
  switch (code) {
    case "TIMEOUT":
      return "The model took too long to respond. Please try again.";
    case "RATE_LIMITED":
      return "We're being rate limited by the AI provider. Please wait a moment and try again.";
    case "UPSTREAM_ERROR":
      return "The AI provider had an issue on their end. Please try again shortly.";
    case "AUTH_ERROR":
      return "Server is misconfigured (invalid API key). Contact the site owner.";
    case "EMPTY_RESPONSE":
      return "The model returned an empty response. Please try again.";
    default:
      return "Something went wrong generating your study set. Please try again.";
  }
}

export default router;
