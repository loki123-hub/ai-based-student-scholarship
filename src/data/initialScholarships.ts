import { CommonScholarship, ScholarshipSourceConfig, SourceAdapterSpec, ReviewQueueItem, VersionHistoryItem } from '../types/scholarship';

export const INITIAL_SOURCES: ScholarshipSourceConfig[] = [
  {
    id: 'src_nsp',
    name: 'National Scholarship Portal (NSP)',
    baseUrl: 'https://scholarships.gov.in',
    listingUrl: 'https://scholarships.gov.in/public/schemeGuidelines',
    sourceType: 'government_central',
    enabled: true,
    crawlFrequency: '0 2 * * *',
    parserName: 'NspAdapter',
    engineType: 'cheerio',
    lastRunAt: '2026-09-24T02:00:00Z',
    lastSuccessAt: '2026-09-24T02:04:12Z',
    failureCount: 0,
    status: 'SUCCESS'
  },
  {
    id: 'src_aicte',
    name: 'AICTE Student Development Schemes',
    baseUrl: 'https://www.aicte-india.org',
    listingUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    sourceType: 'government_central',
    enabled: true,
    crawlFrequency: '0 2 * * *',
    parserName: 'AicteAdapter',
    engineType: 'playwright',
    lastRunAt: '2026-09-24T02:04:15Z',
    lastSuccessAt: '2026-09-24T02:08:40Z',
    failureCount: 0,
    status: 'SUCCESS'
  },
  {
    id: 'src_ugc',
    name: 'University Grants Commission (UGC)',
    baseUrl: 'https://www.ugc.gov.in',
    listingUrl: 'https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx',
    sourceType: 'government_central',
    enabled: true,
    crawlFrequency: '0 2 * * *',
    parserName: 'UgcAdapter',
    engineType: 'cheerio',
    lastRunAt: '2026-09-24T02:08:42Z',
    lastSuccessAt: '2026-09-24T02:11:18Z',
    failureCount: 0,
    status: 'SUCCESS'
  },
  {
    id: 'src_tn_state',
    name: 'Tamil Nadu State Welfare Portal',
    baseUrl: 'https://bcmbcmw.tn.gov.in',
    listingUrl: 'https://bcmbcmw.tn.gov.in/scholarship_schemes.htm',
    sourceType: 'government_state',
    enabled: true,
    crawlFrequency: '0 2 * * *',
    parserName: 'TamilNaduAdapter',
    engineType: 'cheerio',
    lastRunAt: '2026-09-24T02:11:20Z',
    lastSuccessAt: '2026-09-24T02:14:02Z',
    failureCount: 0,
    status: 'SUCCESS'
  }
];

