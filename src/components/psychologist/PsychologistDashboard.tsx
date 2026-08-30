import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsultationSession, ConsultationStatus } from '../../types';
import {
  Stethoscope,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Lock,
  Send,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  UserCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PsychologistDashboard: React.FC = () => {
  const {
    currentUser,
    consultations,
    journalEntries,
    sendConsultationMessage,
    updateConsultationStatus,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    consultations[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [actionPlanDraft, setActionPlanDraft] = useState('');
  const [privateNotesDraft, setPrivateNotesDraft] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const selectedSession = consultations.find((c) => c.id === selectedSessionId) || consultations[0];

  const filteredSessions = consultations.filter((c) => {
    if (activeFilter === 'pending') return c.status === 'pending';
    if (activeFilter === 'in_progress') return c.status === 'in_progress' || c.status === 'awaiting_student';
    if (activeFilter === 'completed') return c.status === 'completed';
    return true;
  });

  // Get shared journals for selected session
  const sessionJournals = journalEntries.filter((j) =>
    selectedSession?.sharedJournalIds?.includes(j.id)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;
    sendConsultationMessage(selectedSession.id, replyText);
    setReplyText('');
  };

  const handleSaveGuidance = () => {
    if (!selectedSession) return;
    updateConsultationStatus(
      selectedSession.id,
      selectedSession.status === 'pending' ? 'in_progress' : selectedSession.status,
      feedbackDraft || selectedSession.officialFeedback,
      actionPlanDraft || selectedSession.nextActionPlan,
      privateNotesDraft || selectedSession.privateProfessionalNotes
    );
    setStatusMessage('Đã cập nhật định hướng chuyên môn & ghi chú bảo mật thành công!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleUpdateStatus = (newStatus: ConsultationStatus) => {
    if (!selectedSession) return;
    updateConsultationStatus(
      selectedSession.id,
      newStatus,
      feedbackDraft || selectedSession.officialFeedback,
      actionPlanDraft || selectedSession.nextActionPlan,
      privateNotesDraft || selectedSession.privateProfessionalNotes
    );
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-200">Chờ tiếp nhận</span>;
      case 'in_progress':
        return <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-200">Đang tham vấn</span>;
      case 'awaiting_student':
        return <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-200">Chờ học sinh phản hồi</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200">Đã hoàn thành</span>;
      case 'needs_followup':
        return <span className="bg-pink-50 text-pink-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-pink-200">Cần theo dõi thêm</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#082F49] via-[#1E1B4B] to-[#4C1D95] rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-sky-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/15 text-cyan-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                Bàn Làm Việc Chuyên Gia Tâm Lý Học Đường
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 font-bold uppercase tracking-wider border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Chuẩn Bảo Mật Tham Vấn
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Không gian tham vấn chuyên nghiệp & Định hướng hành động
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 mt-2 max-w-2xl font-normal leading-relaxed">
              Tiếp nhận học sinh qua phân quyền rõ ràng. Toàn bộ thông tin chia sẻ và ghi chú lâm sàng được bảo mật nghiêm ngặt.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold">{currentUser.name}</div>
              <div className="text-xs text-cyan-200">{currentUser.title}</div>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Session Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Hàng đợi tham vấn ({consultations.length})
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({consultations.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Chờ nhận
              </button>
              <button
                onClick={() => setActiveFilter('in_progress')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeFilter === 'in_progress' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đang hỗ trợ
              </button>
            </div>

            {/* Session List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/70 border-2 border-purple-600 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {session.studentName} ({session.studentGrade || 'Lớp 11'})
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2 mb-2">
                      {session.topic}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Đính kèm {session.sharedJournalIds.length} nhật ký</span>
                      <span>{new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared Journal Inspection Widget */}
          {selectedSession && (
            <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Nhật ký học sinh cấp quyền xem ({sessionJournals.length}):
              </div>

              {sessionJournals.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Học sinh không đính kèm nhật ký nào.</p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {sessionJournals.map((j) => (
                    <div key={j.id} className="p-3.5 bg-purple-50/40 rounded-2xl border border-purple-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{j.emotionLabel} ({j.intensity}/10)</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {new Date(j.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 italic">{j.reason}</p>
                      {j.wishToUnderstand && (
                        <p className="text-[11px] text-indigo-700 italic mt-1.5 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                          <strong>Mong muốn:</strong> "{j.wishToUnderstand}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle & Right Column: Interactive Consultation Room (8 cols) */}
        {selectedSession ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Session Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {selectedSession.topic}
                    </h3>
                    {getStatusBadge(selectedSession.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Học sinh: <strong>{selectedSession.studentName}</strong> • {selectedSession.studentGrade} • Tạo lúc: {new Date(selectedSession.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                {/* Status Switcher Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSession.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs transition-colors"
                    >
                      ✓ Tiếp nhận tham vấn
                    </button>
                  )}
                  {selectedSession.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus('completed')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs transition-colors"
                    >
                      ✓ Hoàn thành phiên
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Timeline */}
              <div className="my-5 space-y-3.5 max-h-80 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {selectedSession.messages.map((msg) => {
                  const isPsych = msg.senderRole === 'psychologist';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isPsych ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-medium">
                        <span>{msg.senderName} ({isPsych ? 'Chuyên gia' : 'Học sinh'})</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                          isPsych
                            ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send Chat Message Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Nhập tin nhắn định hướng tâm lý gửi học sinh..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-full border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi
                </button>
              </form>
            </div>

            {/* Official Guidance & Private Clinical Notes Editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Box 1: Official Guidance & Next Action Plan (Sent to Student) */}
              <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Phản hồi & Định hướng gửi học sinh
                </div>
                <p className="text-xs text-slate-500">
                  Nội dung này sẽ hiển thị trực tiếp cho học sinh để hỗ trợ vượt qua khủng hoảng.
                </p>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    1. Đánh giá & Định hướng tâm lý:
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={selectedSession.officialFeedback || ''}
                    onChange={(e) => setFeedbackDraft(e.target.value)}
                    placeholder="Ví dụ: Em đang gặp phải phản ứng lo âu kỳ thi điển hình. Thầy khuyên em phân chia lại thời gian ôn tập..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                    2. Kế hoạch hành động cụ thể (Action Plan):
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={selectedSession.nextActionPlan || ''}
                    onChange={(e) => setActionPlanDraft(e.target.value)}
                    placeholder="Ví dụ: 1. Thử kỹ thuật thở 4-7-8 mỗi tối; 2. Đặt mục tiêu học 45 phút nghỉ 10 phút..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveGuidance}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu & Gửi định hướng cho học sinh
                </button>
              </div>

              {/* Box 2: Private Clinical Notes (Confidential for Psychologist only) */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-pink-300" />
                    Ghi chú Chuyên môn Bảo mật
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Ghi chú riêng tư về hồ sơ tâm lý của học sinh. Học sinh và phụ huynh <strong>KHÔNG</strong> thể xem được mục này.
                  </p>

                  <div className="mt-3.5">
                    <textarea
                      rows={6}
                      defaultValue={selectedSession.privateProfessionalNotes || ''}
                      onChange={(e) => setPrivateNotesDraft(e.target.value)}
                      placeholder="Ghi chú lâm sàng: Mức độ lo âu ở ngưỡng trung bình-cao, có xu hướng cầu toàn quá mức. Cần theo dõi thêm sau 2 tuần..."
                      className="w-full text-xs p-3 rounded-xl bg-white/10 border border-white/15 text-white focus:outline-hidden focus:border-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveGuidance}
                  className="w-full py-3 bg-white hover:bg-slate-100 text-purple-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md transition-colors"
                >
                  Lưu ghi chú bảo mật
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-3xl p-12 text-center border border-purple-100/80 shadow-xs">
            <h4 className="text-sm text-slate-500 font-medium">Chọn một phiên tham vấn từ hàng đợi bên trái</h4>
          </div>
        )}
      </div>
    </div>
  );
};
