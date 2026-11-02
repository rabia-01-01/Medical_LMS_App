import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useData } from '../../context/DataContext';
import { useResources, formatFileSize } from '../resources';
import { useCurriculum } from './useCurriculum';
import type { ChapterWithTopics, SubjectWithChapters, Topic } from './types';

interface CurriculumBrowserProps {
  initialSubjectId?: string;
  onSelectTopic?: (topicId: string, topicName: string) => void;
  onNavigateToResource?: (resource: any) => void;
  canManage?: boolean;
}


// Helper to guarantee clean, non-downloading MIME types
function getCleanMimeType(fileName = '', rawMime = '', resType = ''): string {
  const fn = (fileName || '').toLowerCase();
  const m = (rawMime || '').toLowerCase();
  const t = (resType || '').toLowerCase();
  if (m && m !== 'application/octet-stream' && !m.includes('unknown')) return m;
  if (fn.endsWith('.pdf') || t === 'pdf') return 'application/pdf';
  if (fn.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (fn.endsWith('.doc')) return 'application/msword';
  if (fn.endsWith('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (fn.endsWith('.ppt')) return 'application/vnd.ms-powerpoint';
  if (fn.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (fn.endsWith('.xls')) return 'application/vnd.ms-excel';
  if (fn.endsWith('.mp4') || t === 'video') return 'video/mp4';
  if (fn.endsWith('.webm')) return 'video/webm';
  if (fn.endsWith('.mov')) return 'video/quicktime';
  if (fn.endsWith('.jpg') || fn.endsWith('.jpeg')) return 'image/jpeg';
  if (fn.endsWith('.png')) return 'image/png';
  if (fn.endsWith('.gif')) return 'image/gif';
  if (fn.endsWith('.webp')) return 'image/webp';
  if (fn.endsWith('.svg')) return 'image/svg+xml';
  if (fn.endsWith('.txt') || fn.endsWith('.md') || fn.endsWith('.json') || t === 'note' || t === 'notes') return 'text/plain';
  return 'application/pdf';
}

// Format details and icon helper for uploaded study materials
function getFormatInfo(mat: any) {
  const fileName = (mat?.fileName || mat?.file?.file_name || mat?.title || '').toLowerCase();
  const mime = (mat?.mimeType || mat?.file?.mime_type || '').toLowerCase();
  const type = (mat?.resource_type || mat?.type || '').toLowerCase();

  if (type === 'video' || mime.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.mkv') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) {
    return {
      icon: 'fa-play-circle text-rose-500',
      bg: 'bg-rose-50',
      badge: 'VIDEO',
      color: 'text-rose-600',
    };
  }
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
    return {
      icon: 'fa-file-word text-blue-600',
      bg: 'bg-blue-50',
      badge: 'DOCX',
      color: 'text-blue-600',
    };
  }
  if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt') || mime.includes('presentation') || mime.includes('powerpoint')) {
    return {
      icon: 'fa-file-powerpoint text-amber-600',
      bg: 'bg-amber-50',
      badge: 'PPTX',
      color: 'text-amber-600',
    };
  }
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') || mime.includes('spreadsheet') || mime.includes('excel')) {
    return {
      icon: 'fa-file-excel text-emerald-600',
      bg: 'bg-emerald-50',
      badge: 'EXCEL',
      color: 'text-emerald-600',
    };
  }
  if (mime.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp') || fileName.endsWith('.svg') || fileName.endsWith('.gif')) {
    return {
      icon: 'fa-file-image text-purple-600',
      bg: 'bg-purple-50',
      badge: 'IMAGE',
      color: 'text-purple-600',
    };
  }
  if (type === 'pdf' || mime === 'application/pdf' || fileName.endsWith('.pdf')) {
    return {
      icon: 'fa-file-pdf text-red-500',
      bg: 'bg-red-50',
      badge: 'PDF',
      color: 'text-red-600',
    };
  }
  if (type === 'pyq') {
    return {
      icon: 'fa-clipboard-check text-indigo-600',
      bg: 'bg-indigo-50',
      badge: 'PYQ',
      color: 'text-indigo-600',
    };
  }
  if (type === 'dpp') {
    return {
      icon: 'fa-tasks text-emerald-600',
      bg: 'bg-emerald-50',
      badge: 'DPP',
      color: 'text-emerald-600',
    };
  }
  return {
    icon: 'fa-file-alt text-teal-600',
    bg: 'bg-teal-50',
    badge: (type || 'DOCUMENT').toUpperCase(),
    color: 'text-teal-600',
  };
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
  onNavigateToResource,
  canManage = false,
}: CurriculumBrowserProps) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const activeUser = isViewingAs && viewingAsUser ? viewingAsUser : user;
  const userRole = (activeUser?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isFaculty = userRole === 'faculty';
  const isStudent = userRole === 'student' || (!isAdmin && !isFaculty);
  const isFacultyOrAdmin = (canManage || isAdmin || isFaculty) && !isStudent;
  const canUploadMaterials = isAdmin || isFacultyOrAdmin;
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const {
    resources: contextResources,
    addResource,
    deleteResource: deleteContextResource,
    studentProgressList,
    toggleChapterCompletion,
    toggleTopicCompletion,
    isChapterCompleted,
    isTopicCompleted,
    getChapterCompletions,
    getTopicCompletions,
  } = useData();
  const { resources: cloudResources, uploadResource, deleteResource: deleteCloudResource } = useResources();
  const savedSubjectId = typeof window !== 'undefined' ? sessionStorage.getItem('lms_curriculum_active_subject') || undefined : undefined;
  const effectiveInitialSubjectId = initialSubjectId || savedSubjectId;

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
  } = useCurriculum(effectiveInitialSubjectId);

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  // Auto-expand first chapter when active subject changes to ensure its topics are immediately shown
  useEffect(() => {
    if (activeSubject && activeSubject.chapters.length > 0) {
      setExpandedChapterId(activeSubject.chapters[0].id);
    }
  }, [activeSubject?.id, activeSubject?.code]);
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
  // Topic Details & Uploaded Study Materials Modal state
  const [activeStudyTopic, setActiveStudyTopic] = useState<{
    topic: Topic;
    chapter: ChapterWithTopics;
    chapterIdx: number;
    topicIdx: number;
  } | null>(null);

  // Preview resource fallback modal
  const [selectedPreviewResource, setSelectedPreviewResource] = useState<any | null>(null);
  const [viewingCompletionsModal, setViewingCompletionsModal] = useState<{
    title: string;
    type: 'Chapter' | 'Topic';
    students: { studentId: string; studentName: string; studentBatch: string; avatar?: string }[];
  } | null>(null);

  // Material upload state inside Topic Study Modal
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadResourceType, setUploadResourceType] = useState<'NOTE' | 'VIDEO' | 'DOCX' | 'BOOK' | 'DPP' | 'PYQ'>('NOTE');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadReadingContent, setUploadReadingContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Unified study materials list
  const allMaterials = useMemo<any[]>(() => {
    const list: any[] = [];
    const seen = new Set<string>();

    const contextMap = new Map<string, any>();
    (contextResources || []).forEach((ctxR: any) => {
      if (ctxR.id) contextMap.set(ctxR.id, ctxR);
      const topicId = ctxR.topicId || (ctxR as any).topic_id;
      if (ctxR.title && topicId) {
        contextMap.set(`${ctxR.title.trim().toLowerCase()}_${topicId}`, ctxR);
      }
    });

    (cloudResources || []).forEach((cr: any) => {
      seen.add(cr.id);
      const topicId = cr.topic_id || cr.topicId;
      const key = `${cr.title?.trim().toLowerCase()}_${topicId}`;
      if (cr.title && topicId) {
        seen.add(key);
      }
      const matchedCtx = contextMap.get(cr.id) || (topicId ? contextMap.get(key) : null);
      const fn = cr.fileName || cr.file?.file_name || matchedCtx?.fileName || cr.title || 'study_material.pdf';
      const rawMime = cr.mimeType || cr.file?.mime_type || matchedCtx?.mimeType || '';
      const cleanMime = getCleanMimeType(fn, rawMime, cr.resource_type || cr.type);
      const resType = (cr.type || cr.resource_type || matchedCtx?.type || (fn.toLowerCase().endsWith('.pdf') ? 'pdf' : fn.toLowerCase().endsWith('.docx') ? 'docx' : 'note')).toLowerCase();
      const fileData = cr.fileData || matchedCtx?.fileData;

      list.push({
        ...cr,
        id: cr.id,
        title: cr.title,
        description: cr.description || matchedCtx?.description || 'Study material for this topic',
        type: resType,
        resource_type: cr.resource_type || cr.type || 'NOTE',
        subject: cr.subject || matchedCtx?.subject || activeSubject?.name || 'Medical',
        subjectName: cr.subjectName || matchedCtx?.subjectName || cr.subject || activeSubject?.name || 'Medical',
        subject_id: cr.subject_id || cr.subjectId || matchedCtx?.courseId || activeSubject?.id,
        chapter_id: cr.chapter_id || cr.chapterId || matchedCtx?.chapterId,
        topic_id: topicId || matchedCtx?.topicId,
        topicId: topicId || matchedCtx?.topicId,
        fileName: fn,
        mimeType: cleanMime,
        fileData: fileData,
        readingContent: cr.readingContent || matchedCtx?.readingContent,
        storagePath: cr.storagePath || cr.file?.storage_path || matchedCtx?.storagePath,
        signedUrl: cr.signedUrl || matchedCtx?.signedUrl,
        sizeFormatted: cr.sizeFormatted || cr.size || (cr.file?.file_size ? formatFileSize(cr.file.file_size) : matchedCtx?.size || 'File'),
        size: cr.size || cr.sizeFormatted || matchedCtx?.size || 'File',
        creatorName: cr.creatorName || cr.uploaderName || matchedCtx?.uploaderName || 'Faculty',
        uploaderName: cr.uploaderName || cr.creatorName || matchedCtx?.uploaderName || 'Faculty',
        date: cr.date || cr.created_at?.split('T')[0] || matchedCtx?.date || new Date().toISOString().split('T')[0],
      });
    });

    (contextResources || []).forEach((ctxR: any) => {
      const topicId = ctxR.topicId || (ctxR as any).topic_id;
      const titleKey = (ctxR.title && topicId) ? `${ctxR.title.trim().toLowerCase()}_${topicId}` : null;
      if (!seen.has(ctxR.id) && (!titleKey || !seen.has(titleKey))) {
        seen.add(ctxR.id);
        if (titleKey) seen.add(titleKey);
        const fn = ctxR.fileName || ctxR.title || 'study_material.pdf';
        const cleanMime = getCleanMimeType(fn, ctxR.mimeType, ctxR.type);
        list.push({
          ...ctxR,
          id: ctxR.id,
          title: ctxR.title,
          description: ctxR.description || `${ctxR.subject} study material`,
          type: (ctxR.type || 'NOTE').toLowerCase(),
          resource_type: ctxR.type?.toUpperCase() || 'NOTE',
          subject: ctxR.subject || activeSubject?.name || 'Medical',
          subjectName: ctxR.subject || activeSubject?.name || 'Medical',
          subject_id: ctxR.courseId || ctxR.subjectId || activeSubject?.id,
          chapter_id: ctxR.chapterId || null,
          topic_id: topicId || null,
          topicId: topicId || null,
          fileName: fn,
          mimeType: cleanMime,
          fileData: ctxR.fileData,
          readingContent: ctxR.readingContent,
          storagePath: ctxR.storagePath,
          signedUrl: ctxR.signedUrl,
          sizeFormatted: ctxR.size || 'File',
          size: ctxR.size || 'File',
          creatorName: ctxR.uploaderName || 'Faculty',
          uploaderName: ctxR.uploaderName || 'Faculty',
          date: ctxR.date || new Date().toISOString().split('T')[0],
        });
      }
    });

    return list;
  }, [cloudResources, contextResources, activeSubject]);

  // Materials matched to currently opened topic
  const topicMaterials = useMemo<any[]>(() => {
    if (!activeStudyTopic) return [];
    const tId = activeStudyTopic.topic.id;
    const tName = activeStudyTopic.topic.name.toLowerCase().trim();

    // STRICT: Only match materials explicitly uploaded or linked to this specific topic!
    // Never show default / fallback materials by ourselves.
    return allMaterials.filter((m: any) => {
      if (m.topic_id && m.topic_id === tId) return true;
      if (m.topicId && m.topicId === tId) return true;
      if (m.topicName && m.topicName.toLowerCase().trim() === tName) return true;
      return false;
    });
  }, [activeStudyTopic, allMaterials]);

  const handleCloseTopicModal = () => {
    setActiveStudyTopic(null);
    setShowUploadForm(false);
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadReadingContent('');
    setUploadError(null);
    setUploadSuccessMessage(null);
    try {
      sessionStorage.removeItem('lms_curriculum_active_topic');
      sessionStorage.removeItem('lms_curriculum_active_subject');
    } catch {}
  };

  const handleTopicClick = (
    topic: Topic,
    chapter: ChapterWithTopics,
    chapterIdx: number,
    topicIdx: number
  ) => {
    onSelectTopic?.(topic.id, topic.name);
    const topicState = {
      topic,
      chapter,
      chapterIdx,
      topicIdx,
    };
    setActiveStudyTopic(topicState);
    try {
      sessionStorage.setItem('lms_curriculum_active_topic', JSON.stringify(topicState));
      sessionStorage.setItem('lms_curriculum_active_subject', activeSubject?.id || activeSubjectId);
    } catch (e) {
      console.warn('Failed to save active topic to sessionStorage', e);
    }
  };

  const handleOpenMaterial = (material: any) => {
    const fn = material.fileName || material.file?.file_name || material.title || 'study_material.pdf';
    const cleanMime = getCleanMimeType(fn, material.mimeType || material.file?.mime_type, material.resource_type || material.type);
    const normalized = {
      ...material,
      id: material.id,
      title: material.title,
      fileName: fn,
      mimeType: cleanMime,
      type: (material.type || material.resource_type || (fn.toLowerCase().endsWith('.pdf') ? 'pdf' : fn.toLowerCase().endsWith('.docx') ? 'docx' : 'note')).toLowerCase(),
      fileData: material.fileData,
      readingContent: material.readingContent,
      storagePath: material.storagePath || material.storage_path || material.file?.storage_path,
      signedUrl: material.signedUrl,
      sizeFormatted: material.sizeFormatted || material.size,
      uploaderName: material.uploaderName || material.creatorName || 'Faculty',
      creatorName: material.creatorName || material.uploaderName || 'Faculty',
      subject: material.subject || material.subjectName || activeSubject?.name || 'Medical',
      subjectName: material.subjectName || material.subject || activeSubject?.name || 'Medical',
    };

    if (activeStudyTopic) {
      try {
        sessionStorage.setItem('lms_curriculum_active_topic', JSON.stringify(activeStudyTopic));
        sessionStorage.setItem('lms_curriculum_active_subject', activeSubject?.id || activeSubjectId);
      } catch (e) {
        console.warn('Failed to save active topic to sessionStorage', e);
      }
    }
    if (onNavigateToResource) {
      onNavigateToResource(normalized);
    } else {
      setSelectedPreviewResource(normalized);
    }
  };

  const handleDeleteMaterial = async (mat: any) => {
    if (!isAdmin) {
      alert('Only administrators can delete study materials from curriculum hierarchy.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${mat.title}" from this topic?`)) {
      return;
    }

    try {
      setIsDeletingId(mat.id);
      const storagePath = mat.storagePath || mat.storage_path || mat.file?.storage_path;
      // 1. Delete from Cloud / Supabase Storage via useResources
      if (deleteCloudResource) {
        await deleteCloudResource(mat.id, storagePath).catch((err) => {
          console.warn('[CurriculumBrowser] Cloud delete warning:', err);
        });
      }
      // 2. Delete from DataContext
      if (deleteContextResource) {
        deleteContextResource(mat.id);
      }
      setUploadSuccessMessage(`Successfully deleted "${mat.title}"`);
      setTimeout(() => setUploadSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[CurriculumBrowser] Error deleting material:', err);
      setUploadError(err?.message || 'Failed to delete study material');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!uploadTitle.trim()) {
      setUploadTitle(nameWithoutExt);
    }

    const fn = file.name.toLowerCase();
    const mime = (file.type || '').toLowerCase();
    if (fn.endsWith('.mp4') || fn.endsWith('.webm') || fn.endsWith('.mkv') || fn.endsWith('.mov') || fn.endsWith('.avi') || mime.startsWith('video/')) {
      setUploadResourceType('VIDEO');
    } else if (fn.endsWith('.docx') || fn.endsWith('.doc')) {
      setUploadResourceType('DOCX');
    } else if (fn.includes('pyq') || fn.includes('question') || fn.includes('exam')) {
      setUploadResourceType('PYQ');
    } else if (fn.includes('dpp') || fn.includes('practice') || fn.includes('drill')) {
      setUploadResourceType('DPP');
    } else {
      setUploadResourceType('NOTE');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadMaterials) {
      setUploadError('Students are not permitted to upload study materials.');
      return;
    }
    if (!uploadFile || uploadFile.size === 0) {
      setUploadError('Please select a valid, non-empty file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a title for the study material');
      return;
    }
    if (!activeStudyTopic) {
      setUploadError('No active topic selected');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Corrupt or unreadable file buffer'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file data'));
        reader.readAsDataURL(uploadFile);
      });

      if (!base64Data || base64Data.length < 10) {
        throw new Error('File data appears corrupted or empty.');
      }

      const topicId = activeStudyTopic.topic.id;
      const topicName = activeStudyTopic.topic.name;
      const chapterId = activeStudyTopic.chapter.id;
      const subjectId = activeSubject?.id || 'sub-bio';
      const subjectName = activeSubject?.name || 'Medical';
      const cleanFileName = uploadFile.name;
      const resType = uploadResourceType === 'DOCX' ? 'NOTE' : uploadResourceType;
      const mimeType = getCleanMimeType(cleanFileName, uploadFile.type, resType);
      const fileSize = uploadFile.size;

      // 1. Upload via useResources (cloud storage + local cache)
      const created = await uploadResource({
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || `Study material for ${topicName}`,
        resourceType: resType as any,
        subjectId,
        chapterId,
        topicId,
        status: 'PUBLISHED',
        file: uploadFile,
        fileName: cleanFileName,
        mimeType,
        fileSize,
        base64Data,
        readingContent: uploadReadingContent.trim() || undefined,
      });

      // 2. Sync to DataContext using the EXACT SAME ID to avoid creating a second/corrupt duplicate
      addResource({
        id: created.id,
        title: uploadTitle.trim(),
        type: (uploadResourceType === 'DOCX' ? 'docx' : resType).toLowerCase(),
        subject: subjectName,
        courseId: subjectId,
        uploaderId: user?.id || 'usr-faculty-1',
        uploaderName: user?.name || (isAdmin ? 'Admin' : 'Faculty'),
        size: formatFileSize(fileSize),
        status: 'published',
        examCategory: (activeSubject as any)?.examCategory || 'Medical',
        fileName: cleanFileName,
        fileData: base64Data,
        mimeType,
        storagePath: created.file?.storage_path,
        signedUrl: created.signedUrl || undefined,
        subjectId,
        chapterId,
        topicId,
        readingContent: uploadReadingContent.trim() || undefined,
      });

      // Clear the file input and state completely
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadReadingContent('');
      setShowUploadForm(false);
      setUploadSuccessMessage(`Successfully uploaded "${uploadTitle.trim()}"`);
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('[CurriculumBrowser] Error uploading study material:', err);
      setUploadError(err?.message || 'Failed to upload study material. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const [chapterMasteredMap, setChapterMasteredMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lms_mastered_chapters');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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
    const isNow = toggleChapterCompletion(
      chapterId,
      activeUser?.id,
      activeUser?.name,
      activeUser?.batch
    );
    const updated = { ...chapterMasteredMap, [chapterId]: isNow };
    setChapterMasteredMap(updated);
    try {
      localStorage.setItem('lms_mastered_chapters', JSON.stringify(updated));
    } catch {}

    if (isNow) {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#0f2b46', '#10b981', '#f59e0b', '#8b5cf6'],
      });
      setSuccessMessage('Chapter marked as completed! 🎉');
    } else {
      setSuccessMessage('Chapter marked as pending');
    }
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleToggleTopicCompletion = (topicId: string, topicName?: string) => {
    const isNow = toggleTopicCompletion(
      topicId,
      activeUser?.id,
      activeUser?.name,
      activeUser?.batch
    );
    if (isNow) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#10b981', '#3b82f6'],
      });
      setSuccessMessage(`Topic "${topicName || 'Topic'}" marked as completed! 🎉`);
    } else {
      setSuccessMessage(`Topic "${topicName || 'Topic'}" marked as pending`);
    }
    setTimeout(() => setSuccessMessage(null), 2500);
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
            const isMastered = isChapterCompleted(chapter.id, activeUser?.id) || !!chapterMasteredMap[chapter.id];
            const chapterStudents = getChapterCompletions(chapter.id);

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

                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!isFacultyOrAdmin ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMasterChapter(chapter.id);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition flex items-center gap-1 border shadow-2xs ${
                          isMastered
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-700 border-gray-300'
                        }`}
                        title={isMastered ? "Chapter completed! Click to unmark" : "Mark chapter as completed"}
                      >
                        <i className={`fas ${isMastered ? 'fa-check-circle' : 'fa-circle-check'} text-[9px]`} />
                        <span>{isMastered ? 'Completed' : 'Mark As Completed'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingCompletionsModal({
                            title: `Chapter: ${chapter.name}`,
                            type: 'Chapter',
                            students: chapterStudents,
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full transition flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200"
                        title="Click to view students who completed this chapter"
                      >
                        <i className="fas fa-user-check text-[9px]" />
                        <span>{chapterStudents.length} Studied</span>
                      </button>
                    )}

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
                      chapter.topics.map((topic, tIdx) => {
                        const isTopicDone = isTopicCompleted(topic.id, activeUser?.id);
                        const topicStudents = getTopicCompletions(topic.id);
                        return (
                        <div
                          key={topic.id}
                          onClick={() => handleTopicClick(topic, chapter, idx, tIdx)}
                          className={`p-2 rounded-lg bg-white border border-gray-100 flex items-center justify-between text-left transition ${
                            onSelectTopic ? 'hover:border-teal-300 cursor-pointer shadow-2xs' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <span className="text-[10px] text-teal-600 font-bold mt-0.5">
                              {idx + 1}.{tIdx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-700 truncate">{topic.name}</p>
                              {topic.description && (
                                <p className="text-[10px] text-gray-400 line-clamp-1">{topic.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {!isFacultyOrAdmin ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTopicCompletion(topic.id, topic.name);
                                }}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition flex items-center gap-1 border shadow-2xs ${
                                  isTopicDone
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300'
                                }`}
                                title={isTopicDone ? "Topic completed! Click to unmark" : "Mark this topic as completed"}
                              >
                                <i className={`fas ${isTopicDone ? 'fa-check' : 'fa-circle'} text-[8px]`} />
                                <span>{isTopicDone ? 'Completed' : 'Mark As Completed'}</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingCompletionsModal({
                                    title: `Topic: ${topic.name}`,
                                    type: 'Topic',
                                    students: topicStudents,
                                  });
                                }}
                                className="text-[9px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded flex items-center gap-1"
                                title="Click to view students who studied this topic"
                              >
                                <i className="fas fa-user-check text-[8px]" />
                                <span>{topicStudents.length} Studied</span>
                              </button>
                            )}

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
                      );
                      })
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
                                handleTopicClick(t, activeStudyChapter.chapter, activeStudyChapter.idx, tIdx);
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
                      isChapterCompleted(activeStudyChapter.chapter.id, activeUser?.id) || chapterMasteredMap[activeStudyChapter.chapter.id]
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <i className={`fas ${isChapterCompleted(activeStudyChapter.chapter.id, activeUser?.id) || chapterMasteredMap[activeStudyChapter.chapter.id] ? 'fa-check-circle' : 'fa-award'}`} />
                    <span>
                      {isChapterCompleted(activeStudyChapter.chapter.id, activeUser?.id) || chapterMasteredMap[activeStudyChapter.chapter.id] ? 'Chapter Completed (Click to Toggle)' : 'Mark As Completed'}
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

      {/* Topic Details & Uploaded Study Materials Modal */}
      <AnimatePresence>
        {activeStudyTopic && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={handleCloseTopicModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-[395px] w-full max-h-[85vh] sm:max-h-[82dvh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="gradient-header p-4 text-white relative shrink-0">
                <button
                  onClick={handleCloseTopicModal}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition"
                  aria-label="Close"
                >
                  <i className="fas fa-times" />
                </button>

                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="badge bg-teal-400/30 text-teal-200 text-[10px] font-bold py-0.5 px-2 rounded-full border border-teal-400/30">
                    {activeSubject?.name} • Topic {activeStudyTopic.chapterIdx + 1}.{activeStudyTopic.topicIdx + 1}
                  </span>
                  <span className="badge bg-white/20 text-white text-[10px] font-bold py-0.5 px-2 rounded-full">
                    Chapter {activeStudyTopic.chapterIdx + 1}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-white leading-tight">
                  {activeStudyTopic.topic.name}
                </h2>
                <p className="text-teal-100 text-xs mt-0.5 leading-snug">
                  {activeStudyTopic.chapter.name}
                </p>
              </div>
              <div className="italy-accent shrink-0"><div className="green" /><div className="white" /><div className="red" /></div>

              {/* Modal Scrollable Body */}
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto overscroll-contain">
                {/* About This Topic Card */}
                <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-3">
                  <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
                    <i className="fas fa-book-open text-teal-600" />
                    <span>About this Topic & Core Concepts</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2 break-words">
                    {activeStudyTopic.topic.description ||
                      `Key clinical objectives, high-yield examination pearls, and fundamental mechanisms for ${activeStudyTopic.topic.name}.`}
                  </p>
                  <div className="pt-2 border-t border-teal-200/60 text-[11px] text-teal-800 bg-white/70 p-2 rounded-lg flex items-start gap-1.5">
                    <i className="fas fa-microscope text-teal-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-teal-950">Clinical Scope:</p>
                      <p className="break-words">
                        High-yield medical focus for competitive entrance (NEET, IMAT, UCAT). Review associated lecture handouts and question drills below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Study Materials Section */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-1.5">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wider min-w-0">
                      <i className="fas fa-file-medical text-teal-600" />
                      <span className="truncate">Study Materials ({topicMaterials.length})</span>
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {canUploadMaterials && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUploadForm((prev: boolean) => !prev);
                            setUploadError(null);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs ${
                            showUploadForm
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          <i className={`fas ${showUploadForm ? 'fa-times' : 'fa-plus'} text-[9px]`} />
                          <span>{showUploadForm ? 'Cancel' : 'Upload Material'}</span>
                        </button>
                      )}
                      <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200 shrink-0">
                        DRM
                      </span>
                    </div>
                  </div>

                  {/* Feedback Banners */}
                  {uploadSuccessMessage && (
                    <div className="mb-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px] flex-1">{uploadSuccessMessage}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mb-2.5 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <i className="fas fa-exclamation-circle text-red-600 shrink-0" />
                      <span className="font-medium text-[11px] flex-1">{uploadError}</span>
                    </div>
                  )}

                  {/* Upload Form Card */}
                  {showUploadForm && (
                    <form onSubmit={handleUploadSubmit} className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2.5 mb-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-teal-200/60">
                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                          <i className="fas fa-cloud-upload-alt text-teal-600" />
                          <span>Upload Study Material</span>
                        </span>
                        <span className="text-[9px] text-teal-700 bg-white px-1.5 py-0.5 rounded-md border border-teal-200 font-semibold">
                          Multiple Formats
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.webm,.mkv,.mov,.avi,.png,.jpg,.jpeg,.gif,.webp,.svg,.txt,.md,.zip"
                        onChange={handleFileChange}
                      />

                      {/* File Dropzone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3 border-2 border-dashed rounded-xl cursor-pointer text-center transition flex flex-col items-center justify-center gap-1 ${
                          uploadFile ? 'border-teal-500 bg-white shadow-2xs' : 'border-teal-300 hover:border-teal-500 bg-white/80'
                        }`}
                      >
                        {uploadFile ? (
                          <div className="w-full flex items-center justify-between gap-2 text-left">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-lg ${getFormatInfo({ fileName: uploadFile.name, mimeType: uploadFile.type }).bg} flex items-center justify-center shrink-0`}>
                                <i className={`fas ${getFormatInfo({ fileName: uploadFile.name, mimeType: uploadFile.type }).icon} text-sm`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-800 truncate">{uploadFile.name}</p>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                  <span>{formatFileSize(uploadFile.size)}</span>
                                  <span>•</span>
                                  <span className="font-bold uppercase text-teal-700">
                                    {getFormatInfo({ fileName: uploadFile.name, mimeType: uploadFile.type }).badge}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-teal-50 rounded border border-teal-200 hover:bg-teal-100 shrink-0"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt text-teal-500 text-xl" />
                            <p className="text-xs font-bold text-gray-700">Select Study Material</p>
                            <p className="text-[10px] text-gray-500">
                              PDF, Video (MP4), DOCX, PPTX, Images, Text
                            </p>
                          </>
                        )}
                      </div>

                      {/* Title Field */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Material Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="e.g. Clinical Mechanism Lecture Notes"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-teal-500 text-gray-800"
                        />
                      </div>

                      {/* Format / Type Field */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Format Category</label>
                          <select
                            value={uploadResourceType}
                            onChange={(e) => setUploadResourceType(e.target.value as any)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-teal-500 text-gray-800"
                          >
                            <option value="NOTE">Clinical Notes / PDF</option>
                            <option value="VIDEO">Video Lecture / Clip</option>
                            <option value="DOCX">Word Document (.docx)</option>
                            <option value="BOOK">Textbook / Chapter</option>
                            <option value="DPP">Practice Drill / DPP</option>
                            <option value="PYQ">Past Exam Paper / PYQ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">Selected Topic</label>
                          <input
                            type="text"
                            disabled
                            value={activeStudyTopic.topic.name}
                            className="w-full px-2 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-lg text-gray-500 truncate"
                          />
                        </div>
                      </div>

                      {/* Document Reading Section Contents */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Document Reading Section Contents (Specific to this document)
                        </label>
                        <textarea
                          rows={3}
                          value={uploadReadingContent}
                          onChange={(e) => setUploadReadingContent(e.target.value)}
                          placeholder="Provide specific notes, chapter excerpts, formula derivations, key concepts or clinical summaries for this document..."
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-teal-500 text-gray-800 resize-none"
                        />
                      </div>

                      {/* Optional Description */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                          Description / Clinical Scope (Optional)
                        </label>
                        <input
                          type="text"
                          value={uploadDescription}
                          onChange={(e) => setUploadDescription(e.target.value)}
                          placeholder="e.g. High-yield summary for NEET preparation"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-teal-500 text-gray-800"
                        />
                      </div>

                      {/* Submit Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowUploadForm(false)}
                          className="flex-1 py-1.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading || !uploadFile}
                          className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          {isUploading ? (
                            <>
                              <i className="fas fa-spinner fa-spin text-xs" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt text-xs" />
                              <span>Upload Material</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Materials List or Empty State */}
                  {topicMaterials.length === 0 && !showUploadForm ? (
                    <div className="text-center py-6 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl space-y-2">
                      <i className="fas fa-folder-open text-gray-300 text-2xl" />
                      <p className="text-xs font-semibold text-gray-700">No Study Materials Uploaded Yet</p>
                      <p className="text-[10px] text-gray-400">
                        {canUploadMaterials
                          ? 'Upload study materials for this topic in different formats (PDF, Videos, DOCX, and other formats).'
                          : 'Faculty will upload supplementary lecture notes, diagrams, and video walkthroughs for this topic soon.'}
                      </p>
                      {canUploadMaterials && (
                        <button
                          type="button"
                          onClick={() => setShowUploadForm(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          <i className="fas fa-cloud-upload-alt text-xs" />
                          <span>Upload Study Material</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topicMaterials.map((mat: any) => {
                        const fmt = getFormatInfo(mat);
                        return (
                          <div
                            key={mat.id}
                            className="p-3 bg-white hover:bg-teal-50/40 border border-gray-200 rounded-xl transition flex items-center justify-between gap-2.5 shadow-2xs"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-lg ${fmt.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                <i className={`fas ${fmt.icon} text-sm`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-800 leading-snug break-words">
                                  {mat.title}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span>{mat.sizeFormatted || mat.size || (mat.file?.file_size ? formatFileSize(mat.file.file_size) : 'File')}</span>
                                  <span>•</span>
                                  <span className={`font-semibold uppercase ${fmt.color}`}>{fmt.badge}</span>
                                  {mat.creatorName && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[100px]">{mat.creatorName}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenMaterial(mat)}
                                className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-xs"
                              >
                                <span>Study</span>
                                <i className="fas fa-external-link-alt text-[9px]" />
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMaterial(mat);
                                  }}
                                  disabled={isDeletingId === mat.id}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-rose-200/60"
                                  title="Delete uploaded material"
                                  aria-label="Delete material"
                                >
                                  <i className={`fas ${isDeletingId === mat.id ? 'fa-spinner fa-spin text-rose-500' : 'fa-trash-alt'} text-xs`} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                <button
                  onClick={() => handleToggleTopicCompletion(activeStudyTopic.topic.id, activeStudyTopic.topic.name)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                    isTopicCompleted(activeStudyTopic.topic.id, activeUser?.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <i className={`fas ${isTopicCompleted(activeStudyTopic.topic.id, activeUser?.id) ? 'fa-check-circle' : 'fa-award'}`} />
                  <span>
                    {isTopicCompleted(activeStudyTopic.topic.id, activeUser?.id) ? 'Topic Completed (Click to Toggle)' : 'Mark As Completed'}
                  </span>
                </button>
                <button
                  onClick={handleCloseTopicModal}
                  className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition text-center"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fallback In-App Study Material Preview Modal */}
      <AnimatePresence>
        {selectedPreviewResource && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedPreviewResource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-[395px] w-full p-4 shadow-2xl border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-lg ${getFormatInfo(selectedPreviewResource).bg} flex items-center justify-center shrink-0`}>
                    <i className={`fas ${getFormatInfo(selectedPreviewResource).icon} text-sm`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{selectedPreviewResource.title}</h3>
                    <p className={`text-[10px] font-bold uppercase ${getFormatInfo(selectedPreviewResource).color}`}>
                      {getFormatInfo(selectedPreviewResource).badge} • DRM PROTECTED
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedPreviewResource(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>File Format:</span>
                  <span className="font-semibold text-gray-800 uppercase">{getFormatInfo(selectedPreviewResource).badge}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Name:</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[180px]">{selectedPreviewResource.fileName || selectedPreviewResource.file?.file_name || selectedPreviewResource.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Author / Faculty:</span>
                  <span className="font-semibold text-gray-800">{selectedPreviewResource.creatorName || selectedPreviewResource.uploaderName || 'Faculty'}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="font-semibold text-gray-800">{selectedPreviewResource.sizeFormatted || selectedPreviewResource.size || '3.5 MB'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protection:</span>
                  <span className="font-semibold text-teal-700">Watermark Protected (DRM)</span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => setSelectedPreviewResource(null)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-xs text-center"
                >
                  Done Reviewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Study Completion Inspector Modal (Faculty & Admin) */}
      <AnimatePresence>
        {viewingCompletionsModal && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
            onClick={() => setViewingCompletionsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-[380px] w-full p-4 shadow-xl border border-gray-200 space-y-3"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {viewingCompletionsModal.type} Completion Record
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">
                    {viewingCompletionsModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingCompletionsModal(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs"
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              <div className="max-h-[260px] overflow-y-auto space-y-2">
                {viewingCompletionsModal.students.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <i className="fas fa-user-clock text-2xl mb-1 text-gray-300" />
                    <p className="text-xs">No students have marked this {viewingCompletionsModal.type.toLowerCase()} as completed yet.</p>
                  </div>
                ) : (
                  viewingCompletionsModal.students.map((st) => (
                    <div key={st.studentId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                          {st.avatar || '👩‍🎓'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{st.studentName}</p>
                          <span className="text-[10px] text-teal-600 font-semibold">{st.studentBatch}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <i className="fas fa-check-circle text-[9px]" />
                        <span>Studied</span>
                      </span>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setViewingCompletionsModal(null)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}