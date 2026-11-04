import {
  GenerateRequest,
  GenerateResponse,
  VerificationReportData,
  HealthResponse,
} from '../types';
import { getUserApiKey } from './userKey';

// In development this stays relative and Vite proxies /api to localhost:5000.
// In production set VITE_API_BASE_URL to the deployed backend origin, e.g.
// https://product-copy-api.example.com/api
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function saveApiKey(apiKey: string): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/settings/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update API key');
  }

  return res.json();
}

/**
 * A visitor-supplied key is sent per request so it never becomes shared server
 * state. Without one, the API falls back to the operator's server-side secret.
 */
function requestHeaders(): Record<string, string> {
  const userKey = getUserApiKey();
  return {
    'Content-Type': 'application/json',
    ...(userKey ? { 'x-gemini-api-key': userKey } : {}),
  };
}

export async function generateDescriptions(
  payload: GenerateRequest
): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // Prefer the specific message (for example, an invalid API key) over the
    // generic endpoint error.
    throw new Error(
      errorData.message || errorData.error || `Generation failed: ${res.statusText}`
    );
  }

  return res.json();
}

export interface VerifyPayload {
  productName: string;
  features: string;
  description1: { audience: string; text: string };
  description2: { audience: string; text: string };
}

export async function verifyDescriptions(
  payload: VerifyPayload
): Promise<VerificationReportData> {
  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || `Verification failed: ${res.statusText}`
    );
  }

  return res.json();
}

