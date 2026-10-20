import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { EnrollStudentsModal } from '../components/EnrollStudentsModal';

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
    // Decode UTF-8 string properly
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

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const r = resource || { title: 'Document', type: 'PDF', subject: 'General', size: '5 MB', uploaderName: 'Faculty', date: '2024-12-15' };
  
  const mime = (r.mimeType || '').toLowerCase();
  const type = (r.type || '').toLowerCase();
  const fileName = (r.fileName || '').toLowerCase();

  const isVideo = type === 'video' || mime.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.webm');
  const isImage = mime.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');
  const isPDF = type === 'pdf' || mime === 'application/pdf' || fileName.endsWith('.pdf');
  const isText = mime.startsWith('text/') || mime === 'application/json' || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv') || type === 'notes';

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
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()}`;

  const blobUrl = useMemo(() => {
    if (!resource.fileData) return null;
    return fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/pdf');
  }, [resource.fileData, resource.mimeType]);

  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'application/pdf');
    }
  };

  const handleOpenFullscreen = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else if (resource.fileData) {
      const tempUrl = fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/pdf');
      if (tempUrl) window.open(tempUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header 
        title={resource.title} 
        showBack 
        onBack={onBack} 
        gradient={false}
        rightAction={
          <div className="flex items-center gap-2">
            {blobUrl && (
              <button 
                onClick={handleOpenFullscreen} 
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Open in new window / full screen"
              >
                <i className="fas fa-external-link-alt text-[10px]" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            )}
            {resource.fileData && (
              <button 
                onClick={handleDownload} 
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Download PDF"
              >
                <i className="fas fa-download text-[10px]" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        }
      />

      <div className="watermark pointer-events-none select-none">{watermarkText}</div>

      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <i className="fas fa-shield-alt text-yellow-600 text-xs" />
          <p className="text-[11px] text-yellow-800 font-medium">Protected Document • Watermarked</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500">{resource.size}</span>
          <button onClick={handleOpenFullscreen} className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1">
            <i className="fas fa-expand text-[10px]" /> Open in Tab
          </button>
        </div>
      </div>
      
      {blobUrl ? (
        <div className="flex-1 w-full h-full relative overflow-hidden bg-gray-200">
          <object
            data={blobUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <iframe 
              src={blobUrl} 
              className="w-full h-full border-0"
              title={resource.title}
            />
          </object>
          
          {/* Quick fallback button if iframe rendering is restricted by browser */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3">
            <span className="text-[11px] text-gray-600">Viewing PDF Document</span>
            <button 
              onClick={handleOpenFullscreen}
              className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <i className="fas fa-external-link-alt text-[10px]" /> Open Fullscreen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center card max-w-sm p-6 shadow-sm">
            <i className="fas fa-file-pdf text-5xl text-red-500 mb-3" />
            <h3 className="text-base font-bold text-gray-800">{resource.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{resource.subject} • {resource.size}</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
              <p>Uploaded by <span className="font-semibold text-gray-800">{resource.uploaderName}</span> on {resource.date}</p>
              <p className="text-[11px] text-gray-400 mt-1">Direct PDF stream is not available or was stored as placeholder.</p>
            </div>
            {resource.fileData && (
              <button onClick={handleDownload} className="btn-primary mt-4">
                <i className="fas fa-download mr-1.5" />Download PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TEXT / NOTES VIEWER ====================
function TextViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const watermarkText = `${user?.name || 'User'} • ${new Date().toLocaleDateString()}`;

  const textContent = useMemo(() => {
    if (!resource.fileData) return null;
    return extractTextContent(resource.fileData);
  }, [resource.fileData]);

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'text/plain');
    }
  };

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = textContent ? textContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = textContent ? textContent.split('\n').length : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header 
        title={resource.title} 
        showBack 
        onBack={onBack} 
        gradient={false}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="Copy text"
            >
              <i className={`fas ${copied ? 'fa-check text-green-600' : 'fa-copy'} text-[10px]`} />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {resource.fileData && (
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                title="Download document"
              >
                <i className="fas fa-download text-[10px]" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        }
      />

      <div className="watermark pointer-events-none select-none">{watermarkText}</div>

      {/* Info bar */}
      <div className="bg-teal-50/70 border-b border-teal-100 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-teal-800">
          <i className="fas fa-sticky-note text-teal-600 text-xs" />
          <span className="font-semibold">{resource.type || 'Notes'} Document</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span>{lineCount} lines</span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{resource.size}</span>
        </div>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 sm:p-7 min-h-[400px]">
          <div className="border-b border-gray-100 pb-3 mb-4">
            <h1 className="text-lg font-bold text-gray-900">{resource.title}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Subject: <span className="font-semibold text-gray-700">{resource.subject}</span> • Uploaded by {resource.uploaderName} on {resource.date}
            </p>
          </div>

          {textContent ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed font-normal select-text">
              {textContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-file-alt text-4xl mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Text content preview not available.</p>
              <p className="text-xs text-gray-400 mt-1">Please download the file to view its full content.</p>
              {resource.fileData && (
                <button onClick={handleDownload} className="btn-primary max-w-xs mx-auto mt-4">
                  <i className="fas fa-download mr-1.5" />Download Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== IMAGE VIEWER ====================
function ImageViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const watermarkText = `${user?.name || 'User'}`;

  const blobUrl = useMemo(() => {
    if (!resource.fileData) return null;
    return fileDataToBlobUrl(resource.fileData, resource.mimeType || 'image/jpeg');
  }, [resource.fileData, resource.mimeType]);

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'image/jpeg');
    }
  };

  const handleOpenFullscreen = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <Header 
        title={resource.title} 
        showBack 
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-2">
            {blobUrl && (
              <button onClick={handleOpenFullscreen} className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition" title="Open Full Image">
                <i className="fas fa-expand text-[10px] mr-1" />Fullscreen
              </button>
            )}
            {resource.fileData && (
              <button onClick={handleDownload} className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-medium transition" title="Download Image">
                <i className="fas fa-download text-[10px] mr-1" />Download
              </button>
            )}
          </div>
        }
      />
      <div className="watermark text-white/10 pointer-events-none select-none">{watermarkText}</div>
      
      {resource.fileData ? (
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <img 
            src={blobUrl || resource.fileData} 
            alt={resource.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
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
          <p className="text-[10px] text-gray-400">{resource.size} • {resource.subject}</p>
        </div>
        {resource.fileData && (
          <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
            <i className="fas fa-download text-xs" />
            <span>Download</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== VIDEO PLAYER ====================
function VideoPlayer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const watermarkText = `${user?.name || 'User'}`;

  const blobUrl = useMemo(() => {
    if (!resource.fileData) return null;
    return fileDataToBlobUrl(resource.fileData, resource.mimeType || 'video/mp4');
  }, [resource.fileData, resource.mimeType]);

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'video/mp4');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white text-base"><i className="fas fa-arrow-left" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{resource.title}</p>
            <p className="text-gray-300 text-[10px]">{resource.size} • {resource.subject}</p>
          </div>
          {resource.fileData && (
            <button onClick={handleDownload} className="text-white bg-white/20 hover:bg-white/30 text-xs px-2.5 py-1 rounded-lg">
              <i className="fas fa-download mr-1" />Download
            </button>
          )}
        </div>
      </div>
      <div className="watermark text-white/10 pointer-events-none select-none">{watermarkText}</div>
      
      {resource.fileData ? (
        <div className="flex-1 flex items-center justify-center p-2">
          <video 
            src={blobUrl || resource.fileData} 
            controls 
            className="max-w-full max-h-full rounded-lg shadow-xl"
            controlsList="nodownload"
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
          <p className="text-[11px] text-gray-400">Protected Video Playback</p>
        </div>
        {resource.fileData && (
          <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-medium">
            <i className="fas fa-download mr-1" />Save Video
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== FILE VIEWER (for Word, Excel, PPT, etc.) ====================
function FileViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const watermarkText = `${user?.name || 'User'} • ${new Date().toLocaleDateString()}`;

  const blobUrl = useMemo(() => {
    if (!resource.fileData) return null;
    return fileDataToBlobUrl(resource.fileData, resource.mimeType || 'application/octet-stream');
  }, [resource.fileData, resource.mimeType]);

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'application/octet-stream');
    }
  };

  const handleOpenBrowser = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const getFileIcon = () => {
    const fn = (resource.fileName || '').toLowerCase();
    const type = (resource.type || '').toLowerCase();
    if (fn.endsWith('.doc') || fn.endsWith('.docx')) return 'fa-file-word text-blue-600';
    if (fn.endsWith('.xls') || fn.endsWith('.xlsx')) return 'fa-file-excel text-green-600';
    if (fn.endsWith('.ppt') || fn.endsWith('.pptx')) return 'fa-file-powerpoint text-orange-600';
    if (type === 'pyq' || type === 'q.paper') return 'fa-file-alt text-purple-500';
    if (type === 'assignment') return 'fa-tasks text-green-500';
    if (type === 'notes') return 'fa-sticky-note text-yellow-500';
    if (type === 'syllabus') return 'fa-list text-blue-500';
    return 'fa-file text-teal-600';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header 
        title={resource.title} 
        showBack 
        onBack={onBack} 
        gradient={false}
        rightAction={
          resource.fileData && (
            <button onClick={handleDownload} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition">
              <i className="fas fa-download text-[10px]" />
              <span>Download</span>
            </button>
          )
        }
      />
      <div className="watermark pointer-events-none select-none">{watermarkText}</div>
      
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <i className={`fas ${getFileIcon()} text-4xl`} />
          </div>
          
          <h2 className="text-lg font-bold text-gray-800 mb-1">{resource.title}</h2>
          <p className="text-xs text-gray-500 mb-4">{resource.subject} • {resource.examCategory || 'General'}</p>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Document Type</span>
              <span className="font-semibold text-gray-800 badge badge-teal">{resource.type || 'Document'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">File Size</span>
              <span className="font-semibold text-gray-700">{resource.size}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Uploaded By</span>
              <span className="font-semibold text-gray-700">{resource.uploaderName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Upload Date</span>
              <span className="font-semibold text-gray-700">{resource.date}</span>
            </div>
            {resource.fileName && (
              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-500">File Name</span>
                <span className="font-medium text-gray-700 truncate ml-2 max-w-[180px]">{resource.fileName}</span>
              </div>
            )}
          </div>

          {resource.fileData ? (
            <div className="space-y-2">
              <button onClick={handleDownload} className="btn-primary flex items-center justify-center gap-2 shadow-sm">
                <i className="fas fa-download" />
                <span>Download Document ({resource.size})</span>
              </button>
              {blobUrl && (
                <button 
                  onClick={handleOpenBrowser} 
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <i className="fas fa-external-link-alt text-[10px]" />
                  <span>Open Document in Browser</span>
                </button>
              )}
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
  );
}

// ==================== COURSE DETAIL ====================
export function CourseDetail({ onBack, course, onNavigate }: { onBack: () => void; course?: any; onNavigate: (screen: string, data?: any) => void }) {
  const { user } = useAuth();
  const { resources, users } = useData();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const c = course;

  if (!c) return (
    <div>
      <Header title="Course" showBack onBack={onBack} gradient={false} />
      <div className="p-4"><p className="text-sm text-gray-500 text-center">Course not found</p></div>
    </div>
  );

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';
  const courseResources = resources.filter(r => r.courseId === c.id);
  const facultyMembers = users.filter(u => c.facultyIds?.includes(u.id));
  const enrolledStudents = users.filter(u => c.studentIds?.includes(u.id));

  return (
    <div>
      <Header 
        title={c.name} 
        showBack 
        onBack={onBack} 
        rightAction={
          isFacultyOrAdmin && (
            <button 
              onClick={() => setShowEnrollModal(true)} 
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Enroll students into course"
            >
              <i className="fas fa-user-plus text-[10px]" />
              <span>Enroll</span>
            </button>
          )
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
        </div>

        {/* Subjects */}
        <div className="card mb-0">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Subjects</h3>
          <div className="flex flex-wrap gap-1.5">
            {(c.subjects || []).map((s: string) => (
              <span key={s} className="badge badge-teal text-xs">{s}</span>
            ))}
          </div>
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
