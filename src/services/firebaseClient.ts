import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Cloud Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  FAMILY_INVITATIONS: 'family_invitations',
  JOURNAL_ENTRIES: 'journal_entries',
  CONSULTATIONS: 'consultations',
  DEEP_TALK_TOPICS: 'deep_talk_topics',
  DEEP_TALK_SESSIONS: 'deep_talk_sessions',
  CHALLENGE_TASKS: 'challenge_tasks',
  CHALLENGE_PROGRESS: 'challenge_progress',
  HAPPINESS_HISTORY: 'happiness_history',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  SETTINGS: 'app_settings',
} as const;

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
};
