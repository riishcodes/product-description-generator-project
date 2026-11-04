/**
 * Minimal Gemini REST client.
 *
 * The official SDK is convenient, but this app only needs `generateContent`
 * with a JSON response. Calling the REST API directly keeps the service
 * runtime-agnostic, which lets the exact same code run on Node and in a
 * Cloudflare Worker.
 */

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

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
      lastError = err;
      console.warn(`Model ${model} failed, trying next candidate...`);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All Gemini model candidates failed');
}
