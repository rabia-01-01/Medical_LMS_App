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
