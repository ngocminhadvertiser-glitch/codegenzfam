import {
  db,
  COLLECTIONS,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from './firebaseClient';
import {
  User,
  Family,
  FamilyInvitation,
  EmotionJournalEntry,
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
  INITIAL_CONSULTATIONS,
  DEEP_TALK_TOPICS,
  INITIAL_CHALLENGE_TASKS,
  INITIAL_CHALLENGE_PROGRESS,
  INITIAL_HAPPINESS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

export interface CloudDbState {
  users: User[];
  families: Family[];
  familyInvitations: FamilyInvitation[];
  family: Family;
  journalEntries: EmotionJournalEntry[];
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
 * Seed initial database if Firestore is currently empty
 */
export async function bootstrapCloudFirestore(): Promise<CloudDbState | null> {
  try {
    const usersCol = collection(db, COLLECTIONS.USERS);
    const usersSnap = await getDocs(usersCol);

    // If completely empty, seed with initial dataset
    if (usersSnap.empty) {
      console.log('[Firebase Cloud] First time setup detected: Seeding demo dataset to Cloud Firestore...');
      
      // Batch seed Users
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, u.id), u);
      }

      // Batch seed Families
      for (const f of INITIAL_FAMILIES) {
        await setDoc(doc(db, COLLECTIONS.FAMILIES, f.id), f);
      }

      // Batch seed Journals
      for (const j of INITIAL_JOURNAL_ENTRIES) {
        await setDoc(doc(db, COLLECTIONS.JOURNAL_ENTRIES, j.id), j);
      }

      // Batch seed Consultations
      for (const c of INITIAL_CONSULTATIONS) {
        await setDoc(doc(db, COLLECTIONS.CONSULTATIONS, c.id), c);
      }

      // Batch seed Deep Talk Topics
      for (const t of DEEP_TALK_TOPICS) {
        await setDoc(doc(db, COLLECTIONS.DEEP_TALK_TOPICS, t.id), t);
      }

      // Batch seed Challenge Tasks
      for (const task of INITIAL_CHALLENGE_TASKS) {
        await setDoc(doc(db, COLLECTIONS.CHALLENGE_TASKS, String(task.day)), task);
      }

      // Seed Challenge Progress
      for (const p of INITIAL_CHALLENGE_PROGRESS) {
        await setDoc(doc(db, COLLECTIONS.CHALLENGE_PROGRESS, `progress_day_${p.day}`), p);
      }

      // Seed Happiness
      for (const h of INITIAL_HAPPINESS_HISTORY) {
        await setDoc(doc(db, COLLECTIONS.HAPPINESS_HISTORY, h.id), h);
      }

      // Seed Notifications
      for (const n of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), n);
      }

      // Seed Audit Logs
      for (const a of INITIAL_AUDIT_LOGS) {
        await setDoc(doc(db, COLLECTIONS.AUDIT_LOGS, a.id), a);
      }

      console.log('[Firebase Cloud] Cloud Firestore initial seed completed successfully!');
    }

    // Now fetch all collections from Firestore
    return await fetchFullCloudDatabase();
  } catch (error) {
    console.error('[Firebase Cloud] Error bootstrapping cloud Firestore:', error);
    return null;
  }
}

/**
 * Fetch all documents across all collections from Cloud Firestore
 */
