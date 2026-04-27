import * as Notifications from 'expo-notifications';
import { User } from '@supabase/supabase-js';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { generateSeedData } from '../constants/mockData';
import { mapEmployeeRowToUserProfile } from '../lib/employeeProfile';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import {
  ClockPeriod,
  ClockRecord,
  Session,
  Shift,
  UserProfile,
  VacationRequest,
} from '../types/app';
import {
  createEmptyClockRecord,
  getDateKey,
  getClockRecordActivePeriod,
  getMinutesBetweenIso,
  normalizeClockRecord,
  parseDateKey,
  syncClockRecordSummary,
} from '../utils/dateHelpers';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../utils/storage';

type AppDataContextValue = {
  initialized: boolean;
  profile: UserProfile | null;
  shifts: Shift[];
  clockRecords: ClockRecord[];
  session: Session;
  vacationRequests: VacationRequest[];
  refreshData: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  clockIn: (period?: ClockPeriod) => Promise<void>;
  clockOut: (period?: ClockPeriod) => Promise<void>;
  clearSession: () => Promise<void>;
  saveVacationRequest: (startDate: string, endDate: string) => Promise<void>;
};

const defaultSession: Session = { isLoggedIn: false, authUserId: null, email: null };

const AppDataContext = createContext<AppDataContextValue | null>(null);

function upsertClockRecord(records: ClockRecord[], nextRecord: ClockRecord) {
  const existing = records.some((record) => record.date === nextRecord.date);

  if (!existing) {
    return [nextRecord, ...records];
  }

  return records.map((record) => (record.date === nextRecord.date ? nextRecord : record));
}

async function ensureSeedData() {
  const seed = generateSeedData();
  const existingShifts = await getStorageItem<Shift[]>(STORAGE_KEYS.shifts, []);
  const existingClockRecords = await getStorageItem<ClockRecord[]>(
    STORAGE_KEYS.clockRecords,
    [],
  );
  const existingVacations = await getStorageItem<VacationRequest[]>(
    STORAGE_KEYS.vacationRequests,
    [],
  );

  if (existingShifts.length === 0) {
    await setStorageItem(STORAGE_KEYS.shifts, seed.shifts);
  }

  if (existingClockRecords.length === 0) {
    await setStorageItem(STORAGE_KEYS.clockRecords, seed.clockRecords);
  }

  if (existingVacations.length === 0) {
    await setStorageItem(STORAGE_KEYS.vacationRequests, seed.vacationRequests);
  }
}

async function clearLegacyAuthCache() {
  await Promise.all([
    removeStorageItem(STORAGE_KEYS.userProfile),
    removeStorageItem(STORAGE_KEYS.authCredentials),
    removeStorageItem(STORAGE_KEYS.session),
  ]);
}

