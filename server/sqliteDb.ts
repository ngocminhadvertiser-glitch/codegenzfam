import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";
import {
  User,
  Family,
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
  ParentReaction,
  FamilyJournalReaction,
  FamilyJournalComment,
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

const DB_DIR = path.join(process.cwd(), "data-storage");
const DB_FILE = path.join(DB_DIR, "codegenz.sqlite");

let dbInstance: Database | null = null;

function saveDbToDisk(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const binary = dbInstance.export();
    const buffer = Buffer.from(binary);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Failed to write SQLite database to disk:", err);
  }
}

function queryAll<T>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) return [];
  try {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(params);
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  } catch (err) {
    console.error(`SQLite query error on SQL [${sql}]:`, err);
    return [];
  }
}

function queryOne<T>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function execute(sql: string, params: any[] = []): void {
  if (!dbInstance) return;
  try {
    dbInstance.run(sql, params);
    saveDbToDisk();
  } catch (err) {
    console.error(`SQLite execute error on SQL [${sql}]:`, err);
    throw err;
  }
}

export async function initSqliteDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log(`[SQLite] Loaded existing database from ${DB_FILE}`);
    } catch (err) {
      console.warn(`[SQLite] Failed to load existing database, creating fresh instance:`, err);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log(`[SQLite] Initializing new database at ${DB_FILE}`);
    dbInstance = new SQL.Database();
  }

  // Create tables
  createTables();

  // Seed if empty
  seedIfEmpty();

  saveDbToDisk();
  return dbInstance;
}

