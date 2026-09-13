const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** "Sunday 13.09.2026" */
export function formatDayHeader(date: Date): string {
  const weekday = WEEKDAYS[date.getDay()];
  return `${weekday} ${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** "14:32:07" */
export function formatTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** "13.09.2026" */
export function formatShortDate(date: Date): string {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function monthShort(monthIndex: number): string {
  return MONTHS_SHORT[monthIndex];
}

export function weekdayShort(date: Date): string {
  return WEEKDAYS[date.getDay()].slice(0, 3);
}

/** Start of the local day for the given date. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