async function scheduleShiftReminders(shifts: Shift[]) {
  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  for (const shift of shifts) {
    if (shift.type === 'libre' || shift.start === '--:--') {
      continue;
    }

    const date = parseDateKey(shift.date);
    const [hours, minutes] = shift.start.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    if (date <= now || date > nextWeek) {
      continue;
    }

    const trigger = new Date(date);
    trigger.setMinutes(trigger.getMinutes() - 30);

    if (trigger <= now) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de turno',
        body: `${shift.dept} · Tu turno ${shift.type} empieza a las ${shift.start}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });
  }
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [session, setSession] = useState<Session>(defaultSession);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);

  const loadStoredData = async () => {
    await ensureSeedData();

    const [storedShifts, storedRecords, storedVacations] = await Promise.all([
      getStorageItem<Shift[]>(STORAGE_KEYS.shifts, []),
      getStorageItem<ClockRecord[]>(STORAGE_KEYS.clockRecords, []),
      getStorageItem<VacationRequest[]>(STORAGE_KEYS.vacationRequests, []),
    ]);
    const normalizedRecords = storedRecords.map((record) => normalizeClockRecord(record));

    setShifts(storedShifts);
    setClockRecords(normalizedRecords);
    setVacationRequests(storedVacations);

    if (JSON.stringify(storedRecords) !== JSON.stringify(normalizedRecords)) {
      await setStorageItem(STORAGE_KEYS.clockRecords, normalizedRecords);
    }
  };

  const resetAuthState = async () => {
    setProfile(null);
    setSession(defaultSession);
    await clearLegacyAuthCache();
  };

  const loadEmployeeProfile = async (user: User) => {
    const fallbackEmail = user.email?.trim().toLowerCase() ?? '';
    const { data: employeeByProfileId, error: profileIdError } = await supabase
      .from('employees')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (profileIdError) {
      return {
        success: false,
        message: profileIdError.message,
      };
    }

    let employeeRow = employeeByProfileId;

    if (!employeeRow && fallbackEmail) {
      const { data: employeeByEmail, error: emailError } = await supabase
        .from('employees')
        .select('*')
        .eq('work_email', fallbackEmail)
        .maybeSingle();

      if (emailError) {
        return {
          success: false,
          message: emailError.message,
        };
      }

      employeeRow = employeeByEmail;
    }

    if (!employeeRow) {
      return {
        success: false,
        message: 'La cuenta existe en Supabase Auth, pero no tiene ficha vinculada en employees.',
      };
    }

    const nextProfile = mapEmployeeRowToUserProfile(employeeRow, fallbackEmail);
    const nextSession: Session = {
      isLoggedIn: true,
      authUserId: user.id,
      email: fallbackEmail || nextProfile.email,
    };

    setProfile(nextProfile);
    setSession(nextSession);

    return { success: true, message: 'Sesión iniciada.' };
  };

  const refreshData = async () => {
    await loadStoredData();

    if (!hasSupabaseEnv) {
      await resetAuthState();
      setInitialized(true);
      return;
    }

    const {
      data: { session: activeSession },
      error,
    } = await supabase.auth.getSession();

    if (error || !activeSession?.user) {
      await resetAuthState();
      setInitialized(true);
      return;
    }

    const result = await loadEmployeeProfile(activeSession.user);

    if (!result.success) {
      await supabase.auth.signOut({ scope: 'local' });
      await resetAuthState();
    }

    setInitialized(true);
  };

  useEffect(() => {
    refreshData().catch(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        if (!nextSession?.user) {
          void resetAuthState();
          return;
        }

        void loadEmployeeProfile(nextSession.user).then((result) => {
          if (!result.success) {
            void supabase.auth.signOut({ scope: 'local' });
          }
        });
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (initialized && shifts.length > 0) {
      scheduleShiftReminders(shifts).catch(() => undefined);
    }
  }, [initialized, shifts]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      return { success: false, message: 'Introduce correo y contraseña.' };
    }

    if (!hasSupabaseEnv) {
      return {
        success: false,
        message:
          'Falta configurar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (error || !data.user) {
      return {
        success: false,
        message: error?.message ?? 'No se pudo iniciar sesión en Supabase Auth.',
      };
    }

    const result = await loadEmployeeProfile(data.user);

    if (!result.success) {
      await supabase.auth.signOut({ scope: 'local' });
      await resetAuthState();
      return result;
    }

    return result;
  };

  const clockIn = async (period: ClockPeriod = 'manana') => {
    const today = getDateKey(new Date());
    const now = new Date().toISOString();
    const activeRecord = clockRecords.find((record) => getClockRecordActivePeriod(record));

    if (activeRecord) {
      return;
    }

    const currentRecord = normalizeClockRecord(
      clockRecords.find((record) => record.date === today) ?? createEmptyClockRecord(today),
    );
    const currentSegment = currentRecord[period];

    if (currentSegment.clockIn) {
      return;
    }

    const nextRecord = syncClockRecordSummary({
      ...currentRecord,
      [period]: {
        ...currentSegment,
        clockIn: now,
        clockOut: null,
        duration: null,
      },
    });
    const nextRecords = upsertClockRecord(clockRecords, nextRecord);

    setClockRecords(nextRecords);
    await setStorageItem(STORAGE_KEYS.clockRecords, nextRecords);
  };

  const clockOut = async (period: ClockPeriod = 'manana') => {
    const now = new Date().toISOString();
    const today = getDateKey(new Date());
    const currentRecord = clockRecords.find((record) => record.date === today);
    const currentSegment = currentRecord?.[period];

    if (!currentRecord || !currentSegment?.clockIn || currentSegment.clockOut) {
      return;
    }

    if (getClockRecordActivePeriod(currentRecord) !== period) {
      return;
    }

    const duration = getMinutesBetweenIso(currentSegment.clockIn, now);
    const nextRecord = syncClockRecordSummary({
      ...currentRecord,
      [period]: {
        ...currentSegment,
        clockOut: now,
        duration,
      },
    });
    const nextRecords = upsertClockRecord(clockRecords, nextRecord);

    setClockRecords(nextRecords);
    await setStorageItem(STORAGE_KEYS.clockRecords, nextRecords);
  };

  const clearSession = async () => {
    if (hasSupabaseEnv) {
      await supabase.auth.signOut({ scope: 'local' });
    }

    await resetAuthState();
  };

  const saveVacationRequest = async (startDate: string, endDate: string) => {
    const nextRequest: VacationRequest = {
      id: `${startDate}-${endDate}-${Date.now()}`,
      startDate,
      endDate,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    const nextRequests = [nextRequest, ...vacationRequests];
    setVacationRequests(nextRequests);
    await setStorageItem(STORAGE_KEYS.vacationRequests, nextRequests);
  };

  return (
    <AppDataContext.Provider
      value={{
        initialized,
        profile,
        shifts,
        clockRecords,
        session,
        vacationRequests,
        refreshData,
        login,
        clockIn,
        clockOut,
        clearSession,
        saveVacationRequest,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppDataProvider');
  }

  return context;
}
