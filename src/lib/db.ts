import * as SQLite from 'expo-sqlite';

import { addDays, startOfDay } from './format';

export type Entry = { id: number; ts: string };

const db = SQLite.openDatabaseSync('taptally.db');

export function initDb(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_entries_ts ON entries (ts);
  `);
}

// --- settings -------------------------------------------------------------

function getSetting(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

function setSetting(key: string, value: string): void {
  db.runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

export const DEFAULT_ITEM_NAME = 'Item';

export function isOnboarded(): boolean {
  return getSetting('onboarded') === '1';
}

export function completeOnboarding(itemName: string): void {
  setSetting('itemName', itemName.trim() || DEFAULT_ITEM_NAME);
  setSetting('onboarded', '1');
}

export function getItemName(): string {
  return getSetting('itemName') ?? DEFAULT_ITEM_NAME;
}

export function setItemName(name: string): void {
  setSetting('itemName', name.trim() || DEFAULT_ITEM_NAME);
}

// --- entries ----------------------------------------------------------------

export function addEntry(): Entry {
  const ts = new Date().toISOString();
  const result = db.runSync('INSERT INTO entries (ts) VALUES (?)', [ts]);
  return { id: result.lastInsertRowId, ts };
}

export function deleteEntry(id: number): void {
  db.runSync('DELETE FROM entries WHERE id = ?', [id]);
}

/** Removes the single most recently added entry (the "Cancel +1" action). */
export function deleteMostRecentEntry(): boolean {
  const row = db.getFirstSync<{ id: number }>('SELECT id FROM entries ORDER BY ts DESC, id DESC LIMIT 1');
  if (!row) return false;
  db.runSync('DELETE FROM entries WHERE id = ?', [row.id]);
  return true;
}

export function getEntriesBetween(startIso: string, endIsoExclusive: string): Entry[] {
  return db.getAllSync<Entry>(
    'SELECT id, ts FROM entries WHERE ts >= ? AND ts < ? ORDER BY ts ASC',
    [startIso, endIsoExclusive],
  );
}

/** Today's entries, most recent first — used for the on-screen log. */
export function getTodayEntries(): Entry[] {
  const start = startOfDay(new Date());
  const end = addDays(start, 1);
  return getEntriesBetween(start.toISOString(), end.toISOString()).reverse();
}

export function getTodayTotal(): number {
  return getTodayEntries().length;
}

export function getAllEntries(): Entry[] {
  return db.getAllSync<Entry>('SELECT id, ts FROM entries ORDER BY ts ASC');
}

export function getEarliestEntryDate(): Date | null {
  const row = db.getFirstSync<{ ts: string }>('SELECT ts FROM entries ORDER BY ts ASC LIMIT 1');
  return row ? new Date(row.ts) : null;
}

export function resetAllEntries(): void {
  db.runSync('DELETE FROM entries');
}

// Run once, as soon as this module is first imported anywhere in the app.
initDb();
