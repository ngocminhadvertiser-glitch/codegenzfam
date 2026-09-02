import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  Family,
  FamilyInvitation,
  EmotionJournalEntry,
  FamilyJournalEntry,
  ConsultationSession,
  DeepTalkTopic,
  DeepTalkSession,
  Challenge30DayTask,
  ChallengeDayProgress,
  HappinessPointRecord,
  NotificationItem,
  SecurityAuditLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FAMILIES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_FAMILY_JOURNAL_ENTRIES,
  INITIAL_CONSULTATIONS,
  DEEP_TALK_TOPICS,
  INITIAL_CHALLENGE_TASKS,
  INITIAL_CHALLENGE_PROGRESS,
  INITIAL_HAPPINESS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

// Default Supabase project credentials (configured for CODE GenZ Family)
export const DEFAULT_SUPABASE_URL = 'https://tqnzlwkakeocxufznjfi.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbnpsd2tha2VvY3h1ZnpuamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMzA2MTQsImV4cCI6MjEwMzkwNjYxNH0.6S_q6Fmo8_skd407kcIP3JS5vZuN36cLqJ87F-iUaO0';
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbnpsd2tha2VvY3h1ZnpuamZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzMDYxNCwiZXhwIjoyMTAzOTA2NjE0fQ.5ZFIV7UgqZQRbw6olsm3NRh6jC4nx10kRcBzLSg-8xk';

// Get Supabase credentials dynamically from environment or fallback
export function getSupabaseConfig(): { url: string; key: string } {
  let url = DEFAULT_SUPABASE_URL;
  let key = DEFAULT_SUPABASE_ANON_KEY;

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv.VITE_SUPABASE_URL) url = metaEnv.VITE_SUPABASE_URL;
    if (metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY) key = metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
    else if (metaEnv.VITE_SUPABASE_ANON_KEY) key = metaEnv.VITE_SUPABASE_ANON_KEY;
  }

  // Fallback to global process if defined
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.SUPABASE_URL) url = process.env.SUPABASE_URL;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    else if (process.env.SUPABASE_ANON_KEY) key = process.env.SUPABASE_ANON_KEY;
  }

  return { url, key };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  supabaseInstance = createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return supabaseInstance;
}

export const supabase = getSupabase();

// ============================================================
// DATA MAPPERS (TypeScript Objects <--> Supabase Tables)
// ============================================================

// 1. User
export function mapUserToDb(u: User): Record<string, any> {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    family_role: u.familyRole || null,
    avatar: u.avatar,
    family_id: u.familyId || null,
    grade: u.grade || null,
    title: u.title || null,
    bio: u.bio || null,
    phone: u.phone || null,
    verified: u.verified !== undefined ? Boolean(u.verified) : true,
    status: u.status || 'active',
    created_at: u.createdAt || new Date().toISOString(),
    last_login_at: u.lastLoginAt || new Date().toISOString(),
    password: u.password || '123456',
    permissions: u.permissions || {},
  };
}

export function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name || 'Người dùng',
    email: row.email || '',
    role: row.role || 'student',
    familyRole: row.family_role || undefined,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    familyId: row.family_id || undefined,
    grade: row.grade || undefined,
    title: row.title || undefined,
    bio: row.bio || undefined,
    phone: row.phone || undefined,
    verified: Boolean(row.verified),
    status: row.status || 'active',
    createdAt: row.created_at || new Date().toISOString(),
    lastLoginAt: row.last_login_at || new Date().toISOString(),
    password: row.password || undefined,
    permissions: row.permissions || {},
  };
}

// 2. Family
export function mapFamilyToDb(f: Family): Record<string, any> {
  return {
    id: f.id,
    name: f.name,
    family_code: f.familyCode,
    student_ids: f.studentIds || [],
    parent_ids: f.parentIds || [],
    happiness_points: f.happinessPoints || 0,
    streak_days: f.streakDays || 0,
    created_at: f.createdAt || new Date().toISOString(),
    avatar_icon: f.avatarIcon || '🏡',
    description: f.description || '',
  };
}

