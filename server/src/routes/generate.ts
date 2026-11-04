import { Router, Request, Response } from 'express';
import { generateInputSchema } from '../schemas/productSchema.js';
import { geminiService, countWords } from '../services/gemini.js';

export const generateRouter = Router();

generateRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = generateInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten(),
      });
      return;
    }

    const input = parseResult.data;
    const userApiKey = req.header('x-gemini-api-key')?.trim() || undefined;
    const generated = await geminiService.generateDescriptions(input, userApiKey);

    const wordCount1 = countWords(generated.description1Text);
    const wordCount2 = countWords(generated.description2Text);

    res.json({
      productName: input.productName,
      description1: {
        audience: input.audience1,
        text: generated.description1Text,
        wordCount: wordCount1,
      },
      description2: {
        audience: input.audience2,
        text: generated.description2Text,
        wordCount: wordCount2,
      },
      comparison: generated.comparison,
    });
  } catch (err: any) {
    console.error('Error in /api/generate:', err);
    res.status(500).json({
      error: 'Failed to generate descriptions',
      message: err.message || 'Internal server error',
    });
  }
});

