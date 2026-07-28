import { z } from "zod";

/**
 * This is the single source of truth for "what a valid study set looks like".
 * Both the prompt sent to Claude and this schema are derived from the same
 * shape on purpose -- if you change one, change the other.
 *
 * We validate here (server-side) rather than trusting the client, because:
 *  1. The model can and will occasionally return malformed/partial JSON.
 *  2. We never want to forward garbage to the frontend and let it crash there.
 */

const FlashcardSchema = z.object({
  question: z.string().trim().min(1, "Flashcard question cannot be empty"),
  answer: z.string().trim().min(1, "Flashcard answer cannot be empty"),
});

const QuizQuestionSchema = z
  .object({
    question: z.string().trim().min(1),
    options: z
      .array(z.string().trim().min(1))
      .min(2, "A quiz question needs at least 2 options")
      .max(6, "Too many options"),
    correctIndex: z.number().int().min(0),
    explanation: z.string().trim().min(1),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "correctIndex is out of range for the given options array",
    path: ["correctIndex"],
  });

export const StudySetSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(120),
  summary: z.string().trim().min(1).max(600),
  flashcards: z
    .array(FlashcardSchema)
    .min(1, "Need at least one flashcard")
    .max(30, "Too many flashcards, something likely went wrong"),
  quiz: z
    .array(QuizQuestionSchema)
    .min(1, "Need at least one quiz question")
    .max(20, "Too many quiz questions, something likely went wrong"),
});

/**
 * Attempts to extract a JSON object from raw model text and validate it.
 * Models sometimes wrap JSON in ```json fences or add stray text even when
 * told not to -- this defends against that without silently accepting junk.
 *
 * Returns { success: true, data } or { success: false, error }.
 */
export function parseAndValidateStudySet(rawText) {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return { success: false, error: "Model returned an empty response." };
  }

  const jsonCandidate = extractJsonBlock(rawText);

  let parsedJson;
  try {
    parsedJson = JSON.parse(jsonCandidate);
  } catch (err) {
    return {
      success: false,
      error: "Model response was not valid JSON.",
      raw: rawText.slice(0, 500),
    };
  }

  const result = StudySetSchema.safeParse(parsedJson);
  if (!result.success) {
    return {
      success: false,
      error: "Model response did not match the expected study set shape.",
      details: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  return { success: true, data: result.data };
}

function extractJsonBlock(text) {
  const trimmed = text.trim();

  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // Otherwise, grab the outermost { ... } block in case of stray prose.
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}
