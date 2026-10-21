import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type {
  CreateResourceInput,
  ResourceFilter,
  ResourceWithFile,
  ResourceType,
  ContentStatus,
} from './types';
import { formatFileSize } from './types';

export const STORAGE_BUCKET = 'resources';
const LOCAL_STORAGE_KEY = 'lms_resources_cache_v2';

// Seed mock resources for demo/offline fallback
const SEED_RESOURCES: ResourceWithFile[] = [
  {
    id: 'seed-res-1',
    title: 'High-Yield Human Physiology Notes (NEET UG)',
    description: 'Concise summary of cardiovascular and respiratory systems with clinical diagrams.',
    resource_type: 'NOTE',
    subject_id: 'sub-bio',
    chapter_id: 'chap-human-physio',
    topic_id: null,
    created_by: 'seed-faculty-1',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Human Physiology',
    creatorName: 'Dr. Sharma',
    sizeFormatted: '4.8 MB',
    file: {
      id: 'seed-file-1',
      resource_id: 'seed-res-1',
      storage_path: 'biology/human-physio/human_physio_notes.pdf',
      file_name: 'human_physio_notes.pdf',
      mime_type: 'application/pdf',
      file_size: 5033164,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'seed-res-2',
    title: 'Electrodynamics & Magnetism Formula Sheet',
    description: 'Master formula sheet with solved examples for competitive medical entrance.',
    resource_type: 'NOTE',
    subject_id: 'sub-phy',
    chapter_id: 'chap-electrodyn',
    topic_id: null,
    created_by: 'seed-faculty-1',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    subjectName: 'Physics',
    chapterName: 'Electrodynamics',
    creatorName: 'Prof. Verma',
    sizeFormatted: '2.4 MB',
    file: {
      id: 'seed-file-2',
      resource_id: 'seed-res-2',
      storage_path: 'physics/electrodynamics/electrodynamics_formulas.pdf',
      file_name: 'electrodynamics_formulas.pdf',
      mime_type: 'application/pdf',
      file_size: 2516582,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'seed-res-3',
    title: 'Organic Chemistry Reaction Mechanisms (PYQ Drill)',
    description: 'Complete 10-year compiled previous year question bank with step-by-step mechanisms.',
    resource_type: 'PYQ',
    subject_id: 'sub-chem',
    chapter_id: 'chap-organic',
    topic_id: null,
    created_by: 'seed-faculty-2',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    subjectName: 'Chemistry',
    chapterName: 'Organic Chemistry',
    creatorName: 'Dr. Mukherjee',
    sizeFormatted: '6.1 MB',
    file: {
      id: 'seed-file-3',
      resource_id: 'seed-res-3',
      storage_path: 'chemistry/organic/pyq_organic_reactions.pdf',
      file_name: 'pyq_organic_reactions.pdf',
      mime_type: 'application/pdf',
      file_size: 6396313,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'seed-res-4',
    title: 'Cell Division (Mitosis & Meiosis) 3D Animation',
    description: 'Visual walkthrough of chromosome segregation in high definition.',
    resource_type: 'VIDEO',
    subject_id: 'sub-bio',
    chapter_id: 'chap-cell-bio',
    topic_id: null,
    created_by: 'seed-faculty-1',
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    subjectName: 'Biology',
    chapterName: 'Cell Biology',
    creatorName: 'Dr. Sharma',
    sizeFormatted: '45.0 MB',
    file: {
      id: 'seed-file-4',
      resource_id: 'seed-res-4',
      storage_path: 'biology/cell-biology/cell_division_animation.mp4',
      file_name: 'cell_division_animation.mp4',
      mime_type: 'video/mp4',
      file_size: 47185920,
      created_at: new Date().toISOString(),
    },
  },
];

// Offline Local Cache Helpers
function loadLocalResources(): ResourceWithFile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[resourceService] Failed to load local resources:', err);
  }
  return SEED_RESOURCES;
}

function saveLocalResources(items: ResourceWithFile[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[resourceService] Failed to save local resources:', err);
  }
}

/**
 * Uploads a raw binary File or Blob to Supabase Storage bucket ('resources').
 */
export async function uploadFileToStorage(
  file: File | Blob,
  storagePath: string,
  mimeType?: string
): Promise<{ storagePath: string; error: string | null }> {
  if (!isSupabaseConfigured()) {
    console.info('[resourceService] Running offline: storage upload simulated.');
    return { storagePath, error: null };
  }

  try {
    const contentType = mimeType || (file instanceof File ? file.type : 'application/octet-stream');
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('[resourceService] Storage upload failed:', error.message);
      return { storagePath, error: error.message };
    }

    return { storagePath: data?.path || storagePath, error: null };
  } catch (err: any) {
    console.error('[resourceService] Storage exception:', err);
    return { storagePath, error: err.message || 'Unknown storage error' };
  }
}

