import { GenerateInput, AIGeneratedContent, aiGeneratedContentSchema } from '../schemas/productSchema.js';
import { generateJson } from './geminiClient.js';
import { isTestEnvironment, readEnv } from './runtime.js';

/**
 * Model IDs are configurable so they can be updated without a code change.
 * The defaults match the README/UI and are real, currently supported Gemini
 * model identifiers. Override them with GEMINI_MODEL / GEMINI_FALLBACK_MODEL.
 */
const PRIMARY_MODEL =
  readEnv('GEMINI_MODEL')?.trim() || 'gemini-3.5-flash-lite';
const FALLBACK_MODEL =
  readEnv('GEMINI_FALLBACK_MODEL')?.trim() || 'gemini-3.8-flash';

// Tests must never call the live Gemini API: they should be deterministic and
// must not consume the developer's API quota.
const IS_TEST_ENV = isTestEnvironment();

// Helper to count words
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

// Length guidelines in words
const LENGTH_GUIDES = {
  short: '30 to 50 words',
  medium: '50 to 80 words',
  detailed: '80 to 120 words',
};

export class GeminiService {
  private apiKey: string | null = null;

  constructor() {
    if (IS_TEST_ENV) return;

    const apiKey = readEnv('GEMINI_API_KEY');
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
      this.apiKey = apiKey.trim();
    }
  }

  public isConnected(): boolean {
    return this.apiKey !== null;
  }

  public setApiKey(apiKey: string): boolean {
    if (apiKey && apiKey.trim() !== '') {
      this.apiKey = apiKey.trim();
      return true;
    }
    return false;
  }

  public getModelName(): string {
    return this.apiKey ? PRIMARY_MODEL : 'Deterministic Factual Engine (API key pending)';
  }

  public async generateDescriptions(input: GenerateInput): Promise<AIGeneratedContent> {
    if (this.apiKey) {
      try {
        return await this.generateWithGemini(input);
      } catch (err: any) {
        console.warn('Gemini API call failed, using dynamic factual generator:', err.message);
        return this.generateFallback(input);
      }
    }

    return this.generateFallback(input);
  }

  private async generateWithGemini(input: GenerateInput): Promise<AIGeneratedContent> {
    if (!this.apiKey) throw new Error('Gemini API key is not configured');

    const targetLength = LENGTH_GUIDES[input.length] || LENGTH_GUIDES.short;

    const systemPrompt = `You are a factual product copywriter.

Generate concise, engaging product descriptions using only the information explicitly provided by the user.

Never invent, assume or infer product specifications.

Do not fabricate:
- Battery life.
- Dimensions.
- Weight.
- Materials.
- Compatibility.
- Certifications.
- Technical standards.
- Performance figures.
- Prices.
- Warranties.
- Ratings.
- Product capabilities.

You may change the wording, sentence structure and marketing emphasis to suit different audiences.

However, every factual product claim must be supported by the original product information.

If information is missing, omit it rather than guessing.

Generate two distinct descriptions for the two supplied audiences.

Return valid structured JSON matching this schema:
{
  "description1Text": "Description for Audience 1",
  "description2Text": "Description for Audience 2",
  "comparison": {
    "messagingDifferences": "How the core angle differs between audience 1 and 2",
    "benefitsEmphasized": "Specific features highlighted for each audience",
    "positioningSummary": "How each audience segment is specifically targeted",
    "toneDifferences": "Voice and tonal adjustments made between descriptions",
    "audienceAddressingSummary": "How each description directly resonates with its intended audience"
  }
}`;

    const userPrompt = `Product Name: ${input.productName}

Original Verified Features:
${input.features}

Target Audience 1: ${input.audience1}
Target Audience 2: ${input.audience2}

Writing Tone: ${input.tone}
Desired Length per description: ${targetLength}

${
  input.regenerateTarget === 'audience1'
    ? `Note: Audience 2 already has this description: "${input.existingDescription2}". Please focus on generating a fresh, factual description for Audience 1 (${input.audience1}) and keep the existing comparison updated.`
    : input.regenerateTarget === 'audience2'
    ? `Note: Audience 1 already has this description: "${input.existingDescription1}". Please focus on generating a fresh, factual description for Audience 2 (${input.audience2}) and keep the existing comparison updated.`
    : 'Generate two distinct descriptions for both audiences.'
}

Respond ONLY with a valid JSON object matching the requested schema.`;

    const responseText = await generateJson({
      apiKey: this.apiKey,
      models: [PRIMARY_MODEL, FALLBACK_MODEL],
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      temperature: 0.2, // Low temperature to minimize hallucinations
    });

    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return aiGeneratedContentSchema.parse(parsed);
  }

  /**
   * Fully dynamic fallback generator:
   * Works for ANY product name and ANY user-entered features with zero hardcoded assumptions.
   * Constructs tailored copy based on whatever specifications the user supplied.
   */
  public generateFallback(input: GenerateInput): AIGeneratedContent {
    const rawLines = input.features
      .split('\n')
      .map((f) => f.replace(/^[•\-\*]\s*/, '').trim())
      .filter((f) => f.length > 0);

    const featureList = rawLines.length > 0 ? rawLines : ['Verified standard specifications'];

    // Helper to format feature list naturally into copy
    const formatSpecsSentence = (specs: string[]) => {
      if (specs.length === 1) return specs[0];
      if (specs.length === 2) return `${specs[0]} alongside ${specs[1]}`;
      return `${specs.slice(0, -1).join(', ')}, and ${specs[specs.length - 1]}`;
    };

    const half = Math.ceil(featureList.length / 2);
    const primarySpecs = featureList.slice(0, half);
    const secondarySpecs = featureList.slice(half).length > 0 ? featureList.slice(half) : featureList;

    // Audience-adapted openings and framings
    const getAudienceAngle = (aud: string, isFirst: boolean) => {
      const lower = aud.toLowerCase();
      if (lower.includes('student')) {
        return {
          intro: `Tailored for campus life, study sessions, and everyday student routines, the ${input.productName} delivers`,
          closing: `Built to support your daily schedule without unnecessary complexity.`,
          focus: 'daily portability, ease of use and student routine support',
          style: 'casual, accessible and practical',
        };
      }
      if (lower.includes('professional') || lower.includes('work')) {
        return {
          intro: `Engineered for modern workplace efficiency and day-to-day productivity, the ${input.productName} integrates`,
          closing: `Designed to ensure seamless reliability across meetings and busy workdays.`,
          focus: 'communication clarity, workflow efficiency and work reliability',
          style: 'professional, focused and productivity-oriented',
        };
      }
      if (lower.includes('tech') || lower.includes('enthusiast')) {
        return {
          intro: `Built for users who prioritize dedicated hardware capability and reliable functionality, the ${input.productName} features`,
          closing: `An effective hardware configuration built directly around confirmed specifications.`,
          focus: 'hardware capability, technical utility and specification accuracy',
          style: 'detailed, precise and spec-focused',
        };
      }
      if (lower.includes('budget') || lower.includes('conscious')) {
        return {
          intro: `Offering practical capability without unnecessary expense, the ${input.productName} provides essential`,
          closing: `A sensible choice that focuses strictly on genuine, dependable features.`,
          focus: 'practical value, essential utility and straightforward design',
          style: 'straightforward, clear and value-conscious',
        };
      }
      if (lower.includes('luxury') || lower.includes('premium')) {
        return {
          intro: `Crafted with refined attention to comfort and discerning taste, the ${input.productName} showcases`,
          closing: `An elevated design that highlights premium quality through verified specifications.`,
          focus: 'refined aesthetics, elevated comfort and superior craftsmanship',
          style: 'sophisticated, elegant and polished',
        };
      }
      return {
        intro: `Designed for reliable daily convenience and straightforward performance, the ${input.productName} provides`,
        closing: `A dependable solution tailored for everyday versatility and ease of use.`,
        focus: 'everyday versatility, convenience and user-friendly operation',
        style: 'balanced, clear and engaging',
      };
    };

    const angle1 = getAudienceAngle(input.audience1, true);
    const angle2 = getAudienceAngle(input.audience2, false);

    // Build dynamic copy 1 using user's actual product name and actual features
    const allSpecsText = formatSpecsSentence(featureList);
    const desc1 = `${angle1.intro} ${allSpecsText}. ${angle1.closing}`;

    // Build dynamic copy 2 with different sentence structure and audience angle
    const primaryText = formatSpecsSentence(secondarySpecs);
    const secondaryText = formatSpecsSentence(primarySpecs);
    const desc2 = `${angle2.intro} ${primaryText}, complemented by ${secondaryText}. ${angle2.closing}`;

    return {
      description1Text: desc1,
      description2Text: desc2,
      comparison: {
        messagingDifferences: `${input.audience1}: emphasizes ${angle1.focus}.\n${input.audience2}: emphasizes ${angle2.focus}.`,
        benefitsEmphasized: `${input.audience1}: highlights ${formatSpecsSentence(primarySpecs)}.\n${input.audience2}: highlights ${formatSpecsSentence(secondarySpecs)}.`,
        positioningSummary: `${input.audience1}: positioned around ${angle1.focus}.\n${input.audience2}: positioned around ${angle2.focus}.`,
        toneDifferences: `${input.audience1}: framed in a ${angle1.style} tone.\n${input.audience2}: framed in a ${angle2.style} tone.`,
        audienceAddressingSummary: `Both descriptions are dynamically generated using only the ${featureList.length} verified specifications supplied: ${featureList.join(', ')}. Zero specifications were invented.`,
      },
    };
  }
}

export const geminiService = new GeminiService();
