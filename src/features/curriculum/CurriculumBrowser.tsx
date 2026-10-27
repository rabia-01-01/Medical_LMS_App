import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../../context/AuthContext';
import { useCurriculum } from './useCurriculum';
import type { ChapterWithTopics, SubjectWithChapters, Topic } from './types';

interface CurriculumBrowserProps {
  initialSubjectId?: string;
  onSelectTopic?: (topicId: string, topicName: string) => void;
  canManage?: boolean;
}

function SortableTopicItem({
  topic,
  idx,
  chapterIdx,
  isFacultyOrAdmin,
  onSelect,
}: {
  topic: Topic;
  idx: number;
  chapterIdx: number;
  isFacultyOrAdmin: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id, disabled: !isFacultyOrAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2.5 bg-gray-50 hover:bg-teal-50/50 border rounded-xl flex items-center justify-between transition ${
        isDragging ? 'border-teal-500 shadow-md bg-teal-50 ring-2 ring-teal-200' : 'border-gray-200'
      }`}
    >
      <div
        onClick={onSelect}
        className="min-w-0 flex items-start gap-2 flex-1 cursor-pointer"
      >
        <span className="text-[10px] font-bold text-teal-600 bg-teal-100/60 px-1.5 py-0.5 rounded mt-0.5">
          {chapterIdx + 1}.{idx + 1}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{topic.name}</p>
          {topic.description && (
            <p className="text-[10px] text-gray-500 line-clamp-1">{topic.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2">
        {isFacultyOrAdmin && (
          <div
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-teal-600 cursor-grab active:cursor-grabbing rounded"
            title="Drag to reorder topic"
          >
            <i className="fas fa-grip-vertical text-xs" />
          </div>
        )}
        <i
          onClick={onSelect}
          className="fas fa-chevron-right text-gray-300 text-xs cursor-pointer p-1"
        />
      </div>
    </div>
  );
}

// Medical Clinical Pearls & High-Yield Blueprint Generator for Chapters
function getChapterStudyGuide(chapterName: string, subjectName?: string) {
  const lower = chapterName.toLowerCase();
  
  if (lower.includes('physio') || lower.includes('organ') || lower.includes('human')) {
    return {
      highYieldPoints: [
        'Homeostatic negative feedback loops maintain internal osmolarity (285–295 mOsm/L).',
        'Frank-Starling Cardiac Mechanism: Stroke volume increases in response to an increase in end-diastolic volume.',
        'Renin-Angiotensin-Aldosterone System (RAAS) regulates systemic blood pressure and renal sodium reabsorption.',
        'Action potential depolarization is driven by rapid voltage-gated Na+ influx; repolarization by delayed K+ efflux.'
      ],
      clinicalPearls: 'Key Diagnostic Focus: Arterial Blood Gas (ABG) interpretation (pH, PaCO2, HCO3-), ECG wave intervals (PR, QRS, QT), and renal clearance equations (GFR = U_cr * V / P_cr).',
      examWeight: 'High Yield (approx. 20–25% of Medical Entrance Biology papers)'
    };
  }

  if (lower.includes('genetics') || lower.includes('cell') || lower.includes('dna') || lower.includes('biol')) {
    return {
      highYieldPoints: [
        'Fluid mosaic membrane model: Cholesterol acts as a bidirectional fluidity buffer across temperature fluctuations.',
        'Cell cycle checkpoints: G1/S restriction point controlled by Cyclin D-CDK4/6 and p53 tumor suppressor pathway.',
        'Mendelian genetics: Independent assortment occurs during Metaphase I of meiosis, unless genes exhibit genetic linkage.',
        'Central Dogma: DNA replication (semiconservative, 5\'->3\'), Transcription by RNA Pol II, Translation at 80S ribosomes.'
      ],
      clinicalPearls: 'Key Diagnostic Focus: Pedigree charting for autosomal dominant/recessive vs X-linked disorders (e.g. Hemophilia, Cystic Fibrosis, Down syndrome karyotype 47,XX,+21).',
      examWeight: 'Crucial Foundation (approx. 18–22% of Biology questions)'
    };
  }

  if (lower.includes('reproduct') || lower.includes('embryo') || lower.includes('gamet')) {
    return {
      highYieldPoints: [
        'Hormonal cascade: GnRH stimulates pituitary LH and FSH pulsatile release.',
        'Spermatogenesis takes approx. 64-72 days in seminiferous tubules; oogenesis is arrested in Prophase I until puberty.',
        'Acrosome reaction: Hyaluronidase and acrosin enzymes digest the corona radiata and zona pellucida.',
        'Blastocyst implantation occurs around day 6-7 post-fertilization in the secretory endometrium.'
      ],
      clinicalPearls: 'Key Diagnostic Focus: Menstrual cycle hormonal curves (LH surge 24-36h prior to ovulation), hCG rise in early pregnancy, and teratogenic susceptibility windows.',
      examWeight: 'High Yield NEET/IMAT Clinical (approx. 12–15%)'
    };
  }

  if (lower.includes('kinematic') || lower.includes('motion') || lower.includes('force') || lower.includes('dynam')) {
    return {
      highYieldPoints: [
        'Calculus relationships: v(t) = ds/dt and a(t) = dv/dt = d²s/dt².',
        'Projectile trajectories: Horizontal velocity remains constant (v_x = u*cosθ); vertical motion experiences g acceleration.',
        'Newton third law: Forces always occur in equal, opposite pairs acting on different bodies.',
        'Work-energy theorem: Net work done on an object equals the change in its kinetic energy (W_net = ΔKE).'
      ],
      clinicalPearls: 'Biomechanical relevance: Joint reaction forces, fluid flow in blood vessels, and trauma impact dynamics.',
      examWeight: 'Core Physics Mechanics (approx. 15% of Physics drills)'
    };
  }

  return {
    highYieldPoints: [
      'Master core definitions, SI units, and dimensional equations for this chapter.',
      'Solve at least 25 standardized MCQs from previous 10 years medical exams (PYQs).',
      'Review formulas, flowcharts, and high-yield exception cases before examinations.',
      'Correlate theoretical mechanisms with clinical diagnostic manifestations.'
    ],
    clinicalPearls: 'High-Yield Clinical Concept: Integrate biochemical and physiological principles into problem-solving drills.',
    examWeight: 'Standard Medical Syllabus Module (8–14% of Exam Drill)'
  };
}

export function CurriculumBrowser({
  initialSubjectId,
  onSelectTopic,
  canManage = false,
}: CurriculumBrowserProps) {
  const { user } = useAuth();
  const {
    curriculum,
    activeSubject,
    activeSubjectId,
    setActiveSubjectId,
    chapters,
    isLoading,
    addChapter,
    addTopic,
    removeChapter,
    removeTopic,
    reorderTopics,
  } = useCurriculum(initialSubjectId);

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');
  const [addingTopicChapterId, setAddingTopicChapterId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Chapter Study Hub Modal state
  const [activeStudyChapter, setActiveStudyChapter] = useState<{ chapter: ChapterWithTopics; idx: number } | null>(null);
  const [chapterMasteredMap, setChapterMasteredMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lms_mastered_chapters');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const isFacultyOrAdmin = canManage || user?.role === 'faculty' || user?.role === 'admin';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeStudyChapter) return;

    const currentTopics = activeStudyChapter.chapter.topics;
    const oldIndex = currentTopics.findIndex(t => t.id === active.id);
    const newIndex = currentTopics.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTopics = arrayMove(currentTopics, oldIndex, newIndex);
      setActiveStudyChapter({
        ...activeStudyChapter,
        chapter: {
          ...activeStudyChapter.chapter,
          topics: newTopics,
        },
      });
      await reorderTopics(activeStudyChapter.chapter.id, newTopics.map(t => t.id));
      setSuccessMessage('Topics reordered successfully!');
      setTimeout(() => setSuccessMessage(null), 2500);
    }
  };

  // Auto-expand first chapter when chapters load
  React.useEffect(() => {
    if (chapters.length > 0 && !expandedChapterId) {
      setExpandedChapterId(chapters[0].id);
    }
  }, [chapters, expandedChapterId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(prev => (prev === chapterId ? null : chapterId));
  };

  const handleOpenChapterStudyHub = (chapter: ChapterWithTopics, idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveStudyChapter({ chapter, idx });
  };

  const handleCloseChapterStudyHub = () => {
    setActiveStudyChapter(null);
  };

  const handleToggleMasterChapter = (chapterId: string) => {
    const nextState = !chapterMasteredMap[chapterId];
    const updated = { ...chapterMasteredMap, [chapterId]: nextState };
    setChapterMasteredMap(updated);
    try {
      localStorage.setItem('lms_mastered_chapters', JSON.stringify(updated));
    } catch {}

    if (nextState) {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#0f2b46', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapterName.trim()) return;
    setIsSubmitting(true);
    const res = await addChapter({
      name: newChapterName.trim(),
      description: newChapterDesc.trim() || undefined,
      displayOrder: chapters.length + 1,
    });
    if (res) {
      setSuccessMessage(`Chapter "${newChapterName.trim()}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
    setNewChapterName('');
    setNewChapterDesc('');
    setShowAddChapter(false);
    setIsSubmitting(false);
  };

  const handleCreateTopic = async (chapterId: string) => {
    if (!newTopicName.trim()) return;
    setIsSubmitting(true);
    const chapter = chapters.find(c => c.id === chapterId);
    const res = await addTopic({
      chapterId,
      name: newTopicName.trim(),
      description: newTopicDesc.trim() || undefined,
      displayOrder: (chapter?.topics?.length || 0) + 1,
    });
    if (res) {
      setSuccessMessage(`Topic "${newTopicName.trim()}" added to chapter!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update modal chapter topic list if study hub is currently open
      if (activeStudyChapter && activeStudyChapter.chapter.id === chapterId) {
        setActiveStudyChapter(prev => prev ? {
          ...prev,
          chapter: {
            ...prev.chapter,
            topics: [...prev.chapter.topics, res],
          }
        } : null);
      }
    }
    setNewTopicName('');
    setNewTopicDesc('');
    setAddingTopicChapterId(null);
    setIsSubmitting(false);
  };

  if (isLoading && curriculum.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading academic curriculum...</p>
      </div>
    );
  }

  const getSubjectIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes('BIO')) return 'fa-dna text-teal-500';
    if (c.includes('PHY')) return 'fa-atom text-blue-500';
    if (c.includes('CHEM')) return 'fa-flask text-purple-500';
    return 'fa-book-medical text-teal-600';
  };

  const studyGuide = activeStudyChapter ? getChapterStudyGuide(activeStudyChapter.chapter.name, activeSubject?.name) : null;

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <i className="fas fa-times text-xs" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {curriculum.map((subj) => {
          const isActive = activeSubject?.id === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => {
                setActiveSubjectId(subj.id);
                if (subj.chapters.length > 0) {
                  setExpandedChapterId(subj.chapters[0].id);
                } else {
                  setExpandedChapterId(null);
                }
              }}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0f2b46] to-[#1a3a5c] text-white border-teal-500/40 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                  isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <i className={`fas ${getSubjectIcon(subj.code)}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-tight">{subj.name}</p>
                <span
                  className={`text-[9px] font-semibold uppercase ${
                    isActive ? 'text-teal-300' : 'text-gray-400'
                  }`}
                >
                  {subj.code} • {subj.chapters.length} Ch
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Header & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="fas fa-layer-group text-teal-600" />
            <span>Academic Hierarchy — {activeSubject?.name}</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            {chapters.length} Chapters • {chapters.reduce((sum, c) => sum + c.topics.length, 0)} Core Topics • Click chapter to open Study Guide
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowAddChapter(prev => !prev)}
            className="text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
          >
            <i className={`fas ${showAddChapter ? 'fa-times' : 'fa-plus'} text-[10px]`} />
            <span>{showAddChapter ? 'Cancel' : 'Add Chapter'}</span>
          </button>
        )}
      </div>

      {/* Add Chapter Form */}
      {showAddChapter && (
        <div className="card bg-teal-50/40 border border-teal-200 p-3 animate-slide-up">
          <p className="text-xs font-bold text-teal-900 mb-2">Create New Medical Chapter</p>
          <input
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            placeholder="Chapter Name (e.g., Cardiac Electrophysiology)"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mb-2"
          />
          <input
            value={newChapterDesc}
            onChange={(e) => setNewChapterDesc(e.target.value)}
            placeholder="Short description / syllabus reference"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddChapter(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChapter}
              disabled={!newChapterName.trim() || isSubmitting}
              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Chapter'}
            </button>
          </div>
        </div>
      )}

      {/* Chapters Accordion / Clickable Cards */}
      <div className="space-y-2">
        {chapters.length === 0 ? (
          <div className="card text-center py-6 text-gray-400">
            <i className="fas fa-book-open text-2xl mb-1.5 text-gray-300" />
            <p className="text-xs">No chapters defined for this subject yet.</p>
          </div>
        ) : (
          chapters.map((chapter, idx) => {
            const isExpanded = expandedChapterId === chapter.id;
            const isMastered = !!chapterMasteredMap[chapter.id];

            return (
              <div
                key={chapter.id}
                className={`border rounded-xl transition overflow-hidden bg-white ${
                  isExpanded ? 'border-teal-400/60 shadow-xs ring-1 ring-teal-400/20' : 'border-gray-200'
                }`}
              >
                {/* Clickable Chapter Header */}
                <div
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-teal-50/30 transition group select-none"
                  onClick={() => handleOpenChapterStudyHub(chapter, idx)}
                  title="Click to view full chapter study guide & clinical details"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                      isMastered ? 'bg-emerald-500 text-white' : 'bg-teal-100/80 text-teal-800'
                    }`}>
                      {isMastered ? '✓' : idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-teal-700 transition truncate">
                          {chapter.name}
                        </p>
                        <span className="text-[9px] text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/50 font-medium hidden sm:inline">
                          Study Guide
                        </span>
                      </div>
                      {chapter.description && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{chapter.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenChapterStudyHub(chapter, idx)}
                      className="text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full transition flex items-center gap-1"
                      title="Open Chapter Study Hub"
                    >
                      <i className="fas fa-book-reader text-[9px]" />
                      <span>{chapter.topics.length} topics</span>
                    </button>

                    {isFacultyOrAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete chapter "${chapter.name}" and its topics?`)) {
                            removeChapter(chapter.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 text-xs p-1"
                        title="Delete chapter"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChapter(chapter.id);
                      }}
                      className="p-1 text-gray-400 hover:text-teal-600 transition"
                      title={isExpanded ? "Collapse topics" : "Expand topics"}
                    >
                      <i
                        className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-teal-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Topics Panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-1.5 animate-slide-up bg-gray-50/40">
                    {chapter.topics.length === 0 ? (
                      <p className="text-[11px] text-gray-400 py-2 italic text-center">
                        No topics added to this chapter yet.
                      </p>
                    ) : (
                      chapter.topics.map((topic, tIdx) => (
                        <div
                          key={topic.id}
                          onClick={() => onSelectTopic?.(topic.id, topic.name)}
                          className={`p-2 rounded-lg bg-white border border-gray-100 flex items-center justify-between text-left transition ${
                            onSelectTopic ? 'hover:border-teal-300 cursor-pointer shadow-2xs' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-[10px] text-teal-600 font-bold mt-0.5">
                              {idx + 1}.{tIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-700 truncate">{topic.name}</p>
                              {topic.description && (
                                <p className="text-[10px] text-gray-400 line-clamp-1">{topic.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isFacultyOrAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete topic "${topic.name}"?`)) {
                                    removeTopic(topic.id);
                                  }
                                }}
                                className="text-gray-300 hover:text-red-500 text-[10px] p-1 ml-1"
                                title="Delete topic"
                              >
                                <i className="fas fa-times" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Inline Add Topic for Admin and Faculty */}
                    {isFacultyOrAdmin && (
                      <div className="pt-2">
                        {addingTopicChapterId === chapter.id ? (
                          <div className="bg-white p-2.5 rounded-lg border border-teal-200 space-y-2 shadow-xs">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-teal-800">
                                Add Topic into Chapter {idx + 1}: {chapter.name}
                              </p>
                              <span className="text-[9px] text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                                Role: {user?.role?.toUpperCase()}
                              </span>
                            </div>
                            <input
                              value={newTopicName}
                              onChange={(e) => setNewTopicName(e.target.value)}
                              placeholder="Topic Name (e.g., Action Potential in Neurons)"
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                              autoFocus
                            />
                            <input
                              value={newTopicDesc}
                              onChange={(e) => setNewTopicDesc(e.target.value)}
                              placeholder="Learning objectives / details"
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                            />
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setAddingTopicChapterId(null)}
                                className="px-2.5 py-1 text-gray-600 text-[11px] font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCreateTopic(chapter.id)}
                                disabled={!newTopicName.trim() || isSubmitting}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold disabled:opacity-50 transition shadow-2xs"
                              >
                                {isSubmitting ? 'Saving Topic...' : 'Save Topic'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingTopicChapterId(chapter.id);
                              setNewTopicName('');
                              setNewTopicDesc('');
                            }}
                            className="w-full py-1.5 text-center text-[11px] font-semibold text-teal-700 bg-white border border-dashed border-teal-300 hover:bg-teal-50 rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <i className="fas fa-plus text-[9px]" />
                            <span>Add Topic to Chapter {idx + 1} ({chapter.name})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chapter Study Hub Modal (Prominently displaying Written Chapter Name) */}
      <AnimatePresence>
        {activeStudyChapter && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseChapterStudyHub}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
            >
              {/* Modal Header */}
              <div className="gradient-header p-5 text-white relative">
                <button
                  onClick={handleCloseChapterStudyHub}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition"
                >
                  <i className="fas fa-times" />
                </button>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="badge bg-teal-400/30 text-teal-200 text-[10px] font-bold py-0.5 px-2 rounded-full border border-teal-400/30">
                    {activeSubject?.name} • Chapter {activeStudyChapter.idx + 1}
                  </span>
                  {chapterMasteredMap[activeStudyChapter.chapter.id] && (
                    <span className="badge bg-emerald-500/30 text-emerald-200 text-[10px] font-bold py-0.5 px-2 rounded-full border border-emerald-400/30">
                      ✓ Mastered
                    </span>
                  )}
                </div>
                {/* Written Chapter Name */}
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  {activeStudyChapter.chapter.name}
                </h2>
                {activeStudyChapter.chapter.description && (
                  <p className="text-teal-100 text-xs mt-1 leading-snug">
                    {activeStudyChapter.chapter.description}
                  </p>
                )}
              </div>
              <div className="italy-accent"><div className="green" /><div className="white" /><div className="red" /></div>

              {/* Modal Content */}
              <div className="p-5 space-y-4">
                {/* Blueprint Overview */}
                <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <i className="fas fa-microscope text-teal-600" />
                      <span>Exam Blueprint & High-Yield Pearls</span>
                    </h4>
                    <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                      {studyGuide?.examWeight}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-700 mb-2.5">
                    {studyGuide?.highYieldPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <i className="fas fa-check text-teal-500 text-[10px] mt-0.5 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-teal-200/60 text-[11px] text-teal-800 bg-white/70 p-2 rounded-lg">
                    <p className="font-semibold text-teal-950">Clinical Pearl:</p>
                    <p>{studyGuide?.clinicalPearls}</p>
                  </div>
                </div>

                {/* Topics in this chapter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <i className="fas fa-list-ol text-teal-600" />
                      <span>Core Topics ({activeStudyChapter.chapter.topics.length})</span>
                    </h4>
                    {isFacultyOrAdmin && (
                      <button
                        onClick={() => {
                          setAddingTopicChapterId(activeStudyChapter.chapter.id);
                          setNewTopicName('');
                          setNewTopicDesc('');
                        }}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg transition"
                      >
                        + Add Topic
                      </button>
                    )}
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activeStudyChapter.chapter.topics.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {activeStudyChapter.chapter.topics.length === 0 ? (
                          <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl">
                            No topics registered under this chapter yet.
                          </div>
                        ) : (
                          activeStudyChapter.chapter.topics.map((t, tIdx) => (
                            <SortableTopicItem
                              key={t.id}
                              topic={t}
                              idx={tIdx}
                              chapterIdx={activeStudyChapter.idx}
                              isFacultyOrAdmin={isFacultyOrAdmin}
                              onSelect={() => {
                                onSelectTopic?.(t.id, t.name);
                                handleCloseChapterStudyHub();
                              }}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Topic form inside Study Hub modal for Admin/Faculty */}
                  {isFacultyOrAdmin && addingTopicChapterId === activeStudyChapter.chapter.id && (
                    <div className="mt-3 p-3 bg-teal-50/80 border border-teal-300 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-teal-900">
                        Add New Topic into "{activeStudyChapter.chapter.name}"
                      </p>
                      <input
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="Topic Name (e.g., Action Potential in Neurons)"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                        autoFocus
                      />
                      <input
                        value={newTopicDesc}
                        onChange={(e) => setNewTopicDesc(e.target.value)}
                        placeholder="Learning objectives / details"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setAddingTopicChapterId(null)}
                          className="px-2.5 py-1 text-gray-600 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCreateTopic(activeStudyChapter.chapter.id)}
                          disabled={!newTopicName.trim() || isSubmitting}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold disabled:opacity-50 transition"
                        >
                          {isSubmitting ? 'Adding...' : 'Save Topic'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleMasterChapter(activeStudyChapter.chapter.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      chapterMasteredMap[activeStudyChapter.chapter.id]
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                    }`}
                  >
                    <i className={`fas ${chapterMasteredMap[activeStudyChapter.chapter.id] ? 'fa-check-circle' : 'fa-award'}`} />
                    <span>
                      {chapterMasteredMap[activeStudyChapter.chapter.id] ? 'Chapter Mastered!' : 'Mark Chapter Mastered'}
                    </span>
                  </button>

                  <button
                    onClick={handleCloseChapterStudyHub}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
