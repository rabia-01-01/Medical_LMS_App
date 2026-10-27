import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useStudentAnalytics } from './useAttempts';

interface PerformanceAnalyticsViewProps {
  onNavigateToQuizzes?: () => void;
  studentId?: string;
}

export function PerformanceAnalyticsView({
  onNavigateToQuizzes,
  studentId,
}: PerformanceAnalyticsViewProps) {
  const { analytics, loading, error } = useStudentAnalytics(studentId);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'weaknesses'>('overview');

  if (loading) {
    return (
      <div className="card p-6 text-center shadow-xs border border-slate-100">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Synthesizing clinical performance metrics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="card p-4 text-center text-xs text-slate-500 shadow-xs border border-slate-100">
        <p>No attempt records found. Take an assessment to unlock analytics.</p>
        {onNavigateToQuizzes && (
          <button
            onClick={onNavigateToQuizzes}
            className="mt-3 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
          >
            Start First Drill
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card mb-0 p-2 text-center bg-teal-50/70 border-teal-100">
          <p className="text-sm font-extrabold text-teal-800">{analytics.averageAccuracy}%</p>
          <p className="text-[9px] uppercase tracking-wider text-teal-600 font-semibold mt-0.5">Avg Accuracy</p>
        </div>

        <div className="card mb-0 p-2 text-center bg-blue-50/70 border-blue-100">
          <p className="text-sm font-extrabold text-blue-800">{analytics.completedAttempts}</p>
          <p className="text-[9px] uppercase tracking-wider text-blue-600 font-semibold mt-0.5">Tests Done</p>
        </div>

        <div className="card mb-0 p-2 text-center bg-emerald-50/70 border-emerald-100">
          <p className="text-sm font-extrabold text-emerald-800">+{analytics.bestScore}</p>
          <p className="text-[9px] uppercase tracking-wider text-emerald-600 font-semibold mt-0.5">Top Score</p>
        </div>

        <div className="card mb-0 p-2 text-center bg-purple-50/70 border-purple-100">
          <p className="text-sm font-extrabold text-purple-800">{analytics.averageScore}</p>
          <p className="text-[9px] uppercase tracking-wider text-purple-600 font-semibold mt-0.5">Avg Score</p>
        </div>
      </div>

      {/* Analytics Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
        {[
          { id: 'overview', label: 'Score Trends', icon: 'fa-chart-line' },
          { id: 'subjects', label: 'Subject Accuracy', icon: 'fa-chart-bar' },
          { id: 'weaknesses', label: 'Weak Areas', icon: 'fa-exclamation-triangle' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${tab.icon} text-[10px]`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Score Progression Trend LineChart */}
      {activeTab === 'overview' && (
        <div className="card mb-0 shadow-xs border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Score & Accuracy Progression</h3>
              <p className="text-[10px] text-slate-400">Chronological performance across assessment runs</p>
            </div>
            <span className="badge badge-teal text-[10px] py-0 px-2 font-bold">
              {analytics.scoreHistory.length} Milestones
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.scoreHistory}
                margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                          <p className="font-bold text-teal-400">{data.title}</p>
                          <p className="text-[11px] mt-0.5">
                            Score: <span className="font-bold">{data.score}</span> / {data.maxScore}
                          </p>
                          <p className="text-[10px] text-slate-300">
                            Accuracy: <span className="text-emerald-400 font-bold">{data.accuracy}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Subject-wise Accuracy Comparison BarChart */}
      {activeTab === 'subjects' && (
        <div className="card mb-0 shadow-xs border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Subject-wise Accuracy Comparison</h3>
              <p className="text-[10px] text-slate-400">Medical subjects performance breakdown</p>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">NEET / IMAT Target: 70%+</span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.subjectAccuracy}
                margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-lg border border-slate-700">
                          <p className="font-bold text-teal-400">{data.subject}</p>
                          <p className="text-[11px] mt-0.5">
                            Accuracy: <span className="font-bold text-emerald-400">{data.accuracy}%</span>
                          </p>
                          <p className="text-[10px] text-slate-300">
                            {data.correct} correct out of {data.total} questions
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {analytics.subjectAccuracy.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Weakness Diagnoser (Accuracy < 50%) */}
      {activeTab === 'weaknesses' && (
        <div className="space-y-2">
          <div className="px-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">High-Yield Weak Area Diagnoser</h3>
            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
              <i className="fas fa-exclamation-circle text-[9px]" /> Accuracy &lt; 50%
            </span>
          </div>

          {analytics.weakAreas.map((weak, i) => (
            <div
              key={i}
              className="card mb-0 p-3 border-l-4 border-rose-500 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                  {weak.subject}
                </span>
                <span className="text-xs font-extrabold text-rose-600">
                  {weak.accuracy}% Accuracy
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800">{weak.topicOrChapter}</p>

              <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100 flex items-start gap-1.5">
                <i className="fas fa-lightbulb text-amber-500 text-xs mt-0.5 flex-shrink-0" />
                <p>
                  <span className="font-bold text-slate-700">Prescription:</span>{' '}
                  {weak.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Attempts Log */}
      <div className="card mb-0 shadow-xs border border-slate-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-800">Recent Test Submissions</h3>
          {onNavigateToQuizzes && (
            <button
              onClick={onNavigateToQuizzes}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              Practice Drills &rarr;
            </button>
          )}
        </div>

        <div className="space-y-2">
          {analytics.recentAttempts.map((att) => {
            const dateStr = att.submitted_at
              ? new Date(att.submitted_at).toLocaleDateString()
              : 'Recent';
            const isHigh = (att.accuracy || 0) >= 70;

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-semibold text-slate-800 truncate">{att.assessmentTitle}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {att.subjectName} &bull; {dateStr}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      isHigh
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.score} pts ({att.accuracy}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
