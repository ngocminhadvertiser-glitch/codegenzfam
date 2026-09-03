import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportToXml,
  exportToJson,
  exportToSqlDump,
  parseXmlToAppData,
  downloadFile,
  AppFullDatabase,
} from '../../services/dataStorageService';
import {
  FileCode2,
  Database,
  Download,
  Upload,
  Server,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileJson,
  FileText,
  CloudUpload,
  HardDrive,
  Sparkles,
  X,
  Code2,
  Table,
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CodeGenzLogo, CodeGenzMascot } from '../Logo';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    getFullDatabaseSnapshot,
    restoreFullDatabase,
    resetToInitialData,
    syncDataToServerNow,
    reloadFromSqlite,
    sqliteConnected,
    sqliteFile,
    users,
    journalEntries,
    consultations,
    family,
    challengeTasks,
    deepTalkTopics,
    deepTalkSessions,
    challengeProgress,
    happinessHistory,
    notifications,
    auditLogs,
    currentUser,
    isAuthenticated,
    // Supabase
    supabaseConfigured,
    supabaseConnected,
    supabaseStats,
    checkSupabaseStatus,
    migrateToSupabaseNow,
    fetchSupabaseSchemaSql,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sqlite' | 'supabase' | 'export' | 'import' | 'cloud'>('supabase');
  const [xmlContent, setXmlContent] = useState<string>('');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Supabase migration state
  const [supabaseMigrating, setSupabaseMigrating] = useState<boolean>(false);
  const [supabaseMigrationResult, setSupabaseMigrationResult] = useState<any>(null);
  const [supabaseSqlText, setSupabaseSqlText] = useState<string>('');
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(false);

  // Import states
  const [importedXmlString, setImportedXmlString] = useState<string>('');
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [parsedPreview, setParsedPreview] = useState<{
    valid: boolean;
    userCount?: number;
    journalCount?: number;
    consultCount?: number;
    familyName?: string;
    error?: string;
    parsedData?: Partial<AppFullDatabase>;
  } | null>(null);

  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate exports & check supabase on modal open
  useEffect(() => {
    if (isOpen) {
      const snapshot = getFullDatabaseSnapshot();
      setXmlContent(exportToXml(snapshot));
      setJsonContent(exportToJson(snapshot));
      setSqlContent(exportToSqlDump(snapshot));
      setNotification(null);
      checkSupabaseStatus();
      fetchSupabaseSchemaSql().then((res) => {
        if (res && res.sql) setSupabaseSqlText(res.sql);
      });
    }
  }, [isOpen, users, journalEntries, consultations, family, challengeTasks, deepTalkTopics, happinessHistory, checkSupabaseStatus, fetchSupabaseSchemaSql]);

  if (!isOpen || !isAuthenticated || currentUser.role !== 'admin') return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadXml = () => {
    const fileName = `codegenz_database_${new Date().toISOString().slice(0, 10)}.xml`;
    downloadFile(fileName, xmlContent, 'application/xml;charset=utf-8');
    setNotification({ type: 'success', text: `Đã tải tệp ${fileName} thành công!` });
  };

  const handleDownloadJson = () => {
    const fileName = `codegenz_database_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(fileName, jsonContent, 'application/json;charset=utf-8');
    setNotification({ type: 'success', text: `Đã tải tệp ${fileName} thành công!` });
  };

  const handleDownloadSql = () => {
    const fileName = `codegenz_relational_schema_${new Date().toISOString().slice(0, 10)}.sql`;
    downloadFile(fileName, sqlContent, 'application/sql;charset=utf-8');
    setNotification({ type: 'success', text: `Đã tải tệp ${fileName} thành công!` });
  };

  // Analyze pasted or uploaded XML
  const handleValidateXml = (content: string) => {
    setImportedXmlString(content);
    if (!content.trim()) {
      setParsedPreview(null);
      return;
    }
    const currentDb = getFullDatabaseSnapshot();
    const result = parseXmlToAppData(content, currentDb);
    if (result.success && result.data) {
      setParsedPreview({
        valid: true,
        userCount: result.data.users?.length || 0,
        journalCount: result.data.journalEntries?.length || 0,
        consultCount: result.data.consultations?.length || 0,
        familyName: result.data.family?.name || 'Gia đình',
        parsedData: result.data,
      });
    } else {
      setParsedPreview({
        valid: false,
        error: result.error || 'Cú pháp XML không hợp lệ.',
      });
    }
  };

  // Handle File Input (.xml or .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          setParsedPreview({
            valid: true,
            userCount: json.users?.length || 0,
            journalCount: json.journalEntries?.length || 0,
            consultCount: json.consultations?.length || 0,
            familyName: json.family?.name || 'Gia đình',
            parsedData: json,
          });
          setImportedXmlString(text);
        } catch {
          setParsedPreview({ valid: false, error: 'Tệp JSON không hợp lệ.' });
        }
      } else {
        handleValidateXml(text);
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = async () => {
    if (!parsedPreview?.parsedData) return;
    const res = await restoreFullDatabase(parsedPreview.parsedData, importMode);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setImportedXmlString('');
      setParsedPreview(null);
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  // Execute Server Sync
  const handleSyncServer = async () => {
    setSyncStatus({ loading: true });
    const res = await syncDataToServerNow();
    setSyncStatus({ loading: false, success: res.success, message: res.message });
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  // Reset demo data in SQLite
  const handleReset = async () => {
    if (window.confirm('Bạn có chắc chắn muốn tái thiết lập toàn bộ cơ sở dữ liệu SQLite về dữ liệu mẫu chuẩn ban đầu?')) {
      await resetToInitialData();
      setNotification({ type: 'success', text: 'Đã tái thiết lập cơ sở dữ liệu SQLite về dữ liệu ban đầu thành công.' });
    }
  };

  const sqliteTables = [
    { name: 'users', count: users.length, desc: 'Tài khoản Học sinh, Phụ huynh, Chuyên gia tâm lý, Admin' },
    { name: 'families', count: 1, desc: 'Hồ sơ gia đình, mã kết nối và điểm Quỹ Hạnh Phúc' },
    { name: 'emotion_journals', count: journalEntries.length, desc: 'Nhật ký cảm xúc, cường độ, ngữ cảnh, phản hồi & quyền riêng tư' },
    { name: 'consultation_sessions', count: consultations.length, desc: 'Phiên tham vấn, hội thoại bảo mật, định hướng tâm lý' },
    { name: 'deeptalk_topics', count: deepTalkTopics.length, desc: 'Ngân hàng chủ đề thấu cảm sâu cha mẹ & con cái' },
    { name: 'deeptalk_sessions', count: deepTalkSessions.length, desc: 'Phiên trả lời câu hỏi và đúc kết chiêm nghiệm gia đình' },
    { name: 'challenge_tasks', count: challengeTasks.length, desc: 'Lộ trình 30 ngày hành động gắn kết gia đình' },
    { name: 'challenge_progress', count: challengeProgress.length, desc: 'Tiến độ hoàn thành và xác nhận 2 chiều giữa cha mẹ - con' },
    { name: 'happiness_records', count: happinessHistory.length, desc: 'Lịch sử tích lũy điểm thưởng Quỹ Hạnh Phúc' },
    { name: 'notifications', count: notifications.length, desc: 'Thông báo phân quyền theo thời gian thực' },
    { name: 'audit_logs', count: auditLogs.length, desc: 'Nhật ký kiểm toán an ninh & bảo mật quyền riêng tư' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 flex flex-col h-[720px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header with CODE GenZ Brand Palette */}
        <div className="bg-gradient-to-r from-[#152C70] via-[#4338CA] to-[#831843] p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Database className="w-6 h-6 text-[#00D2FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Quản Trị Cơ Sở Dữ Liệu SQLite & Sao Lưu Lâu Dài
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#00D2FF] text-[#152C70] px-2.5 py-0.5 rounded-full shadow-xs">
                  SQLite 3 • XML • JSON • SQL
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Toàn bộ dữ liệu được lưu trữ bền vững trong file SQLite trên máy chủ và xuất định dạng XML cấu trúc chuẩn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Alert Notification */}
        {notification && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification.text}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 flex items-center gap-2 overflow-x-auto shrink-0 py-2.5">
          {[
            { id: 'supabase', label: '1. Supabase Cloud DB (Đám Mây) ⚡', icon: Zap },
            { id: 'sqlite', label: '2. Cơ sở dữ liệu SQLite', icon: Database },
            { id: 'export', label: '3. Xuất Tệp (XML / JSON / SQL)', icon: Download },
            { id: 'import', label: '4. Nhập & Khôi Phục (Import XML)', icon: Upload },
            { id: 'cloud', label: '5. Máy Chủ & Đám Mây', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#152C70] via-[#4F46E5] to-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-6">
          {/* TAB 1: SUPABASE CLOUD DATABASE & MIGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Supabase Hero Banner */}
              <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#134E4A] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden border border-emerald-500/30">
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-xs uppercase tracking-widest font-black text-emerald-400">
                        Supabase PostgreSQL Cloud: Đã kết nối
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <span>Cơ Sở Dữ Liệu Đám Mây Supabase</span>
                      <span className="text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                        Cloud Postgres
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Toàn bộ cấu hình Supabase URL & Service Role Key đã được kích hoạt. Bạn có thể chuyển đổi toàn bộ profile người dùng, nhật ký cảm xúc, tham vấn tâm lý, câu hỏi đối thoại Deep Talk, thử thách 30 ngày, gia đình và điểm gắn kết lên máy chủ Supabase.
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-emerald-200/90 font-mono pt-1">
                      <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                        URL: https://tqnzlwkakeocxufznjfi.supabase.co
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                        Service Role Key: Active 🔑
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      onClick={async () => {
                        setSupabaseMigrating(true);
                        const res = await migrateToSupabaseNow();
                        setSupabaseMigrating(false);
                        setSupabaseMigrationResult(res);
                        if (res.success) {
                          setNotification({ type: 'success', text: 'Chuyển đổi toàn bộ dữ liệu lên Supabase thành công!' });
                        } else {
                          setNotification({ type: 'error', text: res.message || 'Lỗi khi chuyển đổi dữ liệu lên Supabase' });
                        }
                      }}
                      disabled={supabaseMigrating}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className={`w-4 h-4 text-slate-950 ${supabaseMigrating ? 'animate-spin' : ''}`} />
                      <span>{supabaseMigrating ? 'Đang chuyển đổi dữ liệu...' : '🚀 Chuyển Đổi Dữ Liệu Lên Supabase Ngay'}</span>
                    </button>

                    <button
                      onClick={() => setShowSqlViewer(!showSqlViewer)}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Code2 className="w-4 h-4 text-emerald-300" />
                      <span>{showSqlViewer ? 'Ẩn SQL DDL' : 'Xem SQL Schema'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SQL Schema Viewer if toggled */}
              {showSqlViewer && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Mã DDL Tạo 13 Bảng PostgreSQL trên Supabase SQL Editor
                      </h4>
                    </div>
                    <button
                      onClick={() => handleCopy(supabaseSqlText, 'supabase-sql')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {copiedType === 'supabase-sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'supabase-sql' ? 'Đã sao chép!' : 'Sao chép SQL'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-200 bg-slate-950 p-4 rounded-xl max-h-60 overflow-y-auto border border-slate-800 select-all">
                    {supabaseSqlText}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    💡 Bạn có thể dán đoạn mã SQL trên vào mục <strong>SQL Editor</strong> trên Supabase Dashboard nếu muốn kiểm tra cấu trúc bảng quan hệ PostgreSQL.
                  </p>

                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-amber-300">
                        ⚡ Lệnh cập nhật cột mới (ALTER TABLE) nếu bảng users đã có từ trước:
                      </span>
                      <button
                        onClick={() => handleCopy(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_password_changed_at TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lockout_until TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;`, 'alter-sql')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 transition-colors"
                      >
                        {copiedType === 'alter-sql' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'alter-sql' ? 'Đã chép lệnh!' : 'Chép lệnh ALTER TABLE'}</span>
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-amber-200 bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20 overflow-x-auto">
{`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_password_changed_at TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lockout_until TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Migration Result Banner */}
              {supabaseMigrationResult && (
                <div
                  className={`p-5 rounded-2xl border ${
                    supabaseMigrationResult.success
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Kết quả chuyển đổi sang Supabase:</span>
                  </div>
                  <p className="text-xs font-semibold mb-3 text-slate-700">{supabaseMigrationResult.message}</p>
                  {supabaseMigrationResult.counts && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
                      {Object.entries(supabaseMigrationResult.counts).map(([tbl, cnt]) => (
                        <div key={tbl} className="bg-white/80 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-slate-500 uppercase block font-bold truncate">{tbl}</span>
                          <span className="text-sm font-black text-emerald-700">{String(cnt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Supabase Tables Overview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Danh Sách Các Bảng Dữ Liệu Chuyển Đổi Lên Supabase
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    13 Bảng PostgreSQL Đám Mây
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {[
                    { name: 'users', count: users.length, desc: 'Hồ sơ người dùng (Học sinh THPT, Phụ huynh, Chuyên gia tâm lý, Admin), phân quyền RBAC & mật khẩu' },
                    { name: 'families', count: 1, desc: 'Nhóm gia đình, mã gia đình (familyCode) và Quỹ Hạnh Phúc gia đình' },
                    { name: 'emotion_journals', count: journalEntries.length, desc: 'Nhật ký cảm xúc học sinh, mức độ 1-10, ngữ cảnh, điều ước thấu hiểu và quyền riêng tư' },
                    { name: 'parent_reactions', count: journalEntries.flatMap(j => j.parentReactions || []).length, desc: 'Thả tim, ôm con, tự hào và lời nhắn gửi yêu thương của cha mẹ' },
                    { name: 'consultation_sessions', count: consultations.length, desc: 'Phiên tham vấn tâm lý học đường, tin nhắn bảo mật và phác đồ chuyên gia' },
                    { name: 'deeptalk_topics', count: deepTalkTopics.length, desc: 'Ngân hàng chủ đề thấu cảm sâu cha mẹ & con cái THPT' },
                    { name: 'deeptalk_sessions', count: deepTalkSessions.length, desc: 'Phiên đối thoại thực tế và câu trả lời chia sẻ của 2 bên' },
                    { name: 'challenge_30day_tasks', count: challengeTasks.length, desc: 'Lộ trình 30 ngày thử thách hành động yêu thương mỗi ngày' },
                    { name: 'challenge_progress', count: challengeProgress.length, desc: 'Tiến độ hoàn thành và ghi chú xác nhận 2 chiều giữa con và cha mẹ' },
                    { name: 'happiness_records', count: happinessHistory.length, desc: 'Lịch sử tích lũy điểm thưởng Quỹ Hạnh Phúc gia đình' },
                    { name: 'notifications', count: notifications.length, desc: 'Thông báo phân quyền theo thời gian thực cho từng tài khoản' },
                    { name: 'security_audit_logs', count: auditLogs.length, desc: 'Nhật ký kiểm toán bảo mật và truy cập dữ liệu' },
                  ].map((table) => (
                    <div key={table.name} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {table.name}
                          </code>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50/60 px-1.5 py-0.2 rounded">PostgreSQL JSONB</span>
                        </div>
                        <p className="text-xs text-slate-500">{table.desc}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                        {table.count} bản ghi
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQLITE 3 DATABASE ENGINE */}
          {activeTab === 'sqlite' && (
            <div className="space-y-6">
              {/* SQLite Connection Status Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-indigo-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs uppercase tracking-widest font-black text-[#00D2FF]">
                        SQLite 3 Database Engine: Đang hoạt động
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Cơ Sở Dữ Liệu Quan Hệ SQLite ({sqliteFile})
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Toàn bộ dữ liệu người dùng, nhật ký cảm xúc, tham vấn tâm lý, câu hỏi Deep Talk, thử thách 30 ngày và điểm Quỹ Hạnh Phúc đều được đọc, ghi và lưu trữ bền vững vào tệp SQLite thực tế trên máy chủ.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <a
                      href="/api/db/sqlite-file"
                      download="codegenz.sqlite"
                      className="px-4 py-2.5 bg-[#00D2FF] hover:bg-[#38BDF8] active:scale-95 text-[#152C70] font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#152C70]" />
                      <span>Tải tệp .sqlite</span>
                    </a>

                    <button
                      onClick={reloadFromSqlite}
                      className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Đồng bộ lại</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Schema List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Danh sách các bảng trong SQLite Database
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    11 Bảng Dữ Liệu
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {sqliteTables.map((table) => (
                    <div key={table.name} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded">
                            {table.name}
                          </code>
                          <span className="text-[10px] text-slate-400 font-medium">Bảng quan hệ</span>
                        </div>
                        <p className="text-xs text-slate-500">{table.desc}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                        {table.count} bản ghi
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Summary Stats Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Thực thể dữ liệu sẵn sàng xuất ({new Date().toLocaleDateString('vi-VN')})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gia đình: <strong className="text-indigo-600">{family.name}</strong> • Mã: <span className="font-mono text-indigo-700 font-bold">{family.familyCode}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {users.length} Người dùng
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                    {journalEntries.length} Nhật ký
                  </span>
                  <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-100">
                    {consultations.length} Tham vấn
                  </span>
                  <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                    {challengeTasks.length} Thử thách
                  </span>
                </div>
              </div>

              {/* 3 Download Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. XML Card */}
                <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500/40 shadow-xs flex flex-col justify-between hover:border-indigo-600 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <FileCode2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                        Chuẩn XML
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Tệp XML Cấu Trúc (.xml)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Định dạng XML chuẩn phân cấp, chứa CDATA tiếng Việt, an toàn lưu trữ dài hạn & tương thích mọi hệ thống.
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={handleDownloadXml}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Tệp XML</span>
                    </button>
                    <button
                      onClick={() => handleCopy(xmlContent, 'xml')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Sao chép mã XML"
                    >
                      {copiedType === 'xml' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. JSON Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        NoSQL / Web
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Tệp JSON (.json)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Cấu trúc Object JSON trực quan, phù hợp nhập vào MongoDB, Firebase Firestore hoặc REST API.
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={handleDownloadJson}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Tệp JSON</span>
                    </button>
                    <button
                      onClick={() => handleCopy(jsonContent, 'json')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Sao chép mã JSON"
                    >
                      {copiedType === 'json' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. SQL Relational Dump Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                        <Table className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        RDBMS / SQL
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">SQL Schema & Dump (.sql)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Lệnh CREATE TABLE & INSERT tương thích PostgreSQL, SQLite, MySQL cho cơ sở dữ liệu quan hệ.
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={handleDownloadSql}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Tệp SQL</span>
                    </button>
                    <button
                      onClick={() => handleCopy(sqlContent, 'sql')}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Sao chép mã SQL"
                    >
                      {copiedType === 'sql' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live XML Code Viewer */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Xem trước nội dung XML chuẩn hóa
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Dung lượng: ~{(new Blob([xmlContent]).size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800 select-all">
                    {xmlContent}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Phục hồi cơ sở dữ liệu SQLite từ tệp XML / JSON
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống sẽ phân tích cú pháp tệp sao lưu, kiểm tra tính hợp lệ và cập nhật cơ sở dữ liệu SQLite ngay lập tức.
                  </p>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/30 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-xs font-extrabold text-slate-800">
                    Kéo thả tệp <span className="text-indigo-600">.xml</span> hoặc <span className="text-indigo-600">.json</span> vào đây
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hoặc bấm để chọn tệp từ máy tính</p>
                  <label className="mt-3 inline-block">
                    <input
                      type="file"
                      accept=".xml,.json,text/xml,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn tệp sao lưu</span>
                    </span>
                  </label>
                </div>

                {/* Or paste XML textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hoặc dán trực tiếp mã XML / JSON:
                  </label>
                  <textarea
                    value={importedXmlString}
                    onChange={(e) => handleValidateXml(e.target.value)}
                    placeholder="Dán nội dung XML vào đây để hệ thống phân tích..."
                    rows={6}
                    className="w-full text-xs font-mono p-3 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 text-slate-800"
                  />
                </div>

                {/* Parsed Result Preview */}
                {parsedPreview && (
                  <div
                    className={`p-4 rounded-2xl border text-xs ${
                      parsedPreview.valid
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}
                  >
                    {parsedPreview.valid ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Tệp XML hợp lệ! Phát hiện các thực thể sau:</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Người dùng</span>
                            <span className="text-base font-extrabold text-indigo-700">{parsedPreview.userCount}</span>
                          </div>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Nhật ký cảm xúc</span>
                            <span className="text-base font-extrabold text-emerald-700">{parsedPreview.journalCount}</span>
                          </div>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Phiên tham vấn</span>
                            <span className="text-base font-extrabold text-sky-700">{parsedPreview.consultCount}</span>
                          </div>
                          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Gia đình</span>
                            <span className="text-xs font-bold text-slate-800 truncate block mt-1">{parsedPreview.familyName}</span>
                          </div>
                        </div>

                        {/* Import mode options */}
                        <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                              <input
                                type="radio"
                                name="importMode"
                                checked={importMode === 'overwrite'}
                                onChange={() => setImportMode('overwrite')}
                                className="text-indigo-600"
                              />
                              <span>Ghi đè toàn bộ vào SQLite</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                              <input
                                type="radio"
                                name="importMode"
                                checked={importMode === 'merge'}
                                onChange={() => setImportMode('merge')}
                                className="text-indigo-600"
                              />
                              <span>Gộp thêm bản ghi mới</span>
                            </label>
                          </div>

                          <button
                            onClick={handleExecuteRestore}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Khôi phục vào SQLite ngay</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Không thể đọc tệp XML:</strong>
                          <p className="text-rose-800 mt-0.5">{parsedPreview.error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD & SERVER PERSISTENCE */}
          {activeTab === 'cloud' && (
            <div className="space-y-6">
              {/* Server persistence card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Lưu Trữ Tệp SQLite Bền Vững Trên Máy Chủ
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tự động ghi cơ sở dữ liệu vào thư mục <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">/data-storage/codegenz.sqlite</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tệp cơ sở dữ liệu chính:</span>
                    <span className="font-mono text-slate-900 font-bold">data-storage/codegenz.sqlite</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Trạng thái kết nối API SQLite:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đang hoạt động (/api/db/*)
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSyncServer}
                    disabled={syncStatus.loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <CloudUpload className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
                    <span>{syncStatus.loading ? 'Đang đồng bộ SQLite...' : 'Đồng bộ & Lưu ngay lên máy chủ'}</span>
                  </button>

                  <a
                    href="/api/db/sqlite-file"
                    download="codegenz.sqlite"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải tệp .sqlite</span>
                  </a>
                </div>
              </div>

              {/* Cloud Database Integration Guide */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-extrabold">Các Tùy Chọn Cơ Sở Dữ Liệu Khác</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                    <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>🔥</span> Firebase Cloud Firestore
                    </h5>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      Cơ sở dữ liệu đám mây thời gian thực của Google, hỗ trợ đồng bộ đa thiết bị tức thì, bảo mật theo vai trò RBAC và xác thực người dùng.
                    </p>
                  </div>

                  <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200">
                    <h5 className="font-bold text-sky-900 flex items-center gap-1.5">
                      <span>🐘</span> PostgreSQL / Cloud SQL Relational
                    </h5>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      Lưu trữ quan hệ chuẩn SQL, hỗ trợ truy vấn nâng cao và phân tích thống kê cảm xúc trường học quy mô lớn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
