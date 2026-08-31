import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Stethoscope,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ConsultationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJournalId?: string;
}

export const ConsultationRequestModal: React.FC<ConsultationRequestModalProps> = ({
  isOpen,
  onClose,
  defaultJournalId,
}) => {
  const { users, journalEntries, requestConsultation, setActiveTab } = useApp();

  const psychologists = users.filter((u) => u.role === 'psychologist');

  const [selectedPsychId, setSelectedPsychId] = useState<string>(
    psychologists[0]?.id || 'user-psych-1'
  );
  const [topic, setTopic] = useState<string>('Giải tỏa áp lực thi cử và vượt qua nỗi lo điểm số');
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>(
    defaultJournalId ? [defaultJournalId] : []
  );
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const TOPIC_SUGGESTIONS = [
    'Giải tỏa áp lực thi cử và vượt qua nỗi lo điểm số',
    'Cầu nối giao tiếp: Bày tỏ đam mê ngành nghề với bố mẹ',
    'Khủng hoảng tâm lý & cảm giác mất động lực học tập',
    'Mối quan hệ bạn bè & xử lý áp lực đồng trang lứa',
    'Bất đồng quan điểm gia đình & cảm giác không được thấu hiểu',
  ];

  const handleToggleJournal = (id: string) => {
    if (selectedJournalIds.includes(id)) {
      setSelectedJournalIds(selectedJournalIds.filter((jId) => jId !== id));
    } else {
      setSelectedJournalIds([...selectedJournalIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Vui lòng nhập hoặc chọn chủ đề tham vấn.');
      return;
    }
    if (!initialMessage.trim()) {
      setError('Vui lòng chia sẻ tóm tắt vấn đề bạn đang gặp phải với chuyên gia.');
      return;
    }

    requestConsultation({
      topic,
      initialMessage,
      psychologistId: selectedPsychId,
      sharedJournalIds: selectedJournalIds,
    });

    onClose();
    setActiveTab('consultation');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-300" />
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Yêu cầu tham vấn chuyên gia tâm lý</h2>
            </div>
            <p className="text-xs text-indigo-100 mt-1 font-normal">
              Cầu nối chuyên môn an toàn – Bảo mật thông tin & Định hướng hành động
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Chọn Chuyên gia */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-2.5">
              1. Chọn chuyên gia tâm lý tham vấn:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {psychologists.map((psych) => {
                const isSelected = selectedPsychId === psych.id;
                return (
                  <div
                    key={psych.id}
                    onClick={() => setSelectedPsychId(psych.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-2 border-indigo-600 shadow-xs scale-[1.01]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={psych.avatar}
                      alt={psych.name}
                      className="w-12 h-12 rounded-full object-cover border border-indigo-100 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-slate-900">{psych.name}</h4>
                        {psych.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-700 mt-0.5 line-clamp-1">
                        {psych.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {psych.bio}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Chủ đề tham vấn */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-2">
              2. Chủ đề bạn mong muốn được tham vấn:
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {TOPIC_SUGGESTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    topic === t
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề cụ thể..."
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 3. Đính kèm Nhật ký cảm xúc để Chuyên gia có bối cảnh */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                3. Chọn nhật ký muốn chia sẻ cho chuyên gia xem:
              </label>
              <span className="text-[11px] text-slate-500">
                (Đã chọn {selectedJournalIds.length} nhật ký)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Chuyên gia chỉ xem được những nhật ký bạn chủ động đánh dấu chọn ở đây để phục vụ phiên tham vấn.
            </p>

            <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
              {journalEntries.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Bạn chưa có nhật ký nào.</p>
              ) : (
                journalEntries.map((j) => {
                  const isChecked = selectedJournalIds.includes(j.id);
                  return (
                    <label
                      key={j.id}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50/80 border-indigo-500' : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleJournal(j.id)}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            {j.emotionLabel} ({j.intensity}/10)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(j.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-1 mt-0.5">{j.reason}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Nội dung chia sẻ / Câu hỏi đầu tiên */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
              4. Chia sẻ của bạn gửi tới chuyên gia: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Em chào thầy/cô, dạo này em cảm thấy rất áp lực về việc... Em mong thầy/cô có thể cho em lời khuyên về cách..."
              value={initialMessage}
              onChange={(e) => {
                setInitialMessage(e.target.value);
                setError('');
              }}
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Quy trình tham vấn minh bạch */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/80 text-purple-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold">Luồng tham vấn CODE GenZ Family:</span>
              <p className="text-[11px] text-purple-800/90 mt-0.5 leading-relaxed">
                Chờ tiếp nhận → Chuyên gia tiếp nhận & xem nhật ký → Trao đổi tin nhắn → Chuyên gia đưa ra phản hồi định hướng & kế hoạch hành động.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Gửi yêu cầu tham vấn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
