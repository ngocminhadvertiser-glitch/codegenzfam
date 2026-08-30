import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeepTalkTopic, DeepTalkSession } from '../../types';
import {
  HeartHandshake,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Users2,
  X,
  Send,
} from 'lucide-react';

interface DeepTalkModuleProps {
  onOpenSession: (topicId: string) => void;
}

export const DeepTalkModule: React.FC<DeepTalkModuleProps> = ({ onOpenSession }) => {
  const { deepTalkTopics, deepTalkSessions, currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả chủ đề' },
    { id: 'Cảm xúc', label: 'Cảm xúc & Áp lực' },
    { id: 'Tương lai', label: 'Tương lai & Ước mơ' },
    { id: 'Gia đình', label: 'Kỷ niệm & Gia đình' },
    { id: 'Xung đột', label: 'Gỡ rối & Lắng nghe' },
  ];

  const filteredTopics = deepTalkTopics.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category.includes(selectedCategory);
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-emerald-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 mb-1.5">
              KHÔNG GIAN DEEP TALK GIA ĐÌNH
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Những cuộc trò chuyện chạm đến trái tim 💬
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-2xl font-normal leading-relaxed">
              Bộ câu hỏi thiết kế khoa học giúp con và cha mẹ mở lòng về những điều chưa từng nói, bồi đắp sự thấu hiểu và gắn kết tình thân.
            </p>
          </div>
          <div className="bg-white/15 p-5 rounded-2xl backdrop-blur-md text-center shrink-0 border border-white/20 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-200 block">Đã hoàn thành</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {deepTalkSessions.filter((s) => s.isCompleted).length} / {deepTalkTopics.length}
            </span>
            <span className="text-[10px] text-cyan-200 font-extrabold uppercase tracking-wider block mt-1">phiên trò chuyện</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTopics.map((topic) => {
          const completedSession = deepTalkSessions.find(
            (s) => s.topicId === topic.id && s.isCompleted
          );
          return (
            <div
              key={topic.id}
              className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">{topic.icon}</span>
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        {topic.category}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                        {topic.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shrink-0">
                    +{topic.pointsAwarded} pts
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3.5 leading-relaxed">
                  {topic.description}
                </p>

                {/* Questions Preview */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest block">
                    Gồm {topic.questions.length} câu hỏi gợi mở:
                  </span>
                  {topic.questions.slice(0, 2).map((q, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-2 font-medium">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span className="line-clamp-1">{q.prompt}</span>
                    </div>
                  ))}
                  {topic.questions.length > 2 && (
                    <span className="text-[11px] text-slate-400 italic">
                      + và {topic.questions.length - 2} câu hỏi sâu sắc khác...
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Khoảng 10 - 15 phút</span>
                </div>

                {completedSession ? (
                  <button
                    onClick={() => onOpenSession(topic.id)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-extrabold uppercase tracking-wider text-[10px] rounded-full flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã hoàn thành (Xem lại)
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenSession(topic.id)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-full shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Bắt đầu Deep Talk
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
