/**
 * Small runtime helper so the services can run both on Node (local Express
 * server) and in a Cloudflare Worker, where `process` is only available when
 * nodejs_compat is enabled.
 */
export function readEnv(name: string): string | undefined {
  try {
    if (typeof process === 'undefined') return undefined;
    return process.env?.[name];
  } catch {
    return undefined;
  }
}

export function isTestEnvironment(): boolean {
  return readEnv('NODE_ENV') === 'test' || readEnv('VITEST') === 'true';
}
