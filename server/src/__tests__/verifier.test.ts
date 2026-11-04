import { describe, it, expect } from 'vitest';
import { VerifierService } from '../services/verifier.js';
import { VerifyInput } from '../schemas/productSchema.js';

describe('VerifierService - Anti-Hallucination & Factual Verification', () => {
  const verifier = new VerifierService();

  const baseInput: VerifyInput = {
    productName: 'Wireless Headphones',
    features: 'Bluetooth connectivity\nLightweight design\nCushioned ear pads\nBuilt-in microphone',
    description1: {
      audience: 'Students',
      text: 'Perfect for campus, these wireless headphones feature Bluetooth connectivity and a lightweight design with cushioned ear pads and a built-in microphone for study groups.',
    },
    description2: {
      audience: 'Working Professionals',
      text: 'Designed for daily office work, featuring reliable Bluetooth connectivity, lightweight construction, cushioned ear pads, and an integrated built-in microphone for all your calls.',
    },
  };

  it('1. PASSED: Verifies descriptions that only contain supplied features', async () => {
    const report = await verifier.verify(baseInput);

    expect(report.overallStatus).toBe('PASSED');
    expect(report.unsupportedCount).toBe(0);
    expect(report.supportedCount).toBeGreaterThan(0);
  });

  it('2. FLAGGED: Flags unsupported battery life (e.g. 40-hour battery life)', async () => {
    const inputWithHallucination: VerifyInput = {
      ...baseInput,
      description1: {
        audience: 'Students',
        text: 'Enjoy amazing sound with Bluetooth connectivity, a lightweight design, and an incredible 40-hour battery life.',
      },
    };

    const report = await verifier.verify(inputWithHallucination);

    expect(report.overallStatus).toBe('FLAGGED');
    expect(report.unsupportedCount).toBeGreaterThanOrEqual(1);

    const flaggedClaim = report.claims.find((c) => c.classification === 'UNSUPPORTED');
    expect(flaggedClaim).toBeDefined();
    expect(flaggedClaim?.reason.toLowerCase()).toContain('battery');
  });

  it('3. FLAGGED: Flags unsupported technical standards (e.g. Bluetooth 5.3)', async () => {
    const inputWithBTVersion: VerifyInput = {
      ...baseInput,
      description2: {
        audience: 'Working Professionals',
        text: 'Stay ahead with modern Bluetooth 5.3 and cushioned ear pads.',
      },
    };

    const report = await verifier.verify(inputWithBTVersion);

    expect(report.overallStatus).toBe('FLAGGED');
    const flagged = report.claims.find(
      (c) => c.classification === 'UNSUPPORTED' && c.reason.includes('Bluetooth Version')
    );
    expect(flagged).toBeDefined();
  });

  it('4. FLAGGED: Flags Active Noise Cancellation (ANC) when not supplied', async () => {
    const inputWithANC: VerifyInput = {
      ...baseInput,
      description1: {
        audience: 'Students',
        text: 'Study without distractions thanks to Active Noise Cancellation and lightweight design.',
      },
    };

    const report = await verifier.verify(inputWithANC);

    expect(report.overallStatus).toBe('FLAGGED');
    const flagged = report.claims.find(
      (c) => c.classification === 'UNSUPPORTED' && c.reason.includes('Active Noise Cancellation')
    );
    expect(flagged).toBeDefined();
  });

  it('5. FLAGGED: Flags wireless range (e.g. 20-metre wireless range)', async () => {
    const inputWithRange: VerifyInput = {
      ...baseInput,
      description2: {
        audience: 'Working Professionals',
        text: 'Move freely around your desk with a 20-metre wireless range and built-in microphone.',
      },
    };

    const report = await verifier.verify(inputWithRange);

    expect(report.overallStatus).toBe('FLAGGED');
    const flagged = report.claims.find(
      (c) => c.classification === 'UNSUPPORTED' && c.reason.includes('Wireless Range')
    );
    expect(flagged).toBeDefined();
  });

  it('6. FLAGGED: Flags fast charging when not in original specs', async () => {
    const inputWithFastCharging: VerifyInput = {
      ...baseInput,
      description1: {
        audience: 'Students',
        text: 'Featuring fast charging so you can power up between classes quickly.',
      },
    };

    const report = await verifier.verify(inputWithFastCharging);

    expect(report.overallStatus).toBe('FLAGGED');
    const flagged = report.claims.find(
      (c) => c.classification === 'UNSUPPORTED' && c.reason.includes('Fast Charging')
    );
    expect(flagged).toBeDefined();
  });

  it('7. ALLOWED: Passes numeric specs when they WERE explicitly in features', async () => {
    const inputWithSuppliedSpecs: VerifyInput = {
      productName: 'Power Bank',
      features: '10000 mAh capacity\nFast charging support\nLightweight aluminum case',
      description1: {
        audience: 'Everyday consumers',
        text: 'A portable battery with 10000 mAh capacity and fast charging support in a lightweight aluminum case.',
      },
      description2: {
        audience: 'Tech enthusiasts',
        text: 'Equipped with 10000 mAh capacity and fast charging support.',
      },
    };

    const report = await verifier.verify(inputWithSuppliedSpecs);

    // Because 10000 mAh and fast charging were explicitly in the features, they should NOT be flagged as unsupported
    const unsupportedCapacity = report.claims.find(
      (c) => c.classification === 'UNSUPPORTED' && c.claimText.includes('10000')
    );
    expect(unsupportedCapacity).toBeUndefined();
  });
});

