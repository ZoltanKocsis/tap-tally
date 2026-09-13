import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { getAllEntries } from './db';
import { formatShortDate, formatTime } from './format';

function slug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'export';
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${`${d.getMonth() + 1}`.padStart(2, '0')}${`${d.getDate()}`.padStart(2, '0')}`;
}

async function shareFile(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

export async function exportCsv(itemName: string): Promise<string> {
  const entries = getAllEntries();
  const rows = ['id,date,time,timestamp'];
  for (const e of entries) {
    const date = new Date(e.ts);
    rows.push(`${e.id},${formatShortDate(date)},${formatTime(date)},${e.ts}`);
  }
  const uri = `${FileSystem.cacheDirectory}${slug(itemName)}-export-${todayStamp()}.csv`;
  await FileSystem.writeAsStringAsync(uri, rows.join('\n'));
  await shareFile(uri);
  return uri;
}

export async function exportXlsx(itemName: string): Promise<string> {
  const entries = getAllEntries();
  const rows = entries.map((e) => {
    const date = new Date(e.ts);
    return { id: e.id, date: formatShortDate(date), time: formatTime(date), timestamp: e.ts };
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, itemName.slice(0, 31) || 'Entries');
  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  const uri = `${FileSystem.cacheDirectory}${slug(itemName)}-export-${todayStamp()}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await shareFile(uri);
  return uri;
}
