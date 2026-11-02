import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { DEFAULT_CURRICULUM } from '../features/curriculum';

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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(DEFAULT_CURRICULUM[0]?.id || 'subj-biology');

  const progress = getStudentProgress(student.id);
  const completedChapters = progress?.completedChapters || [];
  const completedTopics = progress?.completedTopics || [];

  // Total chapters & topics across curriculum
  let totalChapters = 0;
  let totalTopics = 0;
  DEFAULT_CURRICULUM.forEach(sub => {
    totalChapters += sub.chapters?.length || 0;
    sub.chapters?.forEach(ch => {
      totalTopics += ch.topics?.length || 0;
    });
  });

  const activeSubject = DEFAULT_CURRICULUM.find(s => s.id === selectedSubjectId) || DEFAULT_CURRICULUM[0];

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

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-teal-400/30">
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
              <p className="text-xs font-bold text-teal-200">{completedChapters.length} / {totalChapters}</p>
              <p className="text-[10px] text-teal-100">Chapters Studied</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
              <p className="text-xs font-bold text-emerald-300">{completedTopics.length} / {totalTopics}</p>
              <p className="text-[10px] text-teal-100">Topics Studied</p>
            </div>
          </div>
        </div>
        <div className="italy-accent shrink-0"><div className="green" /><div className="white" /><div className="red" /></div>

        {/* Subject Navigation Tabs */}
        <div className="p-2 border-b border-gray-100 bg-gray-50 flex gap-1.5 overflow-x-auto shrink-0">
          {DEFAULT_CURRICULUM.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
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
            const chapDone = isChapterCompleted(chap.id, student.id);
            const chapTopics = chap.topics || [];
            const completedInChap = chapTopics.filter(t => isTopicCompleted(t.id, student.id)).length;

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
                          <span className="text-[11px] text-gray-800 font-medium truncate">
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