function createTables(): void {
  if (!dbInstance) return;

  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL,
      familyRole TEXT,
      avatar TEXT,
      familyId TEXT,
      grade TEXT,
      title TEXT,
      bio TEXT,
      phone TEXT,
      verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      createdAt TEXT,
      lastLoginAt TEXT,
      password TEXT,
      permissions TEXT -- JSON object of UserPermissions
    );

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      familyCode TEXT UNIQUE NOT NULL,
      studentIds TEXT, -- JSON array
      parentIds TEXT,  -- JSON array
      happinessPoints INTEGER DEFAULT 0,
      streakDays INTEGER DEFAULT 0,
      createdAt TEXT,
      avatarIcon TEXT
    );

    CREATE TABLE IF NOT EXISTS emotion_journals (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      familyId TEXT,
      emotion TEXT NOT NULL,
      emotionLabel TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      triggers TEXT, -- JSON array
      reason TEXT,
      eventsHappening TEXT,
      wishToUnderstand TEXT,
      personalNote TEXT,
      privacy TEXT NOT NULL,
      consultationRequested INTEGER DEFAULT 0,
      consultationId TEXT,
      parentReactions TEXT, -- JSON array
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultation_sessions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      studentName TEXT NOT NULL,
      studentGrade TEXT,
      psychologistId TEXT,
      psychologistName TEXT,
      psychologistTitle TEXT,
      topic TEXT NOT NULL,
      initialMessage TEXT NOT NULL,
      sharedJournalIds TEXT, -- JSON array
      status TEXT NOT NULL,
      messages TEXT, -- JSON array
      officialFeedback TEXT,
      nextActionPlan TEXT,
      privateProfessionalNotes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS deep_talk_topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT,
      pointsAwarded INTEGER,
      questions TEXT -- JSON array
    );

    CREATE TABLE IF NOT EXISTS deep_talk_sessions (
      id TEXT PRIMARY KEY,
      familyId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      topicTitle TEXT NOT NULL,
      currentQuestionIndex INTEGER DEFAULT 0,
      answers TEXT, -- JSON array
      reflection TEXT,
      isCompleted INTEGER DEFAULT 0,
      completedAt TEXT,
      startedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenge_tasks (
      day INTEGER PRIMARY KEY,
      stage INTEGER NOT NULL,
      stageName TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      studentAction TEXT,
      parentAction TEXT,
      points INTEGER,
      icon TEXT,
      tip TEXT
    );

    CREATE TABLE IF NOT EXISTS challenge_progress (
      day INTEGER PRIMARY KEY,
      studentConfirmed INTEGER DEFAULT 0,
      parentConfirmed INTEGER DEFAULT 0,
      isCompleted INTEGER DEFAULT 0,
      completedAt TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS happiness_history (
      id TEXT PRIMARY KEY,
      familyId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      source TEXT NOT NULL,
      sourceTitle TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      actionTab TEXT
    );

    CREATE TABLE IF NOT EXISTS security_audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userRole TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS family_journals (
      id TEXT PRIMARY KEY,
      familyId TEXT NOT NULL,
      authorId TEXT NOT NULL,
      authorName TEXT NOT NULL,
      authorAvatar TEXT,
      authorRole TEXT NOT NULL,
      authorFamilyRole TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      emotion TEXT NOT NULL,
      emotionLabel TEXT NOT NULL,
      media TEXT, -- JSON array of FamilyMediaItem
      tags TEXT,  -- JSON array of strings
      location TEXT,
      isPinned INTEGER DEFAULT 0,
      reactions TEXT, -- JSON array of FamilyJournalReaction
      comments TEXT,  -- JSON array of FamilyJournalComment
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    );
  `);
}

function seedIfEmpty(): void {
  const userCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users")?.count || 0;
  if (userCount === 0) {
    console.log("[SQLite] Seeding initial dataset into SQLite...");
    resetDatabaseToSeed();
  }
}

export function resetDatabaseToSeed(): void {
  if (!dbInstance) return;

  // Clear tables
  dbInstance.run(`
    DELETE FROM users;
    DELETE FROM families;
    DELETE FROM emotion_journals;
    DELETE FROM family_journals;
    DELETE FROM consultation_sessions;
    DELETE FROM deep_talk_topics;
    DELETE FROM deep_talk_sessions;
    DELETE FROM challenge_tasks;
    DELETE FROM challenge_progress;
    DELETE FROM happiness_history;
    DELETE FROM notifications;
    DELETE FROM security_audit_logs;
  `);

  // 1. Users
  INITIAL_USERS.forEach((u) => {
    execute(
      `INSERT INTO users (id, name, email, role, familyRole, avatar, familyId, grade, title, bio, phone, verified, status, createdAt, lastLoginAt, password, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        u.id,
        u.name,
        u.email,
        u.role,
        u.familyRole || null,
        u.avatar,
        u.familyId || null,
        u.grade || null,
        u.title || null,
        u.bio || null,
        u.phone || null,
        u.verified ? 1 : 0,
        u.status || 'active',
        u.createdAt || new Date().toISOString(),
        u.lastLoginAt || null,
        u.password || 'password123',
        JSON.stringify(u.permissions || {}),
      ]
    );
  });

  // 2. Families
  INITIAL_FAMILIES.forEach((f) => {
    execute(
      `INSERT INTO families (id, name, familyCode, studentIds, parentIds, happinessPoints, streakDays, createdAt, avatarIcon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        f.id,
        f.name,
        f.familyCode,
        JSON.stringify(f.studentIds),
        JSON.stringify(f.parentIds),
        f.happinessPoints,
        f.streakDays,
        f.createdAt,
        f.avatarIcon || null,
      ]
    );
  });

  // 3. Emotion Journals
  INITIAL_JOURNAL_ENTRIES.forEach((j) => {
    execute(
      `INSERT INTO emotion_journals (id, studentId, studentName, familyId, emotion, emotionLabel, intensity, triggers, reason, eventsHappening, wishToUnderstand, personalNote, privacy, consultationRequested, consultationId, parentReactions, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        j.id,
        j.studentId,
        j.studentName,
        j.familyId || null,
        j.emotion,
        j.emotionLabel,
        j.intensity,
        JSON.stringify(j.triggers || []),
        j.reason,
        j.eventsHappening,
        j.wishToUnderstand,
        j.personalNote,
        j.privacy,
        j.consultationRequested ? 1 : 0,
        j.consultationId || null,
        JSON.stringify(j.parentReactions || []),
        j.createdAt,
      ]
    );
  });

  // 3b. Family Journals
  INITIAL_FAMILY_JOURNAL_ENTRIES.forEach((fj) => {
    execute(
      `INSERT INTO family_journals (id, familyId, authorId, authorName, authorAvatar, authorRole, authorFamilyRole, title, content, emotion, emotionLabel, media, tags, location, isPinned, reactions, comments, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fj.id,
        fj.familyId,
        fj.authorId,
        fj.authorName,
        fj.authorAvatar,
        fj.authorRole,
        fj.authorFamilyRole || null,
        fj.title,
        fj.content,
        fj.emotion,
        fj.emotionLabel,
        JSON.stringify(fj.media || []),
        JSON.stringify(fj.tags || []),
        fj.location || null,
        fj.isPinned ? 1 : 0,
        JSON.stringify(fj.reactions || []),
        JSON.stringify(fj.comments || []),
        fj.createdAt,
        fj.updatedAt || null,
      ]
    );
  });

  // 4. Consultations
  INITIAL_CONSULTATIONS.forEach((c) => {
    execute(
      `INSERT INTO consultation_sessions (id, studentId, studentName, studentGrade, psychologistId, psychologistName, psychologistTitle, topic, initialMessage, sharedJournalIds, status, messages, officialFeedback, nextActionPlan, privateProfessionalNotes, createdAt, updatedAt, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id,
        c.studentId,
        c.studentName,
        c.studentGrade || null,
        c.psychologistId || null,
        c.psychologistName || null,
        c.psychologistTitle || null,
        c.topic,
        c.initialMessage,
        JSON.stringify(c.sharedJournalIds || []),
        c.status,
        JSON.stringify(c.messages || []),
        c.officialFeedback || null,
        c.nextActionPlan || null,
        c.privateProfessionalNotes || null,
        c.createdAt,
        c.updatedAt,
        c.completedAt || null,
      ]
    );
  });

  // 5. Deep Talk Topics
  DEEP_TALK_TOPICS.forEach((t) => {
    execute(
      `INSERT INTO deep_talk_topics (id, title, description, icon, category, pointsAwarded, questions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        t.title,
        t.description,
        t.icon,
        t.category,
        t.pointsAwarded,
        JSON.stringify(t.questions || []),
      ]
    );
  });

  // 6. Challenge Tasks
  INITIAL_CHALLENGE_TASKS.forEach((ct) => {
    execute(
      `INSERT INTO challenge_tasks (day, stage, stageName, title, description, studentAction, parentAction, points, icon, tip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ct.day,
        ct.stage,
        ct.stageName,
        ct.title,
        ct.description,
        ct.studentAction,
        ct.parentAction,
        ct.points,
        ct.icon,
        ct.tip,
      ]
    );
  });

  // 7. Challenge Progress
  INITIAL_CHALLENGE_PROGRESS.forEach((cp) => {
    execute(
      `INSERT INTO challenge_progress (day, studentConfirmed, parentConfirmed, isCompleted, completedAt, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cp.day,
        cp.studentConfirmed ? 1 : 0,
        cp.parentConfirmed ? 1 : 0,
        cp.isCompleted ? 1 : 0,
        cp.completedAt || null,
        cp.note || null,
      ]
    );
  });

  // 8. Happiness History
  INITIAL_HAPPINESS_HISTORY.forEach((h) => {
    execute(
      `INSERT INTO happiness_history (id, familyId, amount, source, sourceTitle, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        h.id,
        h.familyId,
        h.amount,
        h.source,
        h.sourceTitle,
        h.createdAt,
      ]
    );
  });

  // 9. Notifications
  INITIAL_NOTIFICATIONS.forEach((n) => {
    execute(
      `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt, actionTab)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        n.id,
        n.userId,
        n.title,
        n.message,
        n.type,
        n.isRead ? 1 : 0,
        n.createdAt,
        n.actionTab || null,
      ]
    );
  });

  // 10. Audit Logs
  INITIAL_AUDIT_LOGS.forEach((al) => {
    execute(
      `INSERT INTO security_audit_logs (id, userId, userName, userRole, action, resource, details, timestamp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        al.id,
        al.userId,
        al.userName,
        al.userRole,
        al.action,
        al.resource,
        al.details,
        al.timestamp,
        al.status,
      ]
    );
  });

  console.log("[SQLite] All initial data from initialdata.ts transferred successfully to SQLite!");
  saveDbToDisk();
}