export function mapFamilyFromDb(row: any): Family {
  return {
    id: row.id,
    name: row.name || 'Gia Đình Yêu Thương',
    familyCode: row.family_code || 'CODEGENZ2026',
    studentIds: Array.isArray(row.student_ids) ? row.student_ids : [],
    parentIds: Array.isArray(row.parent_ids) ? row.parent_ids : [],
    happinessPoints: Number(row.happiness_points || 0),
    streakDays: Number(row.streak_days || 0),
    createdAt: row.created_at || new Date().toISOString(),
    avatarIcon: row.avatar_icon || '🏡',
    description: row.description || '',
  };
}

// 3. Family Invitation
export function mapInvitationToDb(inv: FamilyInvitation): Record<string, any> {
  return {
    id: inv.id,
    family_id: inv.familyId,
    family_name: inv.familyName,
    family_code: inv.familyCode,
    sender_id: inv.senderId,
    sender_name: inv.senderName,
    sender_role: inv.senderRole,
    recipient_email_or_phone: inv.recipientEmailOrPhone,
    target_family_role: inv.targetFamilyRole,
    status: inv.status,
    created_at: inv.createdAt || new Date().toISOString(),
  };
}

export function mapInvitationFromDb(row: any): FamilyInvitation {
  return {
    id: row.id,
    familyId: row.family_id,
    familyName: row.family_name,
    familyCode: row.family_code,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    recipientEmailOrPhone: row.recipient_email_or_phone,
    targetFamilyRole: row.target_family_role,
    status: row.status,
    createdAt: row.created_at,
  };
}

// 4. Emotion Journal
export function mapJournalToDb(j: EmotionJournalEntry): Record<string, any> {
  return {
    id: j.id,
    student_id: j.studentId,
    student_name: j.studentName,
    family_id: j.familyId || null,
    emotion: j.emotion,
    emotion_label: j.emotionLabel,
    intensity: j.intensity,
    triggers: j.triggers || [],
    reason: j.reason || '',
    events_happening: j.eventsHappening || '',
    wish_to_understand: j.wishToUnderstand || '',
    personal_note: j.personalNote || '',
    privacy: j.privacy,
    consultation_requested: Boolean(j.consultationRequested),
    consultation_id: j.consultationId || null,
    parent_reactions: j.parentReactions || [],
    created_at: j.createdAt || new Date().toISOString(),
  };
}

export function mapJournalFromDb(row: any): EmotionJournalEntry {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    familyId: row.family_id || undefined,
    emotion: row.emotion,
    emotionLabel: row.emotion_label,
    intensity: Number(row.intensity || 5),
    triggers: Array.isArray(row.triggers) ? row.triggers : [],
    reason: row.reason || '',
    eventsHappening: row.events_happening || '',
    wishToUnderstand: row.wish_to_understand || '',
    personalNote: row.personal_note || '',
    privacy: row.privacy || 'family_only',
    consultationRequested: Boolean(row.consultation_requested),
    consultationId: row.consultation_id || undefined,
    parentReactions: Array.isArray(row.parent_reactions) ? row.parent_reactions : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// 5. Family Journal
export function mapFamilyJournalToDb(j: FamilyJournalEntry): Record<string, any> {
  return {
    id: j.id,
    family_id: j.familyId,
    author_id: j.authorId,
    author_name: j.authorName,
    author_avatar: j.authorAvatar || null,
    author_role: j.authorRole,
    author_family_role: j.authorFamilyRole || null,
    title: j.title,
    content: j.content,
    emotion: j.emotion,
    emotion_label: j.emotionLabel,
    media: j.media || [],
    tags: j.tags || [],
    location: j.location || null,
    is_pinned: Boolean(j.isPinned),
    reactions: j.reactions || [],
    comments: j.comments || [],
    created_at: j.createdAt || new Date().toISOString(),
    updated_at: j.updatedAt || null,
  };
}

export function mapFamilyJournalFromDb(row: any): FamilyJournalEntry {
  return {
    id: row.id,
    familyId: row.family_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar || undefined,
    authorRole: row.author_role,
    authorFamilyRole: row.author_family_role || undefined,
    title: row.title,
    content: row.content,
    emotion: row.emotion,
    emotionLabel: row.emotion_label,
    media: Array.isArray(row.media) ? row.media : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    location: row.location || undefined,
    isPinned: Boolean(row.is_pinned),
    reactions: Array.isArray(row.reactions) ? row.reactions : [],
    comments: Array.isArray(row.comments) ? row.comments : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

// 6. Consultation Session
export function mapConsultationToDb(c: ConsultationSession): Record<string, any> {
  return {
    id: c.id,
    student_id: c.studentId,
    student_name: c.studentName,
    student_grade: c.studentGrade || null,
    psychologist_id: c.psychologistId || null,
    psychologist_name: c.psychologistName || null,
    psychologist_title: c.psychologistTitle || null,
    topic: c.topic,
    initial_message: c.initialMessage,
    shared_journal_ids: c.sharedJournalIds || [],
    status: c.status,
    messages: c.messages || [],
    official_feedback: c.officialFeedback || null,
    next_action_plan: c.nextActionPlan || null,
    private_professional_notes: c.privateProfessionalNotes || null,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
    completed_at: c.completedAt || null,
  };
}

export function mapConsultationFromDb(row: any): ConsultationSession {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentGrade: row.student_grade || undefined,
    psychologistId: row.psychologist_id || undefined,
    psychologistName: row.psychologist_name || undefined,
    psychologistTitle: row.psychologist_title || undefined,
    topic: row.topic,
    initialMessage: row.initial_message,
    sharedJournalIds: Array.isArray(row.shared_journal_ids) ? row.shared_journal_ids : [],
    status: row.status,
    messages: Array.isArray(row.messages) ? row.messages : [],
    officialFeedback: row.official_feedback || undefined,
    nextActionPlan: row.next_action_plan || undefined,
    privateProfessionalNotes: row.private_professional_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || undefined,
  };
}

// 7. Deep Talk Topic
export function mapTopicToDb(t: DeepTalkTopic): Record<string, any> {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    icon: t.icon || '💬',
    category: t.category || 'general',
    points_awarded: t.pointsAwarded || 30,
    questions: t.questions || [],
  };
}

export function mapTopicFromDb(row: any): DeepTalkTopic {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    icon: row.icon || '💬',
    category: row.category || 'general',
    pointsAwarded: Number(row.points_awarded || 30),
    questions: Array.isArray(row.questions) ? row.questions : [],
  };
}

