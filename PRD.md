# Product Requirements Document (PRD)
## Multi-Source Scholarship Data Management & Ingestion Platform
### Academic Project: AI-Based Student Scholarship and Career Guidance System
**Institutes/Authors**: Department of Information Technology, Panimalar Engineering College, Chennai, India  
**Document Version**: 2.4.0  
**Status**: APPROVED & ACTIVE SPECIFICATION  
**Last Updated**: 2026-09-24  

---

## 1. Executive Summary & Objective

The **Student Scholarship and Career Guidance Platform** aims to democratize access to financial aid and provide transparent, explainable career planning for higher education students. Students frequently miss life-changing scholarships due to fragmented information across government portals, private trusts, and state-level websites, along with confusing eligibility rules and missed deadlines.

To ensure the scholarship database remains continuously accurate, comprehensive, and up-to-date without imposing unsustainable manual labor, the application implements **two coordinated methods for adding and maintaining scholarship data**:

1. **Manual Scholarship Entry (Admin Module)**: An administrative authoring environment enabling authorized officers to manually create, edit, verify, preview, validate, publish, archive, and override scholarship records.
2. **Automatic Scholarship Collection (Web Ingestion Engine)**: An automated, scheduled background pipeline that periodically visits approved official scholarship portals, discovers scholarship listings, extracts raw information via source-specific adapters, normalizes the data into a common PostgreSQL structure, detects duplicates and changes, and routes uncertain records to an Admin Review Queue.

**Critical Non-Functional Invariant**: Student search and recommendation requests **must never trigger live website scraping**. All student-facing recommendations operate strictly on normalized, pre-validated scholarship records stored in the local PostgreSQL database.

---

## 2. System Architecture & Dual-Flow Overview

```
                      +---------------------------------------+
                      |         SCHOLARSHIP SOURCES           |
                      |  - National Scholarship Portal (NSP)  |
                      |  - AICTE Portal                       |
                      |  - UGC Schemes                        |
                      |  - Tamil Nadu State Portal            |
                      |  - Approved Private / Trust Sites     |
                      +---------------------------------------+
                                          |
                                          | [Scheduled Cron / 0 2 * * *]
                                          v
+------------------------+    +---------------------------------------+
|  METHOD 1: ADMIN FLOW  |    |     METHOD 2: AUTOMATIC INGESTION     |
+------------------------+    +---------------------------------------+
| Authorized Admin       |    | 1. Cron Job Trigger                   |
|   |                    |    | 2. Load Enabled Source Configs        |
|   v                    |    | 3. Source Adapters (Cheerio/Playwright|
| Form Entry (21+ Fields)|    | 4. Listing Discovery & Page Fetch     |
|   |                    |    | 5. Raw Field Extraction & Parsing     |
|   v                    |    | 6. Common Normalization Layer         |
| Client/Server Validate |    | 7. Schema & Integrity Validation      |
|   |                    |    | 8. Canonical Hash & Diff Engine       |
|   v                    |    +---------------------------------------+
| Interactive Preview    |                        |
|   |                    |        +---------------+---------------+
|   v                    |        |                               |
| Direct Publish/Archive |        | High Confidence (VALID)       | Uncertain (NEEDS_REVIEW)
+-----------+------------+        v                               v
            |             +------------------+             +------------------+
            |             | PostgreSQL Store |             | Admin Review     |
            |             | (Active Records) |<------------| Queue & Inspector|
            |             +------------------+  Approved   +------------------+
            |                      ^
            +----------------------+
                                   |
                  +----------------+----------------+
                  |                                 |
                  v                                 v
      +------------------------+        +------------------------+
      | Recommendation Engine  |        | Audit & Version History|
      | - Deterministic Filter |        | - Previous vs New Diff |
      | - Multi-Criteria TOPSIS|        | - Ingestion Run Logs   |
      | - Explainable Reasons  |        | - Source Provenance    |
      +------------------------+        +------------------------+
                  |
                  v
       [Student User Interface]
       (Offline Fast Execution)
```

