import { useAppData } from '../context/AppDataContext';

export function useProfile() {
  const { initialized, profile, session, clearSession, login } = useAppData();

  return {
    initialized,
    profile,
    session,
    clearSession,
    login,
    fullName: profile ? `${profile.name} ${profile.surname}` : '',
    initials: profile ? `${profile.name[0]}${profile.surname[0]}`.toUpperCase() : '--',
  };
}
