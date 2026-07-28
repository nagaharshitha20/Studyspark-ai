/**
 * Thin fetch wrapper around POST /api/study/generate.
 * Accepts an AbortSignal so callers (see useGenerateStudySet) can cancel
 * in-flight requests -- this is what prevents a stale response from a
 * previous "Generate" click overwriting a newer one.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function generateStudySet(notes, signal) {
  const response = await fetch(`${API_BASE_URL}/api/study/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
    signal,
  });

  let body;
  try {
    body = await response.json();
  } catch {
    // Server sent back something that wasn't JSON at all (e.g. a raw 502
    // HTML error page from a proxy). Normalize into our error shape.
    throw new ApiError("SERVER_ERROR", "Server returned an unreadable response.", response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      body.error || "UNKNOWN",
      body.message || "Something went wrong.",
      response.status,
      body.details
    );
  }

  return body.data;
}

export class ApiError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
