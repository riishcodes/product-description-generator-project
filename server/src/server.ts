// Must be first: loads .env before the service singletons read process.env.
import './env.js';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { generateRouter } from './routes/generate.js';
import { verifyRouter } from './routes/verify.js';
import { geminiService } from './services/gemini.js';
import { verifierService } from './services/verifier.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
// CLIENT_ORIGIN is a comma-separated allow-list in production. When omitted
// (local development), CORS stays open so the Vite dev server can connect.
const clientOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    clientOrigins.length > 0
      ? { origin: clientOrigins, methods: ['GET', 'POST', 'OPTIONS'] }
      : undefined
  )
);
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiConnected: geminiService.isConnected(),
    model: geminiService.getModelName(),
    timestamp: new Date().toISOString(),
  });
});

// Update API key
app.post('/api/settings/key', (req: Request, res: Response): void => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    res.status(400).json({ error: 'Valid API key string is required' });
    return;
  }
  const cleanKey = apiKey.trim();
  const success1 = geminiService.setApiKey(cleanKey);
  const success2 = verifierService.setApiKey(cleanKey);

  // Write to server/.env so it persists
  try {
    const envPath = path.resolve(__dirname, '../.env');
    fs.writeFileSync(envPath, `GEMINI_API_KEY=${cleanKey}\nPORT=5000\n`);
  } catch (err) {
    console.warn('Could not write to .env:', err);
  }

  res.json({
    success: success1 && success2,
    aiConnected: success1 && success2,
    model: geminiService.getModelName(),
  });
});

// Generation & Verification Endpoints
app.use('/api/generate', generateRouter);
app.use('/api/verify', verifyRouter);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`AI Engine: ${geminiService.getModelName()}`);
  });
}

export default app;

