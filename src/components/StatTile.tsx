import { StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../theme';

type StatTileProps = {
  label: string;
  value: string;
};

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 98,
    padding: 16,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  label: {
    color: colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 20,
  },
});
