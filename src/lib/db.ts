import * as SQLite from 'expo-sqlite';

import { addDays, startOfDay } from './format';

export type Item = { id: number; name: string; sortOrder: number };
export type Entry = { id: number; itemId: number; ts: string };

const db = SQLite.openDatabaseSync('taptally.db');

function initDb(): void {
  const hasItemsTable = db.getFirstSync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='items'",
  );
  if (!hasItemsTable) {
    // Pre-multi-item schema, if any — start clean rather than migrate it.
    db.execSync('DROP TABLE IF EXISTS entries; DROP TABLE IF EXISTS settings;');
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      ts TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_entries_item_ts ON entries (item_id, ts);
  `);
}

// --- settings ---------------------------------------------------------------

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

export function isOnboarded(): boolean {
  return getSetting('onboarded') === '1';
}

export function getCurrentItemId(): number | null {
  const raw = getSetting('currentItemId');
  return raw ? Number(raw) : null;
}

export function setCurrentItemId(id: number): void {
  setSetting('currentItemId', `${id}`);
}

// --- items --------------------------------------------------------------------

export function getItems(): Item[] {
  return db
    .getAllSync<{ id: number; name: string; sort_order: number }>(
      'SELECT id, name, sort_order FROM items ORDER BY sort_order ASC',
    )
    .map((row) => ({ id: row.id, name: row.name, sortOrder: row.sort_order }));
}

export function addItem(name: string): Item {
  const trimmed = name.trim();
  const maxOrder = db.getFirstSync<{ maxOrder: number | null }>('SELECT MAX(sort_order) as maxOrder FROM items');
  const sortOrder = (maxOrder?.maxOrder ?? -1) + 1;
  const result = db.runSync('INSERT INTO items (name, sort_order) VALUES (?, ?)', [trimmed, sortOrder]);
  return { id: result.lastInsertRowId, name: trimmed, sortOrder };
}

export function renameItem(id: number, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  db.runSync('UPDATE items SET name = ? WHERE id = ?', [trimmed, id]);
}

/** Deletes an item and all of its logged entries. */
export function deleteItem(id: number): void {
  db.runSync('DELETE FROM entries WHERE item_id = ?', [id]);
  db.runSync('DELETE FROM items WHERE id = ?', [id]);
}

/** Creates the first item and marks onboarding complete. */
export function completeOnboarding(itemName: string): Item {
  const item = addItem(itemName);
  setCurrentItemId(item.id);
  setSetting('onboarded', '1');
  return item;
}

// --- entries ------------------------------------------------------------------

export function addEntry(itemId: number): Entry {
  const ts = new Date().toISOString();
  const result = db.runSync('INSERT INTO entries (item_id, ts) VALUES (?, ?)', [itemId, ts]);
  return { id: result.lastInsertRowId, itemId, ts };
}

export function deleteEntry(id: number): void {
  db.runSync('DELETE FROM entries WHERE id = ?', [id]);
}

/** Removes the single most recently added entry for an item (the "Cancel +1" action). */
export function deleteMostRecentEntry(itemId: number): boolean {
  const row = db.getFirstSync<{ id: number }>(
    'SELECT id FROM entries WHERE item_id = ? ORDER BY ts DESC, id DESC LIMIT 1',
    [itemId],
  );
  if (!row) return false;
  db.runSync('DELETE FROM entries WHERE id = ?', [row.id]);
  return true;
}

export function getEntriesBetween(itemId: number, startIso: string, endIsoExclusive: string): Entry[] {
  return db
    .getAllSync<{ id: number; item_id: number; ts: string }>(
      'SELECT id, item_id, ts FROM entries WHERE item_id = ? AND ts >= ? AND ts < ? ORDER BY ts ASC',
      [itemId, startIso, endIsoExclusive],
    )
    .map((row) => ({ id: row.id, itemId: row.item_id, ts: row.ts }));
}

/** Today's entries for an item, most recent first — used for the on-screen log. */
export function getTodayEntries(itemId: number): Entry[] {
  const start = startOfDay(new Date());
  const end = addDays(start, 1);
  return getEntriesBetween(itemId, start.toISOString(), end.toISOString()).reverse();
}

export function getEntryCount(itemId: number): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM entries WHERE item_id = ?', [itemId]);
  return row?.count ?? 0;
}

export function getEarliestEntryDate(itemId: number): Date | null {
  const row = db.getFirstSync<{ ts: string }>('SELECT ts FROM entries WHERE item_id = ? ORDER BY ts ASC LIMIT 1', [
    itemId,
  ]);
  return row ? new Date(row.ts) : null;
}

/** Wipes every entry for one item, keeping the item itself. */
export function resetItemEntries(itemId: number): void {
  db.runSync('DELETE FROM entries WHERE item_id = ?', [itemId]);
}

/** Wipes everything — all items, all entries, onboarding state. */
export function resetEverything(): void {
  db.execSync('DELETE FROM entries; DELETE FROM items; DELETE FROM settings;');
}

// Run once, as soon as this module is first imported anywhere in the app.
initDb();
