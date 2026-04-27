import { ClockRecord, Session, Shift, UserProfile, VacationRequest } from '../types/app';
import { addDays, getDateKey, getStartOfWeek } from '../utils/dateHelpers';

const shiftTemplates = [
  { start: '08:00', end: '16:00', type: 'mañana' as const, dept: 'Almacén · Sec. B' },
  { start: '14:00', end: '22:00', type: 'tarde' as const, dept: 'Logística · Sec. A' },
  { start: '22:00', end: '06:00', type: 'noche' as const, dept: 'Expedición · Sec. C' },
  { start: '--:--', end: '--:--', type: 'libre' as const, dept: 'Descanso' },
];

export function generateMockProfile(): UserProfile {
  return {
    name: 'Carlos',
    surname: 'López',
    employeeId: 'EMP-2041',
    role: 'Operario de Almacén',
    department: 'Almacén Central',
    shiftType: 'Rotación semanal',
    email: 'carlos.lopez@turnoapp.local',
    phone: '+34 600 123 456',
  };
}

export function generateMockShifts(): Shift[] {
  const startOfWeek = getStartOfWeek(new Date());
  const shifts: Shift[] = [];

  for (let index = 0; index < 28; index += 1) {
    const date = addDays(startOfWeek, index);
    const weekOffset = Math.floor(index / 7);
    const dayOffset = index % 7;
    const template = shiftTemplates[(dayOffset + weekOffset) % shiftTemplates.length];
    const isWeekend = dayOffset === 5 || dayOffset === 6;
    const shift = isWeekend ? shiftTemplates[3] : template;

    shifts.push({
      date: getDateKey(date),
      start: shift.start,
      end: shift.end,
      type: shift.type,
      dept: shift.dept,
    });
  }

  const todayKey = getDateKey(new Date());
  const todayIndex = shifts.findIndex((shift) => shift.date === todayKey);

  if (todayIndex >= 0) {
    shifts[todayIndex] = {
      date: todayKey,
      start: '08:00',
      end: '16:00',
      type: 'mañana',
      dept: 'Almacén · Sec. B',
    };
  }

  return shifts;
}

export function generateSeedData(): {
  profile: UserProfile;
  shifts: Shift[];
  clockRecords: ClockRecord[];
  session: Session;
  vacationRequests: VacationRequest[];
} {
  return {
    profile: generateMockProfile(),
    shifts: generateMockShifts(),
    clockRecords: [],
    session: { isLoggedIn: false },
    vacationRequests: [],
  };
}
