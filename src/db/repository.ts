import { db } from './index.ts';
import { scholarships, scholarshipSources, scholarshipVersionHistory, careerPathways, users } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { CommonScholarship, StudentProfile, RecommendationMatch, VersionHistoryItem } from '../types/scholarship.ts';

/**
 * Robust database repository methods for PostgreSQL (Cloud SQL)
 */

export async function getAllScholarshipsFromDb() {
  try {
    return await db.select().from(scholarships).orderBy(desc(scholarships.updatedAt));
  } catch (error) {
    console.error('PostgreSQL query error in getAllScholarshipsFromDb:', error);
    throw new Error('Failed to retrieve scholarships from PostgreSQL', { cause: error });
  }
}

export async function getPublishedScholarshipsFromDb() {
  try {
    return await db.select().from(scholarships).where(eq(scholarships.status, 'PUBLISHED')).orderBy(desc(scholarships.updatedAt));
  } catch (error) {
    console.error('PostgreSQL query error in getPublishedScholarshipsFromDb:', error);
    throw new Error('Failed to retrieve published scholarships from PostgreSQL', { cause: error });
  }
}

export async function insertOrUpdateScholarshipInDb(data: any) {
  try {
    return await db
      .insert(scholarships)
      .values({
        id: data.id,
        title: data.title,
        provider: data.provider,
        description: data.description,
        benefits: data.benefits,
        openingDate: data.openingDate || null,
        deadline: data.deadline,
        applicationUrl: data.applicationUrl,
        sourceUrl: data.sourceUrl,
        minimumPercentage: data.minimumPercentage || 50,
        maximumAnnualIncome: data.maximumAnnualIncome || null,
        courses: data.courses || [],
        educationLevel: data.educationLevel || ['Undergraduate'],
        studyYears: data.studyYears || [1, 2, 3, 4],
        states: data.states || ['All India'],
        categories: data.categories || ['General'],
        gender: data.gender || 'All',
        specialConditions: data.specialConditions || [],
        documents: data.documents || [],
        additionalConditions: data.additionalConditions || null,
        contactInfo: data.contactInfo || null,
        status: data.status || 'PUBLISHED',
        dataSourceType: data.dataSourceType || 'manual',
        sourceName: data.sourceName,
        sourceExternalId: data.sourceExternalId || null,
        contentHash: data.contentHash || null,
        version: data.version || 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: scholarships.id,
        set: {
          title: data.title,
          provider: data.provider,
          description: data.description,
          benefits: data.benefits,
          deadline: data.deadline,
          maximumAnnualIncome: data.maximumAnnualIncome || null,
          minimumPercentage: data.minimumPercentage || 50,
          courses: data.courses || [],
          documents: data.documents || [],
          status: data.status || 'PUBLISHED',
          contentHash: data.contentHash || null,
          version: data.version || 1,
          updatedAt: new Date(),
        },
      })
      .returning();
  } catch (error) {
    console.error('PostgreSQL insert/update error in insertOrUpdateScholarshipInDb:', error);
    throw new Error('Failed to persist scholarship in PostgreSQL', { cause: error });
  }
}

export async function getAllSourcesFromDb() {
  try {
    return await db.select().from(scholarshipSources);
  } catch (error) {
    console.error('PostgreSQL query error in getAllSourcesFromDb:', error);
    throw new Error('Failed to retrieve sources from PostgreSQL', { cause: error });
  }
}

export async function toggleSourceInDb(id: string, enabled: boolean) {
  try {
    return await db.update(scholarshipSources).set({ enabled }).where(eq(scholarshipSources.id, id)).returning();
  } catch (error) {
    console.error('PostgreSQL update error in toggleSourceInDb:', error);
    throw new Error('Failed to update source in PostgreSQL', { cause: error });
  }
}

export async function getAllCareerPathwaysFromDb() {
  try {
    return await db.select().from(careerPathways);
  } catch (error) {
    console.error('PostgreSQL query error in getAllCareerPathwaysFromDb:', error);
    throw new Error('Failed to retrieve career pathways from PostgreSQL', { cause: error });
  }
}

export async function getAllVersionHistoryFromDb() {
  try {
    return await db.select().from(scholarshipVersionHistory).orderBy(desc(scholarshipVersionHistory.changedAt));
  } catch (error) {
    console.error('PostgreSQL query error in getAllVersionHistoryFromDb:', error);
    throw new Error('Failed to retrieve version history from PostgreSQL', { cause: error });
  }
}

export async function insertVersionHistoryInDb(item: any) {
  try {
    return await db.insert(scholarshipVersionHistory).values({
      scholarshipId: item.scholarshipId,
      scholarshipTitle: item.scholarshipTitle,
      versionNumber: item.versionNumber,
      fieldName: item.fieldName,
      previousValue: item.previousValue || null,
      newValue: item.newValue || null,
      changeReason: item.changeReason || null,
      sourceUrl: item.sourceUrl || null,
      ingestionRunId: item.ingestionRunId || null,
      changedBy: item.changedBy || 'SYSTEM',
    }).returning();
  } catch (error) {
    console.error('PostgreSQL insert error in insertVersionHistoryInDb:', error);
    throw new Error('Failed to record version history in PostgreSQL', { cause: error });
  }
}
