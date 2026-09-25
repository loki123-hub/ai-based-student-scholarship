/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_SCHOLARSHIPS,
  INITIAL_SOURCES,
  INITIAL_ADAPTER_SPECS,
  INITIAL_VERSION_HISTORY,
  INITIAL_REVIEW_QUEUE
} from './data/initialScholarships';
import {
  CommonScholarship,
  ScholarshipSourceConfig,
  VersionHistoryItem,
  ReviewQueueItem
} from './types/scholarship';
import { ManualEntryForm } from './components/ManualEntryForm';
import { IngestionConsole } from './components/IngestionConsole';
import { ReviewQueue } from './components/ReviewQueue';
import { PostgresRepository } from './components/PostgresRepository';
import { StudentGuidanceMatch } from './components/StudentGuidanceMatch';
import {
  Edit,
  Globe,
  Inbox,
  Database,
  UserCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Compass
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'recommendations' | 'database' | 'manual' | 'ingestion' | 'review'
  >('recommendations');

  // Shared Central State
  const [scholarships, setScholarships] = useState<CommonScholarship[]>(INITIAL_SCHOLARSHIPS);
  const [sources, setSources] = useState<ScholarshipSourceConfig[]>(INITIAL_SOURCES);
  const [versionHistory, setVersionHistory] = useState<VersionHistoryItem[]>(INITIAL_VERSION_HISTORY);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(INITIAL_REVIEW_QUEUE);
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking'>('checking');

  // Fetch from PostgreSQL backend on mount
  useEffect(() => {
    async function loadFromBackend() {
      try {
        const [schRes, srcRes, verRes] = await Promise.all([
          fetch('/api/scholarships').catch(() => null),
          fetch('/api/ingestion/sources').catch(() => null),
          fetch('/api/version-history').catch(() => null)
        ]);

        if (schRes && schRes.ok) {
          const schData = await schRes.json();
          if (Array.isArray(schData) && schData.length > 0) {
            setScholarships(schData);
          }
          setDbStatus('connected');
        }

        if (srcRes && srcRes.ok) {
          const srcData = await srcRes.json();
          if (Array.isArray(srcData) && srcData.length > 0) {
            setSources(srcData);
          }
        }

        if (verRes && verRes.ok) {
          const verData = await verRes.json();
          if (Array.isArray(verData) && verData.length > 0) {
            setVersionHistory(verData);
          }
        }
      } catch (err) {
        console.warn('Backend initial load:', err);
      }
    }
    loadFromBackend();
  }, []);

  // Manual save handler - syncs to PostgreSQL backend
  const handleSaveManualScholarship = async (newSch: CommonScholarship, isDraft: boolean) => {
    setScholarships((prev) => [newSch, ...prev]);

    try {
      await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSch,
          minimumPercentage: newSch.eligibility.minimumPercentage,
          maximumAnnualIncome: newSch.eligibility.maximumAnnualIncome,
          courses: newSch.eligibility.courses,
          educationLevel: newSch.eligibility.educationLevel,
          studyYears: newSch.eligibility.studyYears,
          states: newSch.eligibility.states,
          categories: newSch.eligibility.categories,
          gender: newSch.eligibility.gender,
          specialConditions: newSch.eligibility.specialConditions,
          dataSourceType: 'manual',
          sourceName: newSch.metadata.sourceName,
          sourceExternalId: newSch.metadata.sourceExternalId,
          contentHash: newSch.metadata.contentHash,
          version: newSch.metadata.version
        })
      });
    } catch (err) {
      console.error('Error persisting manual entry to backend:', err);
    }

    if (!isDraft) {
      const v1: VersionHistoryItem = {
        id: `ver_man_${Date.now()}`,
        scholarshipId: newSch.id,
        scholarshipTitle: newSch.title,
        versionNumber: 1,
        fieldName: 'initial_creation',
        previousValue: 'None',
        newValue: 'Manual administrative publishing',
        changeReason: 'Admin verified official gazette notification and created record',
        sourceUrl: newSch.sourceUrl,
        ingestionRunId: 'manual_admin_entry',
        changedAt: new Date().toISOString(),
        changedBy: 'Admin (nlokesh9696@gmail.com)'
      };
      setVersionHistory((prev) => [v1, ...prev]);
    }
  };

  // Source toggle - syncs to PostgreSQL backend
  const handleToggleSource = async (id: string) => {
    const target = sources.find((s) => s.id === id);
    if (!target) return;
    const newEnabled = !target.enabled;

    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s))
    );

    try {
      await fetch(`/api/ingestion/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled })
      });
    } catch (err) {
      console.error('Error toggling source on backend:', err);
    }
  };

  // Review Queue approval handler
  const handleApproveReviewItem = async (approved: CommonScholarship, reviewId: string) => {
    setScholarships((prev) => [approved, ...prev]);
    setReviewQueue((prev) => prev.filter((r) => r.id !== reviewId));

    try {
      await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...approved,
          minimumPercentage: approved.eligibility.minimumPercentage,
          maximumAnnualIncome: approved.eligibility.maximumAnnualIncome,
          courses: approved.eligibility.courses,
          educationLevel: approved.eligibility.educationLevel,
          studyYears: approved.eligibility.studyYears,
          states: approved.eligibility.states,
          categories: approved.eligibility.categories,
          gender: approved.eligibility.gender,
          specialConditions: approved.eligibility.specialConditions,
          dataSourceType: approved.metadata.dataSourceType,
          sourceName: approved.metadata.sourceName,
          sourceExternalId: approved.metadata.sourceExternalId,
          contentHash: approved.metadata.contentHash,
          version: approved.metadata.version
        })
      });
    } catch (err) {
      console.error('Error persisting approved record to backend:', err);
    }

    const vItem: VersionHistoryItem = {
      id: `ver_rev_${Date.now()}`,
      scholarshipId: approved.id,
      scholarshipTitle: approved.title,
      versionNumber: 1,
      fieldName: 'admin_approved',
      previousValue: 'Status: NEEDS_REVIEW',
      newValue: 'Status: PUBLISHED',
      changeReason: 'Admin verified uncertain extracted fields and approved to PostgreSQL',
      sourceUrl: approved.sourceUrl,
      ingestionRunId: approved.metadata.sourceExternalId || 'admin_review',
      changedAt: new Date().toISOString(),
      changedBy: 'Admin (nlokesh9696@gmail.com)'
    };
    setVersionHistory((prev) => [vItem, ...prev]);
  };

  // Review Queue rejection handler
  const handleRejectReviewItem = (reviewId: string) => {
    setReviewQueue((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Archive scholarship
  const handleArchiveScholarship = (id: string) => {
    setScholarships((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'ARCHIVED' } : s))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans">
      {/* Top Bar: Brand Zone — Nav Links — Actions */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Name */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-neutral-900">
              AI_Based_Student_Scholarship_and_Career_Guidance
            </span>
          </div>

          {/* Navigation Links (Without PRD Specification) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-neutral-600">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'recommendations'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Student Guidance &amp; Matching</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'database'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Repository</span>
              <span className="font-mono text-[10px] text-neutral-400">
                ({scholarships.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>

            <button
              onClick={() => setActiveTab('ingestion')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'ingestion'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Automatic Crawlers</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Review Queue</span>
              {reviewQueue.length > 0 && (
                <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                  {reviewQueue.length}
                </span>
              )}
            </button>
          </nav>

          {/* Database & Primary Action */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 font-mono bg-neutral-100 px-2 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PostgreSQL Active</span>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'recommendations' ? 'manual' : 'recommendations')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
            >
              {activeTab === 'recommendations' ? '+ Add Scholarship' : 'Student Guidance'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-neutral-200 gap-1 text-xs font-medium bg-neutral-50/70">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'recommendations' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Student Guidance
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'database' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            PostgreSQL ({scholarships.length})
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'manual' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'ingestion' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Crawlers
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'review' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
            }`}
          >
            Review ({reviewQueue.length})
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'recommendations' && <StudentGuidanceMatch />}

        {activeTab === 'database' && (
          <PostgresRepository
            scholarships={scholarships}
            versionHistory={versionHistory}
            onArchiveScholarship={handleArchiveScholarship}
          />
        )}

        {activeTab === 'manual' && (
          <ManualEntryForm onSaveScholarship={handleSaveManualScholarship} />
        )}

        {activeTab === 'ingestion' && (
          <IngestionConsole
            sources={sources}
            onToggleSource={handleToggleSource}
            adapters={INITIAL_ADAPTER_SPECS}
            scholarships={scholarships}
            onUpdateScholarships={setScholarships}
            onAddVersionHistory={(items) => setVersionHistory((prev) => [...items, ...prev])}
            onAddReviewItem={(item) => setReviewQueue((prev) => [item, ...prev])}
          />
        )}

        {activeTab === 'review' && (
          <ReviewQueue
            items={reviewQueue}
            onApprove={handleApproveReviewItem}
            onReject={handleRejectReviewItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">
              Department of Information Technology
            </span>
            <span>·</span>
            <span>Panimalar Engineering College, Chennai</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
            <span>AI_Based_Student_Scholarship_and_Career_Guidance</span>
            <span>·</span>
            <span>Cloud SQL PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
