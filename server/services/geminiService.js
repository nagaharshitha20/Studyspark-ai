import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/studyPrompt.js";

const MODEL_NAME = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/responses";
const REQUEST_TIMEOUT_MS = 30_000;

function getApiKey() {
  return process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
}

function extractTextFromGroqResponse(json) {
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text.trim();
  }

  const pieces = [];
  for (const item of json?.output ?? []) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part?.type === "output_text" && typeof part.text === "string") {
          pieces.push(part.text);
        }
      }
    }
    if (item?.type === "output_text" && typeof item.text === "string") {
      pieces.push(item.text);
    }
  }

  return pieces.join("").trim();
}

/**
 * Calls GROQ/OpenAI-compatible API to generate a study set from raw notes.
 * Throws a typed error with a `.code` so the route layer can map it to the
 * right HTTP status / user-facing message.
 */
export async function generateStudySet(notes) {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error("GROQ_API_KEY is not configured on the server.");
    err.code = "AUTH_ERROR";
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL_NAME,
        instructions: SYSTEM_PROMPT,
        input: buildUserPrompt(notes),
        max_output_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      let bodyText = "";
      try {
        bodyText = await response.text();
      } catch {
        /* ignore */
      }

      if (status === 429) {
        const rateErr = new Error("Rate limited by the AI provider.");
        rateErr.code = "RATE_LIMITED";
        throw rateErr;
      }
      if (status === 401 || status === 403) {
        const authErr = new Error("Invalid or missing API key.");
        authErr.code = "AUTH_ERROR";
        throw authErr;
      }
      if (status >= 500) {
        const upstreamErr = new Error("The AI provider had an internal error.");
        upstreamErr.code = "UPSTREAM_ERROR";
        throw upstreamErr;
      }

      const genericErr = new Error(`AI request failed with status ${status}: ${bodyText.slice(0, 300)}`);
      genericErr.code = "UNKNOWN";
      throw genericErr;
    }

    const json = await response.json();
    const text = extractTextFromGroqResponse(json);
    if (!text) {
      const err = new Error("AI response contained no text.");
      err.code = "EMPTY_RESPONSE";
      throw err;
    }

    return text;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutErr = new Error("Model request timed out.");
      timeoutErr.code = "TIMEOUT";
      throw timeoutErr;
    }
    if (!err.code) err.code = "UNKNOWN";
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