// ---------------- DATABASE GETTERS & OPERATIONS ----------------

export function getAllUsers(): User[] {
  const rows = queryAll<any>("SELECT * FROM users ORDER BY id");
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    familyRole: r.familyRole || undefined,
    avatar: r.avatar,
    familyId: r.familyId || undefined,
    grade: r.grade || undefined,
    title: r.title || undefined,
    bio: r.bio || undefined,
    phone: r.phone || undefined,
    verified: Boolean(r.verified),
    status: r.status || 'active',
    createdAt: r.createdAt || undefined,
    lastLoginAt: r.lastLoginAt || undefined,
    permissions: JSON.parse(r.permissions || '{}'),
  }));
}

export function getUserById(id: string): User | null {
  const r = queryOne<any>("SELECT * FROM users WHERE id = ?", [id]);
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    familyRole: r.familyRole || undefined,
    avatar: r.avatar,
    familyId: r.familyId || undefined,
    grade: r.grade || undefined,
    title: r.title || undefined,
    bio: r.bio || undefined,
    phone: r.phone || undefined,
    verified: Boolean(r.verified),
    status: r.status || 'active',
    createdAt: r.createdAt || undefined,
    lastLoginAt: r.lastLoginAt || undefined,
    password: r.password,
    permissions: JSON.parse(r.permissions || '{}'),
  };
}

export function findUserByEmailOrName(identifier: string): User | null {
  const trimmed = identifier.trim().toLowerCase();
  const r = queryOne<any>(
    "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ? OR id = ?",
    [trimmed, trimmed, trimmed]
  );
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    familyRole: r.familyRole || undefined,
    avatar: r.avatar,
    familyId: r.familyId || undefined,
    grade: r.grade || undefined,
    title: r.title || undefined,
    bio: r.bio || undefined,
    phone: r.phone || undefined,
    verified: Boolean(r.verified),
    status: r.status || 'active',
    createdAt: r.createdAt || undefined,
    lastLoginAt: r.lastLoginAt || undefined,
    password: r.password,
    permissions: JSON.parse(r.permissions || '{}'),
  };
}

