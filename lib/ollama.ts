import { OllamaMessage, OllamaChatRequest } from './types';

// Ollama inference server running on NVIDIA Jetson
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://192.168.0.111:11434';

/**
 * Cold-start timeout for the Jetson.
 * With keep_alive: 0, each request requires:
 *   - ~5-8s to deallocate VRAM, reallocate CUDA blocks, and load the model
 *   - Variable generation time depending on prompt length
 * We set a generous 5-minute timeout to handle long generations
 * without risking premature disconnection.
 */
const OLLAMA_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Creates an Ollama chat request body.
 * CRITICAL: keep_alive is ALWAYS set to 0 to free VRAM immediately
 * on the Jetson (8GB unified RAM limit).
 */
export function createOllamaChatRequest(
  model: string,
  messages: OllamaMessage[]
): OllamaChatRequest {
  return {
    model,
    messages,
    stream: true,
    keep_alive: 0, // CRITICAL: Free VRAM immediately after response
    options: {
      repeat_penalty: 1.2,
      temperature: 0.7,
    },
  };
}

/**
 * Fetches a streaming response from the Ollama /api/chat endpoint.
 * Returns the raw Response so the caller can process the NDJSON stream.
 *
 * Uses AbortController with a generous timeout to tolerate:
 * - Cold-start VRAM allocation (5-8s with keep_alive: 0)
 * - Long generation times for complex prompts
 */
export async function fetchOllamaStream(
  model: string,
  messages: OllamaMessage[]
): Promise<Response> {
  const body = createOllamaChatRequest(model, messages);

  // AbortController with generous timeout for cold-start tolerance
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    // Clear timeout once we get a response — the stream itself will manage its own lifecycle
    clearTimeout(timeoutId);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Ollama timeout: Jetson did not respond within ${OLLAMA_TIMEOUT_MS / 1000}s. ` +
        `Is the Jetson online at ${OLLAMA_BASE_URL}?`
      );
    }

    throw error;
  }
}
