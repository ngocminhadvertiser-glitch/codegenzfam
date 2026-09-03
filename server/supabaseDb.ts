import { createClient, SupabaseClient } from "@supabase/supabase-js";
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
} from "../src/types";
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
} from "../src/data/initialData";
import { getFullSqliteSnapshot } from "./sqliteDb";

export const DEFAULT_SUPABASE_URL = "https://tqnzlwkakeocxufznjfi.supabase.co";
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbnpsd2tha2VvY3h1ZnpuamZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzMDYxNCwiZXhwIjoyMTAzOTA2NjE0fQ.5ZFIV7UgqZQRbw6olsm3NRh6jC4nx10kRcBzLSg-8xk";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error("[Supabase] Failed to create client:", err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return true;
}

export const SUPABASE_SCHEMA_SQL = `-- ============================================================
-- CODE GenZ Family - Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- 1. Users Table (Thực tế, bảo mật, tối ưu cho Học sinh GenZ, Phụ huynh & Chuyên gia)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  family_role TEXT,
  avatar TEXT,
  family_id TEXT,
  password TEXT,
  must_change_password BOOLEAN DEFAULT false,
  last_password_changed_at TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  lockout_until TEXT,
  gender TEXT,
  date_of_birth TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  school_name TEXT,
  grade TEXT,
  student_code TEXT,
  hobbies JSONB DEFAULT '[]'::jsonb,
  occupation TEXT,
  workplace TEXT,
  title TEXT,
  organization TEXT,
  license_number TEXT,
  specialization TEXT,
  years_of_experience INTEGER,
  bio TEXT,
  verified BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TEXT,
  updated_at TEXT,
  last_login_at TEXT
);

-- 2. Families Table
CREATE TABLE IF NOT EXISTS public.families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family_code TEXT UNIQUE NOT NULL,
  student_ids JSONB DEFAULT '[]'::jsonb,
  parent_ids JSONB DEFAULT '[]'::jsonb,
  happiness_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TEXT,
  avatar_icon TEXT,
  description TEXT
);

-- 3. Family Invitations Table
CREATE TABLE IF NOT EXISTS public.family_invitations (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  family_name TEXT NOT NULL,
  family_code TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipient_email_or_phone TEXT NOT NULL,
  target_family_role TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL
);

-- 4. Emotion Journals Table
CREATE TABLE IF NOT EXISTS public.emotion_journals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  family_id TEXT,
  emotion TEXT NOT NULL,
  emotion_label TEXT NOT NULL,
  intensity INTEGER NOT NULL,
  triggers JSONB DEFAULT '[]'::jsonb,
  reason TEXT,
  events_happening TEXT,
  wish_to_understand TEXT,
  personal_note TEXT,
  privacy TEXT NOT NULL,
  consultation_requested BOOLEAN DEFAULT false,
  consultation_id TEXT,
  parent_reactions JSONB DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL
);

-- 5. Family Journals (Shared Moments & Deep Connect) Table
CREATE TABLE IF NOT EXISTS public.family_journals (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT NOT NULL,
  author_family_role TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  emotion TEXT NOT NULL,
  emotion_label TEXT NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  is_pinned BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- 6. Consultation Sessions Table
CREATE TABLE IF NOT EXISTS public.consultation_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_grade TEXT,
  psychologist_id TEXT,
  psychologist_name TEXT,
  psychologist_title TEXT,
  topic TEXT NOT NULL,
  initial_message TEXT NOT NULL,
  shared_journal_ids JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  official_feedback TEXT,
  next_action_plan TEXT,
  private_professional_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

-- 7. Deep Talk Topics Table
CREATE TABLE IF NOT EXISTS public.deep_talk_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  points_awarded INTEGER DEFAULT 30,
  questions JSONB DEFAULT '[]'::jsonb
);

-- 8. Deep Talk Sessions Table
CREATE TABLE IF NOT EXISTS public.deep_talk_sessions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  reflection TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  started_at TEXT NOT NULL
);

-- 9. Challenge 30 Day Tasks Table
CREATE TABLE IF NOT EXISTS public.challenge_tasks (
  day INTEGER PRIMARY KEY,
  stage INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  student_action TEXT,
  parent_action TEXT,
  points INTEGER DEFAULT 50,
  icon TEXT,
  tip TEXT
);

-- 10. Challenge Day Progress Table
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  day INTEGER PRIMARY KEY,
  student_confirmed BOOLEAN DEFAULT false,
  parent_confirmed BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  note TEXT
);

-- 11. Happiness Points History Table
CREATE TABLE IF NOT EXISTS public.happiness_history (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_title TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL,
  action_tab TEXT
);

-- 13. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Disable Row Level Security (RLS) to ensure seamless API and applet storage operations
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deep_talk_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deep_talk_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.happiness_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs DISABLE ROW LEVEL SECURITY;
`;

