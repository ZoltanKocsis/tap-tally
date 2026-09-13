import { addDays, monthShort, startOfDay, weekdayShort } from './format';
import { getEarliestEntryDate, getEntriesBetween } from './db';

export type ChartPoint = { label: string; value: number };

export type Period = 'week' | 'month' | 'year' | 'all';

function countBetween(start: Date, end: Date): number {
  return getEntriesBetween(start.toISOString(), end.toISOString()).length;
}

/** Last 7 days including today, one bar per day. */
export function weekData(): ChartPoint[] {
  const today = startOfDay(new Date());
  const points: ChartPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDays(today, -i);
    points.push({ label: weekdayShort(day), value: countBetween(day, addDays(day, 1)) });
  }
  return points;
}

/** Every day of the current calendar month, one bar per day. */
export function monthData(): ChartPoint[] {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const points: ChartPoint[] = [];
  for (let d = 0; d < daysInMonth; d++) {
    const day = addDays(first, d);
    points.push({ label: `${day.getDate()}`, value: countBetween(day, addDays(day, 1)) });
  }
  return points;
}

/** Jan–Dec of the current calendar year, one bar per month. */
export function yearData(): ChartPoint[] {
  const now = new Date();
  const points: ChartPoint[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(now.getFullYear(), m, 1);
    const end = new Date(now.getFullYear(), m + 1, 1);
    points.push({ label: monthShort(m), value: countBetween(start, end) });
  }
  return points;
}

/** One bar per calendar year, from the first-ever entry to this year. */
export function allData(): ChartPoint[] {
  const now = new Date();
  const earliest = getEarliestEntryDate();
  const firstYear = earliest ? earliest.getFullYear() : now.getFullYear();
  const points: ChartPoint[] = [];
  for (let year = firstYear; year <= now.getFullYear(); year++) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    points.push({ label: `${year}`, value: countBetween(start, end) });
  }
  return points;
}

export function dataForPeriod(period: Period): ChartPoint[] {
  switch (period) {
    case 'week':
      return weekData();
    case 'month':
      return monthData();
    case 'year':
      return yearData();
    case 'all':
      return allData();
  }
}

export const PERIOD_TITLES: Record<Period, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Together',
};