export async function fetchFullCloudDatabase(): Promise<CloudDbState> {
  const [
    usersSnap,
    familiesSnap,
    invitationsSnap,
    journalsSnap,
    consultationsSnap,
    deepTalkTopicsSnap,
    deepTalkSessionsSnap,
    challengeTasksSnap,
    challengeProgressSnap,
    happinessSnap,
    notificationsSnap,
    auditLogsSnap,
  ] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.USERS)),
    getDocs(collection(db, COLLECTIONS.FAMILIES)),
    getDocs(collection(db, COLLECTIONS.FAMILY_INVITATIONS)),
    getDocs(collection(db, COLLECTIONS.JOURNAL_ENTRIES)),
    getDocs(collection(db, COLLECTIONS.CONSULTATIONS)),
    getDocs(collection(db, COLLECTIONS.DEEP_TALK_TOPICS)),
    getDocs(collection(db, COLLECTIONS.DEEP_TALK_SESSIONS)),
    getDocs(collection(db, COLLECTIONS.CHALLENGE_TASKS)),
    getDocs(collection(db, COLLECTIONS.CHALLENGE_PROGRESS)),
    getDocs(collection(db, COLLECTIONS.HAPPINESS_HISTORY)),
    getDocs(collection(db, COLLECTIONS.NOTIFICATIONS)),
    getDocs(collection(db, COLLECTIONS.AUDIT_LOGS)),
  ]);

  const users = usersSnap.docs.map((d) => d.data() as User);
  const families = familiesSnap.docs.map((d) => d.data() as Family);
  const familyInvitations = invitationsSnap.docs.map((d) => d.data() as FamilyInvitation);
  const journalEntries = journalsSnap.docs.map((d) => d.data() as EmotionJournalEntry);
  const consultations = consultationsSnap.docs.map((d) => d.data() as ConsultationSession);
  const deepTalkTopics = deepTalkTopicsSnap.docs.map((d) => d.data() as DeepTalkTopic);
  const deepTalkSessions = deepTalkSessionsSnap.docs.map((d) => d.data() as DeepTalkSession);
  const challengeTasks = challengeTasksSnap.docs.map((d) => d.data() as Challenge30DayTask);
  const challengeProgress = challengeProgressSnap.docs.map((d) => d.data() as ChallengeDayProgress);
  const happinessHistory = happinessSnap.docs.map((d) => d.data() as HappinessPointRecord);
  const notifications = notificationsSnap.docs.map((d) => d.data() as NotificationItem);
  const auditLogs = auditLogsSnap.docs.map((d) => d.data() as SecurityAuditLog);

  // Default fallback family
  const family = families[0] || INITIAL_FAMILIES[0];

  return {
    users: users.length > 0 ? users : INITIAL_USERS,
    families: families.length > 0 ? families : INITIAL_FAMILIES,
    familyInvitations,
    family,
    journalEntries: journalEntries.length > 0 ? journalEntries : INITIAL_JOURNAL_ENTRIES,
    consultations: consultations.length > 0 ? consultations : INITIAL_CONSULTATIONS,
    deepTalkTopics: deepTalkTopics.length > 0 ? deepTalkTopics : DEEP_TALK_TOPICS,
    deepTalkSessions,
    challengeTasks: challengeTasks.length > 0 ? challengeTasks : INITIAL_CHALLENGE_TASKS,
    challengeProgress: challengeProgress.length > 0 ? challengeProgress : INITIAL_CHALLENGE_PROGRESS,
    happinessHistory: happinessHistory.length > 0 ? happinessHistory : INITIAL_HAPPINESS_HISTORY,
    notifications: notifications.length > 0 ? notifications : INITIAL_NOTIFICATIONS,
    auditLogs: auditLogs.length > 0 ? auditLogs : INITIAL_AUDIT_LOGS,
  };
}

/**
 * Setup Realtime Listeners for instant multi-device synchronization
 */
export function subscribeToCloudChanges(callbacks: {
  onUsersChange?: (users: User[]) => void;
  onFamiliesChange?: (families: Family[]) => void;
  onJournalsChange?: (journals: EmotionJournalEntry[]) => void;
  onConsultationsChange?: (consultations: ConsultationSession[]) => void;
  onNotificationsChange?: (notifications: NotificationItem[]) => void;
}) {
  const unsubUsers = onSnapshot(collection(db, COLLECTIONS.USERS), (snap) => {
    if (!snap.empty && callbacks.onUsersChange) {
      callbacks.onUsersChange(snap.docs.map((d) => d.data() as User));
    }
  });

  const unsubFamilies = onSnapshot(collection(db, COLLECTIONS.FAMILIES), (snap) => {
    if (!snap.empty && callbacks.onFamiliesChange) {
      callbacks.onFamiliesChange(snap.docs.map((d) => d.data() as Family));
    }
  });

  const unsubJournals = onSnapshot(collection(db, COLLECTIONS.JOURNAL_ENTRIES), (snap) => {
    if (!snap.empty && callbacks.onJournalsChange) {
      callbacks.onJournalsChange(snap.docs.map((d) => d.data() as EmotionJournalEntry));
    }
  });

  const unsubConsultations = onSnapshot(collection(db, COLLECTIONS.CONSULTATIONS), (snap) => {
    if (!snap.empty && callbacks.onConsultationsChange) {
      callbacks.onConsultationsChange(snap.docs.map((d) => d.data() as ConsultationSession));
    }
  });

  return () => {
    unsubUsers();
    unsubFamilies();
    unsubJournals();
    unsubConsultations();
  };
}

/**
 * Save / Update Single Document Helper
 */
export async function saveCloudDocument(colName: string, docId: string, data: any) {
  try {
    await setDoc(doc(db, colName, docId), data, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase Cloud] Error saving to ${colName}/${docId}:`, err);
    return false;
  }
}

/**
 * Delete Single Document Helper
 */
export async function deleteCloudDocument(colName: string, docId: string) {
  try {
    await deleteDoc(doc(db, colName, docId));
    return true;
  } catch (err) {
    console.error(`[Firebase Cloud] Error deleting from ${colName}/${docId}:`, err);
    return false;
  }
}
