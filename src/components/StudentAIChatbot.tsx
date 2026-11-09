import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  topic?: 'registration' | 'payment' | 'enrollment' | 'quiz' | 'general';
}

export function StudentAIChatbot() {
  const { user } = useAuth();
  const { studentDocuments, courses, quizzes } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Student'}! 👋 I am your AI Academic Assistant. I can help you with registration, fee payments, batch enrollment (${user?.batch || 'Batch 1 (Dec)'}), and quiz assessment rules. What would you like assistance with today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const myBatch = user?.batch || 'Batch 1 (Dec)';
  const myDocs = studentDocuments.filter((d) => d.studentId === user?.id || d.studentName === user?.name);
  const verifiedDocsCount = myDocs.filter((d) => d.status === 'Verified').length;

  const quickPrompts = [
    { label: 'Registration Docs', topic: 'registration', q: 'What is my document verification and registration status?' },
    { label: 'Fee Payment', topic: 'payment', q: 'How do I complete fee payment and get my payment receipt?' },
    { label: 'Batch Enrollment', topic: 'enrollment', q: `What courses are accessible in my batch (${myBatch})?` },
    { label: 'Quiz Guidelines', topic: 'quiz', q: 'What are the scoring, negative marking, and quiz assessment rules?' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';
      let detectedTopic: Message['topic'] = 'general';

      if (lower.includes('regist') || lower.includes('doc') || lower.includes('admit') || lower.includes('verify')) {
        detectedTopic = 'registration';
        reply = `📄 **Registration & Documentation Status:**\n\nYou currently have ${verifiedDocsCount} of ${myDocs.length || 5} required documents verified by Admin/Agent.\n\n• Required documents: NEET/Entrance Admit Card, 12th Board Marksheet, Government Photo ID, Medical Fitness Certificate, and Batch Registration Receipt.\n• Documentation lists are managed strictly by Academy Administrators and AI Agents. You can view your real-time status under the Profile tab!`;
      } else if (lower.includes('pay') || lower.includes('fee') || lower.includes('receipt') || lower.includes('installment')) {
        detectedTopic = 'payment';
        reply = `💳 **Fee Payment & Tuition Support:**\n\n• **Batch Allocation:** Your account is assigned to **${myBatch}**.\n• **Payment Methods:** Online Card, UPI, NetBanking, and Medical Student Education Loans.\n• **Receipts:** Official fee payment receipts are uploaded directly to your Student Documentation list once processed by the Academic Directorate.\n• Need installment adjustments? Contact the finance administrator at finance@medical.lms.`;
      } else if (lower.includes('batch') || lower.includes('enroll') || lower.includes('access') || lower.includes('course')) {
        detectedTopic = 'enrollment';
        reply = `🎓 **Batch-Wise Access Control:**\n\n• **Your Cohort:** ${myBatch}\n• **Strict Batch Security:** Students of Batch 1 (Dec) cannot access Batch 2 (May/June) learning modules, ensuring syllabus pacing integrity.\n• You have access to all 7 core subjects: **Biology, Chemistry, Physics, Maths, Logical Reasoning, English, and GK** for your designated batch.`;
      } else if (lower.includes('quiz') || lower.includes('exam') || lower.includes('test') || lower.includes('mark') || lower.includes('option a') || lower.includes('question')) {
        detectedTopic = 'quiz';
        reply = `📝 **Assessments & Quiz Protocols:**\n\n• **Marking Scheme:** Standard MCQs award **+4 marks** for correct responses and **-1 mark** for incorrect answers.\n• **Text-Only Question Format:** All practice questions and drills are presented exclusively in text format with 5 multiple-choice options (A, B, C, D, E).\n• **Single Attempt Rule:** You must complete or return to assessments before starting new attempts.\n• **Timer:** Auto-submits upon countdown expiration.`;
      } else {
        reply = `I understand your question about "${text}". As your AI Assistant, I can confirm your active enrollment in **${myBatch}**. All 7 subjects (Biology, Chemistry, Physics, Maths, Logical Reasoning, English, GK) are synced. Please feel free to select one of the quick topics below or ask about registration, payments, or quizzes!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topic: detectedTopic,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/80"
        title="Open AI Academic Assistant"
        aria-label="AI Assistant"
      >
        <i className="fas fa-robot text-lg animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
      </button>

      {/* AI Chatbot Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-teal-200">
                  <i className="fas fa-user-astronaut text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    AI Student Assistant
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-400/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[10px] text-teal-200">
                    Registration • Payment • Batch • Quizzes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.q)}
                  className="shrink-0 text-[10px] font-semibold bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 px-2.5 py-1 rounded-full border border-slate-200 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      m.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] ml-1 text-slate-400">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Input */}
            <div className="p-2.5 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about registration, payments, batch..."
                  className="flex-1 px-3 py-2 bg-slate-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-200"
                />
                <button
                  onClick={() => handleSend()}
                  className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center text-xs transition shrink-0"
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

