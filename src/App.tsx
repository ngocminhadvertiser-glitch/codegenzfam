import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { RoleBanner } from './components/RoleBanner';
import { CodeGenzLogo, CodeGenzMascot } from './components/Logo';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { PsychologistDashboard } from './components/psychologist/PsychologistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmotionJournalModal } from './components/student/EmotionJournalModal';
import { EmotionJournalList } from './components/student/EmotionJournalList';
import { ConsultationRequestModal } from './components/student/ConsultationRequestModal';
import { ConsultationModule } from './components/consultation/ConsultationModule';
import { DeepTalkModule } from './components/deeptalk/DeepTalkModule';
import { DeepTalkSessionModal } from './components/deeptalk/DeepTalkSessionModal';
import { ThirtyDayChallengeModule } from './components/challenge/ThirtyDayChallengeModule';
import { AIChatAssistantModal } from './components/ai/AIChatAssistantModal';
import { HappinessPointsModal } from './components/happiness/HappinessPointsModal';
import { PrivacySecurityModal } from './components/privacy/PrivacySecurityModal';
import { DataManagementModal } from './components/data/DataManagementModal';
import { AuthModal } from './components/auth/AuthModal';
import { Sparkles, MessageCircle, Heart, ShieldCheck, Database } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  // Modal States
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationDefaultJournalId, setConsultationDefaultJournalId] = useState<string | undefined>();
  const [isDeepTalkModalOpen, setIsDeepTalkModalOpen] = useState(false);
  const [activeDeepTalkTopicId, setActiveDeepTalkTopicId] = useState<string>('dt-topic-1');
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);
  const [isHappinessModalOpen, setIsHappinessModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  const handleOpenNewConsultation = (defaultJournalId?: string) => {
    setConsultationDefaultJournalId(defaultJournalId);
    setIsConsultationModalOpen(true);
  };

  const handleOpenDeepTalkSession = (topicId: string) => {
    setActiveDeepTalkTopicId(topicId);
    setIsDeepTalkModalOpen(true);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'student') {
          return (
            <StudentDashboard
              onOpenNewJournal={() => setIsJournalModalOpen(true)}
              onOpenNewConsultation={() => handleOpenNewConsultation()}
              onOpenDeepTalk={() => setActiveTab('deeptalk')}
              onOpenChallenge={() => setActiveTab('challenge')}
              onOpenAIChat={() => setIsAIChatModalOpen(true)}
            />
          );
        }
        if (currentUser.role === 'parent') {
          return (
            <ParentDashboard
              onOpenDeepTalk={() => setActiveTab('deeptalk')}
              onOpenChallenge={() => setActiveTab('challenge')}
              onOpenAIChat={() => setIsAIChatModalOpen(true)}
            />
          );
        }
        if (currentUser.role === 'psychologist') {
          return <PsychologistDashboard />;
        }
        if (currentUser.role === 'admin') {
          return <AdminDashboard onOpenDataManagement={() => setIsDataManagementOpen(true)} />;
        }
        return null;

      case 'journal':
        return (
          <EmotionJournalList
            onOpenNewJournal={() => setIsJournalModalOpen(true)}
            onRequestConsultationOpen={(journalId) => handleOpenNewConsultation(journalId)}
          />
        );

      case 'consultation':
        return (
          <ConsultationModule
            onOpenNewConsultation={() => handleOpenNewConsultation()}
          />
        );

      case 'deeptalk':
        return (
          <DeepTalkModule
            onOpenSession={(topicId) => handleOpenDeepTalkSession(topicId)}
          />
        );

      case 'challenge':
        return <ThirtyDayChallengeModule />;

      case 'ai_coach':
        return (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 text-center space-y-6 max-w-3xl mx-auto shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 transform hover:scale-110 transition-transform duration-300">
                <CodeGenzMascot size={88} />
              </div>

              <div className="mb-2">
                <CodeGenzLogo size="lg" showTagline />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold my-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trợ Lý AI Thấu Cảm & Cố Vấn Giao Tiếp Gia Đình</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mt-2">
                Ứng dụng trí tuệ nhân tạo Gemini 3.7 Flash được huấn luyện riêng biệt theo phương pháp <strong>C-O-D-E</strong> (Connect, Open, Develop, Empathy), giúp học sinh bày tỏ suy nghĩ tự nhiên và phụ huynh thấu hiểu tâm lý con cái tuổi dậy thì.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAIChatModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Trò chuyện cùng Trợ lý AI CODE</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return <AdminDashboard />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Global Header */}
      <Header
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenHappiness={() => setIsHappinessModalOpen(true)}
        onOpenAIChat={() => setIsAIChatModalOpen(true)}
        onOpenDataManagement={() => setIsDataManagementOpen(true)}
      />

      {/* Role Banner & Nav */}
      <RoleBanner
        onOpenNewJournal={() => setIsJournalModalOpen(true)}
        onOpenNewConsultation={() => handleOpenNewConsultation()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {renderActiveTabContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CodeGenzMascot size={36} />
            <div className="text-left">
              <CodeGenzLogo size="xs" />
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nền tảng công nghệ số kết nối Cha mẹ – Học sinh THPT – Chuyên gia tâm lý
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bảo mật & Quyền riêng tư</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDataManagementOpen(true)}
              className="flex items-center gap-1 hover:text-cyan-700 transition-colors"
            >
              <Database className="w-4 h-4 text-cyan-600" />
              <span>Xuất / Nhập Dữ Liệu XML & Database</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHappinessModalOpen(true)}
              className="flex items-center gap-1 hover:text-amber-600 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quỹ Hạnh Phúc Gia Đình</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            © 2026 CODE GenZ Family. Mọi dữ liệu được bảo vệ an toàn.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <EmotionJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onRequestConsultationOpen={(jId) => handleOpenNewConsultation(jId)}
      />

      <ConsultationRequestModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        defaultJournalId={consultationDefaultJournalId}
      />

      <DeepTalkSessionModal
        isOpen={isDeepTalkModalOpen}
        onClose={() => setIsDeepTalkModalOpen(false)}
        topicId={activeDeepTalkTopicId}
      />

      <AIChatAssistantModal
        isOpen={isAIChatModalOpen}
        onClose={() => setIsAIChatModalOpen(false)}
      />

      <HappinessPointsModal
        isOpen={isHappinessModalOpen}
        onClose={() => setIsHappinessModalOpen(false)}
      />

      <PrivacySecurityModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;

