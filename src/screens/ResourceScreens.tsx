import React, { useState } from 'react';
import { Header } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const r = resource || { title: 'Document', type: 'PDF', subject: 'General', size: '5 MB', uploaderName: 'Faculty', date: '2024-12-15' };
  if (r.type === 'Video') return <VideoPlayer onBack={onBack} resource={r} />;
  return <PDFViewer onBack={onBack} resource={r} />;
}

// ==================== PDF VIEWER ====================
function PDFViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const displayUser = isViewingAs ? viewingAsUser : user;
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()}`;

  setTimeout(() => setIsLoading(false), 1200);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header title={resource.title} showBack onBack={onBack} gradient={false} />
      <div className="watermark">{watermarkText}</div>
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
        <i className="fas fa-shield-alt text-yellow-600 text-xs" />
        <p className="text-[10px] text-yellow-700">Protected document • Download restricted • Watermarked</p>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading document...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[600px] select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">{resource.title}</h2>
              <p className="text-xs text-gray-500 mt-1">Subject: {resource.subject} | By: {resource.uploaderName}</p>
              <div className="w-full h-0.5 bg-gray-200 mt-4" />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800">1. Introduction</h3>
              <p className="text-xs text-gray-600 leading-relaxed">This document contains study material for the enrolled course. Content is protected and watermarked for security purposes. All access is logged and monitored.</p>
              <h3 className="text-sm font-bold text-gray-800">2. Key Concepts</h3>
              <p className="text-xs text-gray-600 leading-relaxed">The fundamental principles covered in this material are essential for examination preparation. Students should review these concepts thoroughly and practice related questions.</p>
              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                <p className="text-xs font-semibold text-blue-800 mb-1">Key Concept</p>
                <p className="text-xs text-blue-700">Understanding the core principles is crucial for success in medical entrance examinations.</p>
              </div>
              <h3 className="text-sm font-bold text-gray-800">3. Practice Questions</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Attempt the practice questions at the end of each section to test your understanding. Review incorrect answers and revisit the relevant theory.</p>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-400">Page {currentPage} of 24</p>
              <p className="text-[9px] text-gray-300 mt-1">© Sultanat e Italia Medica</p>
            </div>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50"><i className="fas fa-chevron-left" /> Prev</button>
          <span className="text-xs text-gray-500">Page {currentPage} / 24</span>
          <button onClick={() => setCurrentPage(Math.min(24, currentPage + 1))} disabled={currentPage === 24} className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50">Next <i className="fas fa-chevron-right" /></button>
        </div>
      )}
    </div>
  );
}

// ==================== VIDEO PLAYER ====================
function VideoPlayer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const watermarkText = `${user?.name || 'User'}`;

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => { if (prev >= 100) { setIsPlaying(false); return 100; } return prev + 0.5; });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white"><i className="fas fa-arrow-left" /></button>
          <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{resource.title}</p></div>
        </div>
      </div>
      <div className="watermark text-white/10">{watermarkText}</div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-play text-3xl text-white ml-1" />
          </div>
          <p className="text-white/60 text-xs">Lecture Video</p>
          <p className="text-white/40 text-[10px] mt-1">Private streaming • Authorized access only</p>
        </div>
      </div>
      <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8">
        <div className="mb-3">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-white/70"><i className="fas fa-backward" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black text-sm`} />
            </button>
            <button className="text-white/70"><i className="fas fa-forward" /></button>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
        <i className="fas fa-lock text-teal-400 text-[10px]" />
        <p className="text-[10px] text-gray-400">Protected playback • Short-lived authorization</p>
      </div>
    </div>
  );
}

// ==================== COURSE DETAIL ====================
export function CourseDetail({ onBack, course, onNavigate }: { onBack: () => void; course?: any; onNavigate: (screen: string) => void }) {
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
                <button key={r.id} onClick={() => onNavigate('resource-view')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
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
