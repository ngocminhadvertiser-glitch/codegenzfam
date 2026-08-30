import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Share2,
  Copy,
  Check,
  HeartHandshake,
  ShieldCheck,
  Award,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FamilyGroupWidgetProps {
  onOpenFamilyModal: (tab?: 'overview' | 'invite' | 'invitations' | 'all_families') => void;
}

export const FamilyGroupWidget: React.FC<FamilyGroupWidgetProps> = ({ onOpenFamilyModal }) => {
  const { currentUser, family, getFamilyMembers, isAuthenticated } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const members = getFamilyMembers(family.id);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(family.familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-pink-50 border border-indigo-100 text-2xl flex items-center justify-center shadow-2xs">
            {family.avatarIcon || '🏡'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Nhóm Gia Đình C-O-D-E
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {family.familyCode}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-800 mt-0.5">{family.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Sao chép mã gia đình để chia sẻ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã chép mã' : 'Chép mã kết nối'}
          </button>
          <button
            onClick={() => onOpenFamilyModal('invite')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Mời kết nối
          </button>
        </div>
      </div>

      {/* Member Roster: Students & Parents Connected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        {/* Students (Con cái) */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>🎓</span> Con cái / Học sinh ({members.students.length})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {members.students.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic">Chưa có học sinh nào</span>
            ) : (
              members.students.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs"
                >
                  <img src={st.avatar} alt={st.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs font-bold text-slate-800">{st.name}</span>
                  {st.id === currentUser.id && (
                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-1 rounded-sm">
                      Bạn
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Parents (Cha mẹ) */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>🌿</span> Phụ huynh / Cha mẹ ({members.parents.length})
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {members.parents.length === 0 ? (
              <span className="text-[11px] text-slate-400 italic">Chưa có cha mẹ nào</span>
            ) : (
              members.parents.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs"
                >
                  <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                  <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1 rounded-sm">
                    {p.familyRole === 'father' ? 'Bố' : p.familyRole === 'mother' ? 'Mẹ' : 'Giám hộ'}
                  </span>
                  {p.id === currentUser.id && (
                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 px-1 rounded-sm">
                      Bạn
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer info & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-pink-600">
            <Award className="w-3.5 h-3.5" />
            {family.happinessPoints} Điểm hạnh phúc
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-bold text-amber-600">
            <Flame className="w-3.5 h-3.5" />
            {family.streakDays} ngày gắn kết
          </span>
        </div>

        <button
          onClick={() => onOpenFamilyModal('overview')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          Quản lý chi tiết nhóm & phân quyền
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