// ==========================================
// DATA MAPPER HELPERS (CamelCase <-> Snake_Case & JSONB)
// ==========================================

export function mapUserToSupabase(u: User): any {
  return {
    id: u.id,
    name: u.name,
    email: u.email || null,
    role: u.role,
    family_role: u.familyRole || null,
    avatar: u.avatar || null,
    family_id: u.familyId || null,
    password: u.password || null,
    must_change_password: Boolean(u.mustChangePassword),
    last_password_changed_at: u.lastPasswordChangedAt || null,
    failed_login_attempts: u.failedLoginAttempts || 0,
    lockout_until: u.lockoutUntil || null,
    gender: u.gender || null,
    date_of_birth: u.dateOfBirth || null,
    phone: u.phone || null,
    address: u.address || null,
    city: u.city || null,
    emergency_contact_name: u.emergencyContactName || null,
    emergency_contact_phone: u.emergencyContactPhone || null,
    emergency_contact_relationship: u.emergencyContactRelationship || null,
    school_name: u.schoolName || null,
    grade: u.grade || null,
    student_code: u.studentCode || null,
    hobbies: u.hobbies || [],
    occupation: u.occupation || null,
    workplace: u.workplace || null,
    title: u.title || null,
    organization: u.organization || null,
    license_number: u.licenseNumber || null,
    specialization: u.specialization || null,
    years_of_experience: u.yearsOfExperience || null,
    bio: u.bio || null,
    verified: u.verified ?? true,
    status: u.status || "active",
    permissions: u.permissions || {},
    created_at: u.createdAt || new Date().toISOString(),
    updated_at: u.updatedAt || new Date().toISOString(),
    last_login_at: u.lastLoginAt || new Date().toISOString(),
  };
}

export function mapUserFromSupabase(row: any): User {
  let parsedHobbies: string[] | undefined = undefined;
  if (Array.isArray(row.hobbies)) {
    parsedHobbies = row.hobbies;
  } else if (typeof row.hobbies === "string") {
    try {
      parsedHobbies = JSON.parse(row.hobbies);
    } catch {
      parsedHobbies = row.hobbies.split(",").map((s: string) => s.trim());
    }
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    familyRole: row.family_role || undefined,
    avatar: row.avatar,
    familyId: row.family_id || undefined,
    gender: row.gender || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    phone: row.phone || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    emergencyContactName: row.emergency_contact_name || undefined,
    emergencyContactPhone: row.emergency_contact_phone || undefined,
    emergencyContactRelationship: row.emergency_contact_relationship || undefined,
    schoolName: row.school_name || undefined,
    grade: row.grade || undefined,
    studentCode: row.student_code || undefined,
    hobbies: parsedHobbies,
    occupation: row.occupation || undefined,
    workplace: row.workplace || undefined,
    title: row.title || undefined,
    organization: row.organization || undefined,
    licenseNumber: row.license_number || undefined,
    specialization: row.specialization || undefined,
    yearsOfExperience: row.years_of_experience ? Number(row.years_of_experience) : undefined,
    bio: row.bio || undefined,
    verified: Boolean(row.verified),
    status: row.status || "active",
    password: row.password || undefined,
    mustChangePassword: Boolean(row.must_change_password),
    lastPasswordChangedAt: row.last_password_changed_at || undefined,
    failedLoginAttempts: row.failed_login_attempts ? Number(row.failed_login_attempts) : undefined,
    lockoutUntil: row.lockout_until || undefined,
    permissions: typeof row.permissions === "string" ? JSON.parse(row.permissions) : row.permissions || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    lastLoginAt: row.last_login_at,
  };
}

