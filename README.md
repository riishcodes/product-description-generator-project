# Product Description Generator

A focused web application built with **Arc UI**, **React 19**, **TypeScript**, **Node.js/Express** locally, and **Google Gemini** (`gemini-3.5-flash-lite` with a `gemini-3.8-flash` fallback) that generates concise, factual product descriptions tailored for two distinct target audiences and validates claims using an independent factual verification audit engine.

**Live demo:** <https://product-description-generator.riishh-work.workers.dev>

The frontend and API are deployed together as a single Cloudflare Worker. See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for the full guide.

---

## 🎯 Core Objectives

1. **Dual-Audience Description Generation**: Generates targeted product descriptions from verified basic specifications, adapting messaging and positioning without fabricating features.
2. **Side-by-Side Audience Comparison**: Compares messaging angles, highlighted benefits, tone shifts, and audience positioning between both outputs.
3. **Automated Factual Verification (Anti-Hallucination)**: Deterministically scans for unverified numbers, battery ratings, wireless ranges, fast-charging claims, and audio standards (e.g., ANC, Bluetooth 5.3), and extracts and classifies claims into `SUPPORTED`, `UNSUPPORTED`, and `NEEDS REVIEW`.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript + Vite 6
  - **Arc UI** design tokens, components, and blocks (`uiarc.dev`)
  - Tailwind CSS (Light editorial theme)
  - Motion / Framer Motion
  - Lucide React icons
- **Backend**:
  - Node.js & Express for local development
  - Cloudflare Worker `fetch` handler in production (`server/src/worker.ts`)
  - Gemini REST API (`server/src/services/geminiClient.ts`)
  - Models: `gemini-3.5-flash-lite` (primary) and `gemini-3.8-flash` (fallback), configurable via `GEMINI_MODEL` / `GEMINI_FALLBACK_MODEL`
  - Deterministic factual fallback mode when the API key is unavailable
  - Zod for request/response schema validation
  - Vitest test runner

---

## 🎨 Arc UI Design System & Components

The interface strictly adopts the Arc UI design system (`uiarc.dev`) and editorial aesthetic:

| Component / Block | Source | Usage in Application |
|---|---|---|
| `PageHeader` | Arc UI Block (`components/blocks/site-header`) | Top navigation bar, branding, live AI engine status indicator |
| `Card` | Arc UI Component (`components/card`) | Primary editorial surface for form, cards, comparison, and verification |
| `Button` | Arc UI Component (`components/button`) | Action buttons with loading spinners, states, and variants |
| `CopyButton` | Arc UI Component (`components/copy-button`) | One-click copy with smooth checkmark and tooltip confirmation |
| `Input` | Arc UI Component (`components/input`) | Single-line product name input with label and validation |
| `Textarea` | Arc UI Component (`components/textarea`) | Multiline verified specifications input with feature counter |
| `Select` | Arc UI Component (`components/select`) | Dropdowns for audience, writing tone, and description length |
| `Badge` | Arc UI Component (`components/badge`) | Classification status pills (`SUPPORTED`, `UNSUPPORTED`, `NEEDS REVIEW`) |
| `Tabs` | Arc UI Component (`components/tabs`) | Gliding indicator tabs for audience breakdown and claim filtering |
| `Alert` | Arc UI Component (`components/alert`) | Error banners and prominent hallucination warning alerts |
| `EmptyState` | Arc UI Component (`components/empty-state`) | Calm empty state card before descriptions are generated |
| `foundation.css` | Arc UI Foundation | Root CSS variables, radii, spring curves, and color tokens |

---

## 📋 Example Test Case (Prompt Specification)

- **Product Name**: Wireless Headphones
- **Features**:
  - Bluetooth connectivity
  - Lightweight design
  - Cushioned ear pads
  - Built-in microphone
- **Audience 1**: Students (Emphasizes campus usability, study sessions, and comfort)
- **Audience 2**: Working Professionals (Emphasizes workplace communication and meeting clarity)
- **Verification Rule**: Any invented metrics (e.g., *40-hour battery life*, *Bluetooth 5.3*, *Active Noise Cancellation*, *20-metre range*, *Fast charging*) are flagged immediately as `UNSUPPORTED`.

---

## 🚀 Running the Application

### 1. Environment Configuration

Copy `.env.example` to `server/.env`:

```bash
# In server/.env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.8-flash
# Optional comma-separated CORS allow-list for a separately hosted frontend
CLIENT_ORIGIN=
```

> **Note**: If `GEMINI_API_KEY` is not provided, the application runs using its built-in **Deterministic Factual Engine**, allowing full offline generation, side-by-side comparison, and anti-hallucination verification.

### 2. Run Backend & Frontend

Start the backend server (Port 5000):
```bash
cd server
npm run dev
```

Start the frontend client (Port 5173):
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Deploy to Cloudflare

```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

The frontend and API deploy together as one Worker. Full details, custom domains, and troubleshooting are in [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).

---

## 🧪 Automated Tests

Run the backend verification and generation test suite:
```bash
npm --prefix server run test
```

### Test Coverage Highlights:
- ✅ Factual claim validation without hallucinations
- ✅ Deterministic detection and flagging of unsupplied battery ratings
- ✅ Flagging of unverified Bluetooth versions (e.g. Bluetooth 5.3)
- ✅ Flagging of unverified Active Noise Cancellation (ANC)
- ✅ Flagging of unverified wireless range measurements
- ✅ Flagging of unverified fast charging
- ✅ Passing of numeric and metric claims when explicitly in features
- ✅ Zod schema rejection of empty names, missing features, and duplicate audiences
- ✅ Independent single audience regeneration logic

