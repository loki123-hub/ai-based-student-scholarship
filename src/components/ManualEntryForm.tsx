import React, { useState } from 'react';
import { CommonScholarship } from '../types/scholarship';
import { generateCanonicalContentHash } from '../services/ingestionEngine';
import { CheckCircle2, AlertCircle, Eye, Save, Send, Sparkles, X, Plus, Calendar, ExternalLink } from 'lucide-react';

interface ManualEntryFormProps {
  onSaveScholarship: (scholarship: CommonScholarship, isDraft: boolean) => void;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSaveScholarship }) => {
  // Form State covering all 21+ required fields
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [openingDate, setOpeningDate] = useState('2026-09-01');
  const [deadline, setDeadline] = useState('2026-11-30');
  
  // Eligibility
  const [coursesInput, setCoursesInput] = useState('B.Tech, B.E., B.Sc, BCA');
  const [educationLevels, setEducationLevels] = useState<string[]>(['Undergraduate']);
  const [selectedYears, setSelectedYears] = useState<number[]>([1, 2, 3, 4]);
  const [minimumPercentage, setMinimumPercentage] = useState<number>(60);
  const [maximumAnnualIncome, setMaximumAnnualIncome] = useState<number>(250000);
  const [categoriesInput, setCategoriesInput] = useState('General, OBC, SC, ST, EWS');
  const [statesInput, setStatesInput] = useState('Tamil Nadu, All India');
  const [gender, setGender] = useState<'All' | 'Female' | 'Male' | 'Transgender'>('All');
  const [minAge, setMinAge] = useState<number>(17);
  const [maxAge, setMaxAge] = useState<number>(28);
  const [specialConditions, setSpecialConditions] = useState('First generation college student or rural background');
  
  // Documents checklist
  const [documents, setDocuments] = useState<string[]>([
    'Income Certificate issued by Revenue Authority',
    'Previous Semester Grade Sheet',
    'College Bonafide Certificate',
    'Aadhaar Linked Bank Account Copy'
  ]);
  const [newDocText, setNewDocText] = useState('');

  const [additionalConditions, setAdditionalConditions] = useState('Candidate must maintain 75% attendance without backlogs.');
  const [contactInfo, setContactInfo] = useState('scholarship-help@panimalar.ac.in | 044-26490404');
  const [sourceVerifiedAt, setSourceVerifiedAt] = useState(new Date().toISOString().split('T')[0]);

  // Validation & Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const handleAddDoc = () => {
    if (newDocText.trim()) {
      setDocuments([...documents, newDocText.trim()]);
      setNewDocText('');
    }
  };

  const handleRemoveDoc = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const toggleYear = (yr: number) => {
    if (selectedYears.includes(yr)) {
      setSelectedYears(selectedYears.filter(y => y !== yr));
    } else {
      setSelectedYears([...selectedYears, yr].sort());
    }
  };

  const toggleEducationLevel = (lvl: string) => {
    if (educationLevels.includes(lvl)) {
      setEducationLevels(educationLevels.filter(l => l !== lvl));
    } else {
      setEducationLevels([...educationLevels, lvl]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!title.trim() || title.length < 5) errors.push('Scholarship name must be at least 5 characters');
    if (!provider.trim() || provider.length < 3) errors.push('Provider / organization name is required');
    if (!description.trim() || description.length < 20) errors.push('Description must provide sufficient detail (min 20 characters)');
    if (!benefits.trim()) errors.push('Benefits / scholarship amount is required');
    if (!sourceUrl.trim() || !sourceUrl.startsWith('http')) errors.push('Official source URL must be a valid HTTP/HTTPS link');
    if (!applicationUrl.trim() || !applicationUrl.startsWith('http')) errors.push('Application URL must be a valid HTTP/HTTPS link');
    if (openingDate && deadline && new Date(openingDate) > new Date(deadline)) errors.push('Application closing date must be after opening date');
    if (minimumPercentage < 0 || minimumPercentage > 100) errors.push('Minimum marks / percentage must be between 0 and 100');
    if (maximumAnnualIncome <= 0) errors.push('Maximum annual family income must be greater than 0 (or leave empty if unconstrained)');
    if (selectedYears.length === 0) errors.push('Select at least one eligible study year');
    if (documents.length === 0) errors.push('Specify at least one required document');

    setValidationErrors(errors);
    setIsValidated(true);
    return errors.length === 0;
  };

  const handleLoadSample = () => {
    setTitle('Tamil Nadu Higher Education Merit Grant for Engineering');
    setProvider('Directorate of Technical Education, Tamil Nadu');
    setDescription('Merit-cum-means financial assistance offered to undergraduate engineering students who have secured distinction in higher secondary education and are enrolled in accredited technical institutions across Tamil Nadu.');
    setBenefits('₹45,000 per academic year towards tuition and laboratory development fees');
    setSourceUrl('https://www.tndte.gov.in/scholarships/merit-grant-2026.pdf');
    setApplicationUrl('https://www.tndte.gov.in/edistrict-apply');
    setOpeningDate('2026-09-01');
    setDeadline('2026-11-30');
    setCoursesInput('B.Tech, B.E., B.Tech IT, B.Tech AI&DS, B.E. ECE');
    setEducationLevels(['Undergraduate']);
    setSelectedYears([1, 2, 3, 4]);
    setMinimumPercentage(75);
    setMaximumAnnualIncome(300000);
    setCategoriesInput('General, OBC, MBC, SC, ST, EWS');
    setStatesInput('Tamil Nadu');
    setGender('All');
    setMinAge(17);
    setMaxAge(24);
    setSpecialConditions('Permanent resident of Tamil Nadu; schooling completed in state schools preferred');
    setDocuments([
      'Nativity / Domicile Certificate of Tamil Nadu',
      'Community Certificate issued by Competent Authority',
      'HSC / 12th Standard Final Marksheet',
      'Parental Income Certificate (under ₹3,00,000)',
      'Bank Account Passbook (Aadhaar Seeded)'
    ]);
    setAdditionalConditions('Renewal subject to passing all semester subjects in the first attempt.');
    setContactInfo('dte-scholarships@tn.gov.in | Phone: 044-22351018');
    setSourceVerifiedAt('2026-09-24');
    setValidationErrors([]);
    setIsValidated(false);
  };

  const handleSave = (isDraft: boolean) => {
    if (!isDraft) {
      const valid = validateForm();
      if (!valid) return;
    }

    const coursesArray = coursesInput.split(',').map(s => s.trim()).filter(Boolean);
    const categoriesArray = categoriesInput.split(',').map(s => s.trim()).filter(Boolean);
    const statesArray = statesInput.split(',').map(s => s.trim()).filter(Boolean);

    const contentHash = generateCanonicalContentHash({
      title: title || 'Draft Scholarship',
      provider: provider || 'Administrative Entry',
      benefits: benefits || 'TBD',
      deadline: deadline || '2026-12-31',
      minimumPercentage,
      maximumAnnualIncome,
      courses: coursesArray,
      states: statesArray,
      categories: categoriesArray,
      documents
    });

    const newRecord: CommonScholarship = {
      id: `sch_manual_${Date.now()}`,
      title: title.trim() || 'Untitled Scholarship (Draft)',
      provider: provider.trim() || 'Administrative Board',
      description: description.trim(),
      benefits: benefits.trim(),
      openingDate,
      deadline,
      applicationUrl: applicationUrl.trim(),
      sourceUrl: sourceUrl.trim(),
      eligibility: {
        minimumPercentage,
        maximumAnnualIncome: maximumAnnualIncome || null,
        courses: coursesArray,
        educationLevel: educationLevels,
        studyYears: selectedYears,
        states: statesArray,
        categories: categoriesArray,
        gender,
        ageLimit: { minAge, maxAge },
        specialConditions: specialConditions ? [specialConditions] : []
      },
      documents,
      additionalConditions,
      contactInfo,
      status: isDraft ? 'DRAFT' : 'PUBLISHED',
      metadata: {
        dataSourceType: 'manual',
        sourceName: 'Administrative Board (Manual Entry)',
        sourceUrl: sourceUrl.trim() || 'Internal Manual Input',
        sourceExternalId: `MAN-${Date.now()}`,
        contentHash,
        lastVerifiedAt: new Date().toISOString(),
        lastChangedAt: new Date().toISOString(),
        version: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveScholarship(newRecord, isDraft);
    setSavedSuccessMessage(
      isDraft
        ? 'Scholarship saved as Draft successfully in PostgreSQL!'
        : 'Scholarship validated and published successfully to PostgreSQL central repository!'
    );
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Method 1</span>
            <span aria-hidden="true">·</span>
            <span>Section 1 of PRD</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-neutral-700">data_source_type: 'manual'</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Manual Scholarship Entry (Admin Module)</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Create, validate, preview, and publish verified scholarship programs with complete eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
            <span>Load Sample Preset</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            <span>{showPreview ? 'Hide Preview' : 'Interactive Preview'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-neutral-600" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Validate & Publish</span>
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Validation alert banner if attempted */}
      {isValidated && validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-rose-800">
            <AlertCircle className="w-4 h-4" /> Please resolve the following validation errors:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 21+ Fields Form */}
        <div className={showPreview ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
          {/* Card 1: Core Identification & Description */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              1. Basic Identification &amp; Description
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-neutral-800">Scholarship Name *</label>
                <input
                  type="text"
                  placeholder="e.g. National Merit Engineering Fellowship 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Provider / Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Electronics & IT / AICTE"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Benefits / Scholarship Amount *</label>
                <input
                  type="text"
                  placeholder="e.g. Up to ₹50,000 per annum + laptop allowance"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-neutral-800">Scholarship Description *</label>
                <textarea
                  rows={3}
                  placeholder="Provide comprehensive details regarding the scholarship objective, scope, and funding body..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Official URLs & Timelines */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              2. Official Links, Portal &amp; Timelines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Official Source URL *</label>
                <input
                  type="url"
                  placeholder="https://official-portal.gov.in/schemes/guidelines.pdf"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Application Registration URL *</label>
                <input
                  type="url"
                  placeholder="https://scholarships.gov.in/apply"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Application Opening Date</label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={(e) => setOpeningDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Application Closing Date (Deadline) *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Deterministic Eligibility Criteria */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              3. Deterministic Eligibility Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">
                  Minimum Marks / Percentage / CGPA (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minimumPercentage}
                  onChange={(e) => setMinimumPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                />
                <span className="text-[11px] text-neutral-500">Converted to standard 100% scale (e.g. 7.5 CGPA &approx; 75%)</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">
                  Maximum Annual Family Income (₹ INR) *
                </label>
                <input
                  type="number"
                  step="10000"
                  value={maximumAnnualIncome}
                  onChange={(e) => setMaximumAnnualIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                />
                <span className="text-[11px] text-neutral-500">
                  Currently ₹{maximumAnnualIncome.toLocaleString('en-IN')} (e.g. ₹2,50,000)
                </span>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-neutral-800">Eligible Courses (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech, B.E., B.Sc, BCA, M.Tech"
                  value={coursesInput}
                  onChange={(e) => setCoursesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Education Levels</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Undergraduate', 'Postgraduate', 'Diploma', 'Doctoral'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleEducationLevel(lvl)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                        educationLevels.includes(lvl)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Eligible Study Years</label>
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => toggleYear(yr)}
                      className={`w-9 h-8 text-xs font-mono font-medium rounded-md border transition-colors ${
                        selectedYears.includes(yr)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      Yr {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Eligible Categories (comma-separated)</label>
                <input
                  type="text"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Eligible States / Domicile</label>
                <input
                  type="text"
                  value={statesInput}
                  onChange={(e) => setStatesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Gender Requirements</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Female Only (e.g. Pragati)</option>
                  <option value="Male">Male Only</option>
                  <option value="Transgender">Transgender Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Age Requirements (Min - Max Years)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    className="w-20 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                    placeholder="Min"
                  />
                  <span className="text-neutral-400">to</span>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    className="w-20 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500 font-mono"
                    placeholder="Max"
                  />
                  <span className="text-[11px] text-neutral-500">years old</span>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-neutral-800">Disability / Special-Condition Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Differently-abled (>= 40%), single girl child, rural resident, martyr ward"
                  value={specialConditions}
                  onChange={(e) => setSpecialConditions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Required Documents & Administration */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              4. Required Documents Checklist &amp; Governance
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-800">Required Documents Checklist *</label>
              <div className="space-y-1.5">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
                    <span className="text-neutral-800 font-medium">{doc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add another required certificate..."
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDoc())}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
                <button
                  type="button"
                  onClick={handleAddDoc}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-neutral-800">Additional Eligibility Conditions</label>
                <textarea
                  rows={2}
                  value={additionalConditions}
                  onChange={(e) => setAdditionalConditions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Contact / Help Information</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-800">Source Verification Date</label>
                <input
                  type="date"
                  value={sourceVerifiedAt}
                  onChange={(e) => setSourceVerifiedAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:border-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview Drawer */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-semibold text-neutral-900">Student Card Live Preview</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">Preview Mode</span>
              </div>

              {/* Student Card Representation */}
              <div className="p-4 bg-neutral-50/70 border border-neutral-200 rounded-lg space-y-3">
                <div>
                  <div className="text-[11px] text-neutral-500 mb-0.5">{provider || 'Scholarship Provider'}</div>
                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">{title || 'Scholarship Title Preview'}</h4>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-3">
                  {description || 'Comprehensive scholarship description will appear here...'}
                </p>

                <div className="p-2.5 bg-white border border-neutral-200 rounded-md space-y-1 text-xs">
                  <div className="font-semibold text-neutral-900 text-[11px]">Grant / Award:</div>
                  <div className="text-emerald-700 font-medium">{benefits || 'Benefits details'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 pt-1">
                  <div>
                    <span className="text-neutral-400">Deadline: </span>
                    <span className="font-mono font-medium text-neutral-800">{deadline || 'YYYY-MM-DD'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Income Limit: </span>
                    <span className="font-mono font-medium text-neutral-800">
                      ₹{maximumAnnualIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Min Score: </span>
                    <span className="font-mono font-medium text-neutral-800">{minimumPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Years: </span>
                    <span className="font-mono font-medium text-neutral-800">{selectedYears.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200">
                  <div className="text-[11px] font-medium text-neutral-700 mb-1">Required Documents:</div>
                  <ul className="text-[11px] text-neutral-600 list-disc pl-4 space-y-0.5">
                    {documents.slice(0, 3).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                    {documents.length > 3 && <li className="text-neutral-400">+{documents.length - 3} more certificates</li>}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={applicationUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 text-center text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 flex items-center justify-center gap-1"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-neutral-100/70 border border-neutral-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-neutral-800">Audit Provenance Metadata:</div>
                <div className="font-mono text-[11px] text-neutral-600 space-y-0.5">
                  <div>data_source_type: "manual"</div>
                  <div>source_verified_at: {sourceVerifiedAt}</div>
                  <div>contact: {contactInfo}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
