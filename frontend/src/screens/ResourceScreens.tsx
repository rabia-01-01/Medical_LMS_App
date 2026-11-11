import React, { useState, useMemo, useEffect } from 'react';
import { Header, AccessRestrictedScreen } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useData, hasResourceAccess } from '../context/DataContext';
import { useRbac } from '../hooks/useRbac';
import { EnrollStudentsModal } from '../components/EnrollStudentsModal';
import { CurriculumBrowser } from '../features/curriculum';
import { resourceService, useResources, DocumentProtectionWrapper, deduplicateAndMergeResources } from '../features/resources';

// Dedicated helper to resolve clean, non-downloading MIME types
export function getProperMimeType(fileName = '', type = '', rawMime = ''): string {
  const fn = (fileName || '').toLowerCase();
  const t = (type || '').toLowerCase();
  const m = (rawMime || '').toLowerCase();

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
  if (fn.endsWith('.txt') || fn.endsWith('.md') || fn.endsWith('.json') || fn.endsWith('.csv') || t === 'note' || t === 'notes') return 'text/plain';
  return 'application/pdf';
}

// Extract human-readable text from base64 document or docx zip buffer
function extractDocumentLines(fileData?: string, title?: string): string[] {
  if (!fileData) return [];
  try {
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const decoded = atob(base64Data);

    // If it's a docx XML payload
    if (decoded.includes('<w:t')) {
      const matches = decoded.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const paragraphs: string[] = [];
        let currentP = '';
        matches.forEach((m) => {
          const text = m.replace(/<[^>]+>/g, '').trim();
          if (text) {
            currentP += (currentP ? ' ' : '') + text;
            if (currentP.length > 90 || text.endsWith('.') || text.endsWith(':')) {
              paragraphs.push(currentP);
              currentP = '';
            }
          }
        });
        if (currentP) paragraphs.push(currentP);
        if (paragraphs.length > 0) return paragraphs;
      }
    }

    // Try decoding as clean UTF-8 text
    try {
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (text && !text.includes('\ufffd\ufffd')) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines.every(l => /^[ -~s]*$/.test(l.slice(0, 50)))) {
          return lines;
        }
      }
    } catch {}
  } catch (e) {
    console.warn('[ResourceScreens] Document line extraction failed:', e);
  }
  return [];
}

