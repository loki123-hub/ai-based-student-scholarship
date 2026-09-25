import React, { useState } from 'react';
import {
  ScholarshipSourceConfig,
  SourceAdapterSpec,
  CommonScholarship,
  IngestionRunReport,
  ReviewQueueItem,
  VersionHistoryItem
} from '../types/scholarship';
import { generateCanonicalContentHash, detectChangesAndDiff } from '../services/ingestionEngine';
import {
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Code2,
  Calendar,
  Layers,
  Database,
  ArrowRight,
  Terminal,
  Activity,
  Sliders,
  Check,
  X
} from 'lucide-react';

interface IngestionConsoleProps {
  sources: ScholarshipSourceConfig[];
  onToggleSource: (id: string) => void;
  adapters: SourceAdapterSpec[];
  scholarships: CommonScholarship[];
  onUpdateScholarships: (updatedList: CommonScholarship[]) => void;
  onAddVersionHistory: (items: VersionHistoryItem[]) => void;
  onAddReviewItem: (item: ReviewQueueItem) => void;
}

export const IngestionConsole: React.FC<IngestionConsoleProps> = ({
  sources,
  onToggleSource,
  adapters,
  scholarships,
  onUpdateScholarships,
  onAddVersionHistory,
  onAddReviewItem
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'sources' | 'adapters'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Background Ingestion Worker daemon initialized.',
    '[CRON] Registered schedule: SCHOLARSHIP_INGESTION_CRON="0 2 * * *" (Every Day at 2:00 AM IST).',
    '[READY] 4 approved official portal sources loaded into crawler memory.'
  ]);

  const [lastReport, setLastReport] = useState<IngestionRunReport | null>({
    runId: 'ing_run_20260924_0200',
    startedAt: '2026-09-24T02:00:00Z',
    completedAt: '2026-09-24T02:14:02Z',
    sourcesChecked: 4,
    scholarshipsFound: 16,
    newScholarships: 2,
    updatedScholarships: 2,
    unchanged: 10,
    needsReview: 1,
    failed: 1,
    logs: []
  });

  const pipelineSteps = [
    { title: 'Cron Trigger', desc: 'Cron daemon trigger fires at 2:00 AM' },
    { title: 'Load Sources', desc: 'Load active sources from PostgreSQL registry' },
    { title: 'Visit Website', desc: 'Execute HTTP GET / Headless browser session' },
    { title: 'Discover Pages', desc: 'Extract links from scheme guidelines index' },
    { title: 'Open Detail Pages', desc: 'Traverse and download individual scheme markup' },
    { title: 'Extract Raw Info', desc: 'Apply source adapter CSS selectors & regex' },
    { title: 'Parse Eligibility', desc: 'Extract marks cutoffs, income limits, courses' },
    { title: 'Normalize Format', desc: 'Transform to Common Application Format JSON' },
    { title: 'Validate Extracted', desc: 'Sanity validation (Title, dates, income)' },
    { title: 'Duplicate & Hash', desc: 'Canonical SHA-256 hash & external ID check' },
    { title: 'Branch Decision', desc: 'Insert New / Version Diff / Admin Review' },
    { title: 'Store PostgreSQL', desc: 'Commit transaction to scholarships table' }
  ];

  const handleRunIngestion = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    const runId = `ing_run_${Date.now()}`;
    const newLogs: string[] = [
      `[${new Date().toLocaleTimeString()}] >>> STARTING SCHEDULED INGESTION RUN [${runId}] <<<`,
      `[${new Date().toLocaleTimeString()}] Querying active scholarship sources from PostgreSQL...`
    ];
    setLogs([...newLogs]);

    const enabledSources = sources.filter(s => s.enabled);

    for (let i = 0; i < pipelineSteps.length; i++) {
      setCurrentStepIndex(i);
      // Wait a moment for visual feedback
      await new Promise(res => setTimeout(res, 350));

      const step = pipelineSteps[i];
      const logEntry = `[${new Date().toLocaleTimeString()}] [Step ${i + 1}/12: ${step.title}] ${step.desc}`;
      newLogs.push(logEntry);
      setLogs([...newLogs]);
    }

    // Simulate results:
    // Update NSP scholarship with slightly updated deadline and increment version
    let updatedCount = 0;
    const currentList = [...scholarships];
    const nspRecord = currentList.find(s => s.id === 'sch_nsp_msje_sc_2026');
    if (nspRecord) {
      const diffResult = detectChangesAndDiff(
        nspRecord,
        {
          deadline: '2026-12-31',
          eligibility: {
            ...nspRecord.eligibility,
            maximumAnnualIncome: 300000
          }
        },
        runId
      );

      if (diffResult.hasChanged) {
        updatedCount = 1;
        const newVersionItems: VersionHistoryItem[] = diffResult.diffItems.map((item, idx) => ({
          ...item,
          id: `ver_auto_${Date.now()}_${idx}`
        }));
        onAddVersionHistory(newVersionItems);

        // Update record in list
        const updatedNsp: CommonScholarship = {
          ...nspRecord,
          deadline: '2026-12-31',
          eligibility: {
            ...nspRecord.eligibility,
            maximumAnnualIncome: 300000
          },
          metadata: {
            ...nspRecord.metadata,
            version: nspRecord.metadata.version + 1,
            lastScrapedAt: new Date().toISOString(),
            lastChangedAt: new Date().toISOString(),
            contentHash: generateCanonicalContentHash({
              title: nspRecord.title,
              provider: nspRecord.provider,
              benefits: nspRecord.benefits,
              deadline: '2026-12-31',
              minimumPercentage: nspRecord.eligibility.minimumPercentage,
              maximumAnnualIncome: 300000,
              courses: nspRecord.eligibility.courses,
              states: nspRecord.eligibility.states,
              categories: nspRecord.eligibility.categories,
              documents: nspRecord.documents
            })
          },
          updatedAt: new Date().toISOString()
        };

        const idx = currentList.findIndex(s => s.id === nspRecord.id);
        currentList[idx] = updatedNsp;
        onUpdateScholarships(currentList);
        newLogs.push(`[DIFF ENGINE] Detected content change on NSP-MSJE-2026-SC: Income Limit revised, deadline extended. Incremented to Version ${updatedNsp.metadata.version}.`);
      }
    }

    newLogs.push(`[COMPLETED] Ingestion run completed successfully. 4 sources checked. ${scholarships.length} scholarships stored in PostgreSQL.`);
    setLogs([...newLogs]);

    setLastReport({
      runId,
      startedAt: new Date(Date.now() - 4000).toISOString(),
      completedAt: new Date().toISOString(),
      sourcesChecked: enabledSources.length,
      scholarshipsFound: 16,
      newScholarships: 1,
      updatedScholarships: updatedCount || 1,
      unchanged: 12,
      needsReview: 1,
      failed: 1,
      logs: newLogs
    });

    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Method 2</span>
            <span aria-hidden="true">·</span>
            <span>Sections 2, 3, 4, 9, 10, 12 &amp; 13</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-neutral-700">data_source_type: 'automatic_web'</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Automated Web Ingestion &amp; Crawling Engine
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Scheduled background pipeline periodically scraping official portals, validating records, and keeping PostgreSQL up to date.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 bg-neutral-100 rounded-lg flex items-center text-xs font-medium">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'console' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Crawl Pipeline &amp; Monitoring
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'sources' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Configured Sources ({sources.length})
            </button>
            <button
              onClick={() => setActiveTab('adapters')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'adapters' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Source Adapters ({adapters.length})
            </button>
          </div>

          <button
            onClick={handleRunIngestion}
            disabled={isRunning}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors ${
              isRunning ? 'bg-neutral-400 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            {isRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Ingestion In Progress...' : 'Run Ingestion Now'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONSOLE & MONITORING */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          {/* Section 8: Ingestion Monitoring Summary Stats */}
          {lastReport && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neutral-700" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Automatic Scholarship Ingestion Monitoring (Section 8)
                  </h3>
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  Last Run ID: {lastReport.runId} · {new Date(lastReport.completedAt).toLocaleTimeString()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-neutral-500 text-[11px]">Sources Checked</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
                    {lastReport.sourcesChecked}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-neutral-500 text-[11px]">Scholarships Found</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
                    {lastReport.scholarshipsFound}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                  <div className="text-emerald-700 text-[11px]">New Scholarships</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-emerald-800 mt-1">
                    +{lastReport.newScholarships}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <div className="text-blue-700 text-[11px]">Updated Scholarships</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-blue-800 mt-1">
                    {lastReport.updatedScholarships}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="text-neutral-500 text-[11px]">Unchanged (Hash Match)</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-neutral-800 mt-1">
                    {lastReport.unchanged}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                  <div className="text-amber-700 text-[11px]">Needs Review</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-amber-800 mt-1">
                    {lastReport.needsReview}
                  </div>
                </div>

                <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                  <div className="text-rose-700 text-[11px]">Failed Crawls</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-rose-800 mt-1">
                    {lastReport.failed}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 12-Step Ingestion Pipeline Visualizer */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  12-Stage Automatic Ingestion Sequence (Section 2 &amp; 14)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                {isRunning ? `Executing Step ${currentStepIndex + 1} of 12` : 'Worker Standing By'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {pipelineSteps.map((step, idx) => {
                const isCurrent = isRunning && currentStepIndex === idx;
                const isPast = !isRunning || currentStepIndex > idx;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : isPast
                        ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                      {isPast && !isCurrent && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isCurrent && <RotateCw className="w-3 h-3 animate-spin text-white" />}
                    </div>
                    <div className="font-semibold text-xs truncate">{step.title}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-2 ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Ingestion Worker Logs Terminal */}
          <div className="bg-neutral-950 text-neutral-200 rounded-xl p-4 font-mono text-xs shadow-xs space-y-2 border border-neutral-800">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                <span>Ingestion Worker Daemon Console Logs</span>
              </div>
              <span>Process: worker_ingest_pid_8102</span>
            </div>
            <div className="h-44 overflow-y-auto space-y-1 text-[11px] pr-2">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-neutral-500 select-none mr-2">&gt;</span>
                  <span
                    className={
                      log.includes('DIFF')
                        ? 'text-amber-400 font-medium'
                        : log.includes('STARTING') || log.includes('COMPLETED')
                        ? 'text-emerald-400 font-semibold'
                        : log.includes('CRON')
                        ? 'text-blue-400'
                        : 'text-neutral-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURED SOURCES */}
      {activeTab === 'sources' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Scholarship Source Configuration Registry (Section 12)</h3>
              <p className="text-xs text-neutral-500">
                PostgreSQL table <code className="font-mono text-[11px]">scholarship_sources</code> &mdash; Manage approved websites, crawling frequencies, and engine selection.
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
            {sources.map((src) => (
              <div key={src.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-neutral-50/50">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-neutral-900">{src.name}</span>
                    <span className="text-[11px] font-mono text-neutral-500">[{src.id}]</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono">
                      {src.engineType === 'cheerio' ? 'Cheerio (Static HTML)' : 'Playwright (Headless Browser)'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                      Cron: {src.crawlFrequency}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500 space-y-0.5">
                    <div>
                      Listing URL: <a href={src.listingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-[11px]">{src.listingUrl}</a>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>Parser Adapter: <strong className="text-neutral-700">{src.parserName}</strong></span>
                      <span>·</span>
                      <span>Last Success: {src.lastSuccessAt ? new Date(src.lastSuccessAt).toLocaleString() : 'Never'}</span>
                      <span>·</span>
                      <span>Failures: {src.failureCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleSource(src.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      src.enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {src.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOURCE ADAPTERS */}
      {activeTab === 'adapters' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Source-Specific Adapters Directory (Section 4)</h3>
              <p className="text-xs text-neutral-500">
                Directory: <code className="font-mono text-[11px]">scholarship-ingestion/sources/</code> &mdash; Dedicated adapters converting portal-specific markup into Common Scholarship Format.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adapters.map((adapter) => (
              <div key={adapter.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-neutral-700" />
                    <span className="font-mono text-xs font-bold text-neutral-900">{adapter.fileName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">{adapter.renderingMethod}</span>
                </div>

                <div className="text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800">Target Portal: </span>
                  {adapter.sourceName}
                </div>

                <div className="p-2.5 bg-white border border-neutral-200 rounded text-xs space-y-1">
                  <div className="font-medium text-neutral-700 text-[11px]">Link Discovery Strategy:</div>
                  <div className="text-neutral-600 text-[11px]">{adapter.discoveryStrategy}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-neutral-700">Configured CSS Selectors:</div>
                  <div className="p-2 bg-neutral-900 text-neutral-300 rounded font-mono text-[10px] space-y-0.5 overflow-x-auto">
                    <div>listingContainer: "{adapter.selectors.listingContainer}"</div>
                    <div>title: "{adapter.selectors.title}"</div>
                    <div>provider: "{adapter.selectors.provider}"</div>
                    <div>deadline: "{adapter.selectors.deadline}"</div>
                    <div>incomeLimit: "{adapter.selectors.incomeLimit}"</div>
                    <div>minMarks: "{adapter.selectors.minMarks}"</div>
                    <div>applyLink: "{adapter.selectors.applyLink}"</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
