import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeepTalkTopic } from '../../types';
import {
  X,
  HeartHandshake,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  Users2,
} from 'lucide-react';

interface DeepTalkSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
}

export const DeepTalkSessionModal: React.FC<DeepTalkSessionModalProps> = ({
  isOpen,
  onClose,
  topicId,
}) => {
  const {
    currentUser,
    deepTalkTopics,
    deepTalkSessions,
    startDeepTalkSession,
    submitDeepTalkAnswer,
    completeDeepTalkSession,
  } = useApp();

  const topic = deepTalkTopics.find((t) => t.id === topicId) || deepTalkTopics[0];
  const existingSession = deepTalkSessions.find((s) => s.topicId === topicId);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [studentInput, setStudentInput] = useState<string>('');
  const [parentInput, setParentInput] = useState<string>('');
  const [reflection, setReflection] = useState<string>('');
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen || !topic) return null;

  const currentQ = topic.questions[currentStep] || topic.questions[0];
  const totalQuestions = topic.questions.length;

  const handleNext = () => {
    // Save current step answers
    const sessionId = existingSession ? existingSession.id : startDeepTalkSession(topic.id).id;
    if (studentInput) submitDeepTalkAnswer(sessionId, currentQ.id, studentInput, false);
    if (parentInput) submitDeepTalkAnswer(sessionId, currentQ.id, parentInput, true);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
      setStudentInput('');
      setParentInput('');
    } else {
      setIsDone(true);
    }
  };

  const handleFinish = () => {
    const sessionId = existingSession ? existingSession.id : startDeepTalkSession(topic.id).id;
    completeDeepTalkSession(sessionId, reflection || 'Một buổi trò chuyện ấm áp và thấu hiểu hơn rất nhiều!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-white/20 p-2 rounded-2xl backdrop-blur-xs border border-white/20">{topic.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{topic.title}</h2>
              <p className="text-xs text-emerald-100 mt-0.5 font-medium">
                Phiên Deep Talk • Gợi ý cho cả Con và Cha Mẹ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isDone ? (
          <div className="p-5 sm:p-7 space-y-6 bg-slate-50/50">
            {/* Step Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Câu hỏi {currentStep + 1} / {totalQuestions}</span>
                <span className="text-emerald-700 font-extrabold">{Math.round(((currentStep + 1) / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block mb-2">
                Chủ đề câu hỏi:
              </span>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
                "{currentQ.prompt}"
              </h3>

              {/* Hints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-xs">
                <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/80">
                  <span className="font-extrabold text-purple-900 block mb-1">
                    🌱 Gợi ý cho Con:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{currentQ.hintForStudent}</p>
                </div>
                <div className="bg-pink-50/80 p-4 rounded-2xl border border-pink-200/80">
                  <span className="font-extrabold text-pink-900 block mb-1">
                    🌸 Gợi ý cho Cha Mẹ:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{currentQ.hintForParent}</p>
                </div>
              </div>
            </div>

            {/* Answer Area (Con & Cha Mẹ) */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-purple-800 flex items-center gap-1.5 mb-1.5">
                  <span>Con chia sẻ (hoặc ghi lại ý chính):</span>
                </label>
                <textarea
                  rows={2}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder="Con cảm thấy thế nào về câu hỏi này..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-pink-800 flex items-center gap-1.5 mb-1.5">
                  <span>Cha Mẹ chia sẻ / Lắng nghe phản hồi:</span>
                </label>
                <textarea
                  rows={2}
                  value={parentInput}
                  onChange={(e) => setParentInput(e.target.value)}
                  placeholder="Bố mẹ lắng nghe và suy nghĩ như thế nào..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-pink-500"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-full disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <span>{currentStep < totalQuestions - 1 ? 'Câu tiếp theo' : 'Hoàn tất trò chuyện'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="p-6 sm:p-10 text-center space-y-5 bg-white">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 text-3xl rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              🎉
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Chúc mừng gia đình đã hoàn thành phiên Deep Talk!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Mỗi khoảnh khắc chân thành lắng nghe là một viên gạch vững chắc xây dựng tổ ấm hạnh phúc.
            </p>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 inline-block text-amber-900 font-extrabold text-xs uppercase tracking-wider">
              +{topic.pointsAwarded} Happiness Points đã được cộng vào quỹ gia đình! ⭐
            </div>

            <div className="text-left max-w-md mx-auto space-y-2 pt-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                Ghi lại cảm xúc / đúc kết sau buổi trò chuyện:
              </label>
              <textarea
                rows={2}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Ví dụ: Tối nay cả nhà đã hiểu nhau hơn nhiều, con cảm thấy rất nhẹ nhõm..."
                className="w-full text-xs p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md shadow-emerald-600/20 transition-all"
              >
                Hoàn tất & Lưu vào nhật ký gia đình
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
