import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { useClockRecord } from '../hooks/useClockRecord';
import { useProfile } from '../hooks/useProfile';
import { colors, theme } from '../theme';
import { ClockPeriod, ClockRecordSegment } from '../types/app';
import {
  formatClock,
  formatDate,
  formatDurationMinutes,
  formatTimeLabel,
  getClockSegmentDuration,
} from '../utils/dateHelpers';

type PeriodCardProps = {
  period: ClockPeriod;
  title: string;
  segment: ClockRecordSegment;
  isActive: boolean;
  onClockIn: (period: ClockPeriod) => void;
  onClockOut: (period: ClockPeriod) => void;
};

function ActionButton({
  disabled,
  onPress,
  title,
  tone,
}: {
  disabled: boolean;
  onPress: () => void;
  title: string;
  tone: 'primary' | 'danger';
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        tone === 'primary' ? styles.primaryButton : styles.dangerButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

function getStatusLabel(segment: ClockRecordSegment, isActive: boolean) {
  if (isActive) {
    return 'En curso';
  }

  if (segment.clockOut) {
    return 'Completado';
  }

  if (segment.clockIn) {
    return 'Abierto';
  }

  return 'Pendiente';
}

function PeriodCard({
  period,
  title,
  segment,
  isActive,
  onClockIn,
  onClockOut,
}: PeriodCardProps) {
  const status = getStatusLabel(segment, isActive);
  const duration = getClockSegmentDuration(segment, new Date().toISOString());
  const canClockIn = !segment.clockIn && !isActive;
  const canClockOut = isActive && Boolean(segment.clockIn) && !segment.clockOut;

  return (
    <View style={styles.periodCard}>
      <View style={styles.periodHeader}>
        <View>
          <Text style={styles.periodTitle}>{title}</Text>
          <Text style={styles.periodSubtitle}>Bloque de fichaje</Text>
        </View>
        <View style={[styles.stateBadge, isActive ? styles.stateBadgeActive : styles.stateBadgeIdle]}>
          <Text style={[styles.stateText, isActive ? styles.stateTextActive : styles.stateTextIdle]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Entrada</Text>
          <Text style={styles.metricValue}>{formatTimeLabel(segment.clockIn)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Salida</Text>
          <Text style={styles.metricValue}>{formatTimeLabel(segment.clockOut)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Tiempo</Text>
          <Text style={styles.metricValue}>{formatDurationMinutes(duration)}</Text>
        </View>
      </View>

      <View style={styles.signatureBox}>
        <Text style={styles.signatureTitle}>Firma</Text>
        <Text style={styles.signatureText}>
          Espacio reservado para integrar la firma en pantalla en el siguiente paso.
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <ActionButton
          disabled={!canClockIn}
          onPress={() => onClockIn(period)}
          title="Registrar entrada"
          tone="primary"
        />
        <ActionButton
          disabled={!canClockOut}
          onPress={() => onClockOut(period)}
          title="Registrar salida"
          tone="danger"
        />
      </View>
    </View>
  );
}

export function ClockHubScreen() {
  const { profile } = useProfile();
  const { now, todayRecord, elapsedMinutes, activePeriod, clockIn, clockOut } = useClockRecord();

  if (!profile) {
    return null;
  }

  const manana = todayRecord?.manana ?? { clockIn: null, clockOut: null, duration: null };
  const tarde = todayRecord?.tarde ?? { clockIn: null, clockOut: null, duration: null };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FH</Text>
        <Text style={styles.subtitle}>Terminal de fichaje dividido por manana y tarde</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>Hora actual</Text>
          <Text style={styles.summaryClock}>{formatClock(now)}</Text>
          <Text style={styles.summaryDate}>{formatDate(now)}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>Trabajado hoy</Text>
          <Text style={styles.summaryTotal}>{formatDurationMinutes(elapsedMinutes)}</Text>
          <Text style={styles.summaryDate}>
            {activePeriod ? `Bloque activo: ${activePeriod}` : 'Sin bloque activo'}
          </Text>
        </View>
      </View>

      <View style={styles.employeeCard}>
        <Text style={styles.employeeName}>{`${profile.name} ${profile.surname}`}</Text>
        <Text style={styles.employeeMeta}>{profile.employeeId}</Text>
        <Text style={styles.employeeMeta}>{`${profile.role} · ${profile.department}`}</Text>
      </View>

      <PeriodCard
        isActive={activePeriod === 'manana'}
        onClockIn={(period) => {
          void clockIn(period);
        }}
        onClockOut={(period) => {
          void clockOut(period);
        }}
        period="manana"
        segment={manana}
        title="Manana"
      />

      <PeriodCard
        isActive={activePeriod === 'tarde'}
        onClockIn={(period) => {
          void clockIn(period);
        }}
        onClockOut={(period) => {
          void clockOut(period);
        }}
        period="tarde"
        segment={tarde}
        title="Tarde"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.section,
  },
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  summaryClock: {
    color: colors.textPrimary,
    fontFamily: theme.typography.mono,
    fontSize: 28,
    marginTop: 4,
  },
  summaryDate: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  summaryDivider: {
    backgroundColor: colors.border,
    width: 1,
  },
  summaryTotal: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  employeeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  employeeName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  employeeMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  periodCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  periodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  periodSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  stateBadge: {
    borderRadius: theme.radius.small,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stateBadgeActive: {
    backgroundColor: colors.morningBadgeBg,
  },
  stateBadgeIdle: {
    backgroundColor: colors.freeBadgeBg,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stateTextActive: {
    color: colors.primary,
  },
  stateTextIdle: {
    color: colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 12,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontFamily: theme.typography.mono,
    fontSize: 18,
    fontWeight: '600',
  },
  signatureBox: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    minHeight: 88,
    padding: 14,
  },
  signatureTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  signatureText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.radius.card,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  actionText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.92,
  },
});
