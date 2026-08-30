import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Users,
  Stethoscope,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { CodeGenzMascot } from '../Logo';

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { auditLogs } = useApp();

  if (!isOpen) return null;

  const matrix = [
    {
      data: 'Nhật ký cảm xúc: "Chỉ riêng mình tôi"',
      student: '✓ Toàn quyền đọc/sửa/xóa',
      parent: '✕ Không thể xem',
      psych: '✕ Không thể xem',
      securityLevel: 'Mã hóa E2EE (Private)',
    },
    {
      data: 'Nhật ký cảm xúc: "Chia sẻ Cha Mẹ"',
      student: '✓ Toàn quyền',
      parent: '✓ Xem & gửi phản hồi yêu thương',
      psych: '✕ Không thể xem',
      securityLevel: 'Nội bộ gia đình',
    },
    {
      data: 'Nhật ký cảm xúc: "Chia sẻ Chuyên gia"',
      student: '✓ Toàn quyền',
      parent: '✕ Không thể xem',
      psych: '✓ Xem để tham vấn',
      securityLevel: 'Bảo mật Y tế / Tâm lý',
    },
    {
      data: 'Ghi chú lâm sàng của Chuyên gia',
      student: '✕ Không thể xem',
      parent: '✕ Không thể xem',
      psych: '✓ Toàn quyền chuyên môn',
      securityLevel: 'Bảo mật Chuyên gia',
    },
    {
      data: 'Deep Talk & Thử thách 30 ngày',
      student: '✓ Đồng hành',
      parent: '✓ Đồng hành',
      psych: '✕ Không lưu nội dung',
      securityLevel: 'Gia đình',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <CodeGenzMascot size={32} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 mb-0.5">
                TIÊU CHUẨN BẢO MẬT CODE GENZ
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Bảo Mật & Phân Quyền Dữ Liệu</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto bg-slate-50">
          {/* 3 Core Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-200 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-emerald-950 text-sm mb-1.5">
                100% Học sinh làm chủ
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Không ai có quyền tự động xem nhật ký cá nhân của học sinh nếu chưa được cấp phép.
              </p>
            </div>

            <div className="p-5 bg-indigo-50/70 rounded-3xl border border-indigo-200 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <KeyRound className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-indigo-950 text-sm mb-1.5">
                Phân quyền theo vai trò
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Quyền hạn rõ ràng giữa Học sinh, Cha mẹ và Chuyên gia tâm lý theo chuẩn RBAC.
              </p>
            </div>

            <div className="p-5 bg-purple-50/70 rounded-3xl border border-purple-200 text-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-xs">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-purple-950 text-sm mb-1.5">
                Kiểm toán minh bạch
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Mọi hành động truy cập hoặc cấp quyền đều được ghi lại trong hệ thống audit log.
              </p>
            </div>
          </div>

          {/* RBAC Permission Matrix Table */}
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
              Ma Trận Phân Quyền Truy Cập (RBAC Matrix):
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 uppercase tracking-wider text-[10px]">Loại dữ liệu</th>
                    <th className="p-3.5 uppercase tracking-wider text-[10px]">Học sinh</th>
                    <th className="p-3.5 uppercase tracking-wider text-[10px]">Cha Mẹ</th>
                    <th className="p-3.5 uppercase tracking-wider text-[10px]">Chuyên gia</th>
                    <th className="p-3.5 uppercase tracking-wider text-[10px]">Cấp bảo mật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{row.data}</td>
                      <td className="p-3.5 text-emerald-700 font-semibold">{row.student}</td>
                      <td className="p-3.5 text-purple-700 font-semibold">{row.parent}</td>
                      <td className="p-3.5 text-slate-700 font-semibold">{row.psych}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                          {row.securityLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Security Audit Log Stream */}
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
              Nhật Ký Kiểm Toán Hệ Thống Gần Đây (Security Audit Logs):
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {auditLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
                    <span className="font-bold text-slate-800">[{log.action}]</span>
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

