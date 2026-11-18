import { readEnv } from './runtime.js';

/**
 * Model IDs are configurable so they can be updated without a code change.
 * The defaults include both configured models and standard Google AI Studio
 * models (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash) so any valid
 * Gemini API key works reliably.
 */
export const PRIMARY_MODEL =
  readEnv('GEMINI_MODEL')?.trim() || 'gemini-2.5-flash';

export const FALLBACK_MODEL =
  readEnv('GEMINI_FALLBACK_MODEL')?.trim() || 'gemini-2.0-flash';

export const MODEL_CANDIDATES = Array.from(
  new Set(
    [
      PRIMARY_MODEL,
      FALLBACK_MODEL,
      readEnv('GEMINI_MODEL')?.trim(),
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
    ].filter((m): m is string => Boolean(m && m.trim()))
  )
);