export function mapFamilyToSupabase(f: Family): any {
  return {
    id: f.id,
    name: f.name,
    family_code: f.familyCode,
    student_ids: f.studentIds || [],
    parent_ids: f.parentIds || [],
    happiness_points: f.happinessPoints ?? 0,
    streak_days: f.streakDays ?? 0,
    created_at: f.createdAt || new Date().toISOString(),
    avatar_icon: f.avatarIcon || "🏡",
    description: f.description || "",
  };
}

export function mapFamilyFromSupabase(row: any): Family {
  return {
    id: row.id,
    name: row.name,
    familyCode: row.family_code,
    studentIds: typeof row.student_ids === "string" ? JSON.parse(row.student_ids) : row.student_ids || [],
    parentIds: typeof row.parent_ids === "string" ? JSON.parse(row.parent_ids) : row.parent_ids || [],
    happinessPoints: Number(row.happiness_points || 0),
    streakDays: Number(row.streak_days || 0),
    createdAt: row.created_at,
    avatarIcon: row.avatar_icon || "🏡",
    description: row.description || "",
  };
}

export function mapInvitationToSupabase(inv: FamilyInvitation): any {
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
    status: inv.status || "pending",
    created_at: inv.createdAt || new Date().toISOString(),
  };
}

export function mapInvitationFromSupabase(row: any): FamilyInvitation {
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

export function mapJournalToSupabase(j: EmotionJournalEntry): any {
  return {
    id: j.id,
    student_id: j.studentId,
    student_name: j.studentName,
    family_id: j.familyId || null,
    emotion: j.emotion,
    emotion_label: j.emotionLabel,
    intensity: j.intensity,
    triggers: j.triggers || [],
    reason: j.reason || "",
    events_happening: j.eventsHappening || "",
    wish_to_understand: j.wishToUnderstand || "",
    personal_note: j.personalNote || "",
    privacy: j.privacy,
    consultation_requested: Boolean(j.consultationRequested),
    consultation_id: j.consultationId || null,
    parent_reactions: j.parentReactions || [],
    created_at: j.createdAt || new Date().toISOString(),
  };
}

export function mapJournalFromSupabase(row: any): EmotionJournalEntry {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    familyId: row.family_id || undefined,
    emotion: row.emotion,
    emotionLabel: row.emotion_label,
    intensity: Number(row.intensity || 5),
    triggers: typeof row.triggers === "string" ? JSON.parse(row.triggers) : row.triggers || [],
    reason: row.reason || "",
    eventsHappening: row.events_happening || "",
    wishToUnderstand: row.wish_to_understand || "",
    personalNote: row.personal_note || "",
    privacy: row.privacy,
    consultationRequested: Boolean(row.consultation_requested),
    consultationId: row.consultation_id || undefined,
    parentReactions: typeof row.parent_reactions === "string" ? JSON.parse(row.parent_reactions) : row.parent_reactions || [],
    createdAt: row.created_at,
  };
}

export function mapFamilyJournalToSupabase(fj: FamilyJournalEntry): any {
  return {
    id: fj.id,
    family_id: fj.familyId,
    author_id: fj.authorId,
    author_name: fj.authorName,
    author_avatar: fj.authorAvatar || null,
    author_role: fj.authorRole,
    author_family_role: fj.authorFamilyRole || null,
    title: fj.title,
    content: fj.content,
    emotion: fj.emotion,
    emotion_label: fj.emotionLabel,
    media: fj.media || [],
    tags: fj.tags || [],
    location: fj.location || null,
    is_pinned: Boolean(fj.isPinned),
    reactions: fj.reactions || [],
    comments: fj.comments || [],
    created_at: fj.createdAt || new Date().toISOString(),
    updated_at: fj.updatedAt || null,
  };
}

