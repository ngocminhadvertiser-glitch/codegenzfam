import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Award,
  Sparkles,
  TrendingUp,
  Heart,
  CalendarCheck2,
  HeartHandshake,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { CodeGenzMascot } from '../Logo';

interface HappinessPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HappinessPointsModal: React.FC<HappinessPointsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { family, happinessHistory } = useApp();

  if (!isOpen) return null;

  const milestones = [
    { level: 1, name: 'Mầm Xanh Gắn Kết', points: 200, icon: '🌱', desc: 'Bắt đầu hành trình mở lòng và chia sẻ' },
    { level: 2, name: 'Nhịp Cầu Yêu Thương', points: 500, icon: '🌉', desc: 'Duy trì kết nối và lắng nghe thường xuyên' },
    { level: 3, name: 'Gia Đình Thấu Cảm', points: 1000, icon: '🏡', desc: 'Gắn kết bền chặt, thấu hiểu sâu sắc' },
    { level: 4, name: 'Tổ Ấm Vững Vàng', points: 2000, icon: '🌟', desc: 'Điểm tựa tâm lý vững vàng cho con trưởng thành' },
  ];

  const currentPoints = family.happinessPoints;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <CodeGenzMascot size={32} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200 mb-0.5">
                QUỸ HẠNH PHÚC GIA ĐÌNH
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Happiness Points & Milestones</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50">
          {/* Current Score Spotlight */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Tổng điểm hiện tại của gia đình {family.name}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 mt-1.5">
                {currentPoints} <span className="text-sm font-sans font-bold text-slate-400">pts</span>
              </div>
              <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Chuỗi gắn kết: {family.streakDays} ngày liên tiếp!
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-indigo-50 px-5 py-3.5 rounded-2xl border border-indigo-100 text-xs text-indigo-900 font-bold shadow-xs">
              <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Cấp độ gia đình</span>
              <span className="text-sm font-extrabold text-indigo-700">Cấp 2: Nhịp Cầu Yêu Thương</span>
            </div>
          </div>

          {/* Milestones Roadmap */}
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
              Lộ trình Cột Mốc Gắn Kết:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {milestones.map((m) => {
                const isReached = currentPoints >= m.points;
                return (
                  <div
                    key={m.level}
                    className={`p-4 rounded-2xl border transition-all ${
                      isReached
                        ? 'bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                          <span className="text-[10px] font-extrabold text-indigo-600">
                            {m.points} pts
                          </span>
                        </div>
                      </div>
                      {isReached && (
                        <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đạt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Point History Log */}
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
              Lịch sử cộng điểm gần đây ({happinessHistory.length}):
            </h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {happinessHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {item.source === 'deeptalk' ? '💬' : item.source === 'challenge' ? '📅' : item.source === 'journal_share' ? '📖' : '❤️'}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-800">{item.sourceTitle}</h5>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    +{item.amount} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