---

## 3. Section-by-Section Functional Requirements

### Section 1: Manual Scholarship Entry

The system provides a role-gated Administrative Module (`/admin/scholarships/new`, `/admin/scholarships/:id/edit`) allowing authorized education officers and portal admins to curate scholarship records.

#### 1.1 Specification of Data Fields
The administrative form enforces validation and capture of the following 21+ mandatory and optional fields:

| Field Key | Label | Type | Validation / Constraints |
|:---|:---|:---|:---|
| `title` | Scholarship Name | `String` | Required. Min 5, max 200 characters. |
| `provider` | Provider / Organization | `String` | Required. E.g., "Ministry of Tribal Affairs", "AICTE". |
| `description` | Scholarship Description | `Text` | Required. Comprehensive markdown summary. |
| `benefits` | Benefits / Amount | `String` | Required. E.g., "₹50,000 per annum + tuition waiver". |
| `sourceUrl` | Official Source URL | `URL` | Required. Valid HTTPS URL to the official notification. |
| `applicationUrl` | Application URL | `URL` | Required. Valid URL pointing to the registration portal. |
| `openingDate` | Application Opening Date | `Date (YYYY-MM-DD)` | Required. Must be $\le$ `closingDate`. |
| `closingDate` | Application Closing Date | `Date (YYYY-MM-DD)` | Required. Deadline for submission. |
| `eligibleCourses` | Eligible Courses | `String[]` | Required. E.g., `["B.Tech", "B.E.", "BCA", "MCA"]`. |
| `educationLevel` | Eligible Education Level | `Enum / String[]` | `["Undergraduate", "Postgraduate", "Diploma", "Doctoral", "School"]`. |
| `studyYears` | Eligible Study Year | `Integer[]` | E.g., `[1, 2, 3, 4]`. Indicates eligible year of enrollment. |
| `minimumMarks` | Minimum Marks / Percentage / CGPA | `Float` | Range 0.0 to 100.0 (converted to percentage scale). |
| `maximumAnnualIncome` | Maximum Annual Family Income | `Integer` | In INR (₹). E.g., `250000` (₹2.5 Lakhs). `null` if unconstrained. |
| `eligibleCategories` | Eligible Categories | `String[]` | `["General", "OBC", "SC", "ST", "EWS", "Minority"]`. |
| `eligibleStates` | Eligible States / Domicile | `String[]` | E.g., `["Tamil Nadu"]` or `["All India"]`. |
| `genderRequirements` | Gender Requirements | `Enum` | `["All", "Female", "Male", "Transgender"]`. |
| `ageRequirements` | Age Requirements | `Object` | `{ minAge?: number, maxAge?: number }` (e.g., max 25 years). |
| `disabilityConditions` | Disability / Special Requirements | `String[]` | E.g., `["Physically Handicapped (40%+)", "Single Girl Child", "Wards of Armed Forces"]`. |
| `requiredDocuments` | Required Documents | `String[]` | Checklist of required certificates. |
| `additionalConditions` | Additional Conditions | `Text` | Free-form text for special caveats or institution criteria. |
| `contactInfo` | Contact / Help Information | `String` | Support email, helpline phone number, or nodal desk. |
| `sourceVerifiedAt` | Source Verification Date | `Timestamp` | Timestamp when the admin confirmed data authenticity. |

#### 1.2 Administrative Workflow
- **Save as Draft**: Allows administrators to preserve partial work without exposing the scholarship to student queries.
- **Interactive Live Preview**: Side-by-side or modal rendering showing exactly how the scholarship card and details appear to students.
- **Field Validation**: Evaluates type correctness, URL reachability, logical dates (`openingDate <= closingDate`), and non-negative income thresholds.
- **Publish & Archive**: Transitions scholarship between `DRAFT`, `PUBLISHED`, and `ARCHIVED` statuses.
- **Coexistence Guarantee**: Manual entry remains permanently available as an administrative override and manual supplement, regardless of whether automatic crawlers are running.

