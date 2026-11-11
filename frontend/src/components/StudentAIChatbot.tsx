import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData, deduplicateCompletedChapters } from '../context/DataContext';
import { useRbac } from '../hooks/useRbac';
import { useRateLimitGuard } from '../hooks/useRateLimitGuard';
import { RateLimitAlert } from './Navigation';
import {
  CHATBOT_QUICK_PROMPTS,
  type ChatbotMessage,
  type StudentChatbotTelemetry,
  type FormattedRun,
  parseFormattedBlocks,
  resolveChatbotReply,
  createWelcomeMessage,
  loadChatbotHistory,
  saveChatbotHistory,
  clearChatbotHistory,
} from '../features/ai/chatbotAdvisor';

// Preserved reference topics for campus knowledge coverage:
// Registration & Documentation Status | Fee Payment & Tuition Support
// Batch-Wise Access Control | Assessments & Quiz Protocols

function RenderFormattedRuns({ runs }: { runs: FormattedRun[] }) {
  return (
    <>
      {runs.map((run, idx) => {
        if (run.bold) {
          return (
            <strong key={idx} className="font-bold">
              {run.text}
            </strong>
          );
        }
        if (run.code) {
          return (
            <code
              key={idx}
              className="px-1 py-0.2 mx-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[10px] border border-slate-200"
            >
              {run.text}
            </code>
          );
        }
        return <React.Fragment key={idx}>{run.text}</React.Fragment>;
      })}
    </>
  );
}

function FormattedChatText({ text, isUser }: { text: string; isUser: boolean }) {
  const blocks = useMemo(() => parseFormattedBlocks(text), [text]);
  if (isUser) {
    return <p className="whitespace-pre-line leading-relaxed">{text}</p>;
  }

  return (
    <div className="space-y-1.5 leading-relaxed">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <p key={i} className="font-bold text-slate-900 text-[12px] pt-0.5">
              <RenderFormattedRuns runs={block.runs} />
            </p>
          );
        }
        if (block.type === 'bullet') {
          return (
            <div key={i} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-teal-600 font-bold mt-0.5 text-[10px]">•</span>
              <span className="flex-1">
                <RenderFormattedRuns runs={block.runs} />
              </span>
            </div>
          );
        }
        if (block.type === 'numbered') {
          return (
            <div key={i} className="flex items-start gap-1.5 pl-0.5">
              <span className="text-teal-700 font-bold text-[10px] min-w-[14px]">
                {block.index}.
              </span>
              <span className="flex-1">
                <RenderFormattedRuns runs={block.runs} />
              </span>
            </div>
          );
        }
        return (
          <p key={i}>
            <RenderFormattedRuns runs={block.runs} />
          </p>
        );
      })}
    </div>
  );
}

