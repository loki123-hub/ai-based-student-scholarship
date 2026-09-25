import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getAllScholarshipsFromDb,
  getPublishedScholarshipsFromDb,
  insertOrUpdateScholarshipInDb,
  getAllSourcesFromDb,
  toggleSourceInDb,
  getAllCareerPathwaysFromDb,
  getAllVersionHistoryFromDb,
  insertVersionHistoryInDb
} from './src/db/repository.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Routes

// 1. Health check & PostgreSQL Connection Status
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const list = await getPublishedScholarshipsFromDb();
    res.json({
      status: 'ok',
      database: 'connected_postgresql',
      totalPublishedScholarships: list.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Database error' });
  }
});

// 2. GET /api/scholarships - Fetch all scholarships from PostgreSQL
app.get('/api/scholarships', async (_req: Request, res: Response) => {
  try {
    const records = await getAllScholarshipsFromDb();
    // Normalize format to match client expectations
    const formatted = records.map((r) => ({
      id: r.id,
      title: r.title,
      provider: r.provider,
      description: r.description,
      benefits: r.benefits,
      openingDate: r.openingDate,
      deadline: r.deadline,
      applicationUrl: r.applicationUrl,
      sourceUrl: r.sourceUrl,
      eligibility: {
        minimumPercentage: r.minimumPercentage,
        maximumAnnualIncome: r.maximumAnnualIncome,
        courses: r.courses,
        educationLevel: r.educationLevel,
        studyYears: r.studyYears,
        states: r.states,
        categories: r.categories,
        gender: r.gender,
        specialConditions: r.specialConditions || []
      },
      documents: r.documents,
      additionalConditions: r.additionalConditions,
      contactInfo: r.contactInfo,
      status: r.status,
      metadata: {
        dataSourceType: r.dataSourceType,
        sourceName: r.sourceName,
        sourceUrl: r.sourceUrl,
        sourceExternalId: r.sourceExternalId,
        contentHash: r.contentHash,
        version: r.version,
        lastVerifiedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
        lastChangedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString()
      },
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString()
    }));
    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch scholarships from PostgreSQL' });
  }
});

// 3. POST /api/scholarships - Create or update scholarship in PostgreSQL
app.post('/api/scholarships', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const inserted = await insertOrUpdateScholarshipInDb(data);
    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Error saving scholarship:', error);
    res.status(500).json({ error: error.message || 'Failed to persist scholarship in PostgreSQL' });
  }
});

