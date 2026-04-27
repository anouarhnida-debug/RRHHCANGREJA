import { ClockPeriod, ClockRecord, ClockRecordSegment } from '../types/app';

const dayNamesLong = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const dayNamesShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const monthNamesLong = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const monthNamesShort = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function padTime(value: number) {
  return String(value).padStart(2, '0');
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = padTime(date.getMonth() + 1);
  const day = padTime(date.getDate());
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getStartOfWeek(date: Date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() + diff);
  return current;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getWeekRange(date: Date) {
  const start = getStartOfWeek(date);
  const end = addDays(start, 6);
  return { start, end };
}

export function getWeekDates(date: Date) {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getWeekNumber(date: Date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
}

export function formatDate(date: Date) {
  return `${dayNamesLong[(date.getDay() + 6) % 7]}, ${date.getDate()} de ${
    monthNamesLong[date.getMonth()]
  }`;
}

export function formatMonthShort(date: Date) {
  return monthNamesShort[date.getMonth()];
}

export function formatWeekLabel(date: Date) {
  return `Sem. ${getWeekNumber(date)} · ${formatMonthShort(date)}`;
}

export function formatWeekRangeLabel(date: Date) {
  const { start, end } = getWeekRange(date);
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()} ${formatMonthShort(end)}`;
  }

  return `${start.getDate()} ${formatMonthShort(start)} - ${end.getDate()} ${formatMonthShort(end)}`;
}

export function formatDayAbbrev(date: Date) {
  return dayNamesShort[(date.getDay() + 6) % 7];
}

export function formatClock(date: Date) {
  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}`;
}

export function formatTimeLabel(isoString: string | null) {
  if (!isoString) {
    return '--:--';
  }

  const date = new Date(isoString);
  return `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;
}

export function isToday(dateKey: string) {
  return dateKey === getDateKey(new Date());
}

export function isDateWithinRange(dateKey: string, start: Date, end: Date) {
  const date = parseDateKey(dateKey);
  return date >= start && date <= end;
}

export function getMinutesBetweenIso(startIso: string, endIso: string) {
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export function createEmptyClockSegment(): ClockRecordSegment {
  return {
    clockIn: null,
    clockOut: null,
    duration: null,
  };
}

export function createEmptyClockRecord(date: string): ClockRecord {
  return {
    date,
    manana: createEmptyClockSegment(),
    tarde: createEmptyClockSegment(),
    clockIn: null,
    clockOut: null,
    duration: null,
  };
}

function normalizeClockSegment(
  segment: Partial<ClockRecordSegment> | null | undefined,
): ClockRecordSegment {
  return {
    clockIn: segment?.clockIn ?? null,
    clockOut: segment?.clockOut ?? null,
    duration: segment?.duration ?? null,
  };
}

function getEarliestIso(values: Array<string | null | undefined>) {
  const filtered = values.filter((value): value is string => Boolean(value));

  if (filtered.length === 0) {
    return null;
  }

  return [...filtered].sort()[0] ?? null;
}

function getLatestIso(values: Array<string | null | undefined>) {
  const filtered = values.filter((value): value is string => Boolean(value));

  if (filtered.length === 0) {
    return null;
  }

  return [...filtered].sort().at(-1) ?? null;
}

export function syncClockRecordSummary(record: ClockRecord): ClockRecord {
  const duration = (record.manana.duration ?? 0) + (record.tarde.duration ?? 0);

  return {
    ...record,
    clockIn: getEarliestIso([record.manana.clockIn, record.tarde.clockIn]),
    clockOut: getLatestIso([record.manana.clockOut, record.tarde.clockOut]),
    duration: duration > 0 ? duration : null,
  };
}

export function normalizeClockRecord(record: Partial<ClockRecord> & { date: string }): ClockRecord {
  const manana = normalizeClockSegment(record.manana);
  const tarde = normalizeClockSegment(record.tarde);
  const legacyClockIn = record.clockIn ?? null;
  const legacyClockOut = record.clockOut ?? null;
  const legacyDuration = record.duration ?? null;

  const migratedManana =
    manana.clockIn || !legacyClockIn
      ? manana
      : {
          clockIn: legacyClockIn,
          clockOut: legacyClockOut,
          duration: legacyDuration,
        };

  return syncClockRecordSummary({
    date: record.date,
    manana: migratedManana,
    tarde,
    clockIn: null,
    clockOut: null,
    duration: null,
  });
}

export function getClockSegmentDuration(segment: ClockRecordSegment, nowIso?: string) {
  if (segment.duration != null) {
    return segment.duration;
  }

  if (segment.clockIn && !segment.clockOut && nowIso) {
    return getMinutesBetweenIso(segment.clockIn, nowIso);
  }

  return 0;
}

export function getClockRecordDuration(record: ClockRecord, nowIso?: string) {
  return (
    getClockSegmentDuration(record.manana, nowIso) +
    getClockSegmentDuration(record.tarde, nowIso)
  );
}

export function getClockRecordActivePeriod(record: ClockRecord): ClockPeriod | null {
  if (record.manana.clockIn && !record.manana.clockOut) {
    return 'manana';
  }

  if (record.tarde.clockIn && !record.tarde.clockOut) {
    return 'tarde';
  }

  return null;
}

export function getShiftDurationMinutes(start: string, end: string) {
  if (!start || !end || start === '--:--' || end === '--:--') {
    return 0;
  }

  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let total = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  if (total <= 0) {
    total += 24 * 60;
  }

  return total;
}

export function formatDurationMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return `${hours}h ${remainder}m`;
}

export function getCurrentMonthLabel(date: Date) {
  return `${monthNamesLong[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRecordDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return `${formatDayAbbrev(date)} ${date.getDate()} ${formatMonthShort(date)}`;
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthMatrix(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leading = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - leading + 1;
    if (day < 1 || day > lastDay.getDate()) {
      return null;
    }

    return new Date(year, month, day);
  });
}
