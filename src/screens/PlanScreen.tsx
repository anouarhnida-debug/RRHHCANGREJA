import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Screen } from '../components/Screen';
import { WeekView } from '../components/WeekView';
import { useShifts } from '../hooks/useShifts';
import { colors, theme } from '../theme';
import {
  addDays,
  formatWeekLabel,
  formatWeekRangeLabel,
  getStartOfWeek,
  getWeekDates,
} from '../utils/dateHelpers';

export function PlanScreen() {
  const { getShiftForDate } = useShifts();
  const [anchorDate, setAnchorDate] = useState(getStartOfWeek(new Date()));
  const weekDates = getWeekDates(anchorDate);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Planificación</Text>
        <Text style={styles.subtitle}>Revisa tus turnos por semana</Text>
      </View>

      <View style={styles.navigator}>
        <Pressable
          onPress={() => setAnchorDate((current) => addDays(current, -7))}
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.textPrimary} name="chevron-back" size={18} />
        </Pressable>

        <View style={styles.navigatorCopy}>
          <Text style={styles.weekLabel}>{formatWeekLabel(anchorDate)}</Text>
          <Text style={styles.rangeLabel}>{formatWeekRangeLabel(anchorDate)}</Text>
        </View>

        <Pressable
          onPress={() => setAnchorDate((current) => addDays(current, 7))}
          style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.textPrimary} name="chevron-forward" size={18} />
        </Pressable>
      </View>

      <WeekView days={weekDates} getShiftForDate={getShiftForDate} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginTop: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  navigator: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  arrowButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  navigatorCopy: {
    alignItems: 'center',
    gap: 4,
  },
  weekLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  rangeLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.88,
  },
});
