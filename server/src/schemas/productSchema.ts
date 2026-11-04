import { z } from 'zod';

export const generateInputSchema = z
  .object({
    productName: z.string().trim().min(1, 'Product name is required').max(200),
    features: z
      .string()
      .trim()
      .min(3, 'At least one verified product feature is required')
      .max(4000),
    audience1: z.string().trim().min(1, 'Audience 1 is required').max(100),
    audience2: z.string().trim().min(1, 'Audience 2 is required').max(100),
    tone: z
      .enum([
        'Friendly and engaging',
        'Professional and informative',
        'Persuasive and sales-focused',
      ])
      .default('Friendly and engaging'),
    length: z.enum(['short', 'medium', 'detailed']).default('short'),
    regenerateTarget: z.enum(['audience1', 'audience2', 'both']).optional(),
    existingDescription1: z.string().optional(),
    existingDescription2: z.string().optional(),
  })
  .refine((data) => data.audience1.toLowerCase() !== data.audience2.toLowerCase(), {
    message: 'Target Audience 2 must be different from Target Audience 1',
    path: ['audience2'],
  });

export type GenerateInput = z.infer<typeof generateInputSchema>;

export const verifyInputSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').max(200),
  features: z.string().trim().min(1, 'Features are required').max(4000),
  description1: z.object({
    audience: z.string().min(1),
    text: z.string().min(1),
  }),
  description2: z.object({
    audience: z.string().min(1),
    text: z.string().min(1),
  }),
});

export type VerifyInput = z.infer<typeof verifyInputSchema>;

// Zod schemas for AI responses
export const aiGeneratedContentSchema = z.object({
  description1Text: z.string().min(10),
  description2Text: z.string().min(10),
  comparison: z.object({
    messagingDifferences: z.string().min(5),
    benefitsEmphasized: z.string().min(5),
    positioningSummary: z.string().min(5),
    toneDifferences: z.string().min(5),
    audienceAddressingSummary: z.string().min(5),
  }),
});

export type AIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;

export const verifiedClaimSchema = z.object({
  id: z.string(),
  claimText: z.string().min(1),
  audience: z.string().min(1),
  classification: z.enum(['SUPPORTED', 'UNSUPPORTED', 'NEEDS REVIEW']),
  reason: z.string().min(1),
  isNumericalOrMetric: z.boolean().default(false),
});

export type VerifiedClaim = z.infer<typeof verifiedClaimSchema>;

export const verificationReportSchema = z.object({
  totalClaims: z.number(),
  supportedCount: z.number(),
  unsupportedCount: z.number(),
  needsReviewCount: z.number(),
  overallStatus: z.enum(['PASSED', 'FLAGGED', 'WARNING']),
  summary: z.string(),
  claims: z.array(verifiedClaimSchema),
});

export type VerificationReport = z.infer<typeof verificationReportSchema>;

