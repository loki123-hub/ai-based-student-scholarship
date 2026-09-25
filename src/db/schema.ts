import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (connected to Firebase Auth and student profile)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  course: text('course'),
  studyYear: integer('study_year'),
  cgpaPercentage: real('cgpa_percentage'),
  annualFamilyIncome: integer('annual_family_income'),
  category: text('category'),
  state: text('state'),
  gender: text('gender'),
  skills: text('skills'),
  careerInterest: text('career_interest'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Central scholarships repository table (PostgreSQL)
export const scholarships = pgTable('scholarships', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  provider: text('provider').notNull(),
  description: text('description').notNull(),
  benefits: text('benefits').notNull(),
  openingDate: text('opening_date'),
  deadline: text('deadline').notNull(),
  applicationUrl: text('application_url').notNull(),
  sourceUrl: text('source_url').notNull(),
  minimumPercentage: real('minimum_percentage').notNull().default(50.0),
  maximumAnnualIncome: integer('maximum_annual_income'), // null means no cap
  courses: jsonb('courses').notNull().$type<string[]>(),
  educationLevel: jsonb('education_level').notNull().$type<string[]>(),
  studyYears: jsonb('study_years').notNull().$type<number[]>(),
  states: jsonb('states').notNull().$type<string[]>(),
  categories: jsonb('categories').notNull().$type<string[]>(),
  gender: text('gender').notNull().default('All'),
  specialConditions: jsonb('special_conditions').$type<string[]>(),
  documents: jsonb('documents').notNull().$type<string[]>(),
  additionalConditions: text('additional_conditions'),
  contactInfo: text('contact_info'),
  status: text('status').notNull().default('PUBLISHED'), // 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'NEEDS_REVIEW'
  dataSourceType: text('data_source_type').notNull().default('manual'), // 'manual', 'automatic_web', 'imported'
  sourceName: text('source_name').notNull(),
  sourceExternalId: text('source_external_id'),
  contentHash: text('content_hash'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Scholarship source configuration registry
export const scholarshipSources = pgTable('scholarship_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  baseUrl: text('base_url').notNull(),
  listingUrl: text('listing_url').notNull(),
  sourceType: text('source_type').notNull(), // 'government_central', 'government_state', 'private_trust'
  enabled: boolean('enabled').notNull().default(true),
  crawlFrequency: text('crawl_frequency').notNull().default('0 2 * * *'),
  parserName: text('parser_name').notNull(),
  engineType: text('engine_type').notNull().default('cheerio'),
  lastRunAt: timestamp('last_run_at'),
  lastSuccessAt: timestamp('last_success_at'),
  failureCount: integer('failure_count').notNull().default(0),
});

// Version history and audit trail
export const scholarshipVersionHistory = pgTable('scholarship_version_history', {
  id: serial('id').primaryKey(),
  scholarshipId: text('scholarship_id').notNull(),
  scholarshipTitle: text('scholarship_title').notNull(),
  versionNumber: integer('version_number').notNull(),
  fieldName: text('field_name').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  changeReason: text('change_reason'),
  sourceUrl: text('source_url'),
  ingestionRunId: text('ingestion_run_id'),
  changedAt: timestamp('changed_at').defaultNow(),
  changedBy: text('changed_by'),
});

// Career pathways and guidance knowledge base
export const careerPathways = pgTable('career_pathways', {
  id: text('id').primaryKey(),
  domain: text('domain').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requiredSkills: jsonb('required_skills').notNull().$type<string[]>(),
  learningRoadmap: jsonb('learning_roadmap').notNull().$type<{
    phase: string;
    duration: string;
    topics: string[];
    projects: string[];
    resources: string[];
  }[]>(),
  relevantCourses: jsonb('relevant_courses').notNull().$type<string[]>(),
  recommendedCertifications: jsonb('recommended_certifications').notNull().$type<string[]>(),
  matchingScholarshipTypes: jsonb('matching_scholarship_types').notNull().$type<string[]>(),
  salaryGrowthOutlook: text('salary_growth_outlook'),
});