export function mapFamilyJournalFromSupabase(row: any): FamilyJournalEntry {
  return {
    id: row.id,
    familyId: row.family_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorRole: row.author_role,
    authorFamilyRole: row.author_family_role || undefined,
    title: row.title,
    content: row.content,
    emotion: row.emotion,
    emotionLabel: row.emotion_label,
    media: typeof row.media === "string" ? JSON.parse(row.media) : row.media || [],
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
    location: row.location || undefined,
    isPinned: Boolean(row.is_pinned),
    reactions: typeof row.reactions === "string" ? JSON.parse(row.reactions) : row.reactions || [],
    comments: typeof row.comments === "string" ? JSON.parse(row.comments) : row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

export function mapConsultationToSupabase(c: ConsultationSession): any {
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

export function mapConsultationFromSupabase(row: any): ConsultationSession {
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
    sharedJournalIds: typeof row.shared_journal_ids === "string" ? JSON.parse(row.shared_journal_ids) : row.shared_journal_ids || [],
    status: row.status,
    messages: typeof row.messages === "string" ? JSON.parse(row.messages) : row.messages || [],
    officialFeedback: row.official_feedback || undefined,
    nextActionPlan: row.next_action_plan || undefined,
    privateProfessionalNotes: row.private_professional_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || undefined,
  };
}

export function mapDeepTalkTopicToSupabase(t: DeepTalkTopic): any {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    icon: t.icon || "💬",
    category: t.category || "General",
    points_awarded: t.pointsAwarded || 30,
    questions: t.questions || [],
  };
}

export function mapDeepTalkTopicFromSupabase(row: any): DeepTalkTopic {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    icon: row.icon || "💬",
    category: row.category || "General",
    pointsAwarded: Number(row.points_awarded || 30),
    questions: typeof row.questions === "string" ? JSON.parse(row.questions) : row.questions || [],
  };
}

export function mapDeepTalkSessionToSupabase(s: DeepTalkSession): any {
  return {
    id: s.id,
    family_id: s.familyId,
    topic_id: s.topicId,
    topic_title: s.topicTitle,
    current_question_index: s.currentQuestionIndex || 0,
    answers: s.answers || [],
    reflection: s.reflection || null,
    is_completed: Boolean(s.isCompleted),
    completed_at: s.completedAt || null,
    started_at: s.startedAt || new Date().toISOString(),
  };
}

export function mapDeepTalkSessionFromSupabase(row: any): DeepTalkSession {
  return {
    id: row.id,
    familyId: row.family_id,
    topicId: row.topic_id,
    topicTitle: row.topic_title,
    currentQuestionIndex: Number(row.current_question_index || 0),
    answers: typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers || [],
    reflection: row.reflection || undefined,
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    startedAt: row.started_at,
  };
}

export function mapChallengeTaskToSupabase(t: Challenge30DayTask): any {
  return {
    day: t.day,
    stage: t.stage,
    stage_name: t.stageName,
    title: t.title,
    description: t.description || "",
    student_action: t.studentAction || "",
    parent_action: t.parentAction || "",
    points: t.points || 50,
    icon: t.icon || "🌟",
    tip: t.tip || "",
  };
}

export function mapChallengeTaskFromSupabase(row: any): Challenge30DayTask {
  return {
    day: Number(row.day),
    stage: Number(row.stage) as 1 | 2 | 3 | 4,
    stageName: row.stage_name,
    title: row.title,
    description: row.description || "",
    studentAction: row.student_action || "",
    parentAction: row.parent_action || "",
    points: Number(row.points || 50),
    icon: row.icon || "🌟",
    tip: row.tip || "",
  };
}

export function mapChallengeProgressToSupabase(p: ChallengeDayProgress): any {
  return {
    day: p.day,
    student_confirmed: Boolean(p.studentConfirmed),
    parent_confirmed: Boolean(p.parentConfirmed),
    is_completed: Boolean(p.isCompleted),
    completed_at: p.completedAt || null,
    note: p.note || null,
  };
}

export function mapChallengeProgressFromSupabase(row: any): ChallengeDayProgress {
  return {
    day: Number(row.day),
    studentConfirmed: Boolean(row.student_confirmed),
    parentConfirmed: Boolean(row.parent_confirmed),
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    note: row.note || undefined,
  };
}

export function mapHappinessToSupabase(h: HappinessPointRecord): any {
  return {
    id: h.id,
    family_id: h.familyId,
    amount: h.amount,
    source: h.source,
    source_title: h.sourceTitle,
    created_at: h.createdAt || new Date().toISOString(),
  };
}

export function mapHappinessFromSupabase(row: any): HappinessPointRecord {
  return {
    id: row.id,
    familyId: row.family_id,
    amount: Number(row.amount),
    source: row.source as any,
    sourceTitle: row.source_title,
    createdAt: row.created_at,
  };
}

