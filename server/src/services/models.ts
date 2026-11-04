import { readEnv } from './runtime.js';

/**
 * Model IDs are configurable so they can be updated without a code change.
 * The defaults are verified against the Gemini API. Override them with
 * GEMINI_MODEL / GEMINI_FALLBACK_MODEL.
 */
export const PRIMARY_MODEL =
  readEnv('GEMINI_MODEL')?.trim() || 'gemini-3.5-flash-lite';

export const FALLBACK_MODEL =
  readEnv('GEMINI_FALLBACK_MODEL')?.trim() || 'gemini-3.8-flash';

export const MODEL_CANDIDATES = [PRIMARY_MODEL, FALLBACK_MODEL];
