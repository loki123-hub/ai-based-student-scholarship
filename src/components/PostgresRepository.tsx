import React, { useState } from 'react';
import { CommonScholarship, VersionHistoryItem } from '../types/scholarship';
import { Database, Search, Filter, History, Code2, ExternalLink, Calendar, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface PostgresRepositoryProps {
  scholarships: CommonScholarship[];
  versionHistory: VersionHistoryItem[];
  onArchiveScholarship: (id: string) => void;
}

export const PostgresRepository: React.FC<PostgresRepositoryProps> = ({
  scholarships,
  versionHistory,
  onArchiveScholarship
}) => {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'manual' | 'automatic_web'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [selectedScholarship, setSelectedScholarship] = useState<CommonScholarship | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'json' | 'history'>('details');

  const filteredScholarships = scholarships.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase()) ||
      s.metadata.sourceName.toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter === 'all' || s.metadata.dataSourceType === sourceFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const selectedHistory = selectedScholarship
    ? versionHistory.filter((v) => v.scholarshipId === selectedScholarship.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>PostgreSQL Database</span>
            <span aria-hidden="true">·</span>
            <span>Sections 5, 6, 9, 10 &amp; 11 of PRD</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-neutral-700">{scholarships.length} Central Records</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Central PostgreSQL Scholarship Repository
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Unified database table housing both manually curated and automatically crawled scholarships under the identical Common Scholarship Schema.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-700 font-mono">
            Table: <strong>scholarships</strong>
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-700 font-mono">
            Table: <strong>scholarship_version_history</strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, provider, or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:outline-hidden focus:border-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sourceFilter === 'all' ? 'bg-white text-neutral-900 font-medium shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Origins
            </button>
            <button
              onClick={() => setSourceFilter('manual')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sourceFilter === 'manual' ? 'bg-white text-neutral-900 font-medium shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Manual Admin Entry
            </button>
            <button
              onClick={() => setSourceFilter('automatic_web')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                sourceFilter === 'automatic_web' ? 'bg-white text-neutral-900 font-medium shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Automatic Web Ingestion
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md text-neutral-700 text-xs focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-medium">
              <tr>
                <th className="py-3 px-4">Scholarship Title &amp; Provider</th>
                <th className="py-3 px-3">Data Origin</th>
                <th className="py-3 px-3">Closing Date</th>
                <th className="py-3 px-3">Eligibility Cutoffs</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {filteredScholarships.map((sch) => {
                const isManual = sch.metadata.dataSourceType === 'manual';
                return (
                  <tr key={sch.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-neutral-900 line-clamp-1">{sch.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{sch.provider}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800">
                          {isManual ? 'Manual Admin' : 'Auto Web Crawler'}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {sch.metadata.sourceName.split('(')[0].trim()}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] tabular-nums">
                      {sch.deadline}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-[11px] space-y-0.5">
                        <div className="tabular-nums">
                          <span className="text-neutral-400">Income: </span>
                          <span className="font-mono font-medium">
                            {sch.eligibility.maximumAnnualIncome
                              ? `≤ ₹${sch.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`
                              : 'No cap'}
                          </span>
                        </div>
                        <div className="tabular-nums">
                          <span className="text-neutral-400">Marks: </span>
                          <span className="font-mono font-medium">≥ {sch.eligibility.minimumPercentage}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-neutral-100 rounded text-neutral-700">
                        v{sch.metadata.version}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`text-[11px] font-medium ${
                        sch.status === 'PUBLISHED' ? 'text-emerald-700' : 'text-neutral-500'
                      }`}>
                        {sch.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedScholarship(sch);
                          setModalTab('details');
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                      >
                        Inspect Record
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Modal / Drawer */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-0.5">
                  <span className="font-mono">ID: {selectedScholarship.id}</span>
                  <span>·</span>
                  <span>Origin: {selectedScholarship.metadata.dataSourceType}</span>
                  <span>·</span>
                  <span>Version {selectedScholarship.metadata.version}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 leading-snug">{selectedScholarship.title}</h3>
              </div>

              <button
                onClick={() => setSelectedScholarship(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-3 border-b border-neutral-200 flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setModalTab('details')}
                className={`pb-2 border-b-2 transition-colors ${
                  modalTab === 'details' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Structured Fields &amp; Rules
              </button>
              <button
                onClick={() => setModalTab('json')}
                className={`pb-2 border-b-2 transition-colors ${
                  modalTab === 'json' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Normalized PostgreSQL JSON
              </button>
              <button
                onClick={() => setModalTab('history')}
                className={`pb-2 border-b-2 transition-colors ${
                  modalTab === 'history' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Version History Log ({selectedHistory.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {modalTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-neutral-500">Provider:</span>
                      <p className="font-semibold text-neutral-900 mt-0.5">{selectedScholarship.provider}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Application Deadline:</span>
                      <p className="font-semibold font-mono text-neutral-900 mt-0.5">{selectedScholarship.deadline}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Benefits / Financial Aid:</span>
                      <p className="font-semibold text-neutral-900 mt-0.5">{selectedScholarship.benefits}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Income Limit:</span>
                      <p className="font-semibold font-mono text-neutral-900 mt-0.5">
                        {selectedScholarship.eligibility.maximumAnnualIncome
                          ? `₹${selectedScholarship.eligibility.maximumAnnualIncome.toLocaleString('en-IN')}`
                          : 'No income ceiling'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500">Description:</span>
                    <p className="text-neutral-700 mt-1 leading-relaxed">{selectedScholarship.description}</p>
                  </div>

                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                    <span className="font-semibold text-neutral-800">Eligibility Breakdown:</span>
                    <div className="grid grid-cols-2 gap-2 text-neutral-700">
                      <div>Courses: {selectedScholarship.eligibility.courses.join(', ')}</div>
                      <div>Years: {selectedScholarship.eligibility.studyYears.join(', ')}</div>
                      <div>States: {selectedScholarship.eligibility.states.join(', ')}</div>
                      <div>Categories: {selectedScholarship.eligibility.categories.join(', ') || 'All'}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 font-medium">Required Documents Checklist:</span>
                    <ul className="list-disc pl-5 mt-1 text-neutral-700 space-y-0.5">
                      {selectedScholarship.documents.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-neutral-900 text-neutral-200 rounded-lg font-mono text-[11px] space-y-1">
                    <div className="text-neutral-400">Content Hash (SHA-256):</div>
                    <div className="text-emerald-400 break-all">{selectedScholarship.metadata.contentHash}</div>
                  </div>
                </div>
              )}

              {modalTab === 'json' && (
                <div className="p-3 bg-neutral-950 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(selectedScholarship, null, 2)}</pre>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="space-y-3">
                  {selectedHistory.length === 0 ? (
                    <p className="text-neutral-500 text-center py-6">
                      No version changes recorded yet. This is initial version 1.
                    </p>
                  ) : (
                    selectedHistory.map((item) => (
                      <div key={item.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-neutral-800">Version {item.versionNumber} Revision</span>
                          <span className="font-mono text-neutral-500">{new Date(item.changedAt).toLocaleString()}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-neutral-700">Field: </span>
                          <code className="font-mono bg-neutral-200 px-1 rounded">{item.fieldName}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-900">
                            <span className="font-medium text-[10px] uppercase text-rose-700 block">Previous Value</span>
                            <span className="font-mono text-[11px]">{item.previousValue}</span>
                          </div>
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                            <span className="font-medium text-[10px] uppercase text-emerald-700 block">New Value</span>
                            <span className="font-mono text-[11px]">{item.newValue}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          <strong>Reason: </strong> {item.changeReason}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Run ID: {item.ingestionRunId} · By: {item.changedBy}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 flex justify-end gap-2 bg-neutral-50/50">
              <button
                onClick={() => setSelectedScholarship(null)}
                className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
