/**
 * Cloudflare Worker entrypoint.
 *
 * One Worker serves both the built SPA (client/dist, bound as ASSETS) and the
 * API under /api/*. Keeping them on the same origin means the frontend needs
 * no CORS configuration and no build-time API URL.
 */
import { generateInputSchema, verifyInputSchema } from './schemas/productSchema.js';
import { geminiService, countWords } from './services/gemini.js';
import { GeminiAuthError, validateApiKey } from './services/geminiClient.js';
import { PRIMARY_MODEL } from './services/models.js';
import { verifierService } from './services/verifier.js';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  GEMINI_API_KEY?: string;
  CLIENT_ORIGIN?: string;
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowed = (env.CLIENT_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  // Same-origin requests do not need CORS. Only emit headers when the caller
  // is a different origin that the operator explicitly allowed.
  if (!origin || allowed.length === 0 || !allowed.includes(origin)) {
    return {};
  }

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-gemini-api-key',
    vary: 'origin',
  };
}

function json(
  data: unknown,
  status: number,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Everything that is not an API route is handled by the static asset
    // router, which also provides the SPA fallback for client-side routes.
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // The operator's key is identical for every request, so binding it to the
    // singleton is safe. User-supplied keys are never stored on the singleton;
    // they are passed as a per-request override instead.
    if (env.GEMINI_API_KEY) {
      geminiService.setApiKey(env.GEMINI_API_KEY);
      verifierService.setApiKey(env.GEMINI_API_KEY);
    }

    const userApiKey =
      request.headers.get('x-gemini-api-key')?.trim() || undefined;
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json(
        {
          status: 'ok',
          aiConnected: geminiService.isConnected(),
          model: geminiService.getModelName(),
          timestamp: new Date().toISOString(),
        },
        200,
        cors
      );
    }

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      const body = await readBody(request);
      if (body === null) {
        return json({ error: 'Request body must be valid JSON' }, 400, cors);
      }

      const parsed = generateInputSchema.safeParse(body);
      if (!parsed.success) {
        return json(
          { error: 'Validation failed', details: parsed.error.flatten() },
          400,
          cors
        );
      }

      try {
        const input = parsed.data;
        const generated = await geminiService.generateDescriptions(
          input,
          userApiKey
        );

        return json(
          {
            productName: input.productName,
            description1: {
              audience: input.audience1,
              text: generated.description1Text,
              wordCount: countWords(generated.description1Text),
            },
            description2: {
              audience: input.audience2,
              text: generated.description2Text,
              wordCount: countWords(generated.description2Text),
            },
            comparison: generated.comparison,
          },
          200,
          cors
        );
      } catch (err) {
        console.error('Error in /api/generate:', err);
        return json(
          {
            error: 'Failed to generate descriptions',
            message: err instanceof Error ? err.message : 'Internal server error',
          },
          err instanceof GeminiAuthError ? 401 : 500,
          cors
        );
      }
    }

    if (url.pathname === '/api/verify' && request.method === 'POST') {
      const body = await readBody(request);
      if (body === null) {
        return json({ error: 'Request body must be valid JSON' }, 400, cors);
      }

      const parsed = verifyInputSchema.safeParse(body);
      if (!parsed.success) {
        return json(
          { error: 'Validation failed', details: parsed.error.flatten() },
          400,
          cors
        );
      }

      try {
        const report = await verifierService.verify(parsed.data, userApiKey);
        return json(report, 200, cors);
      } catch (err) {
        console.error('Error in /api/verify:', err);
        return json(
          {
            error: 'Failed to verify descriptions',
            message: err instanceof Error ? err.message : 'Internal server error',
          },
          err instanceof GeminiAuthError ? 401 : 500,
          cors
        );
      }
    }

    // Validate a visitor-supplied key. The key is used only for this check and
    // is never persisted server-side; the browser stores it and sends it back
    // per request. This lets the hosted app support bring-your-own-key without
    // letting anyone replace the operator's secret.
    if (url.pathname === '/api/settings/key' && request.method === 'POST') {
      const body = (await readBody(request)) as { apiKey?: unknown } | null;
      const apiKey =
        body && typeof body.apiKey === 'string' ? body.apiKey.trim() : '';

      if (!apiKey) {
        return json({ error: 'A Gemini API key is required' }, 400, cors);
      }

      const valid = await validateApiKey(apiKey);

      if (!valid) {
        return json(
          {
            error:
              'Gemini rejected this API key. Check that it is valid and enabled for the Gemini API.',
          },
          400,
          cors
        );
      }

      return json(
        {
          success: true,
          aiConnected: true,
          model: PRIMARY_MODEL,
        },
        200,
        cors
      );
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
