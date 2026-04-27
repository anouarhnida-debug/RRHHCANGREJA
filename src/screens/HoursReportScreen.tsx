import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppDataContext';
import { useClockRecord } from '../hooks/useClockRecord';
import { useProfile } from '../hooks/useProfile';
import { useShifts } from '../hooks/useShifts';
import { colors, theme } from '../theme';
import {
  formatDurationMinutes,
  formatTimeLabel,
  getClockRecordDuration,
  getCurrentMonthLabel,
} from '../utils/dateHelpers';

export function HoursReportScreen() {
  const { profile } = useProfile();
  const { shifts } = useShifts();
  const { clockRecords } = useAppData();
  const { monthlyMinutes, monthlyWorkedDays, monthlyFreeDays, monthlyExtraMinutes } =
    useClockRecord();

  const currentMonth = getCurrentMonthLabel(new Date());
  const reportText = [
    `Informe de horas - ${currentMonth}`,
    `Empleado: ${profile?.name ?? ''} ${profile?.surname ?? ''}`.trim(),
    `ID: ${profile?.employeeId ?? ''}`,
    `Horas trabajadas: ${formatDurationMinutes(monthlyMinutes)}`,
    `Dias trabajados: ${monthlyWorkedDays}`,
    `Dias libres: ${monthlyFreeDays}`,
    `Horas extra: ${formatDurationMinutes(monthlyExtraMinutes)}`,
    '',
    'Ultimos registros:',
    ...clockRecords.slice(0, 5).map((record) => {
      const shift = shifts.find((item) => item.date === record.date);
      return `${record.date} | M ${formatTimeLabel(record.manana.clockIn)}-${formatTimeLabel(
        record.manana.clockOut,
      )} | T ${formatTimeLabel(record.tarde.clockIn)}-${formatTimeLabel(
        record.tarde.clockOut,
      )} | ${shift?.dept ?? 'Sin departamento'} | ${formatDurationMinutes(
        getClockRecordDuration(record),
      )}`;
    }),
  ].join('\n');

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>{currentMonth}</Text>
        <Text style={styles.preview}>{reportText}</Text>
      </View>

      <Pressable
        onPress={() => Share.share({ message: reportText })}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Exportar como texto</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
    padding: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  preview: {
    color: colors.textPrimary,
    fontFamily: theme.typography.mono,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.radius.card,
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
