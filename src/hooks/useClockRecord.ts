import { useEffect, useState } from 'react';

import { useAppData } from '../context/AppDataContext';
import {
  getDateKey,
  getClockRecordActivePeriod,
  getClockRecordDuration,
  getMonthEnd,
  getMonthStart,
  getShiftDurationMinutes,
  getWeekRange,
  isDateWithinRange,
} from '../utils/dateHelpers';

export function useClockRecord() {
  const { clockRecords, shifts, clockIn, clockOut } = useAppData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = getDateKey(now);
  const todayRecord = clockRecords.find((record) => record.date === todayKey) ?? null;
  const activeRecord =
    [...clockRecords].reverse().find((record) => Boolean(getClockRecordActivePeriod(record))) ??
    null;
  const nowIso = now.toISOString();
  const activePeriod = activeRecord ? getClockRecordActivePeriod(activeRecord) : null;

  const elapsedMinutes = todayRecord ? getClockRecordDuration(todayRecord, nowIso) : 0;

  const { start, end } = getWeekRange(now);
  const weeklyRecords = clockRecords.filter((record) =>
    isDateWithinRange(record.date, start, end),
  );

  const weeklyMinutes = weeklyRecords.reduce(
    (total, record) => total + getClockRecordDuration(record, nowIso),
    0,
  );

  const weeklyDaysCompleted = weeklyRecords.filter(
    (record) => getClockRecordDuration(record, nowIso) > 0,
  ).length;

  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);
  const monthlyRecords = clockRecords.filter((record) =>
    isDateWithinRange(record.date, monthStart, monthEnd),
  );
  const monthlyShifts = shifts.filter((shift) => isDateWithinRange(shift.date, monthStart, monthEnd));

  const monthlyMinutes = monthlyRecords.reduce(
    (total, record) => total + getClockRecordDuration(record, nowIso),
    0,
  );
  const monthlyWorkedDays = monthlyRecords.filter(
    (record) => getClockRecordDuration(record, nowIso) > 0,
  ).length;
  const monthlyFreeDays = monthlyShifts.filter((shift) => shift.type === 'libre').length;
  const monthlyExtraMinutes = monthlyRecords.reduce((total, record) => {
    const shift = shifts.find((currentShift) => currentShift.date === record.date);
    const scheduledMinutes = shift ? getShiftDurationMinutes(shift.start, shift.end) : 0;
    const duration = getClockRecordDuration(record, nowIso);
    return total + Math.max(duration - scheduledMinutes, 0);
  }, 0);

  return {
    now,
    todayRecord,
    elapsedMinutes,
    weeklyMinutes,
    weeklyDaysCompleted,
    monthlyMinutes,
    monthlyWorkedDays,
    monthlyFreeDays,
    monthlyExtraMinutes,
    activePeriod,
    canClockIn: !activeRecord,
    canClockOut: Boolean(activePeriod),
    clockIn,
    clockOut,
  };
}
