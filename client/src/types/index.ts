export type WritingTone =
  | 'Friendly and engaging'
  | 'Professional and informative'
  | 'Persuasive and sales-focused';

export type DescriptionLength = 'short' | 'medium' | 'detailed';

export type AudienceType =
  | 'Everyday consumers'
  | 'Students'
  | 'Working professionals'
  | 'Budget-conscious buyers'
  | 'Luxury buyers'
  | 'Tech enthusiasts';

export interface GenerateRequest {
  productName: string;
  features: string;
  audience1: string;
  audience2: string;
  tone: WritingTone;
  length: DescriptionLength;
  regenerateTarget?: 'audience1' | 'audience2' | 'both';
  existingDescription1?: string;
  existingDescription2?: string;
}

export interface GeneratedDescription {
  audience: string;
  text: string;
  wordCount: number;
}

export interface ComparisonData {
  messagingDifferences: string;
  benefitsEmphasized: string;
  positioningSummary: string;
  toneDifferences: string;
  audienceAddressingSummary: string;
}

export interface GenerateResponse {
  productName: string;
  description1: GeneratedDescription;
  description2: GeneratedDescription;
  comparison: ComparisonData;
}

export type ClaimClassification = 'SUPPORTED' | 'UNSUPPORTED' | 'NEEDS REVIEW';

export interface VerifiedClaim {
  id: string;
  claimText: string;
  audience: string;
  classification: ClaimClassification;
  reason: string;
  isNumericalOrMetric?: boolean;
}

export interface VerificationReportData {
  totalClaims: number;
  supportedCount: number;
  unsupportedCount: number;
  needsReviewCount: number;
  overallStatus: 'PASSED' | 'FLAGGED' | 'WARNING';
  summary: string;
  claims: VerifiedClaim[];
}

export interface HealthResponse {
  status: string;
  aiConnected: boolean;
  model: string;
}

