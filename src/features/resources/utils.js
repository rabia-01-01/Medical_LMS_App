/**
 * Resource Utility Functions for Phase 4 (Learning Resources & Storage)
 * Pure JavaScript module for universal Node and browser execution.
 */

/**
 * Maps legacy UI resource types ('PDF', 'Video', 'Notes', 'Assignment', 'Syllabus', etc.)
 * to database enum ResourceType ('NOTE', 'BOOK', 'DPP', 'PYQ', 'VIDEO')
 *
 * @param {string} type - Input resource type
 * @returns {'NOTE' | 'BOOK' | 'DPP' | 'PYQ' | 'VIDEO'} Normalized ResourceType
 */
export function normalizeResourceType(type) {
  const upper = (type || '').trim().toUpperCase();
  if (upper === 'VIDEO' || upper.startsWith('VID')) return 'VIDEO';
  if (upper === 'DPP' || upper === 'PRACTICE' || upper === 'ASSIGNMENT') return 'DPP';
  if (upper === 'PYQ' || upper === 'Q.PAPER' || upper.includes('PAST')) return 'PYQ';
  if (upper === 'BOOK' || upper === 'SYLLABUS') return 'BOOK';
  return 'NOTE';
}

/**
 * Formats byte size into human readable string (e.g. "4.2 MB", "500 B")
 *
 * @param {number} bytes - Number of bytes
 * @returns {string} Human readable formatted string
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[Math.min(i, units.length - 1)];
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${unit}`;
}

/**
 * Deduplicates and unifies cloud resources (Supabase) and local context resources (DataContext).
 * Guarantees zero duplicate documents across all screens:
 * - Collapses matches by id, storagePath, or (title + fileName).
 * - Preserves richer metadata (e.g. subject, date, readingContent, size).
 * - Ensures normalized fields: type, subject, date, uploaderName.
 */
export function deduplicateAndMergeResources(cloudResources = [], localResources = []) {
  const mergedMap = new Map();
  const seenKeys = new Map(); // secondaryKey -> primaryKey

  function getSecondaryKey(item) {
    const rawTitle = (item.title || '').trim().toLowerCase();
    const rawFile = (item.fileName || item.file?.file_name || item.storagePath || '').replace(/^.*[\\\/]/, '').replace(/^\d+_/, '').trim().toLowerCase();
    return `${rawTitle}___${rawFile}`;
  }

  function mergeItems(target, incoming) {
    if (!target.subject || target.subject === 'General') {
      if (incoming.subject && incoming.subject !== 'General') target.subject = incoming.subject;
      else if (incoming.subjectName && incoming.subjectName !== 'General') target.subject = incoming.subjectName;
    }
    if (!target.readingContent && incoming.readingContent) target.readingContent = incoming.readingContent;
    if (!target.fileData && incoming.fileData) target.fileData = incoming.fileData;
    if (!target.signedUrl && incoming.signedUrl) target.signedUrl = incoming.signedUrl;
    if (!target.storagePath && (incoming.storagePath || incoming.file?.storage_path)) {
      target.storagePath = incoming.storagePath || incoming.file?.storage_path;
      target.isCloud = true;
    }
    if ((!target.size || target.size === 'Cloud') && incoming.size && incoming.size !== 'Cloud') {
      target.size = incoming.size;
    }
    if (incoming.courseId && !target.courseId) target.courseId = incoming.courseId;
    if (incoming.chapterId && !target.chapterId) target.chapterId = incoming.chapterId;
    if (incoming.batch && target.batch === 'Batch 1 (Dec)') target.batch = incoming.batch;
    if (!target.date || target.date === 'Recent') {
      target.date = incoming.date || incoming.created_at?.split('T')[0] || target.date;
    }
  }

  // 1. Process cloud resources
  for (const cr of cloudResources) {
    if (!cr) continue;
    const mappedType =
      cr.resource_type === 'NOTE' ? 'Notes' :
      cr.resource_type === 'VIDEO' ? 'Video' :
      cr.resource_type === 'PYQ' ? 'PYQ' :
      cr.resource_type === 'DPP' ? 'Assignment' : 'PDF';

    const normalized = {
      id: cr.id,
      title: cr.title,
      type: cr.type || mappedType,
      subject: cr.subject || cr.subjectName || (cr.description && cr.description.includes('•') ? cr.description.split('•')[1].trim() : 'General'),
      courseId: cr.subject_id || cr.courseId,
      subjectId: cr.subject_id || cr.subjectId,
      chapterId: cr.chapter_id || cr.chapterId,
      topicId: cr.topic_id || cr.topicId,
      topic_id: cr.topic_id || cr.topicId,
      description: cr.description,
      batch: cr.batch || 'All',
      uploaderId: cr.created_by || cr.uploaderId,
      uploaderName: cr.creatorName || cr.uploaderName || 'Faculty',
      date: cr.date || cr.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      size: cr.sizeFormatted || cr.size || 'Cloud',
      status: (cr.status === 'PUBLISHED' || cr.status === 'published') ? 'published' : (cr.status?.toLowerCase() || 'published'),
      examCategory: cr.examCategory || 'Medical',
      fileName: cr.file?.file_name || cr.fileName || 'document.pdf',
      storagePath: cr.file?.storage_path || cr.storagePath,
      signedUrl: cr.signedUrl,
      fileData: cr.fileData,
      readingContent: cr.readingContent,
      isCloud: !!(cr.file?.storage_path || cr.storagePath),
      topicMaterialOnly: cr.topicMaterialOnly,
    };

    const secKey = getSecondaryKey(normalized);
    if (seenKeys.has(secKey)) {
      const existingId = seenKeys.get(secKey);
      const existing = mergedMap.get(existingId);
      if (existing) mergeItems(existing, normalized);
    } else {
      mergedMap.set(normalized.id, normalized);
      seenKeys.set(secKey, normalized.id);
      if (normalized.storagePath) {
        seenKeys.set(`path___${normalized.storagePath}`, normalized.id);
      }
    }
  }

  // 2. Process local context resources
  for (const lr of localResources) {
    if (!lr) continue;
    const normalized = {
      ...lr,
      type: lr.type || 'PDF',
      subject: lr.subject || 'General',
      date: lr.date || new Date().toISOString().split('T')[0],
      batch: lr.batch || 'All',
      isCloud: !!(lr.storagePath || lr.isCloud),
    };

    const secKey = getSecondaryKey(normalized);
    const pathKey = normalized.storagePath ? `path___${normalized.storagePath}` : '';

    let matchedId;
    if (mergedMap.has(normalized.id)) {
      matchedId = normalized.id;
    } else if (pathKey && seenKeys.has(pathKey)) {
      matchedId = seenKeys.get(pathKey);
    } else if (seenKeys.has(secKey)) {
      matchedId = seenKeys.get(secKey);
    }

    if (matchedId && mergedMap.has(matchedId)) {
      const existing = mergedMap.get(matchedId);
      mergeItems(existing, normalized);
    } else {
      mergedMap.set(normalized.id, normalized);
      seenKeys.set(secKey, normalized.id);
      if (pathKey) seenKeys.set(pathKey, normalized.id);
    }
  }

  return Array.from(mergedMap.values());
}
