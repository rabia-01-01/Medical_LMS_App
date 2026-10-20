import React, { useState } from 'react';
import { Header } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// Helper function to download base64 file
function downloadFile(fileData: string, fileName: string, mimeType: string) {
  const byteCharacters = atob(fileData.split(',')[1]);
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
}

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const r = resource || { title: 'Document', type: 'PDF', subject: 'General', size: '5 MB', uploaderName: 'Faculty', date: '2024-12-15' };
  
  // Determine viewer based on file type/mimeType
  const isVideo = r.type === 'Video' || r.mimeType?.startsWith('video/');
  const isImage = r.mimeType?.startsWith('image/');
  const isPDF = r.type === 'PDF' || r.mimeType === 'application/pdf';
  
  if (isVideo) return <VideoPlayer onBack={onBack} resource={r} />;
  if (isImage) return <ImageViewer onBack={onBack} resource={r} />;
  if (isPDF) return <PDFViewer onBack={onBack} resource={r} />;
  return <FileViewer onBack={onBack} resource={r} />;
}

// ==================== PDF VIEWER ====================
function PDFViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const displayUser = isViewingAs ? viewingAsUser : user;
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()}`;

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'application/pdf');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header title={resource.title} showBack onBack={onBack} gradient={false} />
      <div className="watermark">{watermarkText}</div>
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-shield-alt text-yellow-600 text-xs" />
          <p className="text-[10px] text-yellow-700">Protected document • Watermarked</p>
        </div>
        {resource.fileData && (
          <button onClick={handleDownload} className="text-[10px] text-teal-600 font-medium">
            <i className="fas fa-download mr-1" />Download
          </button>
        )}
      </div>
      
      {resource.fileData ? (
        <div className="flex-1 overflow-hidden">
          <iframe 
            src={resource.fileData} 
            className="w-full h-full border-0"
            title={resource.title}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <i className="fas fa-file-pdf text-5xl text-red-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">{resource.title}</p>
            <p className="text-xs text-gray-500 mt-1">{resource.size}</p>
            <p className="text-xs text-gray-400 mt-2">File data not available</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== IMAGE VIEWER ====================
function ImageViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const watermarkText = `${user?.name || 'User'}`;

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'image/jpeg');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <Header title={resource.title} showBack onBack={onBack} />
      <div className="watermark text-white/10">{watermarkText}</div>
      
      {resource.fileData ? (
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <img 
            src={resource.fileData} 
            alt={resource.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-image text-5xl text-gray-400 mb-3" />
            <p className="text-sm text-gray-300">Image not available</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-300">{resource.fileName}</p>
          <p className="text-[10px] text-gray-500">{resource.size}</p>
        </div>
        {resource.fileData && (
          <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium">
            <i className="fas fa-download mr-1" />Download
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

  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'video/mp4');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white"><i className="fas fa-arrow-left" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{resource.title}</p>
            <p className="text-gray-300 text-[10px]">{resource.size}</p>
          </div>
        </div>
      </div>
      <div className="watermark text-white/10">{watermarkText}</div>
      
      {resource.fileData ? (
        <div className="flex-1 flex items-center justify-center">
          <video 
            src={resource.fileData} 
            controls 
            className="max-w-full max-h-full"
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
          <i className="fas fa-lock text-teal-400 text-[10px]" />
          <p className="text-[10px] text-gray-400">Protected playback</p>
        </div>
        {resource.fileData && (
          <button onClick={handleDownload} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-medium">
            <i className="fas fa-download mr-1" />Download
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== FILE VIEWER (for Excel, Word, etc.) ====================
function FileViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  
  const handleDownload = () => {
    if (resource.fileData && resource.fileName) {
      downloadFile(resource.fileData, resource.fileName, resource.mimeType || 'application/octet-stream');
    }
  };

  const getFileIcon = () => {
    const type = resource.type?.toLowerCase();
    if (type === 'pyq' || type === 'q.paper') return 'fa-file-alt text-purple-500';
    if (type === 'assignment') return 'fa-tasks text-green-500';
    if (type === 'notes') return 'fa-sticky-note text-yellow-500';
    if (type === 'syllabus') return 'fa-list text-blue-500';
    return 'fa-file text-gray-500';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title={resource.title} showBack onBack={onBack} gradient={false} />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
            <i className={`fas ${getFileIcon()} text-4xl`} />
          </div>
          
          <h2 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h2>
          
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Type</span>
                <span className="text-xs font-medium text-gray-700">{resource.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Size</span>
                <span className="text-xs font-medium text-gray-700">{resource.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Subject</span>
                <span className="text-xs font-medium text-gray-700">{resource.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Uploaded by</span>
                <span className="text-xs font-medium text-gray-700">{resource.uploaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Date</span>
                <span className="text-xs font-medium text-gray-700">{resource.date}</span>
              </div>
              {resource.fileName && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">File</span>
                  <span className="text-xs font-medium text-gray-700 truncate ml-2">{resource.fileName}</span>
                </div>
              )}
            </div>
          </div>

          {resource.fileData ? (
            <button onClick={handleDownload} className="btn-primary">
              <i className="fas fa-download mr-2" />Download File
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <i className="fas fa-exclamation-triangle text-yellow-600 mb-2" />
              <p className="text-xs text-yellow-700">File data not available. Please contact your instructor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== COURSE DETAIL ====================
export function CourseDetail({ onBack, course, onNavigate }: { onBack: () => void; course?: any; onNavigate: (screen: string, data?: any) => void }) {
  const { resources, users } = useData();
  const c = course;

  if (!c) return (
    <div>
      <Header title="Course" showBack onBack={onBack} gradient={false} />
      <div className="p-4"><p className="text-sm text-gray-500 text-center">Course not found</p></div>
    </div>
  );

  const courseResources = resources.filter(r => r.courseId === c.id);
  const facultyMembers = users.filter(u => c.facultyIds?.includes(u.id));

  return (
    <div>
      <Header title={c.name} showBack onBack={onBack} />
      <div className="p-4">
        <div className="card mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}>
              <i className={`fas ${c.icon} text-2xl`} style={{ color: c.color }} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{c.name}</h2>
              <p className="text-xs text-gray-500">{c.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-teal-600">{c.studentIds?.length || 0}</p><p className="text-[10px] text-gray-500">Students</p></div>
            <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-teal-600">{c.duration}</p><p className="text-[10px] text-gray-500">Duration</p></div>
            <div className="bg-gray-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-teal-600">{c.subjects?.length || 0}</p><p className="text-[10px] text-gray-500">Subjects</p></div>
          </div>
        </div>
        <div className="card mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Subjects</h3>
          <div className="flex flex-wrap gap-2">{(c.subjects || []).map((s: string) => (<span key={s} className="badge badge-teal">{s}</span>))}</div>
        </div>
        {facultyMembers.length > 0 && (
          <div className="card mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Faculty</h3>
            <div className="space-y-2">{facultyMembers.map((f) => (<div key={f.id} className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">{f.avatar}</div><span className="text-xs text-gray-700">{f.name}</span></div>))}</div>
          </div>
        )}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Resources ({courseResources.length})</h3>
          {courseResources.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No resources available</p>
          ) : (
            <div className="space-y-2">
              {courseResources.slice(0, 5).map((r) => (
                <button key={r.id} onClick={() => onNavigate('resource-view', r)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
                  <i className={`fas ${r.type === 'Video' ? 'fa-play-circle text-blue-500' : 'fa-file-pdf text-red-500'}`} />
                  <span className="text-xs text-gray-700 flex-1 text-left">{r.title}</span>
                  <i className="fas fa-chevron-right text-gray-300 text-[10px]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