// 8. Deep Talk Session
export function mapDeepTalkSessionToDb(s: DeepTalkSession): Record<string, any> {
  return {
    id: s.id,
    family_id: s.familyId,
    topic_id: s.topicId,
    topic_title: s.topicTitle,
    current_question_index: s.currentQuestionIndex || 0,
    answers: s.answers || [],
    reflection: s.reflection || '',
    is_completed: Boolean(s.isCompleted),
    completed_at: s.completedAt || null,
    started_at: s.startedAt || new Date().toISOString(),
  };
}

export function mapDeepTalkSessionFromDb(row: any): DeepTalkSession {
  return {
    id: row.id,
    familyId: row.family_id,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    currentQuestionIndex: Number(row.current_question_index || 0),
    answers: Array.isArray(row.answers) ? row.answers : [],
    reflection: row.reflection || undefined,
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    startedAt: row.started_at,
  };
}

// 9. Challenge Task
export function mapChallengeTaskToDb(t: Challenge30DayTask): Record<string, any> {
  return {
    day: t.day,
    stage: t.stage,
    stage_name: t.stageName,
    title: t.title,
    description: t.description || '',
    student_action: t.studentAction || '',
    parent_action: t.parentAction || '',
    points: t.points || 50,
    icon: t.icon || '🎯',
    tip: t.tip || '',
  };
}

export function mapChallengeTaskFromDb(row: any): Challenge30DayTask {
  return {
    day: Number(row.day),
    stage: (Number(row.stage) || 1) as 1 | 2 | 3 | 4,
    stageName: row.stage_name || 'Khởi Đầu',
    title: row.title,
    description: row.description || '',
    studentAction: row.student_action || '',
    parentAction: row.parent_action || '',
    points: Number(row.points || 50),
    icon: row.icon || '🎯',
    tip: row.tip || '',
  };
}

// 10. Challenge Progress
export function mapChallengeProgressToDb(p: ChallengeDayProgress): Record<string, any> {
  return {
    day: p.day,
    student_confirmed: Boolean(p.studentConfirmed),
    parent_confirmed: Boolean(p.parentConfirmed),
    is_completed: Boolean(p.isCompleted),
    completed_at: p.completedAt || null,
    note: p.note || '',
  };
}

export function mapChallengeProgressFromDb(row: any): ChallengeDayProgress {
  return {
    day: Number(row.day),
    studentConfirmed: Boolean(row.student_confirmed),
    parentConfirmed: Boolean(row.parent_confirmed),
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    note: row.note || undefined,
  };
}

