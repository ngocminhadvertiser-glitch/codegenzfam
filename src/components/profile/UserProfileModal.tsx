import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User as UserIcon,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Briefcase,
  Stethoscope,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Gender, FamilyRole } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'security';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'profile',
}) => {
  const { currentUser, changePassword, updateUserProfile, family } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(defaultTab);

  // Profile fields
  const [name, setName] = useState(currentUser.name || '');
  const [gender, setGender] = useState<Gender>(currentUser.gender || 'other');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser.dateOfBirth || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [city, setCity] = useState(currentUser.city || 'Hà Nội');
  const [bio, setBio] = useState(currentUser.bio || '');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContactPhone || '');
  const [emergencyRel, setEmergencyRel] = useState(currentUser.emergencyContactRelationship || '');

  // Student fields
  const [schoolName, setSchoolName] = useState(currentUser.schoolName || '');
  const [grade, setGrade] = useState(currentUser.grade || '');
  const [studentCode, setStudentCode] = useState(currentUser.studentCode || '');
  const [hobbiesInput, setHobbiesInput] = useState((currentUser.hobbies || []).join(', '));

  // Parent fields
  const [occupation, setOccupation] = useState(currentUser.occupation || '');
  const [workplace, setWorkplace] = useState(currentUser.workplace || '');

  // Psychologist fields
  const [title, setTitle] = useState(currentUser.title || '');
  const [organization, setOrganization] = useState(currentUser.organization || '');
  const [licenseNumber, setLicenseNumber] = useState(currentUser.licenseNumber || '');
  const [specialization, setSpecialization] = useState(currentUser.specialization || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(currentUser.yearsOfExperience?.toString() || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state when currentUser or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setName(currentUser.name || '');
      setGender(currentUser.gender || 'other');
      setDateOfBirth(currentUser.dateOfBirth || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setCity(currentUser.city || 'Hà Nội');
      setBio(currentUser.bio || '');
      setEmergencyName(currentUser.emergencyContactName || '');
      setEmergencyPhone(currentUser.emergencyContactPhone || '');
      setEmergencyRel(currentUser.emergencyContactRelationship || '');
      setSchoolName(currentUser.schoolName || '');
      setGrade(currentUser.grade || '');
      setStudentCode(currentUser.studentCode || '');
      setHobbiesInput((currentUser.hobbies || []).join(', '));
      setOccupation(currentUser.occupation || '');
      setWorkplace(currentUser.workplace || '');
      setTitle(currentUser.title || '');
      setOrganization(currentUser.organization || '');
      setLicenseNumber(currentUser.licenseNumber || '');
      setSpecialization(currentUser.specialization || '');
      setYearsOfExperience(currentUser.yearsOfExperience?.toString() || '');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusBanner(null);
    }
  }, [isOpen, currentUser, defaultTab]);

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusBanner({ type: 'error', message: 'Họ và tên không được để trống.' });
      return;
    }

    setIsSaving(true);
    setStatusBanner(null);

    const hobbiesList = hobbiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<User> = {
      name: name.trim(),
      gender,
      dateOfBirth: dateOfBirth || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      bio: bio.trim() || undefined,
      emergencyContactName: emergencyName.trim() || undefined,
      emergencyContactPhone: emergencyPhone.trim() || undefined,
      emergencyContactRelationship: emergencyRel.trim() || undefined,
      schoolName: schoolName.trim() || undefined,
      grade: grade.trim() || undefined,
      studentCode: studentCode.trim() || undefined,
      hobbies: hobbiesList.length > 0 ? hobbiesList : undefined,
      occupation: occupation.trim() || undefined,
      workplace: workplace.trim() || undefined,
      title: title.trim() || undefined,
      organization: organization.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      specialization: specialization.trim() || undefined,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
    };

    const res = await updateUserProfile(payload);
    setIsSaving(false);

    if (res.success) {
      setStatusBanner({ type: 'success', message: 'Cập nhật hồ sơ cá nhân thành công và đồng bộ Supabase!' });
    } else {
      setStatusBanner({ type: 'error', message: res.error || 'Cập nhật hồ sơ thất bại.' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusBanner({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setStatusBanner({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusBanner({ type: 'error', message: 'Xác nhận mật khẩu mới không khớp.' });
      return;
    }
    if (currentPassword === newPassword) {
      setStatusBanner({ type: 'error', message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
      return;
    }

    setIsSaving(true);
    setStatusBanner(null);

    const res = await changePassword(currentPassword, newPassword);
    setIsSaving(false);

    if (res.success) {
      setStatusBanner({ type: 'success', message: res.message || 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusBanner({ type: 'error', message: res.error || 'Đổi mật khẩu thất bại.' });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Học sinh GenZ</span>;
      case 'parent':
        return <span className="bg-pink-100 text-pink-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Phụ huynh</span>;
      case 'psychologist':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Chuyên gia Tâm lý</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Quản trị viên</span>;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      id="user-profile-modal-overlay"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="user-profile-modal-card"
        className="relative w-full max-w-2xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400/80 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold tracking-tight truncate">{currentUser.name}</h3>
                {getRoleBadge(currentUser.role)}
                {currentUser.verified && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Đã xác thực
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">{currentUser.email}</p>
              {currentUser.mustChangePassword && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-lg text-amber-300 text-xs font-semibold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Yêu cầu bảo mật: Vui lòng đổi mật khẩu mới</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-5 flex p-1 bg-white/10 rounded-xl">
            <button
              id="tab-profile-info-btn"
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setStatusBanner(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Hồ sơ & Thông tin cá nhân</span>
            </button>
            <button
              id="tab-security-btn"
              type="button"
              onClick={() => {
                setActiveTab('security');
                setStatusBanner(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Mật khẩu & Bảo mật</span>
              {currentUser.mustChangePassword && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Message */}
          {statusBanner && (
            <div
              id="profile-status-banner"
              className={`flex items-start gap-3 p-3.5 rounded-xl text-xs font-medium ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{statusBanner.message}</div>
            </div>
          )}

          {activeTab === 'profile' ? (
            /* ================= TAB 1: PROFILE INFO ================= */
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Basic Demographics */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Thông tin cơ bản</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="profile-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email đăng nhập (Cố định)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác / Không công khai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0912..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Section */}
              {currentUser.role === 'student' && (
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. Thông tin học tập & Trường lớp</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Trường THPT</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: THPT Chu Văn An"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp học</label>
                      <input
                        type="text"
                        placeholder="Lớp 11A3"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mã định danh học sinh</label>
                      <input
                        type="text"
                        placeholder="CVA-2024-11A3-019"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sở thích cá nhân (cách nhau bởi dấu phẩy)</label>
                      <input
                        type="text"
                        placeholder="Vẽ tranh, Nghe nhạc Lofi, Lập trình..."
                        value={hobbiesInput}
                        onChange={(e) => setHobbiesInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentUser.role === 'parent' && (
                <div className="p-3.5 bg-pink-50/60 rounded-xl border border-pink-100 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-pink-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-pink-600" />
                    <span>2. Thông tin nghề nghiệp & Công tác</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nghề nghiệp</label>
                      <input
                        type="text"
                        placeholder="Kỹ sư công nghệ, Bác sĩ, Giảng viên..."
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nơi làm việc</label>
                      <input
                        type="text"
                        placeholder="Tập đoàn FPT, Bệnh viện Bạch Mai..."
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentUser.role === 'psychologist' && (
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Chuyên môn & Chứng chỉ tâm lý</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Học vị / Chức danh</label>
                      <input
                        type="text"
                        placeholder="ThS. Tâm lý học Lâm sàng Học đường"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị công tác</label>
                      <input
                        type="text"
                        placeholder="Viện Sức khỏe Tâm thần Quốc gia"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Số chứng chỉ hành nghề</label>
                      <input
                        type="text"
                        placeholder="CCHN-TL-0889"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên môn chính</label>
                      <input
                        type="text"
                        placeholder="Tham vấn tâm lý thanh thiếu niên"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Số năm kinh nghiệm</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>3. Người liên hệ khẩn cấp (Hỗ trợ tâm lý khẩn)</span>
                  </h4>
                  <span className="text-[10px] text-rose-600 font-medium">Bắt buộc đối với học sinh</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên người liên hệ</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Trần Thu Hương (Mẹ)"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại khẩn cấp</label>
                    <input
                      type="tel"
                      placeholder="0912..."
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mối quan hệ</label>
                    <input
                      type="text"
                      placeholder="Mẹ ruột, Bố, Người giám hộ..."
                      value={emergencyRel}
                      onChange={(e) => setEmergencyRel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đôi dòng giới thiệu bản thân / Tiểu sử
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Chia sẻ ngắn về tính cách, mục tiêu cá nhân hoặc thông điệp gia đình..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Save Button */}
              <button
                id="btn-save-profile"
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu cập nhật hồ sơ & Đồng bộ Supabase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= TAB 2: SECURITY & PASSWORD ================= */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Security info card */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-indigo-950">Chính sách bảo mật mật khẩu sản phẩm</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Nền tảng yêu cầu mật khẩu có độ dài tối thiểu 6 ký tự. Hãy tạo mật khẩu mạnh bao gồm chữ hoa, chữ thường và số để đảm bảo an toàn cho nhật ký và dữ liệu cảm xúc riêng tư của gia đình.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Lần đổi mật khẩu gần nhất:{' '}
                      <strong className="text-slate-700">
                        {currentUser.lastPasswordChangedAt
                          ? new Date(currentUser.lastPasswordChangedAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'Chưa từng thay đổi'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-current-password"
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu đang dùng..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu mới (Tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-new-password"
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu bảo mật mới..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${
                            newPassword.length < 6
                              ? 'w-1/4 bg-rose-500'
                              : newPassword.length < 8
                              ? 'w-2/3 bg-amber-500'
                              : 'w-full bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {newPassword.length < 6 ? 'Yếu (< 6 ký tự)' : newPassword.length < 8 ? 'Trung bình' : 'Mạnh'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-confirm-password"
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-change-password"
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Cập nhật mật khẩu mới & Bảo vệ tài khoản</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mọi thay đổi được lưu trực tiếp lên Supabase Cloud Database</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