---

### Section 2: Automatic Scholarship Collection from Official Websites

The system incorporates an asynchronous, batch-oriented ingestion worker running independently from user traffic.

#### 2.1 Ingestion Flow Architecture
```
Cron Job (Scheduled Trigger)
       ↓
Load Enabled Scholarship Sources (DB Query)
       ↓
Visit Official Scholarship Website (Network Fetch)
       ↓
Discover Available Scholarship Pages (Link Extraction)
       ↓
Open Scholarship Detail Pages (DOM Traversal)
       ↓
Extract Raw Scholarship Information (Adapter Parsing)
       ↓
Parse Eligibility and Scholarship Details (Rule Extractor)
       ↓
Normalize Data Into Common Application Format (Transform)
       ↓
Validate Extracted Information (Rule Validation)
       ↓
Compare With Existing Database Record (Hash & External ID)
       ↓
Insert / Update / Mark For Review (Decision Matrix)
       ↓
Store In PostgreSQL
```

#### 2.2 Decoupling Invariant
- **Zero Live Web Scraping on User Queries**: When a student requests scholarship recommendations, the backend executes deterministic SQL queries on the local PostgreSQL database. External portal outages, rate limits, or IP blocking do not degrade student responsiveness.

---

### Section 3: Website Crawling Strategy

Because governmental and institutional portals employ heterogeneous web technologies, the ingestion pipeline supports a **dual-engine crawling architecture**:

#### 3.1 Static HTML Engine (Cheerio / Fast Fetch)
- **Target**: Server-side rendered (SSR) portals, static notice boards, classic tabular HTML portals.
- **Mechanism**: Lightweight HTTP GET requests via Node.js `fetch` or `axios`, parsed using `cheerio`.
- **Performance**: High throughput (< 300ms per page), low memory footprint.

#### 3.2 Dynamic Browser Engine (Playwright Headless)
- **Target**: Single Page Applications (SPAs), portals rendering data through client-side React/Angular/Vue frameworks, or pages behind dynamic DOM hydration.
- **Mechanism**: Headless Chromium instance managed via Playwright.
- **Behavior**: Navigates to target URL, awaits network idle / specific DOM selectors (`await page.waitForSelector('.scholarship-list')`), evaluates scripts, and extracts inner HTML.
- **Compliance & Politeness**:
  - Respects `robots.txt` disallow directives and crawl-delay intervals.
  - Implements randomized exponential backoff and rate limiting ($\le 2$ requests/sec per domain).
  - Employs legitimate, identifiable user-agent strings including administrative contact information.

---

### Section 4: Source-Specific Adapters

To prevent fragile, monolithic scraping logic, each official source implements a decoupled adapter adhering to the `IScholarshipSourceAdapter` contract.

#### 4.1 Adapter Interface Contract (`IScholarshipSourceAdapter`)
```typescript
export interface RawCrawlPayload {
  externalId: string;
  sourceUrl: string;
  scrapedAt: string;
  rawHtml: string;
  meta: Record<string, unknown>;
}

export interface IScholarshipSourceAdapter {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly listingUrl: string;
  readonly engineType: 'cheerio' | 'playwright';
  
  discoverListingLinks(): Promise<string[]>;
  fetchDetailPage(url: string): Promise<RawCrawlPayload>;
  parseRawData(payload: RawCrawlPayload): Promise<UnnormalizedScholarship>;
  normalizeToCommon(unnormalized: UnnormalizedScholarship): CommonScholarship;
}
```

