import React, { useState } from 'react';
import { Copy, Download, Check, Search, BookOpen, Layers, ShieldCheck, Database, Calendar } from 'lucide-react';
import { ArchitectureFlows } from './ArchitectureFlows';

export const PRDViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('summary');

  const handleCopyMarkdown = () => {
    // In browser, copy text
    const text = document.getElementById('prd-markdown-container')?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = document.getElementById('prd-markdown-container')?.innerText || '';
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PRD_Scholarship_Ingestion_v2.4.0.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'summary', title: '1. Executive Summary & Objective' },
    { id: 'sec1', title: '2. Section 1: Manual Scholarship Entry' },
    { id: 'sec2', title: '3. Section 2: Automatic Web Ingestion' },
    { id: 'sec3', title: '4. Section 3: Crawling Strategy (Cheerio/Playwright)' },
    { id: 'sec4', title: '5. Section 4: Source-Specific Adapters' },
    { id: 'sec5', title: '6. Section 5: Common Scholarship Format' },
    { id: 'sec6', title: '7. Section 6: Data Source Identification' },
    { id: 'sec7', title: '8. Section 7: Automatic Validation Engine' },
    { id: 'sec8', title: '9. Section 8: Admin Review of Collected Data' },
    { id: 'sec9', title: '10. Section 9 & 10: Duplicate & Change Detection' },
    { id: 'sec11', title: '11. Section 11: Version History & Audit Trail' },
    { id: 'sec12', title: '12. Section 12: Source Configuration Registry' },
    { id: 'sec13', title: '13. Section 13: Cron Job & Scheduling Specification' },
    { id: 'sec14', title: '14. Section 14: Complete Dual Data Flow' },
    { id: 'sec15', title: '15. Section 15: Student Recommendation Flow' },
    { id: 'sec16', title: '16. Section 16: Core Functional Requirement' },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Flow Visualizer at top of PRD */}
      <ArchitectureFlows />

      {/* Main PRD Specification Container */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>PRD Specification v2.4.0</span>
              <span aria-hidden="true">·</span>
              <span>Panimalar Engineering College IT Dept</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">Status: Approved</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Product Requirements Document: Dual-Method Scholarship Data Platform
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy PRD'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PRD.md</span>
            </button>
          </div>
        </div>

        {/* Content Area with Sticky Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
          {/* Table of Contents Column */}
          <div className="p-4 bg-neutral-50/70">
            <div className="sticky top-6 space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter PRD sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-hidden focus:border-neutral-400"
                />
              </div>

              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-1">
                PRD Sections
              </div>

              <nav className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
                {sections
                  .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        activeSection === s.id
                          ? 'bg-neutral-900 text-white font-medium'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
              </nav>
            </div>
          </div>

          {/* Specification Body */}
          <div className="lg:col-span-3 p-6 md:p-8 space-y-10 text-neutral-800 text-sm leading-relaxed" id="prd-markdown-container">
            {/* 1. Summary */}
            <section id="summary" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">1. Executive Summary & Objective</h3>
              </div>
              <p className="text-neutral-600">
                The AI-Based Student Scholarship and Career Guidance System (Panimalar Engineering College, IT Dept) connects students with educational opportunities and personalized learning paths. Because students often miss scholarships spread across disparate central, state, and private portals, the system introduces a <strong>dual-strategy data management architecture</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">Method 1: Manual Scholarship Entry</div>
                  <p className="text-xs text-neutral-600">
                    Provides an authorized administrative workspace to create, edit, verify, preview, validate, and publish verified scholarships. Serves as human oversight, official override, and entry point for institution-specific trust schemes.
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">Method 2: Automatic Web Ingestion</div>
                  <p className="text-xs text-neutral-600">
                    A scheduled background cron job executing source-specific adapters (Cheerio/Playwright) to periodically crawl official government portals, normalize data, detect duplicates and changes, and maintain local PostgreSQL accuracy without human intervention.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800">
                <strong>Core Invariant:</strong> Student search and recommendation queries <em>never</em> trigger live web scraping. All recommendations execute from the normalized local PostgreSQL database, guaranteeing fast sub-100ms responses and full offline reliability.
              </div>
            </section>

            {/* Section 1 */}
            <section id="sec1" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">2. Section 1: Manual Scholarship Entry</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The application provides an Admin module where an authorized administrator can manually create, edit, verify, publish, archive, and update scholarship information.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-neutral-200 rounded-lg overflow-hidden">
                  <thead className="bg-neutral-100 text-neutral-700 font-semibold">
                    <tr>
                      <th className="p-2 border-b border-neutral-200">Required Field</th>
                      <th className="p-2 border-b border-neutral-200">Type</th>
                      <th className="p-2 border-b border-neutral-200">Validation Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600 font-mono text-[11px]">
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Scholarship Name</td><td>String</td><td>Required; min 5 chars</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Provider / Organization</td><td>String</td><td>Required; e.g. AICTE, MSJE</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Scholarship Description</td><td>Text</td><td>Detailed markdown overview</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Benefits / Amount</td><td>String</td><td>Quantified financial aid and allowances</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Official Source URL & App URL</td><td>URL</td><td>Must be valid reachable HTTPS format</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Opening & Closing Dates</td><td>ISO Date</td><td>Opening date must be &le; Closing date</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Eligible Courses & Level</td><td>Array</td><td>Multi-select: B.Tech, B.E., Diploma, etc.</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Min Marks / Percentage / CGPA</td><td>Float</td><td>Standardized to 0.0 – 100.0% scale</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Max Annual Family Income</td><td>Integer</td><td>In INR (₹); null if unconstrained</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Categories, States, Gender, Age</td><td>Multi-select</td><td>Domicile, reservations, and age limits</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Required Documents Checklist</td><td>String[]</td><td>Enclosure list for student preparation</td></tr>
                    <tr><td className="p-2 font-sans font-medium text-neutral-900">Contact & Source Verification Date</td><td>Metadata</td><td>Support hotline and verification timestamp</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-neutral-600 text-xs">
                The administrator can save the scholarship as a draft, preview it, validate the entered information, and publish it. Manual entry remains permanently available even when automatic ingestion is active.
              </p>
            </section>

            {/* Section 2 */}
            <section id="sec2" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">3. Section 2: Automatic Scholarship Collection</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The system uses a scheduled background process or cron job to periodically visit configured scholarship websites and retrieve scholarship information independently from student searches.
              </p>
              <div className="p-4 bg-neutral-900 text-neutral-200 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`Cron Job
    ↓
Load Enabled Scholarship Sources
    ↓
Visit Official Scholarship Website
    ↓
Discover Available Scholarship Pages
    ↓
Open Scholarship Detail Pages
    ↓
Extract Raw Scholarship Information
    ↓
Parse Eligibility and Scholarship Details
    ↓
Normalize Data Into Common Application Format
    ↓
Validate Extracted Information
    ↓
Compare With Existing Database Record
    ↓
Insert / Update / Mark For Review
    ↓
Store In PostgreSQL`}</pre>
              </div>
            </section>

            {/* Section 3 */}
            <section id="sec3" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">4. Section 3: Website Crawling Strategy</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Because different scholarship websites use different web technologies, the ingestion pipeline implements two complementary extraction strategies:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-1">Server-Rendered HTML (Cheerio)</div>
                  <p className="text-neutral-600">
                    HTTP Request &rarr; Raw HTML &rarr; Cheerio Parser &rarr; Extract Structured Data. Used for high-speed parsing of static government portals (e.g. NSP, UGC).
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-1">Dynamic JavaScript Sites (Playwright)</div>
                  <p className="text-neutral-600">
                    Headless Browser &rarr; Open Website &rarr; Wait for Selectors &rarr; Read Rendered HTML &rarr; Extract Data. Used when schemes are loaded via client-side frameworks (e.g. AICTE).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="sec4" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">5. Section 4: Source-Specific Adapters</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Rather than assuming a single generic scraper fits every website, each major scholarship portal maintains its own dedicated adapter file under <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">scholarship-ingestion/sources/</code>:
              </p>
              <ul className="list-disc pl-5 text-xs text-neutral-600 space-y-1 font-mono">
                <li>nsp.source.ts &mdash; National Scholarship Portal scraper</li>
                <li>aicte.source.ts &mdash; AICTE schemes and girl student grants</li>
                <li>ugc.source.ts &mdash; UGC Ishan Uday & PG fellowship portal</li>
                <li>tamil-nadu.source.ts &mdash; Tamil Nadu State BC/MBC/DNC portal</li>
              </ul>
              <p className="text-neutral-600 text-xs">
                Each adapter encapsulates listing URL discovery, rendering strategy, CSS selectors for title, eligibility, deadlines, documents, and application links, converting source data into the common schema.
              </p>
            </section>

            {/* Section 5 */}
            <section id="sec5" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">6. Section 5: Common Scholarship Format</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Regardless of whether a scholarship is added manually or imported automatically, both methods produce the identical internal structure in PostgreSQL:
              </p>
              <div className="p-3 bg-neutral-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                <pre>{`{
  "title": "Example Engineering Scholarship",
  "provider": "Example Organization",
  "description": "Scholarship description",
  "benefits": "Up to ₹50,000",
  "openingDate": "2026-09-01",
  "deadline": "2026-11-30",
  "applicationUrl": "https://official-site.example/apply",
  "sourceUrl": "https://official-site.example/scholarship",
  "eligibility": {
    "minimumPercentage": 75,
    "maximumAnnualIncome": 250000,
    "courses": ["B.Tech", "B.E."],
    "studyYears": [1, 2, 3, 4],
    "states": ["Tamil Nadu"],
    "categories": []
  },
  "documents": ["Income Certificate", "Mark Sheet", "College ID"]
}`}</pre>
              </div>
            </section>

            {/* Section 6 */}
            <section id="sec6" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">7. Section 6: Data Source Identification & Provenance</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Every scholarship records its data provenance:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">data_source_type: 'manual' | 'automatic_web' | 'imported'</div>
                <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">source_external_id</div>
                <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">content_hash (SHA-256)</div>
                <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">last_scraped_at / verified_at</div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="sec7" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">8. Section 7: Automatic Validation</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The automated validation engine inspects extracted records before publishing or updating. Validates:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded text-emerald-900">
                  <strong>VALID:</strong> All required fields found with high confidence (&ge;90%). Inserted or updated directly into PostgreSQL.
                </div>
                <div className="p-2 bg-amber-50/60 border border-amber-200 rounded text-amber-900">
                  <strong>NEEDS_REVIEW:</strong> Ambiguous income or categories. Routed to human review queue rather than publishing incorrect data.
                </div>
                <div className="p-2 bg-rose-50/60 border border-rose-200 rounded text-rose-900">
                  <strong>FAILED:</strong> Missing title or unreachable official source URL. Logged to audit errors table.
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="sec8" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">9. Section 8: Admin Review of Automatically Collected Data</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The Admin dashboard features an ingestion-monitoring section and dedicated Review Queue:
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-neutral-800">Review Item Presentation:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white border border-neutral-200 rounded">
                    <span className="font-medium text-emerald-700">Extracted Successfully:</span>
                    <ul className="mt-1 text-neutral-600 list-disc pl-4 space-y-0.5">
                      <li>Scholarship Name &amp; Provider</li>
                      <li>Application Deadline</li>
                      <li>Official Application URL</li>
                      <li>Income Limit</li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-white border border-neutral-200 rounded">
                    <span className="font-medium text-amber-700">Uncertain / Missing:</span>
                    <ul className="mt-1 text-neutral-600 list-disc pl-4 space-y-0.5">
                      <li>Eligible Categories</li>
                      <li>Special Condition Constraints</li>
                      <li>Required Documents</li>
                    </ul>
                  </div>
                </div>
                <p className="text-neutral-500 text-[11px]">
                  The administrator corrects only uncertain values and approves the scholarship. Administrators do not have to manually re-enter the entire record.
                </p>
              </div>
            </section>

            {/* Section 9 & 10 */}
            <section id="sec9" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">10. Section 9 & 10: Duplicate Detection & Change Detection</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The system checks if a record exists using <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">source_external_id</code> or the composite key <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">source_url + scholarship_name + provider</code>.
              </p>
              <p className="text-neutral-600 text-xs">
                A canonical SHA-256 hash of normalized relevant content is compared with the previous record. If unchanged, only <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">last_scraped_at</code> is updated. If changed (e.g. Income Limit increased or Deadline extended), the system re-runs extraction, logs structured field differences, and triggers version creation.
              </p>
            </section>

            {/* Section 11 */}
            <section id="sec11" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">11. Section 11: Version History</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Automatically imported scholarships maintain a full audit trail:
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs space-y-2">
                <div>
                  <span className="font-bold text-neutral-700">Version 1: </span>
                  <span>Income Limit: ₹2,50,000 | Deadline: 30 November</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-700">Version 2: </span>
                  <span>Income Limit: ₹3,00,000 | Deadline: 15 December</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-sans">
                  Stores: Previous value, New value, Change date, Source URL, and Ingestion Run ID.
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section id="sec12" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">12. Section 12: Scholarship Source Configuration</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Official crawling endpoints are managed dynamically with fields: <code className="font-mono text-[11px]">id, name, base_url, listing_url, source_type, enabled, crawl_frequency, parser_name, last_run_at, last_success_at, last_failure_at, failure_count</code>. Administrators can toggle sources on/off at any time.
              </p>
            </section>

            {/* Section 13 */}
            <section id="sec13" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">13. Section 13: Cron Job & Scheduling Specification</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Scheduled background job configured via environment variable (e.g. <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">SCHOLARSHIP_INGESTION_CRON=0 2 * * *</code> for 2:00 AM daily). Crawls enabled sources, stores results, and generates ingestion execution reports.
              </p>
            </section>

            {/* Section 14 */}
            <section id="sec14" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">14. Section 14: Complete Dual Data Flow</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                The application supports both Manual Flow (Admin &rarr; Enter &rarr; Validate &rarr; Preview &rarr; Publish &rarr; PostgreSQL) and Automatic Flow (Website &rarr; Cron &rarr; Crawler &rarr; Parser &rarr; Normalize &rarr; Validate &rarr; Deduplicate &rarr; PostgreSQL &rarr; Optional Admin Review) simultaneously into the same PostgreSQL database.
              </p>
            </section>

            {/* Section 15 */}
            <section id="sec15" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">15. Section 15: Student Recommendation Flow</h3>
              </div>
              <p className="text-neutral-600 text-xs">
                Student searches <strong>never</strong> depend on external websites being online. The recommendation engine queries normalized PostgreSQL records, evaluates rule eligibility (Income, Marks, Course, Year, State, Category), calculates TOPSIS match scores, ranks opportunities, and returns explainable guidance with required documents checklists.
              </p>
            </section>

            {/* Section 16 */}
            <section id="sec16" className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-base font-bold text-neutral-900">16. Section 16: Core Functional Requirement</h3>
              </div>
              <div className="p-4 bg-neutral-50 border-l-4 border-neutral-900 rounded-r-lg text-neutral-800 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>The application must support both manual scholarship management and automated scholarship ingestion. Administrators must be able to manually create and maintain scholarships whenever required. In addition, a scheduled web-ingestion system must periodically retrieve scholarship information from approved official scholarship websites, extract and normalize scholarship details and eligibility conditions, validate the information, detect duplicates and changes, and insert or update PostgreSQL records. Automatically extracted information that cannot be confidently validated must be placed into an administrator review queue. Both manually entered and automatically collected scholarships must use the same database model, eligibility engine, recommendation system, and student-facing workflow.</strong>
                </p>
                <p className="text-neutral-600">
                  Manual entry should therefore act as a fallback and administrative override, while automatic website ingestion should be the main method for keeping larger volumes of scholarship information updated.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