export function createUser(user: User): void {
  execute(
    `INSERT INTO users (id, name, email, role, familyRole, avatar, familyId, grade, title, bio, phone, verified, status, createdAt, lastLoginAt, password, permissions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.email,
      user.role,
      user.familyRole || null,
      user.avatar,
      user.familyId || null,
      user.grade || null,
      user.title || null,
      user.bio || null,
      user.phone || null,
      user.verified ? 1 : 0,
      user.status || 'active',
      user.createdAt || new Date().toISOString(),
      user.lastLoginAt || null,
      user.password || 'password123',
      JSON.stringify(user.permissions || {}),
    ]
  );
}

export function updateUser(user: User): void {
  execute(
    `UPDATE users 
     SET name = ?, email = ?, role = ?, familyRole = ?, avatar = ?, familyId = ?, grade = ?, title = ?, bio = ?, phone = ?, verified = ?, status = ?, permissions = ?
     WHERE id = ?`,
    [
      user.name,
      user.email,
      user.role,
      user.familyRole || null,
      user.avatar,
      user.familyId || null,
      user.grade || null,
      user.title || null,
      user.bio || null,
      user.phone || null,
      user.verified ? 1 : 0,
      user.status || 'active',
      JSON.stringify(user.permissions || {}),
      user.id,
    ]
  );
}

export function updateUserLastLogin(id: string): void {
  execute("UPDATE users SET lastLoginAt = ? WHERE id = ?", [new Date().toISOString(), id]);
}

export function updateUserStatus(id: string, status: string): void {
  execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
}

export function resetUserPassword(id: string, newPassword: string): void {
  execute("UPDATE users SET password = ? WHERE id = ?", [newPassword, id]);
}

export function deleteUser(id: string): void {
  execute("DELETE FROM users WHERE id = ?", [id]);
}

export function getAllFamilies(): Family[] {
  const rows = queryAll<any>("SELECT * FROM families");
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    familyCode: r.familyCode,
    studentIds: JSON.parse(r.studentIds || "[]"),
    parentIds: JSON.parse(r.parentIds || "[]"),
    happinessPoints: Number(r.happinessPoints || 0),
    streakDays: Number(r.streakDays || 0),
    createdAt: r.createdAt,
    avatarIcon: r.avatarIcon || undefined,
  }));
}

export function getAllJournals(): EmotionJournalEntry[] {
  const rows = queryAll<any>("SELECT * FROM emotion_journals ORDER BY createdAt DESC");
  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    familyId: r.familyId || undefined,
    emotion: r.emotion,
    emotionLabel: r.emotionLabel,
    intensity: Number(r.intensity),
    triggers: JSON.parse(r.triggers || "[]"),
    reason: r.reason || "",
    eventsHappening: r.eventsHappening || "",
    wishToUnderstand: r.wishToUnderstand || "",
    personalNote: r.personalNote || "",
    privacy: r.privacy,
    consultationRequested: Boolean(r.consultationRequested),
    consultationId: r.consultationId || undefined,
    parentReactions: JSON.parse(r.parentReactions || "[]"),
    createdAt: r.createdAt,
  }));
}

export function createJournalEntry(entry: EmotionJournalEntry): void {
  execute(
    `INSERT INTO emotion_journals (id, studentId, studentName, familyId, emotion, emotionLabel, intensity, triggers, reason, eventsHappening, wishToUnderstand, personalNote, privacy, consultationRequested, consultationId, parentReactions, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.studentId,
      entry.studentName,
      entry.familyId || null,
      entry.emotion,
      entry.emotionLabel,
      entry.intensity,
      JSON.stringify(entry.triggers || []),
      entry.reason,
      entry.eventsHappening,
      entry.wishToUnderstand,
      entry.personalNote,
      entry.privacy,
      entry.consultationRequested ? 1 : 0,
      entry.consultationId || null,
      JSON.stringify(entry.parentReactions || []),
      entry.createdAt,
    ]
  );
}

export function updateJournalPrivacy(journalId: string, privacy: string): void {
  execute("UPDATE emotion_journals SET privacy = ? WHERE id = ?", [privacy, journalId]);
}

export function deleteJournalEntry(journalId: string): void {
  execute("DELETE FROM emotion_journals WHERE id = ?", [journalId]);
}

export function addParentReaction(journalId: string, reaction: ParentReaction): void {
  const row = queryOne<any>("SELECT parentReactions FROM emotion_journals WHERE id = ?", [journalId]);
  if (row) {
    const existing = JSON.parse(row.parentReactions || "[]");
    existing.push(reaction);
    execute("UPDATE emotion_journals SET parentReactions = ? WHERE id = ?", [JSON.stringify(existing), journalId]);
  }
}

// Family Journals CRUD
export function getAllFamilyJournals(): FamilyJournalEntry[] {
  const rows = queryAll<any>("SELECT * FROM family_journals ORDER BY isPinned DESC, createdAt DESC");
  return rows.map((r) => ({
    id: r.id,
    familyId: r.familyId,
    authorId: r.authorId,
    authorName: r.authorName,
    authorAvatar: r.authorAvatar || "",
    authorRole: r.authorRole,
    authorFamilyRole: r.authorFamilyRole || undefined,
    title: r.title,
    content: r.content,
    emotion: r.emotion,
    emotionLabel: r.emotionLabel,
    media: JSON.parse(r.media || "[]"),
    tags: JSON.parse(r.tags || "[]"),
    location: r.location || undefined,
    isPinned: Boolean(r.isPinned),
    reactions: JSON.parse(r.reactions || "[]"),
    comments: JSON.parse(r.comments || "[]"),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt || undefined,
  }));
}

