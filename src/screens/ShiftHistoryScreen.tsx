import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppDataContext';
import { colors, theme } from '../theme';
import {
  formatDurationMinutes,
  formatRecordDate,
  formatTimeLabel,
  getClockRecordDuration,
  parseDateKey,
} from '../utils/dateHelpers';

export function ShiftHistoryScreen() {
  const { clockRecords } = useAppData();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);

  const records = [...clockRecords]
    .filter((record) => parseDateKey(record.date) >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Screen>
      <View style={styles.list}>
        {records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aun no hay registros</Text>
            <Text style={styles.emptyText}>
              Tus fichajes de entrada y salida apareceran aqui automaticamente.
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.date} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatRecordDate(record.date)}</Text>
                <Text style={styles.duration}>
                  {formatDurationMinutes(getClockRecordDuration(record))}
                </Text>
              </View>
              <Text style={styles.detail}>
                Manana: {formatTimeLabel(record.manana.clockIn)} -{' '}
                {formatTimeLabel(record.manana.clockOut)}
              </Text>
              <Text style={styles.detail}>
                Tarde: {formatTimeLabel(record.tarde.clockIn)} -{' '}
                {formatTimeLabel(record.tarde.clockOut)}
              </Text>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