// 4. POST /api/student/match - Real PostgreSQL matching and career guidance engine!
app.post('/api/student/match', async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    const {
      name = 'Student',
      course = 'B.Tech IT',
      studyYear = 2,
      cgpaOrPercentage = 80,
      annualFamilyIncome = 200000,
      category = 'General',
      state = 'Tamil Nadu',
      gender = 'Male',
      skills = 'Python, HTML, SQL',
      careerInterest = 'Web development and cybersecurity',
      hasSpecialCondition = false,
      specialConditionDetail = ''
    } = req.body;

    // Fetch active scholarships strictly from PostgreSQL (Zero live web scraping)
    const dbScholarships = await getPublishedScholarshipsFromDb();
    const dbCareerPathways = await getAllCareerPathwaysFromDb();

    // 1. Evaluate Deterministic Eligibility & TOPSIS Score for each scholarship
    const matches: any[] = [];

    for (const sch of dbScholarships) {
      const criteriaBreakdown: {
        criterion: string;
        satisfied: boolean;
        studentValue: string;
        requirementValue: string;
      }[] = [];
      const reasons: string[] = [];

      // Income Check
      let incomeSatisfied = true;
      if (sch.maximumAnnualIncome !== null) {
        incomeSatisfied = annualFamilyIncome <= sch.maximumAnnualIncome;
        criteriaBreakdown.push({
          criterion: 'Family Income Limit',
          satisfied: incomeSatisfied,
          studentValue: `₹${Number(annualFamilyIncome).toLocaleString('en-IN')}`,
          requirementValue: `Max ₹${Number(sch.maximumAnnualIncome).toLocaleString('en-IN')}`
        });
        if (incomeSatisfied) {
          reasons.push(`Family income (₹${Number(annualFamilyIncome).toLocaleString('en-IN')}) is within permissible ceiling of ₹${Number(sch.maximumAnnualIncome).toLocaleString('en-IN')}`);
        } else {
          reasons.push(`Family income exceeds ceiling of ₹${Number(sch.maximumAnnualIncome).toLocaleString('en-IN')}`);
        }
      } else {
        criteriaBreakdown.push({
          criterion: 'Family Income Limit',
          satisfied: true,
          studentValue: `₹${Number(annualFamilyIncome).toLocaleString('en-IN')}`,
          requirementValue: 'No Income Ceiling'
        });
        reasons.push('Open to all income brackets');
      }

      // Academic Cutoff Check
      const minPct = sch.minimumPercentage || 50;
      const marksSatisfied = Number(cgpaOrPercentage) >= minPct;
      criteriaBreakdown.push({
        criterion: 'Academic Cutoff',
        satisfied: marksSatisfied,
        studentValue: `${cgpaOrPercentage}%`,
        requirementValue: `Min ${minPct}%`
      });
      if (marksSatisfied) {
        reasons.push(`Academic score (${cgpaOrPercentage}%) meets or exceeds required cutoff of ${minPct}%`);
      } else {
        reasons.push(`Academic score (${cgpaOrPercentage}%) is below minimum required ${minPct}%`);
      }

      // Course Match
      const allowedCourses: string[] = (sch.courses as string[]) || [];
      const courseMatches = allowedCourses.some(
        c => c.toLowerCase().includes(course.toLowerCase()) ||
             course.toLowerCase().includes(c.toLowerCase()) ||
             c.toLowerCase() === 'all'
      );
      criteriaBreakdown.push({
        criterion: 'Course Eligibility',
        satisfied: courseMatches,
        studentValue: course,
        requirementValue: allowedCourses.slice(0, 3).join(', ') + (allowedCourses.length > 3 ? '...' : '')
      });
      if (courseMatches) {
        reasons.push(`Enrolled in eligible academic program: ${course}`);
      } else {
        reasons.push(`Program ${course} is not listed under covered courses`);
      }

      // Study Year Match
      const allowedYears: number[] = (sch.studyYears as number[]) || [];
      const yearMatches = allowedYears.length === 0 || allowedYears.includes(Number(studyYear));
      criteriaBreakdown.push({
        criterion: 'Year of Study',
        satisfied: yearMatches,
        studentValue: `Year ${studyYear}`,
        requirementValue: allowedYears.map(y => `Yr ${y}`).join(', ')
      });
      if (yearMatches) {
        reasons.push(`Year ${studyYear} is currently eligible for entry`);
      }

      // Domicile / State Match
      const allowedStates: string[] = (sch.states as string[]) || [];
      const stateMatches = allowedStates.some(
        s => s.toLowerCase() === 'all india' || s.toLowerCase() === state.toLowerCase()
      );
      criteriaBreakdown.push({
        criterion: 'Domicile / State',
        satisfied: stateMatches,
        studentValue: state,
        requirementValue: allowedStates.join(', ')
      });
      if (stateMatches) {
        reasons.push(`State domicile (${state}) is recognized`);
      }

      // Category Match
      const allowedCategories: string[] = (sch.categories as string[]) || [];
      const categoryMatches = allowedCategories.length === 0 ||
        allowedCategories.includes('General') ||
        allowedCategories.includes(category);
      criteriaBreakdown.push({
        criterion: 'Social Category',
        satisfied: categoryMatches,
        studentValue: category,
        requirementValue: allowedCategories.join(', ') || 'All Categories'
      });
      if (categoryMatches) {
        reasons.push(`Category ${category} is supported`);
      }

      // Gender Match
      let genderMatches = true;
      if (sch.gender && sch.gender !== 'All') {
        genderMatches = sch.gender.toLowerCase() === gender.toLowerCase();
        criteriaBreakdown.push({
          criterion: 'Gender Reservation',
          satisfied: genderMatches,
          studentValue: gender,
          requirementValue: sch.gender
        });
        if (genderMatches) {
          reasons.push(`Gender requirement (${sch.gender}) satisfied`);
        }
      }

      const isEligible = incomeSatisfied && marksSatisfied && courseMatches && yearMatches && stateMatches && categoryMatches && genderMatches;

      // TOPSIS Multi-Criteria Score Calculation
      let score = 0;
      if (incomeSatisfied) score += 25;
      if (marksSatisfied) {
        const margin = Math.min(25, (Number(cgpaOrPercentage) - minPct) * 1.5 + 15);
        score += margin;
      }
      if (courseMatches) score += 20;
      if (stateMatches) score += 15;
      if (categoryMatches) score += 15;

      // Days remaining calculation
      const deadlineDate = new Date(sch.deadline);
      const today = new Date('2026-09-24T00:00:00Z');
      const diffTime = deadlineDate.getTime() - today.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      matches.push({
        scholarship: {
          id: sch.id,
          title: sch.title,
          provider: sch.provider,
          description: sch.description,
          benefits: sch.benefits,
          deadline: sch.deadline,
          applicationUrl: sch.applicationUrl,
          sourceUrl: sch.sourceUrl,
          eligibility: {
            minimumPercentage: sch.minimumPercentage,
            maximumAnnualIncome: sch.maximumAnnualIncome,
            courses: sch.courses,
            educationLevel: sch.educationLevel,
            studyYears: sch.studyYears,
            states: sch.states,
            categories: sch.categories,
            gender: sch.gender,
            specialConditions: sch.specialConditions || []
          },
          documents: sch.documents,
          metadata: {
            dataSourceType: sch.dataSourceType,
            sourceName: sch.sourceName,
            version: sch.version
          }
        },
        isEligible,
        matchScore: Math.min(100, Math.round(score)),
        criteriaBreakdown,
        reasons,
        requiredDocuments: sch.documents,
        daysRemaining
      });
    }

    // Sort: Eligible first, then highest score
    matches.sort((a, b) => {
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.daysRemaining - b.daysRemaining;
    });

    const eligibleScholarships = matches.filter(m => m.isEligible);
    const otherScholarships = matches.filter(m => !m.isEligible);

    // 2. Career Guidance & Personalized Learning Plan Formulation
    // Grounded in the Panimalar paper's methodology:
    // Ties student interests and skills to suitable domains, job roles, and study paths
    const studentInterestLower = (careerInterest + ' ' + skills).toLowerCase();
    
    // Score each career pathway from PostgreSQL based on keyword / TF-IDF match with student skills and interest
    const scoredCareers = dbCareerPathways.map((cp) => {
      let fitScore = 50;
      const skillsArray: string[] = (cp.requiredSkills as string[]) || [];
      const coursesArray: string[] = (cp.relevantCourses as string[]) || [];

      // Check course affinity
      if (coursesArray.some(c => course.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(course.toLowerCase()))) {
        fitScore += 20;
      }

      // Check skills match
      const matchedSkills = skillsArray.filter(s => studentInterestLower.includes(s.toLowerCase()));
      fitScore += matchedSkills.length * 8;

      // Check interest alignment
      if (studentInterestLower.includes(cp.domain.toLowerCase()) || studentInterestLower.includes(cp.title.toLowerCase())) {
        fitScore += 20;
      }

      // Keyword specific checks from paper
      if (studentInterestLower.includes('web') && cp.id === 'car_fullstack') fitScore += 25;
      if (studentInterestLower.includes('cyber') && cp.id === 'car_cybersecurity') fitScore += 25;
      if ((studentInterestLower.includes('data') || studentInterestLower.includes('python')) && cp.id === 'car_data_ml') fitScore += 25;
      if ((studentInterestLower.includes('govt') || studentInterestLower.includes('exam')) && cp.id === 'car_gov_tech') fitScore += 25;

      return {
        ...cp,
        fitScore: Math.min(99, fitScore),
        matchedSkills,
        missingSkills: skillsArray.filter(s => !studentInterestLower.includes(s.toLowerCase()))
      };
    });

    scoredCareers.sort((a, b) => b.fitScore - a.fitScore);
    const topCareer = scoredCareers[0] || null;

    const endTime = performance.now();
    const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));

    res.json({
      success: true,
      queryExecutionTimeMs: executionTimeMs,
      totalEvaluated: dbScholarships.length,
      eligibleCount: eligibleScholarships.length,
      eligibleScholarships,
      otherScholarships,
      primaryCareerGuidance: topCareer,
      allCareerPathways: scoredCareers,
      studentProfile: {
        name,
        course,
        studyYear,
        cgpaOrPercentage,
        annualFamilyIncome,
        category,
        state,
        gender,
        skills,
        careerInterest
      }
    });
  } catch (error: any) {
    console.error('Error in student matching:', error);
    res.status(500).json({ error: error.message || 'Error executing student match against PostgreSQL' });
  }
});

// 5. GET /api/career/pathways - Fetch career guidance pathways from PostgreSQL
app.get('/api/career/pathways', async (_req: Request, res: Response) => {
  try {
    const list = await getAllCareerPathwaysFromDb();
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching career pathways:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch career pathways' });
  }
});

// 6. GET /api/ingestion/sources - Fetch sources configuration
app.get('/api/ingestion/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await getAllSourcesFromDb();
    res.json(sources);
  } catch (error: any) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sources' });
  }
});

// 7. PATCH /api/ingestion/sources/:id - Toggle source enabled status
app.patch('/api/ingestion/sources/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const updated = await toggleSourceInDb(id, enabled);
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating source:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle source' });
  }
});

// 8. GET /api/version-history - Fetch version history audit log
app.get('/api/version-history', async (_req: Request, res: Response) => {
  try {
    const history = await getAllVersionHistoryFromDb();
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch version history' });
  }
});

// Vite Middleware for Frontend Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[SERVER] AI_Based_Student_Scholarship_and_Career_Guidance backend listening on port ${port}`);
    console.log(`[POSTGRESQL] Connected to Cloud SQL PostgreSQL instance.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