export function StudentAIChatbot() {
  const { user } = useAuth();
  const {
    studentDocuments,
    courses,
    quizzes,
    announcements,
    notifications,
    getStudentProgress,
    getStudentDossier,
    isConsultancyOptedIn,
  } = useData();
  const rbac = useRbac();
  const chatLimit = useRateLimitGuard('ai:chatbot');

  const userKey = user?.id || user?.email || 'anon';
  const [isOpen, setIsOpen] = useState(false);
  const [promptFilter, setPromptFilter] = useState<'all' | 'portal' | 'study'>('all');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUserQuery, setLastUserQuery] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const localTimerRef = useRef<number | null>(null);

  const telemetry: StudentChatbotTelemetry = useMemo(() => {
    const batch = user?.batch || 'Unassigned';
    const accessibleCourses = rbac.hasModule('courses')
      ? courses.filter(
          (c) => !c.batch || c.batch === 'All' || (Boolean(batch) && (batch === 'All' || c.batch === batch))
        )
      : [];
    const enrolledCourses = accessibleCourses.filter((c) => (c.studentIds || []).includes(user?.id || ''));
    const batchQuizzes = rbac.hasModule('quizzes')
      ? quizzes.filter(
          (q) =>
            q.status === 'active' &&
            (!q.batch || q.batch === 'All' || (Boolean(batch) && (batch === 'All' || q.batch === batch)))
        )
      : [];

    const myDocs = studentDocuments.filter(
      (d) => d.studentId === user?.id || d.studentName === user?.name
    );
    const verifiedDocsCount = myDocs.filter((d) => d.status === 'Verified').length;
    const inReviewDocsCount = myDocs.filter((d) => d.status === 'In Review/In Progress').length;
    const notVerifiedDocsCount = myDocs.filter(
      (d) => d.status === 'Not Verified' || d.status === 'Rejected'
    ).length;
    const pendingDocsCount = myDocs.filter((d) => d.status === 'Pending').length;

    const prog = getStudentProgress ? getStudentProgress(user?.id) : undefined;
    const completedChaptersCount = deduplicateCompletedChapters(prog?.completedChapters || []).length;
    const completedTopicsCount = (prog?.completedTopicDetails || []).length || (prog?.completedTopics || []).length;

    const optedIn = typeof isConsultancyOptedIn === 'function' ? isConsultancyOptedIn(user?.id) : false;
    const dossier = getStudentDossier ? getStudentDossier(user?.id) : undefined;
    const verifiedStagesCount = dossier
      ? dossier.checklist.filter((item) => item.status === 'verified').length
      : 0;
    const totalStagesCount = dossier ? dossier.checklist.length : 8;

    const unreadNotificationsCount = rbac.hasModule('notifications')
      ? notifications.filter((n) => !n.read && (n.targetRole === 'all' || n.targetRole === 'student')).length
      : 0;
    const latestAnnouncementTitle =
      rbac.hasModule('announcements') && announcements.length > 0 ? announcements[0].title : undefined;

    return {
      studentName: user?.name || 'Student',
      batch,
      enrolledCoursesCount: enrolledCourses.length,
      accessibleCoursesCount: accessibleCourses.length,
      courseNames: enrolledCourses.length > 0
        ? enrolledCourses.map((c) => c.name)
        : accessibleCourses.map((c) => c.name),
      activeQuizzesCount: batchQuizzes.length,
      quizTitles: batchQuizzes.map((q) => q.title),
      verifiedDocsCount,
      inReviewDocsCount,
      notVerifiedDocsCount,
      pendingDocsCount,
      totalDocsCount: myDocs.length,
      completedChaptersCount,
      completedTopicsCount,
      isConsultancyOptedIn: optedIn,
      verifiedStagesCount,
      totalStagesCount,
      unreadNotificationsCount,
      latestAnnouncementTitle,
      permissions: { ...rbac.modules },
    };
  }, [
    user?.id,
    user?.name,
    user?.batch,
    rbac.hasModule,
    rbac.modules,
    courses,
    quizzes,
    studentDocuments,
    notifications,
    announcements,
    getStudentProgress,
    getStudentDossier,
    isConsultancyOptedIn,
  ]);

  const [messages, setMessages] = useState<ChatbotMessage[]>(() =>
    loadChatbotHistory(userKey, createWelcomeMessage(telemetry))
  );

  // Sync conversation bucket when authenticated user switches
  useEffect(() => {
    setMessages(loadChatbotHistory(userKey, createWelcomeMessage(telemetry)));
    // Intentionally load on user identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey]);

  // Keep fresh welcome greeting in sync with live telemetry before user starts chatting
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        const refreshed = createWelcomeMessage(telemetry);
        return prev[0].text === refreshed.text ? prev : [refreshed];
      }
      return prev;
    });
  }, [telemetry]);

  // Persist history cleanly in sessionStorage
  useEffect(() => {
    saveChatbotHistory(userKey, messages);
  }, [userKey, messages]);

  // Smoothly keep newest messages visible + focus composer on dialog open
  useEffect(() => {
    if (!isOpen) return;
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 80);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    return () => window.clearTimeout(focusId);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Support Escape key dismissal and clean up pending requests on close/unmount
  const cancelPendingRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (localTimerRef.current !== null) {
      window.clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => cancelPendingRequest();
  }, [cancelPendingRequest]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelPendingRequest();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, cancelPendingRequest]);

  const quickPrompts = useMemo(() => {
    if (promptFilter === 'all') return CHATBOT_QUICK_PROMPTS;
    return CHATBOT_QUICK_PROMPTS.filter((p) => p.category === promptFilter);
  }, [promptFilter]);

  const handleCopyMessage = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1800);
    } catch {
      // Clipboard API unavailable
    }
  }, []);

  const handleFeedback = useCallback((id: string, value: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: m.feedback === value ? undefined : value } : m))
    );
  }, []);

  const handleClearChat = useCallback(() => {
    cancelPendingRequest();
    clearChatbotHistory(userKey);
    setMessages([createWelcomeMessage(telemetry)]);
    setLastUserQuery('');
  }, [cancelPendingRequest, userKey, telemetry]);

  const handleSend = useCallback(
    async (textToSend?: string) => {
      if (!rbac.can('ai:chatbot')) return;
      const text = (textToSend !== undefined ? textToSend : inputText).trim();
      if (!text || isTyping) return;

      const rateCheck = chatLimit.tryConsume();
      if (!rateCheck.allowed) {
        return;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: ChatbotMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text,
        time: nowTime,
      };

      const historySnapshot = [...messages, userMsg];
      setMessages(historySnapshot);
      setLastUserQuery(text);
      if (textToSend === undefined) setInputText('');
      setIsTyping(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Brief minimum cadence (120ms) keeps fast portal responses visually smooth without lag
        const [result] = await Promise.all([
          resolveChatbotReply({
            message: text,
            history: historySnapshot,
            telemetry,
            signal: controller.signal,
          }),
          new Promise<void>((resolve) => {
            localTimerRef.current = window.setTimeout(resolve, 120);
          }),
        ]);

        if (controller.signal.aborted) return;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: result.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            topic: result.topic,
            source: result.source,
            model: result.model,
            followUps: result.followUps,
            usedFallback: result.usedFallback,
          },
        ]);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-err-${Date.now()}`,
              sender: 'ai',
              text: 'I could not complete that request right now. Tap Retry or choose one of the quick topics above.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              topic: 'general',
              source: 'local',
              usedFallback: true,
              followUps: ['What is my document verification status?', 'Summarize my study progress'],
            },
          ]);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setIsTyping(false);
      }
    },
    [rbac, inputText, isTyping, chatLimit, messages, telemetry]
  );

  const latestAiMsgId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'ai') return messages[i].id;
    }
    return null;
  }, [messages]);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/80 cursor-pointer"
        title="Open AI Academic Assistant"
        aria-label="AI Assistant"
      >
        <i className="fas fa-robot text-lg animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
      </button>

      {/* AI Chatbot Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelPendingRequest();
              setIsOpen(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-[430px] h-[88vh] sm:h-[630px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-teal-200 shrink-0">
                  <i className="fas fa-user-astronaut text-base" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">AI Student Assistant</span>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400/30 shrink-0">
                      {chatLimit.remaining}/{chatLimit.limit} • {chatLimit.policyLabel}
                    </span>
                  </h3>
                  <p className="text-[10px] text-teal-200 truncate">
                    Registration • Payment • Batch • Quizzes • Medical Tutor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="New Conversation"
                  aria-label="Clear chat conversation"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-teal-100 text-xs transition cursor-pointer"
                >
                  <i className="fas fa-rotate-right" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelPendingRequest();
                    setIsOpen(false);
                  }}
                  title="Close Assistant (Esc)"
                  aria-label="Close AI Assistant"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition cursor-pointer"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            {/* Live Student Context Strip */}
            <div className="bg-slate-900 text-slate-200 px-3 py-1.5 text-[10px] flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/10">
              <span className="inline-flex items-center gap-1 shrink-0 text-teal-300 font-semibold">
                <i className="fas fa-layer-group text-[9px]" />
                {telemetry.batch}
              </span>
              <span className="text-slate-600">•</span>
              <span className="shrink-0">
                <strong className="text-white">{telemetry.enrolledCoursesCount}</strong> Courses
              </span>
              <span className="text-slate-600">•</span>
              <span className="shrink-0">
                <strong className="text-white">{telemetry.activeQuizzesCount}</strong> Active Quizzes
              </span>
              <span className="text-slate-600">•</span>
              <span className="shrink-0">
                <strong className="text-emerald-300">{telemetry.verifiedDocsCount}/{telemetry.totalDocsCount}</strong> Docs
              </span>
            </div>

            {/* Quick Prompts Bar with Category Pills */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-2.5 pt-2 pb-2 space-y-1.5">
              <div className="flex items-center gap-1">
                {([
                  { id: 'all', label: 'All Topics' },
                  { id: 'portal', label: 'My Portal' },
                  { id: 'study', label: 'Exam & Study' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPromptFilter(tab.id)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      promptFilter === tab.id
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-500 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto flex gap-1.5 no-scrollbar">
                {quickPrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isTyping || chatLimit.isBlocked}
                    onClick={() => handleSend(p.q)}
                    className="shrink-0 text-[10px] font-semibold bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 px-2.5 py-1 rounded-full border border-slate-200 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <i className={`fas ${p.icon} text-[9px] text-teal-600`} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                const showFollowUps =
                  !isUser && m.id === latestAiMsgId && m.followUps && m.followUps.length > 0 && !isTyping;

                return (
                  <div key={m.id} className="space-y-1.5">
                    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs ${
                          isUser
                            ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <FormattedChatText text={m.text} isUser={isUser} />

                        <div
                          className={`flex items-center justify-between gap-3 mt-1.5 pt-1 ${
                            isUser ? '' : 'border-t border-slate-100'
                          }`}
                        >
                          {!isUser ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                                {m.source === 'cloud' ? 'AI Tutor' : 'Campus Guide'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(m.id, m.text)}
                                className="text-[10px] text-slate-400 hover:text-teal-700 transition cursor-pointer"
                                title="Copy response"
                                aria-label="Copy response"
                              >
                                <i className={`fas ${copiedId === m.id ? 'fa-check text-emerald-600' : 'fa-copy'}`} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(m.id, 'up')}
                                className={`text-[10px] transition cursor-pointer ${
                                  m.feedback === 'up' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
                                }`}
                                title="Helpful"
                                aria-label="Mark helpful"
                              >
                                <i className="fas fa-thumbs-up" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(m.id, 'down')}
                                className={`text-[10px] transition cursor-pointer ${
                                  m.feedback === 'down' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                                }`}
                                title="Not helpful"
                                aria-label="Mark not helpful"
                              >
                                <i className="fas fa-thumbs-down" />
                              </button>
                              {m.usedFallback && lastUserQuery && m.id === latestAiMsgId && (
                                <button
                                  type="button"
                                  onClick={() => handleSend(lastUserQuery)}
                                  className="text-[9px] font-semibold text-amber-700 hover:underline ml-1 cursor-pointer"
                                >
                                  Retry AI
                                </button>
                              )}
                            </div>
                          ) : (
                            <span />
                          )}
                          <span className={`text-[9px] ${isUser ? 'text-teal-100' : 'text-slate-400'}`}>
                            {m.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Follow-up Suggestions */}
                    {showFollowUps && (
                      <div className="flex flex-wrap gap-1.5 pl-1 animate-fade-in">
                        {m.followUps!.map((fq, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            disabled={chatLimit.isBlocked}
                            onClick={() => handleSend(fq)}
                            className="text-[10px] font-medium bg-white hover:bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-1 rounded-full shadow-2xs transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            <i className="fas fa-sparkles text-[8px] text-teal-500" />
                            <span>{fq}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start items-center gap-2">
                  <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] ml-1 text-slate-500 font-medium">Thinking...</span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelPendingRequest}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-full border border-rose-200 transition cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-2.5 bg-white border-t border-slate-200 space-y-2">
              {chatLimit.limitError && (
                <RateLimitAlert
                  message={chatLimit.limitError}
                  retryAfterSeconds={chatLimit.retryAfterSeconds}
                  policyLabel={chatLimit.policyLabel}
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={1200}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={chatLimit.isBlocked}
                  placeholder={
                    chatLimit.isBlocked
                      ? `Cooldown (${chatLimit.retryAfterSeconds}s)...`
                      : 'Ask any study doubt, batch, docs, or quiz question...'
                  }
                  className="flex-1 px-3.5 py-2 bg-slate-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isTyping || chatLimit.isBlocked}
                  aria-label="Send message"
                  className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center text-xs transition shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
