import {
  VerifyInput,
  VerificationReport,
  VerifiedClaim,
} from '../schemas/productSchema.js';
import { generateJson } from './geminiClient.js';
import { MODEL_CANDIDATES } from './models.js';
import { isTestEnvironment, readEnv } from './runtime.js';

const IS_TEST_ENV = isTestEnvironment();

// Common technical and specification patterns that must not be hallucinated
const SPEC_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  category: string;
}> = [
  {
    name: 'Battery Life',
    pattern: /\b(\d+[\s-]*(hour|hr|h)\s*(battery|playback|playtime|runtime|charge|use)|battery\s*(life\s*)?(of\s*)?\d+|\d+\s*(hours?|hrs?)\s*of\s*battery)\b/i,
    category: 'battery',
  },
  {
    name: 'Battery Capacity',
    pattern: /\b\d+\s*(mah|wh)\b/i,
    category: 'battery',
  },
  {
    name: 'Bluetooth Version/Standard',
    pattern: /\b(bluetooth\s*(v?[\d\.]+|5\.[0-9]|4\.[0-9])|bt\s*5\.[0-9])\b/i,
    category: 'technical_standard',
  },
  {
    name: 'Active Noise Cancellation',
    pattern: /\b(active\s*noise\s*cancellation|active\s*noise\s*cancelling|\banc\b)\b/i,
    category: 'audio_feature',
  },
  {
    name: 'Wireless Range',
    pattern: /\b(\d+[\s-]*(m|meter|metre|ft|feet)\s*(wireless\s*)?range|\brange\s*of\s*\d+\s*(m|meter|metre|ft|feet))\b/i,
    category: 'measurement',
  },
  {
    name: 'Fast Charging',
    pattern: /\b(fast\s*charg\w+|quick\s*charg\w+|rapid\s*charg\w+|usb-c\s*fast)\b/i,
    category: 'charging',
  },
  {
    name: 'Water Resistance / IP Rating',
    pattern: /\b(ipx[0-9]|ip[0-9]{2}|waterproof|water-resistant|sweatproof)\b/i,
    category: 'certification',
  },
  {
    name: 'Audio Codecs / Hi-Res',
    pattern: /\b(aptx|ldac|aac\s*codec|hi-res\s*audio|lossless\s*audio)\b/i,
    category: 'audio_spec',
  },
  {
    name: 'Warranty / Guarantee',
    pattern: /\b(\d+[\s-]*(year|month)\s*warranty|money[\s-]*back\s*guarantee)\b/i,
    category: 'warranty',
  },
  {
    name: 'Driver Size / Frequency Response',
    pattern: /\b(\d+\s*mm\s*drivers?|\d+\s*hz\s*-\s*\d+\s*khz)\b/i,
    category: 'driver_spec',
  },
  {
    name: 'Weight / Physical Measurement',
    pattern: /\b(\d+(\.\d+)?\s*(grams?|g|oz|lbs?|kg))\b/i,
    category: 'measurement',
  },
];

export class VerifierService {
  private apiKey: string | null = null;