export const INITIAL_ADAPTER_SPECS: SourceAdapterSpec[] = [
  {
    id: 'nsp.source.ts',
    sourceName: 'National Scholarship Portal',
    fileName: 'nsp.source.ts',
    listingUrl: 'https://scholarships.gov.in/public/schemeGuidelines',
    renderingMethod: 'Static HTML (Cheerio)',
    discoveryStrategy: 'Extract <a> tags matching `/public/schemes/guidelines_*.pdf` and portal modal anchors',
    selectors: {
      listingContainer: 'table.schemes-table tbody tr',
      detailLink: 'td.scheme-title a',
      title: 'h1.scheme-header, .scheme-title-main',
      provider: '.ministry-badge, .department-name',
      description: '.scheme-overview p',
      benefits: '.financial-assistance-rates',
      deadline: '.timeline-closing-date .date-val',
      incomeLimit: '.eligibility-income-threshold',
      minMarks: '.academic-criteria-pct',
      documents: '.required-docs-list li',
      applyLink: 'a.btn-register-apply'
    }
  },
  {
    id: 'aicte.source.ts',
    sourceName: 'AICTE Portal Schemes',
    fileName: 'aicte.source.ts',
    listingUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    renderingMethod: 'Dynamic Browser (Playwright Headless)',
    discoveryStrategy: 'Headless Chrome evaluates client JS hydration, clicks accordions, parses nested cards',
    selectors: {
      listingContainer: '.view-content .views-row',
      detailLink: '.scheme-card a.read-more',
      title: '.page-header h1',
      provider: '.field-name-field-agency',
      description: '.field-name-body .field-items',
      benefits: '.field-name-field-stipend',
      deadline: '.field-name-field-closing-date',
      incomeLimit: '.eligibility-block .income-cap',
      minMarks: '.eligibility-block .cutoff-cgpa',
      documents: '.documents-enclosures ul li',
      applyLink: '.apply-online-url a'
    }
  },
  {
    id: 'ugc.source.ts',
    sourceName: 'UGC Scholarships & Fellowships',
    fileName: 'ugc.source.ts',
    listingUrl: 'https://www.ugc.gov.in/page/Scholarships-and-Fellowships.aspx',
    renderingMethod: 'Static HTML (Cheerio)',
    discoveryStrategy: 'Direct HTML table rows traversal and linked official notification PDF parsing',
    selectors: {
      listingContainer: '#ContentPlaceHolder1_GridView1 tr:not(:first-child)',
      detailLink: 'td:nth-child(2) a',
      title: 'td:nth-child(2)',
      provider: 'span#lblMinistry',
      description: '.announcement-body',
      benefits: '.award-details-cell',
      deadline: 'td:nth-child(4)',
      incomeLimit: '.income-clause',
      minMarks: '.marks-clause',
      documents: '.annexure-docs li',
      applyLink: 'a.online-submission-link'
    }
  },
  {
    id: 'tamil-nadu.source.ts',
    sourceName: 'Tamil Nadu State Welfare Portal',
    fileName: 'tamil-nadu.source.ts',
    listingUrl: 'https://bcmbcmw.tn.gov.in/scholarship_schemes.htm',
    renderingMethod: 'Static HTML (Cheerio)',
    discoveryStrategy: 'Government circulars table inspection with bilingual regex extraction (Tamil/English)',
    selectors: {
      listingContainer: '.content-table tbody tr',
      detailLink: 'td a[href*="scheme_details"]',
      title: 'td.scheme-name',
      provider: '.dept-heading',
      description: '.scheme-objective',
      benefits: '.rate-of-scholarship',
      deadline: '.last-date-badge',
      incomeLimit: '.parental-income-rule',
      minMarks: '.academic-eligibility-spec',
      documents: '.mandatory-certificates li',
      applyLink: 'a[href*="edistrict"]'
    }
  }
];

