import { describe, it, expect } from 'vitest';
import { generateInputSchema } from '../schemas/productSchema.js';
import { GeminiService, countWords } from '../services/gemini.js';

describe('GenerateService & Input Schema Validation', () => {
  const gemini = new GeminiService();

  it('1. Rejects empty product name', () => {
    const result = generateInputSchema.safeParse({
      productName: '   ',
      features: 'Bluetooth connectivity\nLightweight design',
      audience1: 'Students',
      audience2: 'Working professionals',
      tone: 'Friendly and engaging',
      length: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.productName).toBeDefined();
    }
  });

  it('2. Rejects missing features', () => {
    const result = generateInputSchema.safeParse({
      productName: 'Wireless Headphones',
      features: '   ',
      audience1: 'Students',
      audience2: 'Working professionals',
      tone: 'Friendly and engaging',
      length: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.features).toBeDefined();
    }
  });

  it('3. Rejects duplicate target audiences', () => {
    const result = generateInputSchema.safeParse({
      productName: 'Wireless Headphones',
      features: 'Bluetooth connectivity',
      audience1: 'Students',
      audience2: 'Students',
      tone: 'Friendly and engaging',
      length: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.audience2).toContain(
        'Target Audience 2 must be different from Target Audience 1'
      );
    }
  });

  it('4. Successfully validates and generates descriptions for distinct audiences', async () => {
    const validData = {
      productName: 'Wireless Headphones',
      features: 'Bluetooth connectivity\nLightweight design\nCushioned ear pads\nBuilt-in microphone',
      audience1: 'Students',
      audience2: 'Working professionals',
      tone: 'Friendly and engaging' as const,
      length: 'short' as const,
    };

    const parsed = generateInputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const output = await gemini.generateDescriptions(parsed.data);

      expect(output.description1Text).toBeTruthy();
      expect(output.description2Text).toBeTruthy();
      expect(output.description1Text).not.toEqual(output.description2Text);

      // Verify word counts
      const w1 = countWords(output.description1Text);
      const w2 = countWords(output.description2Text);
      expect(w1).toBeGreaterThanOrEqual(15);
      expect(w2).toBeGreaterThanOrEqual(15);

      // Verify audience comparison structure
      expect(output.comparison.messagingDifferences).toBeTruthy();
      expect(output.comparison.benefitsEmphasized).toBeTruthy();
      expect(output.comparison.positioningSummary).toBeTruthy();
      expect(output.comparison.toneDifferences).toBeTruthy();
      expect(output.comparison.audienceAddressingSummary).toBeTruthy();
    }
  });

  it('5. Correctly calculates word counts', () => {
    expect(countWords('Hello world this is a test')).toBe(6);
    expect(countWords('   Extra   spaces   between words   ')).toBe(4);
    expect(countWords('')).toBe(0);
  });
});

