/**
 * Minimal Gemini REST client.
 *
 * The official SDK is convenient, but this app only needs `generateContent`
 * with a JSON response. Calling the REST API directly keeps the service
 * runtime-agnostic, which lets the exact same code run on Node and in a
 * Cloudflare Worker.
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAuthError';
  }
}

/**
 * Cheap key check: listing models requires authentication but does not consume
 * generation tokens. Returns false for rejected or unreachable keys.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?pageSize=1`, {
      headers: { 'x-goog-api-key': apiKey },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface GeminiJsonRequest {
  apiKey: string;
  models: string[];
  prompt: string;
  temperature: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

function extractText(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? '')
    .filter(Boolean)
    .join('');
}

export async function generateJson({
  apiKey,
  models,
  prompt,
  temperature,
}: GeminiJsonRequest): Promise<string> {
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature,
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text();

        if (
          response.status === 401 ||
          response.status === 403 ||
          (response.status === 400 && /api[_ ]?key/i.test(detail))
        ) {
          throw new GeminiAuthError(
            'Gemini rejected the API key. Check that the key is valid and has access to the Gemini API.'
          );
        }

        throw new Error(
          `Gemini ${model} returned ${response.status}: ${detail.slice(0, 300)}`
        );
      }

      const data = (await response.json()) as GeminiResponse;
      const text = extractText(data);

      if (!text) {
        throw new Error(`Gemini ${model} returned an empty response`);
      }

      return text;
    } catch (err) {
      if (err instanceof GeminiAuthError) throw err;

      lastError = err;
      console.warn(`Model ${model} failed, trying next candidate...`);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All Gemini model candidates failed');
}
