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
  const { currentUser, activeTab, setActiveTab, isAuthenticated, openAuthModal } = useApp();

  const getRoleHeaderInfo = () => {
    if (!isAuthenticated) {
      return {
        title: 'Chào mừng bạn đến với CODE GenZ 🌟',
        subtitle: 'Nền tảng hỗ trợ sức khỏe tinh thần & nhật ký cảm xúc bảo mật, kết nối thấu cảm giữa học sinh THPT, cha mẹ và chuyên gia tâm lý học đường.',
        themeClass: 'bg-gradient-to-r from-[#1E1B4B] via-[#4338CA] to-[#831843] text-white',
        badgeText: 'Khám phá nền tảng C-O-D-E',
        badgeColor: 'bg-white/20 text-amber-200 border border-white/25',
        accentBtnClass: 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] hover:from-[#4F46E5] text-white shadow-purple-600/30',
      };
    }

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
          badgeText: 'Chuyên gia tâm lý học đường',
          badgeColor: 'bg-white/15 text-cyan-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#0284C7] via-[#6366F1] to-[#A855F7] hover:from-[#0369A1] text-white shadow-sky-600/30',
        };
      case 'admin':
        return {
          title: 'Trung tâm quản trị CODE GenZ ⚙️',
          subtitle: 'Quản trị phân quyền người dùng, ngân hàng câu hỏi Deep Talk & Thử thách, giám sát audit log toàn hệ thống.',
          themeClass: 'bg-gradient-to-r from-[#2E1065] via-[#1E1B4B] to-[#581C87] text-white',
          badgeText: 'Quản trị viên hệ thống',
          badgeColor: 'bg-white/15 text-purple-200 border border-white/20',
          accentBtnClass: 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] hover:from-[#4F46E5] text-white shadow-purple-600/30',
        };
    }
  };

  const info = getRoleHeaderInfo();

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { id: 'dashboard', label: 'Tổng quan nền tảng', icon: LayoutDashboard },
        { id: 'journal', label: 'Nhật ký C-O-D-E', icon: BookOpen },
        { id: 'ai_coach', label: 'Trợ lý AI CODE', icon: Sparkles },
      ];
    }

    switch (currentUser.role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'journal', label: 'Nhật ký cảm xúc', icon: BookOpen },
          { id: 'consultation', label: 'Tham vấn chuyên gia', icon: MessageCircleQuestion },
          { id: 'deeptalk', label: 'Deep Talk gia đình', icon: HeartHandshake },
          { id: 'challenge', label: 'Thử thách 30 ngày', icon: CalendarCheck2 },
          { id: 'ai_coach', label: 'Trợ lý AI CODE', icon: Sparkles },
        ];

      case 'parent':
        return [
          { id: 'dashboard', label: 'Tổng quan gia đình', icon: LayoutDashboard },
          { id: 'journal', label: 'Nhật ký con chia sẻ', icon: BookOpen },
          { id: 'deeptalk', label: 'Deep Talk gia đình', icon: HeartHandshake },
          { id: 'challenge', label: 'Thử thách 30 ngày', icon: CalendarCheck2 },
          { id: 'ai_coach', label: 'Trợ lý AI CODE', icon: Sparkles },
        ];

      case 'psychologist':
        return [
          { id: 'dashboard', label: 'Tổng quan chuyên gia', icon: LayoutDashboard },
          { id: 'consultation', label: 'Hàng đợi & tham vấn học sinh', icon: MessageCircleQuestion },
          { id: 'journal', label: 'Nhật ký học sinh ủy quyền', icon: BookOpen },
          { id: 'ai_coach', label: 'Trợ lý AI chuyên gia', icon: Sparkles },
        ];

      case 'admin':
        return [
          { id: 'admin', label: 'Quản trị hệ thống & phân quyền', icon: ShieldAlert },
          { id: 'dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
          { id: 'ai_coach', label: 'Trợ lý AI quản trị', icon: Sparkles },
        ];

      default:
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'journal', label: 'Nhật ký', icon: BookOpen },
          { id: 'ai_coach', label: 'Trợ lý AI', icon: Sparkles },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Guest Mode Notification when logged out */}
      {!isAuthenticated && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-xs flex flex-wrap items-center justify-between gap-2 border-b border-amber-600/30">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
              Khách
            </span>
            <span>Bạn đang trải nghiệm ở chế độ xem thử. Vui lòng đăng nhập để lưu trữ dữ liệu cá nhân an toàn.</span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

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
                {isAuthenticated && currentUser.grade && (
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

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#F59E0B] hover:from-[#DB2777] hover:to-[#D97706] active:scale-95 text-xs font-black uppercase tracking-wider text-slate-950 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Đăng nhập ngay
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-5 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Đăng ký tài khoản
                </button>
              </>
            ) : currentUser.role === 'student' ? (
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
            ) : currentUser.role === 'parent' ? (
              <button
                onClick={() => setActiveTab('journal')}
                className={`px-5 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
              >
                <BookOpen className="w-4 h-4" />
                Xem nhật ký con chia sẻ
              </button>
            ) : currentUser.role === 'psychologist' ? (
              <button
                onClick={() => setActiveTab('consultation')}
                className={`px-5 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                Xem hàng đợi tham vấn
              </button>
            ) : currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-5 py-2.5 ${info.accentBtnClass} active:scale-95 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2`}
              >
                <ShieldAlert className="w-4 h-4" />
                Quản trị hệ thống & RBAC
              </button>
            ) : null}
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