// 11. Happiness History
export function mapHappinessToDb(h: HappinessPointRecord): Record<string, any> {
  return {
    id: h.id,
    family_id: h.familyId,
    amount: h.amount,
    source: h.source,
    source_title: h.sourceTitle,
    created_at: h.createdAt || new Date().toISOString(),
  };
}

export function mapHappinessFromDb(row: any): HappinessPointRecord {
  return {
    id: row.id,
    familyId: row.family_id,
    amount: Number(row.amount || 0),
    source: row.source,
    sourceTitle: row.source_title,
    createdAt: row.created_at,
  };
}

// 12. Notification
export function mapNotificationToDb(n: NotificationItem): Record<string, any> {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    is_read: Boolean(n.isRead),
    created_at: n.createdAt || new Date().toISOString(),
    action_tab: n.actionTab || null,
  };
}

export function mapNotificationFromDb(row: any): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as any,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
    actionTab: row.action_tab || undefined,
  };
}

// 13. Security Audit Log
export function mapAuditLogToDb(a: SecurityAuditLog): Record<string, any> {
  return {
    id: a.id,
    user_id: a.userId,
    user_name: a.userName,
    user_role: a.userRole,
    action: a.action,
    resource: a.resource,
    details: a.details,
    timestamp: a.timestamp || new Date().toISOString(),
    status: a.status || 'SUCCESS',
  };
}

export function mapAuditLogFromDb(row: any): SecurityAuditLog {
  return {
    id: row.id,
    userId: row.user_id || 'system',
    userName: row.user_name || 'Hệ thống',
    userRole: row.user_role || 'student',
    action: row.action,
    resource: row.resource || 'SYSTEM',
    details: row.details,
    timestamp: row.timestamp,
    status: row.status || 'SUCCESS',
  };
}

// ============================================================
// SUPABASE REALTIME & INITIAL STATE HYDRATION
// ============================================================

export interface SupabaseFullState {
  users: User[];
  families: Family[];
  familyInvitations: FamilyInvitation[];
  family: Family;
  journalEntries: EmotionJournalEntry[];
  familyJournals: FamilyJournalEntry[];
  consultations: ConsultationSession[];
  deepTalkTopics: DeepTalkTopic[];
  deepTalkSessions: DeepTalkSession[];
  challengeTasks: Challenge30DayTask[];
  challengeProgress: ChallengeDayProgress[];
  happinessHistory: HappinessPointRecord[];
  notifications: NotificationItem[];
  auditLogs: SecurityAuditLog[];
}

/**
 * Fetch all application state directly from Supabase Cloud PostgreSQL tables.
 * If empty or table doesn't exist, automatically falls back to default seed data.
 */
