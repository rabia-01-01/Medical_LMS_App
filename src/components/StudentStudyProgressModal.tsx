import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { DEFAULT_CURRICULUM, useCurriculum } from '../features/curriculum';

export interface StudentStudyProgressModalProps {
  student: {
    id: string;
    name: string;
    email?: string;
    batch?: string;
    avatar?: string;
  };
  onClose: () => void;
}

export function StudentStudyProgressModal({ student, onClose }: StudentStudyProgressModalProps) {
  const { isChapterCompleted, isTopicCompleted, getStudentProgress } = useData();
  const { curriculum } = useCurriculum();
  const effectiveCurriculum = (curriculum && curriculum.length > 0) ? curriculum : DEFAULT_CURRICULUM;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(effectiveCurriculum[0]?.id || 'subj-biology');
  const [activeFilter, setActiveFilter] = useState<'all' | 'studied-topics' | 'studied-chapters'>('all');

  const progress = getStudentProgress(student.id);
  const completedChapters = progress?.completedChapters || [];
  const completedTopics = progress?.completedTopics || [];

  // Total chapters & topics across curriculum
  let totalChapters = 0;
  let totalTopics = 0;
  effectiveCurriculum.forEach(sub => {
    totalChapters += sub.chapters?.length || 0;
    sub.chapters?.forEach(ch => {
      totalTopics += ch.topics?.length || 0;
    });
  });

  // Build full detail list of studied topics
  const studiedTopicsList: {
    id: string;
    name: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    chapterName: string;
    chapterNumber: number;
    topicNumber: number;
  }[] = [];

  // Build full detail list of studied chapters
  const studiedChaptersList: {
    id: string;
    name: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    chapterNumber: number;
    totalTopics: number;
    studiedTopicsCount: number;
  }[] = [];

  // Scan through live curriculum (and fallback)
  effectiveCurriculum.forEach((sub) => {
    sub.chapters?.forEach((chap, cIdx) => {
      const isChapDone = isChapterCompleted(chap.id, student.id);
      const chapTopics = chap.topics || [];
      const doneInChap = chapTopics.filter(t => isTopicCompleted(t.id, student.id)).length;

      if (isChapDone) {
        studiedChaptersList.push({
          id: chap.id,
          name: chap.name,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          chapterNumber: cIdx + 1,
          totalTopics: chapTopics.length,
          studiedTopicsCount: doneInChap,
        });
      }

      chapTopics.forEach((top, tIdx) => {
        const isDone = isTopicCompleted(top.id, student.id);
        if (isDone) {
          studiedTopicsList.push({
            id: top.id,
            name: top.name,
            subjectId: sub.id,
            subjectName: sub.name,
            subjectCode: sub.code,
            chapterName: chap.name,
            chapterNumber: cIdx + 1,
            topicNumber: tIdx + 1,
          });
        }
      });
    });
  });

  // Reconcile with completedTopicDetails if any verified topic was marked
  (progress?.completedTopicDetails || []).forEach((d) => {
    if (!d.id) return;
    // Strip dummy mock IDs or raw UUID strings
    if (d.id === 'top-bio-101' || d.id === 'top-bio-102' || d.id === 'top-bio-201') return;
    if (d.name && d.name.includes('-') && d.name.length > 25) return;
    
    // Check if already in studiedTopicsList
    if (studiedTopicsList.some(st => st.id === d.id)) return;

    // Try finding within effectiveCurriculum
    for (const sub of effectiveCurriculum) {
      for (let cIdx = 0; cIdx < (sub.chapters || []).length; cIdx++) {
        const chap = sub.chapters[cIdx];
        const tIdx = (chap.topics || []).findIndex(top => top.id === d.id || top.name.toLowerCase() === (d.name || '').toLowerCase());
        if (tIdx !== -1) {
          const top = chap.topics[tIdx];
          studiedTopicsList.push({
            id: top.id,
            name: top.name,
            subjectId: sub.id,
            subjectName: sub.name,
            subjectCode: sub.code,
            chapterName: chap.name,
            chapterNumber: cIdx + 1,
            topicNumber: tIdx + 1,
          });
          return;
        }
      }
    }
  });

  const activeSubject = effectiveCurriculum.find(s => s.id === selectedSubjectId) || effectiveCurriculum[0];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-[420px] w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="gradient-header p-4 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition"
          >
            <i className="fas fa-times" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0 border border-white/20 shadow-xs">
              {student.avatar || '👩‍🎓'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="badge bg-teal-400/30 text-teal-200 text-[10px] font-bold py-0.5 px-2 rounded-full border border-teal-300/30">
                  {student.batch || 'Batch 1 (Dec)'}
                </span>
                <span className="badge bg-white/20 text-white text-[10px] font-semibold py-0.5 px-2 rounded-full">
                  Student Record
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white truncate mt-0.5">
                {student.name}
              </h2>
              {student.email && (
                <p className="text-teal-100 text-[11px] truncate">{student.email}</p>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar - Interactive Drilldown */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-teal-400/30">
            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'studied-chapters' ? 'all' : 'studied-chapters')}
              className={`rounded-xl p-2 text-center transition cursor-pointer border text-left flex flex-col items-center justify-center ${
                activeFilter === 'studied-chapters'
                  ? 'bg-white/30 border-white ring-2 ring-teal-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 border-white/10'
              }`}
              title="Click to inspect studied chapters"
            >
              <p className="text-xs font-bold text-teal-200">{studiedChaptersList.length} / {totalChapters}</p>
              <p className="text-[10px] text-teal-100 flex items-center justify-center gap-1">
                <span>Chapters Studied</span>
                <i className={`fas ${activeFilter === 'studied-chapters' ? 'fa-chevron-up' : 'fa-chevron-down'} text-[8px] opacity-75`} />
              </p>
              <span className="text-[9px] text-teal-200/80 font-medium mt-0.5">(Click to View)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'studied-topics' ? 'all' : 'studied-topics')}
              className={`rounded-xl p-2 text-center transition cursor-pointer border text-left flex flex-col items-center justify-center ${
                activeFilter === 'studied-topics'
                  ? 'bg-emerald-500/30 border-emerald-300 ring-2 ring-emerald-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 border-white/10'
              }`}
              title="Click to view which topics are studied"
            >
              <p className="text-xs font-bold text-emerald-300">{studiedTopicsList.length} / {totalTopics}</p>
              <p className="text-[10px] text-teal-100 flex items-center justify-center gap-1">
                <span>Topics Studied</span>
                <i className={`fas ${activeFilter === 'studied-topics' ? 'fa-chevron-up' : 'fa-search'} text-[8px] opacity-75`} />
              </p>
              <span className="text-[9px] text-emerald-200/90 font-medium mt-0.5">(Click to View)</span>
            </button>
          </div>
        </div>
        <div className="italy-accent shrink-0"><div className="green" /><div className="white" /><div className="red" /></div>

        {/* Dedicated Studied Topics Inspector (When clicking "Topics Studied") */}
        {activeFilter === 'studied-topics' && (
          <div className="p-3 bg-emerald-50 border-b-2 border-emerald-300 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-2xs">
                  <i className="fas fa-check" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950">
                    Topics Studied by {student.name} ({studiedTopicsList.length})
                  </h4>
                  <p className="text-[10px] text-emerald-700">Detailed list of topics completed by student</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 transition"
              >
                Close View
              </button>
            </div>

            {studiedTopicsList.length === 0 ? (
              <div className="p-3 bg-white rounded-xl text-center text-xs text-gray-500 border border-emerald-100">
                <i className="fas fa-info-circle text-gray-400 mr-1.5" />
                No topics marked as studied yet for this student.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {studiedTopicsList.map((st, sIdx) => (
                  <div
                    key={st.id || sIdx}
                    onClick={() => {
                      if (st.subjectId && effectiveCurriculum.some(s => s.id === st.subjectId)) {
                        setSelectedSubjectId(st.subjectId);
                      }
                    }}
                    className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-2 hover:border-emerald-400 transition cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge bg-teal-100 text-teal-800 text-[9px] font-bold py-0.2 px-1.5 rounded">
                          {st.subjectName} ({st.subjectCode})
                        </span>
                        <span className="badge bg-gray-100 text-gray-600 text-[9px] font-medium py-0.2 px-1.5 rounded">
                          Ch {st.chapterNumber}: {st.chapterName}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mt-1 truncate">
                        {st.name}
                      </p>
                    </div>
                    <span className="badge bg-emerald-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs">
                      <i className="fas fa-check text-[9px]" />
                      <span>Studied</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dedicated Studied Chapters Inspector (When clicking "Chapters Studied") */}
        {activeFilter === 'studied-chapters' && (
          <div className="p-3 bg-teal-50 border-b-2 border-teal-300 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs shadow-2xs">
                  <i className="fas fa-book-open" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-teal-950">
                    Chapters Studied by {student.name} ({studiedChaptersList.length})
                  </h4>
                  <p className="text-[10px] text-teal-700">Curriculum chapters marked complete</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="text-[10px] font-bold text-teal-800 bg-white hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-300 transition"
              >
                Close View
              </button>
            </div>

            {studiedChaptersList.length === 0 ? (
              <div className="p-3 bg-white rounded-xl text-center text-xs text-gray-500 border border-teal-100">
                <i className="fas fa-info-circle text-gray-400 mr-1.5" />
                No chapters marked as complete yet for this student.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {studiedChaptersList.map((sc, scIdx) => (
                  <div
                    key={sc.id || scIdx}
                    onClick={() => {
                      if (sc.subjectId && effectiveCurriculum.some(s => s.id === sc.subjectId)) {
                        setSelectedSubjectId(sc.subjectId);
                      }
                    }}
                    className="p-2.5 bg-white rounded-xl border border-teal-200 shadow-2xs flex items-center justify-between gap-2 hover:border-teal-400 transition cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="badge bg-teal-100 text-teal-800 text-[9px] font-bold py-0.2 px-1.5 rounded">
                        {sc.subjectName} ({sc.subjectCode})
                      </span>
                      <p className="text-xs font-bold text-gray-900 mt-1 truncate">
                        Ch {sc.chapterNumber}: {sc.name}
                      </p>
                    </div>
                    <span className="badge bg-teal-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg flex items-center gap-1 shrink-0">
                      <i className="fas fa-check text-[9px]" />
                      <span>{sc.studiedTopicsCount}/{sc.totalTopics} Topics</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subject Navigation Tabs - Clean Non-scrolling Wrap */}
        <div className="p-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-1.5 shrink-0 overflow-x-hidden no-scrollbar">
          {effectiveCurriculum.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedSubjectId === sub.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Scrollable Curriculum Chapters & Topics Status */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {activeSubject?.name} Chapters & Topics
            </h3>
            <span className="text-[10px] text-gray-500 font-medium">
              {activeSubject?.chapters?.length || 0} chapters
            </span>
          </div>

          {activeSubject?.chapters?.map((chap, cIdx) => {
            const chapDone = isChapterCompleted(chap.id, student.id) || isChapterCompleted(chap.name, student.id);
            const chapTopics = chap.topics || [];
            const completedInChap = chapTopics.filter(t => isTopicCompleted(t.id, student.id) || isTopicCompleted(t.name, student.id)).length;

            return (
              <div
                key={chap.id}
                className={`p-3 rounded-2xl border transition ${
                  chapDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Chapter Status Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        Ch {cIdx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {chap.name}
                      </h4>
                    </div>
                    {chap.description && (
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{chap.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                      chapDone
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    <i className={`fas ${chapDone ? 'fa-check-circle text-emerald-600' : 'fa-clock text-gray-400'} text-[9px]`} />
                    <span>{chapDone ? 'Studied' : 'Not Studied'}</span>
                  </span>
                </div>

                {/* Topics Breakdown */}
                <div className="bg-white/80 rounded-xl p-2 border border-gray-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold px-1">
                    <span>Topic Breakdown:</span>
                    <span>{completedInChap} / {chapTopics.length} Studied</span>
                  </div>

                  {chapTopics.map((top, tIdx) => {
                    const topDone = isTopicCompleted(top.id, student.id);
                    return (
                      <div
                        key={top.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs ${
                          topDone ? 'bg-emerald-50/70 border border-emerald-100' : 'bg-gray-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-[10px] text-gray-400 font-bold shrink-0">
                            {cIdx + 1}.{tIdx + 1}
                          </span>
                          <span className="text-[11px] text-gray-800 font-medium leading-snug">
                            {top.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1 ${
                            topDone
                              ? 'bg-emerald-200/60 text-emerald-800'
                              : 'bg-gray-200/60 text-gray-500'
                          }`}
                        >
                          <i className={`fas ${topDone ? 'fa-check text-emerald-600' : 'fa-minus text-gray-400'} text-[8px]`} />
                          <span>{topDone ? 'Studied' : 'Pending'}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Done Reviewing
          </button>
        </div>
      </motion.div>
    </div>
  );
}

