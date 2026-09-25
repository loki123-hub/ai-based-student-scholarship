/**
 * Ingestion, Validation, Diff, Hashing, and Recommendation Services
 * Strict implementation of PRD v2.4.0
 */

import {
  CommonScholarship,
  ReviewQueueItem,
  VersionHistoryItem,
  IngestionRunReport,
  ScholarshipSourceConfig,
  StudentProfile,
  RecommendationMatch
} from '../types/scholarship';

/**
 * Computes a pseudo-SHA256 canonical hash of normalized scholarship attributes.
 * Ensures consistent change detection across cron runs.
 */
export function generateCanonicalContentHash(data: {
  title: string;
  provider: string;
  benefits: string;
  deadline: string;
  minimumPercentage: number;
  maximumAnnualIncome: number | null;
  courses: string[];
  states: string[];
  categories: string[];
  documents: string[];
}): string {
  const canonicalString = JSON.stringify({
    title: data.title.trim().toLowerCase(),
    provider: data.provider.trim().toLowerCase(),
    benefits: data.benefits.trim().toLowerCase(),
    deadline: data.deadline.trim(),
    minimumPercentage: data.minimumPercentage,
    maximumAnnualIncome: data.maximumAnnualIncome,
    courses: [...data.courses].map(c => c.trim().toLowerCase()).sort(),
    states: [...data.states].map(s => s.trim().toLowerCase()).sort(),
    categories: [...data.categories].map(c => c.trim().toLowerCase()).sort(),
    documents: [...data.documents].map(d => d.trim().toLowerCase()).sort()
  });

  // Deterministic 64-char hex hash from string
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < canonicalString.length; i++) {
    const ch = canonicalString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h2 ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const part5 = ((h1 + 0x12345678) >>> 0).toString(16).padStart(8, '0');
  const part6 = ((h2 + 0x87654321) >>> 0).toString(16).padStart(8, '0');
  const part7 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part8 = (((h1 & 0xffff) << 16 | (h2 & 0xffff)) >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part3}${part4}${part5}${part6}${part7}${part8}`;
}

/**
 * Section 7: Automatic Validation Engine
 */
export function validateExtractedScholarship(scholarship: Partial<CommonScholarship>): {
  status: 'VALID' | 'NEEDS_REVIEW' | 'FAILED';
  issues: string[];
  extractedSuccessfully: { field: string; value: string }[];
  uncertainOrMissing: { field: string; reason: string; suggestedValue?: string }[];
} {
  const issues: string[] = [];
  const extractedSuccessfully: { field: string; value: string }[] = [];
  const uncertainOrMissing: { field: string; reason: string; suggestedValue?: string }[] = [];

  // 1. Mandatory Title
  if (!scholarship.title || scholarship.title.trim().length < 5) {
    issues.push('Fatal: Scholarship title is missing or shorter than 5 characters');
    return {
      status: 'FAILED',
      issues,
      extractedSuccessfully,
      uncertainOrMissing
    };
  } else {
    extractedSuccessfully.push({ field: 'Scholarship Name', value: scholarship.title });
  }

  // 2. Provider
  if (!scholarship.provider || scholarship.provider.trim().length < 3) {
    uncertainOrMissing.push({
      field: 'Provider / Organization',
      reason: 'Provider organization not clearly parsed from page markup'
    });
  } else {
    extractedSuccessfully.push({ field: 'Provider', value: scholarship.provider });
  }

  // 3. Source URL
  if (!scholarship.sourceUrl || !scholarship.sourceUrl.startsWith('http')) {
    issues.push('Fatal: Invalid or missing official source URL');
    return { status: 'FAILED', issues, extractedSuccessfully, uncertainOrMissing };
  } else {
    extractedSuccessfully.push({ field: 'Source URL', value: scholarship.sourceUrl });
  }

  // 4. Deadline / Closing Date
  if (!scholarship.deadline) {
    uncertainOrMissing.push({
      field: 'Application Deadline',
      reason: 'No explicit deadline date could be parsed from timeline container',
      suggestedValue: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0]
    });
  } else {
    extractedSuccessfully.push({ field: 'Deadline', value: scholarship.deadline });
  }

  // 5. Benefits
  if (!scholarship.benefits || scholarship.benefits.trim().length < 5) {
    uncertainOrMissing.push({
      field: 'Benefits / Financial Aid',
      reason: 'Benefit amount or fee concession description missing in table'
    });
  } else {
    extractedSuccessfully.push({ field: 'Benefits', value: scholarship.benefits });
  }

  // 6. Eligibility object
  const elig = scholarship.eligibility;
  if (!elig) {
    uncertainOrMissing.push({
      field: 'Eligibility Criteria',
      reason: 'Complete eligibility block could not be extracted'
    });
  } else {
    if (elig.maximumAnnualIncome !== null && (elig.maximumAnnualIncome <= 0 || isNaN(elig.maximumAnnualIncome))) {
      uncertainOrMissing.push({
        field: 'Income Ceiling',
        reason: 'Income limit value extracted as non-positive or malformed'
      });
    } else if (elig.maximumAnnualIncome !== null) {
      extractedSuccessfully.push({
        field: 'Max Annual Income',
        value: `₹${elig.maximumAnnualIncome.toLocaleString('en-IN')}`
      });
    }

    if (elig.minimumPercentage !== undefined && (elig.minimumPercentage < 0 || elig.minimumPercentage > 100)) {
      uncertainOrMissing.push({
        field: 'Academic Minimum Marks',
        reason: 'Percentage cutoff out of range 0–100%'
      });
    } else if (elig.minimumPercentage !== undefined) {
      extractedSuccessfully.push({
        field: 'Minimum Percentage',
        value: `${elig.minimumPercentage}%`
      });
    }

    if (!elig.courses || elig.courses.length === 0) {
      uncertainOrMissing.push({
        field: 'Eligible Courses',
        reason: 'Course list was ambiguous or generic ("All Technical Courses")',
        suggestedValue: 'B.Tech, B.E., Diploma'
      });
    } else {
      extractedSuccessfully.push({ field: 'Eligible Courses', value: elig.courses.join(', ') });
    }

    if (!elig.categories || elig.categories.length === 0) {
      uncertainOrMissing.push({
        field: 'Eligible Categories',
        reason: 'Social category criteria not explicitly declared; defaults to open/all',
        suggestedValue: 'General, OBC, SC, ST, EWS'
      });
    }
  }

  // 7. Documents
  if (!scholarship.documents || scholarship.documents.length === 0) {
    uncertainOrMissing.push({
      field: 'Required Documents',
      reason: 'Enclosure list not found on detail page; requires administrative verification',
      suggestedValue: 'Income Certificate, Marksheet, College Bonafide'
    });
  } else {
    extractedSuccessfully.push({ field: 'Required Documents', value: `${scholarship.documents.length} documents identified` });
  }

  if (uncertainOrMissing.length > 0) {
    return {
      status: 'NEEDS_REVIEW',
      issues: uncertainOrMissing.map(u => `${u.field}: ${u.reason}`),
      extractedSuccessfully,
      uncertainOrMissing
    };
  }

  return {
    status: 'VALID',
    issues: [],
    extractedSuccessfully,
    uncertainOrMissing: []
  };
}

/**
 * Section 9 & 10: Compare incoming crawled record with existing database record.
 * Generates audit version history items if changes are detected.
 */
export function detectChangesAndDiff(
  existingRecord: CommonScholarship,
  incomingData: Partial<CommonScholarship>,
  runId: string
): {
  hasChanged: boolean;
  diffItems: Omit<VersionHistoryItem, 'id'>[];
} {
  const diffItems: Omit<VersionHistoryItem, 'id'>[] = [];

  // Check deadline
  if (incomingData.deadline && incomingData.deadline !== existingRecord.deadline) {
    diffItems.push({
      scholarshipId: existingRecord.id,
      scholarshipTitle: existingRecord.title,
      versionNumber: existingRecord.metadata.version + 1,
      fieldName: 'deadline',
      previousValue: existingRecord.deadline,
      newValue: incomingData.deadline,
      changeReason: 'Portal updated deadline on official notification schedule',
      sourceUrl: existingRecord.sourceUrl,
      ingestionRunId: runId,
      changedAt: new Date().toISOString(),
      changedBy: 'SYSTEM_INGESTION_CRON'
    });
  }

  // Check income limit
  if (
    incomingData.eligibility?.maximumAnnualIncome !== undefined &&
    incomingData.eligibility.maximumAnnualIncome !== existingRecord.eligibility.maximumAnnualIncome
  ) {
    diffItems.push({
      scholarshipId: existingRecord.id,
      scholarshipTitle: existingRecord.title,
      versionNumber: existingRecord.metadata.version + 1,
      fieldName: 'maximumAnnualIncome',
      previousValue: existingRecord.eligibility.maximumAnnualIncome
        ? `₹${existingRecord.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`
        : 'None',
      newValue: incomingData.eligibility.maximumAnnualIncome
        ? `₹${incomingData.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`
        : 'None',
      changeReason: 'Government revised income eligibility threshold',
      sourceUrl: existingRecord.sourceUrl,
      ingestionRunId: runId,
      changedAt: new Date().toISOString(),
      changedBy: 'SYSTEM_INGESTION_CRON'
    });
  }

  // Check minimum percentage
  if (
    incomingData.eligibility?.minimumPercentage !== undefined &&
    incomingData.eligibility.minimumPercentage !== existingRecord.eligibility.minimumPercentage
  ) {
    diffItems.push({
      scholarshipId: existingRecord.id,
      scholarshipTitle: existingRecord.title,
      versionNumber: existingRecord.metadata.version + 1,
      fieldName: 'minimumPercentage',
      previousValue: `${existingRecord.eligibility.minimumPercentage}%`,
      newValue: `${incomingData.eligibility.minimumPercentage}%`,
      changeReason: 'Eligibility cutoff adjusted in new circular',
      sourceUrl: existingRecord.sourceUrl,
      ingestionRunId: runId,
      changedAt: new Date().toISOString(),
      changedBy: 'SYSTEM_INGESTION_CRON'
    });
  }

  // Check benefits
  if (incomingData.benefits && incomingData.benefits.trim() !== existingRecord.benefits.trim()) {
    diffItems.push({
      scholarshipId: existingRecord.id,
      scholarshipTitle: existingRecord.title,
      versionNumber: existingRecord.metadata.version + 1,
      fieldName: 'benefits',
      previousValue: existingRecord.benefits,
      newValue: incomingData.benefits,
      changeReason: 'Allowance or reimbursement rates increased',
      sourceUrl: existingRecord.sourceUrl,
      ingestionRunId: runId,
      changedAt: new Date().toISOString(),
      changedBy: 'SYSTEM_INGESTION_CRON'
    });
  }

  return {
    hasChanged: diffItems.length > 0,
    diffItems
  };
}

/**
 * Section 15: Student Recommendation Flow
 * Strictly local PostgreSQL evaluation without triggering any live network crawls.
 */
export function evaluateStudentRecommendations(
  student: StudentProfile,
  scholarships: CommonScholarship[]
): RecommendationMatch[] {
  const matches: RecommendationMatch[] = [];

  for (const sch of scholarships) {
    if (sch.status !== 'PUBLISHED') continue;

    const criteriaBreakdown: {
      criterion: string;
      satisfied: boolean;
      studentValue: string;
      requirementValue: string;
    }[] = [];

    const reasons: string[] = [];

    // 1. Income Criterion
    let incomeSatisfied = true;
    if (sch.eligibility.maximumAnnualIncome !== null) {
      incomeSatisfied = student.annualFamilyIncome <= sch.eligibility.maximumAnnualIncome;
      criteriaBreakdown.push({
        criterion: 'Family Income Limit',
        satisfied: incomeSatisfied,
        studentValue: `₹${student.annualFamilyIncome.toLocaleString('en-IN')}`,
        requirementValue: `Max ₹${sch.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`
      });
      if (incomeSatisfied) {
        reasons.push(`Family income (₹${student.annualFamilyIncome.toLocaleString('en-IN')}) is within the permissible ceiling`);
      } else {
        reasons.push(`Family income exceeds ceiling of ₹${sch.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`);
      }
    } else {
      criteriaBreakdown.push({
        criterion: 'Family Income Limit',
        satisfied: true,
        studentValue: `₹${student.annualFamilyIncome.toLocaleString('en-IN')}`,
        requirementValue: 'No Income Ceiling'
      });
      reasons.push('Open to all income brackets');
    }

    // 2. Marks / Academic Performance
    const marksSatisfied = student.cgpaOrPercentage >= sch.eligibility.minimumPercentage;
    criteriaBreakdown.push({
      criterion: 'Academic Cutoff',
      satisfied: marksSatisfied,
      studentValue: `${student.cgpaOrPercentage}%`,
      requirementValue: `Min ${sch.eligibility.minimumPercentage}%`
    });
    if (marksSatisfied) {
      reasons.push(`Academic score (${student.cgpaOrPercentage}%) meets or exceeds the required threshold of ${sch.eligibility.minimumPercentage}%`);
    } else {
      reasons.push(`Academic score (${student.cgpaOrPercentage}%) is below the minimum required ${sch.eligibility.minimumPercentage}%`);
    }

    // 3. Course Match
    const courseMatches = sch.eligibility.courses.some(
      c => c.toLowerCase().includes(student.course.toLowerCase()) ||
           student.course.toLowerCase().includes(c.toLowerCase()) ||
           c.toLowerCase() === 'all'
    );
    criteriaBreakdown.push({
      criterion: 'Course Eligibility',
      satisfied: courseMatches,
      studentValue: student.course,
      requirementValue: sch.eligibility.courses.slice(0, 3).join(', ') + (sch.eligibility.courses.length > 3 ? '...' : '')
    });
    if (courseMatches) {
      reasons.push(`Enrolled in eligible program: ${student.course}`);
    } else {
      reasons.push(`Course ${student.course} is not listed under covered programs`);
    }

    // 4. Study Year Match
    const yearMatches = !sch.eligibility.studyYears ||
      sch.eligibility.studyYears.length === 0 ||
      sch.eligibility.studyYears.includes(student.studyYear);
    criteriaBreakdown.push({
      criterion: 'Year of Study',
      satisfied: yearMatches,
      studentValue: `Year ${student.studyYear}`,
      requirementValue: sch.eligibility.studyYears.map(y => `Yr ${y}`).join(', ')
    });
    if (yearMatches) {
      reasons.push(`Year ${student.studyYear} is currently eligible for entry`);
    }

    // 5. State / Domicile Match
    const stateMatches = sch.eligibility.states.some(
      s => s.toLowerCase() === 'all india' || s.toLowerCase() === student.state.toLowerCase()
    );
    criteriaBreakdown.push({
      criterion: 'Domicile / State',
      satisfied: stateMatches,
      studentValue: student.state,
      requirementValue: sch.eligibility.states.join(', ')
    });
    if (stateMatches) {
      reasons.push(`Domicile ${student.state} is supported`);
    }

    // 6. Category Match
    const categoryMatches = !sch.eligibility.categories ||
      sch.eligibility.categories.length === 0 ||
      sch.eligibility.categories.includes('General') ||
      sch.eligibility.categories.includes(student.category);
    criteriaBreakdown.push({
      criterion: 'Social Category',
      satisfied: categoryMatches,
      studentValue: student.category,
      requirementValue: sch.eligibility.categories.join(', ') || 'All Categories'
    });
    if (categoryMatches) {
      reasons.push(`Category ${student.category} is covered by the scheme`);
    }

    // 7. Gender Match
    let genderMatches = true;
    if (sch.eligibility.gender && sch.eligibility.gender !== 'All') {
      genderMatches = sch.eligibility.gender === student.gender;
      criteriaBreakdown.push({
        criterion: 'Gender Reservation',
        satisfied: genderMatches,
        studentValue: student.gender,
        requirementValue: sch.eligibility.gender
      });
      if (genderMatches) {
        reasons.push(`Gender requirement (${sch.eligibility.gender}) satisfied`);
      }
    }

    // Determine strict eligibility
    const isEligible = incomeSatisfied && marksSatisfied && courseMatches && yearMatches && stateMatches && categoryMatches && genderMatches;

    // Calculate TOPSIS / Multi-Criteria score (0-100)
    let score = 0;
    if (incomeSatisfied) score += 25;
    if (marksSatisfied) {
      // Bonus for higher marks over cutoff
      const margin = Math.min(25, (student.cgpaOrPercentage - sch.eligibility.minimumPercentage) * 1.5 + 15);
      score += margin;
    }
    if (courseMatches) score += 20;
    if (stateMatches) score += 15;
    if (categoryMatches) score += 15;

    // Calculate days remaining to deadline
    const deadlineDate = new Date(sch.deadline);
    const today = new Date('2026-09-24T00:00:00Z');
    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let urgency: 'high' | 'medium' | 'low' = 'low';
    if (daysRemaining <= 15) urgency = 'high';
    else if (daysRemaining <= 45) urgency = 'medium';

    matches.push({
      scholarship: sch,
      isEligible,
      matchScore: Math.min(100, Math.round(score)),
      criteriaBreakdown,
      reasons,
      requiredDocuments: sch.documents,
      urgency,
      daysRemaining
    });
  }

  // Sort: Eligible first, then descending by matchScore, then by closest deadline
  return matches.sort((a, b) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.daysRemaining - b.daysRemaining;
  });
}
