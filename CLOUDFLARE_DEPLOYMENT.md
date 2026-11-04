# Deploying on Cloudflare

The app is deployed as **one Cloudflare Worker**:

- **Static frontend** — the built Vite SPA (`client/dist`) is uploaded as Workers Static Assets.
- **API** — `/api/health`, `/api/generate`, and `/api/verify` are handled by the same Worker (`server/src/worker.ts`).
- **Same origin** — the browser calls `/api` directly, so there is no CORS setup and no build-time API URL.

**Live deployment:** <https://product-description-generator.riishh-work.workers.dev>

---

## Why this architecture

Express with `app.listen()` cannot run on Workers as-is. Rather than keeping two hosts, the API was moved behind a standard Worker `fetch` handler. The Gemini call is a small REST client (`server/src/services/geminiClient.ts`), so the same service code runs on:

- Node + Express locally (`server/src/server.ts`)
- Cloudflare Workers in production (`server/src/worker.ts`)

No `nodejs_compat` flag, no Containers, no paid plan required.

---

## Prerequisites

- Node.js 20+
- A Cloudflare account
- Wrangler authenticated:

```bash
npx wrangler login
npx wrangler whoami
```

---

## One-time setup

### 1. Install dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Add the Gemini secret

Never put the API key in `wrangler.jsonc` or in frontend code.

```bash
npx wrangler secret put GEMINI_API_KEY
```

Paste the key when prompted. It is stored encrypted and exposed to the Worker as `env.GEMINI_API_KEY`.

For local Worker development, create `.dev.vars` in the repo root (already gitignored):

```
GEMINI_API_KEY=your_key_here
```

### 3. Build and deploy

```bash
npm run deploy
```

That runs `npm --prefix client run build` and then `wrangler deploy`. Equivalent manual commands:

```bash
npm --prefix client run build
npx wrangler deploy
```

Wrangler prints the deployment URL, for example:

```
https://product-description-generator.<your-subdomain>.workers.dev
```

---

## Local development

### Option A — Vite + Express (fastest iteration)

```bash
npm run server   # http://localhost:5000
npm run client   # http://localhost:5173 (proxies /api to :5000)
```

### Option B — Run the actual Worker locally

```bash
npm --prefix client run build
npm run worker:dev   # http://localhost:8787
```

This uses `.dev.vars` and the same static-asset routing as production.

---

## Configuration

### `wrangler.jsonc`

```jsonc
{
  "name": "product-description-generator",
  "main": "server/src/worker.ts",
  "compatibility_date": "2026-11-04",
  "assets": {
    "directory": "./client/dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application",
    "run_worker_first": ["/api/*"]
  }
}
```

- `not_found_handling: "single-page-application"` serves `index.html` for client-side routes.
- `run_worker_first: ["/api/*"]` guarantees API requests reach the Worker instead of the asset router.

### Worker environment variables

| Name | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key (use `wrangler secret put`) |
| `GEMINI_MODEL` | No | Primary model, default `gemini-3.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | No | Fallback model, default `gemini-3.8-flash` |
| `CLIENT_ORIGIN` | No | Comma-separated extra origins allowed by CORS |

Set optional plaintext variables in `wrangler.jsonc` under `"vars"`, or as secrets if sensitive:

```bash
npx wrangler secret put GEMINI_MODEL
```

### API key endpoint

`POST /api/settings/key` is intentionally **disabled in the hosted Worker** (returns `403`). Allowing visitors to replace the key at runtime would let anyone overwrite the operator's credentials. Change the key with `wrangler secret put` and redeploy.

---

## Custom domain

In the Cloudflare dashboard:

1. Open **Workers & Pages → product-description-generator → Settings → Domains & Routes**.
2. Add a custom domain such as `copy.example.com`.
3. Cloudflare creates the DNS record and certificate automatically.

Or add a route in `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "copy.example.com", "custom_domain": true }]
```

---

## Troubleshooting

**`Invalid _redirects configuration: Infinite loop detected`**

Workers Static Assets already handles SPA fallback. Do not ship a Pages-style `_redirects` file with `/* /index.html 200`. This repo relies on `not_found_handling` instead.

**`404` / Cloudflare error `1042` right after the first deploy**

Wait a few seconds for the route to propagate, then retry. Confirm the API directly:

```bash
curl https://<worker-url>/api/health
```

Expected:

```json
{"status":"ok","aiConnected":true,"model":"gemini-3.5-flash-lite"}
```

**`aiConnected: false`**

The secret is missing or was set on a different Worker name. Re-run:

```bash
npx wrangler secret put GEMINI_API_KEY
```

**Gemini returns `404` for a model**

Google retires model IDs. Update `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL` (or the defaults in the service) and redeploy. The app falls back to the deterministic factual generator instead of failing.

**Free plan CPU limits**

Gemini calls are network I/O, not CPU, so the free tier's 10 ms CPU limit is normally fine. If you expect heavy traffic, upgrade to Workers Paid for a higher CPU budget and request limits.

---

## Useful commands

```bash
npx wrangler tail                 # live production logs
npx wrangler deployments list     # deployment history
npx wrangler versions list        # uploaded versions
npx wrangler rollback             # roll back to the previous version
npx wrangler secret list          # secret names (not values)
```