export function mapNotificationToSupabase(n: NotificationItem): any {
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

export function mapNotificationFromSupabase(row: any): NotificationItem {
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

export function mapAuditLogToSupabase(l: SecurityAuditLog): any {
  return {
    id: l.id,
    user_id: l.userId,
    user_name: l.userName,
    user_role: l.userRole,
    action: l.action,
    resource: l.resource,
    details: l.details,
    timestamp: l.timestamp || new Date().toISOString(),
    status: l.status,
  };
}

export function mapAuditLogFromSupabase(row: any): SecurityAuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role as any,
    action: row.action,
    resource: row.resource,
    details: row.details,
    timestamp: row.timestamp,
    status: row.status as any,
  };
}

// ==========================================
// STATUS & STATS INSPECTOR
// ==========================================

export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  projectUrl?: string;
  hasServiceRole: boolean;
  tables: Record<string, { exists: boolean; count?: number; error?: string }>;
  error?: string;
}> {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      connected: false,
      hasServiceRole: false,
      tables: {},
      error: "Supabase URL hoặc API Key chưa được cấu hình trong tệp .env",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: true,
      connected: false,
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      projectUrl: process.env.SUPABASE_URL,
      tables: {},
      error: "Không thể khởi tạo kết nối Supabase Client",
    };
  }

  const tableNames = [
    "users",
    "families",
    "family_invitations",
    "emotion_journals",
    "family_journals",
    "consultation_sessions",
    "deep_talk_topics",
    "deep_talk_sessions",
    "challenge_tasks",
    "challenge_progress",
    "happiness_history",
    "notifications",
    "security_audit_logs",
  ];

  const tableResults: Record<string, { exists: boolean; count?: number; error?: string }> = {};
  let anyTableExists = false;

  for (const table of tableNames) {
    try {
      const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
      if (error) {
        tableResults[table] = {
          exists: false,
          error: error.message,
        };
      } else {
        anyTableExists = true;
        tableResults[table] = {
          exists: true,
          count: count ?? 0,
        };
      }
    } catch (err: any) {
      tableResults[table] = {
        exists: false,
        error: err.message || "Lỗi truy vấn bảng",
      };
    }
  }

  return {
    configured: true,
    connected: true,
    projectUrl: process.env.SUPABASE_URL,
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    tables: tableResults,
  };
}

// ==========================================
// FULL DATABASE MIGRATION TO SUPABASE
// ==========================================

