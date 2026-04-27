import { StyleSheet, Text, View } from 'react-native';

import { Shift } from '../types/app';
import { colors, theme } from '../theme';
import { formatDurationMinutes, getShiftDurationMinutes } from '../utils/dateHelpers';

type ShiftCardProps = {
  shift: Shift | null;
  elapsedMinutes?: number;
  compact?: boolean;
  showProgress?: boolean;
};

const badgeStyles = {
  mañana: { backgroundColor: colors.morningBadgeBg, color: colors.morningBadgeText, label: 'Mañana' },
  tarde: { backgroundColor: colors.afternoonBadgeBg, color: colors.afternoonBadgeText, label: 'Tarde' },
  noche: { backgroundColor: colors.nightBadgeBg, color: colors.nightBadgeText, label: 'Noche' },
  libre: { backgroundColor: colors.freeBadgeBg, color: colors.freeBadgeText, label: 'Libre' },
};

export function ShiftCard({
  shift,
  elapsedMinutes = 0,
  compact = false,
  showProgress = false,
}: ShiftCardProps) {
  const shiftType = shift?.type ?? 'libre';
  const badge = badgeStyles[shiftType];
  const totalMinutes = shift ? getShiftDurationMinutes(shift.start, shift.end) : 0;
  const progress = totalMinutes > 0 ? Math.min((elapsedMinutes / totalMinutes) * 100, 100) : 0;

  if (!shift || shift.type === 'libre') {
    return (
      <View style={[styles.card, compact && styles.compactCard]}>
        <View style={styles.topRow}>
          <Text style={styles.timeText}>Día libre</Text>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        <Text style={styles.departmentText}>Sin turno asignado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.topRow}>
        <Text style={styles.timeText}>{`${shift.start} - ${shift.end}`}</Text>
        <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>
      <Text style={styles.departmentText}>{shift.dept}</Text>

      {showProgress ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Horas trabajadas: {formatDurationMinutes(elapsedMinutes)}
          </Text>
        </View>
      ) : compact ? null : (
        <Text style={styles.shiftTotal}>Turno total: {formatDurationMinutes(totalMinutes)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  compactCard: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    borderRadius: theme.radius.small,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  departmentText: {
    color: colors.textMuted,
    fontSize: theme.typography.body,
  },
  shiftTotal: {
    color: colors.textMuted,
    fontSize: 13,
  },
  progressBlock: {
    gap: 8,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 10,
  },
  progressLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
});