/**
 * Generates a temporary signed URL for a private file in Supabase Storage.
 * Valid for `expiresIn` seconds (default: 3600 = 1 hour).
 */
export async function getSignedResourceUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  if (!storagePath) return null;

  if (storagePath.startsWith('blob:') || storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.warn(`[resourceService] Could not generate signed URL for "${storagePath}":`, error.message);
      return null;
    }

    return data?.signedUrl || null;
  } catch (err) {
    console.error('[resourceService] Error getting signed URL:', err);
    return null;
  }
}

/**
 * Deletes a file from Supabase Storage bucket.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !storagePath) return true;

  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (error) {
      console.warn('[resourceService] Delete from storage failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[resourceService] Error deleting file from storage:', err);
    return false;
  }
}

/**
 * Downloads a resource directly to the browser.
 */
export async function downloadResourceFile(
  storagePath: string,
  fileName: string,
  mimeType = 'application/octet-stream',
  fallbackBase64?: string
): Promise<void> {
  // If fallback Base64 is provided and we are offline, trigger base64 download
  if (fallbackBase64 && (!isSupabaseConfigured() || !storagePath)) {
    const base64Data = fallbackBase64.includes(',') ? fallbackBase64.split(',')[1] : fallbackBase64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    // Try signed URL download first
    const signedUrl = await getSignedResourceUrl(storagePath, 300);
    if (signedUrl) {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // Try direct storage client download
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(storagePath);
      if (error) throw error;
      if (data) {
        const blobUrl = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    }
  } catch (err) {
    console.error('[resourceService] Download failed:', err);
    throw new Error('Failed to download resource file.');
  }
}

/**
 * Creates a new learning resource:
 * 1. Uploads file to Supabase Storage bucket 'resources'
 * 2. Inserts metadata into PostgreSQL 'resources' table
 * 3. Inserts file record into PostgreSQL 'resource_files' table
 * 4. Gracefully falls back to local storage if offline
 */
export async function createResource(
  input: CreateResourceInput,
  createdByProfileId: string,
  creatorName = 'Faculty'
): Promise<ResourceWithFile> {
  const cleanFileName = input.fileName || (input.file instanceof File ? input.file.name : 'document.pdf');
  const safeFileName = cleanFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const mimeType = input.mimeType || (input.file instanceof File ? input.file.type : 'application/pdf');
  const fileSize = input.fileSize || (input.file instanceof File ? input.file.size : 0);
  const subjectSlug = input.subjectId || 'general';
  const chapterSlug = input.chapterId || 'general';
  const storagePath = `${subjectSlug}/${chapterSlug}/${Date.now()}_${safeFileName}`;

  const resourceId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fileId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (isSupabaseConfigured()) {
    try {
      // 1. Upload to Supabase Storage
      const uploadRes = await uploadFileToStorage(input.file, storagePath, mimeType);
      if (uploadRes.error) {
        console.warn('[resourceService] Storage upload error, falling back to local metadata:', uploadRes.error);
      }

      // 2. Insert into PostgreSQL 'resources'
      const { data: resRow, error: resError } = await supabase
        .from('resources')
        .insert({
          id: resourceId,
          title: input.title,
          description: input.description || null,
          resource_type: input.resourceType,
          subject_id: input.subjectId,
          chapter_id: input.chapterId || null,
          topic_id: input.topicId || null,
          created_by: createdByProfileId,
          status: input.status || 'PUBLISHED',
        })
        .select()
        .single();

      if (resError) {
        console.warn('[resourceService] PostgreSQL resources insert error:', resError.message);
        throw resError;
      }

      // 3. Insert into PostgreSQL 'resource_files'
      const { data: fileRow, error: fileError } = await supabase
        .from('resource_files')
        .insert({
          id: fileId,
          resource_id: resourceId,
          storage_path: storagePath,
          file_name: cleanFileName,
          mime_type: mimeType,
          file_size: fileSize,
        })
        .select()
        .single();

      if (fileError) {
        console.warn('[resourceService] PostgreSQL resource_files insert error:', fileError.message);
      }

      // 4. Fetch signed URL
      const signedUrl = await getSignedResourceUrl(storagePath, 3600);

      const created: ResourceWithFile = {
        ...resRow,
        file: fileRow || {
          id: fileId,
          resource_id: resourceId,
          storage_path: storagePath,
          file_name: cleanFileName,
          mime_type: mimeType,
          file_size: fileSize,
          created_at: new Date().toISOString(),
        },
        signedUrl,
        creatorName,
        sizeFormatted: formatFileSize(fileSize),
        fileData: input.base64Data,
      };

      // Also persist to local cache so offline view works seamlessly
      const local = loadLocalResources();
      saveLocalResources([created, ...local]);

      return created;
    } catch (err: any) {
      console.warn('[resourceService] Cloud creation failed, switching to local cache:', err.message);
    }
  }

  // Fallback: Local offline resource creation
  const fallbackResource: ResourceWithFile = {
    id: resourceId,
    title: input.title,
    description: input.description || null,
    resource_type: input.resourceType,
    subject_id: input.subjectId,
    chapter_id: input.chapterId || null,
    topic_id: input.topicId || null,
    created_by: createdByProfileId,
    status: input.status || 'PUBLISHED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creatorName,
    sizeFormatted: formatFileSize(fileSize),
    fileData: input.base64Data,
    file: {
      id: fileId,
      resource_id: resourceId,
      storage_path: storagePath,
      file_name: cleanFileName,
      mime_type: mimeType,
      file_size: fileSize,
      created_at: new Date().toISOString(),
    },
  };

  const local = loadLocalResources();
  saveLocalResources([fallbackResource, ...local]);
  return fallbackResource;
}

/**
 * Fetches all learning resources with attached file metadata.
 * Joins subject, chapter, topic, and creator profiles.
 */
export async function fetchResources(filter?: ResourceFilter): Promise<ResourceWithFile[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          resource_type,
          subject_id,
          chapter_id,
          topic_id,
          created_by,
          status,
          created_at,
          updated_at,
          resource_files (
            id,
            resource_id,
            storage_path,
            file_name,
            mime_type,
            file_size,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter?.status && filter.status !== 'ALL') {
        query = query.eq('status', filter.status);
      }
      if (filter?.subjectId) {
        query = query.eq('subject_id', filter.subjectId);
      }
      if (filter?.chapterId) {
        query = query.eq('chapter_id', filter.chapterId);
      }
      if (filter?.topicId) {
        query = query.eq('topic_id', filter.topicId);
      }
      if (filter?.resourceType && filter.resourceType !== 'ALL') {
        query = query.eq('resource_type', filter.resourceType);
      }
      if (filter?.createdBy) {
        query = query.eq('created_by', filter.createdBy);
      }
      if (filter?.search) {
        query = query.ilike('title', `%${filter.search}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Map database records into ResourceWithFile
        const mapped: ResourceWithFile[] = await Promise.all(
          data.map(async (row: any) => {
            const rawFiles = row.resource_files;
            const file = Array.isArray(rawFiles) && rawFiles.length > 0 ? rawFiles[0] : null;
            let signedUrl: string | null = null;
            if (file?.storage_path) {
              signedUrl = await getSignedResourceUrl(file.storage_path, 3600);
            }

            return {
              id: row.id,
              title: row.title,
              description: row.description,
              resource_type: row.resource_type,
              subject_id: row.subject_id,
              chapter_id: row.chapter_id,
              topic_id: row.topic_id,
              created_by: row.created_by,
              status: row.status,
              created_at: row.created_at,
              updated_at: row.updated_at,
              file: file || null,
              signedUrl,
              sizeFormatted: file?.file_size ? formatFileSize(file.file_size) : undefined,
            };
          })
        );

        return mapped;
      }
    } catch (err: any) {
      console.warn('[resourceService] Error fetching cloud resources, using fallback:', err.message);
    }
  }

  // Fallback: Local offline filter
  let results = loadLocalResources();

  if (filter?.status && filter.status !== 'ALL') {
    results = results.filter((r) => r.status === filter.status);
  }
  if (filter?.subjectId) {
    results = results.filter((r) => r.subject_id === filter.subjectId);
  }
  if (filter?.chapterId) {
    results = results.filter((r) => r.chapter_id === filter.chapterId);
  }
  if (filter?.topicId) {
    results = results.filter((r) => r.topic_id === filter.topicId);
  }
  if (filter?.resourceType && filter.resourceType !== 'ALL') {
    results = results.filter((r) => r.resource_type === filter.resourceType);
  }
  if (filter?.createdBy) {
    results = results.filter((r) => r.created_by === filter.createdBy);
  }
  if (filter?.search) {
    const s = filter.search.toLowerCase();
    results = results.filter((r) => r.title.toLowerCase().includes(s));
  }

  return results;
}

/**
 * Deletes a resource, its file records, and the binary file in Supabase Storage.
 */
export async function deleteResource(
  resourceId: string,
  storagePath?: string
): Promise<boolean> {
  // 1. Delete from Supabase Storage
  if (storagePath) {
    await deleteFileFromStorage(storagePath);
  }

  // 2. Delete from PostgreSQL
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('resources').delete().eq('id', resourceId);
      if (error) {
        console.warn('[resourceService] PostgreSQL delete resource error:', error.message);
      }
    } catch (err) {
      console.error('[resourceService] Error deleting resource:', err);
    }
  }

  // 3. Remove from local fallback cache
  const local = loadLocalResources();
  const updated = local.filter((r) => r.id !== resourceId);
  saveLocalResources(updated);

  return true;
}
