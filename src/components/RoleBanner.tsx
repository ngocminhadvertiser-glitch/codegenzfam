import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  MessageCircleQuestion,
  Users2,
  CalendarCheck2,
  Sparkles,
  ShieldAlert,
  LayoutDashboard,
  HeartHandshake,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { CodeGenzMascot } from './Logo';

interface RoleBannerProps {
  onOpenNewJournal: () => void;
  onOpenNewConsultation: () => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  onOpenNewJournal,
  onOpenNewConsultation,
}) => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  const getRoleHeaderInfo = () => {
    switch (currentUser.role) {
      case 'student':
        return {
          title: `Xin chào, ${currentUser.name} ✨`,
          subtitle: 'Không gian số an toàn để bạn tự do ghi nhật ký cảm xúc, làm chủ quyền riêng tư và nhận định hướng tâm lý khi cần.',
          themeClass: 'bg-gradient-to-r from-[#311042] via-[#4C1D95] to-[#831843] text-white',
          badgeText: 'Học sinh THPT Gen Z',
          badgeColor: 'bg-white/15 text-pink-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#7C3AED] via-[#C026D3] to-[#DB2777] hover:from-[#6D28D9] hover:via-[#A21CAF] hover:to-[#BE185D] text-white shadow-purple-600/30',
        };
      case 'parent':
        return {
          title: `Kính chào ${currentUser.familyRole === 'father' ? 'Bố ' : 'Mẹ '}${currentUser.name} 🌿`,
          subtitle: 'Cầu nối thấu cảm: Lắng nghe không phán xét, đón nhận chia sẻ tự nguyện từ con và bồi đắp hạnh phúc gia đình.',
          themeClass: 'bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4C0519] text-white',
          badgeText: `Phụ huynh (${currentUser.familyRole === 'father' ? 'Bố' : 'Mẹ'})`,
          badgeColor: 'bg-white/15 text-amber-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#9333EA] via-[#DB2777] to-[#F59E0B] hover:from-[#7E22CE] text-white shadow-purple-600/30',
        };
      case 'psychologist':
        return {
          title: `Kính chào ${currentUser.name} 🩺`,
          subtitle: 'Lớp hỗ trợ chuyên môn: Tiếp nhận tham vấn phân quyền, tương tác định hướng và ghi chép hồ sơ lâm sàng bảo mật.',
          themeClass: 'bg-gradient-to-r from-[#082F49] via-[#1E1B4B] to-[#4C1D95] text-white',
          badgeText: 'Chuyên gia Tâm lý Học đường',
          badgeColor: 'bg-white/15 text-cyan-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#0284C7] via-[#6366F1] to-[#A855F7] hover:from-[#0369A1] text-white shadow-sky-600/30',
        };
      case 'admin':
        return {
          title: 'Trung tâm Quản trị CODE GenZ ⚙️',
          subtitle: 'Quản trị phân quyền người dùng, ngân hàng câu hỏi Deep Talk & Thử thách, giám sát audit log toàn hệ thống.',
          themeClass: 'bg-gradient-to-r from-[#2E1065] via-[#1E1B4B] to-[#581C87] text-white',
          badgeText: 'Quản trị viên Hệ thống',
          badgeColor: 'bg-white/15 text-purple-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] hover:from-[#4F46E5] text-white shadow-purple-600/30',
        };
    }
  };

  const info = getRoleHeaderInfo();

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    {
      id: 'journal',
      label: currentUser.role === 'parent' ? 'Nhật ký con chia sẻ' : currentUser.role === 'psychologist' ? 'Nhật ký phân quyền' : 'Nhật ký cảm xúc',
      icon: BookOpen,
    },
    {
      id: 'consultation',
      label: currentUser.role === 'psychologist' ? 'Hồ sơ tham vấn' : 'Tham vấn Chuyên gia',
      icon: MessageCircleQuestion,
    },
    { id: 'deeptalk', label: 'Deep Talk Gia đình', icon: HeartHandshake },
    { id: 'challenge', label: 'Thử thách 30 ngày', icon: CalendarCheck2 },
    { id: 'ai_coach', label: 'Trợ lý AI CODE', icon: Sparkles },
    ...(currentUser.role === 'admin' ? [{ id: 'admin', label: 'Quản trị hệ thống', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Philosophy mini bar */}
      <div className="bg-[#0F172A] text-white py-2 px-4 text-xs shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300">
              TRIẾT LÝ C-O-D-E
            </span>
            <span className="text-slate-300 text-xs flex items-center gap-1.5 flex-wrap">
              <span className="text-cyan-400 font-bold">C</span>onnect •{' '}
              <span className="text-pink-400 font-bold">O</span>pen •{' '}
              <span className="text-amber-300 font-bold">D</span>evelop •{' '}
              <span className="text-purple-400 font-bold">E</span>mpathy
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mã hóa bảo vệ quyền riêng tư & phân quyền chặt chẽ</span>
          </div>
        </div>
      </div>

      {/* Role Banner Card */}
      <div className={`${info.themeClass} relative overflow-hidden py-7 px-4 sm:px-6 lg:px-8 shadow-md`}>
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Mascot in banner */}
            <div className="hidden sm:block shrink-0 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
              <CodeGenzMascot size={64} />
            </div>

            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full ${info.badgeColor}`}>
                  {info.badgeText}
                </span>
                {currentUser.grade && (
                  <span className="text-[10px] font-bold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                    {currentUser.grade}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                {info.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200/90 mt-1.5 font-normal leading-relaxed">
                {info.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {currentUser.role === 'student' && (
              <>
                <button
                  onClick={onOpenNewJournal}
                  className={`px-4 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
                >
                  <BookOpen className="w-4 h-4" />
                  Ghi nhật ký cảm xúc
                </button>
                <button
                  onClick={onOpenNewConsultation}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <MessageCircleQuestion className="w-4 h-4" />
                  Gửi câu hỏi tham vấn
                </button>
              </>
            )}
            {currentUser.role === 'parent' && (
              <button
                onClick={() => setActiveTab('journal')}
                className={`px-5 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
              >
                <BookOpen className="w-4 h-4" />
                Xem nhật ký con chia sẻ
              </button>
            )}
            {currentUser.role === 'psychologist' && (
              <button
                onClick={() => setActiveTab('consultation')}
                className={`px-5 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                Xem hàng đợi tham vấn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#DB2777] text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

