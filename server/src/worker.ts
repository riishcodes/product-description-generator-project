/**
 * Cloudflare Worker entrypoint.
 *
 * One Worker serves both the built SPA (client/dist, bound as ASSETS) and the
 * API under /api/*. Keeping them on the same origin means the frontend needs
 * no CORS configuration and no build-time API URL.
 */
import { generateInputSchema, verifyInputSchema } from './schemas/productSchema.js';
import { geminiService, countWords } from './services/gemini.js';
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
    'access-control-allow-headers': 'content-type',
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

    // Secrets are injected by Cloudflare, so bind them to the service
    // singletons on each request. This also keeps local `wrangler dev` simple.
    if (env.GEMINI_API_KEY) {
      geminiService.setApiKey(env.GEMINI_API_KEY);
      verifierService.setApiKey(env.GEMINI_API_KEY);
    }

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
        const generated = await geminiService.generateDescriptions(input);

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
          500,
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
        const report = await verifierService.verify(parsed.data);
        return json(report, 200, cors);
      } catch (err) {
        console.error('Error in /api/verify:', err);
        return json(
          {
            error: 'Failed to verify descriptions',
            message: err instanceof Error ? err.message : 'Internal server error',
          },
          500,
          cors
        );
      }
    }

    // The hosted app uses a server-side secret. Letting visitors replace it at
    // runtime would let anyone overwrite the operator's key.
    if (url.pathname === '/api/settings/key') {
      return json(
        {
          error:
            'API key updates are disabled in the hosted deployment. Set the GEMINI_API_KEY secret with `wrangler secret put GEMINI_API_KEY`.',
        },
        403,
        cors
      );
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
