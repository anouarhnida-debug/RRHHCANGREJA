import { StyleSheet, Text, View } from 'react-native';

import { Shift } from '../types/app';
import { colors, theme } from '../theme';
import { formatDayAbbrev, getDateKey, isToday } from '../utils/dateHelpers';
import { ShiftCard } from './ShiftCard';

type WeekViewProps = {
  days: Date[];
  getShiftForDate: (dateKey: string) => Shift | null;
};

export function WeekView({ days, getShiftForDate }: WeekViewProps) {
  return (
    <View style={styles.list}>
      {days.map((day) => {
        const dateKey = getDateKey(day);
        const shift = getShiftForDate(dateKey);
        const activeToday = isToday(dateKey);

        return (
          <View key={dateKey} style={styles.row}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayLabel}>{formatDayAbbrev(day)}</Text>
              <View style={[styles.dayCircle, activeToday && styles.dayCircleActive]}>
                <Text style={[styles.dayNumber, activeToday && styles.dayNumberActive]}>
                  {day.getDate()}
                </Text>
              </View>
            </View>
            <View style={styles.cardWrap}>
              <ShiftCard compact shift={shift} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dayInfo: {
    alignItems: 'center',
    gap: 8,
    width: 54,
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  dayCircle: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dayCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayNumber: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  dayNumberActive: {
    color: colors.onPrimary,
  },
  cardWrap: {
    flex: 1,
  },
});
