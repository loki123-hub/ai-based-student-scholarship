/**
 * Types & Interfaces for Scholarship Management and Ingestion System
 * Aligned with PRD v2.4.0
 */

export type DataSourceType = 'manual' | 'automatic_web' | 'imported';

export type ScholarshipStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'NEEDS_REVIEW';

export type CrawlerEngine = 'cheerio' | 'playwright';

export type ValidationStatus = 'VALID' | 'NEEDS_REVIEW' | 'FAILED';

export interface EligibilityRules {
  minimumPercentage: number; // e.g. 50% or converted CGPA
  maximumAnnualIncome: number | null; // in INR (null if no cap)
  courses: string[]; // e.g. ["B.Tech", "B.E.", "B.Sc"]
  educationLevel: string[]; // ["Undergraduate", "Postgraduate", "Diploma", "Doctoral", "School"]
  studyYears: number[]; // e.g. [1, 2, 3, 4]
  states: string[]; // e.g. ["Tamil Nadu", "All India"]
  categories: string[]; // e.g. ["General", "OBC", "SC", "ST", "EWS", "Minority"]
  gender?: 'All' | 'Female' | 'Male' | 'Transgender';
  ageLimit?: {
    minAge?: number;
    maxAge?: number;
  };
  disabilityConditions?: string[];
  specialConditions?: string[];
}

export interface ScholarshipMetadata {
  dataSourceType: DataSourceType;
  sourceName: string;
  sourceUrl: string;
  sourceExternalId?: string;
  contentHash: string;
  lastScrapedAt?: string;
  lastVerifiedAt: string;
  lastChangedAt: string;
  version: number;
}

export interface CommonScholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  benefits: string;
  openingDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  applicationUrl: string;
  sourceUrl: string;
  eligibility: EligibilityRules;
  documents: string[];
  additionalConditions?: string;
  contactInfo?: string;
  status: ScholarshipStatus;
  metadata: ScholarshipMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface VersionHistoryItem {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  versionNumber: number;
  fieldName: string;
  previousValue: string;
  newValue: string;
  changeReason: string;
  sourceUrl: string;
  ingestionRunId: string;
  changedAt: string;
  changedBy: string;
}

export interface ScholarshipSourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  listingUrl: string;
  sourceType: 'government_central' | 'government_state' | 'private_trust';
  enabled: boolean;
  crawlFrequency: string; // Cron expression, e.g. '0 2 * * *'
  parserName: string;
  engineType: CrawlerEngine;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
}

export interface SourceAdapterSpec {
  id: string;
  sourceName: string;
  fileName: string;
  listingUrl: string;
  renderingMethod: 'Static HTML (Cheerio)' | 'Dynamic Browser (Playwright Headless)';
  discoveryStrategy: string;
  selectors: {
    listingContainer: string;
    detailLink: string;
    title: string;
    provider: string;
    description: string;
    benefits: string;
    deadline: string;
    incomeLimit: string;
    minMarks: string;
    documents: string;
    applyLink: string;
  };
}

export interface IngestionRunReport {
  runId: string;
  startedAt: string;
  completedAt: string;
  sourcesChecked: number;
  scholarshipsFound: number;
  newScholarships: number;
  updatedScholarships: number;
  unchanged: number;
  needsReview: number;
  failed: number;
  logs: string[];
}

export interface ReviewQueueItem {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceExternalId: string;
  extractedAt: string;
  validationIssues: string[];
  extractedSuccessfully: {
    field: string;
    value: string;
  }[];
  uncertainOrMissing: {
    field: string;
    detectedRaw?: string;
    reason: string;
    suggestedValue?: string;
  }[];
  draftRecord: CommonScholarship;
}

export interface StudentProfile {
  name: string;
  course: string;
  studyYear: number;
  cgpaOrPercentage: number;
  annualFamilyIncome: number;
  category: string;
  state: string;
  gender: 'Female' | 'Male' | 'Transgender' | 'Other';
  hasSpecialCondition: boolean;
  specialConditionDetail?: string;
}

export interface RecommendationMatch {
  scholarship: CommonScholarship;
  isEligible: boolean;
  matchScore: number; // 0 - 100
  criteriaBreakdown: {
    criterion: string;
    satisfied: boolean;
    studentValue: string;
    requirementValue: string;
  }[];
  reasons: string[];
  requiredDocuments: string[];
  urgency: 'high' | 'medium' | 'low';
  daysRemaining: number;
}
