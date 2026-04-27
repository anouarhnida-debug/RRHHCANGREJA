export type ShiftType = 'mañana' | 'tarde' | 'noche' | 'libre';

export type ClockPeriod = 'manana' | 'tarde';

export type UserProfile = {
  name: string;
  surname: string;
  employeeId: string;
  role: string;
  department: string;
  shiftType: string;
  email: string;
  phone: string;
};

export type Shift = {
  date: string;
  start: string;
  end: string;
  type: ShiftType;
  dept: string;
};

export type ClockRecordSegment = {
  clockIn: string | null;
  clockOut: string | null;
  duration: number | null;
};

export type ClockRecord = {
  date: string;
  manana: ClockRecordSegment;
  tarde: ClockRecordSegment;
  clockIn: string | null;
  clockOut: string | null;
  duration: number | null;
};

export type Session = {
  isLoggedIn: boolean;
  authUserId?: string | null;
  email?: string | null;
};

export type VacationRequest = {
  id: string;
  startDate: string;
  endDate: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  createdAt: string;
};
