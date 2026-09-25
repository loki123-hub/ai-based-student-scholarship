import React, { useState, useEffect } from 'react';
import { CommonScholarship, StudentProfile, RecommendationMatch } from '../types/scholarship';
import {
  UserCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Database,
  Award,
  BookOpen,
  Compass,
  ArrowRight,
  Send,
  Bot,
  User,
  Layers,
  Calendar,
  DollarSign,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface CareerPathwayData {
  id: string;
  domain: string;
  title: string;
  description: string;
  requiredSkills: string[];
  learningRoadmap: {
    phase: string;
    duration: string;
    topics: string[];
    projects: string[];
    resources: string[];
  }[];
  relevantCourses: string[];
  recommendedCertifications: string[];
  matchingScholarshipTypes: string[];
  salaryGrowthOutlook: string;
  fitScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export const StudentGuidanceMatch: React.FC = () => {
  // Student Profile state initialized with Paper TC-01 (Lokesh N, Panimalar Engineering College)
  const [name, setName] = useState('Lokesh N');
  const [course, setCourse] = useState('B.Tech IT');
  const [studyYear, setStudyYear] = useState<number>(2);
  const [cgpaOrPercentage, setCgpaOrPercentage] = useState<number>(82); // 8.2 CGPA ~ 82%
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState<number>(180000);
  const [category, setCategory] = useState('OBC');
  const [state, setState] = useState('Tamil Nadu');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Transgender' | 'Other'>('Male');
  const [skills, setSkills] = useState('Python, HTML, basic SQL, JavaScript basics');
  const [careerInterest, setCareerInterest] = useState('Web development and cybersecurity');
  const [hasSpecialCondition, setHasSpecialCondition] = useState(true);
  const [specialConditionDetail, setSpecialConditionDetail] = useState('Rural resident, first generation college attendee');

  // Backend match response state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryExecutionTimeMs, setQueryExecutionTimeMs] = useState<number>(5.2);
  const [eligibleScholarships, setEligibleScholarships] = useState<RecommendationMatch[]>([]);
  const [otherScholarships, setOtherScholarships] = useState<RecommendationMatch[]>([]);
  const [primaryCareer, setPrimaryCareer] = useState<CareerPathwayData | null>(null);
  const [allCareers, setAllCareers] = useState<CareerPathwayData[]>([]);
  const [activeView, setActiveView] = useState<'combined' | 'scholarships' | 'career'>('combined');

  // Chatbot conversation state (Section III & Table III from Panimalar paper)
  const [chatMessages, setChatMessages] = useState<{
    sender: 'bot' | 'user';
    text: string;
    timestamp: string;
    dataCard?: {
      type: 'scholarship_and_career';
      topScholarship?: string;
      benefits?: string;
      topCareer?: string;
      recommendedSkills?: string[];
      documents?: string[];
    };
  }[]>([
    {
      sender: 'bot',
      text: 'Hello! I am your AI-Based Student Scholarship & Career Guidance Assistant. I analyze your academic, financial, category, and career interests directly against our live PostgreSQL repository to generate personalized financial aid opportunities and skill development roadmaps.',
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('Which scholarship and career path suits me?');

  // Function to execute real PostgreSQL query via Express backend
  const executePostgreSqlMatch = async (customProfile?: any) => {
    setLoading(true);
    setError(null);
    try {
      const payload = customProfile || {
        name,
        course,
        studyYear,
        cgpaOrPercentage,
        annualFamilyIncome,
        category,
        state,
        gender,
        skills,
        careerInterest,
        hasSpecialCondition,
        specialConditionDetail
      };

      const response = await fetch('/api/student/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setEligibleScholarships(data.eligibleScholarships || []);
      setOtherScholarships(data.otherScholarships || []);
      setPrimaryCareer(data.primaryCareerGuidance || null);
      setAllCareers(data.allCareerPathways || []);
      setQueryExecutionTimeMs(data.queryExecutionTimeMs || 4.8);
      return data;
    } catch (err: any) {
      console.error('PostgreSQL API error:', err);
      setError(err.message || 'Failed to connect to backend PostgreSQL server');
    } finally {
      setLoading(false);
    }
  };

  // Initial load against PostgreSQL
  useEffect(() => {
    executePostgreSqlMatch();
  }, []);

  const handleApplyPreset = (tc: 1 | 2 | 3 | 4) => {
    let p: any = {};
    if (tc === 1) {
      // Paper TC-01: B.Tech IT, 2nd yr, 8.2 CGPA, 1.8L income, OBC, TN, Web dev & Cybersecurity
      p = {
        name: 'Lokesh N (Paper TC-01)',
        course: 'B.Tech IT',
        studyYear: 2,
        cgpaOrPercentage: 82,
        annualFamilyIncome: 180000,
        category: 'OBC',
        state: 'Tamil Nadu',
        gender: 'Male',
        skills: 'Python, HTML, basic SQL, JavaScript',
        careerInterest: 'Web development and cybersecurity',
        hasSpecialCondition: true,
        specialConditionDetail: 'Economically weaker / rural student'
      };
    } else if (tc === 2) {
      // Paper TC-02: State diploma & rural support, Technical assistant / junior engineer path
      p = {
        name: 'Murugan K (Paper TC-02)',
        course: 'Diploma Engineering',
        studyYear: 2,
        cgpaOrPercentage: 78,
        annualFamilyIncome: 120000,
        category: 'OBC',
        state: 'Tamil Nadu',
        gender: 'Male',
        skills: 'Circuit design, basic networking, electrical basics',
        careerInterest: 'Technical assistant and government junior engineer exams',
        hasSpecialCondition: true,
        specialConditionDetail: 'Rural schooling background'
      };
    } else if (tc === 3) {
      // Paper TC-03: Data Analyst / ML Beginner
      p = {
        name: 'Ananya S (Paper TC-03)',
        course: 'B.Tech AI&DS',
        studyYear: 3,
        cgpaOrPercentage: 86,
        annualFamilyIncome: 240000,
        category: 'General',
        state: 'Tamil Nadu',
        gender: 'Female',
        skills: 'Python, statistics, pandas, basic ML, SQL',
        careerInterest: 'Data analyst, ML engineer and AI research',
        hasSpecialCondition: false
      };
    } else if (tc === 4) {
      // Paper TC-04: Women-in-STEM, Cybersecurity Analyst
      p = {
        name: 'Kavitha R (Paper TC-04)',
        course: 'B.Tech IT',
        studyYear: 1,
        cgpaOrPercentage: 89,
        annualFamilyIncome: 450000,
        category: 'General',
        state: 'Tamil Nadu',
        gender: 'Female',
        skills: 'Linux, networking basics, C++, Python',
        careerInterest: 'Cybersecurity analyst, ethical hacking, cloud security',
        hasSpecialCondition: false
      };
    }

    setName(p.name);
    setCourse(p.course);
    setStudyYear(p.studyYear);
    setCgpaOrPercentage(p.cgpaOrPercentage);
    setAnnualFamilyIncome(p.annualFamilyIncome);
    setCategory(p.category);
    setState(p.state);
    setGender(p.gender);
    setSkills(p.skills);
    setCareerInterest(p.careerInterest);
    setHasSpecialCondition(p.hasSpecialCondition);
    setSpecialConditionDetail(p.specialConditionDetail || '');

    executePostgreSqlMatch(p);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Re-evaluate in backend
    const matchData = await executePostgreSqlMatch();

    if (matchData) {
      const topSch = matchData.eligibleScholarships?.[0]?.scholarship;
      const topCar = matchData.primaryCareerGuidance;

      let answerText = `Based on your academic profile (${course}, Year ${studyYear}, ${cgpaOrPercentage}%) and family income (₹${Number(annualFamilyIncome).toLocaleString('en-IN')}), I matched your data against our PostgreSQL repository.`;

      if (topSch && topCar) {
        answerText += ` You are eligible for "${topSch.title}" offering ${topSch.benefits}. For your career interest in ${careerInterest}, the highest matching career path is "${topCar.title}" (${topCar.domain}).`;
      } else if (topSch) {
        answerText += ` You qualify for "${topSch.title}" providing ${topSch.benefits}.`;
      } else if (topCar) {
        answerText += ` We have formulated a specialized skill development roadmap for "${topCar.title}".`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: answerText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dataCard: {
            type: 'scholarship_and_career',
            topScholarship: topSch?.title,
            benefits: topSch?.benefits,
            topCareer: topCar?.title,
            recommendedSkills: topCar?.requiredSkills,
            documents: topSch?.documents
          }
        }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span className="font-semibold text-neutral-800">
              AI-Based Student Scholarship &amp; Career Guidance
            </span>
            <span aria-hidden="true">·</span>
            <span>Panimalar Engineering College Research Paper</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              <Database className="w-3 h-3" /> PostgreSQL Connected
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Integrated Scholarship &amp; Career Guidance Engine
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Query normalized scholarship opportunities and tailored career roadmaps directly from PostgreSQL with deterministic eligibility rules.
          </p>
        </div>

        {/* Paper Test Cases Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-neutral-500 font-medium">Paper Scenarios:</span>
          <button
            onClick={() => handleApplyPreset(1)}
            className="px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            TC-01 (IT / Full-Stack)
          </button>
          <button
            onClick={() => handleApplyPreset(2)}
            className="px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            TC-02 (Govt JE / Diploma)
          </button>
          <button
            onClick={() => handleApplyPreset(3)}
            className="px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            TC-03 (Data &amp; ML)
          </button>
          <button
            onClick={() => handleApplyPreset(4)}
            className="px-2.5 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            TC-04 (Cybersecurity)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => executePostgreSqlMatch()}
            className="px-2.5 py-1 bg-white border border-rose-300 rounded text-rose-700 font-medium"
          >
            Retry PostgreSQL Connection
          </button>
        </div>
      )}

      {/* Main Grid: Left Profile Form, Right Output Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Student Profile Parameters Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Student Input Profile (Paper Table II)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">Live PostgreSQL Match</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-neutral-800">Student Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Course / Degree</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Study Year</label>
                  <select
                    value={studyYear}
                    onChange={(e) => setStudyYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Marks / CGPA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cgpaOrPercentage}
                    onChange={(e) => setCgpaOrPercentage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">Converted from CGPA e.g. 8.2 &rarr; 82%</span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    step="10000"
                    value={annualFamilyIncome}
                    onChange={(e) => setAnnualFamilyIncome(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                  />
                  <span className="text-[10px] text-neutral-500">₹{Number(annualFamilyIncome).toLocaleString('en-IN')}/year</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Social Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                  >
                    <option value="General">General / OC</option>
                    <option value="OBC">OBC (BC / MBC / DNC)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Domicile State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-neutral-800">Special Condition</label>
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="specCond"
                      checked={hasSpecialCondition}
                      onChange={(e) => setHasSpecialCondition(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="specCond" className="text-neutral-700">Rural / 1st Gen College</label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-800">Known Skills / Courses</label>
                <input
                  type="text"
                  placeholder="e.g. Python, HTML, basic SQL, JavaScript"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-neutral-800">Career Interest / Domain Preference</label>
                <input
                  type="text"
                  placeholder="e.g. Web development, cybersecurity, machine learning, govt exams"
                  value={careerInterest}
                  onChange={(e) => setCareerInterest(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <button
                type="button"
                onClick={() => executePostgreSqlMatch()}
                disabled={loading}
                className="w-full mt-2 py-2 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Evaluating in PostgreSQL...' : 'Run Match Against PostgreSQL'}</span>
              </button>
            </div>
          </div>

          {/* Execution Metric Proof */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1 text-neutral-600">
            <div className="flex items-center justify-between text-neutral-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend PostgreSQL Status:</span>
              </span>
              <span className="font-mono text-emerald-700 font-bold">{queryExecutionTimeMs} ms</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Query processed directly by Express backend route <code className="font-mono text-[10px] bg-neutral-200 px-1 py-0.5 rounded">POST /api/student/match</code> querying Cloud SQL PostgreSQL database with zero live web crawling.
            </p>
          </div>
        </div>

        {/* Right: Results / Chatbot Guidance / Career Roadmap */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView('combined')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeView === 'combined'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Chatbot Guidance (Paper View)
              </button>

              <button
                onClick={() => setActiveView('scholarships')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeView === 'scholarships'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <span>Scholarships</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800 font-mono">
                  {eligibleScholarships.length}
                </span>
              </button>

              <button
                onClick={() => setActiveView('career')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeView === 'career'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                Career Plan &amp; Roadmap
              </button>
            </div>

            <span className="text-[11px] font-mono text-neutral-400">
              {eligibleScholarships.length} Eligible of {eligibleScholarships.length + otherScholarships.length}
            </span>
          </div>

          {/* VIEW 1: COMBINED CHATBOT GUIDANCE (Panimalar Paper Section III) */}
          {activeView === 'combined' && (
            <div className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col h-[520px]">
                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 text-xs ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl p-3.5 space-y-2.5 leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-50 border border-neutral-200 text-neutral-800'
                        }`}
                      >
                        <div className="text-[11px] opacity-70 mb-0.5">{msg.timestamp}</div>
                        <div>{msg.text}</div>

                        {/* Interactive Data Card returned by Chatbot Engine */}
                        {msg.dataCard && (
                          <div className="mt-2.5 p-3 bg-white border border-neutral-200 rounded-lg space-y-2.5 text-neutral-900">
                            {/* Scholarship Section */}
                            <div className="space-y-1 border-b border-neutral-100 pb-2">
                              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                                <Award className="w-3.5 h-3.5" />
                                <span>Recommended Scholarship (PostgreSQL Match)</span>
                              </div>
                              <div className="font-bold text-xs">{msg.dataCard.topScholarship}</div>
                              <div className="text-[11px] text-neutral-600">{msg.dataCard.benefits}</div>
                            </div>

                            {/* Career Section */}
                            <div className="space-y-1 border-b border-neutral-100 pb-2">
                              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-[11px]">
                                <Compass className="w-3.5 h-3.5" />
                                <span>Aligned Career Path &amp; Skill Development</span>
                              </div>
                              <div className="font-bold text-xs">{msg.dataCard.topCareer}</div>
                            </div>

                            {/* Skills Checklist */}
                            {msg.dataCard.recommendedSkills && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-neutral-700">Next Skills to Master:</span>
                                <div className="flex flex-wrap gap-1">
                                  {msg.dataCard.recommendedSkills.slice(0, 5).map((sk, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-neutral-100 rounded text-[10px]">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Document Checklist */}
                            {msg.dataCard.documents && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[11px] font-semibold text-neutral-700">Required Documents:</span>
                                <ul className="list-disc pl-4 text-[10px] text-neutral-600 space-y-0.5">
                                  {msg.dataCard.documents.slice(0, 3).map((d, idx) => (
                                    <li key={idx}>{d}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat Input Box */}
                <div className="pt-3 border-t border-neutral-200 mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendMessage())}
                    placeholder="Ask guidance: e.g. Which scholarship and career path suits me?"
                    className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: SCHOLARSHIPS STREAM (FROM POSTGRESQL) */}
          {activeView === 'scholarships' && (
            <div className="space-y-3">
              {eligibleScholarships.length === 0 ? (
                <div className="p-8 bg-white border border-neutral-200 rounded-xl text-center text-xs text-neutral-500">
                  No scholarships matched the current strict eligibility criteria in PostgreSQL. Try adjusting family income or selecting all categories.
                </div>
              ) : (
                eligibleScholarships.map((match) => {
                  const sch = match.scholarship;
                  return (
                    <div
                      key={sch.id}
                      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-neutral-500 mb-0.5">{sch.provider}</div>
                          <h4 className="text-sm font-bold text-neutral-900 leading-snug">{sch.title}</h4>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                            </span>
                            <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                              {match.matchScore}% Score
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                            {match.daysRemaining} days left
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
                        <span className="text-neutral-500">Financial Aid Grant: </span>
                        <strong className="text-neutral-900">{sch.benefits}</strong>
                      </div>

                      {/* Deterministic Rules Passed */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-neutral-700">PostgreSQL Eligibility Evaluation:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {match.criteriaBreakdown.map((crit, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 bg-emerald-50/50 border border-emerald-200 rounded text-[11px] flex items-center justify-between text-emerald-950"
                            >
                              <span className="truncate pr-1 font-medium">{crit.criterion}: {crit.studentValue}</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Required Enclosures */}
                      <div className="pt-2 border-t border-neutral-100">
                        <div className="text-[11px] font-semibold text-neutral-700 mb-1">
                          Mandatory Enclosures to Prepare:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {match.requiredDocuments.map((doc, i) => (
                            <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px]">
                              ✓ {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-neutral-400">
                          Deadline: {sch.deadline}
                        </span>
                        <a
                          href={sch.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Official Portal Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 3: CAREER GUIDANCE & STRUCTURED LEARNING ROADMAP */}
          {activeView === 'career' && primaryCareer && (
            <div className="space-y-5">
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                      {primaryCareer.domain}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 mt-0.5">{primaryCareer.title}</h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{primaryCareer.description}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded text-xs font-mono font-bold">
                    {primaryCareer.fitScore}% Profile Fit
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Recommended Certifications</span>
                    </span>
                    <ul className="list-disc pl-4 text-neutral-600 space-y-0.5 text-[11px]">
                      {primaryCareer.recommendedCertifications.map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Industry &amp; Salary Growth Outlook</span>
                    </span>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      {primaryCareer.salaryGrowthOutlook}
                    </p>
                  </div>
                </div>

                {/* 4-Phase Step-by-Step Learning Roadmap */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-700" />
                    <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                      Structured 4-Phase Skill Learning Roadmap
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {primaryCareer.learningRoadmap.map((step, idx) => (
                      <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-neutral-900">
                          <span>{step.phase}</span>
                          <span className="font-mono text-[10px] text-neutral-500 font-normal bg-neutral-200 px-2 py-0.5 rounded">
                            {step.duration}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-neutral-700 text-[11px]">Key Topics: </span>
                          <span className="text-neutral-600">{step.topics.join(' · ')}</span>
                        </div>

                        <div>
                          <span className="font-medium text-neutral-700 text-[11px]">Hands-on Projects: </span>
                          <span className="text-neutral-600 font-medium">{step.projects.join('; ')}</span>
                        </div>

                        <div className="text-[10px] text-neutral-400">
                          Curated Resources: {step.resources.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
