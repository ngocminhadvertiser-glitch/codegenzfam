import { User, UserRole, EmotionJournalEntry, ConsultationSession } from '../types';

export interface NavItemConfig {
  id: string;
  label: string;
  iconName: string;
  description?: string;
}

/**
 * Check if a user has permission to view a specific journal entry.
 * Rules:
 * 1. Unauthenticated: No access.
 * 2. Student: Only sees their own journals.
 * 3. Parent: ONLY sees journals of students in the same family group that are shared with parents ('share_parent', 'share_all', 'parents_only', 'family_open').
 * 4. Psychologist: ONLY sees journals shared with psychologist ('share_psychologist', 'share_all', 'psychologist_only') or explicitly attached to a consultation.
 * 5. Admin: Strictly CANNOT view confidential journal entries (Zero-Trust Privacy for sensitive mental health data).
 */
export function canUserViewJournal(
  user: User | null | undefined,
  journal: EmotionJournalEntry,
  userFamilyId?: string,
  consultationSharedJournalIds: string[] = []
): boolean {
  if (!user) return false;

  // Student can only see their own journals
  if (user.role === 'student') {
    return journal.studentId === user.id;
  }

  // Parent can only see journals of children within their own family group that are shared with parents
  if (user.role === 'parent') {
    const isSameFamily = Boolean(
      (userFamilyId && journal.familyId && userFamilyId === journal.familyId) ||
      (!journal.familyId && user.familyId) // Fallback for initial demo seed journals
    );
    const isSharedWithParent =
      journal.privacy === 'share_parent' ||
      journal.privacy === 'share_all' ||
      (journal.privacy as string) === 'parents_only' ||
      (journal.privacy as string) === 'family_open';

    return isSameFamily && isSharedWithParent;
  }

  // Psychologist can only see journals explicitly authorized by the student or attached to consultations
  if (user.role === 'psychologist') {
    const isDirectlySharedWithPsych =
      journal.privacy === 'share_psychologist' ||
      journal.privacy === 'share_all' ||
      (journal.privacy as string) === 'psychologist_only';

    const isAttachedToConsultation = consultationSharedJournalIds.includes(journal.id);

    return isDirectlySharedWithPsych || isAttachedToConsultation;
  }

  // Admin: Privacy-first zero-trust rule - Admin cannot read private journals of users
  if (user.role === 'admin') {
    return false;
  }

  return false;
}

/**
 * Check if a user has permission to view a consultation session.
 * Rules:
 * 1. Student: ONLY sees consultations requested by themselves.
 * 2. Psychologist: ONLY sees consultations assigned to them or unassigned waiting in the intake queue.
 * 3. Parent: Cannot access private student-psychologist clinical consultations.
 * 4. Admin: Cannot view confidential psychological consultation notes.
 */
export function canUserViewConsultation(
  user: User | null | undefined,
  consultation: ConsultationSession
): boolean {
  if (!user) return false;

  if (user.role === 'student') {
    return consultation.studentId === user.id;
  }

  if (user.role === 'psychologist') {
    return consultation.psychologistId === user.id || !consultation.psychologistId;
  }

  // Parent and Admin cannot access private clinical consultations
  return false;
}

/**
 * Check if a specific tab is allowed for a user role.
 */
export function isTabAllowedForRole(role: UserRole | undefined, tabId: string): boolean {
  if (!role) {
    // Guest allowed tabs
    return ['dashboard', 'journal', 'ai_coach'].includes(tabId);
  }

  switch (role) {
    case 'student':
      // Student has access to mental health hub, journal, consultation, family deep talk & challenges, AI assistant
      return ['dashboard', 'journal', 'consultation', 'deeptalk', 'challenge', 'ai_coach'].includes(tabId);

    case 'parent':
      // Parent has access to overview, children's shared journals, family deep talk, 30-day challenge, AI coach
      // Parent does NOT have access to consultation or admin tabs
      return ['dashboard', 'journal', 'deeptalk', 'challenge', 'ai_coach'].includes(tabId);

    case 'psychologist':
      // Psychologist has access to overview, consultation queues, authorized journals, AI specialist coach
      // Psychologist does NOT see private family deep talks or system admin
      return ['dashboard', 'consultation', 'journal', 'ai_coach'].includes(tabId);

    case 'admin':
      // Admin only focuses on system management, users, question banks, database, and audit logs
      // Admin does NOT see private journals or consultations
      return ['admin', 'dashboard', 'ai_coach'].includes(tabId);

    default:
      return false;
  }
}

/**
 * Get navigation items tailored for the user's role.
 */
export function getNavItemsForRole(role: UserRole | undefined) {
  if (!role) {
    return [
      { id: 'dashboard', label: 'Tổng quan nền tảng', iconName: 'LayoutDashboard' },
      { id: 'journal', label: 'Nhật ký C-O-D-E', iconName: 'BookOpen' },
      { id: 'ai_coach', label: 'Trợ lý AI CODE', iconName: 'Sparkles' },
    ];
  }

  switch (role) {
    case 'student':
      return [
        { id: 'dashboard', label: 'Tổng quan', iconName: 'LayoutDashboard' },
        { id: 'journal', label: 'Nhật ký cảm xúc', iconName: 'BookOpen' },
        { id: 'consultation', label: 'Tham vấn Chuyên gia', iconName: 'MessageCircleQuestion' },
        { id: 'deeptalk', label: 'Deep Talk Gia đình', iconName: 'HeartHandshake' },
        { id: 'challenge', label: 'Thử thách 30 ngày', iconName: 'CalendarCheck2' },
        { id: 'ai_coach', label: 'Trợ lý AI CODE', iconName: 'Sparkles' },
      ];

    case 'parent':
      return [
        { id: 'dashboard', label: 'Tổng quan gia đình', iconName: 'LayoutDashboard' },
        { id: 'journal', label: 'Nhật ký con chia sẻ', iconName: 'BookOpen' },
        { id: 'deeptalk', label: 'Deep Talk Gia đình', iconName: 'HeartHandshake' },
        { id: 'challenge', label: 'Thử thách 30 ngày', iconName: 'CalendarCheck2' },
        { id: 'ai_coach', label: 'Trợ lý AI CODE', iconName: 'Sparkles' },
      ];

    case 'psychologist':
      return [
        { id: 'dashboard', label: 'Tổng quan chuyên gia', iconName: 'LayoutDashboard' },
        { id: 'consultation', label: 'Hàng đợi & Hồ sơ tham vấn', iconName: 'MessageCircleQuestion' },
        { id: 'journal', label: 'Nhật ký học sinh ủy quyền', iconName: 'BookOpen' },
        { id: 'ai_coach', label: 'Trợ lý AI CODE', iconName: 'Sparkles' },
      ];

    case 'admin':
      return [
        { id: 'admin', label: 'Quản trị hệ thống & Phân quyền', iconName: 'ShieldAlert' },
        { id: 'ai_coach', label: 'Trợ lý AI CODE', iconName: 'Sparkles' },
      ];
  }
}