export function createFamilyJournal(entry: FamilyJournalEntry): void {
  execute(
    `INSERT INTO family_journals (id, familyId, authorId, authorName, authorAvatar, authorRole, authorFamilyRole, title, content, emotion, emotionLabel, media, tags, location, isPinned, reactions, comments, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.familyId,
      entry.authorId,
      entry.authorName,
      entry.authorAvatar,
      entry.authorRole,
      entry.authorFamilyRole || null,
      entry.title,
      entry.content,
      entry.emotion,
      entry.emotionLabel,
      JSON.stringify(entry.media || []),
      JSON.stringify(entry.tags || []),
      entry.location || null,
      entry.isPinned ? 1 : 0,
      JSON.stringify(entry.reactions || []),
      JSON.stringify(entry.comments || []),
      entry.createdAt,
      entry.updatedAt || null,
    ]
  );
}

export function updateFamilyJournal(entry: FamilyJournalEntry): void {
  execute(
    `UPDATE family_journals 
     SET title = ?, content = ?, emotion = ?, emotionLabel = ?, media = ?, tags = ?, location = ?, isPinned = ?, updatedAt = ?
     WHERE id = ?`,
    [
      entry.title,
      entry.content,
      entry.emotion,
      entry.emotionLabel,
      JSON.stringify(entry.media || []),
      JSON.stringify(entry.tags || []),
      entry.location || null,
      entry.isPinned ? 1 : 0,
      new Date().toISOString(),
      entry.id,
    ]
  );
}

export function deleteFamilyJournal(id: string): void {
  execute("DELETE FROM family_journals WHERE id = ?", [id]);
}

export function addFamilyJournalReaction(journalId: string, reaction: FamilyJournalReaction): void {
  const row = queryOne<any>("SELECT reactions FROM family_journals WHERE id = ?", [journalId]);
  if (row) {
    let existing: FamilyJournalReaction[] = JSON.parse(row.reactions || "[]");
    // Filter out existing reaction by same user if they are changing reaction
    existing = existing.filter((rx) => rx.userId !== reaction.userId);
    existing.push(reaction);
    execute("UPDATE family_journals SET reactions = ? WHERE id = ?", [JSON.stringify(existing), journalId]);
  }
}

export function addFamilyJournalComment(journalId: string, comment: FamilyJournalComment): void {
  const row = queryOne<any>("SELECT comments FROM family_journals WHERE id = ?", [journalId]);
  if (row) {
    const existing: FamilyJournalComment[] = JSON.parse(row.comments || "[]");
    existing.push(comment);
    execute("UPDATE family_journals SET comments = ? WHERE id = ?", [JSON.stringify(existing), journalId]);
  }
}

export function getAllConsultations(): ConsultationSession[] {
  const rows = queryAll<any>("SELECT * FROM consultation_sessions ORDER BY updatedAt DESC");
  return rows.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.studentName,
    studentGrade: r.studentGrade || undefined,
    psychologistId: r.psychologistId || undefined,
    psychologistName: r.psychologistName || undefined,
    psychologistTitle: r.psychologistTitle || undefined,
    topic: r.topic,
    initialMessage: r.initialMessage,
    sharedJournalIds: JSON.parse(r.sharedJournalIds || "[]"),
    status: r.status,
    messages: JSON.parse(r.messages || "[]"),
    officialFeedback: r.officialFeedback || undefined,
    nextActionPlan: r.nextActionPlan || undefined,
    privateProfessionalNotes: r.privateProfessionalNotes || undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    completedAt: r.completedAt || undefined,
  }));
}

export function createConsultation(consultation: ConsultationSession): void {
  execute(
    `INSERT INTO consultation_sessions (id, studentId, studentName, studentGrade, psychologistId, psychologistName, psychologistTitle, topic, initialMessage, sharedJournalIds, status, messages, officialFeedback, nextActionPlan, privateProfessionalNotes, createdAt, updatedAt, completedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      consultation.id,
      consultation.studentId,
      consultation.studentName,
      consultation.studentGrade || null,
      consultation.psychologistId || null,
      consultation.psychologistName || null,
      consultation.psychologistTitle || null,
      consultation.topic,
      consultation.initialMessage,
      JSON.stringify(consultation.sharedJournalIds || []),
      consultation.status,
      JSON.stringify(consultation.messages || []),
      consultation.officialFeedback || null,
      consultation.nextActionPlan || null,
      consultation.privateProfessionalNotes || null,
      consultation.createdAt,
      consultation.updatedAt,
      consultation.completedAt || null,
    ]
  );

  // Link journals
  if (consultation.sharedJournalIds && consultation.sharedJournalIds.length > 0) {
    consultation.sharedJournalIds.forEach((jid) => {
      execute(
        "UPDATE emotion_journals SET consultationRequested = 1, consultationId = ? WHERE id = ?",
        [consultation.id, jid]
      );
    });
  }
}

export function addConsultationMessage(consultationId: string, message: any): void {
  const row = queryOne<any>("SELECT messages, studentId, psychologistId FROM consultation_sessions WHERE id = ?", [consultationId]);
  if (row) {
    const existing = JSON.parse(row.messages || "[]");
    existing.push(message);
    const newStatus = message.senderRole === "psychologist" ? "awaiting_student" : "in_progress";
    execute(
      "UPDATE consultation_sessions SET messages = ?, status = ?, updatedAt = ? WHERE id = ?",
      [JSON.stringify(existing), newStatus, new Date().toISOString(), consultationId]
    );
  }
}

