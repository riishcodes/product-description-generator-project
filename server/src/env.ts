/**
 * Node-only environment loader. This module is imported by server.ts (the
 * local Express entrypoint) and never by worker.ts, because Cloudflare
 * Workers inject environment variables through the platform.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const candidateEnvPaths = [
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
