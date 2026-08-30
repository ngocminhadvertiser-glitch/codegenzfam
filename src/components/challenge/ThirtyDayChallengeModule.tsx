import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Challenge30DayTask } from '../../types';
import {
  CalendarCheck2,
  CheckCircle2,
  Sparkles,
  Award,
  Users,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const ThirtyDayChallengeModule: React.FC = () => {
  const {
    currentUser,
    challengeTasks,
    challengeProgress,
    confirmChallengeTask,
  } = useApp();

  const [selectedStage, setSelectedStage] = useState<number>(0); // 0 = all
  const [selectedTask, setSelectedTask] = useState<Challenge30DayTask | null>(
    challengeTasks[8] || challengeTasks[0] // Day 9
  );

  const stages = [
    { id: 0, label: 'Tất cả 30 Ngày' },
    { id: 1, label: 'GĐ 1: Phá băng & Cảm xúc (Ngày 1-7)' },
    { id: 2, label: 'GĐ 2: Thấu hiểu & Lắng nghe (Ngày 8-14)' },
    { id: 3, label: 'GĐ 3: Đồng hành & Giảm tải (Ngày 15-21)' },
    { id: 4, label: 'GĐ 4: Gắn kết bền vững (Ngày 22-30)' },
  ];

  const filteredTasks = challengeTasks.filter((task) => {
    if (selectedStage === 0) return true;
    return task.stage === selectedStage;
  });

  const completedCount = challengeProgress.filter((p) => p.isCompleted).length;

  const handleConfirm = (day: number) => {
    const role = currentUser.role === 'student' ? 'student' : 'parent';
    confirmChallengeTask(day, role);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-purple-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-pink-200 mb-1.5">
              CHƯƠNG TRÌNH 30 NGÀY KẾT NỐI GIA ĐÌNH
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mỗi ngày một hành động nhỏ – Gắn kết tình thân 📅
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 mt-2 max-w-2xl font-normal leading-relaxed">
              Thử thách được hoàn thành khi <strong>cả Học sinh và Cha mẹ</strong> đều đánh dấu xác nhận thực hiện nhiệm vụ trong ngày.
            </p>
          </div>
          <div className="bg-white/15 p-5 rounded-2xl backdrop-blur-md text-center shrink-0 border border-white/20 shadow-inner">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-pink-200 block">Tiến độ gia đình</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {completedCount} / 30
            </span>
            <span className="text-[10px] text-cyan-200 font-extrabold uppercase tracking-wider block mt-1">ngày hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Stage Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {stages.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStage(st.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedStage === st.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-purple-100/80'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column: Task Detail Focus + 30-Day Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Focused Task Inspector (5 cols) */}
        {selectedTask && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2.5 bg-purple-50 rounded-2xl border border-purple-100">{selectedTask.icon}</span>
                <div>
                  <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Ngày {selectedTask.day} • {selectedTask.stageName}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shrink-0">
                +{selectedTask.points} pts
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
              {selectedTask.description}
            </p>

            {/* Two Action Guides */}
            <div className="space-y-3 text-xs">
              <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/80">
                <span className="font-extrabold text-purple-900 block mb-1">
                  👉 Nhiệm vụ dành cho Con (Học sinh):
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedTask.studentAction}</p>
              </div>

              <div className="bg-pink-50/80 p-4 rounded-2xl border border-pink-200/80">
                <span className="font-extrabold text-pink-900 block mb-1">
                  👉 Nhiệm vụ dành cho Cha Mẹ:
                </span>
                <p className="text-slate-700 leading-relaxed">{selectedTask.parentAction}</p>
              </div>
            </div>

            {/* Current Day Progress & Double Checklist */}
            {(() => {
              const prog = challengeProgress.find((p) => p.day === selectedTask.day);
              const isStudent = currentUser.role === 'student';
              const myDone = isStudent ? prog?.studentConfirmed : prog?.parentConfirmed;

              return (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Trạng thái xác nhận:</span>
                    {prog?.isCompleted ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cả nhà đã hoàn thành
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        Đang thực hiện
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-2xl border text-center font-medium ${prog?.studentConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span>Học sinh: {prog?.studentConfirmed ? '✓ Đã làm' : '○ Chưa làm'}</span>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center font-medium ${prog?.parentConfirmed ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span>Cha Mẹ: {prog?.parentConfirmed ? '✓ Đã làm' : '○ Chưa làm'}</span>
                    </div>
                  </div>

                  {!myDone ? (
                    <button
                      onClick={() => handleConfirm(selectedTask.day)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 text-white font-extrabold uppercase tracking-wider text-xs rounded-full shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Xác nhận tôi ({isStudent ? 'Học sinh' : 'Cha Mẹ'}) đã hoàn thành!
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider text-center rounded-full border border-emerald-200">
                      ✓ Bạn đã xác nhận phần việc của mình
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Right Column: 30-Day Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-purple-600" />
              Bản đồ 30 Ngày Thử Thách
            </h3>
            <span className="text-xs text-slate-500">
              Nhấp vào ngày bất kỳ để xem chi tiết
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredTasks.map((task) => {
              const prog = challengeProgress.find((p) => p.day === task.day);
              const isSelected = selectedTask?.day === task.day;
              const isCompleted = prog?.isCompleted;

              return (
                <div
                  key={task.day}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-purple-600 bg-purple-50/80 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Ngày {task.day}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-base">{task.icon}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {task.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span className="font-bold text-amber-700">+{task.points} pts</span>
                    {prog?.studentConfirmed && !prog?.parentConfirmed && (
                      <span className="text-purple-700 font-extrabold text-[9px] uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded-sm">1/2 xong</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
