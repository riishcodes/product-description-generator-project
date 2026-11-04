import { Router, Request, Response } from 'express';
import { verifyInputSchema } from '../schemas/productSchema.js';
import { verifierService } from '../services/verifier.js';

export const verifyRouter = Router();

verifyRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = verifyInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const input = parseResult.data;
    const report = await verifierService.verify(input);

    res.json(report);
  } catch (err: any) {
    console.error('Error in /api/verify:', err);
    res.status(500).json({
      error: 'Failed to verify descriptions',
      message: err.message || 'Internal server error',
    });
  }
});