export async function migrateAllDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
  errors: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Chưa cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env");
  }

  // Get current snapshot (from SQLite or fallback initial)
  const snapshot = getFullSqliteSnapshot();
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  // Helper for batch upsert
  async function upsertTable(tableName: string, data: any[], primaryKey: string = "id") {
    if (!data || data.length === 0) {
      counts[tableName] = 0;
      return;
    }
    try {
      const { error } = await client!.from(tableName).upsert(data, {
        onConflict: primaryKey,
        ignoreDuplicates: false,
      });
      if (error) {
        console.error(`[Supabase Migration] Error upserting table [${tableName}]:`, error);
        errors.push(`Bảng ${tableName}: ${error.message}`);
        counts[tableName] = 0;
      } else {
        counts[tableName] = data.length;
        console.log(`[Supabase Migration] Successfully synced ${data.length} records into [${tableName}]`);
      }
    } catch (err: any) {
      console.error(`[Supabase Migration] Fatal error on [${tableName}]:`, err);
      errors.push(`Bảng ${tableName}: ${err.message}`);
      counts[tableName] = 0;
    }
  }

  console.log("[Supabase Migration] Starting full data migration to Supabase cloud database...");

  // 1. Users
  const userRows = (snapshot.users.length > 0 ? snapshot.users : INITIAL_USERS).map(mapUserToSupabase);
  await upsertTable("users", userRows, "id");

  // 2. Families
  const familyRows = (snapshot.families.length > 0 ? snapshot.families : INITIAL_FAMILIES).map(mapFamilyToSupabase);
  await upsertTable("families", familyRows, "id");

  // 3. Family Invitations
  const invRows = (snapshot.familyInvitations || []).map(mapInvitationToSupabase);
  await upsertTable("family_invitations", invRows, "id");

  // 4. Emotion Journals
  const journalRows = (snapshot.journalEntries.length > 0 ? snapshot.journalEntries : INITIAL_JOURNAL_ENTRIES).map(mapJournalToSupabase);
  await upsertTable("emotion_journals", journalRows, "id");

  // 5. Family Journals
  const familyJournalRows = (snapshot.familyJournals.length > 0 ? snapshot.familyJournals : INITIAL_FAMILY_JOURNAL_ENTRIES).map(mapFamilyJournalToSupabase);
  await upsertTable("family_journals", familyJournalRows, "id");

  // 6. Consultations
  const consultRows = (snapshot.consultations.length > 0 ? snapshot.consultations : INITIAL_CONSULTATIONS).map(mapConsultationToSupabase);
  await upsertTable("consultation_sessions", consultRows, "id");

  // 7. Deep Talk Topics
  const dtTopicRows = (snapshot.deepTalkTopics.length > 0 ? snapshot.deepTalkTopics : DEEP_TALK_TOPICS).map(mapDeepTalkTopicToSupabase);
  await upsertTable("deep_talk_topics", dtTopicRows, "id");

  // 8. Deep Talk Sessions
  const dtSessionRows = (snapshot.deepTalkSessions || []).map(mapDeepTalkSessionToSupabase);
  await upsertTable("deep_talk_sessions", dtSessionRows, "id");

  // 9. Challenge Tasks
  const challengeTaskRows = (snapshot.challengeTasks.length > 0 ? snapshot.challengeTasks : INITIAL_CHALLENGE_TASKS).map(mapChallengeTaskToSupabase);
  await upsertTable("challenge_tasks", challengeTaskRows, "day");

  // 10. Challenge Progress
  const challengeProgressRows = (snapshot.challengeProgress.length > 0 ? snapshot.challengeProgress : INITIAL_CHALLENGE_PROGRESS).map(mapChallengeProgressToSupabase);
  await upsertTable("challenge_progress", challengeProgressRows, "day");

  // 11. Happiness History
  const happinessRows = (snapshot.happinessHistory.length > 0 ? snapshot.happinessHistory : INITIAL_HAPPINESS_HISTORY).map(mapHappinessToSupabase);
  await upsertTable("happiness_history", happinessRows, "id");

  // 12. Notifications
  const notifRows = (snapshot.notifications.length > 0 ? snapshot.notifications : INITIAL_NOTIFICATIONS).map(mapNotificationToSupabase);
  await upsertTable("notifications", notifRows, "id");

  // 13. Security Audit Logs
  const logRows = (snapshot.auditLogs.length > 0 ? snapshot.auditLogs : INITIAL_AUDIT_LOGS).map(mapAuditLogToSupabase);
  await upsertTable("security_audit_logs", logRows, "id");

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  if (errors.length > 0) {
    return {
      success: false,
      message: `Đã chuyển đổi ${totalRecords} bản ghi. Tuy nhiên gặp một số lỗi: ${errors.join("; ")}`,
      counts,
      errors,
    };
  }

  return {
    success: true,
    message: `Chuyển đổi toàn bộ ${totalRecords} bản ghi lên Supabase thành công!`,
    counts,
    errors: [],
  };
}

// ==========================================
// DIRECT SUPABASE QUERY & MUTATION HELPERS
// ==========================================

export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from("users").select("*");
  if (error || !data) return null;
  return data.map(mapUserFromSupabase);
}

// Resilient Server-Side Upsert helper with auto column stripping for schema compatibility
export async function resilientServerUpsert(
  table: string,
  payload: Record<string, any>,
  onConflict: string = "id"
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  let currentPayload = { ...payload };
  try {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { error } = await client.from(table).upsert(currentPayload, { onConflict });
      if (!error) {
        return true;
      }

      // Check if error is due to an unrecognized column in schema
      const m1 = error.message.match(/Could not find the ['"](\w+)['"] column/i);
      const m2 = error.message.match(/column ['"]?(\w+)['"]? does not exist/i);
      const colName = (m1 && m1[1]) || (m2 && m2[1]);

      if (colName && colName in currentPayload) {
        console.warn(`[Supabase Server auto-prune] Table ${table} does not have column '${colName}', removing and retrying...`);
        delete currentPayload[colName];
      } else {
        console.warn(`[Supabase Server upsert error on ${table}]:`, error.message);
        return false;
      }
    }
    return false;
  } catch (err) {
    console.warn(`[Supabase Server catch error on ${table}]:`, err);
    return false;
  }
}

export async function upsertUserInSupabase(user: User): Promise<void> {
  await resilientServerUpsert("users", mapUserToSupabase(user), "id");
}

export async function deleteUserInSupabase(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("users").delete().eq("id", userId);
  } catch (err) {
    console.warn("[Supabase] deleteUser error:", err);
  }
}

export async function upsertFamilyInSupabase(family: Family): Promise<void> {
  await resilientServerUpsert("families", mapFamilyToSupabase(family), "id");
}

export async function deleteFamilyInSupabase(familyId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("families").delete().eq("id", familyId);
  } catch (err) {
    console.warn("[Supabase] deleteFamily error:", err);
  }
}

export async function upsertJournalInSupabase(entry: EmotionJournalEntry): Promise<void> {
  await resilientServerUpsert("emotion_journals", mapJournalToSupabase(entry), "id");
}

export async function deleteJournalInSupabase(journalId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("emotion_journals").delete().eq("id", journalId);
  } catch (err) {
    console.warn("[Supabase] deleteJournal error:", err);
  }
}