#### 4.2 Standard Source Adapters Directory
- `scholarship-ingestion/sources/nsp.source.ts`: Ministry of Electronics & IT / National Scholarship Portal.
- `scholarship-ingestion/sources/aicte.source.ts`: AICTE Pragati, Saksham, Swanath schemes.
- `scholarship-ingestion/sources/ugc.source.ts`: University Grants Commission Ishan Uday & PG schemes.
- `scholarship-ingestion/sources/tamil-nadu.source.ts`: Tamil Nadu Post-Matric and State BC/MBC welfare portals.
- `scholarship-ingestion/sources/generic-rss.source.ts`: Fallback XML/RSS notification feeds.

---

### Section 5: Common Scholarship Format

Both Manual Entry and Automated Ingestion produce and persist the identical unified data schema:

```json
{
  "id": "sch_nsp_postmatric_sc_2026",
  "title": "Post Matric Scholarships Scheme for SC Students",
  "provider": "Ministry of Social Justice and Empowerment",
  "description": "Financial assistance to SC students studying at post-matriculation or post-secondary stages to enable them to complete their education.",
  "benefits": "Maintenance allowance up to ₹13,500/year plus full compulsory non-refundable fees reimbursement",
  "openingDate": "2026-07-01",
  "deadline": "2026-11-30",
  "applicationUrl": "https://scholarships.gov.in/sc-post-matric",
  "sourceUrl": "https://scholarships.gov.in/public/schemes/guidelines_SC.pdf",
  "eligibility": {
    "minimumPercentage": 50.0,
    "maximumAnnualIncome": 250000,
    "courses": [
      "B.Tech",
      "B.E.",
      "B.Sc",
      "B.Com",
      "B.A",
      "MBBS",
      "Diploma",
      "M.Tech",
      "MBA"
    ],
    "educationLevel": [
      "Undergraduate",
      "Postgraduate",
      "Diploma"
    ],
    "studyYears": [1, 2, 3, 4],
    "states": [
      "Tamil Nadu",
      "All India"
    ],
    "categories": [
      "SC"
    ],
    "gender": "All",
    "specialConditions": [
      "Hosteller and Day Scholar differentiated rates apply"
    ]
  },
  "documents": [
    "Caste Certificate",
    "Income Certificate issued by Revenue Authority",
    "Previous Year Academic Marksheet",
    "Aadhaar Linked Bank Passbook Copy",
    "Current Year College Fee Receipt / Bonafide Certificate"
  ],
  "contactInfo": "helpdesk@nsp.gov.in | 0120-6619540",
  "status": "PUBLISHED",
  "metadata": {
    "dataSourceType": "automatic_web",
    "sourceName": "National Scholarship Portal",
    "sourceExternalId": "NSP-MSJE-2026-SC",
    "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "lastScrapedAt": "2026-09-24T02:15:00.000Z",
    "lastVerifiedAt": "2026-09-24T02:15:30.000Z",
    "lastChangedAt": "2026-09-24T02:15:30.000Z",
    "version": 2
  }
}
```

---

### Section 6: Data Source Identification & Provenance

Every stored record embeds audit fields identifying its origin:

```sql
ALTER TABLE scholarships ADD COLUMN data_source_type VARCHAR(32) NOT NULL DEFAULT 'manual';
-- Valid values: 'manual', 'automatic_web', 'imported'
ALTER TABLE scholarships ADD COLUMN source_url TEXT NOT NULL;
ALTER TABLE scholarships ADD COLUMN source_name VARCHAR(128) NOT NULL;
ALTER TABLE scholarships ADD COLUMN source_external_id VARCHAR(128);
ALTER TABLE scholarships ADD COLUMN last_scraped_at TIMESTAMPTZ;
ALTER TABLE scholarships ADD COLUMN last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE scholarships ADD COLUMN last_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE scholarships ADD COLUMN content_hash CHAR(64);
ALTER TABLE scholarships ADD COLUMN current_version INT NOT NULL DEFAULT 1;
```

---

### Section 7: Automatic Validation Engine

Upon parsing raw data, the pipeline executes a strict multi-point sanity validation:

```
[Parsed Record] 
       ↓
1. Title check (length >= 5 chars, non-blank)?
2. Source URL valid HTTPS?
3. Application URL reachable or valid syntax?
4. Closing date valid ISO string >= opening date?
5. Income limit non-negative integer (if present)?
6. Academic percentage between 0 and 100?
7. Required documents list non-empty?
       ↓
+---------------+---------------+---------------+
| All Passed    | Minor Warning | Fatal Defect  |
v               v               v
VALID           NEEDS_REVIEW    FAILED
(Auto-publish)  (Review Queue)  (Quarantine/Log)
```

- **VALID**: High extraction confidence. Inserted or updated directly into PostgreSQL.
- **NEEDS_REVIEW**: Critical field ambiguous (e.g., regex could not unambiguously parse income limit or category requirements). Routed to Admin Review Dashboard.
- **FAILED**: Missing title, unreachable official URL, or corrupted payload. Logged to failure audit table.

---

### Section 8: Admin Review of Automatically Collected Data

The Admin Portal features an **Ingestion Review Queue** (`/admin/ingestion/review`).

#### 8.1 Monitoring Metrics Dashboard
Displays real-time execution statistics:
- **Sources Checked**: Total enabled web crawlers executed in current run.
- **Scholarships Found**: Total candidates discovered on listing pages.
- **New Scholarships**: Newly discovered opportunities inserted.
- **Updated Scholarships**: Existing records refreshed with new deadlines or income thresholds.
- **Unchanged**: Existing records matching identical content hashes.
- **Needs Review**: Records with ambiguous fields flagged for human review.
- **Failed**: Crawl errors or fatal parsing exceptions.

#### 8.2 Diff & Correction Workbench
When reviewing a `NEEDS_REVIEW` record, the admin interface displays:
- **Extracted Successfully ✓**: Confidence score $\ge 90\%$. (e.g., Title, Provider, Deadline, Minimum Marks, Official Link).
- **Uncertain / Missing ⚠**: Confidence $< 70\%$. (e.g., Income ceiling could not be parsed from scanned PDF table; category eligibility inferred from text keywords).
- **One-Click Corrections**: Admin corrects missing fields, views the original source webpage inside an embedded side-by-side frame, and clicks **Approve & Publish** or **Reject**.

---

### Section 9 & 10: Duplicate Detection & Content Hash Change Detection

To prevent duplicate explosion and unnecessary database writes, the engine implements canonical hashing:

```
Official Scholarship Page
        ↓
Extract Structured Fields (Title, Provider, Deadline, Income, Percentage, Courses, Docs)
        ↓
Canonicalize JSON (Alphabetically sort keys, normalize strings, trim whitespace)
        ↓
Generate SHA-256 Content Hash
        ↓
Compare with Existing Record (Match by source_external_id OR [source_url + title + provider])
        /                           \
  Record Found?                 New Record?
       /     \                       \
    Yes       No                      Insert as New (v1)
    /           \
Hash Equal?   Hash Changed?
    /             \
No Write       Trigger Versioning (v(n+1))
(Touch         Compute Field-Level Diff
 last_scraped) Store Previous/New Values
               Update Record in PostgreSQL
```

---

### Section 11: Version History & Audit Trail

All automatically and manually modified scholarships maintain an append-only version log in PostgreSQL table `scholarship_version_history`:

```sql
CREATE TABLE scholarship_version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    field_name VARCHAR(64) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    change_reason VARCHAR(128),
    source_url TEXT NOT NULL,
    ingestion_run_id UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by VARCHAR(64) DEFAULT 'SYSTEM_INGESTION'
);
```

#### Version History Audit Example
- **Version 1**:
  - `maximumAnnualIncome`: ₹2,50,000
  - `closingDate`: 2026-11-30
- **Version 2** (Updated by Cron Run `ing_run_8291`):
  - `maximumAnnualIncome`: ₹3,00,000
  - `closingDate`: 2026-12-15
  - `changed_at`: 2026-09-24 02:15:30
  - `source_url`: `https://scholarships.gov.in/sc-post-matric`