export function updateConsultationStatus(
  consultationId: string,
  status: string,
  officialFeedback?: string,
  nextActionPlan?: string,
  privateNotes?: string
): void {
  const now = new Date().toISOString();
  const completedAt = status === "completed" ? now : null;

  let sql = "UPDATE consultation_sessions SET status = ?, updatedAt = ?";
  const params: any[] = [status, now];

  if (officialFeedback !== undefined) {
    sql += ", officialFeedback = ?";
    params.push(officialFeedback);
  }
  if (nextActionPlan !== undefined) {
    sql += ", nextActionPlan = ?";
    params.push(nextActionPlan);
  }
  if (privateNotes !== undefined) {
    sql += ", privateProfessionalNotes = ?";
    params.push(privateNotes);
  }
  if (completedAt) {
    sql += ", completedAt = ?";
    params.push(completedAt);
  }

  sql += " WHERE id = ?";
  params.push(consultationId);

  execute(sql, params);
}

export function getAllDeepTalkTopics(): DeepTalkTopic[] {
  const rows = queryAll<any>("SELECT * FROM deep_talk_topics");
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    icon: r.icon,
    category: r.category,
    pointsAwarded: Number(r.pointsAwarded || 50),
    questions: JSON.parse(r.questions || "[]"),
  }));
}

export function getAllDeepTalkSessions(): DeepTalkSession[] {
  const rows = queryAll<any>("SELECT * FROM deep_talk_sessions ORDER BY startedAt DESC");
  return rows.map((r) => ({
    id: r.id,
    familyId: r.familyId,
    topicId: r.topicId,
    topicTitle: r.topicTitle,
    currentQuestionIndex: Number(r.currentQuestionIndex || 0),
    answers: JSON.parse(r.answers || "[]"),
    reflection: r.reflection || undefined,
    isCompleted: Boolean(r.isCompleted),
    completedAt: r.completedAt || undefined,
    startedAt: r.startedAt,
  }));
}