  constructor() {
    if (IS_TEST_ENV) return;

    const apiKey = readEnv('GEMINI_API_KEY');
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
      this.apiKey = apiKey.trim();
    }
  }

  public setApiKey(apiKey: string): boolean {
    if (apiKey && apiKey.trim() !== '') {
      this.apiKey = apiKey.trim();
      return true;
    }
    return false;
  }

  public async verify(
    input: VerifyInput,
    apiKeyOverride?: string
  ): Promise<VerificationReport> {
    const apiKey = apiKeyOverride?.trim() || this.apiKey;

    // 1. Run deterministic spec checks
    const deterministicClaims: VerifiedClaim[] = this.runDeterministicChecks(input);

    // 2. Run semantic claim checking (via Gemini if key available, or heuristic sentence-level audit)
    let semanticClaims: VerifiedClaim[] = [];
    if (apiKey) {
      try {
        semanticClaims = await this.runGeminiSemanticCheck(input, apiKey);
      } catch (err: any) {
        // Surface failures from a user-supplied key instead of silently
        // downgrading to the heuristic auditor.
        if (apiKeyOverride) throw err;

        console.warn('Gemini semantic verification failed, using heuristic extraction:', err.message);
        semanticClaims = this.runHeuristicClaimCheck(input);
      }
    } else {
      semanticClaims = this.runHeuristicClaimCheck(input);
    }

    // 3. Merge and deduplicate claims
    const combinedClaims = this.mergeAndPrioritizeClaims(deterministicClaims, semanticClaims);

    // 4. Compute statistics
    const supportedCount = combinedClaims.filter((c) => c.classification === 'SUPPORTED').length;
    const unsupportedCount = combinedClaims.filter((c) => c.classification === 'UNSUPPORTED').length;
    const needsReviewCount = combinedClaims.filter((c) => c.classification === 'NEEDS REVIEW').length;

    let overallStatus: 'PASSED' | 'FLAGGED' | 'WARNING' = 'PASSED';
    if (unsupportedCount > 0) {
      overallStatus = 'FLAGGED';
    } else if (needsReviewCount > 0) {
      overallStatus = 'WARNING';
    }

    const summary =
      unsupportedCount > 0
        ? `Verification FLAGGED: Detected ${unsupportedCount} unsupported or fabricated specification(s) not supplied in original product features.`
        : needsReviewCount > 0
        ? `Verification completed with ${needsReviewCount} claim(s) requiring review. No outright unsupported specifications were found.`
        : `Verification PASSED: All ${supportedCount} analyzed factual claims are directly supported by original product features.`;

    return {
      totalClaims: combinedClaims.length,
      supportedCount,
      unsupportedCount,
      needsReviewCount,
      overallStatus,
      summary,
      claims: combinedClaims,
    };
  }

  /**
   * Deterministic pattern scanning for numbers, technical standards, metrics, battery, ANC, etc.
   */
  public runDeterministicChecks(input: VerifyInput): VerifiedClaim[] {
    const claims: VerifiedClaim[] = [];
    const normalizedFeatures = (input.features + ' ' + input.productName).toLowerCase();

    const descriptions = [
      { text: input.description1.text, audience: input.description1.audience },
      { text: input.description2.text, audience: input.description2.audience },
    ];

    descriptions.forEach(({ text, audience }, descIndex) => {
      SPEC_PATTERNS.forEach((spec, specIdx) => {
        const match = text.match(spec.pattern);
        if (match) {
          const matchedPhrase = match[0];
          // Check if this matched phrase or spec concept was in the supplied features
          const isExplicitlyInFeatures = normalizedFeatures.includes(matchedPhrase.toLowerCase());

          if (!isExplicitlyInFeatures) {
            claims.push({
              id: `det-${descIndex}-${specIdx}`,
              claimText: `Specification reference: "${matchedPhrase}"`,
              audience,
              classification: 'UNSUPPORTED',
              reason: `Deterministic Flag: Introduces unverified ${spec.name} ("${matchedPhrase}"). The original product details do not supply this specification.`,
              isNumericalOrMetric: true,
            });
          }
        }
      });

      // Generic numeric pattern check: numbers with units
      const numberMatches = text.matchAll(/\b\d+(\.\d+)?\s*(hours?|hrs?|mah|wh|db|g|kg|m|meters?|ft|feet|in|inches?|%)\b/gi);
      for (const m of numberMatches) {
        const rawPhrase = m[0];
        if (!normalizedFeatures.includes(rawPhrase.toLowerCase())) {
          // Avoid duplicate flag if already covered by SPEC_PATTERNS
          const alreadyFlagged = claims.some(
            (c) => c.audience === audience && c.claimText.includes(rawPhrase)
          );
          if (!alreadyFlagged) {
            claims.push({
              id: `num-${descIndex}-${m.index}`,
              claimText: `Numerical claim: "${rawPhrase}"`,
              audience,
              classification: 'UNSUPPORTED',
              reason: `Deterministic Flag: Numeric figure "${rawPhrase}" is not present in original product information.`,
              isNumericalOrMetric: true,
            });
          }
        }
      }
    });

    return claims;
  }

  /**
   * Semantic claim verification with Gemini
   */
  private async runGeminiSemanticCheck(
    input: VerifyInput,
    apiKey: string
  ): Promise<VerifiedClaim[]> {

    const prompt = `You are a strict factual verification auditor.
Your job is to extract individual factual claims from generated product descriptions and determine whether each claim is supported by the original product information.

Original Verified Product Information:
Product Name: ${input.productName}
Features:
${input.features}

Description 1 (Audience: ${input.description1.audience}):
"${input.description1.text}"

Description 2 (Audience: ${input.description2.audience}):
"${input.description2.text}"

Instructions:
1. Extract distinct factual claims made in both descriptions.
2. For each claim, classify as:
   - "SUPPORTED": The claim is directly supported by the supplied original features.
   - "UNSUPPORTED": The claim introduces specifications, metrics, battery ratings, certifications, or capabilities NOT in the original features.
   - "NEEDS REVIEW": The claim is subjective marketing rhetoric, ambiguous, or cannot be confidently verified.
3. Pay strict attention to battery figures, Bluetooth versions, active noise cancellation, range, and fast charging. Never approve claims simply because they sound typical.
4. Return a structured JSON array of claims.

JSON format:
{
  "claims": [
    {
      "claimText": "Exact factual claim from description",
      "audience": "Name of audience",
      "classification": "SUPPORTED" | "UNSUPPORTED" | "NEEDS REVIEW",
      "reason": "Specific supporting evidence from features or reason why it is unsupported",
      "isNumericalOrMetric": false
    }
  ]
}`;

    const responseText = await generateJson({
      apiKey,
      models: MODEL_CANDIDATES,
      prompt,
      temperature: 0.1,
    });

    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed.claims)) {
      return parsed.claims.map((c: any, idx: number) => ({
        id: `sem-${idx}`,
        claimText: String(c.claimText || ''),
        audience: String(c.audience || ''),
        classification: (['SUPPORTED', 'UNSUPPORTED', 'NEEDS REVIEW'].includes(c.classification)
          ? c.classification
          : 'NEEDS REVIEW') as 'SUPPORTED' | 'UNSUPPORTED' | 'NEEDS REVIEW',
        reason: String(c.reason || ''),
        isNumericalOrMetric: Boolean(c.isNumericalOrMetric),
      }));
    }

    return [];
  }

  /**
   * Heuristic claim checking when offline or without Gemini API key
   */
  public runHeuristicClaimCheck(input: VerifyInput): VerifiedClaim[] {
    const claims: VerifiedClaim[] = [];
    const featureLines = input.features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const featureTokens = featureLines.map((f) => f.toLowerCase());

    const descriptions = [
      { text: input.description1.text, audience: input.description1.audience },
      { text: input.description2.text, audience: input.description2.audience },
    ];

    descriptions.forEach(({ text, audience }, dIdx) => {
      // Split into sentences
      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      sentences.forEach((sentence, sIdx) => {
        const lowerSentence = sentence.toLowerCase();

        // Check which original features are matched in this sentence
        const matchedFeatures = featureTokens.filter((ft) => {
          const words = ft.split(/\s+/).filter((w) => w.length > 2);
          return words.some((w) => lowerSentence.includes(w));
        });

        let classification: 'SUPPORTED' | 'UNSUPPORTED' | 'NEEDS REVIEW' = 'SUPPORTED';
        let reason = '';

        if (matchedFeatures.length > 0) {
          classification = 'SUPPORTED';
          reason = `Supported by verified feature(s): "${matchedFeatures.join(', ')}".`;
        } else if (
          lowerSentence.includes('lifestyle') ||
          lowerSentence.includes('comfort') ||
          lowerSentence.includes('designed for') ||
          lowerSentence.includes('experience') ||
          lowerSentence.includes('deliver')
        ) {
          classification = 'NEEDS REVIEW';
          reason = 'General positioning / contextual phrasing; no specific unverified hardware spec detected.';
        } else {
          classification = 'SUPPORTED';
          reason = 'Aligns with core product overview context.';
        }

        claims.push({
          id: `heur-${dIdx}-${sIdx}`,
          claimText: sentence,
          audience,
          classification,
          reason,
          isNumericalOrMetric: /\d+/.test(sentence),
        });
      });
    });

    return claims;
  }

  /**
   * Merge deterministic flags with semantic claims, giving priority to UNSUPPORTED flags
   */
  private mergeAndPrioritizeClaims(
    deterministic: VerifiedClaim[],
    semantic: VerifiedClaim[]
  ): VerifiedClaim[] {
    const result: VerifiedClaim[] = [...deterministic];

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/[“”"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Deterministic claims look like: Specification reference: "40-hour battery".
    // Compare the quoted phrase against semantic claim text so the same issue is
    // not counted twice in the report.
    const getComparableText = (claim: VerifiedClaim) => {
      const quoted = claim.claimText.match(/"([^"]+)"/);
      return normalize(quoted ? quoted[1] : claim.claimText);
    };

    for (const sc of semantic) {
      const semanticText = normalize(sc.claimText);

      const alreadyFlagged = result.some((dc) => {
        if (dc.audience !== sc.audience) return false;

        const detText = getComparableText(dc);
        if (!detText || !semanticText) return false;

        return (
          semanticText.includes(detText) ||
          detText.includes(semanticText) ||
          // Handle small wording differences such as "40-hour battery" vs
          // "40-hour battery life" by comparing their significant tokens.
          (detText.length > 4 &&
            detText
              .split(' ')
              .filter((token) => token.length > 2)
              .every((token) => semanticText.includes(token)))
        );
      });

      if (!alreadyFlagged) {
        result.push(sc);
      }
    }

    return result;
  }
}

export const verifierService = new VerifierService();

