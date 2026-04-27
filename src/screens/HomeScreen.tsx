import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { ShiftCard } from '../components/ShiftCard';
import { StatTile } from '../components/StatTile';
import { useClockRecord } from '../hooks/useClockRecord';
import { useProfile } from '../hooks/useProfile';
import { useShifts } from '../hooks/useShifts';
import { colors, theme } from '../theme';
import { RootTabParamList } from '../types/navigation';
import { formatClock, formatDate, formatDurationMinutes } from '../utils/dateHelpers';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeNavigation = BottomTabNavigationProp<RootTabParamList, 'Inicio'>;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Buenos días';
  }

  if (hour < 20) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { fullName } = useProfile();
  const { getTodayShift } = useShifts();
  const {
    now,
    elapsedMinutes,
    weeklyMinutes,
    weeklyDaysCompleted,
  } = useClockRecord();

  const todayShift = getTodayShift();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.date}>{formatDate(now)}</Text>
      </View>

      <View style={styles.clockCard}>
        <Text style={styles.clockLabel}>Hora actual</Text>
        <Text style={styles.clock}>{formatClock(now)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Turno de hoy</Text>
        <ShiftCard elapsedMinutes={elapsedMinutes} shift={todayShift} showProgress />
      </View>

      <View style={styles.grid}>
        <StatTile label="Horas esta semana" value={formatDurationMinutes(weeklyMinutes)} />
        <StatTile label="Días completados" value={String(weeklyDaysCompleted)} />
      </View>

      <Pressable
        onPress={() => navigation.navigate('Planificacion')}
        style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>Ver plan de la semana</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginTop: 8,
  },
  greeting: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    color: colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '600',
  },
  date: {
    color: colors.textMuted,
    fontSize: 15,
  },
  clockCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  clockLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  clock: {
    color: colors.textPrimary,
    fontFamily: theme.typography.mono,
    fontSize: 34,
    letterSpacing: 1.2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.radius.card,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.92,
  },
});
