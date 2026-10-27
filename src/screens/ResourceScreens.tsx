import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { EnrollStudentsModal } from '../components/EnrollStudentsModal';
import { CurriculumBrowser } from '../features/curriculum';
import { resourceService, useResources, DocumentProtectionWrapper } from '../features/resources';

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
    const blob = new Blob([byteArray], { type: mimeType });
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
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    if (resource?.signedUrl) return resource.signedUrl;
    if (typeof resource?.url === 'string' && resource.url.startsWith('http')) return resource.url;
    if (typeof resource?.fileUrl === 'string' && resource.fileUrl.startsWith('http')) return resource.fileUrl;
    if (resource?.fileData) return fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/octet-stream');
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
              setResolvedUrl(fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/octet-stream'));
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
      return;
    }

    if (resource?.fileData) {
      setResolvedUrl(fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/octet-stream'));
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
  ]);

  return { resolvedUrl, loading };
}

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const r = resource || { title: 'Document', type: 'PDF', subject: 'General', size: '5 MB', uploaderName: 'Faculty', date: '2024-12-15' };
  
  const mime = (r.mimeType || r.file?.mime_type || '').toLowerCase();
  const type = (r.type || r.resource_type || '').toLowerCase();
  const fileName = (r.fileName || r.file?.file_name || '').toLowerCase();

  const isVideo = type === 'video' || mime.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.webm');
  const isImage = mime.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');
  const isPDF = type === 'pdf' || mime === 'application/pdf' || fileName.endsWith('.pdf');
  const isText = mime.startsWith('text/') || mime === 'application/json' || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv') || type === 'note' || type === 'notes';

  if (isVideo) return <VideoPlayer onBack={onBack} resource={r} />;
  if (isImage) return <ImageViewer onBack={onBack} resource={r} />;
  if (isPDF) return <PDFViewer onBack={onBack} resource={r} />;
  if (isText) return <TextViewer onBack={onBack} resource={r} />;
  return <FileViewer onBack={onBack} resource={r} />;
}

