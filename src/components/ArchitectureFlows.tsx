import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw, Database, Globe, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

export const ArchitectureFlows: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState<'automatic' | 'manual' | 'crawler' | 'student'>('automatic');

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-neutral-200 gap-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Interactive Architecture & Workflow Explorer</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Visual representation of dual-ingestion pipelines and student recommendation engine</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveFlow('automatic')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFlow === 'automatic' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Automatic Ingestion Flow
          </button>
          <button
            onClick={() => setActiveFlow('manual')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFlow === 'manual' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Manual Admin Entry Flow
          </button>
          <button
            onClick={() => setActiveFlow('crawler')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFlow === 'crawler' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Crawler Strategy (Cheerio vs Playwright)
          </button>
          <button
            onClick={() => setActiveFlow('student')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeFlow === 'student' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Student Recommendation Flow
          </button>
        </div>
      </div>

      <div className="pt-6">
        {/* AUTOMATIC FLOW */}
        {activeFlow === 'automatic' && (
          <div>
            <div className="mb-4 text-xs text-neutral-600 flex items-center justify-between">
              <span>Section 2 & 14: End-to-End Scheduled Cron Pipeline</span>
              <span className="font-mono text-neutral-500">Cron: 0 2 * * * (Daily 2:00 AM)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { step: '01', title: 'Cron Trigger', desc: 'Node-cron job fires at 2:00 AM daily', icon: RefreshCw, badge: 'Scheduler' },
                { step: '02', title: 'Load Sources', desc: 'Query enabled sources from DB', icon: Database, badge: 'Registry' },
                { step: '03', title: 'Crawl Listing', desc: 'Cheerio / Playwright adapter fetch', icon: Globe, badge: 'Network' },
                { step: '04', title: 'Parse Details', desc: 'Extract raw text, dates, income & marks', icon: Cpu, badge: 'Adapter' },
                { step: '05', title: 'Normalize', desc: 'Transform to Common Scholarship Format', icon: CheckCircle2, badge: 'Transform' },
                { step: '06', title: 'Validate & Hash', desc: 'Sanity checks & SHA-256 hash calc', icon: ShieldAlert, badge: 'Validator' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-neutral-400 font-semibold">{item.step}</span>
                      <span className="text-[11px] text-neutral-500">{item.badge}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1 text-sm font-semibold text-neutral-900">
                      <item.icon className="w-4 h-4 text-neutral-700" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="text-xs font-semibold text-neutral-800 mb-2">Branching & Persistence Decision Tree</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence (Status: VALID)
                  </div>
                  <p className="text-neutral-600 mb-2">
                    Record passes all mandatory checks. Compared with PostgreSQL by <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">source_external_id</code> or content hash.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                    <li><strong>New Record:</strong> Inserted with version 1</li>
                    <li><strong>Hash Identical:</strong> Touch <code className="font-mono text-[11px]">last_scraped_at</code> (no update required)</li>
                    <li><strong>Hash Changed:</strong> Compute diff, increment version, log to <code className="font-mono text-[11px]">version_history</code></li>
                  </ul>
                </div>

                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Ambiguous / Uncertain (Status: NEEDS_REVIEW)
                  </div>
                  <p className="text-neutral-600 mb-2">
                    Income ceiling, eligible categories, or required documents could not be parsed with &gt;90% confidence.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-600">
                    <li>Record diverted into <strong>Admin Review Queue</strong></li>
                    <li>Admin inspects side-by-side: Extracted Successfully ✓ vs Uncertain ⚠</li>
                    <li>Admin applies inline corrections and one-click publishes to PostgreSQL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANUAL ADMIN FLOW */}
        {activeFlow === 'manual' && (
          <div>
            <div className="mb-4 text-xs text-neutral-600">
              Section 1 & 14: Administrative Authoring & Governance Flow
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { step: '01', title: 'Admin Login', desc: 'Authorized education officer enters portal', icon: UserCheck },
                { step: '02', title: 'Form Entry', desc: 'Enter 21+ fields (Income, marks, courses, docs, dates)', icon: Cpu },
                { step: '03', title: 'Live Validation', desc: 'Real-time schema, URL, and date range checks', icon: ShieldAlert },
                { step: '04', title: 'Interactive Preview', desc: 'Inspect exact student card presentation', icon: CheckCircle2 },
                { step: '05', title: 'PostgreSQL Commit', desc: 'Saved with data_source_type: "manual"', icon: Database }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="font-mono text-xs text-neutral-400 font-semibold mb-2">{item.step}</div>
                  <div className="flex items-center gap-1.5 mb-1 text-sm font-semibold text-neutral-900">
                    <item.icon className="w-4 h-4 text-neutral-700" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-700">
              <span className="font-semibold text-neutral-900">Key Guarantee: </span>
              Manual entry remains perpetually active even after full crawler automation. It acts as an emergency administrative override, enables adding exclusive private trusts, and allows correction of official portal mistakes.
            </div>
          </div>
        )}

        {/* CRAWLER STRATEGY */}
        {activeFlow === 'crawler' && (
          <div>
            <div className="mb-4 text-xs text-neutral-600">
              Section 3 & 4: Dual-Engine Crawling Strategy Matrix
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900">Engine A: Static HTML (Cheerio)</h4>
                  <span className="text-xs text-neutral-500 font-mono">Fast / Lightweight</span>
                </div>
                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  Used for server-rendered HTML pages, static government notice boards, and tabular bulletin sites.
                </p>
                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Workflow:</strong> HTTP GET &rarr; Raw HTML &rarr; Cheerio DOM Parser &rarr; CSS Selectors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Active Portals:</strong> National Scholarship Portal (NSP), Tamil Nadu Welfare Portal, UGC Schemes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Latency:</strong> ~150ms – 400ms per listing page</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900">Engine B: Dynamic Browser (Playwright Headless)</h4>
                  <span className="text-xs text-neutral-500 font-mono">Full DOM / SPA</span>
                </div>
                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  Used for modern single-page applications (SPAs) rendering data via client-side JavaScript or interactive accordion tabs.
                </p>
                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Workflow:</strong> Headless Chromium &rarr; Evaluate JS &rarr; Await Selectors &rarr; Rendered HTML Extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Active Portals:</strong> AICTE Students Development Schemes Portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span><strong>Politeness:</strong> Respects robots.txt, 2-second per-domain throttle, exponential backoff</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT FLOW */}
        {activeFlow === 'student' && (
          <div>
            <div className="mb-4 text-xs text-neutral-600">
              Section 15: Student Recommendation Flow (Zero Live Scraping)
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">1. Student Profile</div>
                  <p className="text-neutral-600 text-xs">
                    Input: Course (e.g. B.Tech IT), Year (2nd), Marks (82%), Family Income (₹1.8L), Category (OBC), State (Tamil Nadu).
                  </p>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">2. Local PostgreSQL Query</div>
                  <p className="text-neutral-600 text-xs">
                    Executed strictly on internal PostgreSQL database. No network calls to government websites.
                  </p>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">3. Deterministic + TOPSIS</div>
                  <p className="text-neutral-600 text-xs">
                    Filters eligibility rules. Multi-criteria ranks by benefit, proximity of deadline, and academic margin.
                  </p>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-md">
                  <div className="font-semibold text-neutral-900 text-xs mb-1">4. Explainable Output</div>
                  <p className="text-neutral-600 text-xs">
                    Transparent reasons for match, document preparation checklist, and direct verified application URL.
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50/60 border border-blue-200 rounded-md text-xs text-blue-900">
                <strong>Architectural Invariant Verified:</strong> If an official scholarship portal experiences downtime or network firewalls, students can still search, discover, and prepare applications uninterrupted because recommendations query normalized local PostgreSQL data.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
