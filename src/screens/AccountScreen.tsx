import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { ListItem } from '../components/ListItem';
import { Screen } from '../components/Screen';
import { StatTile } from '../components/StatTile';
import { useClockRecord } from '../hooks/useClockRecord';
import { useProfile } from '../hooks/useProfile';
import { colors, theme } from '../theme';
import { RootStackParamList } from '../types/navigation';
import { formatDurationMinutes } from '../utils/dateHelpers';

type AccountNavigation = NativeStackNavigationProp<RootStackParamList>;

export function AccountScreen() {
  const navigation = useNavigation<AccountNavigation>();
  const { profile, initials, clearSession, session } = useProfile();
  const { monthlyMinutes, monthlyWorkedDays, monthlyFreeDays, monthlyExtraMinutes } =
    useClockRecord();

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{`${profile.name} ${profile.surname}`}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.meta}>{`${profile.shiftType} · ${profile.department}`}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{profile.employeeId}</Text>
        </View>
      </View>

      {!session.isLoggedIn ? (
        <View style={styles.sessionCard}>
          <Text style={styles.sessionTitle}>Sesión cerrada</Text>
          <Text style={styles.sessionText}>
            Puedes volver a entrar desde la pantalla principal de sesión.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        <StatTile label="Horas mes" value={formatDurationMinutes(monthlyMinutes)} />
        <StatTile label="Días trabajados" value={String(monthlyWorkedDays)} />
      </View>
      <View style={styles.grid}>
        <StatTile label="Días libres" value={String(monthlyFreeDays)} />
        <StatTile label="Horas extra" value={formatDurationMinutes(monthlyExtraMinutes)} />
      </View>

      <View style={styles.list}>
        <ListItem
          onPress={() => navigation.navigate('PersonalData')}
          subtitle="Nombre, contacto e identificación"
          title="Datos personales"
        />
        <ListItem
          onPress={() => navigation.navigate('ShiftHistory')}
          subtitle="Últimos 3 meses de registros"
          title="Historial de turnos"
        />
        <ListItem
          onPress={() => navigation.navigate('VacationRequest')}
          subtitle="Formulario con rango de fechas"
          title="Solicitar vacaciones"
        />
        <ListItem
          onPress={() => navigation.navigate('HoursReport')}
          subtitle="Resumen mensual y exportación en texto"
          title="Informe de horas"
        />
        <ListItem
          destructive
          icon="log-out-outline"
          onPress={clearSession}
          subtitle="Cierra la sesión del dispositivo actual"
          title="Cerrar sesión"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 14,
    marginTop: 8,
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  avatarText: {
    color: colors.onPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  headerCopy: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  role: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: colors.morningBadgeBg,
    borderRadius: theme.radius.small,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  sessionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  sessionText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  list: {
    gap: 12,
  },
});