// Helper function to download base64 file
function downloadFile(fileData: string, fileName: string, mimeType: string) {
  try {
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const cleanType = (mimeType && mimeType !== 'application/octet-stream') ? mimeType : 'application/pdf';
    const blob = new Blob([byteArray], { type: cleanType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading file:', err);
    alert('Failed to download file.');
  }
}

// Convert base64 data to Blob URL for fast, secure in-browser viewing
function fileDataToBlobUrl(fileData: string, mimeType: string): string | null {
  try {
    if (!fileData) return null;
    if (fileData.startsWith('blob:') || fileData.startsWith('http://') || fileData.startsWith('https://')) {
      return fileData;
    }
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error generating blob URL:', err);
    return null;
  }
}

// Extract readable text from base64 data
function extractTextContent(fileData: string): string | null {
  try {
    if (!fileData) return null;
    const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const decoded = atob(base64Data);
    try {
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return decoded;
    }
  } catch {
    return null;
  }
}

/**
 * Custom hook to dynamically resolve active media URL:
 * Pre-signed Supabase Storage URL > Direct HTTP URL > Blob URL from Base64
 */
function useResourceUrl(resource: any) {
  const mime = getProperMimeType(
    resource?.fileName || resource?.file?.file_name,
    resource?.type || resource?.resource_type,
    resource?.mimeType || resource?.file?.mime_type
  );

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    if (resource?.signedUrl) return resource.signedUrl;
    if (typeof resource?.url === 'string' && resource.url.startsWith('http')) return resource.url;
    if (typeof resource?.fileUrl === 'string' && resource.fileUrl.startsWith('http')) return resource.fileUrl;
    if (resource?.fileData) return fileDataToBlobUrl(resource.fileData, mime);
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (resource?.signedUrl) {
      setResolvedUrl(resource.signedUrl);
      return;
    }

    if (resource?.url?.startsWith('http') || resource?.fileUrl?.startsWith('http')) {
      setResolvedUrl(resource.url || resource.fileUrl);
      return;
    }

    const storagePath = resource?.storagePath || resource?.storage_path || resource?.file?.storage_path;
    if (storagePath) {
      setLoading(true);
      resourceService.getSignedResourceUrl(storagePath)
        .then((url) => {
          if (isMounted) {
            if (url) {
              setResolvedUrl(url);
            } else if (resource?.fileData) {
              setResolvedUrl(fileDataToBlobUrl(resource.fileData, mime));
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return;
    }

    if (resource?.fileData) {
      setResolvedUrl(fileDataToBlobUrl(resource.fileData, mime));
    }

    return () => {
      isMounted = false;
    };
  }, [
    resource?.signedUrl,
    resource?.storagePath,
    resource?.storage_path,
    resource?.file?.storage_path,
    resource?.fileData,
    resource?.mimeType,
    mime,
  ]);

  return { resolvedUrl, loading };
}

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const { user } = useAuth();
  if (!hasResourceAccess(user, 'resources') && !hasResourceAccess(user, 'courses')) {
    return <AccessRestrictedScreen moduleName="Learning Resources" onBack={onBack} />;
  }
  const r = resource || { title: 'Document', type: 'PDF', subject: 'General', size: '5 MB', uploaderName: 'Faculty', date: '2024-12-15' };

  const mime = (r.mimeType || r.file?.mime_type || '').toLowerCase();
  const type = (r.type || r.resource_type || '').toLowerCase();
  const fileName = (r.fileName || r.file?.file_name || '').toLowerCase();

  const isVideo = type === 'video' || mime.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.mkv') || fileName.endsWith('.mov');
  const isImage = mime.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp') || fileName.endsWith('.svg');
  const isPDF = type === 'pdf' || mime === 'application/pdf' || fileName.endsWith('.pdf');
  const isOfficeDoc = fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.zip');
  const isText = !isOfficeDoc && (mime.startsWith('text/') || mime === 'application/json' || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv') || ((type === 'note' || type === 'notes') && (!fileName || !fileName.includes('.'))));

  if (isVideo) return <VideoPlayer onBack={onBack} resource={r} />;
  if (isImage) return <ImageViewer onBack={onBack} resource={r} />;
  if (isPDF) return <PDFViewer onBack={onBack} resource={r} />;
  if (isOfficeDoc) return <FileViewer onBack={onBack} resource={r} />;
  if (isText) return <TextViewer onBack={onBack} resource={r} />;
  return <FileViewer onBack={onBack} resource={r} />;
}

// ==================== PDF VIEWER ====================
function PDFViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const { updateResource } = useData();
  const displayUser = isViewingAs ? viewingAsUser : user;
  const isStudent = displayUser?.role === 'student';
  const isAdminOrFaculty = displayUser?.role === 'admin' || displayUser?.role === 'faculty';
  const [readingContentState, setReadingContentState] = useState<string>(resource.readingContent || '');
  const [isEditingReadingContent, setIsEditingReadingContent] = useState(false);
  const [editContentText, setEditContentText] = useState<string>(resource.readingContent || '');
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()}`;
  const { resolvedUrl, loading } = useResourceUrl(resource);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'reader' | 'stream'>('reader');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownload = async () => {
    if (isStudent) {
      alert('Downloading study materials is disabled for student accounts.');
      return;
    }

    const storagePath = resource.storagePath || resource.storage_path || resource.file?.storage_path;
    const fileName = resource.fileName || resource.file?.file_name || `${resource.title || 'document'}.pdf`;
    const mimeType = resource.mimeType || resource.file?.mime_type || 'application/pdf';

    if (storagePath) {
      try {
        await resourceService.downloadResourceFile(storagePath, fileName, mimeType, resource.fileData);
        return;
      } catch (err) {
        console.warn('[PDFViewer] Cloud download failed, falling back to base64:', err);
      }
    }

    if (resource.fileData) {
      downloadFile(resource.fileData, fileName, mimeType);
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const handleOpenNewTab = () => {
    if (isStudent) return;
    if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const extractedLines = useMemo(() => {
    if (readingContentState && readingContentState.trim().length > 0) {
      return readingContentState.split('\n').filter((l: string) => l.trim().length > 0);
    }
    return extractDocumentLines(resource.fileData, resource.title);
  }, [readingContentState, resource.fileData, resource.title]);

  return (
    <DocumentProtectionWrapper resourceTitle={resource.title}>
      <div className="flex flex-col h-full bg-gray-100 relative">
        <Header
          title={resource.title}
          showBack
          onBack={onBack}
          gradient={false}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-teal-200 shadow-2xs"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[11px]`} />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>

              {isStudent ? (
                <span className="px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                  <i className="fas fa-shield-alt text-yellow-600" />
                  <span className="hidden sm:inline">Protected</span>
                </span>
              ) : (
                <>
                  {resolvedUrl && (
                    <button
                      onClick={handleOpenNewTab}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="Open in new window"
                    >
                      <i className="fas fa-external-link-alt text-[10px]" />
                      <span className="hidden sm:inline">Tab</span>
                    </button>
                  )}
                  {(resource.fileData || resolvedUrl) && (
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                      title="Download PDF"
                    >
                      <i className="fas fa-download text-[10px]" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}
                </>
              )}
            </div>
          }
        />

        <div className="watermark pointer-events-none select-none">{watermarkText}</div>

        {/* View Mode Toolbar */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-yellow-600 text-xs" />
            <p className="text-[11px] text-yellow-800 font-medium">
              {isStudent ? 'DRM Protected • Direct In-App Study Viewer' : 'Protected Document • Watermarked'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-yellow-100 p-0.5 rounded-lg border border-yellow-300">
              <button
                type="button"
                onClick={() => setActiveTab('reader')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${activeTab === 'reader' ? 'bg-white text-teal-800 shadow-2xs' : 'text-yellow-900'}`}
              >
                Study Reader
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stream')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${activeTab === 'stream' ? 'bg-white text-teal-800 shadow-2xs' : 'text-yellow-900'}`}
              >
                Doc Stream
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <i className="fas fa-expand text-[10px]" /> Fullscreen
            </button>
          </div>
        </div>

        {/* Reader or Direct Stream Content */}
        {activeTab === 'stream' && resolvedUrl ? (
          <div className="flex-1 w-full h-full relative overflow-hidden bg-gray-200">
            <iframe
              src={resolvedUrl.includes('#') ? resolvedUrl : `${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0 pointer-events-auto"
              title={resource.title}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 max-w-full mx-auto w-full space-y-3">
            {/* High-Yield Study Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <i className="fas fa-file-pdf text-xl" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 leading-snug">{resource.title}</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {resource.subject || resource.subjectName || 'Medical Curriculum'} • {resource.sizeFormatted || resource.size || 'Study Material'}
                    </p>
                  </div>
                </div>
                <span className="badge bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold shrink-0">
                  IN-APP STUDY
                </span>
              </div>

              {/* Clinical High Yield Pearls */}
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1.5 text-xs">
                <p className="font-bold text-teal-900 flex items-center gap-1.5">
                  <i className="fas fa-stethoscope text-teal-600 text-xs" />
                  <span>Curriculum Study Objectives & Blueprint:</span>
                </p>
                <p className="text-teal-800 text-[11px] leading-relaxed">
                  {resource.description || `Comprehensive study notes, diagrams, and examination review points for ${resource.title}.`}
                </p>
              </div>

              {/* Extracted Content / Section Reader */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                    <i className="fas fa-book-open text-teal-600" />
                    <span>Document Reading Section:</span>
                    {readingContentState && (
                      <span className="badge bg-teal-100 text-teal-800 text-[9px] font-bold py-0.5 px-1.5">
                        Document-Specific Content
                      </span>
                    )}
                  </p>
                  {isAdminOrFaculty && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditContentText(readingContentState);
                        setIsEditingReadingContent(true);
                      }}
                      className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-md text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      <i className="fas fa-edit text-[9px]" />
                      <span>{readingContentState ? 'Edit Reading Content' : 'Add Reading Content'}</span>
                    </button>
                  )}
                </div>

                {extractedLines.length > 0 ? (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-gray-800 leading-relaxed font-sans">
                    {extractedLines.map((line, idx) => (
                      <p key={idx} className="pb-1">{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-gray-100 space-y-1">
                      <p className="font-bold text-gray-800 text-xs">1. Core Mechanisms & Principles</p>
                      <p className="text-gray-600 text-[11px]">Primary physiological pathways, molecular foundations, and structural relationships.</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-100 space-y-1">
                      <p className="font-bold text-gray-800 text-xs">2. High-Yield Diagnostic & Exam Pearls</p>
                      <p className="text-gray-600 text-[11px]">Key formulas, clinical correlations, and frequently tested MCQ concepts.</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-gray-100 space-y-1">
                      <p className="font-bold text-gray-800 text-xs">3. Summary & Quick Revision</p>
                      <p className="text-gray-600 text-[11px]">Review points, summary tables, and rapid recall highlights.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reader Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <i className="fas fa-expand text-xs" />
                  <span>Fullscreen Reader</span>
                </button>
                {resolvedUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('stream')}
                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                  >
                    View Original
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Reading Content Edit Modal */}
        {isEditingReadingContent && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <i className="fas fa-file-alt text-teal-600" />
                  <span>Document Reading Section Contents</span>
                </h3>
                <button onClick={() => setIsEditingReadingContent(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Provide specific study notes, formulas, or summaries tailored directly for &ldquo;{resource.title}&rdquo;.
              </p>
              <textarea
                rows={5}
                value={editContentText}
                onChange={(e) => setEditContentText(e.target.value)}
                placeholder="Enter specific document reading content..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingReadingContent(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = editContentText.trim();
                    updateResource(resource.id, { readingContent: trimmed }, displayUser?.role);
                    resource.readingContent = trimmed;
                    setReadingContentState(trimmed);
                    setIsEditingReadingContent(false);
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Save Reading Content
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Overlay Facility */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-full h-full">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-white z-20 shadow-md">
              <div className="flex items-center gap-3">
                <i className="fas fa-file-pdf text-red-400 text-lg" />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{resource.title}</h3>
                  <p className="text-[10px] text-slate-400">{resource.subject || resource.subjectName || 'Medical Document'} • DRM Protected Fullscreen</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.max(z - 15, 60))}
                    className="px-2 py-1 hover:bg-slate-700 rounded text-slate-200"
                    title="Zoom Out"
                  >
                    <i className="fas fa-search-minus" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-300 min-w-[42px] text-center">{zoom}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.min(z + 15, 200))}
                    className="px-2 py-1 hover:bg-slate-700 rounded text-slate-200"
                    title="Zoom In"
                  >
                    <i className="fas fa-search-plus" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    className="px-2 py-1 hover:bg-slate-700 rounded text-[10px] text-teal-400 font-semibold"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  title="Exit Fullscreen (Esc)"
                >
                  <i className="fas fa-compress text-xs" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            <div className="relative flex-1 w-full h-full bg-slate-900 overflow-auto flex items-center justify-center p-4">
              <div className="watermark pointer-events-none select-none text-white/10 z-30">{watermarkText}</div>
              {resolvedUrl ? (
                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                    width: '100%',
                    height: '100%'
                  }}
                  className="w-full h-full flex justify-center"
                >
                  <iframe
                    src={resolvedUrl.includes('#') ? resolvedUrl : `${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title={resource.title}
                  />
                </div>
              ) : (
                <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 text-slate-200 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                    <i className="fas fa-file-pdf text-red-400 text-lg" />
                    <h4 className="text-sm font-bold text-white truncate">{resource.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {resource.description || 'Full-screen study reader mode is active with DRM protection.'}
                  </p>
                  {extractedLines.map((l, i) => (
                    <p key={i} className="text-xs text-slate-300">{l}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DocumentProtectionWrapper>
  );
}

// ==================== TEXT / NOTES VIEWER ====================
function TextViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [copied, setCopied] = useState(false);
  const [remoteText, setRemoteText] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const watermarkText = `${user?.name || 'User'} • ${new Date().toLocaleDateString()}`;
  const { resolvedUrl } = useResourceUrl(resource);

  const textContent = useMemo(() => {
    if (resource.fileData) return extractTextContent(resource.fileData);
    return remoteText;
  }, [resource.fileData, remoteText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!resource.fileData && resolvedUrl && resolvedUrl.startsWith('http')) {
      fetch(resolvedUrl)
        .then((res) => res.text())
        .then((txt) => setRemoteText(txt))
        .catch((err) => console.warn('[TextViewer] Failed to fetch remote text content:', err));
    }
  }, [resource.fileData, resolvedUrl]);

  const handleDownload = async () => {
    if (isStudent) {
      alert('Downloading notes is disabled for student accounts.');
      return;
    }

    const storagePath = resource.storagePath || resource.storage_path || resource.file?.storage_path;
    const fileName = resource.fileName || resource.file?.file_name || `${resource.title || 'notes'}.txt`;
    const mimeType = resource.mimeType || resource.file?.mime_type || 'text/plain';

    if (storagePath) {
      try {
        await resourceService.downloadResourceFile(storagePath, fileName, mimeType, resource.fileData);
        return;
      } catch (err) {
        console.warn('[TextViewer] Cloud download failed, using base64:', err);
      }
    }

    if (resource.fileData) {
      downloadFile(resource.fileData, fileName, mimeType);
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const handleCopy = () => {
    if (isStudent) {
      alert('Copying protected notes is disabled.');
      return;
    }
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = textContent ? textContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = textContent ? textContent.split('\n').length : 0;

  return (
    <DocumentProtectionWrapper resourceTitle={resource.title}>
      <div className="flex flex-col h-full bg-gray-50 relative">
        <Header
          title={resource.title}
          showBack
          onBack={onBack}
          gradient={false}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-teal-200 shadow-2xs"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Reader"}
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[11px]`} />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>

              {isStudent ? (
                <span className="px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                  <i className="fas fa-lock text-yellow-600" />
                  <span className="hidden sm:inline">Protected Notes</span>
                </span>
              ) : (
                <>
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    title="Copy text"
                  >
                    <i className={`fas ${copied ? 'fa-check text-green-600' : 'fa-copy'} text-[10px]`} />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  {(resource.fileData || resolvedUrl) && (
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                      title="Download document"
                    >
                      <i className="fas fa-download text-[10px]" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}
                </>
              )}
            </div>
          }
        />

        <div className="watermark pointer-events-none select-none">{watermarkText}</div>

        <div className="bg-teal-50/70 border-b border-teal-100 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-teal-800">
            <i className="fas fa-sticky-note text-teal-600 text-xs" />
            <span className="font-semibold">{resource.type || resource.resource_type || 'Notes'} Document</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{resource.sizeFormatted || resource.size}</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1 ml-1"
            >
              <i className="fas fa-expand text-[10px]" /> Fullscreen Reader
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-w-full mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 sm:p-7 min-h-[400px]">
            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{resource.title}</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Subject: <span className="font-semibold text-gray-700">{resource.subject || resource.subjectName}</span> • Uploaded by {resource.uploaderName || resource.creatorName} on {resource.date || resource.created_at?.split('T')[0]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 shadow-2xs"
              >
                <i className="fas fa-expand text-teal-600 text-xs" /> Fullscreen
              </button>
            </div>

            {textContent ? (
              <pre className={`whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed font-normal ${isStudent ? 'select-none' : 'select-text'}`}>
                {textContent}
              </pre>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-file-alt text-4xl mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">Text content preview not available.</p>
                {!isStudent && (resource.fileData || resolvedUrl) ? (
                  <button onClick={handleDownload} className="btn-primary max-w-xs mx-auto mt-4">
                    <i className="fas fa-download mr-1.5" />Download Document
                  </button>
                ) : isStudent ? (
                  <p className="text-xs text-teal-600 mt-2 font-semibold">Protected notes are only readable in online mode.</p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Reader Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col w-full h-full">
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 shadow-md">
              <div className="flex items-center gap-3">
                <i className="fas fa-sticky-note text-amber-400 text-lg" />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{resource.title}</h3>
                  <p className="text-[10px] text-slate-400">{resource.subject || 'Notes'} • {lineCount} lines • {wordCount} words • DRM Reader</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setFontSize(f => f === 'xl' ? 'lg' : f === 'lg' ? 'base' : 'sm')}
                    className="px-2 py-1 hover:bg-slate-700 rounded text-slate-200"
                    title="Smaller text"
                  >
                    A-
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-300 uppercase">{fontSize}</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(f => f === 'sm' ? 'base' : f === 'base' ? 'lg' : 'xl')}
                    className="px-2 py-1 hover:bg-slate-700 rounded text-slate-200"
                    title="Larger text"
                  >
                    A+
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  title="Exit Fullscreen (Esc)"
                >
                  <i className="fas fa-compress text-xs" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            <div className="watermark pointer-events-none select-none text-white/10 z-30">{watermarkText}</div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-full mx-auto w-full">
              <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl">
                <h1 className="text-xl font-bold text-white mb-2">{resource.title}</h1>
                <p className="text-xs text-slate-400 border-b border-slate-700 pb-3 mb-6">
                  {resource.subject || resource.subjectName} • Uploaded by {resource.uploaderName || resource.creatorName}
                </p>
                {textContent ? (
                  <pre className={`whitespace-pre-wrap font-sans text-slate-200 leading-relaxed ${fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : fontSize === 'xl' ? 'text-lg' : 'text-sm'} ${isStudent ? 'select-none' : 'select-text'}`}>
                    {textContent}
                  </pre>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">No text content available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DocumentProtectionWrapper>
  );
}

// ==================== IMAGE VIEWER ====================
function ImageViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const watermarkText = `${user?.name || 'User'}`;
  const { resolvedUrl } = useResourceUrl(resource);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownload = async () => {
    if (isStudent) {
      alert('Downloading images is disabled for student accounts.');
      return;
    }

    const storagePath = resource.storagePath || resource.storage_path || resource.file?.storage_path;
    const fileName = resource.fileName || resource.file?.file_name || `${resource.title || 'image'}.jpg`;
    const mimeType = resource.mimeType || resource.file?.mime_type || 'image/jpeg';

    if (storagePath) {
      try {
        await resourceService.downloadResourceFile(storagePath, fileName, mimeType, resource.fileData);
        return;
      } catch (err) {
        console.warn('[ImageViewer] Cloud download failed, using base64:', err);
      }
    }

    if (resource.fileData) {
      downloadFile(resource.fileData, fileName, mimeType);
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  return (
    <DocumentProtectionWrapper resourceTitle={resource.title}>
      <div className="flex flex-col h-full bg-gray-900 relative">
        <Header
          title={resource.title}
          showBack
          onBack={onBack}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-white/20"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[11px]`} />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>

              {isStudent ? (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-yellow-500/30">
                  <i className="fas fa-lock" />
                  <span className="hidden sm:inline">Protected</span>
                </span>
              ) : (
                (resource.fileData || resolvedUrl) && (
                  <button onClick={handleDownload} className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-medium transition" title="Download Image">
                    <i className="fas fa-download text-[10px] mr-1" />Download
                  </button>
                )
              )}
            </div>
          }
        />
        <div className="watermark text-white/10 pointer-events-none select-none">{watermarkText}</div>

        {resolvedUrl || resource.fileData ? (
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={resolvedUrl || resource.fileData}
              alt={resource.title}
              className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${isStudent ? 'pointer-events-none select-none' : ''}`}
              draggable={!isStudent}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-image text-5xl text-gray-500 mb-3" />
              <p className="text-sm text-gray-300">Image not available</p>
            </div>
          </div>
        )}

        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-200 font-medium">{resource.fileName || resource.title}</p>
            <p className="text-[10px] text-gray-400">{resource.sizeFormatted || resource.size} • {resource.subject || resource.subjectName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <i className="fas fa-expand text-xs" /> Fullscreen Mode
            </button>
            {!isStudent && (resource.fileData || resolvedUrl) && (
              <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
                <i className="fas fa-download text-xs" />
                <span>Download</span>
              </button>
            )}
            {isStudent && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <i className="fas fa-shield-alt text-teal-400" /> Protected Visual Asset
              </span>
            )}
          </div>
        </div>

        {/* Fullscreen Modal Overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col w-full h-full">
            <div className="bg-black/90 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between text-white z-20">
              <div className="flex items-center gap-3">
                <i className="fas fa-image text-teal-400 text-lg" />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{resource.title}</h3>
                  <p className="text-[10px] text-gray-400">{resource.subject || 'Visual Asset'} • DRM Protected Fullscreen</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                    className="px-2 py-1 hover:bg-gray-700 rounded text-gray-200"
                    title="Zoom Out"
                  >
                    <i className="fas fa-search-minus" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-gray-300 min-w-[42px] text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    className="px-2 py-1 hover:bg-gray-700 rounded text-gray-200"
                    title="Zoom In"
                  >
                    <i className="fas fa-search-plus" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="px-2 py-1 hover:bg-gray-700 rounded text-[10px] text-teal-400 font-semibold"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                  title="Exit Fullscreen (Esc)"
                >
                  <i className="fas fa-compress text-xs" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            <div className="watermark text-white/10 pointer-events-none select-none z-30">{watermarkText}</div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <img
                src={resolvedUrl || resource.fileData}
                alt={resource.title}
                style={{
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.15s ease-out'
                }}
                className={`max-w-full max-h-full object-contain ${isStudent ? 'pointer-events-none select-none' : ''}`}
                draggable={!isStudent}
              />
            </div>
          </div>
        )}
      </div>
    </DocumentProtectionWrapper>
  );
}

// ==================== VIDEO PLAYER ====================
function VideoPlayer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const watermarkText = `${user?.name || 'User'}`;
  const { resolvedUrl } = useResourceUrl(resource);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownload = async () => {
    if (isStudent) {
      alert('Downloading videos is disabled for student accounts.');
      return;
    }

    const storagePath = resource.storagePath || resource.storage_path || resource.file?.storage_path;
    const fileName = resource.fileName || resource.file?.file_name || `${resource.title || 'video'}.mp4`;
    const mimeType = resource.mimeType || resource.file?.mime_type || 'video/mp4';

    if (storagePath) {
      try {
        await resourceService.downloadResourceFile(storagePath, fileName, mimeType, resource.fileData);
        return;
      } catch (err) {
        console.warn('[VideoPlayer] Cloud download failed, using base64:', err);
      }
    }

    if (resource.fileData) {
      downloadFile(resource.fileData, fileName, mimeType);
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  return (
    <DocumentProtectionWrapper resourceTitle={resource.title}>
      <div className="flex flex-col h-full bg-black relative">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white text-base"><i className="fas fa-arrow-left" /></button>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{resource.title}</p>
              <p className="text-gray-300 text-[10px]">{resource.sizeFormatted || resource.size} • {resource.subject || resource.subjectName}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(prev => !prev)}
              className="text-white bg-white/20 hover:bg-white/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition border border-white/20"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
            >
              <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[11px]`} />
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
            {!isStudent && (resource.fileData || resolvedUrl) && (
              <button onClick={handleDownload} className="text-white bg-teal-600 hover:bg-teal-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                <i className="fas fa-download mr-1" />Download
              </button>
            )}
            {isStudent && (
              <span className="text-[10px] text-teal-300 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                <i className="fas fa-lock" />Protected
              </span>
            )}
          </div>
        </div>
        <div className="watermark text-white/10 pointer-events-none select-none">{watermarkText}</div>

        {resolvedUrl || resource.fileData ? (
          <div className="flex-1 flex items-center justify-center p-2">
            <video
              src={resolvedUrl || resource.fileData}
              controls
              className="max-w-full max-h-full rounded-lg shadow-xl"
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture={isStudent}
            >
              Your browser does not support video playback.
            </video>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-play text-3xl text-white ml-1" />
              </div>
              <p className="text-white/60 text-xs">Video data not available</p>
            </div>
          </div>
        )}

        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-lock text-teal-400 text-xs" />
            <p className="text-[11px] text-gray-400">Protected Video Stream</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-teal-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-gray-700"
            >
              <i className="fas fa-expand text-xs" />
              <span>Fullscreen Mode</span>
            </button>
            {!isStudent && (resource.fileData || resolvedUrl) && (
              <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-medium">
                <i className="fas fa-download mr-1" />Save Video
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen Video Overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col w-full h-full">
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fas fa-play-circle text-teal-400 text-lg" />
                <div>
                  <h3 className="text-white text-sm font-bold truncate max-w-xs sm:max-w-md">{resource.title}</h3>
                  <p className="text-gray-300 text-[10px]">{resource.subject || 'Video Lecture'} • DRM Protected Fullscreen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                title="Exit Fullscreen (Esc)"
              >
                <i className="fas fa-compress text-xs" />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            <div className="watermark text-white/10 pointer-events-none select-none z-10">{watermarkText}</div>

            <div className="flex-1 flex items-center justify-center p-2">
              <video
                src={resolvedUrl || resource.fileData}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture={isStudent}
              >
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        )}
      </div>
    </DocumentProtectionWrapper>
  );
}

// ==================== FILE VIEWER (for Word, Excel, PPT, etc.) ====================
function FileViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const { updateResource } = useData();
  const isStudent = user?.role === 'student';
  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';
  const [readingContentState, setReadingContentState] = useState<string>(resource.readingContent || '');
  const [isEditingReadingContent, setIsEditingReadingContent] = useState(false);
  const [editContentText, setEditContentText] = useState<string>(resource.readingContent || '');
  const watermarkText = `${user?.name || 'User'} • ${new Date().toLocaleDateString()}`;
  const { resolvedUrl } = useResourceUrl(resource);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDownload = async () => {
    if (isStudent) {
      alert('Downloading document files is restricted for student accounts.');
      return;
    }

    const storagePath = resource.storagePath || resource.storage_path || resource.file?.storage_path;
    const fileName = resource.fileName || resource.file?.file_name || `${resource.title || 'resource'}.bin`;
    const mimeType = resource.mimeType || resource.file?.mime_type || 'application/octet-stream';

    if (storagePath) {
      try {
        await resourceService.downloadResourceFile(storagePath, fileName, mimeType, resource.fileData);
        return;
      } catch (err) {
        console.warn('[FileViewer] Cloud download failed, using base64:', err);
      }
    }

    if (resource.fileData) {
      downloadFile(resource.fileData, fileName, mimeType);
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const handleOpenBrowser = () => {
    if (isStudent) return;
    if (resolvedUrl) {
      window.open(resolvedUrl, '_blank');
    }
  };

  const getFileIcon = () => {
    const fn = (resource.fileName || resource.file?.file_name || '').toLowerCase();
    const type = (resource.type || resource.resource_type || '').toLowerCase();
    if (fn.endsWith('.doc') || fn.endsWith('.docx')) return 'fa-file-word text-blue-600';
    if (fn.endsWith('.xls') || fn.endsWith('.xlsx')) return 'fa-file-excel text-green-600';
    if (fn.endsWith('.ppt') || fn.endsWith('.pptx')) return 'fa-file-powerpoint text-orange-600';
    if (type === 'pyq' || type === 'q.paper') return 'fa-file-alt text-purple-500';
    if (type === 'assignment' || type === 'dpp') return 'fa-tasks text-green-500';
    if (type === 'notes' || type === 'note') return 'fa-sticky-note text-yellow-500';
    if (type === 'syllabus' || type === 'book') return 'fa-book text-blue-500';
    return 'fa-file text-teal-600';
  };

  const extractedLines = useMemo(() => {
    if (readingContentState && readingContentState.trim().length > 0) {
      return readingContentState.split('\n').filter((l: string) => l.trim().length > 0);
    }
    return extractDocumentLines(resource.fileData, resource.title);
  }, [readingContentState, resource.fileData, resource.title]);

  return (
    <DocumentProtectionWrapper resourceTitle={resource.title}>
      <div className="flex flex-col h-full bg-gray-50 relative">
        <Header
          title={resource.title}
          showBack
          onBack={onBack}
          gradient={false}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(prev => !prev)}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-teal-200 shadow-2xs"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-[11px]`} />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>

              {!isStudent && (resource.fileData || resolvedUrl) ? (
                <button onClick={handleDownload} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs">
                  <i className="fas fa-download text-[10px]" />
                  <span>Download</span>
                </button>
              ) : isStudent ? (
                <span className="px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                  <i className="fas fa-lock text-yellow-600" />
                  <span>Protected</span>
                </span>
              ) : undefined}
            </div>
          }
        />
        <div className="watermark pointer-events-none select-none">{watermarkText}</div>

        {/* Document Reading View */}
        <div className="flex-1 overflow-y-auto p-4 max-w-full mx-auto w-full space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-4 space-y-3">
            {/* Header info */}
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <i className={`fas ${getFileIcon()} text-2xl`} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-gray-900 leading-snug">{resource.title}</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {resource.subject || resource.subjectName || 'Medical Curriculum'} • {resource.sizeFormatted || resource.size || 'Document'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-teal text-[10px] uppercase font-bold">{resource.type || resource.resource_type || 'DOCX'}</span>
                  <span className="text-[10px] text-gray-400 font-medium">Uploaded by {resource.uploaderName || resource.creatorName || 'Faculty'}</span>
                </div>
              </div>
            </div>

            {/* In-App Study Reader Controls */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-200/60">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <i className="fas fa-book-reader text-teal-600" />
                <span>In-App Document Reader:</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${fontSize === 'sm' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${fontSize === 'base' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${fontSize === 'lg' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}
                  >
                    A+
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="text-teal-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <i className="fas fa-expand text-[10px]" /> Fullscreen
                </button>
              </div>
            </div>

            {/* Document Body Content */}
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1">
                <p className="font-bold text-teal-900 text-xs flex items-center gap-1.5">
                  <i className="fas fa-graduation-cap text-teal-600" />
                  <span>Topic Synopsis & Examination Directives:</span>
                  {readingContentState && (
                    <span className="badge bg-teal-100 text-teal-800 text-[9px] font-bold py-0.5 px-1.5 ml-2">
                      Document-Specific Content
                    </span>
                  )}
                  {isAdminOrFaculty && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditContentText(readingContentState);
                        setIsEditingReadingContent(true);
                      }}
                      className="ml-auto px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-md text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                    >
                      <i className="fas fa-edit text-[9px]" />
                      <span>{readingContentState ? 'Edit Content' : 'Add Content'}</span>
                    </button>
                  )}
                </p>
                <p className="text-teal-800 text-[11px] leading-relaxed">
                  {resource.description || `Comprehensive study notes, diagrams, and examination review points for ${resource.title}.`}
                </p>
              </div>

              {/* Extracted Paragraphs */}
              {extractedLines.length > 0 ? (
                <div className={`space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200/80 leading-relaxed font-sans text-gray-800 ${fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'}`}>
                  {extractedLines.map((line, idx) => (
                    <p key={idx} className="pb-1">{line}</p>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                    <p className="font-bold text-gray-800 text-xs">1. Core Mechanisms & Fundamental Principles</p>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      Primary biological pathways, chemical formulations, and anatomical structures associated with {resource.title}.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                    <p className="font-bold text-gray-800 text-xs">2. High-Yield Examination Pearls & Clinical Pearls</p>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      Essential diagnostic checkpoints, differential equations, and key definitions targeted in competitive entrance exams.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                    <p className="font-bold text-gray-800 text-xs">3. Rapid Revision Notes & Self-Assessment</p>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      Concise high-yield revision summaries, formula sheets, and chapter linkages for rapid retention.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <i className="fas fa-expand text-xs" />
                <span>Fullscreen Document Preview</span>
              </button>

              {!isStudent && (resource.fileData || resolvedUrl) ? (
                <button onClick={handleDownload} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5">
                  <i className="fas fa-download text-xs" />
                  <span>Download Original ({resource.sizeFormatted || resource.size || 'File'})</span>
                </button>
              ) : isStudent ? (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-[10px] text-slate-500">
                  <i className="fas fa-shield-alt text-teal-600 mr-1" />
                  Direct file download is restricted for students. Study notes are protected under LMS copyright.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Document Reading Content Edit Modal (FileViewer) */}
        {isEditingReadingContent && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <i className="fas fa-file-alt text-teal-600" />
                  <span>Document Reading Section Contents</span>
                </h3>
                <button onClick={() => setIsEditingReadingContent(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Provide specific study notes, formulas, or summaries tailored directly for &ldquo;{resource.title}&rdquo;.
              </p>
              <textarea
                rows={5}
                value={editContentText}
                onChange={(e) => setEditContentText(e.target.value)}
                placeholder="Enter specific document reading content..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingReadingContent(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = editContentText.trim();
                    updateResource(resource.id, { readingContent: trimmed }, user?.role);
                    resource.readingContent = trimmed;
                    setReadingContentState(trimmed);
                    setIsEditingReadingContent(false);
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Save Reading Content
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Document Overlay Facility (Preserving Phase 9 inspection modal) */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col w-full h-full">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-white z-20 shadow-md">
              <div className="flex items-center gap-3">
                <i className={`fas ${getFileIcon()} text-lg`} />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{resource.title}</h3>
                  <p className="text-[10px] text-slate-400">{resource.subject || resource.subjectName || 'Document'} • Fullscreen Preview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                title="Exit Fullscreen (Esc)"
              >
                <i className="fas fa-compress text-xs" />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            <div className="watermark pointer-events-none select-none text-white/10 z-10">{watermarkText}</div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
              <div className="text-center max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2">
                  <i className={`fas ${getFileIcon()} text-3xl`} />
                </div>
                <h2 className="text-lg font-bold mb-1">{resource.title}</h2>
                <p className="text-xs text-slate-400">{resource.subject || resource.subjectName} • {resource.examCategory || 'Medical LMS'}</p>

                {/* Fullscreen Content Reader */}
                {extractedLines.length > 0 ? (
                  <div className="text-left bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 max-h-60 overflow-y-auto space-y-2 text-xs text-slate-200">
                    {extractedLines.map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-left space-y-2 text-xs">
                    <p className="text-slate-300 font-medium">{resource.description || 'Full interactive study reader active.'}</p>
                    <p className="text-[11px] text-teal-400">High-Yield Medical LMS Document Inspection Active.</p>
                  </div>
                )}

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">File Type</span>
                    <span className="font-semibold text-teal-400">{resource.type || resource.resource_type || 'Document'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">File Size</span>
                    <span className="font-semibold text-slate-200">{resource.sizeFormatted || resource.size || 'Document'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Uploaded By</span>
                    <span className="font-semibold text-slate-200">{resource.uploaderName || resource.creatorName || 'Faculty'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
                >
                  Close Fullscreen Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DocumentProtectionWrapper>
  );
}

export function CourseDetail({ onBack, course, onNavigate }: { onBack: () => void; course?: any; onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const rbac = useRbac();
  const { resources: localResources, users, enrollStudents } = useData();
  const { resources: cloudResources } = useResources();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const c = course;

  const canEnrollOthers = rbac.can('courses:enroll_others');
  const canUploadResources = rbac.can('resources:upload');
  const isFacultyOrAdmin = canUploadResources;
  const isStudent = rbac.role === 'student';
  const isEnrolled = isStudent ? (c?.studentIds || []).includes(user?.id || '') : false;

  const courseResources = useMemo(() => {
    if (!c) return [];
    const merged = deduplicateAndMergeResources(cloudResources, localResources);
    return merged.filter((r) => {
      return (
        r.courseId === c.id ||
        r.subject_id === c.id ||
        (c.subjects && (c.subjects.includes(r.subject) || c.subjects.includes(r.subjectId))) ||
        (c.name && r.subject && c.name.toLowerCase().includes(r.subject.toLowerCase()))
      );
    });
  }, [cloudResources, localResources, c]);

  const facultyMembers = users.filter(u => c?.facultyIds?.includes(u.id));
  const enrolledStudents = users.filter(u => c?.studentIds?.includes(u.id));

  if (!hasResourceAccess(user, 'courses')) {
    return <AccessRestrictedScreen moduleName="Courses & Curriculum" onBack={onBack} />;
  }

  if (!c) return (
    <div>
      <Header title="Course" showBack onBack={onBack} gradient={false} />
      <div className="p-4"><p className="text-sm text-gray-500 text-center">Course not found</p></div>
    </div>
  );

  return (
    <div>
      <Header
        title={c.name}
        showBack
        onBack={onBack}
        rightAction={
          canEnrollOthers ? (
            <button
              onClick={() => setShowEnrollModal(true)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Enroll students into course"
            >
              <i className="fas fa-user-plus text-[10px]" />
              <span>Enroll</span>
            </button>
          ) : isStudent && !isEnrolled ? (
            <button
              onClick={() => {
                if (user?.id) {
                  enrollStudents(c.id, [user.id], { id: user.id, name: user.name });
                  alert(`Congratulations! You have enrolled in ${c.name}.`);
                }
              }}
              className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <i className="fas fa-plus text-[10px]" />
              <span>Enroll</span>
            </button>
          ) : isStudent && isEnrolled ? (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-bold flex items-center gap-1">
              <i className="fas fa-check" />
              <span>Enrolled</span>
            </span>
          ) : undefined
        }
      />
      <div className="p-4 space-y-4">
        {/* Course Card */}
        <div className="card mb-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.color + '20' }}>
              <i className={`fas ${c.icon} text-2xl`} style={{ color: c.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-800 truncate">{c.name}</h2>
                <span className="badge badge-teal text-[10px]">{c.category}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{c.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.studentIds?.length || 0}</p>
              <p className="text-[10px] text-gray-500">Students</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.duration}</p>
              <p className="text-[10px] text-gray-500">Duration</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.subjects?.length || 0}</p>
              <p className="text-[10px] text-gray-500">Subjects</p>
            </div>
          </div>

          {/* Quick Enroll CTA for Faculty / Admin */}
          {isFacultyOrAdmin && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Manage Course Students</span>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <i className="fas fa-user-plus text-[10px]" />
                <span>Enroll / Manage Students</span>
              </button>
            </div>
          )}

          {/* Student Self-Enrollment Banner */}
          {isStudent && !isEnrolled && (
            <div className="mt-3 pt-3 border-t border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-xl border border-teal-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-900">Get Enrolled in this Course</p>
                <p className="text-[10px] text-teal-700">Access full curriculum, lecture notes and mock tests</p>
              </div>
              <button
                onClick={() => {
                  if (user?.id) {
                    enrollStudents(c.id, [user.id], { id: user.id, name: user.name });
                    alert(`Congratulations! You have enrolled in ${c.name}.`);
                  }
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <i className="fas fa-graduation-cap" />
                <span>Enroll Now</span>
              </button>
            </div>
          )}

          {isStudent && isEnrolled && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <i className="fas fa-check-circle text-emerald-600" />
                <span>You are currently enrolled in this course</span>
              </div>
              <span className="badge bg-emerald-100 text-emerald-800 text-[9px] font-bold">Active Student</span>
            </div>
          )}
        </div>

        {/* Academic Curriculum Hierarchy (Subjects, Chapters, Topics) */}
        <div className="card mb-0">
          <CurriculumBrowser initialSubjectId={c.subjects?.[0]} onNavigateToResource={(r) => onNavigate?.('resource-view', r)} />
        </div>

        {/* Faculty */}
        {facultyMembers.length > 0 && (
          <div className="card mb-0">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Faculty Instructors</h3>
            <div className="space-y-2">
              {facultyMembers.map((f) => (
                <div key={f.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">{f.avatar}</div>
                  <div>
                    <span className="text-xs font-semibold text-gray-800">{f.name}</span>
                    <p className="text-[10px] text-gray-400">{f.department || 'Faculty'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources list - All clickable to view document */}
        <div className="card mb-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Course Resources ({courseResources.length})
            </h3>
            {isFacultyOrAdmin && (
              <button onClick={() => onNavigate('upload')} className="text-xs font-semibold text-teal-600 hover:underline">
                + Upload Resource
              </button>
            )}
          </div>
          {courseResources.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <i className="fas fa-folder-open text-3xl text-gray-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">No resources uploaded for this course yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courseResources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onNavigate('resource-view', r)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 active:bg-gray-100 transition text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${r.type === 'Video' ? 'fa-play-circle text-blue-500' :
                        r.type === 'PDF' ? 'fa-file-pdf text-red-500' :
                          r.type === 'Notes' ? 'fa-sticky-note text-yellow-500' : 'fa-file-alt text-teal-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{r.subject} • {r.size} • {r.date}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md flex-shrink-0">
                    View
                  </span>
                  <i className="fas fa-chevron-right text-gray-300 text-[10px]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Students Section (for Faculty & Admin) */}
        {isFacultyOrAdmin && (
          <div className="card mb-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Enrolled Students ({enrolledStudents.length})
              </h3>
              {canEnrollOthers && (
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
                >
                  <i className="fas fa-user-plus text-[10px]" /> Manage
                </button>
              )}
            </div>
            {enrolledStudents.length === 0 ? (
              <div className="text-center py-5 bg-gray-50 rounded-xl">
                <i className="fas fa-users-slash text-2xl text-gray-300 mb-1.5" />
                <p className="text-xs text-gray-500 font-medium">No students enrolled yet</p>
                {canEnrollOthers && (
                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
                  >
                    Enroll students now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {enrolledStudents.map(student => (
                  <div key={student.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/70 border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs flex-shrink-0">
                      {student.avatar || '👩‍🎓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{student.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{student.email}</p>
                    </div>
                    {student.targetExam && (
                      <span className="badge badge-teal text-[9px] py-0 px-1">{student.targetExam}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll Modal Dialog */}
      {canEnrollOthers && showEnrollModal && (
        <EnrollStudentsModal
          course={c}
          onClose={() => setShowEnrollModal(false)}
        />
      )}
    </div>
  );
}