export const INITIAL_SCHOLARSHIPS: CommonScholarship[] = [
  {
    id: 'sch_nsp_msje_sc_2026',
    title: 'Post-Matric Scholarships Scheme for SC Students',
    provider: 'Ministry of Social Justice and Empowerment (MSJE)',
    description: 'Centrally sponsored scheme providing complete financial support to Scheduled Caste students pursuing recognized post-matriculation, technical, and professional degree courses.',
    benefits: 'Full tuition fee reimbursement + annual maintenance allowance of up to ₹13,500/year (hosteller) or ₹7,000/year (day scholar).',
    openingDate: '2026-07-01',
    deadline: '2026-12-15',
    applicationUrl: 'https://scholarships.gov.in',
    sourceUrl: 'https://scholarships.gov.in/public/schemes/guidelines_SC.pdf',
    eligibility: {
      minimumPercentage: 50.0,
      maximumAnnualIncome: 250000,
      courses: ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'BCA', 'MCA', 'Diploma', 'MBBS', 'M.Tech'],
      educationLevel: ['Undergraduate', 'Postgraduate', 'Diploma'],
      studyYears: [1, 2, 3, 4],
      states: ['Tamil Nadu', 'All India'],
      categories: ['SC'],
      gender: 'All',
      specialConditions: ['Enrolled in recognized AICTE/UGC approved institution']
    },
    documents: [
      'Community / Caste Certificate',
      'Income Certificate issued by Revenue Authority',
      'Previous Year Marksheet / Scorecard',
      'Aadhaar Linked Bank Passbook Copy',
      'Current College Fee Receipt / Bonafide Certificate'
    ],
    additionalConditions: 'Applicants must not be in receipt of any other central government scholarship.',
    contactInfo: 'helpdesk@nsp.gov.in | Toll-free: 0120-6619540',
    status: 'PUBLISHED',
    metadata: {
      dataSourceType: 'automatic_web',
      sourceName: 'National Scholarship Portal (NSP)',
      sourceUrl: 'https://scholarships.gov.in/public/schemes/guidelines_SC.pdf',
      sourceExternalId: 'NSP-MSJE-2026-SC',
      contentHash: 'a7b8c9d0e1f23456789abcdef0123456789abcdef0123456789abcdef0123456',
      lastScrapedAt: '2026-09-24T02:02:10Z',
      lastVerifiedAt: '2026-09-24T02:02:40Z',
      lastChangedAt: '2026-09-24T02:02:40Z',
      version: 2
    },
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-24T02:02:40Z'
  },
  {
    id: 'sch_aicte_pragati_2026',
    title: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE)',
    description: 'Empowering young women to pursue technical education by providing financial assistance toward college fees and developmental equipment.',
    benefits: '₹50,000 per annum for every year of study toward college fees, computer purchase, stationery, books, and software.',
    openingDate: '2026-08-15',
    deadline: '2026-11-30',
    applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
    sourceUrl: 'https://www.aicte-india.org/sites/default/files/pragati_guidelines_2026.pdf',
    eligibility: {
      minimumPercentage: 60.0,
      maximumAnnualIncome: 800000,
      courses: ['B.Tech', 'B.E.', 'B.Arch', 'B.Pharm', 'Diploma'],
      educationLevel: ['Undergraduate', 'Diploma'],
      studyYears: [1, 2],
      states: ['All India', 'Tamil Nadu'],
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      gender: 'Female',
      specialConditions: ['Maximum two girl children per family eligible']
    },
    documents: [
      'Bonafide Certificate from AICTE Approved College',
      'Parental Income Certificate (<= ₹8 Lakhs)',
      '10+2 / Diploma Mark Sheet',
      'Tuition Fee Receipt for Current Academic Session',
      'Aadhaar Card'
    ],
    additionalConditions: 'Awarded on merit in qualifying examination for 1st year and lateral entry 2nd year students.',
    contactInfo: 'pragati@aicte-india.org | 011-29581333',
    status: 'PUBLISHED',
    metadata: {
      dataSourceType: 'automatic_web',
      sourceName: 'AICTE Student Development Schemes',
      sourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/pragati',
      sourceExternalId: 'AICTE-PRAGATI-2026-DEGREE',
      contentHash: 'f4e3d2c1b0a987654321fedcba987654321fedcba987654321fedcba9876543',
      lastScrapedAt: '2026-09-24T02:06:30Z',
      lastVerifiedAt: '2026-09-24T02:07:00Z',
      lastChangedAt: '2026-09-24T02:07:00Z',
      version: 1
    },
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-09-24T02:07:00Z'
  },
  {
    id: 'sch_tn_bcmbcmw_postmatric',
    title: 'Tamil Nadu BC/MBC/DNC Post-Matric Free Education Scheme',
    provider: 'Backward Classes and Most Backward Classes Welfare Department, Govt of Tamil Nadu',
    description: 'State scholarship providing tuition fee waiver and special fee reimbursement for BC/MBC students enrolled in government and government-aided professional institutions.',
    benefits: '100% Tuition Fee Exemption + Special Non-Refundable Fee Concessions + Hostel Allowance.',
    openingDate: '2026-07-15',
    deadline: '2026-10-31',
    applicationUrl: 'https://bcmbcmw.tn.gov.in/edistrict',
    sourceUrl: 'https://bcmbcmw.tn.gov.in/scholarship_schemes.htm',
    eligibility: {
      minimumPercentage: 55.0,
      maximumAnnualIncome: 250000,
      courses: ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'BCA', 'Diploma', 'M.E.', 'M.Tech'],
      educationLevel: ['Undergraduate', 'Postgraduate', 'Diploma'],
      studyYears: [1, 2, 3, 4],
      states: ['Tamil Nadu'],
      categories: ['OBC', 'MBC', 'DNC'],
      gender: 'All',
      specialConditions: ['Candidate must be a permanent domicile resident of Tamil Nadu']
    },
    documents: [
      'Tamil Nadu Permanent Domicile / Nativity Certificate',
      'Community Certificate issued by Tahsildar (BC/MBC/DNC)',
      'Parental Income Certificate (<= ₹2,50,000)',
      '10th & 12th Standard Mark Sheets',
      'Bank Account Passbook (Single Account Linked to Aadhaar)'
    ],
    additionalConditions: 'For first graduate in family, special priority waiver applies.',
    contactInfo: 'bcwelfare@tn.gov.in | State Helpline: 1800-425-1333',
    status: 'PUBLISHED',
    metadata: {
      dataSourceType: 'automatic_web',
      sourceName: 'Tamil Nadu State Welfare Portal',
      sourceUrl: 'https://bcmbcmw.tn.gov.in/scholarship_schemes.htm',
      sourceExternalId: 'TN-BC-MBC-PM-2026',
      contentHash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
      lastScrapedAt: '2026-09-24T02:12:10Z',
      lastVerifiedAt: '2026-09-24T02:13:00Z',
      lastChangedAt: '2026-09-24T02:13:00Z',
      version: 1
    },
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-09-24T02:13:00Z'
  },
  {
    id: 'sch_panimalar_merit_cum_means',
    title: 'Panimalar IT Department Rural & Economically Weaker Merit Grant',
    provider: 'Panimalar Educational Trust / Academic Dean Office',
    description: 'Institutionally administered financial aid program specifically targeting IT, Computer Science, and Engineering students from rural and economically weaker backgrounds.',
    benefits: '₹40,000 semester grant toward tuition + free access to industry certification labs and cloud vouchers.',
    openingDate: '2026-09-01',
    deadline: '2026-11-15',
    applicationUrl: 'https://panimalar.ac.in/scholarships/rural-merit-grant',
    sourceUrl: 'https://panimalar.ac.in/academic-notices/scholarships-2026.pdf',
    eligibility: {
      minimumPercentage: 70.0,
      maximumAnnualIncome: 200000,
      courses: ['B.Tech IT', 'B.E. CSE', 'B.Tech AI&DS', 'B.E. ECE'],
      educationLevel: ['Undergraduate'],
      studyYears: [1, 2, 3, 4],
      states: ['Tamil Nadu', 'All India'],
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      gender: 'All',
      specialConditions: ['Rural schooling certificate or first-generation college attendee']
    },
    documents: [
      'College ID Card & Bonafide Letter',
      'Village Administrative Officer (VAO) Rural Residence Certificate',
      'Family Income Certificate (below ₹2 Lakhs)',
      'Semester Grade Sheet (CGPA >= 7.0 or marks >= 70%)',
      'Faculty Recommendation Letter'
    ],
    additionalConditions: 'Must maintain minimum 75% attendance and no standing arrears.',
    contactInfo: 'scholarships@panimalar.ac.in | 044-26490404',
    status: 'PUBLISHED',
    metadata: {
      dataSourceType: 'manual',
      sourceName: 'Panimalar Administrative Board (Manual Entry)',
      sourceUrl: 'https://panimalar.ac.in/academic-notices/scholarships-2026.pdf',
      sourceExternalId: 'PAN-ADM-2026-IT-01',
      contentHash: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
      lastVerifiedAt: '2026-09-24T18:30:00Z',
      lastChangedAt: '2026-09-24T18:30:00Z',
      version: 1
    },
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-24T18:30:00Z'
  },
  {
    id: 'sch_ugc_ishan_uday_2026',
    title: 'UGC Ishan Uday Special Scholarship Scheme for NER',
    provider: 'University Grants Commission (UGC)',
    description: 'Special scholarship scheme for students from the North Eastern Region to pursue general degree courses, technical and professional courses.',
    benefits: '₹5,400 per month for general degree courses and ₹7,800 per month for technical/medical/professional courses.',
    openingDate: '2026-08-01',
    deadline: '2026-10-31',
    applicationUrl: 'https://scholarships.gov.in',
    sourceUrl: 'https://www.ugc.gov.in/page/Ishan-Uday.aspx',
    eligibility: {
      minimumPercentage: 60.0,
      maximumAnnualIncome: 450000,
      courses: ['B.Tech', 'B.E.', 'MBBS', 'B.Sc', 'B.Com', 'B.A'],
      educationLevel: ['Undergraduate'],
      studyYears: [1],
      states: ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'],
      categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      gender: 'All',
      specialConditions: ['Domicile of North Eastern Region only']
    },
    documents: [
      'NER Domicile Certificate',
      'Income Certificate (<= ₹4.5 Lakhs)',
      '12th Marksheet',
      'Admission Slip / College Fee Receipt',
      'Aadhaar Card'
    ],
    contactInfo: 'ugc.helpdesk@gov.in',
    status: 'PUBLISHED',
    metadata: {
      dataSourceType: 'automatic_web',
      sourceName: 'University Grants Commission (UGC)',
      sourceUrl: 'https://www.ugc.gov.in/page/Ishan-Uday.aspx',
      sourceExternalId: 'UGC-ISHAN-2026',
      contentHash: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      lastScrapedAt: '2026-09-24T02:09:00Z',
      lastVerifiedAt: '2026-09-24T02:10:00Z',
      lastChangedAt: '2026-09-24T02:10:00Z',
      version: 1
    },
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-09-24T02:10:00Z'
  }
];

