import React, { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  UserCheck,
  Search,
  ArrowUpDown,
  Filter,
  X,
  Calendar,
} from 'lucide-react';

interface ConsultationModuleProps {
  onOpenNewConsultation: () => void;
}

export const ConsultationModule: React.FC<ConsultationModuleProps> = ({
  onOpenNewConsultation,
}) => {
  const {
    currentUser,
    getFilteredConsultationsForUser,
    journalEntries,
    sendConsultationMessage,
    updateConsultationStatus,
    setActiveTab,
  } = useApp();

  const isPsych = currentUser.role === 'psychologist';
  const isParent = currentUser.role === 'parent';

  // Filter consultations based on strict role & privacy rules
  const baseConsultations = useMemo(() => {
    return getFilteredConsultationsForUser(currentUser);
  }, [getFilteredConsultationsForUser, currentUser]);

  // Session search, filter, sort & pagination state
  const [sessionSearch, setSessionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ConsultationStatus>('all');
  const [sessionSortOrder, setSessionSortOrder] = useState<'newest' | 'oldest' | 'urgent'>('newest');
  const [sessionPage, setSessionPage] = useState(1);
  const sessionPageSize = 4;

  // Active chat state
  const [msgInput, setMsgInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatSortOrder, setChatSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological chat order

  // Processed session list
  const filteredSessions = useMemo(() => {
    return baseConsultations
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (sessionSearch.trim()) {
          const q = sessionSearch.toLowerCase();
          const matchTopic = s.topic.toLowerCase().includes(q);
          const matchStudent = s.studentName.toLowerCase().includes(q);
          const matchPsych = s.psychologistName?.toLowerCase().includes(q);
          if (!matchTopic && !matchStudent && !matchPsych) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sessionSortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sessionSortOrder === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sessionSortOrder === 'urgent') {
          const priority = (st: ConsultationStatus) => {
            if (st === 'needs_followup') return 4;
            if (st === 'pending') return 3;
            if (st === 'in_progress') return 2;
            if (st === 'awaiting_student') return 1;
            return 0;
          };
          return priority(b.status) - priority(a.status);
        }
        return 0;
      });
  }, [baseConsultations, statusFilter, sessionSearch, sessionSortOrder]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    filteredSessions[0]?.id || baseConsultations[0]?.id || ''
  );

  const selectedSession =
    filteredSessions.find((c) => c.id === selectedSessionId) ||
    baseConsultations.find((c) => c.id === selectedSessionId) ||
    filteredSessions[0];

  // Pagination for session list
  const totalSessionPages = Math.max(1, Math.ceil(filteredSessions.length / sessionPageSize));
  const safeSessionPage = Math.min(sessionPage, totalSessionPages);
  const paginatedSessions = useMemo(() => {
    const start = (safeSessionPage - 1) * sessionPageSize;
    return filteredSessions.slice(start, start + sessionPageSize);
  }, [filteredSessions, safeSessionPage, sessionPageSize]);

  const sessionJournals = journalEntries.filter((j) =>
    selectedSession?.sharedJournalIds?.includes(j.id)
  );

  // Filtered and sorted messages for current session
  const processedMessages = useMemo(() => {
    if (!selectedSession?.messages) return [];
    let msgs = [...selectedSession.messages];
    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase();
      msgs = msgs.filter((m) => m.content.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q));
    }
    if (chatSortOrder === 'desc') {
      msgs.reverse();
    }
    return msgs;
  }, [selectedSession, chatSearch, chatSortOrder]);

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

  // If user is Admin, protect privacy with Zero-Trust rule
  if (currentUser.role === 'admin') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-purple-100 text-center space-y-5 max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
          <ShieldCheck className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            QUY CHUẨN ĐẠO ĐỨC TÂM LÝ & ZERO-TRUST
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">
            Bảo mật tuyệt đối phiên tham vấn học sinh
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Hồ sơ và cuộc trò chuyện tham vấn là không gian bảo mật 1-1 giữa <strong>Học sinh và Chuyên gia tâm lý học đường</strong>. Tài khoản Quản trị viên chỉ quản trị danh mục chuyên gia, người dùng và phân quyền RBAC, <strong>không được phép truy cập nội dung tham vấn riêng tư</strong>.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('admin')}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Quay lại Quản trị hệ thống
          </button>
        </div>
      </div>
    );
  }

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
              {isPsych ? 'Hồ sơ & hàng đợi tham vấn chuyên môn' : 'Đồng hành cùng chuyên gia tâm lý'}
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

      {baseConsultations.length === 0 ? (
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
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-purple-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Phiên tham vấn ({filteredSessions.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Trang {safeSessionPage}/{totalSessionPages}
                </span>
              </div>

              {/* Session Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm chủ đề, học sinh..."
                  value={sessionSearch}
                  onChange={(e) => {
                    setSessionSearch(e.target.value);
                    setSessionPage(1);
                  }}
                  className="w-full pl-8 pr-7 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50 text-slate-900"
                />
                {sessionSearch && (
                  <button
                    onClick={() => {
                      setSessionSearch('');
                      setSessionPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filters & Sort Controls */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setSessionPage(1);
                    }}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <option value="all">Mọi trạng thái</option>
                    <option value="pending">Chờ tiếp nhận</option>
                    <option value="in_progress">Đang tham vấn</option>
                    <option value="awaiting_student">Đã phản hồi</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="needs_followup">Cần theo dõi</option>
                  </select>

                  <select
                    value={sessionSortOrder}
                    onChange={(e) => {
                      setSessionSortOrder(e.target.value as any);
                      setSessionPage(1);
                    }}
                    className="py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <option value="newest">🕒 Mới nhất</option>
                    <option value="oldest">⏳ Cũ nhất</option>
                    <option value="urgent">⚡ Ưu tiên</option>
                  </select>
                </div>
              </div>

              {/* Paginated Session Items */}
              <div className="space-y-2.5 pt-2">
                {paginatedSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    Không có phiên tham vấn nào khớp tìm kiếm
                  </div>
                ) : (
                  paginatedSessions.map((session) => {
                    const isSelected = selectedSession?.id === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/90 border-2 border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {session.topic}
                          </h4>
                          {getStatusBadge(session.status)}
                        </div>
                        <p className="text-[11px] text-indigo-700 font-semibold line-clamp-1">
                          {isPsych
                            ? `Học sinh: ${session.studentName}`
                            : `Chuyên gia: ${session.psychologistName || 'Chuyên gia Tâm lý'}`}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                          <span>{session.sharedJournalIds.length} nhật ký đính kèm</span>
                          <span>{new Date(session.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Mini Pagination for Session List */}
              {totalSessionPages > 1 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                    disabled={safeSessionPage === 1}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-700">
                    {safeSessionPage} / {totalSessionPages}
                  </span>
                  <button
                    onClick={() => setSessionPage((p) => Math.min(totalSessionPages, p + 1))}
                    disabled={safeSessionPage === totalSessionPages}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Active Room (8 cols) */}
          {selectedSession && (
            <div className="lg:col-span-8 space-y-5">
              {/* Room Header */}
              <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedSession.topic}
                      </h3>
                      {getStatusBadge(selectedSession.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Học sinh: <strong className="text-slate-900">{selectedSession.studentName}</strong> • Chuyên gia: <strong className="text-indigo-700">{selectedSession.psychologistName}</strong> ({selectedSession.psychologistTitle})
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Khởi tạo: {new Date(selectedSession.createdAt).toLocaleDateString('vi-VN')}</span>
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

                {/* Message Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm trong nội dung trao đổi..."
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-hidden bg-slate-50 text-slate-900"
                    />
                    {chatSearch && (
                      <button
                        onClick={() => setChatSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setChatSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-1"
                    title="Đổi thứ tự hiển thị tin nhắn"
                  >
                    <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                    <span>{chatSortOrder === 'asc' ? 'Cũ → Mới (Xuôi dòng)' : 'Mới → Cũ'}</span>
                  </button>
                </div>

                {/* Message Timeline */}
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                  {processedMessages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      {chatSearch ? 'Không tìm thấy tin nhắn khớp từ khóa' : 'Chưa có tin nhắn nào trong phiên này.'}
                    </div>
                  ) : (
                    processedMessages.map((msg) => {
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
                    })
                  )}
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
                    <span>Định hướng chuyên môn từ chuyên gia tâm lý</span>
                  </div>

                  {selectedSession.officialFeedback && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                        1. Phân tích & lời khuyên tâm lý:
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