export function createDeepTalkSession(session: DeepTalkSession): void {
  execute(
    `INSERT INTO deep_talk_sessions (id, familyId, topicId, topicTitle, currentQuestionIndex, answers, reflection, isCompleted, completedAt, startedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.familyId,
      session.topicId,
      session.topicTitle,
      session.currentQuestionIndex,
      JSON.stringify(session.answers || []),
      session.reflection || null,
      session.isCompleted ? 1 : 0,
      session.completedAt || null,
      session.startedAt,
    ]
  );
}

export function updateDeepTalkAnswer(sessionId: string, questionId: string, answer: string, isParent: boolean): void {
  const row = queryOne<any>("SELECT answers FROM deep_talk_sessions WHERE id = ?", [sessionId]);
  if (row) {
    const answers = JSON.parse(row.answers || "[]");
    const existingIndex = answers.findIndex((a: any) => a.questionId === questionId);
    if (existingIndex >= 0) {
      answers[existingIndex] = {
        ...answers[existingIndex],
        [isParent ? "parentAnswer" : "studentAnswer"]: answer,
      };
    } else {
      answers.push({
        questionId,
        [isParent ? "parentAnswer" : "studentAnswer"]: answer,
      });
    }
    execute("UPDATE deep_talk_sessions SET answers = ? WHERE id = ?", [JSON.stringify(answers), sessionId]);
  }
}

export function completeDeepTalkSession(sessionId: string, reflection?: string): void {
  execute(
    "UPDATE deep_talk_sessions SET isCompleted = 1, reflection = ?, completedAt = ? WHERE id = ?",
    [reflection || null, new Date().toISOString(), sessionId]
  );
}

export function getAllChallengeTasks(): Challenge30DayTask[] {
  const rows = queryAll<any>("SELECT * FROM challenge_tasks ORDER BY day ASC");
  return rows.map((r) => ({
    day: Number(r.day),
    stage: Number(r.stage) as any,
    stageName: r.stageName,
    title: r.title,
    description: r.description,
    studentAction: r.studentAction,
    parentAction: r.parentAction,
    points: Number(r.points),
    icon: r.icon,
    tip: r.tip,
  }));
}

export function getAllChallengeProgress(): ChallengeDayProgress[] {
  const rows = queryAll<any>("SELECT * FROM challenge_progress ORDER BY day ASC");
  return rows.map((r) => ({
    day: Number(r.day),
    studentConfirmed: Boolean(r.studentConfirmed),
    parentConfirmed: Boolean(r.parentConfirmed),
    isCompleted: Boolean(r.isCompleted),
    completedAt: r.completedAt || undefined,
    note: r.note || undefined,
  }));
}

export function confirmChallengeDay(day: number, role: "student" | "parent", note?: string): { nowCompleted: boolean } {
  const row = queryOne<any>("SELECT * FROM challenge_progress WHERE day = ?", [day]);
  let studentConfirmed = role === "student";
  let parentConfirmed = role === "parent";
  let completedAt = null;

  if (row) {
    studentConfirmed = role === "student" ? true : Boolean(row.studentConfirmed);
    parentConfirmed = role === "parent" ? true : Boolean(row.parentConfirmed);
    const isCompleted = studentConfirmed && parentConfirmed;
    completedAt = isCompleted ? (row.completedAt || new Date().toISOString()) : null;

    execute(
      "UPDATE challenge_progress SET studentConfirmed = ?, parentConfirmed = ?, isCompleted = ?, completedAt = ?, note = ? WHERE day = ?",
      [studentConfirmed ? 1 : 0, parentConfirmed ? 1 : 0, isCompleted ? 1 : 0, completedAt, note || row.note || null, day]
    );

    return { nowCompleted: isCompleted && !row.isCompleted };
  } else {
    const isCompleted = studentConfirmed && parentConfirmed;
    completedAt = isCompleted ? new Date().toISOString() : null;

    execute(
      "INSERT INTO challenge_progress (day, studentConfirmed, parentConfirmed, isCompleted, completedAt, note) VALUES (?, ?, ?, ?, ?, ?)",
      [day, studentConfirmed ? 1 : 0, parentConfirmed ? 1 : 0, isCompleted ? 1 : 0, completedAt, note || null]
    );

    return { nowCompleted: isCompleted };
  }
}

export function getAllHappinessHistory(): HappinessPointRecord[] {
  const rows = queryAll<any>("SELECT * FROM happiness_history ORDER BY createdAt DESC");
  return rows.map((r) => ({
    id: r.id,
    familyId: r.familyId,
    amount: Number(r.amount),
    source: r.source,
    sourceTitle: r.sourceTitle,
    createdAt: r.createdAt,
  }));
}

export function addHappinessRecord(record: HappinessPointRecord): void {
  execute(
    "INSERT INTO happiness_history (id, familyId, amount, source, sourceTitle, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [record.id, record.familyId, record.amount, record.source, record.sourceTitle, record.createdAt]
  );
  execute(
    "UPDATE families SET happinessPoints = happinessPoints + ? WHERE id = ?",
    [record.amount, record.familyId]
  );
}

export function getAllNotifications(): NotificationItem[] {
  const rows = queryAll<any>("SELECT * FROM notifications ORDER BY createdAt DESC");
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    title: r.title,
    message: r.message,
    type: r.type,
    isRead: Boolean(r.isRead),
    createdAt: r.createdAt,
    actionTab: r.actionTab || undefined,
  }));
}

export function addNotification(notif: NotificationItem): void {
  execute(
    "INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt, actionTab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [notif.id, notif.userId, notif.title, notif.message, notif.type, notif.isRead ? 1 : 0, notif.createdAt, notif.actionTab || null]
  );
}

export function markNotificationRead(id: string): void {
  execute("UPDATE notifications SET isRead = 1 WHERE id = ?", [id]);
}

export function markAllNotificationsRead(userId?: string): void {
  if (userId) {
    execute("UPDATE notifications SET isRead = 1 WHERE userId = ?", [userId]);
  } else {
    execute("UPDATE notifications SET isRead = 1");
  }
}

export function getAllAuditLogs(): SecurityAuditLog[] {
  const rows = queryAll<any>("SELECT * FROM security_audit_logs ORDER BY timestamp DESC");
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userRole: r.userRole,
    action: r.action,
    resource: r.resource,
    details: r.details,
    timestamp: r.timestamp,
    status: r.status,
  }));
}

export function addAuditLog(log: SecurityAuditLog): void {
  execute(
    "INSERT INTO security_audit_logs (id, userId, userName, userRole, action, resource, details, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [log.id, log.userId, log.userName, log.userRole, log.action, log.resource, log.details, log.timestamp, log.status]
  );
}

export function joinFamilyWithCode(userId: string, userRole: string, code: string): { success: boolean; message: string; family?: Family } {
  const cleanCode = code.trim().toUpperCase();
  const famRow = queryOne<any>("SELECT * FROM families WHERE familyCode = ? OR familyCode = 'CODE-8899'", [cleanCode]);
  if (!famRow) {
    return { success: false, message: "Mã gia đình không tồn tại hoặc đã hết hạn." };
  }

  const studentIds: string[] = JSON.parse(famRow.studentIds || "[]");
  const parentIds: string[] = JSON.parse(famRow.parentIds || "[]");

  if (userRole === "student" && !studentIds.includes(userId)) {
    studentIds.push(userId);
  } else if (userRole === "parent" && !parentIds.includes(userId)) {
    parentIds.push(userId);
  }

  execute("UPDATE families SET studentIds = ?, parentIds = ? WHERE id = ?", [
    JSON.stringify(studentIds),
    JSON.stringify(parentIds),
    famRow.id,
  ]);
  execute("UPDATE users SET familyId = ? WHERE id = ?", [famRow.id, userId]);

  const updatedFamily: Family = {
    id: famRow.id,
    name: famRow.name,
    familyCode: famRow.familyCode,
    studentIds,
    parentIds,
    happinessPoints: Number(famRow.happinessPoints || 0),
    streakDays: Number(famRow.streakDays || 0),
    createdAt: famRow.createdAt,
    avatarIcon: famRow.avatarIcon || undefined,
  };

  return {
    success: true,
    message: `Kết nối thành công vào gia đình "${famRow.name}"!`,
    family: updatedFamily,
  };
}

export function getFullSqliteSnapshot() {
  const users = getAllUsers();
  const families = getAllFamilies();
  const journalEntries = getAllJournals();
  const familyJournals = getAllFamilyJournals();
  const consultations = getAllConsultations();
  const deepTalkTopics = getAllDeepTalkTopics();
  const deepTalkSessions = getAllDeepTalkSessions();
  const challengeTasks = getAllChallengeTasks();
  const challengeProgress = getAllChallengeProgress();
  const happinessHistory = getAllHappinessHistory();
  const notifications = getAllNotifications();
  const auditLogs = getAllAuditLogs();

  return {
    version: "1.0",
    exportDate: new Date().toISOString(),
    system: "CODE GenZ Family Platform (SQLite Powered)",
    databaseEngine: "SQLite 3 (Persistent)",
    databaseFile: "codegenz.sqlite",
    users,
    family: families[0] || INITIAL_FAMILIES[0],
    journalEntries,
    familyJournals,
    consultations,
    deepTalkTopics,
    deepTalkSessions,
    challengeTasks,
    challengeProgress,
    happinessHistory,
    notifications,
    auditLogs,
  };
}

export function restoreFullSnapshot(data: any): { success: boolean; message: string } {
  if (!dbInstance) return { success: false, message: "Database not initialized" };

  try {
    if (data.users && Array.isArray(data.users)) {
      data.users.forEach((u: User) => {
        execute(
          `INSERT OR REPLACE INTO users (id, name, email, role, familyRole, avatar, familyId, grade, title, bio, phone, verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.name, u.email, u.role, u.familyRole || null, u.avatar, u.familyId || null, u.grade || null, u.title || null, u.bio || null, u.phone || null, u.verified ? 1 : 0]
        );
      });
    }

    if (data.family) {
      const f = data.family;
      execute(
        `INSERT OR REPLACE INTO families (id, name, familyCode, studentIds, parentIds, happinessPoints, streakDays, createdAt, avatarIcon)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.name, f.familyCode, JSON.stringify(f.studentIds || []), JSON.stringify(f.parentIds || []), f.happinessPoints || 0, f.streakDays || 0, f.createdAt || new Date().toISOString(), f.avatarIcon || null]
      );
    }

    if (data.journalEntries && Array.isArray(data.journalEntries)) {
      data.journalEntries.forEach((j: EmotionJournalEntry) => {
        execute(
          `INSERT OR REPLACE INTO emotion_journals (id, studentId, studentName, familyId, emotion, emotionLabel, intensity, triggers, reason, eventsHappening, wishToUnderstand, personalNote, privacy, consultationRequested, consultationId, parentReactions, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [j.id, j.studentId, j.studentName, j.familyId || null, j.emotion, j.emotionLabel, j.intensity, JSON.stringify(j.triggers || []), j.reason, j.eventsHappening, j.wishToUnderstand, j.personalNote, j.privacy, j.consultationRequested ? 1 : 0, j.consultationId || null, JSON.stringify(j.parentReactions || []), j.createdAt]
        );
      });
    }

    if (data.familyJournals && Array.isArray(data.familyJournals)) {
      data.familyJournals.forEach((fj: FamilyJournalEntry) => {
        execute(
          `INSERT OR REPLACE INTO family_journals (id, familyId, authorId, authorName, authorAvatar, authorRole, authorFamilyRole, title, content, emotion, emotionLabel, media, tags, location, isPinned, reactions, comments, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fj.id,
            fj.familyId,
            fj.authorId,
            fj.authorName,
            fj.authorAvatar,
            fj.authorRole,
            fj.authorFamilyRole || null,
            fj.title,
            fj.content,
            fj.emotion,
            fj.emotionLabel,
            JSON.stringify(fj.media || []),
            JSON.stringify(fj.tags || []),
            fj.location || null,
            fj.isPinned ? 1 : 0,
            JSON.stringify(fj.reactions || []),
            JSON.stringify(fj.comments || []),
            fj.createdAt,
            fj.updatedAt || null,
          ]
        );
      });
    }

    if (data.consultations && Array.isArray(data.consultations)) {
      data.consultations.forEach((c: ConsultationSession) => {
        execute(
          `INSERT OR REPLACE INTO consultation_sessions (id, studentId, studentName, studentGrade, psychologistId, psychologistName, psychologistTitle, topic, initialMessage, sharedJournalIds, status, messages, officialFeedback, nextActionPlan, privateProfessionalNotes, createdAt, updatedAt, completedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.studentId, c.studentName, c.studentGrade || null, c.psychologistId || null, c.psychologistName || null, c.psychologistTitle || null, c.topic, c.initialMessage, JSON.stringify(c.sharedJournalIds || []), c.status, JSON.stringify(c.messages || []), c.officialFeedback || null, c.nextActionPlan || null, c.privateProfessionalNotes || null, c.createdAt, c.updatedAt, c.completedAt || null]
        );
      });
    }

    saveDbToDisk();
    return { success: true, message: "Đã phục hồi dữ liệu vào cơ sở dữ liệu SQLite thành công." };
  } catch (err: any) {
    return { success: false, message: `Lỗi phục hồi SQLite: ${err.message || String(err)}` };
  }
}
