import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmotionJournalEntry, JournalPrivacy } from '../../types';
import {
  Lock,
  Users,
  Stethoscope,
  Globe2,
  Trash2,
  Heart,
  MessageCircle,
  Sparkles,
  ChevronDown,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

interface EmotionJournalListProps {
  onOpenNewJournal: () => void;
  onRequestConsultationOpen: (journalId: string) => void;
}

export const EmotionJournalList: React.FC<EmotionJournalListProps> = ({
  onOpenNewJournal,
  onRequestConsultationOpen,
}) => {
  const {
    currentUser,
    getFilteredJournalsForUser,
    updateJournalPrivacy,
    deleteJournalEntry,
    addParentReaction,
    isAuthenticated,
    openAuthModal,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'shared_parent' | 'shared_psych' | 'private'>('all');
  const [commentInputs, setCommentInputs] = useState<{ [journalId: string]: string }>({});

  const journals = getFilteredJournalsForUser(currentUser);

  const filteredJournals = journals.filter((j) => {
    if (activeFilter === 'shared_parent') return j.privacy === 'share_parent' || j.privacy === 'share_all';
    if (activeFilter === 'shared_psych') return j.privacy === 'share_psychologist' || j.privacy === 'share_all';
    if (activeFilter === 'private') return j.privacy === 'private';
    return true;
  });

  const getPrivacyBadge = (privacy: JournalPrivacy) => {
    switch (privacy) {
      case 'private':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
            <Lock className="w-3 h-3 text-slate-500" /> Riêng tư
          </span>
        );
      case 'share_parent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200">
            <Users className="w-3 h-3 text-pink-600" /> Chia sẻ Cha Mẹ
          </span>
        );
      case 'share_psychologist':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
            <Stethoscope className="w-3 h-3 text-indigo-600" /> Gửi Chuyên gia
          </span>
        );
      case 'share_all':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
            <Globe2 className="w-3 h-3 text-purple-600" /> Chia sẻ Cả hai
          </span>
        );
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'peaceful':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'stressed':
      case 'anxious':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'sad':
      case 'lonely':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'overwhelmed':
      case 'angry':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-purple-50 text-purple-700 border border-purple-200';
    }
  };

  const handleSendParentReaction = (journalId: string, type: 'heart' | 'hug' | 'proud' | 'listen') => {
    const text = commentInputs[journalId] || '';
    addParentReaction(journalId, type, text);
    setCommentInputs((prev) => ({ ...prev, [journalId]: '' }));
  };

  // If user is not authenticated, show a privacy-first educational and onboarding experience
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-3 border border-purple-100">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Bảo mật dữ liệu cá nhân theo tiêu chuẩn C-O-D-E</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nhật Ký Cảm Xúc Cá Nhân 📖
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-normal leading-relaxed">
              Không gian an toàn để bạn trút bỏ áp lực điểm số, thi cử và cảm xúc tuổi mới lớn. Bạn nắm toàn quyền phân quyền từng dòng nhật ký được lưu trữ.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Đăng nhập để xem nhật ký
            </button>
            <button
              onClick={onOpenNewJournal}
              className="px-5 py-3.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-200 transition-all flex items-center gap-2"
            >
              <span>+</span> Viết thử nhật ký
            </button>
          </div>
        </div>

        {/* 4-Tier Privacy Breakdown Cards */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 mb-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-pink-300 border border-white/15">
              Cơ chế phân quyền độc quyền
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-3 text-white">
              Bạn kiểm soát 100% người được xem nhật ký của mình
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl font-normal leading-relaxed">
              Mỗi mục nhật ký đều có tùy chọn bảo mật độc lập, giúp học sinh hoàn toàn yên tâm chia sẻ mà không sợ bị phán xét hay vi phạm riêng tư:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {/* Tier 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-purple-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 mb-3 border border-white/10">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">1. Chỉ Mình Tôi</h4>
                <span className="text-[9px] bg-white/20 text-slate-200 px-2 py-0.5 rounded-full font-bold uppercase">Bí mật</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Chỉ duy nhất bạn xem được. Cha mẹ và chuyên gia đều không có quyền truy cập.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-pink-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-900/50 flex items-center justify-center text-pink-300 mb-3 border border-white/10">
                <Users className="w-5 h-5 text-pink-300" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">2. Chia sẻ Cha Mẹ</h4>
                <span className="text-[9px] bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full font-bold uppercase">Gia đình</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Cầu nối giúp bố mẹ thấu hiểu tâm sự, nhận phản hồi ấm áp và những cái ôm vỗ về từ xa.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-indigo-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center text-indigo-300 mb-3 border border-white/10">
                <Stethoscope className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">3. Gửi Chuyên Gia</h4>
                <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold uppercase">Chuyên môn</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Chỉ chuyên viên tâm lý học đường phân công mới được xem để đưa ra hướng dẫn khoa học.
              </p>
            </div>

            {/* Tier 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-purple-400/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center text-purple-300 mb-3 border border-white/10">
                <Globe2 className="w-5 h-5 text-purple-300" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">4. Chia Sẻ Cả Hai</h4>
                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-bold uppercase">Toàn diện</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Kết nối trọn vẹn cả gia đình và chuyên gia cùng đồng hành và hỗ trợ bạn một cách tốt nhất.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <p className="text-xs text-slate-300">
                Tất cả dữ liệu được mã hóa và đồng bộ với cơ sở dữ liệu bảo mật trên hệ thống.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('register')}
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
            >
              Đăng ký tài khoản học sinh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📖</span>
            {currentUser.role === 'parent'
              ? 'Nhật Ký Cảm Xúc Con Chia Sẻ'
              : currentUser.role === 'psychologist'
              ? 'Nhật Ký Học Sinh Phân Quyền Cho Bạn'
              : 'Nhật Ký Cảm Xúc Của Bạn'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {currentUser.role === 'parent'
              ? 'Nơi con tin tưởng gửi gắm suy nghĩ. Hãy đọc với sự thấu cảm và gửi lời động viên ấm áp.'
              : currentUser.role === 'psychologist'
              ? 'Chỉ hiển thị các nhật ký học sinh đã chủ động cấp quyền chia sẻ cho chuyên gia.'
              : 'Ghi lại để hiểu chính mình, bạn toàn quyền chọn nội dung nào muốn chia sẻ.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors ${
              activeFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({journals.length})
          </button>
          {currentUser.role === 'student' && (
            <>
              <button
                onClick={() => setActiveFilter('shared_parent')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  activeFilter === 'shared_parent' ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chia sẻ Cha Mẹ
              </button>
              <button
                onClick={() => setActiveFilter('shared_psych')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  activeFilter === 'shared_psych' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Gửi Chuyên gia
              </button>
              <button
                onClick={() => setActiveFilter('private')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors ${
                  activeFilter === 'private' ? 'bg-slate-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Riêng tư
              </button>
            </>
          )}
        </div>
      </div>

      {/* Journal Cards List */}
      {filteredJournals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-3xl rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-100">
            📝
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chưa có nhật ký nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed italic">
            {currentUser.role === 'student'
              ? 'Hãy dành 2 phút ghi lại cảm xúc hôm nay để theo dõi sự thay đổi tâm lý và nhận trợ giúp khi cần.'
              : 'Chưa có nhật ký nào được chia sẻ trong mục này.'}
          </p>
          {currentUser.role === 'student' && (
            <button
              onClick={onOpenNewJournal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md shadow-purple-600/20 transition-all inline-flex items-center gap-2"
            >
              <span>+</span> Tạo nhật ký mới
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              className="bg-white rounded-3xl border border-purple-100 shadow-xs hover:border-purple-300 transition-all overflow-hidden"
            >
              {/* Card Top Row */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xs ${getEmotionColor(journal.emotion)}`}>
                    {journal.emotion === 'happy' || journal.emotion === 'excited' ? '🌟' : journal.emotion === 'peaceful' ? '🌿' : journal.emotion === 'stressed' ? '⚡' : journal.emotion === 'sad' ? '🌧️' : journal.emotion === 'anxious' ? '🌀' : journal.emotion === 'angry' ? '🔥' : '🍂'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {journal.emotionLabel}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Mức độ: {journal.intensity}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>Tác giả: <strong className="text-slate-700">{journal.studentName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(journal.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày {new Date(journal.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Privacy Badge & Actions */}
                <div className="flex items-center gap-2">
                  {getPrivacyBadge(journal.privacy)}

                  {currentUser.role === 'student' && (
                    <button
                      onClick={() => deleteJournalEntry(journal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Xóa nhật ký này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Main Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Triggers */}
                {journal.triggers && journal.triggers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Yếu tố kích hoạt:</span>
                    {journal.triggers.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reason & Events */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Điều đang diễn ra & nguyên nhân:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                    {journal.reason}
                  </p>
                </div>

                {/* Wish to understand */}
                {journal.wishToUnderstand && (
                  <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="uppercase tracking-wider text-[10px]">Mong muốn được thấu hiểu:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 italic">
                      "{journal.wishToUnderstand}"
                    </p>
                  </div>
                )}

                {/* Personal Note (Only student can see) */}
                {currentUser.role === 'student' && journal.personalNote && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span><strong>Ghi chú riêng:</strong> {journal.personalNote}</span>
                  </div>
                )}

                {/* Student Actions Bar */}
                {currentUser.role === 'student' && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Change Privacy Dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Đổi quyền xem:</span>
                      <select
                        value={journal.privacy}
                        onChange={(e) => updateJournalPrivacy(journal.id, e.target.value as JournalPrivacy)}
                        className="text-xs font-semibold border border-slate-200 rounded-full px-3 py-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="private">🔒 Chỉ riêng tôi</option>
                        <option value="share_parent">👨‍👩‍👧 Chia sẻ Cha Mẹ</option>
                        <option value="share_psychologist">🩺 Chia sẻ Chuyên gia</option>
                        <option value="share_all">🌐 Chia sẻ Cả hai</option>
                      </select>
                    </div>

                    {/* Ask for consultation button */}
                    {!journal.consultationRequested ? (
                      <button
                        onClick={() => onRequestConsultationOpen(journal.id)}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-indigo-200"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Gửi tham vấn Chuyên gia từ nhật ký này
                      </button>
                    ) : (
                      <span className="text-xs text-indigo-700 font-extrabold uppercase tracking-wider bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                        ✓ Đã đính kèm trong tham vấn
                      </span>
                    )}
                  </div>
                )}

                {/* Parent Reactions & Feedback Thread */}
                {journal.parentReactions && journal.parentReactions.length > 0 && (
                  <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-extrabold text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
                      Phản hồi yêu thương từ Cha Mẹ ({journal.parentReactions.length}):
                    </h5>
                    <div className="space-y-2">
                      {journal.parentReactions.map((react) => (
                        <div key={react.id} className="bg-white p-3 rounded-xl border border-pink-200 text-xs shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span className="flex items-center gap-1">
                              {react.reactionType === 'heart' ? '❤️' : react.reactionType === 'hug' ? '🤗' : react.reactionType === 'proud' ? '🌟' : '👂'}
                              {react.parentRoleName} ({react.parentName})
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {new Date(react.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {react.comment && <p className="text-slate-800 italic">"{react.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent Interaction Box (Visible only when currentUser is Parent) */}
                {currentUser.role === 'parent' && (
                  <div className="bg-pink-50/50 border border-pink-200 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-pink-900">
                        Gửi phản hồi yêu thương & khích lệ tới con:
                      </span>
                      <span className="text-[10px] text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-full">
                        +15 Happiness Points
                      </span>
                    </div>

                    {/* Quick Reaction Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSendParentReaction(journal.id, 'hug')}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-pink-200 rounded-full text-xs font-extrabold text-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>🤗</span> Gửi cái ôm
                      </button>
                      <button
                        onClick={() => handleSendParentReaction(journal.id, 'heart')}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-pink-200 rounded-full text-xs font-extrabold text-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>❤️</span> Bố mẹ yêu con
                      </button>
                      <button
                        onClick={() => handleSendParentReaction(journal.id, 'proud')}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-pink-200 rounded-full text-xs font-extrabold text-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>🌟</span> Tự hào về con
                      </button>
                      <button
                        onClick={() => handleSendParentReaction(journal.id, 'listen')}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-pink-200 rounded-full text-xs font-extrabold text-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>👂</span> Bố mẹ đang lắng nghe
                      </button>
                    </div>

                    {/* Custom Message Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Viết lời động viên ngắn gửi con (vd: Tối nay mẹ nấu món canh con thích nhé!)..."
                        value={commentInputs[journal.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [journal.id]: e.target.value }))
                        }
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-full border border-pink-200 bg-white focus:outline-hidden text-slate-800"
                      />
                      <button
                        onClick={() => handleSendParentReaction(journal.id, 'hug')}
                        className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
