import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  StudentConsultancyDossier,
  ConsultancyChecklistItem,
  ChecklistItemStatus,
  DossierOverallStatus,
  createDefaultChecklist,
} from '../features/consultancy/types';

// ============================================================================
// STAGE CONFIGURATION & LABELS
// ============================================================================

const STAGE_ICONS: Record<number, string> = {
  1: 'fa-passport',
  2: 'fa-graduation-cap',
  3: 'fa-stamp',
  4: 'fa-certificate',
  5: 'fa-hand-holding-usd',
  6: 'fa-university',
  7: 'fa-id-badge',
  8: 'fa-file-signature',
};

const STAGE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
  2: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-200' },
  3: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200' },
  4: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200' },
  5: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200' },
  6: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-200' },
  7: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-200' },
  8: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-200' },
};

function getStatusBadge(status: ChecklistItemStatus) {
  switch (status) {
    case 'verified':
      return { label: 'Verified', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'fa-check-circle' };
    case 'in_progress':
      return { label: 'In Review', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'fa-clock' };
    case 'submitted':
      return { label: 'Submitted', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'fa-file-upload' };
    case 'rejected':
      return { label: 'Action Required', bg: 'bg-red-100 text-red-800 border-red-300', icon: 'fa-exclamation-triangle' };
    default:
      return { label: 'Pending Docs', bg: 'bg-gray-100 text-gray-600 border-gray-300', icon: 'fa-hourglass-start' };
  }
}

function getOverallStatusBadge(status: DossierOverallStatus) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Matriculated & Ready', bg: 'bg-emerald-600 text-white' };
    case 'VISA_READY':
      return { label: 'Visa & Admit Clearance', bg: 'bg-teal-600 text-white' };
    case 'PRE_ENROLLED':
      return { label: 'Universitaly Pre-Enrolled', bg: 'bg-blue-600 text-white' };
    case 'SCHOLARSHIP_READY':
      return { label: 'Scholarship Dossier Ready', bg: 'bg-indigo-600 text-white' };
    case 'APOSTILLED':
      return { label: 'HRD & MEA Apostilled', bg: 'bg-amber-600 text-white' };
    case 'DOCS_VERIFIED':
      return { label: 'Academic Docs Verified', bg: 'bg-purple-600 text-white' };
    default:
      return { label: 'Pipeline In Progress', bg: 'bg-gray-700 text-white' };
  }
}

// ============================================================================
// MAIN CONSULTANT DASHBOARD
// ============================================================================