---

### Section 12: Scholarship Source Configuration

Administrators configure crawling endpoints via the `scholarship_sources` registry:

```sql
CREATE TABLE scholarship_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    base_url TEXT NOT NULL,
    listing_url TEXT NOT NULL,
    source_type VARCHAR(32) NOT NULL, -- 'government_central', 'government_state', 'private_trust'
    enabled BOOLEAN NOT NULL DEFAULT true,
    crawl_frequency VARCHAR(64) NOT NULL DEFAULT '0 2 * * *',
    parser_name VARCHAR(64) NOT NULL, -- e.g. 'NspAdapter', 'AicteAdapter'
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Administrators can toggle individual sources, modify listing URLs, or inspect adapter logs.

---

### Section 13: Cron Job & Scheduling Specification

The backend server mounts a scheduled cron runner initialized with environment overrides:

```bash
# Configurable Cron Expression (Default: Everyday at 02:00 AM IST)
SCHOLARSHIP_INGESTION_CRON="0 2 * * *"
SCHOLARSHIP_INGESTION_TIMEOUT_MS=600000
SCHOLARSHIP_CONCURRENT_CRAWLERS=2
```

The cron worker invokes:
```typescript
import cron from 'node-cron';

export function initializeScholarshipCron() {
  const scheduleExpr = process.env.SCHOLARSHIP_INGESTION_CRON || '0 2 * * *';
  cron.schedule(scheduleExpr, async () => {
    console.log(`[INGESTION_CRON] Scheduled execution triggered at ${new Date().toISOString()}`);
    await IngestionOrchestrator.runAllEnabledSources();
  });
}
```

---

### Section 14: Complete Scholarship Data Flow Summary

```
MANUAL FLOW:
Administrator → Input Form → Validate Form → Live Preview → Save & Publish → PostgreSQL

AUTOMATIC FLOW:
Official Portals → Cron Job (2 AM) → Adapters (Cheerio/Playwright) → Extract → Normalize
       → Validate Integrity → Deduplicate & Hash → Auto-Save or Admin Review Queue → PostgreSQL
```

Both flows culminate in the same PostgreSQL repository, exposing an identical query surface for the student recommendation engine.

---

### Section 15: Student Recommendation Flow

```
Student User
    ↓
Login & Complete Academic / Financial Profile
    ↓
Submit Query / Search: "Find scholarships matching my profile"
    ↓
Backend executes local query on PostgreSQL (NO EXTERNAL HTTP REQUESTS)
    ↓
Deterministic Rule Filter:
  - Is Student Income <= Scholarship Max Annual Income?
  - Is Student Marks >= Scholarship Min Percentage / CGPA?
  - Does Student Course match Eligible Courses?
  - Does Student Domicile match Eligible States?
  - Does Student Category match Eligible Categories?
    ↓
Multi-Criteria Ranking (TOPSIS scoring / Deadline urgency / Benefit weight)
    ↓
Explainable Response Formulation:
  - Exact reasons for eligibility match
  - List of missing or required documents to prepare
  - Deadline countdown and direct official application URL
    ↓
Render in Student UI
```

---

### Section 16: Core Functional Requirement Statement

> **The application must support both manual scholarship management and automated scholarship ingestion. Administrators must be able to manually create and maintain scholarships whenever required. In addition, a scheduled web-ingestion system must periodically retrieve scholarship information from approved official scholarship websites, extract and normalize scholarship details and eligibility conditions, validate the information, detect duplicates and changes, and insert or update PostgreSQL records. Automatically extracted information that cannot be confidently validated must be placed into an administrator review queue. Both manually entered and automatically collected scholarships must use the same database model, eligibility engine, recommendation system, and student-facing workflow.**
>
> **Manual entry acts as a fallback and administrative override, while automatic website ingestion serves as the primary method for maintaining large volumes of scholarship information continually fresh.**

---
*End of Product Requirements Document v2.4.0*
