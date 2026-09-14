import { addDays, monthShort, weekdayShort } from './format';
import { getEarliestEntryDate, getEntriesBetween } from './db';

export type ChartPoint = { label: string; value: number };

export type Period = 'week' | 'month' | 'year' | 'all';

function countBetween(itemId: number, start: Date, end: Date): number {
  return getEntriesBetween(itemId, start.toISOString(), end.toISOString()).length;
}

/** Last 7 days including today, one bar per day. */
export function weekData(itemId: number): ChartPoint[] {
  const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const points: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDays(today, -i);
    points.push({ label: weekdayShort(day), value: countBetween(itemId, day, addDays(day, 1)) });
  }
  return points;
}

/** Every day of the current calendar month, one bar per day. */
export function monthData(itemId: number): ChartPoint[] {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const points: ChartPoint[] = [];
  for (let d = 0; d < daysInMonth; d++) {
    const day = addDays(first, d);
    points.push({ label: `${day.getDate()}`, value: countBetween(itemId, day, addDays(day, 1)) });
  }
  return points;
}

/** Jan–Dec of the current calendar year, one bar per month. */
export function yearData(itemId: number): ChartPoint[] {
  const now = new Date();
  const points: ChartPoint[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(now.getFullYear(), m, 1);
    const end = new Date(now.getFullYear(), m + 1, 1);
    points.push({ label: monthShort(m), value: countBetween(itemId, start, end) });
  }
  return points;
}

/** One bar per calendar year, from the first-ever entry to this year. */
export function allData(itemId: number): ChartPoint[] {
  const now = new Date();
  const earliest = getEarliestEntryDate(itemId);
  const firstYear = earliest ? earliest.getFullYear() : now.getFullYear();
  const points: ChartPoint[] = [];
  for (let year = firstYear; year <= now.getFullYear(); year++) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    points.push({ label: `${year}`, value: countBetween(itemId, start, end) });
  }
  return points;
}

export function dataForPeriod(period: Period, itemId: number): ChartPoint[] {
  switch (period) {
    case 'week':
      return weekData(itemId);
    case 'month':
      return monthData(itemId);
    case 'year':
      return yearData(itemId);
    case 'all':
      return allData(itemId);
  }
}

export const PERIOD_TITLES: Record<Period, string> = {
  week: 'Last 7 Days',
  month: 'This Month',
  year: 'This Year',
  all: 'All Together',
};