export function ConsultantDashboard({
  onNavigate,
  onBack,
}: {
  onNavigate: (screen: string, data?: any) => void;
  onBack?: () => void;
}) {
  const { user } = useAuth();
  const { consultancyDossiers, cohortBatches, deleteConsultancyDossier } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'verified' | 'in_progress' | 'pending'>('All');
  const [selectedDossier, setSelectedDossier] = useState<StudentConsultancyDossier | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [showAddApplicantModal, setShowAddApplicantModal] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState<StudentConsultancyDossier | null>(null);
  const [selectedStageForInspection, setSelectedStageForInspection] = useState<number | null>(null);
  const [showStageInspectionModal, setShowStageInspectionModal] = useState(false);

  const handleOpenStage = (stageNum: number) => {
    setSelectedStageForInspection(stageNum);
    setShowStageInspectionModal(true);
  };

  // Filter dossiers
  const filteredDossiers = useMemo(() => {
    return consultancyDossiers.filter((dossier) => {
      const matchesSearch =
        dossier.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dossier.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dossier.targetCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dossier.targetCourse.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBatch = selectedBatch === 'All' || dossier.studentBatch === selectedBatch;

      const completedCount = dossier.checklist.filter((i) => i.status === 'verified').length;
      let matchesStatus = true;
      if (statusFilter === 'verified') matchesStatus = completedCount === 8;
      else if (statusFilter === 'in_progress') matchesStatus = completedCount > 0 && completedCount < 8;
      else if (statusFilter === 'pending') matchesStatus = completedCount === 0;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [consultancyDossiers, searchQuery, selectedBatch, statusFilter]);

  // Metric Computations
  const totalApplicants = consultancyDossiers.length;
  const totalVerifiedStages = consultancyDossiers.reduce(
    (sum, d) => sum + d.checklist.filter((i) => i.status === 'verified').length,
    0
  );
  const totalPossibleStages = totalApplicants * 8;
  const overallCompletionRate = totalPossibleStages > 0 ? Math.round((totalVerifiedStages / totalPossibleStages) * 100) : 0;
  const scholarshipActiveCount = consultancyDossiers.filter((d) =>
    d.checklist.find((i) => i.key === 'scholarship_docs' && (i.status === 'in_progress' || i.status === 'verified'))
  ).length;

  const handleOpenInspector = (dossier: StudentConsultancyDossier) => {
    setSelectedDossier(dossier);
    setShowInspector(true);
  };

  return (
    <div className="pb-24">
      {/* Consultant Agent Portal Header */}
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 flex items-center justify-center text-white transition shadow-sm shrink-0"
                title="Go Back"
              >
                <i className="fas fa-arrow-left text-sm" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-400/20 text-teal-300 flex items-center justify-center text-xs">
                  <i className="fas fa-briefcase" />
                </span>
                <span className="text-teal-300 font-bold text-xs uppercase tracking-wider">
                  Consultant Agent Portal
                </span>
              </div>
              <h1 className="text-white text-xl font-black mt-1">
                Study Abroad & Consular Admissions
              </h1>
              <p className="text-gray-300 text-xs mt-0.5">
                Consular attestation, HRD, Apostille & Italian Medical Matriculation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddApplicantModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
              title="Add New Study Abroad Candidate"
            >
              <i className="fas fa-user-plus text-[11px]" />
              <span className="hidden sm:inline">Enroll Applicant</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-xl transition"
            >
              {user?.avatar || '💼'}
            </button>
          </div>
        </div>

        {/* High-Yield Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <p className="text-teal-300 text-lg font-black">{totalApplicants}</p>
            <p className="text-gray-200 text-[10px] font-medium leading-tight">Aspirants</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <p className="text-emerald-300 text-lg font-black">{totalVerifiedStages}</p>
            <p className="text-gray-200 text-[10px] font-medium leading-tight">Stages Cleared</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <p className="text-amber-300 text-lg font-black">{scholarshipActiveCount}</p>
            <p className="text-gray-200 text-[10px] font-medium leading-tight">Scholarships</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
            <p className="text-purple-300 text-lg font-black">{overallCompletionRate}%</p>
            <p className="text-gray-200 text-[10px] font-medium leading-tight">Readiness</p>
          </div>
        </div>
      </div>

      <div className="italy-accent">
        <div className="green" />
        <div className="white" />
        <div className="red" />
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {/* Exact Handwritten 8-Stage Pipeline Interactive Roadmap */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
                <i className="fas fa-tasks" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Consular & Admissions Checklist Pipeline
                </h2>
                <p className="text-[11px] text-gray-500">
                  Official 8-Stage Legalisation & Medical Entrance Lifecycle
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
              8 Verified Stages
            </span>
          </div>

          {/* 8-Stage Visual Step Grid (Clickable: Opens Stage Inspection Page) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {[
              { num: 1, title: 'Passport', icon: 'fa-passport', desc: 'Valid Bio-data' },
              { num: 2, title: '12th & MOI', icon: 'fa-graduation-cap', desc: 'Marksheet & Passing' },
              { num: 3, title: 'HRD', icon: 'fa-stamp', desc: 'State Dept. Seal' },
              { num: 4, title: 'Apostille', icon: 'fa-certificate', desc: 'MEA Hague Sticker' },
              { num: 5, title: 'Scholarship Docs', icon: 'fa-hand-holding-usd', desc: 'Bank, SDM & Trans' },
              { num: 6, title: 'Pre-Enrolment', icon: 'fa-university', desc: 'Universitaly & CIMEA' },
              { num: 7, title: 'Registration', icon: 'fa-id-badge', desc: 'Uni Matriculation' },
              { num: 8, title: 'Examination', icon: 'fa-file-signature', desc: 'IMAT Entrance Test' },
            ].map((stage) => (
              <button
                key={stage.num}
                type="button"
                onClick={() => handleOpenStage(stage.num)}
                className="p-2.5 rounded-xl border border-teal-100 bg-gray-50/80 hover:bg-teal-50/80 hover:border-teal-400 hover:shadow-sm active:scale-95 transition text-left cursor-pointer group w-full"
                title={`Click to open Stage ${stage.num} (${stage.title}) inspection page`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-5 h-5 rounded-full bg-teal-600 group-hover:bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    {stage.num}
                  </span>
                  <i className={`fas ${stage.icon} text-teal-600 group-hover:text-teal-700 text-xs transition`} />
                </div>
                <p className="text-xs font-bold text-gray-800 truncate group-hover:text-teal-900">{stage.title}</p>
                <p className="text-[10px] text-gray-500 truncate">{stage.desc}</p>
                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-teal-600 group-hover:text-teal-700">
                  <span>Inspect Stage</span>
                  <i className="fas fa-arrow-right text-[8px] transform group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email, Italy MD, Sapienza..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Batch Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
              <span className="text-[11px] font-semibold text-gray-500 mr-1">Batch:</span>
              <button
                onClick={() => setSelectedBatch('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedBatch === 'All'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Batches
              </button>
              {cohortBatches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedBatch === b.name
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-gray-500 mr-1">Status:</span>
              {(['All', 'in_progress', 'verified'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition ${
                    statusFilter === st
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'in_progress' ? 'Active' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Candidate Dossiers List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Enrolled Candidates ({filteredDossiers.length})
            </h3>
            <span className="text-[11px] text-gray-400">
              Showing assigned medical aspirants
            </span>
          </div>

          {filteredDossiers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-user-slash text-lg" />
              </div>
              <h4 className="text-sm font-bold text-gray-700">No Candidates Found</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                No students match your current search or batch criteria. Click &quot;Enroll Applicant&quot; to add one.
              </p>
            </div>
          ) : (
            filteredDossiers.map((dossier) => {
              const verifiedStagesCount = dossier.checklist.filter((i) => i.status === 'verified').length;
              const progressPct = Math.round((verifiedStagesCount / 8) * 100);
              const overallBadge = getOverallStatusBadge(dossier.overallStatus);

              return (
                <div
                  key={dossier.studentId}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-teal-300 transition space-y-3"
                >
                  {/* Student Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl shadow-xs">
                        {dossier.avatar || '👩‍🎓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{dossier.studentName}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            {dossier.studentBatch}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{dossier.studentEmail}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${overallBadge.bg} shadow-xs`}>
                      {overallBadge.label}
                    </span>
                  </div>

                  {/* Target Destination & Program Info */}
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Target Destination & Degree
                      </span>
                      <p className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm">🇮🇹</span> {dossier.targetCountry} • {dossier.targetCourse}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Assigned Consultant
                      </span>
                      <p className="font-semibold text-teal-700 flex items-center gap-1 mt-0.5">
                        <i className="fas fa-user-tie text-[10px]" /> {dossier.consultantName}
                      </p>
                    </div>
                  </div>

                  {/* 8-Stage Mini Progress Ladder */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700">
                        Checklist Completion: {verifiedStagesCount} of 8 Stages
                      </span>
                      <span className="text-[11px] font-extrabold text-teal-600">{progressPct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* 8 Quick Visual Pills */}
                    <div className="grid grid-cols-8 gap-1">
                      {dossier.checklist.map((item) => {
                        const isVerified = item.status === 'verified';
                        const isInProgress = item.status === 'in_progress';
                        return (
                          <div
                            key={item.id}
                            title={`Stage ${item.stageNumber}: ${item.title} (${item.status})`}
                            className={`h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition ${
                              isVerified
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                : isInProgress
                                ? 'bg-amber-400 text-gray-900 border-amber-500'
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}
                          >
                            {isVerified ? (
                              <i className="fas fa-check text-[9px]" />
                            ) : (
                              item.stageNumber
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowPrintReport(dossier)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <i className="fas fa-print text-gray-400 text-[11px]" />
                        Print Dossier
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${dossier.studentName}'s consultancy dossier from the active admissions pipeline? This action cannot be undone.`)) {
                            deleteConsultancyDossier(dossier.studentId);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition"
                        title="Delete candidate whose consultancy is done"
                      >
                        <i className="fas fa-trash-alt text-[10px]" />
                        <span>Delete Candidate</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenInspector(dossier)}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-teal-600/20 active:scale-95 transition"
                    >
                      <i className="fas fa-clipboard-check text-[11px]" />
                      Inspect & Verify 8 Stages
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 8-STAGE INSPECTION MODAL (OPENED BY CLICKING ANY OF THE 8 STAGES) */}
      {showStageInspectionModal && (
        <ConsultantStageInspectionModal
          initialStageNumber={selectedStageForInspection || 1}
          onClose={() => {
            setShowStageInspectionModal(false);
            setSelectedStageForInspection(null);
          }}
        />
      )}

      {/* DETAILED CHECKLIST INSPECTOR MODAL */}
      {showInspector && selectedDossier && (
        <ConsultantChecklistInspectorModal
          dossier={selectedDossier}
          onClose={() => {
            setShowInspector(false);
            setSelectedDossier(null);
          }}
        />
      )}

      {/* NEW APPLICANT ENROLLMENT MODAL */}
      {showAddApplicantModal && (
        <NewConsultancyApplicantModal onClose={() => setShowAddApplicantModal(false)} />
      )}

      {/* OFFICIAL PRINTABLE CERTIFICATE MODAL */}
      {showPrintReport && (
        <ConsularDossierPrintModal dossier={showPrintReport} onClose={() => setShowPrintReport(null)} />
      )}
    </div>
  );
}

// ============================================================================
// DOCUMENT ATTACHMENT PREVIEW MODAL
// ============================================================================

export function DocumentAttachmentPreviewModal({
  doc,
  onClose,
}: {
  doc: {
    fileName: string;
    fileSize: string;
    stageTitle: string;
    studentName: string;
    submittedAt?: string;
  };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden animate-slide-up space-y-0">
        <div className="bg-gradient-to-r from-[#0f2b46] to-[#16436e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center text-lg">
              <i className="fas fa-file-pdf" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">{doc.fileName}</h3>
              <p className="text-[11px] text-gray-300">
                Submitted by <strong>{doc.studentName}</strong> via Student Mail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
              {doc.stageTitle}
            </span>
            <span className="text-gray-500 text-[11px]">Size: {doc.fileSize}</span>
          </div>
          <span className="text-[11px] text-gray-500">
            {doc.submittedAt ? `Received: ${new Date(doc.submittedAt).toLocaleDateString()}` : 'Official Attachment'}
          </span>
        </div>

        {/* Simulated Document Viewer */}
        <div className="p-6 bg-slate-100 text-center flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-20 h-24 bg-white rounded-lg shadow-md border border-gray-300 p-2.5 flex flex-col justify-between mb-3 relative">
            <div className="space-y-1.5">
              <div className="h-1.5 bg-gray-300 rounded w-full" />
              <div className="h-1 bg-gray-200 rounded w-3/4" />
              <div className="h-1 bg-gray-200 rounded w-5/6" />
              <div className="h-1 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="text-[8px] font-bold text-teal-700 text-center border-t border-gray-200 pt-1">
              CONSULAR DOC
            </div>
          </div>
          <p className="text-xs font-bold text-gray-800">{doc.fileName}</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
            Official certificate received from student mail inbox for Italian Consular & Medical Entrance Processing.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <i className="fas fa-shield-alt" /> Virus Scanned & Passed
            </span>
            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
              <i className="fas fa-check" /> 300 DPI High-Res PDF
            </span>
          </div>
        </div>

        <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Consultant Legalisation Desk</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold transition"
          >
            Close Document Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONSULTANT STAGE INSPECTION MODAL (CLICKABLE ON ANY OF THE 8 STAGES)
// ============================================================================

export function ConsultantStageInspectionModal({
  initialStageNumber = 1,
  onClose,
}: {
  initialStageNumber?: number;
  onClose: () => void;
}) {
  const { consultancyDossiers, updateChecklistItemStatus } = useData();
  const [activeStageNumber, setActiveStageNumber] = useState<number>(initialStageNumber);
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [previewDoc, setPreviewDoc] = useState<{
    fileName: string;
    fileSize: string;
    stageTitle: string;
    studentName: string;
    submittedAt?: string;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const STAGES_CONFIG: Record<number, {
    key: string;
    title: string;
    category: 'Identity' | 'Academic' | 'Attestation' | 'Scholarship' | 'Enrolment' | 'Registration' | 'Examination';
    icon: string;
    description: string;
    defaultFileName: string;
    defaultFileSize: string;
    subItemsMeta?: { id: string; title: string; defaultNote: string }[];
  }> = {
    1: {
      key: 'passport',
      title: 'Passport (Valid International Bio-data)',
      category: 'Identity',
      icon: 'fa-passport',
      description: 'Valid International Passport (Bio-data page, minimum 18-24 months validity, at least 2 blank visa pages for Italian Study Visa issuance).',
      defaultFileName: 'Passport_BioData_Page.pdf',
      defaultFileSize: '1.8 MB',
    },
    2: {
      key: '12th_moi',
      title: 'Class 12th Marksheet, Passing Certs & MOI',
      category: 'Academic',
      icon: 'fa-graduation-cap',
      description: 'Senior Secondary Board Marksheet (PCB aggregate >= 60%), official Passing Certificate, and English Medium of Instruction (MOI) Certificate issued by School Principal.',
      defaultFileName: 'Class12_Marksheet_Passing_MOI_Compiled.pdf',
      defaultFileSize: '3.4 MB',
      subItemsMeta: [
        { id: 'sub-12th-mark', title: 'Class 12th Marksheet (PCB aggregate & practicals)', defaultNote: 'Aggregate: 94.6% in PCB' },
        { id: 'sub-12th-pass', title: 'Class 12th Passing Certificate / Migration', defaultNote: 'Original certificate verified' },
        { id: 'sub-12th-moi', title: 'Medium of Instruction (MOI) Certificate in English', defaultNote: 'Issued by School Principal, 12 years English medium' },
      ],
    },
    3: {
      key: 'hrd',
      title: 'State HRD Attestation',
      category: 'Attestation',
      icon: 'fa-stamp',
      description: 'State Human Resource Development (HRD / Higher Education Department) authentication on original Class 12th certificates with regional seal & officer countersignature.',
      defaultFileName: 'HRD_Attested_Backside_Stamp.pdf',
      defaultFileSize: '2.1 MB',
    },
    4: {
      key: 'apostille',
      title: 'Apostille (MEA Hague)',
      category: 'Attestation',
      icon: 'fa-certificate',
      description: 'Ministry of External Affairs (MEA), Government of India Hague Apostille sticker with official verification QR code registered on e-Sanad portal.',
      defaultFileName: 'MEA_Apostille_Sticker_Certificate.pdf',
      defaultFileSize: '1.9 MB',
    },
    5: {
      key: 'scholarship_docs',
      title: 'SCHOLARSHIP DOCS (Bank, Special, SDM, Translation & Legalisation)',
      category: 'Scholarship',
      icon: 'fa-hand-holding-usd',
      description: 'Regional Italian Government Scholarship dossier (EDISU / DSU / ER.GO) for 100% tuition waiver & €7,500/year living grant (Bank Certificate, Special Certificate, Notary/SDM/Apostille, Italian Translation & Legalisation).',
      defaultFileName: 'Scholarship_Income_Bank_SDM_Draft.pdf',
      defaultFileSize: '4.2 MB',
      subItemsMeta: [
        { id: 'sub-sch-bank', title: 'Bank Certificate (Balance & 6-month statement as of 31st Dec)', defaultNote: 'Closing balance confirmed, official bank seal' },
        { id: 'sub-sch-special', title: 'Special Certificate (Family Composition & Annual Income)', defaultNote: 'Family composition & income certificate submitted' },
        { id: 'sub-sch-notary', title: 'Notary, SDM, Apostille (Sub-Divisional Magistrate & MEA)', defaultNote: 'SDM attestation and MEA scholarship apostille completed' },
        { id: 'sub-sch-trans', title: 'Translation & Legalisation (Sworn Italian translation & Legalisation)', defaultNote: 'Sworn Italian translation & Consular legalisation' },
      ],
    },
    6: {
      key: 'pre_enrolment',
      title: 'Pre registration evaluation & Pre enrolment (Universitaly / CIMEA DOV)',
      category: 'Enrolment',
      icon: 'fa-university',
      description: 'Universitaly portal pre-enrolment dossier, eligibility evaluation letter from Italian university, and CIMEA Statement of Comparability / DOV (Dichiarazione di Valore).',
      defaultFileName: 'Universitaly_PreEnrolment_Summary.pdf',
      defaultFileSize: '2.5 MB',
      subItemsMeta: [
        { id: 'sub-univ-pre', title: 'Universitaly Pre-Enrolment Application Form & Code', defaultNote: 'Pre-enrolment submitted to Sapienza University of Rome' },
        { id: 'sub-univ-eval', title: 'Pre-registration Academic Evaluation & Acceptance Letter', defaultNote: 'Eligibility evaluation approved by university international desk' },
        { id: 'sub-univ-dov', title: 'CIMEA Statement of Comparability / DOV', defaultNote: 'CIMEA DiploME certificate issuance in final verification' },
      ],
    },
    7: {
      key: 'registration',
      title: 'Registration (University Matriculation)',
      category: 'Registration',
      icon: 'fa-id-badge',
      description: 'Official university portal matriculation, student ID allocation, and regional tuition exemption registration on the Infostud portal.',
      defaultFileName: 'Infostud_Registration_Draft.pdf',
      defaultFileSize: '1.2 MB',
    },
    8: {
      key: 'examination',
      title: 'EXAMINATION (IMAT Admit Card & Clearance)',
      category: 'Examination',
      icon: 'fa-file-signature',
      description: 'International Medical Admissions Test (IMAT) registration, test center allocation (New Delhi / Rome Overseas Testing Center), admit card verification, and examination day clearance.',
      defaultFileName: 'IMAT_Registration_Confirmation.pdf',
      defaultFileSize: '1.5 MB',
      subItemsMeta: [
        { id: 'sub-exam-reg', title: 'IMAT / Medical Entrance Registration Fee Receipt', defaultNote: 'Exam fee paid, registration confirmed' },
        { id: 'sub-exam-hall', title: 'Official Examination Admit Card & Roll Number Verification', defaultNote: 'Admit card release verification' },
        { id: 'sub-exam-clear', title: 'Examination Day Medical Checklist & Center Clearance', defaultNote: 'Testing Center: New Delhi / Rome' },
      ],
    },
  };

  const currentMeta = STAGES_CONFIG[activeStageNumber] || STAGES_CONFIG[1];

  const handleUpdateCandidateStage = (
    studentId: string,
    stageKey: string,
    targetStatus: ChecklistItemStatus | boolean,
    customNote?: string,
    subItemUpdates?: { id: string; status: 'pending' | 'verified' | 'rejected'; notes?: string }[]
  ) => {
    let status: ChecklistItemStatus;
    if (typeof targetStatus === 'boolean') {
      status = targetStatus ? 'verified' : 'rejected';
    } else {
      status = targetStatus;
    }

    const defaultNotes: Record<ChecklistItemStatus, string> = {
      verified: 'Document authenticated and verified by Consultant Agent Dr. Marco Rossi.',
      rejected: 'Document verification rejected. Re-submission required.',
      in_progress: 'Document under active review and consular legalisation.',
      pending: 'Document pending submission and verification.',
      submitted: 'Document received, awaiting review.',
    };

    const noteKey = `${studentId}-${stageKey}`;
    const note = customNote !== undefined ? customNote : (notesState[noteKey] || defaultNotes[status]);

    updateChecklistItemStatus(studentId, `chk-${stageKey}`, status, note, subItemUpdates);
    const statusLabels: Record<ChecklistItemStatus, string> = {
      verified: 'Verified',
      rejected: 'Not Verified',
      in_progress: 'In Review/In Progress',
      pending: 'Pending',
      submitted: 'In Review/In Progress',
    };
    setNotice(`Candidate marked as "${statusLabels[status]}"! Synchronized with Student Dashboard.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleSub = (
    studentId: string,
    stageKey: string,
    currentChecklist: ConsultancyChecklistItem[],
    subId: string
  ) => {
    const stageItem = currentChecklist.find(i => i.key === stageKey || i.id === `chk-${stageKey}`);
    if (!stageItem || !stageItem.subItems) return;

    const targetSub = stageItem.subItems.find(s => s.id === subId);
    const nextSubStatus = targetSub?.status === 'verified' ? 'pending' : 'verified';

    const subUpdates = stageItem.subItems.map(s => ({
      id: s.id,
      status: s.id === subId ? nextSubStatus : s.status,
      notes: s.notes,
    }));

    const allVerified = subUpdates.every(s => s.status === 'verified');
    handleUpdateCandidateStage(studentId, stageKey, allVerified ? 'verified' : 'in_progress', notesState[`${studentId}-${stageKey}`] || stageItem.consultantNotes, subUpdates);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#0f2b46] to-[#16436e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center text-xl">
              <i className={`fas ${currentMeta.icon}`} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  Stage {activeStageNumber} of 8
                </span>
                <span className="text-[10px] font-semibold text-gray-300">
                  Category: {currentMeta.category}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                {currentMeta.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* 8-Stage Quick Switcher Bar */}
        <div className="bg-gray-100 p-2 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sNum) => {
            const isSelected = sNum === activeStageNumber;
            const meta = STAGES_CONFIG[sNum];
            return (
              <button
                key={sNum}
                onClick={() => setActiveStageNumber(sNum)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    isSelected ? 'bg-white text-teal-800' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {sNum}
                </span>
                <span>{meta.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Live Notification Banner */}
        {notice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <i className="fas fa-check-circle text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* Stage Specification & Candidate Mail Submissions */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Stage Official Specification */}
          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs text-teal-950">
            <p className="font-bold flex items-center gap-1.5 text-teal-900 mb-1">
              <i className="fas fa-clipboard-check text-teal-700" />
              Consular & Legalisation Specification:
            </p>
            <p className="text-gray-700 leading-relaxed">{currentMeta.description}</p>
          </div>

          {/* Student Submissions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-users-cog text-teal-600" />
                Candidate Submissions for Review ({consultancyDossiers.length})
              </h4>
              <span className="text-[10px] text-gray-500">
                Set marker status for each student
              </span>
            </div>

            {consultancyDossiers.map((dossier) => {
              const stageItem = dossier.checklist.find(
                (i) => i.stageNumber === activeStageNumber || i.key === currentMeta.key
              );
              const itemStatus = stageItem?.status || 'pending';
              const isVerified = itemStatus === 'verified';
              const isRejected = itemStatus === 'rejected';
              const isInProgress = itemStatus === 'in_progress';
              const isPending = itemStatus === 'pending';

              const markerLabel = isVerified
                ? 'Verified'
                : isRejected
                ? 'Not Verified'
                : isInProgress
                ? 'In Review/In Progress'
                : 'Pending';

              const badgeClass = isVerified
                ? 'badge-green'
                : isRejected
                ? 'badge-red'
                : isInProgress
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300';

              const badgeIcon = isVerified
                ? 'fa-check-circle'
                : isRejected
                ? 'fa-times-circle'
                : isInProgress
                ? 'fa-hourglass-half'
                : 'fa-clock';

              const noteKey = `${dossier.studentId}-${currentMeta.key}`;
              const currentNote =
                notesState[noteKey] !== undefined
                  ? notesState[noteKey]
                  : (stageItem?.consultantNotes || '');

              const fileName = stageItem?.uploadedFile?.fileName || currentMeta.defaultFileName;
              const fileSize = stageItem?.uploadedFile?.fileSize || currentMeta.defaultFileSize;
              const submittedDate = stageItem?.uploadedFile?.uploadedAt
                ? new Date(stageItem.uploadedFile.uploadedAt).toLocaleDateString()
                : '2026-10-12';

              return (
                <div
                  key={dossier.studentId}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    isVerified
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : isRejected
                      ? 'bg-rose-50/40 border-rose-200'
                      : isInProgress
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-gray-200 shadow-xs'
                  }`}
                >
                  {/* Student Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-xl shadow-2xs">
                        {dossier.avatar || '👩‍🎓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-gray-900">{dossier.studentName}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            {dossier.studentBatch}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{dossier.studentEmail}</p>
                      </div>
                    </div>

                    <span
                      className={`badge text-[10px] font-bold py-1 px-2.5 flex items-center gap-1.5 ${badgeClass}`}
                    >
                      <i className={`fas ${badgeIcon}`} />
                      {markerLabel}
                    </span>
                  </div>

                  {/* Official Attached Document File */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <i className="fas fa-file-pdf text-sm text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-xs truncate">{fileName}</p>
                        <p className="text-[10px] text-gray-400">PDF • {fileSize} • Uploaded {submittedDate}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPreviewDoc({
                          fileName,
                          fileSize,
                          stageTitle: currentMeta.title,
                          studentName: dossier.studentName,
                          submittedAt: stageItem?.uploadedFile?.uploadedAt,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] transition shrink-0 flex items-center gap-1 border border-teal-200"
                    >
                      <i className="fas fa-eye" />
                      <span>View Attachment</span>
                    </button>
                  </div>

                  {/* Sub-items Checklist Toggles (if any) */}
                  {stageItem?.subItems && stageItem.subItems.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        Required Sub-Documents Checklist:
                      </p>
                      <div className="space-y-1">
                        {stageItem.subItems.map((sub) => {
                          const isSubDone = sub.status === 'verified';
                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleToggleSub(dossier.studentId, currentMeta.key, dossier.checklist, sub.id)}
                              className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between gap-2 transition ${
                                isSubDone ? 'bg-emerald-50/70 border-emerald-300' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                                    isSubDone ? 'bg-emerald-600 text-white' : 'border border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSubDone ? '✓' : ''}
                                </span>
                                <span className={`text-xs ${isSubDone ? 'font-bold text-emerald-950' : 'text-gray-700'}`}>
                                  {sub.title}
                                </span>
                              </div>
                              <span className={`text-[9px] font-bold ${isSubDone ? 'text-emerald-700' : 'text-gray-400'}`}>
                                {isSubDone ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Attestation Notes Input */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">
                      Consultant Verification Remarks / Feedback:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) =>
                          setNotesState({
                            ...notesState,
                            [noteKey]: e.target.value,
                          })
                        }
                        placeholder="e.g. Bio-data verified, valid till 2033; or translation required..."
                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCandidateStage(dossier.studentId, currentMeta.key, isVerified ? 'verified' : 'rejected', currentNote)
                        }
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Direct Action Buttons for Consultant: 4 Markers */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                    <div className="text-[10px] text-gray-400">
                      Syncs immediately to Student Dashboard
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCandidateStage(dossier.studentId, currentMeta.key, 'verified', currentNote)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <i className="fas fa-check-circle text-[10px]" />
                        Verified
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCandidateStage(dossier.studentId, currentMeta.key, 'rejected', currentNote)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          isRejected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <i className="fas fa-times-circle text-[10px]" />
                        Not Verified
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCandidateStage(dossier.studentId, currentMeta.key, 'in_progress', currentNote)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          isInProgress
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <i className="fas fa-hourglass-half text-[10px]" />
                        In Review/In Progress
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCandidateStage(dossier.studentId, currentMeta.key, 'pending', currentNote)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                          isPending
                            ? 'bg-gray-600 text-white shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                        }`}
                      >
                        <i className="fas fa-clock text-[10px]" />
                        Pending
                      </button>
                    </div>
                  </div>

                  {/* Digital Stamp if verified */}
                  {isVerified && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-stamp text-emerald-600 text-base" />
                        <div>
                          <p className="font-bold text-emerald-900 text-xs">Digitally Verified by Consultant Agent</p>
                          <p className="text-[10px] text-emerald-700">Officer: Dr. Marco Rossi (Consultant Agent)</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                        OFFICIAL ATTESTATION
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Stage {activeStageNumber}: {currentMeta.title}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold transition"
          >
            Close Stage Inspection
          </button>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewDoc && (
        <DocumentAttachmentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}

// ============================================================================
// CONSULTANT CHECKLIST INSPECTOR MODAL
// ============================================================================

export function ConsultantChecklistInspectorModal({
  dossier,
  onClose,
}: {
  dossier: StudentConsultancyDossier;
  onClose: () => void;
}) {
  const { updateChecklistItemStatus, deleteConsultancyDossier } = useData();
  const [activeStageId, setActiveStageId] = useState<string>(dossier.checklist[0]?.id || '');
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    fileName: string;
    fileSize: string;
    stageTitle: string;
    studentName: string;
    submittedAt?: string;
  } | null>(null);

  const activeItem = dossier.checklist.find((i) => i.id === activeStageId) || dossier.checklist[0];

  const handleUpdateStatus = (status: ChecklistItemStatus) => {
    if (!activeItem) return;
    const note = notesState[activeItem.id] !== undefined ? notesState[activeItem.id] : activeItem.consultantNotes;
    updateChecklistItemStatus(dossier.studentId, activeItem.id, status, note);
    setSaveSuccessNotice(`Stage ${activeItem.stageNumber} updated to ${status.toUpperCase()}`);
    setTimeout(() => setSaveSuccessNotice(null), 2500);
  };

  const handleToggleSubItem = (subItemId: string, currentStatus: 'pending' | 'verified' | 'rejected') => {
    if (!activeItem || !activeItem.subItems) return;
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    const subUpdates = activeItem.subItems.map((s) => ({
      id: s.id,
      status: s.id === subItemId ? nextStatus : s.status,
      notes: s.notes,
    }));

    // If all subitems are verified, mark stage verified
    const allDone = subUpdates.every((s) => s.status === 'verified');
    const stageStatus: ChecklistItemStatus = allDone ? 'verified' : 'in_progress';

    updateChecklistItemStatus(
      dossier.studentId,
      activeItem.id,
      stageStatus,
      notesState[activeItem.id] || activeItem.consultantNotes,
      subUpdates
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-[#0f2b46] to-[#16436e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center text-xl">
              <i className="fas fa-stamp" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Consultant Admissions Inspector</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  {dossier.studentBatch}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Candidate: <strong className="text-white">{dossier.studentName}</strong> • {dossier.targetCountry} ({dossier.targetCourse})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* 8-Stage Interactive Selector Tabs */}
        <div className="bg-gray-100 p-2 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto">
          {dossier.checklist.map((item) => {
            const isSelected = item.id === activeStageId;
            const isVerified = item.status === 'verified';
            const isInProgress = item.status === 'in_progress';
            return (
              <button
                key={item.id}
                onClick={() => setActiveStageId(item.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : isVerified
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : isInProgress
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    isSelected ? 'bg-white text-teal-800' : isVerified ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isVerified ? '✓' : item.stageNumber}
                </span>
                <span>{item.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Save Notice */}
        {saveSuccessNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <i className="fas fa-check-circle text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Active Stage Detail Body */}
        {activeItem && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Stage Title and Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-black border border-teal-200">
                  {activeItem.stageNumber}
                </span>
                <div>
                  <h4 className="text-base font-black text-gray-900">{activeItem.title}</h4>
                  <p className="text-xs text-gray-500">{activeItem.category} • Stage {activeItem.stageNumber} of 8</p>
                </div>
              </div>

              {/* Status Selector with 4 Markers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeItem.status === 'verified'
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <i className="fas fa-check-circle" />
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeItem.status === 'rejected'
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/50'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  <i className="fas fa-times-circle" />
                  Not Verified
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('in_progress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeItem.status === 'in_progress'
                      ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <i className="fas fa-hourglass-half" />
                  In Review/In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeItem.status === 'pending'
                      ? 'bg-gray-600 text-white shadow-xs ring-2 ring-gray-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <i className="fas fa-clock" />
                  Pending
                </button>
              </div>
            </div>

            {/* Official Attached Document File */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <i className="fas fa-file-pdf text-red-500 text-sm" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-gray-800 text-xs truncate block">
                    {activeItem.uploadedFile?.fileName || `${activeItem.key}_Document.pdf`}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    PDF • {activeItem.uploadedFile?.fileSize || '2.0 MB'} • Uploaded {activeItem.uploadedFile?.uploadedAt ? new Date(activeItem.uploadedFile.uploadedAt).toLocaleDateString() : 'Official Attachment'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc({
                  fileName: activeItem.uploadedFile?.fileName || `${activeItem.key}_Document.pdf`,
                  fileSize: activeItem.uploadedFile?.fileSize || '2.0 MB',
                  stageTitle: activeItem.title,
                  studentName: dossier.studentName,
                  submittedAt: activeItem.uploadedFile?.uploadedAt || ''
                })}
                className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[10px] transition shrink-0 border border-teal-200 flex items-center gap-1"
              >
                <i className="fas fa-eye" />
                <span>View Attachment</span>
              </button>
            </div>

            {/* Stage Description from Handwritten Checklist */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700">
              <p className="font-semibold text-gray-800 mb-0.5">Mandatory Consular Specification:</p>
              <p className="text-gray-600 leading-relaxed">{activeItem.description}</p>
            </div>

            {/* Sub-items (Crucial for Stage 5: Scholarship Docs & Stage 2: 12th/MOI) */}
            {activeItem.subItems && activeItem.subItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Required Checklist Sub-Documents ({activeItem.subItems.filter(s => s.status === 'verified').length}/{activeItem.subItems.length})</span>
                  <span className="text-[10px] text-gray-400 lowercase">click item to toggle verified</span>
                </p>

                <div className="space-y-1.5">
                  {activeItem.subItems.map((sub) => {
                    const isSubDone = sub.status === 'verified';
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubItem(sub.id, sub.status)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition ${
                          isSubDone
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                              isSubDone ? 'bg-emerald-600 text-white' : 'border border-gray-300 bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <div>
                            <p className={`text-xs font-bold ${isSubDone ? 'text-emerald-900' : 'text-gray-800'}`}>
                              {sub.title}
                            </p>
                            {sub.notes && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{sub.notes}</p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSubDone ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isSubDone ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Document Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-gray-200 bg-white">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Reference / Reg No.</span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {activeItem.documentNumber || 'Pending Issuance'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl border border-gray-200 bg-white">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Issuing Authority</span>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {activeItem.issuingAuthority || 'Regional Competent Authority'}
                </p>
              </div>
            </div>

            {/* Consultant Verification Stamp & Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                Consultant Agent Attestation Notes:
              </label>
              <textarea
                rows={2}
                value={
                  notesState[activeItem.id] !== undefined
                    ? notesState[activeItem.id]
                    : activeItem.consultantNotes || ''
                }
                onChange={(e) =>
                  setNotesState({
                    ...notesState,
                    [activeItem.id]: e.target.value,
                  })
                }
                placeholder="Enter consular verification remarks, Apostille sticker number, or student instructions..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500 focus:bg-white transition"
              />
            </div>

            {/* Official Verification Stamp Preview */}
            {activeItem.status === 'verified' && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
                    <i className="fas fa-check-double" />
                  </div>
                  <div>
                    <p className="font-black text-emerald-900">Digitally Verified by Consultant Agent</p>
                    <p className="text-[11px] text-emerald-700">
                      Officer: {activeItem.verifiedBy || dossier.consultantName}
                    </p>
                    {activeItem.verifiedAt && (
                      <p className="text-[10px] text-emerald-600">
                        Timestamp: {new Date(activeItem.verifiedAt).toLocaleDateString()} at{' '}
                        {new Date(activeItem.verifiedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg border-2 border-dashed border-emerald-600 text-emerald-800 font-black text-[10px] uppercase tracking-wider transform -rotate-3">
                    CONSULAR CLEARED
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
            >
              Close Inspector
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${dossier.studentName}'s completed consultancy dossier from the admissions pipeline?`)) {
                  deleteConsultancyDossier(dossier.studentId);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Delete candidate whose consultancy is done"
            >
              <i className="fas fa-trash-alt text-xs" />
              <span>Delete Candidate</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleUpdateStatus('verified')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                activeItem.status === 'verified'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-400'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <i className="fas fa-check-circle" />
              Mark as Verified
            </button>
            <button
              onClick={() => handleUpdateStatus('rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeItem.status === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <i className="fas fa-times-circle" />
              Mark as Not Verified
            </button>
            <button
              onClick={() => handleUpdateStatus('in_progress')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeItem.status === 'in_progress'
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <i className="fas fa-hourglass-half" />
              In Review/In Progress
            </button>
            <button
              onClick={() => handleUpdateStatus('pending')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeItem.status === 'pending'
                  ? 'bg-gray-600 text-white shadow-xs ring-2 ring-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <i className="fas fa-clock" />
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewDoc && (
        <DocumentAttachmentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}

// ============================================================================
// NEW CONSULTANCY APPLICANT ENROLLMENT MODAL
// ============================================================================

export function NewConsultancyApplicantModal({ onClose }: { onClose: () => void }) {
  const { users, addConsultancyDossier } = useData();
  const { user } = useAuth();

  const studentCandidates = users.filter((u) => u.role === 'student');
  const [selectedStudentId, setSelectedStudentId] = useState(studentCandidates[0]?.id || 'u-student-1');
  const [targetCountry, setTargetCountry] = useState('Italy');
  const [targetCourse, setTargetCourse] = useState('Medicine and Surgery (Single-Cycle Degree / MD)');
  const [targetUniversities, setTargetUniversities] = useState(
    'Sapienza University of Rome, University of Milan IMS, University of Bologna'
  );
  const [notes, setNotes] = useState('');

  const handleEnroll = () => {
    const candidate = studentCandidates.find((s) => s.id === selectedStudentId);
    if (!candidate) return;

    const newDossier: StudentConsultancyDossier = {
      studentId: candidate.id,
      studentName: candidate.name,
      studentEmail: candidate.email,
      studentBatch: candidate.batch || 'Batch 1 (Dec)',
      avatar: candidate.avatar || '👩‍🎓',
      targetCountry,
      targetCourse,
      targetUniversities: targetUniversities.split(',').map((u) => u.trim()),
      consultantId: user?.id || 'u-consultant-1',
      consultantName: user?.name || 'Dr. Marco Rossi (Consultant Agent)',
      assignedAt: new Date().toISOString(),
      overallStatus: 'IN_PROGRESS',
      priority: 'High',
      intake: '2026 / 2027 Academic Intake',
      lastUpdated: new Date().toISOString(),
      notes: notes || 'Enrolled in study abroad admissions pipeline.',
      checklist: createDefaultChecklist(),
    };

    addConsultancyDossier(newDossier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-200 animate-slide-up space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-base">
              <i className="fas fa-user-plus" />
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Enroll Candidate</h3>
              <p className="text-[11px] text-gray-500">Initiate 8-stage admissions & consular checklist</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Student Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Select Student Candidate:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
          >
            {studentCandidates.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email}) — {s.batch || 'Batch 1 (Dec)'}
              </option>
            ))}
          </select>
        </div>

        {/* Target Country & Course */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Target Study Destination:</label>
          <input
            type="text"
            value={targetCountry}
            onChange={(e) => setTargetCountry(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Degree Program:</label>
          <input
            type="text"
            value={targetCourse}
            onChange={(e) => setTargetCourse(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Target Universities (comma-separated):</label>
          <input
            type="text"
            value={targetUniversities}
            onChange={(e) => setTargetUniversities(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Advisory Initial Notes:</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aspirant background, 12th PCB percentage, scholarship eligibility..."
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20"
          >
            Create Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OFFICIAL CONSULAR DOSSIER CERTIFICATE PRINT MODAL
// ============================================================================

export function ConsularDossierPrintModal({
  dossier,
  onClose,
}: {
  dossier: StudentConsultancyDossier;
  onClose: () => void;
}) {
  const verifiedItems = dossier.checklist.filter((i) => i.status === 'verified');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-gray-200 text-gray-900 space-y-4 animate-slide-up">
        {/* Certificate Header */}
        <div className="text-center border-b-2 border-teal-600 pb-4 relative">
          <div className="w-12 h-12 rounded-full bg-teal-50 border-2 border-teal-600 text-teal-700 flex items-center justify-center text-xl mx-auto mb-2">
            🏛️
          </div>
          <h3 className="text-lg font-black tracking-wide uppercase text-gray-900">
            Sultanat e Italia Medica
          </h3>
          <p className="text-xs font-semibold text-teal-800">
            Medical Study Abroad & Consular Attestation Authority
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Official Pre-Enrolment & Admissions Compliance Certificate
          </p>

          <button onClick={onClose} className="absolute right-0 top-0 text-gray-400 hover:text-gray-600">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Student & Program Overview */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Candidate Name:</span>
            <p className="font-bold text-gray-900">{dossier.studentName}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Cohort Batch:</span>
            <p className="font-bold text-teal-700">{dossier.studentBatch}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Target Program:</span>
            <p className="font-semibold text-gray-800">{dossier.targetCountry} — {dossier.targetCourse}</p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Consultant Agent:</span>
            <p className="font-semibold text-gray-800">{dossier.consultantName}</p>
          </div>
        </div>

        {/* 8-Stage Summary Table */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Consular Verification Audit ({verifiedItems.length}/8 Stages Cleared):
          </p>
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            {dossier.checklist.map((item) => {
              const isDone = item.status === 'verified';
              return (
                <div
                  key={item.id}
                  className={`p-2 flex items-center justify-between border-b last:border-0 ${
                    isDone ? 'bg-emerald-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {item.stageNumber}
                    </span>
                    <span className="font-semibold text-gray-800">{item.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isDone ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Seals & Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-end justify-between text-xs">
          <div>
            <div className="inline-block p-2 rounded-lg border-2 border-emerald-600 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              OFFICIAL CONSULAR SEAL
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-right">
            <p className="font-serif italic text-sm text-gray-800">Dr. Marco Rossi</p>
            <div className="w-32 border-b border-gray-400 mt-1 mb-0.5" />
            <p className="text-[10px] text-gray-500 font-bold">Authorized Consultant Agent</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-md flex items-center gap-1.5"
          >
            <i className="fas fa-print" /> Print Official PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONSULTANT AGENT PROFILE SCREEN
// ============================================================================

export function ConsultantProfile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { user, logout } = useAuth();
  const { consultancyDossiers } = useData();

  return (
    <div className="pb-24">
      <div className="gradient-header pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-lg font-bold">Consultant Agent Profile</h1>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-sm"
          >
            <i className="fas fa-arrow-left" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-400/20 text-3xl flex items-center justify-center border-2 border-teal-300/40">
            {user?.avatar || '💼'}
          </div>
          <div>
            <h2 className="text-white text-base font-bold">{user?.name || 'Dr. Marco Rossi'}</h2>
            <p className="text-teal-300 text-xs font-medium">Accredited Study Abroad & Legalisation Agent</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-gray-200">
              Role: Consultant Agent
            </span>
          </div>
        </div>
      </div>

      <div className="italy-accent">
        <div className="green" />
        <div className="white" />
        <div className="red" />
      </div>

      <div className="p-4 space-y-4">
        {/* Credentials Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Consular Credentials & Accreditations
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600">Italian Consular Desk Affiliation:</span>
              <strong className="text-gray-900">Roma / New Delhi MEA Desk</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600">Universitaly MUR Representative:</span>
              <strong className="text-teal-700">Verified Partner ID: #IT-MED-8491</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600">Active Candidates in Pipeline:</span>
              <strong className="text-emerald-700">{consultancyDossiers.length} Candidates</strong>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Advisory Actions
          </h3>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-clipboard-list text-teal-600" />
              Return to 8-Stage Admissions Pipeline
            </span>
            <i className="fas fa-chevron-right text-gray-400" />
          </button>

          <button
            onClick={() => onNavigate('community')}
            className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800 transition"
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-comments text-blue-600" />
              Consultant Advisory Community Channel
            </span>
            <i className="fas fa-chevron-right text-gray-400" />
          </button>

          <button
            onClick={logout}
            className="w-full p-3 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 text-xs font-bold text-red-600 transition mt-3"
          >
            <i className="fas fa-sign-out-alt" />
            Sign Out of Consultant Portal
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STUDENT-FACING CONSULTANCY DOSSIER MODAL
// Allows Mary to view her exact 8-Stage checklist from her Student Dashboard!
// ============================================================================

export function StudentConsultancyRoadmapModal({
  dossier,
  onClose,
}: {
  dossier: StudentConsultancyDossier;
  onClose: () => void;
}) {
  const verifiedCount = dossier.checklist.filter((i) => i.status === 'verified').length;
  const progressPct = Math.round((verifiedCount / 8) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center text-xl">
              🇮🇹
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Study Abroad & Consular Roadmap</h3>
              <p className="text-xs text-teal-100">
                {dossier.targetCountry} — {dossier.targetCourse}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Consultant Contact Banner */}
        <div className="p-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">
              💼
            </span>
            <div>
              <p className="font-bold text-teal-900">{dossier.consultantName}</p>
              <p className="text-[10px] text-teal-700">Official Assigned Consultant Agent</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-600 text-white">
            {verifiedCount}/8 Done ({progressPct}%)
          </span>
        </div>

        {/* 8 Stages Detailed Roadmap */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {dossier.checklist.map((stage) => {
            const isVerified = stage.status === 'verified';
            const isInProgress = stage.status === 'in_progress';
            const statusConfig = getStatusBadge(stage.status);

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-2xl border transition ${
                  isVerified
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : isInProgress
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isVerified
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isVerified ? '✓' : stage.stageNumber}
                    </span>
                    <h4 className="font-bold text-gray-900 text-xs">{stage.title}</h4>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.bg}`}>
                    <i className={`fas ${statusConfig.icon} mr-1`} />
                    {statusConfig.label}
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 ml-8 leading-snug">{stage.description}</p>

                {/* Sub-items for Scholarship Docs / 12th */}
                {stage.subItems && stage.subItems.length > 0 && (
                  <div className="mt-2 ml-8 space-y-1">
                    {stage.subItems.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-[10px] text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <i
                            className={`fas ${
                              sub.status === 'verified' ? 'fa-check text-emerald-600' : 'fa-circle text-gray-300 text-[6px]'
                            }`}
                          />
                          {sub.title}
                        </span>
                        <span className="font-semibold text-gray-500">{sub.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {stage.consultantNotes && (
                  <div className="mt-2 ml-8 p-2 rounded-lg bg-white/80 border border-gray-200 text-[10px] text-gray-700">
                    <span className="font-bold text-teal-800">Consultant Note: </span>
                    {stage.consultantNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}
