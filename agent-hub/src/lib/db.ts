// ============================================================
// Agent Hub - IndexedDB Persistence Layer
// ============================================================

import { openDB, type IDBPDatabase } from 'idb';
import type { ConversationSession, ChatMessage, SkillDefinition } from '../types';

const DB_NAME = 'agent-hub';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('conversations')) {
        const store = db.createObjectStore('conversations', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('customSkills')) {
        db.createObjectStore('customSkills', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  return dbInstance;
}

// ---- Conversations ----

export async function saveConversation(session: ConversationSession): Promise<void> {
  const db = await getDB();
  session.updatedAt = Date.now();
  await db.put('conversations', session);
}

export async function getConversation(id: string): Promise<ConversationSession | undefined> {
  const db = await getDB();
  return db.get('conversations', id);
}

export async function listConversations(): Promise<ConversationSession[]> {
  const db = await getDB();
  const all = await db.getAll('conversations');
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('conversations', id);
}

// ---- Custom Skills ----

export async function saveCustomSkill(skill: SkillDefinition): Promise<void> {
  const db = await getDB();
  await db.put('customSkills', skill);
}

export async function getCustomSkills(): Promise<SkillDefinition[]> {
  const db = await getDB();
  return db.getAll('customSkills');
}

export async function deleteCustomSkill(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('customSkills', id);
}

// ---- Settings ----

export async function getSetting<T = string>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const entry = await db.get('settings', key);
  return entry?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}

// ---- Export / Import ----

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const conversations = await db.getAll('conversations');
  const skills = await db.getAll('customSkills');
  const settings = await db.getAll('settings');
  return JSON.stringify({ conversations, skills, settings, exportedAt: Date.now() }, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  const db = await getDB();
  const tx = db.transaction(['conversations', 'customSkills', 'settings'], 'readwrite');
  if (data.conversations) {
    for (const c of data.conversations) await tx.objectStore('conversations').put(c);
  }
  if (data.skills) {
    for (const s of data.skills) await tx.objectStore('customSkills').put(s);
  }
  if (data.settings) {
    for (const s of data.settings) await tx.objectStore('settings').put(s);
  }
  await tx.done;
}
