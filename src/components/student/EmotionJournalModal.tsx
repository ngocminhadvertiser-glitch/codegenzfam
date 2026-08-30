import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmotionType, JournalPrivacy } from '../../types';
import {
  X,
  Lock,
  Users,
  Stethoscope,
  Globe2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface EmotionJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestConsultationOpen?: (journalId: string) => void;
}

const EMOTION_OPTIONS: { type: EmotionType; label: string; icon: string; color: string; bg: string }[] = [
  { type: 'happy', label: 'Vui vẻ & Tự hào', icon: '🌟', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { type: 'peaceful', label: 'Bình an & Thư thái', icon: '🌿', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { type: 'stressed', label: 'Áp lực & Căng thẳng', icon: '⚡', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { type: 'anxious', label: 'Băn khoăn & Lo âu', icon: '🌀', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { type: 'sad', label: 'Buồn bã & Hụt hẫng', icon: '🌧️', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { type: 'overwhelmed', label: 'Kiệt sức & Quá tải', icon: '💥', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { type: 'angry', label: 'Tức giận & Bất mãn', icon: '🔥', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { type: 'lonely', label: 'Cô đơn & Lạc lõng', icon: '🍂', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  { type: 'excited', label: 'Háo hức & Tràn năng lượng', icon: '🚀', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
];

const TRIGGER_SUGGESTIONS = [
  'Kỳ thi & Điểm số',
  'Kỳ vọng từ cha mẹ',
  'Định hướng ngành nghề',
  'Quan hệ bạn bè / Lớp học',
  'Thiếu ngủ & Mệt mỏi',
  'Bất đồng quan điểm',
  'Mạng xã hội & Áp lực đồng trang lứa',
  'Thành tích được ghi nhận',
  'Khoảnh khắc gia đình',
];

export const EmotionJournalModal: React.FC<EmotionJournalModalProps> = ({
  isOpen,
  onClose,
  onRequestConsultationOpen,
}) => {
  const { createJournalEntry, currentUser } = useApp();

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('stressed');
  const [intensity, setIntensity] = useState<number>(7);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Kỳ thi & Điểm số']);
  const [customTrigger, setCustomTrigger] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [eventsHappening, setEventsHappening] = useState<string>('');
  const [wishToUnderstand, setWishToUnderstand] = useState<string>('');
  const [personalNote, setPersonalNote] = useState<string>('');
  const [privacy, setPrivacy] = useState<JournalPrivacy>('share_all');
  const [wantConsultation, setWantConsultation] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentEmotionObj = EMOTION_OPTIONS.find((e) => e.type === selectedEmotion) || EMOTION_OPTIONS[0];

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleAddCustomTrigger = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTrigger.trim()) {
      e.preventDefault();
      if (!selectedTriggers.includes(customTrigger.trim())) {
        setSelectedTriggers([...selectedTriggers, customTrigger.trim()]);
      }
      setCustomTrigger('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng chia sẻ đôi chút về điều khiến bạn có cảm xúc này.');
      return;
    }

    const newId = createJournalEntry({
      familyId: currentUser.familyId,
      emotion: selectedEmotion,
      emotionLabel: currentEmotionObj.label,
      intensity,
      triggers: selectedTriggers,
      reason,
      eventsHappening,
      wishToUnderstand,
      personalNote,
      privacy,
      consultationRequested: wantConsultation,
    });

    onClose();

    // If user checked "I want psychological consultation", open request modal
    if (wantConsultation && onRequestConsultationOpen) {
      onRequestConsultationOpen(newId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Nhật Ký Cảm Xúc Số</h2>
            </div>
            <p className="text-xs text-purple-100 mt-1 font-normal">
              Ghi lại cảm xúc chân thật, kiểm soát 100% quyền riêng tư và chia sẻ của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50/50">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Chọn Cảm xúc hiện tại */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-2.5">
              1. Cảm xúc hiện tại của bạn là gì? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
              {EMOTION_OPTIONS.map((item) => {
                const isSelected = selectedEmotion === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setSelectedEmotion(item.type);
                      setError('');
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? `bg-purple-50/80 border-2 border-purple-600 shadow-xs scale-[1.01]`
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Mức độ cảm xúc (Intensity slider) */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                2. Mức độ cảm xúc:
              </label>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-purple-700">
                <span>{intensity}/10</span>
                <span className="text-xs text-slate-500 font-normal">
                  ({intensity <= 3 ? 'Nhẹ nhàng' : intensity <= 6 ? 'Vừa phải' : intensity <= 8 ? 'Khá mạnh' : 'Rất mãnh liệt'})
                </span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
              <span>1 - Thoáng qua</span>
              <span>5 - Bình thường</span>
              <span>10 - Áp lực tột độ</span>
            </div>
          </div>

          {/* 3. Yếu tố kích hoạt (Triggers) */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-2">
              3. Những điều liên quan / kích hoạt cảm xúc này:
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {TRIGGER_SUGGESTIONS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xs font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {trigger}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Nhập thêm yếu tố khác rồi nhấn Enter..."
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              onKeyDown={handleAddCustomTrigger}
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* 4. Điều khiến mình vui, buồn, lo lắng hoặc áp lực */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
              4. Điều gì cụ thể đang khiến bạn cảm thấy như vậy? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ví dụ: Hôm nay làm bài kiểm tra Toán điểm thấp hơn kỳ vọng; con lo lắng bố mẹ sẽ buồn và thất vọng về con..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* 5. Điều mình mong muốn người khác hiểu */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>5. Điều bạn mong muốn người khác (Bố mẹ/Chuyên gia) hiểu về bạn?</span>
              <span className="text-[10px] text-purple-700 font-extrabold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">Rất quan trọng</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Con mong bố mẹ hiểu rằng con đã rất cố gắng, con chỉ cần một cái ôm động viên thay vì hỏi điểm số ngay khi vừa về..."
              value={wishToUnderstand}
              onChange={(e) => setWishToUnderstand(e.target.value)}
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* 6. Ghi chú cá nhân */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
              6. Ghi chú cá nhân (Nhắc nhở bản thân):
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Tối nay ngủ sớm lúc 22h30, uống đủ 2 lít nước..."
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* 7. QUYỀN CHIA SẺ (Privacy Control) */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest">
                7. Quyền riêng tư & Đối tượng chia sẻ:
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Bạn toàn quyền quyết định ai có thể xem nội dung này. Cha mẹ và chuyên gia sẽ chỉ thấy khi bạn cho phép.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Private */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  privacy === 'private'
                    ? 'bg-slate-100/90 border-2 border-slate-800 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                  className="mt-0.5 accent-slate-800"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    Chỉ lưu riêng cho bản thân
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bảo mật tuyệt đối, không ai khác ngoài bạn có thể đọc.
                  </p>
                </div>
              </label>

              {/* Option 2: Share Parent */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  privacy === 'share_parent'
                    ? 'bg-pink-50/80 border-2 border-pink-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'share_parent'}
                  onChange={() => setPrivacy('share_parent')}
                  className="mt-0.5 accent-pink-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700">
                    <Users className="w-3.5 h-3.5 text-pink-600" />
                    Chia sẻ với Cha Mẹ
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cha mẹ có thể đọc để thấu hiểu và gửi phản hồi khích lệ.
                  </p>
                </div>
              </label>

              {/* Option 3: Share Psychologist */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  privacy === 'share_psychologist'
                    ? 'bg-indigo-50/80 border-2 border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'share_psychologist'}
                  onChange={() => setPrivacy('share_psychologist')}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                    Chia sẻ với Chuyên gia Tâm lý
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dành cho các phiên tham vấn chuyên sâu có định hướng.
                  </p>
                </div>
              </label>

              {/* Option 4: Share All */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  privacy === 'share_all'
                    ? 'bg-purple-50/80 border-2 border-purple-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={privacy === 'share_all'}
                  onChange={() => setPrivacy('share_all')}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                    <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                    Chia sẻ cả Cha Mẹ & Chuyên gia
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kết nối trọn vẹn tam giác: Học sinh - Cha mẹ - Chuyên gia.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 8. Muốn chuyên gia hỗ trợ */}
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="wantConsultation"
              checked={wantConsultation}
              onChange={(e) => setWantConsultation(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-indigo-600 accent-indigo-600"
            />
            <label htmlFor="wantConsultation" className="text-xs cursor-pointer">
              <span className="font-bold text-indigo-900 block">
                Tôi muốn được Chuyên gia Tâm lý hỗ trợ về nội dung này
              </span>
              <span className="text-slate-600 text-[11px]">
                Hệ thống sẽ chuyển tiếp nhật ký này sang quy trình mở phiên tham vấn cùng Chuyên gia sau khi lưu.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu nhật ký cảm xúc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
