import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsultationSession, ConsultationStatus } from '../../types';
import {
  Stethoscope,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Lock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface ConsultationModuleProps {
  onOpenNewConsultation: () => void;
}

export const ConsultationModule: React.FC<ConsultationModuleProps> = ({
  onOpenNewConsultation,
}) => {
  const {
    currentUser,
    consultations,
    journalEntries,
    sendConsultationMessage,
    updateConsultationStatus,
  } = useApp();

  const isPsych = currentUser.role === 'psychologist';
  const isParent = currentUser.role === 'parent';

  // Filter consultations based on role
  const visibleConsultations = consultations.filter((c) => {
    if (isPsych) return c.psychologistId === currentUser.id || !c.psychologistId;
    if (isParent) {
      // Parents can see consultation progress summary if their student is in family
      return true;
    }
    // Student sees their own
    return c.studentId === currentUser.id;
  });

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    visibleConsultations[0]?.id || ''
  );
  const [msgInput, setMsgInput] = useState('');

  const selectedSession =
    visibleConsultations.find((c) => c.id === selectedSessionId) || visibleConsultations[0];

  const sessionJournals = journalEntries.filter((j) =>
    selectedSession?.sharedJournalIds?.includes(j.id)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedSession) return;
    sendConsultationMessage(selectedSession.id, msgInput);
    setMsgInput('');
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-200">Chờ tiếp nhận</span>;
      case 'in_progress':
        return <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-200">Đang tham vấn</span>;
      case 'awaiting_student':
        return <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-200">Đã phản hồi</span>;
      case 'completed':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200">Đã hoàn thành</span>;
      case 'needs_followup':
        return <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-rose-200">Cần theo dõi thêm</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-indigo-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-200">
                TRUNG TÂM THAM VẤN TÂM LÝ HỌC ĐƯỜNG
              </span>
              <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full flex items-center gap-1 font-extrabold uppercase tracking-wider backdrop-blur-xs border border-white/20">
                <ShieldCheck className="w-3 h-3 text-cyan-300" /> Bảo Mật Thông Tin
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isPsych ? 'Hồ Sơ & Hàng Đợi Tham Vấn Chuyên Môn' : 'Đồng Hành Cùng Chuyên Gia Tâm Lý'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-2 max-w-2xl font-normal leading-relaxed">
              Giải tỏa căng thẳng học tập, định hướng ngành nghề và hóa giải mâu thuẫn gia đình cùng đội ngũ Thạc sĩ, Tiến sĩ Tâm lý uy tín.
            </p>
          </div>

          {!isPsych && !isParent && (
            <button
              onClick={onOpenNewConsultation}
              className="px-6 py-3 bg-white hover:bg-slate-50 active:scale-95 text-indigo-700 font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-slate-950/10 transition-all flex items-center gap-2 shrink-0 border border-white/40"
            >
              <Stethoscope className="w-4 h-4 text-pink-600" />
              Yêu cầu phiên tham vấn mới
            </button>
          )}
        </div>
      </div>

      {visibleConsultations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-3xl rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-100">
            🩺
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chưa có phiên tham vấn nào</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
            Khi bạn gặp khó khăn trong học tập hoặc mối quan hệ, hãy tạo yêu cầu tham vấn để được chuyên gia lắng nghe và hỗ trợ.
          </p>
          {!isPsych && (
            <button
              onClick={onOpenNewConsultation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-indigo-600/20"
            >
              + Tạo phiên tham vấn đầu tiên
            </button>
          )}
        </div>
      ) : (
        /* Main 2-Column: Session List + Live Chat & Advice Room */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Session Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
              Danh sách phiên tham vấn ({visibleConsultations.length}):
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {visibleConsultations.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-2 border-indigo-600 shadow-xs'
                        : 'bg-white border-purple-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {session.topic}
                      </h4>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-xs text-indigo-700 font-semibold line-clamp-1">
                      Chuyên gia: {session.psychologistName || 'Chuyên gia Tâm lý'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                      <span>Đính kèm {session.sharedJournalIds.length} nhật ký</span>
                      <span>{new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Active Room (8 cols) */}
          {selectedSession && (
            <div className="lg:col-span-8 space-y-5">
              {/* Room Header */}
              <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedSession.topic}
                      </h3>
                      {getStatusBadge(selectedSession.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Học sinh: <strong className="text-slate-900">{selectedSession.studentName}</strong> • Chuyên gia: <strong className="text-indigo-700">{selectedSession.psychologistName}</strong> ({selectedSession.psychologistTitle})
                    </p>
                  </div>
                </div>

                {/* Shared Journal Snapshots (Context) */}
                {sessionJournals.length > 0 && (
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-xs">
                    <span className="font-extrabold text-purple-900 uppercase tracking-wider text-[10px] block mb-2">
                      📋 Nhật ký cảm xúc được chia sẻ trong phiên ({sessionJournals.length}):
                    </span>
                    <div className="space-y-2">
                      {sessionJournals.map((j) => (
                        <div key={j.id} className="bg-white p-3 rounded-xl border border-purple-200/60 shadow-2xs">
                          <span className="font-bold text-slate-900">
                            {j.emotionLabel} ({j.intensity}/10) - "{j.reason}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Timeline */}
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                  {selectedSession.messages.map((msg) => {
                    const isSender = msg.senderId === currentUser.id;
                    const isPsychRole = msg.senderRole === 'psychologist';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-medium">
                          <span>{msg.senderName} ({isPsychRole ? 'Chuyên gia' : 'Học sinh'})</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                            isSender
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs shadow-xs'
                              : isPsychRole
                              ? 'bg-indigo-50 text-indigo-950 border border-indigo-200/80 rounded-bl-xs shadow-2xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input form */}
                {!isParent ? (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn trao đổi..."
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-slate-900 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi
                    </button>
                  </form>
                ) : (
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium">
                    ℹ️ Phụ huynh có thể theo dõi tổng kết và kế hoạch hành động để đồng hành cùng con tại nhà.
                  </div>
                )}
              </div>

              {/* Official Guidance & Action Plan Output Box */}
              {(selectedSession.officialFeedback || selectedSession.nextActionPlan) && (
                <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-base">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span>Định Hướng Chuyên Môn Từ Chuyên Gia Tâm Lý</span>
                  </div>

                  {selectedSession.officialFeedback && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                        1. Phân tích & Lời khuyên tâm lý:
                      </h5>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        {selectedSession.officialFeedback}
                      </p>
                    </div>
                  )}

                  {selectedSession.nextActionPlan && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest mb-1.5">
                        2. Kế hoạch hành động gợi ý:
                      </h5>
                      <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
                        {selectedSession.nextActionPlan}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
