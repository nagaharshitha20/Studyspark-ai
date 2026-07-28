import { useCallback, useRef, useState } from "react";
import { generateStudySet, ApiError } from "../api/studyApi.js";

/**
 * Encapsulates the full lifecycle of a generation request:
 *   idle -> loading -> success | error
 *
 * Race-condition handling: every call to generate() gets a unique request
 * id and its own AbortController. If a newer request starts, the previous
 * one is aborted immediately, and even if an old request's response somehow
 * lands after that, we check the request id before committing it to state.
 * This guarantees a slow, stale response can never overwrite a newer result.
 */
export function useGenerateStudySet() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const latestRequestId = useRef(0);
  const abortControllerRef = useRef(null);

  const generate = useCallback(async (notes) => {
    // Cancel any in-flight request before starting a new one.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const requestId = ++latestRequestId.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const result = await generateStudySet(notes, controller.signal);

      // If a newer request has started since this one began, drop this result.
      if (requestId !== latestRequestId.current) return;

      setData(result);
      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return; // silently ignore cancellations
      if (requestId !== latestRequestId.current) return;

      const apiErr =
        err instanceof ApiError ? err : new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
      setError(apiErr);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    latestRequestId.current += 1;
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  return { status, data, error, generate, reset };
}
