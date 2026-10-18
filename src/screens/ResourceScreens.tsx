import React, { useState } from 'react';
import { Header } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

// ==================== RESOURCE VIEWER ====================
export function ResourceViewer({ onBack, resource }: { onBack: () => void; resource?: any }) {
  const r = resource || { title: 'Human Anatomy Complete Notes', type: 'PDF', subject: 'Anatomy', size: '15.2 MB', uploader: 'Dr. Singh', date: '2024-12-15' };
  
  if (r.type === 'Video') {
    return <VideoPlayer onBack={onBack} resource={r} />;
  }
  
  return <PDFViewer onBack={onBack} resource={r} />;
}

// ==================== PDF VIEWER ====================
function PDFViewer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 24;
  
  const displayUser = isViewingAs ? viewingAsUser : user;
  const watermarkText = `${displayUser?.name || 'User'} • ${new Date().toLocaleDateString()} • SIM`;

  setTimeout(() => setIsLoading(false), 1500);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <Header title={resource.title} showBack onBack={onBack} gradient={false} />
      
      {/* Watermark */}
      <div className="watermark">{watermarkText}</div>
      
      {/* Security Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
        <i className="fas fa-shield-alt text-yellow-600 text-xs" />
        <p className="text-[10px] text-yellow-700">Protected document • Download and print restricted • Watermarked</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading document...</p>
            <p className="text-[10px] text-gray-400 mt-1">Verifying access permissions</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Simulated PDF Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[600px] select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">{resource.title}</h2>
              <p className="text-xs text-gray-500 mt-1">Subject: {resource.subject} | Uploaded by: {resource.uploader}</p>
              <div className="w-full h-0.5 bg-gray-200 mt-4" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800">1. Introduction to Human Anatomy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Human anatomy is the study of the structure of the human body. It is a branch of biology and medicine that deals with the identification and description of the body shapes and positions of all its parts. The study of anatomy dates back to prehistoric times and has been closely linked to medicine throughout history.
              </p>
              
              <h3 className="text-sm font-bold text-gray-800">2. Anatomical Terminology</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Standard anatomical terms are used to describe the position and orientation of body structures. The anatomical position serves as the standard reference point. Key directional terms include: superior/inferior, anterior/posterior, medial/lateral, proximal/distal, and superficial/deep.
              </p>

              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                <p className="text-xs font-semibold text-blue-800 mb-1">Key Concept</p>
                <p className="text-xs text-blue-700">The human body has 11 major organ systems that work together to maintain homeostasis and support life functions.</p>
              </div>

              <h3 className="text-sm font-bold text-gray-800">3. Body Planes and Sections</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Three primary planes are used to section the body for study: the sagittal plane (divides left and right), the coronal/frontal plane (divides anterior and posterior), and the transverse/horizontal plane (divides superior and inferior).
              </p>

              {/* Simulated diagram placeholder */}
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <i className="fas fa-image text-3xl text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">Figure 3.1: Anatomical Planes</p>
                <p className="text-[10px] text-gray-300">[Diagram protected - view in app only]</p>
              </div>

              <h3 className="text-sm font-bold text-gray-800">4. Major Organ Systems</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Skeletal System', 'Muscular System', 'Nervous System', 'Cardiovascular', 'Respiratory', 'Digestive', 'Endocrine', 'Immune System'].map((system) => (
                  <div key={system} className="bg-teal-50 rounded p-2 text-center">
                    <p className="text-[10px] font-medium text-teal-700">{system}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-400">Page {currentPage} of {totalPages}</p>
              <p className="text-[9px] text-gray-300 mt-1">© Sultanat e Italia Medica - Protected Material</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Navigation */}
      {!isLoading && (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50"
          >
            <i className="fas fa-chevron-left" /> Prev
          </button>
          <span className="text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded text-xs disabled:opacity-50"
          >
            Next <i className="fas fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== VIDEO PLAYER ====================
function VideoPlayer({ onBack, resource }: { onBack: () => void; resource: any }) {
  const { user, isViewingAs, viewingAsUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [showControls, setShowControls] = useState(true);

  const displayUser = isViewingAs ? viewingAsUser : user;
  const watermarkText = `${displayUser?.name || 'User'} • SIM`;

  // Simulate playback
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 0.5;
      });
      setCurrentTime(prev => {
        const parts = prev.split(':');
        let mins = parseInt(parts[0]);
        let secs = parseInt(parts[1]) + 1;
        if (secs >= 60) { mins++; secs = 0; }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white">
            <i className="fas fa-arrow-left" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{resource.title}</p>
            <p className="text-gray-300 text-[10px]">{resource.duration || '1:23:45'}</p>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="watermark text-white/10">{watermarkText}</div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center relative" onClick={() => setShowControls(!showControls)}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <i className="fas fa-play text-3xl text-white ml-1" />
          </div>
          <p className="text-white/60 text-xs">Lecture Video</p>
          <p className="text-white/40 text-[10px] mt-1">Private streaming • Authorized access only</p>
        </div>

        {/* Play/Pause Overlay */}
        {showControls && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-xl ${isPlaying ? '' : 'ml-1'}`} />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/60">{currentTime}</span>
            <span className="text-[10px] text-white/60">{resource.duration || '1:23:45'}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-white/70"><i className="fas fa-backward" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-black text-sm ${isPlaying ? '' : 'ml-0.5'}`} />
            </button>
            <button className="text-white/70"><i className="fas fa-forward" /></button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/70 text-xs">1x</button>
            <button className="text-white/70"><i className="fas fa-expand" /></button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
        <i className="fas fa-lock text-teal-400 text-[10px]" />
        <p className="text-[10px] text-gray-400">Protected playback • Short-lived authorization • Screen recording deterred where supported</p>
      </div>
    </div>
  );
}

// ==================== COURSE DETAIL ====================
export function CourseDetail({ onBack, course, onNavigate }: { onBack: () => void; course?: any; onNavigate: (screen: string) => void }) {
  const c = course || { name: 'NEET Foundation', category: 'NEET', description: 'Complete foundation course covering all NEET subjects', subjects: ['Physics', 'Chemistry', 'Biology'], faculty: ['Dr. Sharma', 'Dr. Gupta'], students: 245, duration: '12 months', icon: 'fa-book-medical', color: '#0d9488' };

  return (
    <div>
      <Header title={c.name} showBack onBack={onBack} />
      <div className="p-4">
        {/* Course Info */}
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
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.students}</p>
              <p className="text-[10px] text-gray-500">Students</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.duration}</p>
              <p className="text-[10px] text-gray-500">Duration</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-teal-600">{c.subjects?.length || 3}</p>
              <p className="text-[10px] text-gray-500">Subjects</p>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="card mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Subjects Covered</h3>
          <div className="flex flex-wrap gap-2">
            {(c.subjects || []).map((s: string) => (
              <span key={s} className="badge badge-teal">{s}</span>
            ))}
          </div>
        </div>

        {/* Faculty */}
        <div className="card mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Faculty</h3>
          <div className="space-y-2">
            {(c.faculty || []).map((f: string) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">👨‍⚕️</div>
                <span className="text-xs text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Content */}
        <div className="card mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Course Content</h3>
          <div className="space-y-2">
            {[
              { title: 'Video Lectures', count: 45, icon: 'fa-play-circle text-blue-500' },
              { title: 'Study Notes (PDF)', count: 23, icon: 'fa-file-pdf text-red-500' },
              { title: 'Practice Questions', count: 500, icon: 'fa-question-circle text-purple-500' },
              { title: 'Mock Tests', count: 8, icon: 'fa-clipboard-check text-green-500' },
              { title: 'Previous Year Papers', count: 5, icon: 'fa-file-alt text-orange-500' },
            ].map((item, i) => (
              <button key={i} onClick={() => onNavigate('resources')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100">
                <i className={`fas ${item.icon}`} />
                <span className="text-xs text-gray-700 flex-1 text-left">{item.title}</span>
                <span className="text-xs text-gray-400">{item.count}</span>
                <i className="fas fa-chevron-right text-gray-300 text-[10px]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