// ==================== PDF VIEWER ====================
function PDFViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const displayUser = isViewingAs ? viewingAsUser : user;
  const isStudent = displayUser?.role === 'student';
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()}`;
  const { resolvedUrl, loading } = useResourceUrl(resource);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

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

        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-yellow-600 text-xs" />
            <p className="text-[11px] text-yellow-800 font-medium">
              {isStudent ? 'DRM Protected • Screenshots & Downloads Blocked' : 'Protected Document • Watermarked'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500">{resource.sizeFormatted || resource.size}</span>
            <button 
              type="button" 
              onClick={() => setIsFullscreen(true)} 
              className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <i className="fas fa-expand text-[10px]" /> Fullscreen Mode
            </button>
          </div>
        </div>
        
        {resolvedUrl ? (
          <div className="flex-1 w-full h-full relative overflow-hidden bg-gray-200">
            <object
              data={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="w-full h-full pointer-events-auto"
            >
              <iframe 
                src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                className="w-full h-full border-0"
                title={resource.title}
              />
            </object>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 text-[11px] text-gray-600">
              <i className="fas fa-book-reader text-teal-600" />
              <span>Viewing Protected PDF in App</span>
              <button 
                type="button" 
                onClick={() => setIsFullscreen(true)} 
                className="ml-2 font-bold text-teal-700 hover:text-teal-800 underline"
              >
                Expand Fullscreen
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading secure cloud stream...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center card max-w-sm p-6 shadow-sm">
              <i className="fas fa-file-pdf text-5xl text-red-500 mb-3" />
              <h3 className="text-base font-bold text-gray-800">{resource.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{resource.subject || resource.subjectName} • {resource.sizeFormatted || resource.size}</p>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <p>Uploaded by <span className="font-semibold text-gray-800">{resource.uploaderName || resource.creatorName}</span> on {resource.date || resource.created_at?.split('T')[0]}</p>
                <p className="text-[11px] text-gray-400 mt-1">Direct PDF stream is not available or stored as offline preview.</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsFullscreen(true)} 
                  className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-expand text-teal-600" /> Fullscreen Document Mode
                </button>
                {!isStudent && resource.fileData ? (
                  <button onClick={handleDownload} className="btn-primary w-full py-2 text-xs">
                    <i className="fas fa-download mr-1.5" />Download PDF
                  </button>
                ) : isStudent ? (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                    <i className="fas fa-lock mr-1 text-teal-600" />
                    Direct PDF download is restricted for students.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Overlay Facility */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-screen h-screen">
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
            
            <div className="relative flex-1 w-full h-full bg-slate-900 overflow-auto flex items-center justify-center">
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
                  <object
                    data={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    type="application/pdf"
                    className="w-full h-full pointer-events-auto"
                  >
                    <iframe 
                      src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-full border-0"
                      title={resource.title}
                    />
                  </object>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <i className="fas fa-file-pdf text-5xl text-red-500 mb-3" />
                  <p className="text-sm font-semibold text-white">{resource.title}</p>
                  <p className="text-xs text-slate-400 mt-1">Full-screen stream preview is active.</p>
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

        <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
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
          <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col w-screen h-screen">
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

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full">
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
          <div className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen">
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
          <div className="fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen">
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
  const isStudent = user?.role === 'student';
  const watermarkText = `${user?.name || 'User'} • ${new Date().toLocaleDateString()}`;
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
        
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="text-center max-w-sm w-full">
            <div className="w-24 h-24 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <i className={`fas ${getFileIcon()} text-4xl`} />
            </div>
            
            <h2 className="text-lg font-bold text-gray-800 mb-1">{resource.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{resource.subject || resource.subjectName} • {resource.examCategory || 'Medical LMS'}</p>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Document Type</span>
                <span className="font-semibold text-gray-800 badge badge-teal">{resource.type || resource.resource_type || 'Document'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">File Size</span>
                <span className="font-semibold text-gray-700">{resource.sizeFormatted || resource.size}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Uploaded By</span>
                <span className="font-semibold text-gray-700">{resource.uploaderName || resource.creatorName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Upload Date</span>
                <span className="font-semibold text-gray-700">{resource.date || resource.created_at?.split('T')[0]}</span>
              </div>
              {(resource.fileName || resource.file?.file_name) && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-500">File Name</span>
                  <span className="font-medium text-gray-700 truncate ml-2 max-w-[180px]">{resource.fileName || resource.file?.file_name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button 
                type="button" 
                onClick={() => setIsFullscreen(true)} 
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <i className="fas fa-expand text-teal-600 text-xs" />
                <span>Fullscreen Document Preview</span>
              </button>

              {!isStudent && (resource.fileData || resolvedUrl) ? (
                <>
                  <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2 shadow-sm w-full">
                    <i className="fas fa-download" />
                    <span>Download Document ({resource.sizeFormatted || resource.size})</span>
                  </button>
                  {resolvedUrl && (
                    <button 
                      onClick={handleOpenBrowser} 
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-external-link-alt text-[10px]" />
                      <span>Open Document in Browser</span>
                    </button>
                  )}
                </>
              ) : isStudent ? (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
                  <i className="fas fa-shield-alt text-teal-600 text-lg mb-1 block" />
                  <p className="text-xs font-bold text-teal-800">Protected Medical Material</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Direct file download is restricted for students. Study materials are protected under LMS copyright.</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mb-1" />
                  <p className="text-xs text-yellow-700 font-medium">Document content is unavailable.</p>
                  <p className="text-[11px] text-yellow-600 mt-1">Please contact the instructor for material access.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Document Overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col w-screen h-screen">
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
              <div className="text-center max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${getFileIcon()} text-4xl`} />
                </div>
                <h2 className="text-xl font-bold mb-1">{resource.title}</h2>
                <p className="text-xs text-slate-400 mb-6">{resource.subject || resource.subjectName} • {resource.examCategory || 'Medical LMS'}</p>
                
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-left space-y-2.5 mb-6 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">File Type</span>
                    <span className="font-semibold text-teal-400">{resource.type || resource.resource_type || 'Document'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">File Size</span>
                    <span className="font-semibold text-slate-200">{resource.sizeFormatted || resource.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Uploaded By</span>
                    <span className="font-semibold text-slate-200">{resource.uploaderName || resource.creatorName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Upload Date</span>
                    <span className="font-semibold text-slate-200">{resource.date || resource.created_at?.split('T')[0]}</span>
                  </div>
                </div>

                {isStudent ? (
                  <div className="p-3 bg-teal-950/60 border border-teal-800/60 rounded-xl text-center">
                    <i className="fas fa-shield-alt text-teal-400 text-lg mb-1 block" />
                    <p className="text-xs font-bold text-teal-300">Protected Medical Material</p>
                    <p className="text-[11px] text-teal-400/80 mt-0.5">Direct file download is restricted for students. Study materials are protected under LMS copyright.</p>
                  </div>
                ) : (
                  (resource.fileData || resolvedUrl) && (
                    <button onClick={handleDownload} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                      <i className="fas fa-download" />
                      <span>Download Document</span>
                    </button>
                  )
                )}
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
  const { resources: localResources, users, enrollStudents } = useData();
  const { resources: cloudResources } = useResources();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const c = course;

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isEnrolled = isStudent ? (c?.studentIds || []).includes(user?.id || '') : false;

  const courseResources = useMemo(() => {
    if (!c) return [];
    const list: any[] = [];
    const seen = new Set<string>();

    cloudResources.forEach((cr) => {
      const isMatch = cr.subject_id === c.id || 
                      (c.subjects && c.subjects.includes(cr.subject_id)) ||
                      (c.name && cr.subjectName && c.name.toLowerCase().includes(cr.subjectName.toLowerCase()));
      if (isMatch) {
        seen.add(cr.id);
        list.push({
          id: cr.id,
          title: cr.title,
          type: cr.resource_type === 'NOTE' ? 'Notes' : cr.resource_type === 'VIDEO' ? 'Video' : cr.resource_type === 'PYQ' ? 'PYQ' : cr.resource_type === 'DPP' ? 'Assignment' : 'PDF',
          subject: cr.subjectName || c.name || 'General',
          courseId: c.id,
          uploaderId: cr.created_by,
          uploaderName: cr.creatorName || 'Faculty',
          date: cr.created_at?.split('T')[0] || 'Recent',
          size: cr.sizeFormatted || 'Cloud',
          status: cr.status === 'PUBLISHED' ? 'published' : 'draft',
          examCategory: 'Medical',
          fileName: cr.file?.file_name || 'document.pdf',
          storagePath: cr.file?.storage_path,
          signedUrl: cr.signedUrl,
          fileData: cr.fileData,
        });
      }
    });

    localResources.forEach((lr) => {
      if (lr.courseId === c.id && !seen.has(lr.id)) {
        list.push(lr);
      }
    });

    return list;
  }, [cloudResources, localResources, c]);

  const facultyMembers = users.filter(u => c?.facultyIds?.includes(u.id));
  const enrolledStudents = users.filter(u => c?.studentIds?.includes(u.id));

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
          isFacultyOrAdmin ? (
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
          <CurriculumBrowser initialSubjectId={c.subjects?.[0]} />
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
                    <i className={`fas ${
                      r.type === 'Video' ? 'fa-play-circle text-blue-500' :
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
              <button 
                onClick={() => setShowEnrollModal(true)} 
                className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
              >
                <i className="fas fa-user-plus text-[10px]" /> Manage
              </button>
            </div>
            {enrolledStudents.length === 0 ? (
              <div className="text-center py-5 bg-gray-50 rounded-xl">
                <i className="fas fa-users-slash text-2xl text-gray-300 mb-1.5" />
                <p className="text-xs text-gray-500 font-medium">No students enrolled yet</p>
                <button 
                  onClick={() => setShowEnrollModal(true)}
                  className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
                >
                  Enroll students now
                </button>
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
      {showEnrollModal && (
        <EnrollStudentsModal
          course={c}
          onClose={() => setShowEnrollModal(false)}
        />
      )}
    </div>
  );
}
