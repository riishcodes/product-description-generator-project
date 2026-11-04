const STORAGE_KEY = 'pdp.gemini.apiKey';

/**
 * The key belongs to the visitor, not to this application. It is stored in the
 * browser only and sent to the app's API as a per-request header. The server
 * never persists it.
 */
export function getUserApiKey(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function setUserApiKey(apiKey: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, apiKey.trim());
  } catch {
    // Storage can be unavailable in private modes; the app still works for
    // the current request because the key is read back from state.
  }
}

export function clearUserApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '••••';
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}