export async function upsertFamilyJournalInSupabase(entry: FamilyJournalEntry): Promise<void> {
  await resilientServerUpsert("family_journals", mapFamilyJournalToSupabase(entry), "id");
}

export async function deleteFamilyJournalInSupabase(entryId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("family_journals").delete().eq("id", entryId);
  } catch (err) {
    console.warn("[Supabase] deleteFamilyJournal error:", err);
  }
}

export async function upsertConsultationInSupabase(consultation: ConsultationSession): Promise<void> {
  await resilientServerUpsert("consultation_sessions", mapConsultationToSupabase(consultation), "id");
}

export async function upsertDeepTalkSessionInSupabase(session: DeepTalkSession): Promise<void> {
  await resilientServerUpsert("deep_talk_sessions", mapDeepTalkSessionToSupabase(session), "id");
}

export async function upsertChallengeProgressInSupabase(progress: ChallengeDayProgress): Promise<void> {
  await resilientServerUpsert("challenge_progress", mapChallengeProgressToSupabase(progress), "day");
}

export async function addHappinessInSupabase(record: HappinessPointRecord): Promise<void> {
  await resilientServerUpsert("happiness_history", mapHappinessToSupabase(record), "id");
}

export async function upsertInvitationInSupabase(inv: FamilyInvitation): Promise<void> {
  await resilientServerUpsert("family_invitations", mapInvitationToSupabase(inv), "id");
}

export async function deleteInvitationInSupabase(invId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("family_invitations").delete().eq("id", invId);
  } catch (err) {
    console.warn("[Supabase] deleteInvitation error:", err);
  }
}

export async function upsertDeepTalkTopicInSupabase(t: DeepTalkTopic): Promise<void> {
  await resilientServerUpsert("deep_talk_topics", mapDeepTalkTopicToSupabase(t), "id");
}

export async function deleteDeepTalkTopicInSupabase(topicId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("deep_talk_topics").delete().eq("id", topicId);
  } catch (err) {
    console.warn("[Supabase] deleteDeepTalkTopic error:", err);
  }
}

export async function upsertChallengeTaskInSupabase(task: Challenge30DayTask): Promise<void> {
  await resilientServerUpsert("challenge_tasks", mapChallengeTaskToSupabase(task), "day");
}

export async function deleteChallengeTaskInSupabase(day: number): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("challenge_tasks").delete().eq("day", day);
  } catch (err) {
    console.warn("[Supabase] deleteChallengeTask error:", err);
  }
}

export async function addNotificationInSupabase(notification: NotificationItem): Promise<void> {
  await resilientServerUpsert("notifications", mapNotificationToSupabase(notification), "id");
}

export async function markNotificationReadInSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("notifications").update({ is_read: true }).eq("id", id);
  } catch (err) {
    console.warn("[Supabase] markNotificationRead error:", err);
  }
}

export async function markAllNotificationsReadInSupabase(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("notifications").update({ is_read: true }).eq("user_id", userId);
  } catch (err) {
    console.warn("[Supabase] markAllNotificationsRead error:", err);
  }
}

export async function addAuditLogInSupabase(log: SecurityAuditLog): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from("security_audit_logs").upsert(mapAuditLogToSupabase(log));
  } catch (err) {
    console.warn("[Supabase] addAuditLog error:", err);
  }
}
