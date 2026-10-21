import type {
  LearningResource,
  LearningResourceInsert,
  LearningResourceUpdate,
  ResourceFile,
  ResourceFileInsert,
  ResourceType,
  ContentStatus,
} from '../../types/database';

export type { ResourceType, ContentStatus, LearningResource, ResourceFile };

export interface ResourceFileMetadata {
  id: string;
  resourceId: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface ResourceWithFile extends LearningResource {
  file?: ResourceFile | null;
  signedUrl?: string | null;
  creatorName?: string | null;
  subjectName?: string | null;
  chapterName?: string | null;
  topicName?: string | null;
  // UI and backward compatibility helpers:
  sizeFormatted?: string;
  fileData?: string;
}

export interface ResourceFilter {
  subjectId?: string;
  subjectCode?: string;
  chapterId?: string;
  topicId?: string;
  resourceType?: ResourceType | 'ALL';
  status?: ContentStatus | 'ALL';
  search?: string;
  createdBy?: string;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  resourceType: ResourceType;
  subjectId: string;
  chapterId?: string | null;
  topicId?: string | null;
  status?: ContentStatus;
  file: File | Blob;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  // Fallback Base64 for offline mode if file cannot be stored in cloud
  base64Data?: string;
}

export interface StorageUploadResult {
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  signedUrl?: string;
}

/**
 * Maps legacy UI resource types ('PDF', 'Video', 'Notes', 'Assignment', etc.)
 * to database enum ResourceType ('NOTE', 'BOOK', 'DPP', 'PYQ', 'VIDEO')
 */
export function normalizeResourceType(type: string): ResourceType {
  const upper = (type || '').trim().toUpperCase();
  if (upper === 'VIDEO' || upper.startsWith('VID')) return 'VIDEO';
  if (upper === 'DPP' || upper === 'PRACTICE' || upper === 'ASSIGNMENT') return 'DPP';
  if (upper === 'PYQ' || upper === 'Q.PAPER' || upper.includes('PAST')) return 'PYQ';
  if (upper === 'BOOK' || upper === 'SYLLABUS') return 'BOOK';
  return 'NOTE';
}

/**
 * Formats byte size into human readable string (e.g. "4.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[Math.min(i, units.length - 1)];
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${unit}`;
}