export async function fetchSupabaseInitialState(): Promise<SupabaseFullState | null> {
  try {
    const client = getSupabase();

    const [
      usersRes,
      familiesRes,
      invitationsRes,
      journalsRes,
      familyJournalsRes,
      consultationsRes,
      topicsRes,
      sessionsRes,
      tasksRes,
      progressRes,
      happinessRes,
      notificationsRes,
      auditLogsRes,
    ] = await Promise.allSettled([
      client.from('users').select('*'),
      client.from('families').select('*'),
      client.from('family_invitations').select('*'),
      client.from('emotion_journals').select('*'),
      client.from('family_journals').select('*'),
      client.from('consultation_sessions').select('*'),
      client.from('deep_talk_topics').select('*'),
      client.from('deep_talk_sessions').select('*'),
      client.from('challenge_tasks').select('*'),
      client.from('challenge_progress').select('*'),
      client.from('happiness_history').select('*'),
      client.from('notifications').select('*'),
      client.from('security_audit_logs').select('*'),
    ]);

    const usersData = usersRes.status === 'fulfilled' && usersRes.value.data ? usersRes.value.data.map(mapUserFromDb) : [];
    const familiesData = familiesRes.status === 'fulfilled' && familiesRes.value.data ? familiesRes.value.data.map(mapFamilyFromDb) : [];
    const invitationsData = invitationsRes.status === 'fulfilled' && invitationsRes.value.data ? invitationsRes.value.data.map(mapInvitationFromDb) : [];
    const journalsData = journalsRes.status === 'fulfilled' && journalsRes.value.data ? journalsRes.value.data.map(mapJournalFromDb) : [];
    const familyJournalsData = familyJournalsRes.status === 'fulfilled' && familyJournalsRes.value.data ? familyJournalsRes.value.data.map(mapFamilyJournalFromDb) : [];
    const consultationsData = consultationsRes.status === 'fulfilled' && consultationsRes.value.data ? consultationsRes.value.data.map(mapConsultationFromDb) : [];
    const topicsData = topicsRes.status === 'fulfilled' && topicsRes.value.data ? topicsRes.value.data.map(mapTopicFromDb) : [];
    const sessionsData = sessionsRes.status === 'fulfilled' && sessionsRes.value.data ? sessionsRes.value.data.map(mapDeepTalkSessionFromDb) : [];
    const tasksData = tasksRes.status === 'fulfilled' && tasksRes.value.data ? tasksRes.value.data.map(mapChallengeTaskFromDb) : [];
    const progressData = progressRes.status === 'fulfilled' && progressRes.value.data ? progressRes.value.data.map(mapChallengeProgressFromDb) : [];
    const happinessData = happinessRes.status === 'fulfilled' && happinessRes.value.data ? happinessRes.value.data.map(mapHappinessFromDb) : [];
    const notificationsData = notificationsRes.status === 'fulfilled' && notificationsRes.value.data ? notificationsRes.value.data.map(mapNotificationFromDb) : [];
    const auditLogsData = auditLogsRes.status === 'fulfilled' && auditLogsRes.value.data ? auditLogsRes.value.data.map(mapAuditLogFromDb) : [];

    // If Supabase has users, we consider it connected and populated
    const hasData = usersData.length > 0 || familiesData.length > 0 || journalsData.length > 0;

    const result: SupabaseFullState = {
      users: usersData.length > 0 ? usersData : INITIAL_USERS,
      families: familiesData.length > 0 ? familiesData : INITIAL_FAMILIES,
      familyInvitations: invitationsData,
      family: familiesData.length > 0 ? familiesData[0] : INITIAL_FAMILIES[0],
      journalEntries: journalsData.length > 0 ? journalsData : INITIAL_JOURNAL_ENTRIES,
      familyJournals: familyJournalsData.length > 0 ? familyJournalsData : INITIAL_FAMILY_JOURNAL_ENTRIES,
      consultations: consultationsData.length > 0 ? consultationsData : INITIAL_CONSULTATIONS,
      deepTalkTopics: topicsData.length > 0 ? topicsData : DEEP_TALK_TOPICS,
      deepTalkSessions: sessionsData,
      challengeTasks: tasksData.length > 0 ? tasksData : INITIAL_CHALLENGE_TASKS,
      challengeProgress: progressData.length > 0 ? progressData : INITIAL_CHALLENGE_PROGRESS,
      happinessHistory: happinessData.length > 0 ? happinessData : INITIAL_HAPPINESS_HISTORY,
      notifications: notificationsData.length > 0 ? notificationsData : INITIAL_NOTIFICATIONS,
      auditLogs: auditLogsData.length > 0 ? auditLogsData : INITIAL_AUDIT_LOGS,
    };

    // If Supabase is completely empty, trigger first-time background migration to populate tables
    if (!hasData) {
      console.log('[Supabase] Initializing empty Supabase database with default dataset...');
      migrateFullStateToSupabase(result).catch((err) => console.warn('[Supabase Auto-seed]:', err));
    }

    return result;
  } catch (err) {
    console.warn('[Supabase fetchInitialState error]:', err);
    return null;
  }
}

/**
 * Realtime subscription to Supabase postgres_changes
 */