export const INITIAL_VERSION_HISTORY: VersionHistoryItem[] = [
  {
    id: 'ver_001',
    scholarshipId: 'sch_nsp_msje_sc_2026',
    scholarshipTitle: 'Post-Matric Scholarships Scheme for SC Students',
    versionNumber: 2,
    fieldName: 'maximumAnnualIncome',
    previousValue: '₹2,50,000 (Central Cap 2025)',
    newValue: '₹3,00,000 (Revised State Parity 2026)',
    changeReason: 'Automated crawler detected gazette notification revision in PDF table',
    sourceUrl: 'https://scholarships.gov.in/public/schemes/guidelines_SC.pdf',
    ingestionRunId: 'ing_run_20260924_0200',
    changedAt: '2026-09-24T02:02:40Z',
    changedBy: 'SYSTEM_INGESTION_CRON'
  },
  {
    id: 'ver_002',
    scholarshipId: 'sch_nsp_msje_sc_2026',
    scholarshipTitle: 'Post-Matric Scholarships Scheme for SC Students',
    versionNumber: 2,
    fieldName: 'deadline',
    previousValue: '2026-11-30',
    newValue: '2026-12-15',
    changeReason: 'Government portal extended application closing date by 15 calendar days',
    sourceUrl: 'https://scholarships.gov.in/public/schemes/guidelines_SC.pdf',
    ingestionRunId: 'ing_run_20260924_0200',
    changedAt: '2026-09-24T02:02:40Z',
    changedBy: 'SYSTEM_INGESTION_CRON'
  },
  {
    id: 'ver_003',
    scholarshipId: 'sch_panimalar_merit_cum_means',
    scholarshipTitle: 'Panimalar IT Department Rural & Economically Weaker Merit Grant',
    versionNumber: 1,
    fieldName: 'benefits',
    previousValue: '₹30,000 semester grant',
    newValue: '₹40,000 semester grant + cloud vouchers',
    changeReason: 'Trust committee approved budget expansion for 2026–27',
    sourceUrl: 'https://panimalar.ac.in/academic-notices/scholarships-2026.pdf',
    ingestionRunId: 'manual_adm_entry',
    changedAt: '2026-09-24T18:30:00Z',
    changedBy: 'Admin: nlokesh9696@gmail.com'
  }
];

