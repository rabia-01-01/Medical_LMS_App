import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurriculum } from './useCurriculum';
import type { ChapterWithTopics, SubjectWithChapters } from './types';

interface CurriculumBrowserProps {
  initialSubjectId?: string;
  onSelectTopic?: (topicId: string, topicName: string) => void;
  canManage?: boolean;
}

export function CurriculumBrowser({
  initialSubjectId,
  onSelectTopic,
  canManage = false,
}: CurriculumBrowserProps) {
  const { user } = useAuth();
  const {
    curriculum,
    activeSubject,
    activeSubjectId,
    setActiveSubjectId,
    chapters,
    isLoading,
    addChapter,
    addTopic,
    removeChapter,
    removeTopic,
  } = useCurriculum(initialSubjectId);

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');
  const [addingTopicChapterId, setAddingTopicChapterId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFacultyOrAdmin = canManage || user?.role === 'faculty' || user?.role === 'admin';

  // Auto-expand first chapter when chapters load
  React.useEffect(() => {
    if (chapters.length > 0 && !expandedChapterId) {
      setExpandedChapterId(chapters[0].id);
    }
  }, [chapters, expandedChapterId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId(prev => (prev === chapterId ? null : chapterId));
  };

  const handleCreateChapter = async () => {
    if (!newChapterName.trim()) return;
    setIsSubmitting(true);
    await addChapter({
      name: newChapterName.trim(),
      description: newChapterDesc.trim() || undefined,
      displayOrder: chapters.length + 1,
    });
    setNewChapterName('');
    setNewChapterDesc('');
    setShowAddChapter(false);
    setIsSubmitting(false);
  };

  const handleCreateTopic = async (chapterId: string) => {
    if (!newTopicName.trim()) return;
    setIsSubmitting(true);
    const chapter = chapters.find(c => c.id === chapterId);
    await addTopic({
      chapterId,
      name: newTopicName.trim(),
      description: newTopicDesc.trim() || undefined,
      displayOrder: (chapter?.topics?.length || 0) + 1,
    });
    setNewTopicName('');
    setNewTopicDesc('');
    setAddingTopicChapterId(null);
    setIsSubmitting(false);
  };

  if (isLoading && curriculum.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading academic curriculum...</p>
      </div>
    );
  }

  const getSubjectIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes('BIO')) return 'fa-dna text-teal-500';
    if (c.includes('PHY')) return 'fa-atom text-blue-500';
    if (c.includes('CHEM')) return 'fa-flask text-purple-500';
    return 'fa-book-medical text-teal-600';
  };

  return (
    <div className="space-y-3">
      {/* Subject Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {curriculum.map((subj) => {
          const isActive = activeSubject?.id === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => {
                setActiveSubjectId(subj.id);
                if (subj.chapters.length > 0) {
                  setExpandedChapterId(subj.chapters[0].id);
                } else {
                  setExpandedChapterId(null);
                }
              }}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0f2b46] to-[#1a3a5c] text-white border-teal-500/40 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                  isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <i className={`fas ${getSubjectIcon(subj.code)}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate leading-tight">{subj.name}</p>
                <span
                  className={`text-[9px] font-semibold uppercase ${
                    isActive ? 'text-teal-300' : 'text-gray-400'
                  }`}
                >
                  {subj.code} • {subj.chapters.length} Ch
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Header & Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <i className="fas fa-layer-group text-teal-600" />
            <span>Academic Hierarchy — {activeSubject?.name}</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            {chapters.length} Chapters • {chapters.reduce((sum, c) => sum + c.topics.length, 0)} Core Topics
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowAddChapter(prev => !prev)}
            className="text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <i className={`fas ${showAddChapter ? 'fa-times' : 'fa-plus'} text-[10px]`} />
            <span>{showAddChapter ? 'Cancel' : 'Add Chapter'}</span>
          </button>
        )}
      </div>

      {/* Add Chapter Form */}
      {showAddChapter && (
        <div className="card bg-teal-50/40 border border-teal-200 p-3 animate-slide-up">
          <p className="text-xs font-bold text-teal-900 mb-2">Create New Medical Chapter</p>
          <input
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            placeholder="Chapter Name (e.g., Cardiac Electrophysiology)"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mb-2"
          />
          <input
            value={newChapterDesc}
            onChange={(e) => setNewChapterDesc(e.target.value)}
            placeholder="Short description / syllabus reference"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddChapter(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChapter}
              disabled={!newChapterName.trim() || isSubmitting}
              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Chapter'}
            </button>
          </div>
        </div>
      )}

      {/* Chapters Accordion */}
      <div className="space-y-2">
        {chapters.length === 0 ? (
          <div className="card text-center py-6 text-gray-400">
            <i className="fas fa-book-open text-2xl mb-1.5 text-gray-300" />
            <p className="text-xs">No chapters defined for this subject yet.</p>
          </div>
        ) : (
          chapters.map((chapter, idx) => {
            const isExpanded = expandedChapterId === chapter.id;
            return (
              <div
                key={chapter.id}
                className={`border rounded-xl transition overflow-hidden bg-white ${
                  isExpanded ? 'border-teal-400/60 shadow-xs ring-1 ring-teal-400/20' : 'border-gray-200'
                }`}
              >
                {/* Chapter Header */}
                <div
                  onClick={() => toggleChapter(chapter.id)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{chapter.name}</p>
                      {chapter.description && (
                        <p className="text-[10px] text-gray-400 truncate">{chapter.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {chapter.topics.length} topics
                    </span>
                    {isFacultyOrAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete chapter "${chapter.name}" and its topics?`)) {
                            removeChapter(chapter.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 text-xs p-1"
                        title="Delete chapter"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    )}
                    <i
                      className={`fas fa-chevron-down text-gray-400 text-xs transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Topics Panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-1.5 animate-slide-up bg-gray-50/40">
                    {chapter.topics.length === 0 ? (
                      <p className="text-[11px] text-gray-400 py-2 italic text-center">
                        No topics added to this chapter yet.
                      </p>
                    ) : (
                      chapter.topics.map((topic, tIdx) => (
                        <div
                          key={topic.id}
                          onClick={() => onSelectTopic?.(topic.id, topic.name)}
                          className={`p-2 rounded-lg bg-white border border-gray-100 flex items-center justify-between text-left transition ${
                            onSelectTopic ? 'hover:border-teal-300 cursor-pointer' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-[10px] text-teal-600 font-bold mt-0.5">
                              {idx + 1}.{tIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-700 truncate">{topic.name}</p>
                              {topic.description && (
                                <p className="text-[10px] text-gray-400 line-clamp-1">{topic.description}</p>
                              )}
                            </div>
                          </div>

                          {isFacultyOrAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete topic "${topic.name}"?`)) {
                                  removeTopic(topic.id);
                                }
                              }}
                              className="text-gray-300 hover:text-red-500 text-[10px] p-1 ml-2"
                              title="Delete topic"
                            >
                              <i className="fas fa-times" />
                            </button>
                          )}
                        </div>
                      ))
                    )}

                    {/* Inline Add Topic for Faculty */}
                    {isFacultyOrAdmin && (
                      <div className="pt-2">
                        {addingTopicChapterId === chapter.id ? (
                          <div className="bg-white p-2.5 rounded-lg border border-teal-200 space-y-2">
                            <p className="text-[10px] font-bold text-teal-800">New Topic in Chapter {idx + 1}</p>
                            <input
                              value={newTopicName}
                              onChange={(e) => setNewTopicName(e.target.value)}
                              placeholder="Topic Name (e.g., Action Potential in Neurons)"
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                            />
                            <input
                              value={newTopicDesc}
                              onChange={(e) => setNewTopicDesc(e.target.value)}
                              placeholder="Learning objectives / details"
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-teal-500"
                            />
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setAddingTopicChapterId(null)}
                                className="px-2.5 py-1 text-gray-600 text-[11px] font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCreateTopic(chapter.id)}
                                disabled={!newTopicName.trim() || isSubmitting}
                                className="px-2.5 py-1 bg-teal-600 text-white rounded text-[11px] font-semibold disabled:opacity-50"
                              >
                                Save Topic
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingTopicChapterId(chapter.id);
                              setNewTopicName('');
                              setNewTopicDesc('');
                            }}
                            className="w-full py-1.5 text-center text-[11px] font-semibold text-teal-700 bg-white border border-dashed border-teal-300 hover:bg-teal-50 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <i className="fas fa-plus text-[9px]" />
                            <span>Add Topic to Chapter {idx + 1}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
