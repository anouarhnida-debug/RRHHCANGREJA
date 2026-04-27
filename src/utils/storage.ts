import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  userProfile: 'user_profile',
  authCredentials: 'auth_credentials',
  shifts: 'shifts',
  clockRecords: 'clock_records',
  session: 'session',
  vacationRequests: 'vacation_requests',
} as const;

export async function getStorageItem<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function setStorageItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStorageItem(key: string) {
  await AsyncStorage.removeItem(key);
}