export const INITIAL_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: 'rev_aicte_swanath_01',
    sourceName: 'AICTE Student Development Schemes',
    sourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/swanath',
    sourceExternalId: 'AICTE-SWANATH-2026',
    extractedAt: '2026-09-24T02:07:45Z',
    validationIssues: [
      'Special eligibility condition requires human review (Orphan / Ward of COVID-19 / Armed Forces)',
      'Ambiguous course degree vs diploma stipend breakdown in raw markup table'
    ],
    extractedSuccessfully: [
      { field: 'Scholarship Name', value: 'AICTE Swanath Scholarship Scheme' },
      { field: 'Provider', value: 'All India Council for Technical Education' },
      { field: 'Application Deadline', value: '2026-11-30' },
      { field: 'Maximum Family Income', value: '₹8,00,000 per annum' },
      { field: 'Application URL', value: 'https://www.aicte-india.org/schemes/students-development-schemes/swanath' }
    ],
    uncertainOrMissing: [
      {
        field: 'Eligible Categories',
        detectedRaw: 'Open to all categories meeting specified hardship conditions',
        reason: 'Regex failed to match strict caste categories (General/OBC/SC/ST); inferred as All Categories with Special Conditions',
        suggestedValue: 'General, OBC, SC, ST, EWS'
      },
      {
        field: 'Special Eligibility Conditions',
        detectedRaw: 'Orphans, either or both parents died due to Covid-19, or wards of Armed Forces and Central Paramilitary Forces martyred in action',
        reason: 'Natural language text requires human verification before entering deterministic rule engine',
        suggestedValue: 'Orphan / COVID-19 Bereaved / Wards of Martyred Armed Forces'
      },
      {
        field: 'Required Documents',
        detectedRaw: 'Death certificate of parent(s) / Certificate of martyr issued by Zilla Sainik Board / Bonafide',
        reason: 'Multiple conditional document paths detected; needs canonical list formulation',
        suggestedValue: 'Bonafide Certificate, Death Certificate or Armed Forces Martyr Certificate, Income Affidavit'
      }
    ],
    draftRecord: {
      id: 'sch_aicte_swanath_draft',
      title: 'AICTE Swanath Scholarship Scheme',
      provider: 'All India Council for Technical Education (AICTE)',
      description: 'Financial support to provide encouragement and support to orphans, children whose parents died of Covid-19, and children of martyrs.',
      benefits: '₹50,000 per annum towards payment of college fees, books, computer, and stationary equipment.',
      openingDate: '2026-08-15',
      deadline: '2026-11-30',
      applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/swanath',
      sourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/swanath',
      eligibility: {
        minimumPercentage: 50.0,
        maximumAnnualIncome: 800000,
        courses: ['B.Tech', 'B.E.', 'Diploma', 'B.Pharm', 'B.Arch'],
        educationLevel: ['Undergraduate', 'Diploma'],
        studyYears: [1, 2, 3, 4],
        states: ['All India'],
        categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        gender: 'All',
        specialConditions: ['Orphan / COVID-19 Bereaved / Martyred Armed Forces Ward']
      },
      documents: [
        'Bonafide Certificate from AICTE Approved Institution',
        'Death Certificate / Martyr Certificate from Competent Authority',
        'Parental Income Certificate (<= ₹8 Lakhs)',
        'Qualifying Examination Mark Sheet',
        'Aadhaar Linked Bank Passbook'
      ],
      contactInfo: 'swanath@aicte-india.org',
      status: 'NEEDS_REVIEW',
      metadata: {
        dataSourceType: 'automatic_web',
        sourceName: 'AICTE Student Development Schemes',
        sourceUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/swanath',
        sourceExternalId: 'AICTE-SWANATH-2026',
        contentHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        lastScrapedAt: '2026-09-24T02:07:45Z',
        lastVerifiedAt: '2026-09-24T02:07:45Z',
        lastChangedAt: '2026-09-24T02:07:45Z',
        version: 1
      },
      createdAt: '2026-09-24T02:07:45Z',
      updatedAt: '2026-09-24T02:07:45Z'
    }
  }
];