export function subscribeToSupabaseChanges(callbacks: {
  onUsersChange?: (users: User[]) => void;
  onFamiliesChange?: (families: Family[]) => void;
  onJournalsChange?: (journals: EmotionJournalEntry[]) => void;
  onConsultationsChange?: (consultations: ConsultationSession[]) => void;
}): () => void {
  const client = getSupabase();

  const channel = client
    .channel('public:all_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
      if (callbacks.onUsersChange) {
        const { data } = await client.from('users').select('*');
        if (data) callbacks.onUsersChange(data.map(mapUserFromDb));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, async () => {
      if (callbacks.onFamiliesChange) {
        const { data } = await client.from('families').select('*');
        if (data) callbacks.onFamiliesChange(data.map(mapFamilyFromDb));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'emotion_journals' }, async () => {
      if (callbacks.onJournalsChange) {
        const { data } = await client.from('emotion_journals').select('*');
        if (data) callbacks.onJournalsChange(data.map(mapJournalFromDb));
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'consultation_sessions' }, async () => {
      if (callbacks.onConsultationsChange) {
        const { data } = await client.from('consultation_sessions').select('*');
        if (data) callbacks.onConsultationsChange(data.map(mapConsultationFromDb));
      }
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

// ============================================================
// DIRECT CRUD HELPERS FOR SUPABASE (Used by AppContext)
// ============================================================

export async function saveUserToSupabase(user: User): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapUserToDb(user);
    const { error } = await client.from('users').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase saveUser]:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase saveUser catch]:', err);
    return false;
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  try {
    const client = getSupabase();
    const { error } = await client.from('users').delete().eq('id', userId);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveFamilyToSupabase(family: Family): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapFamilyToDb(family);
    const { error } = await client.from('families').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteFamilyFromSupabase(familyId: string): Promise<boolean> {
  try {
    const client = getSupabase();
    const { error } = await client.from('families').delete().eq('id', familyId);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveInvitationToSupabase(inv: FamilyInvitation): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapInvitationToDb(inv);
    const { error } = await client.from('family_invitations').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveJournalToSupabase(journal: EmotionJournalEntry): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapJournalToDb(journal);
    const { error } = await client.from('emotion_journals').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteJournalFromSupabase(journalId: string): Promise<boolean> {
  try {
    const client = getSupabase();
    const { error } = await client.from('emotion_journals').delete().eq('id', journalId);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveFamilyJournalToSupabase(journal: FamilyJournalEntry): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapFamilyJournalToDb(journal);
    const { error } = await client.from('family_journals').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteFamilyJournalFromSupabase(journalId: string): Promise<boolean> {
  try {
    const client = getSupabase();
    const { error } = await client.from('family_journals').delete().eq('id', journalId);
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveConsultationToSupabase(consultation: ConsultationSession): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapConsultationToDb(consultation);
    const { error } = await client.from('consultation_sessions').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveDeepTalkTopicToSupabase(topic: DeepTalkTopic): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapTopicToDb(topic);
    const { error } = await client.from('deep_talk_topics').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveDeepTalkSessionToSupabase(session: DeepTalkSession): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapDeepTalkSessionToDb(session);
    const { error } = await client.from('deep_talk_sessions').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveChallengeTaskToSupabase(task: Challenge30DayTask): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapChallengeTaskToDb(task);
    const { error } = await client.from('challenge_tasks').upsert(row, { onConflict: 'day' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function saveChallengeProgressToSupabase(progress: ChallengeDayProgress): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapChallengeProgressToDb(progress);
    const { error } = await client.from('challenge_progress').upsert(row, { onConflict: 'day' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function addHappinessRecordToSupabase(record: HappinessPointRecord): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapHappinessToDb(record);
    const { error } = await client.from('happiness_history').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function addNotificationToSupabase(notification: NotificationItem): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapNotificationToDb(notification);
    const { error } = await client.from('notifications').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function addAuditLogToSupabase(log: SecurityAuditLog): Promise<boolean> {
  try {
    const client = getSupabase();
    const row = mapAuditLogToDb(log);
    const { error } = await client.from('security_audit_logs').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
}

// ============================================================
// FULL MIGRATION DIRECTLY FROM BROWSER / CLIENT
// ============================================================

export async function migrateFullStateToSupabase(state: {
  users: User[];
  families?: Family[];
  family?: Family;
  familyInvitations?: FamilyInvitation[];
  journalEntries: EmotionJournalEntry[];
  familyJournals?: FamilyJournalEntry[];
  consultations: ConsultationSession[];
  deepTalkTopics: DeepTalkTopic[];
  deepTalkSessions: DeepTalkSession[];
  challengeTasks: Challenge30DayTask[];
  challengeProgress: ChallengeDayProgress[];
  happinessHistory: HappinessPointRecord[];
  notifications: NotificationItem[];
  auditLogs: SecurityAuditLog[];
}): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
  errors: string[];
}> {
  const client = getSupabase();
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  const upsertTable = async (
    tableName: string,
    rows: any[],
    conflictKey: string = 'id'
  ) => {
    if (!rows || rows.length === 0) {
      counts[tableName] = 0;
      return;
    }
    try {
      const { error } = await client.from(tableName).upsert(rows, { onConflict: conflictKey });
      if (error) {
        errors.push(`Bảng ${tableName}: ${error.message}`);
        counts[tableName] = 0;
      } else {
        counts[tableName] = rows.length;
      }
    } catch (e: any) {
      errors.push(`Bảng ${tableName}: ${e.message || String(e)}`);
      counts[tableName] = 0;
    }
  };

  try {
    // 1. Users
    const userRows = (state.users.length > 0 ? state.users : INITIAL_USERS).map(mapUserToDb);
    await upsertTable('users', userRows, 'id');

    // 2. Families
    const familiesList = state.families && state.families.length > 0
      ? state.families
      : state.family
      ? [state.family]
      : INITIAL_FAMILIES;
    const familyRows = familiesList.map(mapFamilyToDb);
    await upsertTable('families', familyRows, 'id');

    // 3. Family Invitations
    const invRows = (state.familyInvitations || []).map(mapInvitationToDb);
    await upsertTable('family_invitations', invRows, 'id');

    // 4. Emotion Journals
    const journalRows = (state.journalEntries.length > 0 ? state.journalEntries : INITIAL_JOURNAL_ENTRIES).map(mapJournalToDb);
    await upsertTable('emotion_journals', journalRows, 'id');

    // 5. Family Journals
    const familyJournalRows = (state.familyJournals && state.familyJournals.length > 0
      ? state.familyJournals
      : INITIAL_FAMILY_JOURNAL_ENTRIES
    ).map(mapFamilyJournalToDb);
    await upsertTable('family_journals', familyJournalRows, 'id');

    // 6. Consultations
    const consultRows = (state.consultations.length > 0 ? state.consultations : INITIAL_CONSULTATIONS).map(mapConsultationToDb);
    await upsertTable('consultation_sessions', consultRows, 'id');

    // 7. Deep Talk Topics
    const topicRows = (state.deepTalkTopics.length > 0 ? state.deepTalkTopics : DEEP_TALK_TOPICS).map(mapTopicToDb);
    await upsertTable('deep_talk_topics', topicRows, 'id');

    // 8. Deep Talk Sessions
    const sessionRows = (state.deepTalkSessions || []).map(mapDeepTalkSessionToDb);
    await upsertTable('deep_talk_sessions', sessionRows, 'id');

    // 9. Challenge Tasks
    const taskRows = (state.challengeTasks.length > 0 ? state.challengeTasks : INITIAL_CHALLENGE_TASKS).map(mapChallengeTaskToDb);
    await upsertTable('challenge_tasks', taskRows, 'day');

    // 10. Challenge Progress
    const progRows = (state.challengeProgress.length > 0 ? state.challengeProgress : INITIAL_CHALLENGE_PROGRESS).map(mapChallengeProgressToDb);
    await upsertTable('challenge_progress', progRows, 'day');

    // 11. Happiness History
    const happyRows = (state.happinessHistory.length > 0 ? state.happinessHistory : INITIAL_HAPPINESS_HISTORY).map(mapHappinessToDb);
    await upsertTable('happiness_history', happyRows, 'id');

    // 12. Notifications
    const notifRows = (state.notifications.length > 0 ? state.notifications : INITIAL_NOTIFICATIONS).map(mapNotificationToDb);
    await upsertTable('notifications', notifRows, 'id');

    // 13. Security Audit Logs
    const logRows = (state.auditLogs.length > 0 ? state.auditLogs : INITIAL_AUDIT_LOGS).map(mapAuditLogToDb);
    await upsertTable('security_audit_logs', logRows, 'id');

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    if (errors.length > 0) {
      return {
        success: totalRecords > 0,
        message: `Đã chuyển đổi thành công ${totalRecords} bản ghi lên Supabase. Một số bảng có cảnh báo: ${errors.join(', ')}`,
        counts,
        errors,
      };
    }

    return {
      success: true,
      message: `Chuyển đổi toàn bộ thành công ${totalRecords} bản ghi lên 13 bảng Supabase Cloud Database!`,
      counts,
      errors: [],
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi trong quá trình chuyển đổi dữ liệu lên Supabase: ${err.message || String(err)}`,
      counts,
      errors: [err.message || String(err)],
    };
  }
}
