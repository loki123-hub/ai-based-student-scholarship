import React, { useState } from 'react';
import { ReviewQueueItem, CommonScholarship } from '../types/scholarship';
import { CheckCircle2, AlertTriangle, ExternalLink, Check, Trash2, Edit3, ArrowRight } from 'lucide-react';

interface ReviewQueueProps {
  items: ReviewQueueItem[];
  onApprove: (approvedScholarship: CommonScholarship, reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ items, onApprove, onReject }) => {
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(items[0] || null);

  // Editable fields for the selected item
  const [editedCategories, setEditedCategories] = useState('General, OBC, SC, ST, EWS');
  const [editedConditions, setEditedConditions] = useState('Orphans, COVID-19 Bereaved, Wards of Martyred Armed Forces');
  const [editedDocs, setEditedDocs] = useState('Bonafide Certificate, Death Certificate or Armed Forces Martyr Certificate, Income Affidavit');
  const [editedIncome, setEditedIncome] = useState(800000);
  const [editedMinMarks, setEditedMinMarks] = useState(50);

  const handleSelectItem = (item: ReviewQueueItem) => {
    setSelectedItem(item);
    setEditedCategories(item.draftRecord.eligibility.categories.join(', '));
    setEditedConditions(item.draftRecord.eligibility.specialConditions?.join(', ') || '');
    setEditedDocs(item.draftRecord.documents.join(', '));
    setEditedIncome(item.draftRecord.eligibility.maximumAnnualIncome || 800000);
    setEditedMinMarks(item.draftRecord.eligibility.minimumPercentage);
  };

  const handleApproveCurrent = () => {
    if (!selectedItem) return;

    const approvedRecord: CommonScholarship = {
      ...selectedItem.draftRecord,
      status: 'PUBLISHED',
      eligibility: {
        ...selectedItem.draftRecord.eligibility,
        categories: editedCategories.split(',').map(s => s.trim()).filter(Boolean),
        specialConditions: editedConditions ? [editedConditions] : [],
        maximumAnnualIncome: editedIncome,
        minimumPercentage: editedMinMarks
      },
      documents: editedDocs.split(',').map(s => s.trim()).filter(Boolean),
      metadata: {
        ...selectedItem.draftRecord.metadata,
        lastVerifiedAt: new Date().toISOString(),
        lastChangedAt: new Date().toISOString(),
        version: 1
      },
      updatedAt: new Date().toISOString()
    };

    onApprove(approvedRecord, selectedItem.id);
    const remaining = items.filter(i => i.id !== selectedItem.id);
    setSelectedItem(remaining[0] || null);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center shadow-xs">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-neutral-900">Review Queue is Clear</h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
          All automatically ingested scholarship records have been validated with high confidence and stored in PostgreSQL. New uncertain records will automatically appear here following scheduled crawl runs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Admin Review Queue</span>
            <span aria-hidden="true">·</span>
            <span>Section 8 of PRD</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-700 font-semibold">{items.length} Pending Review</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Admin Review of Automatically Collected Data
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Inspect uncertain or ambiguous fields extracted by web crawlers. Correct missing data and approve records directly into PostgreSQL.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Pending Items */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
            Flagged Ingestions ({items.length})
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono opacity-80">{item.sourceExternalId}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isSelected ? 'bg-amber-400 text-neutral-900' : 'bg-amber-50 text-amber-700'
                    }`}>
                      NEEDS_REVIEW
                    </span>
                  </div>
                  <div className="font-semibold text-xs leading-snug line-clamp-1">{item.draftRecord.title}</div>
                  <div className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {item.sourceName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Workbench */}
        {selectedItem && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-0.5">
                    <span>Source: {selectedItem.sourceName}</span>
                    <span>·</span>
                    <a
                      href={selectedItem.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Official URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{selectedItem.draftRecord.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReject(selectedItem.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={handleApproveCurrent}
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve &amp; Store in PostgreSQL</span>
                  </button>
                </div>
              </div>

              {/* Extraction Confidence Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Extracted Successfully */}
                <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Extracted Successfully (&ge;90% Confidence)</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {selectedItem.extractedSuccessfully.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-emerald-100 last:border-0">
                        <span className="text-neutral-500">{item.field}:</span>
                        <span className="font-semibold text-neutral-900 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uncertain or Missing */}
                <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Uncertain / Missing (Human Review Required)</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {selectedItem.uncertainOrMissing.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white border border-amber-200 rounded text-neutral-800 space-y-0.5">
                        <div className="font-medium text-amber-900 flex items-center justify-between">
                          <span>{item.field}</span>
                          <span className="text-[10px] text-amber-600">Ambiguous Extraction</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-snug">{item.reason}</p>
                        {item.detectedRaw && (
                          <div className="text-[10px] font-mono text-neutral-500 bg-neutral-50 p-1 rounded mt-1">
                            Raw snippet: "{item.detectedRaw}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Administrative Correction Workbench */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-neutral-700" />
                  <h4 className="text-xs font-semibold text-neutral-900">
                    Administrative Correction &amp; Normalization Form
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-800">Corrected Eligible Categories</label>
                    <input
                      type="text"
                      value={editedCategories}
                      onChange={(e) => setEditedCategories(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-800">Annual Income Limit (₹ INR)</label>
                    <input
                      type="number"
                      value={editedIncome}
                      onChange={(e) => setEditedIncome(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-neutral-800">Special Eligibility Conditions</label>
                    <input
                      type="text"
                      value={editedConditions}
                      onChange={(e) => setEditedConditions(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-neutral-800">Canonical Required Documents (comma-separated)</label>
                    <textarea
                      rows={2}
                      value={editedDocs}
                      onChange={(e) => setEditedDocs(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    Upon clicking "Approve", these values are merged with the extracted data, canonical hash is recalculated, and inserted into PostgreSQL table <code className="font-mono text-[10px]">scholarships</code>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
